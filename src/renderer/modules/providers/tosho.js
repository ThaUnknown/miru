import { mapBestRelease } from '../anime.js'
import { fastPrettyBytes } from '../util.js'
import { exclusions } from '../rss.js'
import { set } from '@/views/Settings.svelte'
import { alRequest } from '../anilist.js'

const toshoURL = decodeURIComponent(atob('aHR0cHM6Ly9mZWVkLmFuaW1ldG9zaG8ub3JnL2pzb24/'))

export default async function tosho ({ media, episode }) {
  const json = await getAniDBFromAL(media)

  if (!json) return []

  const aniDBEpisode = await getAniDBEpisodeFromAL({ media, episode }, json)

  let entries = await getToshoEntries(media, aniDBEpisode, json, set.rssQuality)

  if (!entries.length) entries = await getToshoEntries(media, aniDBEpisode, json)

  return mapBestRelease(mapTosho2dDeDupedEntry(entries))
}

window.tosho = tosho

async function getAniDBFromAL (media) {
  const mappingsResponse = await fetch('https://api.ani.zip/mappings?anilist_id=' + media.id)
  const json = await mappingsResponse.json()
  if (json.mappings.anidb_id) return json

  const parentID = getParentForSpecial(media)

  if (!parentID) return

  const parentResponse = await fetch('https://api.ani.zip/mappings?anilist_id=' + parentID)
  return parentResponse.json()
}

function getParentForSpecial (media) {
  if (!['SPECIAL', 'OVA', 'ONA'].some(format => media.format === format)) return false
  const animeRelations = media.relations.edges.filter(({ node }) => node.type === 'ANIME')

  return getRelation(animeRelations, 'PARENT') || getRelation(animeRelations, 'PREQUEL') || getRelation(animeRelations, 'SEQUEL')
}

function getRelation (list, type) {
  return list.find(({ relationType }) => relationType === type)?.node.id
}

// TODO: https://anilist.co/anime/13055/
async function getAniDBEpisodeFromAL ({ media, episode }, { episodes, episodeCount }) {
  if (!episode || !Object.values(episodes).length) return
  if (media.episodes && media.episodes === episodeCount && episodes[Number(episode)]) return episodes[Number(episode)]
  const res = await alRequest({ method: 'EpisodeDate', id: media.id, ep: episode })
  const alDate = new Date((res.data.AiringSchedule?.airingAt || 0) * 1000)

  if (!+alDate) return episodes[Number(episode)] || episodes[1] // what the fuck, are you braindead anilist?, the source episode number to play is from an array created from AL ep count, so how come it's missing?

  // find closest episode by air date
  // ineffcient but reliable
  return Object.values(episodes).reduce((prev, curr) => {
    return Math.abs(new Date(curr.airdate) - alDate) < Math.abs(new Date(prev.airdate) - alDate) ? curr : prev
  })
}

async function getToshoEntries (media, episode, { mappings }, quality) {
  const promises = []

  if (episode) {
    const { anidbEid } = episode

    promises.push(fetchSingleEpisode({ id: anidbEid, quality }))
  } else {
    // TODO: look for episodes via.... title?
  }

  // look for batches and movies
  if (mappings.anidb_id && media.status === 'FINISHED' && (isMovie(media) || media.episodes !== 1)) {
    promises.push(fetchBatches({ media, id: mappings.anidb_id, quality }))
  }

  return (await Promise.all(promises)).flat()
}

function isMovie (media) {
  if (media.format === 'MOVIE') return true
  if ([...Object.values(media.title), ...media.synonyms].some(title => title.toLowerCase().includes('movie'))) return true
  if (!getParentForSpecial(media)) return true
  return media.duration > 80 && media.episodes === 1
}

function buildQuery (quality) {
  let query = `&qx=1&q=!("${exclusions.join('"|"')}")`
  if (quality) query += ` "'${quality}"`

  return query
}

async function fetchBatches ({ media, id, quality }) {
  // TODO: improve split-cour show batch lookup [tosho assigns aid's incorrectly]
  const queryString = buildQuery(quality)
  const torrents = await fetch(toshoURL + 'order=size-d&aid=' + id + queryString)

  // safe if AL includes EP 0 or doesn't
  return (await torrents.json()).filter(entry => entry.num_files >= media.episodes)
}

async function fetchSingleEpisode ({ id, quality }) {
  const queryString = buildQuery(quality)
  const torrents = await fetch(toshoURL + 'eid=' + id + queryString)

  return torrents.json()
}

function mapTosho2dDeDupedEntry (entries) {
  const deduped = {}
  for (const entry of entries) {
    if (deduped[entry.info_hash]) {
      const dupe = deduped[entry.info_hash]
      dupe.title ??= entry.title || entry.torrent_name
      dupe.id ||= entry.nyaa_id
      dupe.seeders ||= entry.seeders >= 100000 ? entry.leechers * 3 : entry.seeders
      dupe.leechers ||= entry.leechers ?? 0
      dupe.downloads ||= entry.torrent_downloaded_count
      dupe.size ||= entry.total_size && fastPrettyBytes(entry.total_size)
      dupe.date ||= entry.timestamp && new Date(entry.timestamp * 1000)
    } else {
      deduped[entry.info_hash] = {
        title: entry.title || entry.torrent_name,
        link: entry.magnet_uri,
        id: entry.nyaa_id,
        seeders: entry.seeders >= 100000 ? entry.leechers * 3 : entry.seeders, // this is a REALLY bad assumption to make, but its a decent guess
        leechers: entry.leechers,
        downloads: entry.torrent_downloaded_count,
        size: entry.total_size && fastPrettyBytes(entry.total_size),
        date: entry.timestamp && new Date(entry.timestamp * 1000)
      }
    }
  }

  return Object.values(deduped)
}
