import { settings } from '@/modules/settings.js'
import { exclusions } from '../rss.js'
import { sleep } from '../util.js'
import { anilistClient } from '../anilist.js'
import { anitomyscript } from '../anime.js'
import { client } from '@/modules/torrent.js'
import { extensionsWorker } from '@/views/Settings/TorrentSettings.svelte'
import { toast } from 'svelte-sonner'

/** @typedef {import('@thaunknown/ani-resourced/sources/types.d.ts').Options} Options */
/** @typedef {import('@thaunknown/ani-resourced/sources/types.d.ts').Result} Result */

/**
 * @param {{media: import('../al.js').Media, episode?: number, batch: boolean, movie: boolean, resolution: string}} opts
 * @returns {Promise<(Result & { parseObject: import('anitomyscript').AnitomyResult })[]>}
 * **/
export default async function getResultsFromExtensions ({ media, episode, batch, movie, resolution }) {
  const worker = await /** @type {ReturnType<import('@/modules/extensions/worker.js').loadExtensions>} */(extensionsWorker)
  if (!(await worker.metadata)?.length) throw new Error('No torrent sources configured. Add extensions in settings.')

  const aniDBMeta = await ALToAniDB(media)
  const anidbAid = aniDBMeta?.mappings?.anidb_id
  const anidbEid = anidbAid && (await ALtoAniDBEpisode({ media, episode }, aniDBMeta))?.anidbEid

  /** @type {Options} */
  const options = {
    anilistId: media.id,
    episodeCount: media.episodes,
    episode,
    anidbAid,
    anidbEid,
    titles: createTitles(media),
    resolution,
    exclusions
  }

  const { results, errors } = await worker.query(options, { movie, batch }, settings.value.sources)

  for (const error of errors) {
    console.error(error)
    toast.error('Source Fetch Failed!', {
      description: error
    })
  }

  const deduped = dedupe(results)

  if (!deduped?.length) throw new Error('No results found. Try specifying a torrent manually.')

  const parseObjects = await anitomyscript(deduped.map(({ title }) => title))
  // @ts-ignore
  for (const i in parseObjects) deduped[i].parseObject = parseObjects[i]

  return updatePeerCounts(deduped)
}

async function updatePeerCounts (entries) {
  const id = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER).toString()

  const updated = await Promise.race([
    new Promise(resolve => {
      function check ({ detail }) {
        if (detail.id !== id) return
        client.removeListener('scrape', check)
        resolve(detail.result)
      }
      client.on('scrape', check)
      client.send('scrape', { id, infoHashes: entries.map(({ hash }) => hash) })
    }),
    sleep(15000)
  ])

  for (const { hash, complete, downloaded, incomplete } of updated || []) {
    const found = entries.find(mapped => mapped.hash === hash)
    found.downloads = downloaded
    found.leechers = incomplete
    found.seeders = complete
  }
  return entries
}

/** @param {import('../al.js').Media} media */
async function ALToAniDB (media) {
  const mappingsResponse = await fetch('https://api.ani.zip/mappings?anilist_id=' + media.id)
  const json = await mappingsResponse.json()
  if (json.mappings?.anidb_id) return json

  const parentID = getParentForSpecial(media)
  if (!parentID) return

  const parentResponse = await fetch('https://api.ani.zip/mappings?anilist_id=' + parentID)
  return parentResponse.json()
}

/** @param {import('../al.js').Media} media */
function getParentForSpecial (media) {
  if (!['SPECIAL', 'OVA', 'ONA'].some(format => media.format === format)) return false
  const animeRelations = media.relations.edges.filter(({ node }) => node.type === 'ANIME')

  return getRelation(animeRelations, 'PARENT') || getRelation(animeRelations, 'PREQUEL') || getRelation(animeRelations, 'SEQUEL')
}

function getRelation (list, type) {
  return list.find(({ relationType }) => relationType === type)?.node.id
}

