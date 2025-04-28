import anitomyscript from 'anitomyscript'

import type { MediaEdgeFrag } from '$lib/modules/anilist/queries'
import type { TorrentFile } from '../../../../app'
import type { AnitomyResult } from 'anitomyscript'
import type { ResultOf } from 'gql.tada'

import { client, episodes, type Media } from '$lib/modules/anilist'

export const subtitleExtensions = ['srt', 'vtt', 'ass', 'ssa', 'sub', 'txt']
export const subRx = new RegExp(`.(${subtitleExtensions.join('|')})$`, 'i')

export const videoExtensions = ['3g2', '3gp', 'asf', 'avi', 'dv', 'flv', 'gxf', 'm2ts', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'mkv', 'mov', 'mp4', 'mpd', 'mpeg', 'mpg', 'mxf', 'nut', 'ogm', 'ogv', 'swf', 'ts', 'vob', 'webm', 'wmv', 'wtv']
export const videoRx = new RegExp(`.(${videoExtensions.join('|')})$`, 'i')

// freetype supported
export const fontExtensions = ['ttf', 'ttc', 'woff', 'woff2', 'otf', 'cff', 'otc', 'pfa', 'pfb', 'pcf', 'fnt', 'bdf', 'pfr', 'eot']
export const fontRx = new RegExp(`.(${fontExtensions.join('|')})$`, 'i')

export type ResolvedFile = TorrentFile & {metadata: { episode: string | number | undefined, parseObject: AnitomyResult, media: Media, failed: boolean }}

export async function resolveFilesPoorly (promise: Promise<{media: Media, id: string, episode: number, files: TorrentFile[]}| null>) {
  const list = await promise

  if (!list) return

  const videoFiles: TorrentFile[] = []
  const otherFiles: TorrentFile[] = []
  for (const file of list.files) {
    if (videoRx.test(file.name)) {
      videoFiles.push(file)
    } else {
      otherFiles.push(file)
    }
  }

  const resolved = videoFiles.length === 1 ? [{ episode: list.episode, parseObject: (await anitomyscript([videoFiles[0]!.name]))[0]!, media: list.media, failed: false }] : await AnimeResolver.resolveFileAnime(videoFiles.map(file => file.name))

  const resolvedFiles: ResolvedFile[] = videoFiles.map(file => {
    return {
      ...file,
      metadata: resolved.find(({ parseObject }) => file.name.includes(parseObject.file_name))!
    }
  }).filter(file => !TYPE_EXCLUSIONS.includes(file.metadata.parseObject.anime_type?.toUpperCase() ?? ''))

  let targetAnimeFiles = resolvedFiles.filter(file => file.metadata.media.id && file.metadata.media.id === list.media.id)

  if (!targetAnimeFiles.length) {
    const max = highestOccurence(resolvedFiles, file => file.metadata.parseObject.anime_title!).metadata.parseObject.anime_title
    targetAnimeFiles = resolvedFiles.filter(file => file.metadata.parseObject.anime_title === max)
  }

  targetAnimeFiles.sort((a, b) => Number(a.metadata.episode) - Number(b.metadata.episode))
  targetAnimeFiles.sort((a, b) => Number(b.metadata.parseObject.anime_season ?? 1) - Number(a.metadata.parseObject.anime_season ?? 1))

  const targetEpisode = targetAnimeFiles.find(file => file.metadata.episode === list.episode) ?? targetAnimeFiles.find(file => file.metadata.episode === 1) ?? targetAnimeFiles[0]!

  return {
    target: targetEpisode,
    targetAnimeFiles,
    otherFiles,
    resolvedFiles
  }
}

// export function findInCurrent (obj) {
//   const oldNowPlaying = nowPlaying.value

//   if (oldNowPlaying.media?.id === obj.media.id && oldNowPlaying.episode === obj.episode) return false

//   const fileList = files.value

//   const targetFile = fileList.find(file => file.media?.media?.id === obj.media.id &&
//     (file.media?.episode === obj.episode || obj.media.episodes === 1 || (!obj.media.episodes && (obj.episode === 1 || !obj.episode) && (oldNowPlaying.episode === 1 || !oldNowPlaying.episode))) // movie check
//   )
//   if (!targetFile) return false
//   if (oldNowPlaying.media?.id !== obj.media.id) {
//     // mediachange, filelist change
//     media.set({ media: obj.media, episode: obj.episode })
//     handleFiles(fileList)
//   } else {
//     playFile(targetFile)
//   }
//   return true
// }

