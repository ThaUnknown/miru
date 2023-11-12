import { DOMPARSER, PromiseBatch, binarySearch } from './util.js'
import { alRequest, alSearch } from './anilist.js'
import _anitomyscript from 'anitomyscript'
import { toast } from 'svelte-sonner'
import SectionsManager from './sections.js'
import { page } from '@/App.svelte'
import clipboard from './clipboard.js'

import { search, key } from '@/views/Search.svelte'

import { playAnime } from '../views/RSSView.svelte'

const imageRx = /\.(jpeg|jpg|gif|png|webp)/i

clipboard.on('files', ({ detail }) => {
  for (const file of detail) {
    if (file.type.startsWith('image')) {
      toast.promise(traceAnime(file), {
        description: 'You can also paste an URL to an image.',
        loading: 'Looking up anime for image...',
        success: 'Found anime for image!',
        error: 'Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.'
      })
    }
  }
})

clipboard.on('text', ({ detail }) => {
  for (const { type, text } of detail) {
    let src = null
    if (type === 'text/html') {
      src = DOMPARSER(text, 'text/html').querySelectorAll('img')[0]?.src
    } else if (imageRx.exec(text)) {
      src = text
    }
    if (src) {
      toast.promise(traceAnime(src), {
        description: 'You can also paste an URL to an image.',
        loading: 'Looking up anime for image...',
        success: 'Found anime for image!',
        error: 'Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.'
      })
    }
  }
})

export async function traceAnime (image) { // WAIT lookup logic
  let options
  let url = `https://api.trace.moe/search?cutBorders&url=${image}`
  if (image instanceof Blob) {
    options = {
      method: 'POST',
      body: image,
      headers: { 'Content-type': image.type }
    }
    url = 'https://api.trace.moe/search'
  }
  const res = await fetch(url, options)
  const { result } = await res.json()

  if (result?.length) {
    const ids = result.map(({ anilist }) => anilist)
    search.value = {
      clearNext: true,
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = alRequest({ method: 'SearchIDS', page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) }).then(res => {
          for (const index in res.data?.Page?.media) {
            const media = res.data.Page.media[index]
            const counterpart = result.find(({ anilist }) => anilist === media.id)
            res.data.Page.media[index] = {
              media,
              episode: counterpart.episode,
              similarity: counterpart.similarity,
              episodeData: {
                image: counterpart.image,
                video: counterpart.video
              }
            }
          }
          res.data?.Page?.media.sort((a, b) => b.similarity - a.similarity)
          return res
        })
        return SectionsManager.wrapResponse(res, result.length, 'episode')
      }
    }
    key.value = {}
    page.value = 'search'
  } else {
    throw new Error('Search Failed \n Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.')
  }
}

function constructChapters (results, duration) {
  const chapters = results.map(result => {
    const diff = duration - result.episodeLength
    return {
      start: (result.interval.startTime + diff) * 1000,
      end: (result.interval.endTime + diff) * 1000,
      text: result.skipType.toUpperCase()
    }
  })
  const ed = chapters.find(({ text }) => text === 'ED')
  const recap = chapters.find(({ text }) => text === 'RECAP')
  if (recap) recap.text = 'Recap'

  chapters.sort((a, b) => a - b)
  if ((chapters[0].start | 0) !== 0) {
    chapters.unshift({ start: 0, end: chapters[0].start, text: chapters[0].text === 'OP' ? 'Intro' : 'Episode' })
  }
  if (ed) {
    if ((ed.end | 0) + 5000 - duration * 1000 < 0) {
      chapters.push({ start: ed.end, end: duration * 1000, text: 'Preview' })
    }
  } else if ((chapters[chapters.length - 1].end | 0) + 5000 - duration * 1000 < 0) {
    chapters.push({
      start: chapters[chapters.length - 1].end,
      end: duration * 1000,
      text: 'Episode'
    })
  }

  for (let i = 0, len = chapters.length - 2; i <= len; ++i) {
    const current = chapters[i]
    const next = chapters[i + 1]
    if ((current.end | 0) !== (next.start | 0)) {
      chapters.push({
        start: current.end,
        end: next.start,
        text: 'Episode'
      })
    }
  }

  chapters.sort((a, b) => a.start - b.start)

  return chapters
}