// TODO: https://anilist.co/anime/13055/
/**
  * @param {{media: import('../al.js').Media, episode: number}} param0
  * @param {{episodes: any, episodeCount: number, specialCount: number}} param1
  * */
async function ALtoAniDBEpisode ({ media, episode }, { episodes, episodeCount, specialCount }) {
  if (!episode || !Object.values(episodes).length) return
  // if media has no specials or their episode counts don't match
  if (!specialCount || (media.episodes && media.episodes === episodeCount && episodes[Number(episode)])) return episodes[Number(episode)]
  const res = await anilistClient.episodeDate({ id: media.id, ep: episode })
  // TODO: if media only has one episode, and airdate doesn't exist use start/release/end dates
  const alDate = new Date((res.data.AiringSchedule?.airingAt || 0) * 1000)

  return episodeByAirDate(alDate, episodes, episode)
}

/**
 * @param {Date} alDate
 * @param {any} episodes
 * @param {number} episode
 **/
export function episodeByAirDate (alDate, episodes, episode) {
  if (!+alDate) return episodes[Number(episode)] || episodes[1] // what the fuck, are you braindead anilist?, the source episode number to play is from an array created from AL ep count, so how come it's missing?
  // 1 is key for episod 1, not index

  // find closest episodes by air date, multiple episodes can have the same air date distance
  // ineffcient but reliable
  const closestEpisodes = Object.values(episodes).reduce((prev, curr) => {
    if (!prev[0]) return [curr]
    const prevDate = Math.abs(+new Date(prev[0]?.airdate) - +alDate)
    const currDate = Math.abs(+new Date(curr.airdate) - +alDate)
    if (prevDate === currDate) {
      prev.push(curr)
      return prev
    }
    if (currDate < prevDate) return [curr]
    return prev
  }, [])

  return closestEpisodes.reduce((prev, curr) => {
    return Math.abs(curr.episodeNumber - episode) < Math.abs(prev.episodeNumber - episode) ? curr : prev
  })
}

/** @param {import('../al.js').Media} media */
function createTitles (media) {
  // group and de-duplicate
  const grouped = [...new Set(
    Object.values(media.title)
      .concat(media.synonyms)
      .filter(name => name != null && name.length > 3)
  )]
  const titles = []
  /** @param {string} title */
  const appendTitle = title => {
    // replace & with encoded
    // title = title.replace(/&/g, '%26').replace(/\?/g, '%3F').replace(/#/g, '%23')
    titles.push(title)

    // replace Season 2 with S2, else replace 2nd Season with S2, but keep the original title
    const match1 = title.match(/(\d)(?:nd|rd|th) Season/i)
    const match2 = title.match(/Season (\d)/i)

    if (match2) {
      titles.push(title.replace(/Season \d/i, `S${match2[1]}`))
    } else if (match1) {
      titles.push(title.replace(/(\d)(?:nd|rd|th) Season/i, `S${match1[1]}`))
    }
  }
  for (const t of grouped) {
    appendTitle(t)
    if (t.includes('-')) appendTitle(t.replaceAll('-', ''))
  }
  return titles
}

/** @param {Result[]} entries */
function dedupe (entries) {
  /** @type {Record<string, Result>} */
  const deduped = {}
  for (const entry of entries) {
    if (deduped[entry.hash]) {
      const dupe = deduped[entry.hash]
      dupe.title ??= entry.title
      dupe.link ??= entry.link
      dupe.id ||= entry.id
      dupe.seeders ||= entry.seeders >= 30000 ? 0 : entry.seeders
      dupe.leechers ||= entry.leechers >= 30000 ? 0 : entry.leechers
      dupe.downloads ||= entry.downloads
      dupe.size ||= entry.size
      dupe.verified ||= entry.verified
      dupe.date ||= entry.date
      dupe.type ??= entry.type
    } else {
      deduped[entry.hash] = entry
    }
  }

  return Object.values(deduped)
}