const TYPE_EXCLUSIONS = ['ED', 'ENDING', 'NCED', 'NCOP', 'OP', 'OPENING', 'PREVIEW', 'PV']

// find best media in batch to play
// currently in progress or unwatched
// tv, movie, ona, ova

// function findPreferredPlaybackMedia (videoFiles) {
//   for (const { media } of videoFiles) {
//     if (media.media?.mediaListEntry?.status === 'CURRENT') return { media: media.media, episode: (media.media.mediaListEntry.progress || 0) + 1 }
//   }

//   for (const { media } of videoFiles) {
//     if (media.media?.mediaListEntry?.status === 'REPEATING') return { media: media.media, episode: (media.media.mediaListEntry.progress || 0) + 1 }
//   }

//   let lowestPlanning
//   for (const { media, episode } of videoFiles) {
//     if (media.media?.mediaListEntry?.status === 'PLANNING' && (!lowestPlanning || episode > lowestPlanning.episode)) lowestPlanning = { media: media.media, episode }
//   }
//   if (lowestPlanning) return lowestPlanning

//   // unwatched
//   for (const format of ['TV', 'MOVIE', 'ONA', 'OVA']) {
//     let lowestUnwatched
//     for (const { media, episode } of videoFiles) {
//       if (media.media?.format === format && !media.media.mediaListEntry && (!lowestUnwatched || episode > lowestUnwatched.episode)) lowestUnwatched = { media: media.media, episode }
//     }
//     if (lowestUnwatched) return lowestUnwatched
//   }

//   // highest occurence if all else fails - unlikely

//   const max = highestOccurence(videoFiles, file => file.media.media?.id).media
//   if (max?.media) {
//     return { media: max.media, episode: (max.media.mediaListEntry?.progress + 1 || 1) }
//   }
// }

// function fileListToDebug (files) {
//   return files.map(({ name, media, url }) => `\n${name} ${media?.parseObject.anime_title} ${media?.parseObject.episode_number} ${media?.media?.title.userPreferred} ${media?.episode}`).join('')
// }

// find element with most occurences in array according to map function
function highestOccurence <T> (arr: T[] = [], mapfn = (a: T) => ''): T {
  return arr.reduce<{sums: Record<string, number>, max?: T}>((acc, el) => {
    const mapped = mapfn(el)
    acc.sums[mapped] = (acc.sums[mapped] ?? 0) + 1
    acc.max = (acc.max !== undefined ? acc.sums[mapfn(acc.max)]! : -1) > acc.sums[mapped] ? acc.max : el
    return acc
  }, { sums: {}, max: undefined }).max as T
}

const postfix: Record<number, string> = {
  1: 'st', 2: 'nd', 3: 'rd'
}

function * chunks <T> (arr: T[], size: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}