export async function getChaptersAniSkip (file, duration) {
  const resAccurate = await fetch(`https://api.aniskip.com/v2/skip-times/${file.media.media.idMal}/${file.media.episode}/?episodeLength=${duration}&types=op&types=ed&types=recap`)
  const jsonAccurate = await resAccurate.json()

  const resRough = await fetch(`https://api.aniskip.com/v2/skip-times/${file.media.media.idMal}/${file.media.episode}/?episodeLength=0&types=op&types=ed&types=recap`)
  const jsonRough = await resRough.json()

  const map = {}
  for (const result of [...jsonAccurate.results, ...jsonRough.results]) {
    map[result.skipType] ||= result
  }

  const results = Object.values(map)
  if (!results.length) return []
  return constructChapters(results, duration)
}

export function getMediaMaxEp (media, playable) {
  if (playable) {
    return media.nextAiringEpisode?.episode - 1 || media.airingSchedule?.nodes?.[0]?.episode - 1 || media.episodes
  } else {
    return media.episodes || media.nextAiringEpisode?.episode - 1 || media.airingSchedule?.nodes?.[0]?.episode - 1
  }
}

// resolve anime name based on file name and store it
const postfix = {
  1: 'st',
  2: 'nd',
  3: 'rd'
}

async function resolveTitle (parseObject) {
  const name = parseObject.anime_title
  const method = { name, method: 'SearchName', perPage: 10, status: ['RELEASING', 'FINISHED'], sort: 'SEARCH_MATCH' }
  if (parseObject.anime_year) method.year = parseObject.anime_year

  // inefficient but readable

  let media = null
  try {
    // change S2 into Season 2 or 2nd Season
    const match = method.name.match(/ S(\d+)/)
    const oldname = method.name
    if (match) {
      if (Number(match[1]) === 1) { // if this is S1, remove the " S1" or " S01"
        method.name = method.name.replace(/ S(\d+)/, '')
        media = (await alSearch(method)).data.Page.media[0]
      } else {
        method.name = method.name.replace(/ S(\d+)/, ` ${Number(match[1])}${postfix[Number(match[1])] || 'th'} Season`)
        media = (await alSearch(method)).data.Page.media[0]
        if (!media) {
          method.name = oldname.replace(/ S(\d+)/, ` Season ${Number(match[1])}`)
          media = (await alSearch(method)).data.Page.media[0]
        }
      }
    } else {
      media = (await alSearch(method)).data.Page.media[0]
    }

    // remove - :
    if (!media) {
      const match = method.name.match(/[-:]/g)
      if (match) {
        method.name = method.name.replace(/[-:]/g, '')
        media = (await alSearch(method)).data.Page.media[0]
      }
    }
    // remove (TV)
    if (!media) {
      const match = method.name.match(/\(TV\)/)
      if (match) {
        method.name = method.name.replace('(TV)', '')
        media = (await alSearch(method)).data.Page.media[0]
      }
    }
    // check adult
    if (!media) {
      method.isAdult = true
      media = (await alSearch(method)).data.Page.media[0]
    }
  } catch (e) { }

  if (media) relations[getRelationKey(parseObject)] = media
}

