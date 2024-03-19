import { DOMPARSER } from './util.js'
import { anilistClient } from './anilist.js'
import _anitomyscript from 'anitomyscript'
import { toast } from 'svelte-sonner'
import SectionsManager from './sections.js'
import { page } from '@/App.svelte'
import clipboard from './clipboard.js'

import { search, key } from '@/views/Search.svelte'

import { playAnime } from '@/views/TorrentSearch/TorrentModal.svelte'

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
        const res = anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) }).then(res => {
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

// utility method for correcting anitomyscript woes for what's needed
export async function anitomyscript (...args) {
  // @ts-ignore
  const res = await _anitomyscript(...args)

  const parseObjs = Array.isArray(res) ? res : [res]

  for (const obj of parseObjs) {
    obj.anime_title ??= ''
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
    id: media.id,
    status,
    ...other
  }
  return anilistClient.entry(variables)
}

const episodeMetadataMap = {}

export async function getEpisodeMetadataForMedia (media) {
  if (episodeMetadataMap[media.id]) return episodeMetadataMap[media.id]
  const res = await fetch('https://api.ani.zip/mappings?anilist_id=' + media.id)
  const { episodes } = await res.json()
  episodeMetadataMap[media.id] = episodes
  return episodes
}