const AnimeResolver = new class AnimeResolver {
  // name: media cache from title resolving
  animeNameCache: Record<string, number> = {}

  getCacheKeyForTitle (obj: AnitomyResult): string {
    let key = obj.anime_title
    if (obj.anime_year) key += obj.anime_year
    return key!
  }

  alternativeTitles (title: string): string[] {
    const titles = new Set<string>()

    let modified = title
    // preemptively change S2 into Season 2 or 2nd Season, otherwise this will have accuracy issues
    const seasonMatch = title.match(/ S(\d+)/)
    if (seasonMatch) {
      if (Number(seasonMatch[1]) === 1) { // if this is S1, remove the " S1" or " S01"
        modified = title.replace(/ S(\d+)/, '')
        titles.add(modified)
      } else {
        modified = title.replace(/ S(\d+)/, ` ${Number(seasonMatch[1])}${postfix[Number(seasonMatch[1])] ?? 'th'} Season`)
        titles.add(modified)
        titles.add(title.replace(/ S(\d+)/, ` Season ${Number(seasonMatch[1])}`))
      }
    } else {
      titles.add(title)
    }

    // remove - :
    const specialMatch = modified.match(/[-:]/g)
    if (specialMatch) {
      modified = modified.replace(/[-:]/g, '').replace(/[ ]{2,}/, ' ')
      titles.add(modified)
    }

    // remove (TV)
    const tvMatch = modified.match(/\(TV\)/)
    if (tvMatch) {
      modified = modified.replace('(TV)', '')
      titles.add(modified)
    }

    return [...titles]
  }

  /**
   * resolve anime name based on file name and store it
   */
  async findAnimesByTitle (parseObjects: AnitomyResult[]): Promise<void> {
    if (!parseObjects.length) return
    const titleObjects = parseObjects.map(obj => {
      const key = this.getCacheKeyForTitle(obj)
      const titleObjects: Array<{key: string, title: string, year?: string, isAdult: boolean}> = this.alternativeTitles(obj.anime_title!).map(title => ({ title, year: obj.anime_year, key, isAdult: false }))
      // @ts-expect-error cba fixing this for now, but this is correct
      titleObjects.push({ ...titleObjects.at(-1), isAdult: true })
      return titleObjects
    }).flat()

    for (const chunk of chunks(titleObjects, 60)) {
      // single title has a complexity of 8.1, al limits complexity to 500, so this can be at most 62, undercut it to 60, al pagination is 50, but at most we'll do 30 titles since isAduld duplicates each title
      for (const [key, media] of await client.searchCompound(chunk)) {
        if (media?.id) this.animeNameCache[key] = media.id
      }
    }
  }

  async getAnimeById (id: number) {
    return (await client.single(id)).data?.Media as Media
  }

  // TODO: anidb aka true episodes need to be mapped to anilist episodes a bit better, shit like mushoku offsets caused by episode 0's in between seasons
  async resolveFileAnime (fileName: string[]) {
    if (!fileName.length) return []
    const parseObjs = await anitomyscript(fileName)

    const TYPE_EXCLUSIONS = ['ED', 'ENDING', 'NCED', 'NCOP', 'OP', 'OPENING', 'PREVIEW', 'PV']

    const uniq: Record<string, AnitomyResult> = {}
    for (const obj of parseObjs) {
      const key = this.getCacheKeyForTitle(obj)
      if (key in this.animeNameCache) continue // skip already resolved
      if (obj.anime_type && TYPE_EXCLUSIONS.includes(obj.anime_type.toUpperCase())) continue // skip non-episode media
      uniq[key] = obj
    }
    await this.findAnimesByTitle(Object.values(uniq))

    const fileAnimes = []
    for (const parseObj of parseObjs) {
      let failed = false
      let episode
      const id = this.animeNameCache[this.getCacheKeyForTitle(parseObj)]
      if (!id) continue
      let media = await this.getAnimeById(id)
      // resolve episode, if movie, dont.
      const maxep = episodes(media)
      if ((media.format !== 'MOVIE' || maxep) && parseObj.episode_number) {
        if (Array.isArray(parseObj.episode_number)) {
          // is an episode range
          if (parseInt(parseObj.episode_number[0]) === 1) {
            // if it starts with #1 and overflows then it includes more than 1 season in a batch, cant fix this cleanly, name is parsed per file basis so this shouldnt be an issue
            episode = `${parseObj.episode_number[0]} ~ ${parseObj.episode_number[1]}`
          } else {
            if (maxep && parseInt(parseObj.episode_number[1]) > maxep) {
              // get root media to start at S1, instead of S2 or some OVA due to parsing errors
              // this is most likely safe, if it was relative episodes then it would likely use an accurate title for the season
              // if they didnt use an accurate title then its likely an absolute numbering scheme
              // parent check is to break out of those incorrectly resolved OVA's
              // if we used anime season to resolve anime name, then there's no need to march into prequel!
              const prequel = !parseObj.anime_season && (this.findEdge(media, 'PREQUEL').node ?? ((media.format === 'OVA' || media.format === 'ONA') && this.findEdge(media, 'PARENT').node))
              // debug(`Prequel ${prequel?.id}:${prequel?.title.userPreferred}`)
              const root = prequel && (await this.resolveSeason({ media: await this.getAnimeById(prequel.id), force: true })).media
              // debug(`Root ${root?.id}:${root?.title.userPreferred}`)

              // if highest value is bigger than episode count or latest streamed episode +1 for safety, parseint to math.floor a number like 12.5 - specials - in 1 go
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              const result = await this.resolveSeason({ media: root || media, episode: parseObj.episode_number[1], increment: !parseObj.anime_season ? null : true })
              // debug(`Found rootMedia for ${parseObj.anime_title}: ${result.rootMedia.id}:${result.rootMedia.title.userPreferred} from ${media.id}:${media.title.userPreferred}`)
              media = result.rootMedia
              const diff = parseObj.episode_number[1] - result.episode
              episode = `${parseObj.episode_number[0] - diff} ~ ${result.episode}`
              failed = !!result.failed
              // if (failed) debug(`Failed to resolve ${parseObj.anime_title} ${parseObj.episode_number} ${media.title.userPreferred}`)
            } else {
              // cant find ep count or range seems fine
              episode = `${Number(parseObj.episode_number[0])} ~ ${Number(parseObj.episode_number[1])}`
            }
          }
        } else {
          if (maxep && parseInt(parseObj.episode_number) > maxep) {
            // see big comment above
            const prequel = !parseObj.anime_season && (this.findEdge(media, 'PREQUEL').node ?? ((media.format === 'OVA' || media.format === 'ONA') && this.findEdge(media, 'PARENT').node))
            // debug(`Prequel ${prequel?.id}:${prequel?.title.userPreferred}`)
            const root = prequel && (await this.resolveSeason({ media: await this.getAnimeById(prequel.id), force: true })).media
            // debug(`Root ${root?.id}:${root?.title.userPreferred}`)

            // value bigger than episode count
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const result = await this.resolveSeason({ media: root || media, episode: parseInt(parseObj.episode_number), increment: !parseObj.anime_season ? null : true })
            // debug(`Found rootMedia for ${parseObj.anime_title}: ${result.rootMedia.id}:${result.rootMedia.title.userPreferred} from ${media.id}:${media.title.userPreferred}`)
            media = result.rootMedia
            episode = result.episode
            failed = !!result.failed
            // if (failed) debug(`Failed to resolve ${parseObj.anime_title} ${parseObj.episode_number} ${media.title.userPreferred}`)
          } else {
            // cant find ep count or episode seems fine
            episode = Number(parseObj.episode_number)
          }
        }
      }
      // debug(`Resolved ${parseObj.anime_title} ${parseObj.episode_number} ${episode} ${media.id}:${media.title.userPreferred}`)
      fileAnimes.push({
        episode: episode ?? parseObj.episode_number,
        parseObject: parseObj,
        media,
        failed
      })
    }
    return fileAnimes
  }

  findEdge (media: Media, type: string, formats = ['TV', 'TV_SHORT'], skip?: boolean): ResultOf<typeof MediaEdgeFrag> {
    let res = media.relations?.edges?.find(edge => {
      if (edge?.relationType === type) {
        return formats.includes(edge.node?.format ?? '')
      }
      return false
    })
    // this is hit-miss
    if (!res && !skip && type === 'SEQUEL') res = this.findEdge(media, type, formats = ['TV', 'TV_SHORT', 'OVA'], true)
    return res as ResultOf<typeof MediaEdgeFrag>
  }

  // note: this doesnt cover anime which uses partially relative and partially absolute episode number, BUT IT COULD!
  async resolveSeason (opts: {media?: Media, episode?: number, increment?: boolean | null, offset?: number, rootMedia?: Media, force?: boolean}): Promise<{ media: Media, episode: number, offset: number, increment: boolean, rootMedia: Media, failed?: boolean }> {
    // media, episode, increment, offset, force
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!opts.media || !(opts.episode || opts.force)) throw new Error('No episode or media for season resolve!')

    let { media, episode = 1, increment, offset = 0, rootMedia = opts.media, force } = opts

    const rootHighest = episodes(rootMedia) ?? 1

    const prequel = !increment && this.findEdge(media, 'PREQUEL').node
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const sequel = !prequel && (increment || increment == null) && this.findEdge(media, 'SEQUEL').node
    const edge = prequel ?? sequel
    increment = increment ?? !prequel

    if (!edge) {
      const obj = { media, episode: episode - offset, offset, increment, rootMedia, failed: true }
      return obj
    }
    media = await this.getAnimeById(edge.id)

    const highest = episodes(media) ?? 1

    const diff = episode - (highest + offset)
    offset += increment ? rootHighest : highest
    if (increment) rootMedia = media

    // force marches till end of tree, no need for checks
    if (!force && diff <= rootHighest) {
      episode -= offset
      return { media, episode, offset, increment, rootMedia }
    }

    return await this.resolveSeason({ media, episode, increment, offset, rootMedia, force })
  }
}()