// utility method for correcting anitomyscript woes for what's needed
export async function anitomyscript (...args) {
  // @ts-ignore
  const res = await _anitomyscript(...args)

  const parseObjs = Array.isArray(res) ? res : [res]

  for (const obj of parseObjs) {
    const seasonMatch = obj.anime_title.match(/S(\d{2})E(\d{2})/)
    if (seasonMatch) {
      obj.anime_season = seasonMatch[1]
      obj.episode_number = seasonMatch[2]
      obj.anime_title = obj.anime_title.replace(/S(\d{2})E(\d{2})/, '')
    }
    const yearMatch = obj.anime_title.match(/ (19[5-9]\d|20\d{2})/)
    if (yearMatch && Number(yearMatch[1]) <= (new Date().getUTCFullYear() + 1)) {
      obj.anime_year = yearMatch[1]
      obj.anime_title = obj.anime_title.replace(/ (19[5-9]\d|20\d{2})/, '')
    }
    if (Number(obj.anime_season) > 1) obj.anime_title += ' S' + obj.anime_season
  }

  return parseObjs
}

function getRelationKey (obj) {
  let key = obj.anime_title
  if (obj.anime_year) key += obj.anime_year
  return key
}

// TODO: anidb aka true episodes need to be mapped to anilist episodes a bit better
export async function resolveFileMedia (fileName) {
  const parseObjs = await anitomyscript(fileName)

  // batches promises in 10 at a time, because of CF burst protection, which still sometimes gets triggered :/
  const uniq = {}
  for (const obj of parseObjs) {
    const key = getRelationKey(obj)
    if (key in relations) continue
    uniq[key] = obj
  }
  await PromiseBatch(resolveTitle, Object.values(uniq), 10)

  const fileMedias = []
  for (const parseObj of parseObjs) {
    let failed = false
    let episode
    let media = relations[getRelationKey(parseObj)]
    // resolve episode, if movie, dont.
    const maxep = media?.nextAiringEpisode?.episode || media?.episodes
    if ((media?.format !== 'MOVIE' || maxep) && parseObj.episode_number) {
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
            const prequel = !parseObj.anime_season && (findEdge(media, 'PREQUEL')?.node || ((media.format === 'OVA' || media.format === 'ONA') && findEdge(media, 'PARENT')?.node))
            const root = prequel && (await resolveSeason({ media: (await alRequest({ method: 'SearchIDSingle', id: prequel.id })).data.Media, force: true })).media

            // if highest value is bigger than episode count or latest streamed episode +1 for safety, parseint to math.floor a number like 12.5 - specials - in 1 go
            const result = await resolveSeason({ media: root || media, episode: parseObj.episode_number[1], increment: !parseObj.anime_season ? null : true })
            media = result.rootMedia
            const diff = parseObj.episode_number[1] - result.episode
            episode = `${parseObj.episode_number[0] - diff} ~ ${result.episode}`
            failed = result.failed
          } else {
            // cant find ep count or range seems fine
            episode = `${Number(parseObj.episode_number[0])} ~ ${Number(parseObj.episode_number[1])}`
          }
        }
      } else {
        if (maxep && parseInt(parseObj.episode_number) > maxep) {
          // see big comment above
          const prequel = !parseObj.anime_season && (findEdge(media, 'PREQUEL')?.node || ((media.format === 'OVA' || media.format === 'ONA') && findEdge(media, 'PARENT')?.node))
          const root = prequel && (await resolveSeason({ media: (await alRequest({ method: 'SearchIDSingle', id: prequel.id })).data.Media, force: true })).media

          // value bigger than episode count
          const result = await resolveSeason({ media: root || media, episode: parseInt(parseObj.episode_number), increment: !parseObj.anime_season ? null : true })
          media = result.rootMedia
          episode = result.episode
          failed = result.failed
        } else {
          // cant find ep count or episode seems fine
          episode = Number(parseObj.episode_number)
        }
      }
    }
    fileMedias.push({
      episode: episode || parseObj.episode_number,
      parseObject: parseObj,
      media,
      failed
    })
  }
  return fileMedias
}

