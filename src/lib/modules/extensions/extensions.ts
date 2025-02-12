import { dedupeAiring, episodeByAirDate, isMovie, type Media, type MediaEdge } from '../anilist'
import type { TorrentResult } from 'hayase-extensions'
import { storage } from './storage'
import { settings } from '../settings'
import { get } from 'svelte/store'
import anitomyscript, { type AnitomyResult } from 'anitomyscript'
import type { EpisodesResponse } from '../anizip/types'
import { options as extensionOptions, saved } from '$lib/modules/extensions'

const exclusions = ['DTS', 'TrueHD', '[EMBER]']
const isDev = location.hostname === 'localhost'

const video = document.createElement('video')

if (!isDev && !video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"')) {
  exclusions.push('HEVC', 'x265', 'H.265')
}
if (!isDev && !video.canPlayType('audio/mp4; codecs="ac-3"')) {
  exclusions.push('AC3', 'AC-3')
}
if (!('audioTracks' in HTMLVideoElement.prototype)) {
  exclusions.push('DUAL')
}
video.remove()

const debug = console.log

export const extensions = new class Extensions {
  // this is for the most part useless, but some extensions might need it
  createTitles (media: Media) {
    // group and de-duplicate
    const grouped = [...new Set(
      Object.values(media.title ?? {})
        .concat(media.synonyms)
        .filter(name => name != null && name.length > 3) as string[]
    )]
    const titles: string[] = []
    const appendTitle = (title: string) => {
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

  async getResultsFromExtensions ({ media, episode, batch, resolution }: { media: Media, episode?: number, batch: boolean, resolution: '' | '1080' | '720' | '2160' | '540' | '480' }) {
    await storage.modules
    const workers = storage.workers
    if (!Object.values(workers).length) {
      debug('No torrent sources configured')
      throw new Error('No torrent sources configured. Add extensions in settings.')
    }

    const movie = isMovie(media)

    debug(`Fetching sources for ${media.id}:${media.title?.userPreferred} ${episode} ${batch} ${movie} ${resolution}`)

    const aniDBMeta = await this.ALToAniDB(media)
    const anidbAid = aniDBMeta?.mappings?.anidb_id
    const anidbEid = anidbAid && (await this.ALtoAniDBEpisode({ media, episode }, aniDBMeta))?.anidbEid
    debug(`AniDB Mapping: ${anidbAid} ${anidbEid}`)

    const options = {
      anilistId: media.id,
      episodeCount: media.episodes ?? undefined,
      episode,
      anidbAid,
      anidbEid,
      titles: this.createTitles(media),
      resolution,
      exclusions: get(settings).enableExternal ? [] : exclusions
    }

    const results: Array<TorrentResult & { parseObject: AnitomyResult, extension: string[] }> = []
    const errors: Array<{ error: Error, extension: string }> = []

    const extopts = get(extensionOptions)
    const configs = get(saved)

    for (const [id, worker] of Object.entries(workers)) {
      if (!extopts[id]!.enabled) continue
      if (configs[id]!.type !== 'torrent') continue
      try {
        const promises: Array<Promise<TorrentResult[]>> = []
        promises.push(worker.single(options))
        if (movie) promises.push(worker.movie(options))
        if (batch) promises.push(worker.batch(options))

        for (const result of await Promise.allSettled(promises)) {
          if (result.status === 'fulfilled') {
            results.push(...result.value.map(v => ({ ...v, extension: [id], parseObject: {} as unknown as AnitomyResult })))
          } else {
            console.error(result.reason, id)
            errors.push({ error: result.reason as unknown as Error, extension: id })
          }
        }
      } catch (error) {
        errors.push({ error: error as Error, extension: id })
      }
    }

    debug(`Found ${results.length} results`)

    const deduped = this.dedupe(results)

    if (!deduped.length) throw new Error('No results found. Try specifying a torrent manually.')

    const parseObjects = await anitomyscript(deduped.map(({ title }) => title))
    parseObjects.forEach((parseObject, index) => {
      deduped[index].parseObject = parseObject
    })

    console.log({ deduped })

    return { results: deduped, errors }
    // return await this.updatePeerCounts(deduped) // TODO: re-enable
  }

  async updatePeerCounts (entries: TorrentResult[]) {
    // const id = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER).toString()
    debug(`Updating peer counts for ${entries.length} entries`)

    const updated = await new Promise<[] | null>(resolve => {
      resolve([])
      // function check ({ detail }) {
      //   if (detail.id !== id) return
      //   debug('Got scrape response')
      //   client.removeListener('scrape', check)
      //   resolve(detail.result)
      // }
      // client.on('scrape', check)
      // client.send('scrape', { id, infoHashes: entries.map(({ hash }) => hash) })
    })
    debug('Scrape complete')

    for (const { hash, complete, downloaded, incomplete } of updated ?? []) {
      const found = entries.find(mapped => mapped.hash === hash)
      if (!found) continue
      found.downloads = downloaded
      found.leechers = incomplete
      found.seeders = complete
    }

    debug(`Found ${(updated ?? []).length} entries: ${JSON.stringify(updated)}`)
    return entries
  }

  async ALToAniDB (media: Media) {
    const mappingsResponse = await fetch('https://api.ani.zip/v1/episodes?anilist_id=' + media.id)
    const json = await mappingsResponse.json() as EpisodesResponse
    if (json.mappings?.anidb_id) return json

    const parentID = this.getParentForSpecial(media)
    if (!parentID) return

    const parentResponse = await fetch('https://api.ani.zip/v1/episodes?anilist_id=' + parentID)
    return await parentResponse.json() as EpisodesResponse
  }

  getParentForSpecial (media: Media) {
    if (!['SPECIAL', 'OVA', 'ONA'].some(format => media.format === format)) return false
    const animeRelations = (media.relations?.edges?.filter(edge => edge?.node?.type === 'ANIME') ?? []) as MediaEdge[]

    return this.getRelation(animeRelations, 'PARENT') ?? this.getRelation(animeRelations, 'PREQUEL') ?? this.getRelation(animeRelations, 'SEQUEL')
  }

  getRelation (list: MediaEdge[], type: MediaEdge['relationType']) {
    return list.find(edge => edge.relationType === type)?.node?.id
  }

  // TODO: https://anilist.co/anime/13055/
  async ALtoAniDBEpisode ({ media, episode }: {media: Media, episode?: number}, { episodes, episodeCount, specialCount }: EpisodesResponse) {
    debug(`Fetching AniDB episode for ${media.id}:${media.title?.userPreferred} ${episode}`)
    if (!episode || !Object.values(episodes!).length) return
    // if media has no specials or their episode counts don't match
    if (!specialCount || (media.episodes && media.episodes === episodeCount && (Number(episode) in episodes!))) {
      debug('No specials found, or episode count matches between AL and AniDB')
      return episodes![Number(episode)]
    }
    debug(`Episode count mismatch between AL and AniDB for ${media.id}:${media.title?.userPreferred}`)
    const date = dedupeAiring(media).find(({ e }) => e === episode)?.a
    // TODO: if media only has one episode, and airdate doesn't exist use start/release/end dates
    const alDate = date ? new Date(date * 1000) : undefined
    debug(`AL Airdate: ${alDate?.toString()}`)

    return episodeByAirDate(alDate, episodes!, episode)
  }

  dedupe <T extends TorrentResult & { extension: string[] }> (entries: T[]): T[] {
    const deduped: Record<string, T> = {}
    for (const entry of entries) {
      if (entry.hash in deduped) {
        const dupe = deduped[entry.hash]
        dupe.extension.push(...entry.extension)
        dupe.accuracy = (['high', 'medium', 'low'].indexOf(entry.accuracy) <= ['high', 'medium', 'low'].indexOf(dupe.accuracy)
          ? entry.accuracy
          : dupe.accuracy)
        dupe.title = entry.title.length > dupe.title.length ? entry.title : dupe.title
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        dupe.link ??= entry.link
        dupe.id ??= entry.id
        dupe.seeders ||= entry.seeders >= 30000 ? 0 : entry.seeders
        dupe.leechers ||= entry.leechers >= 30000 ? 0 : entry.leechers
        dupe.downloads ||= entry.downloads
        dupe.size ||= entry.size
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        dupe.date ||= entry.date
        dupe.type ??= entry.type === 'best' ? 'best' : entry.type === 'alt' ? 'alt' : entry.type
      } else {
        deduped[entry.hash] = entry
      }
    }

    return Object.values(deduped)
  }
}()