export function findEdge (media, type, formats = ['TV', 'TV_SHORT'], skip) {
  let res = media.relations.edges.find(edge => {
    if (edge.relationType === type) {
      return formats.includes(edge.node.format)
    }
    return false
  })
  // this is hit-miss
  if (!res && !skip && type === 'SEQUEL') res = findEdge(media, type, formats = ['TV', 'TV_SHORT', 'OVA'], true)
  return res
}

// note: this doesnt cover anime which uses partially relative and partially absolute episode number, BUT IT COULD!
export async function resolveSeason (opts) {
  // media, episode, increment, offset, force
  if (!opts.media || !(opts.episode || opts.force)) throw new Error('No episode or media for season resolve!')

  let { media, episode, increment, offset = 0, rootMedia = opts.media, force } = opts

  const rootHighest = (rootMedia.nextAiringEpisode?.episode || rootMedia.episodes)

  const prequel = !increment && findEdge(media, 'PREQUEL')?.node
  const sequel = !prequel && (increment || increment == null) && findEdge(media, 'SEQUEL')?.node
  const edge = prequel || sequel
  increment = increment ?? !prequel

  if (!edge) {
    const obj = { media, episode: episode - offset, offset, increment, rootMedia, failed: true }
    if (!force) {
      console.warn('Error in parsing!', obj)
      toast('Parsing Error', {
        description: `Failed resolving anime episode!\n${media.title.userPreferred} - ${episode - offset}`
      })
    }
    return obj
  }
  media = (await alRequest({ method: 'SearchIDSingle', id: edge.id })).data.Media

  const highest = media.nextAiringEpisode?.episode || media.episodes

  const diff = episode - (highest + offset)
  offset += increment ? rootHighest : highest
  if (increment) rootMedia = media

  // force marches till end of tree, no need for checks
  if (!force && diff <= rootHighest) {
    episode -= offset
    return { media, episode, offset, increment, rootMedia }
  }

  return resolveSeason({ media, episode, increment, offset, rootMedia, force })
}

const relations = {}

export const formatMap = {
  TV: 'TV Series',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
  undefined: 'N/A',
  null: 'N/A'
}

export const statusColorMap = {
  CURRENT: 'rgb(61,180,242)',
  PLANNING: 'rgb(247,154,99)',
  COMPLETED: 'rgb(123,213,85)',
  PAUSED: 'rgb(250,122,122)',
  REPEATING: '#3baeea',
  DROPPED: 'rgb(232,93,117)'
}

export async function playMedia (media) {
  let ep = 1
  if (media.mediaListEntry) {
    const { status, progress } = media.mediaListEntry
    if (progress) {
      if (status === 'COMPLETED') {
        await setStatus('REPEATING', { episode: 0 }, media)
      } else {
        ep = Math.min(getMediaMaxEp(media, true), progress + 1)
      }
    }
  }
  playAnime(media, ep, true)
  media = null
}

export function setStatus (status, other = {}, media) {
  const variables = {
    method: 'Entry',
    id: media.id,
    status,
    ...other
  }
  return alRequest(variables)
}

const episodeMetadataMap = {}

export async function getEpisodeMetadataForMedia (media) {
  if (episodeMetadataMap[media.id]) return episodeMetadataMap[media.id]
  const res = await fetch('https://api.ani.zip/mappings?anilist_id=' + media.id)
  const { episodes } = await res.json()
  episodeMetadataMap[media.id] = episodes
  return episodes
}

let seadex = []
requestIdleCallback(async () => {
  const res = await fetch('https://sneedex.moe/api/public/nyaa')
  const json = await res.json()
  seadex = json.flatMap(({ nyaaIDs }) => nyaaIDs).sort((a, b) => a - b) // sort for binary search
})

export function mapBestRelease (entries) {
  return entries.map(entry => {
    if (entry.id) {
      if (entry.id === '?') return entry
      if (binarySearch(seadex, entry.id)) entry.best = true
      return entry
    }
    const match = entry.link.match(/\d+/i)
    if (match && binarySearch(seadex, Number(match[0]))) entry.best = true
    return entry
  })
}
