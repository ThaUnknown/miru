import { get } from 'svelte/store'

import type { Media } from '$lib/modules/anilist'
import type { Track } from '../../../../app'
import type Subtitles from './subtitles'
import type { ResolvedFile } from './resolver'
import type VideoDeband from 'video-deband'

import { settings } from '$lib/modules/settings'

export interface Chapter {
  start: number
  end: number
  text: string
}

export interface SessionMetadata {
  title: string
  description: string
  image: string
}

export interface MediaInfo {
  file: ResolvedFile
  media: Media
  episode: number
  session: SessionMetadata
}

export function getChapterTitle (time: number, chapters: Chapter[]): string | false {
  for (const { start, end, text } of chapters) {
    if (end > time) return start <= time && text
  }
  return false
}

interface Interval {
  startTime: number
  endTime: number
}

interface Result {
  interval: Interval
  skipType: string
  skipId: string
  episodeLength: number
}

interface AniSkip {
  found: boolean
  results: Result[]
  message: string
  statusCode: number
}

export async function getChaptersAniSkip (idMal: number, episode: number, duration: number): Promise<Chapter[]> {
  const resAccurate = await fetch(`https://api.aniskip.com/v2/skip-times/${idMal}/${episode}/?episodeLength=${duration}&types=op&types=ed&types=recap`)
  const jsonAccurate = await resAccurate.json() as AniSkip

  const resRough = await fetch(`https://api.aniskip.com/v2/skip-times/${idMal}/${episode}/?episodeLength=0&types=op&types=ed&types=recap`)
  const jsonRough = await resRough.json() as AniSkip

  const map: Record<string, Result> = {}
  for (const result of [...jsonAccurate.results, ...jsonRough.results]) {
    if (!(result.skipType in map)) map[result.skipType] = result
  }

  const results = Object.values(map)
  if (!results.length) return []

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

  chapters.sort((a, b) => a.start - b.start)
  if ((chapters[0]!.start | 0) !== 0) {
    chapters.unshift({ start: 0, end: chapters[0]!.start, text: chapters[0]!.text === 'OP' ? 'Intro' : 'Episode' })
  }
  if (ed) {
    if ((ed.end | 0) + 5000 - duration * 1000 < 0) {
      chapters.push({ start: ed.end, end: duration * 1000, text: 'Preview' })
    }
  } else if ((chapters[chapters.length - 1]!.end | 0) + 5000 - duration * 1000 < 0) {
    chapters.push({
      start: chapters[chapters.length - 1]!.end,
      end: duration * 1000,
      text: 'Episode'
    })
  }

  for (let i = 0, len = chapters.length - 2; i <= len; ++i) {
    const current = chapters[i]
    const next = chapters[i + 1]
    if ((current!.end | 0) !== (next!.start | 0)) {
      chapters.push({
        start: current!.end,
        end: next!.start,
        text: 'Episode'
      })
    }
  }

  chapters.sort((a, b) => a.start - b.start)

  return chapters
}

export function sanitizeChapters (chapters: Chapter[], length: number): Chapter[] {
  if (length <= 0) {
    return []
  }

  const sanitizedChapters: Chapter[] = []
  let currentTime = 0

  const sortedChapters = chapters.map(chapter => {
    const end = Math.min(length, chapter.end)
    const start = Math.min(Math.max(0, chapter.start), end)
    return { start, end, text: chapter.text }
  }).sort((a, b) => a.start - b.start)

  for (const chapter of sortedChapters) {
    // Handle Missing Segment Before Chapter
    if (chapter.start > currentTime) {
      sanitizedChapters.push({
        start: currentTime,
        end: chapter.start,
        text: sanitizedChapters.length === 0 ? '' : 'Episode'
      })
    }

    sanitizedChapters.push(chapter)
    currentTime = chapter.end
  }

  // Handle Missing Segment After Last Chapter
  if (currentTime < length) {
    sanitizedChapters.push({
      start: currentTime,
      end: length,
      text: ''
    })
  }

  return sanitizedChapters
}

export function normalizeTracks (_tracks: Track[]) {
  const tracks = [..._tracks]
  const hasEng = tracks.some(track => track.language === 'eng' || track.language === 'en')
  const lang = tracks.map(({ id, language, label, enabled, selected }) => {
    return {
      enabled: enabled ?? selected,
      id,
      language: language || !hasEng ? 'eng' : 'unk',
      label: label || 'Default'
    }
  })
  return lang.reduce<Record<string, typeof lang>>((acc, track) => {
    if (!acc[track.language]) acc[track.language] = []
    acc[track.language]!.push(track)
    return acc
  }, {})
}

export function normalizeSubs (_tracks?: Record<number | string, { meta: { language?: string, type: string, header: string, number: string, name?: string } }>) {
  if (!_tracks) return {}
  const hasEng = Object.values(_tracks).some(({ meta }) => meta.language === 'eng' || meta.language === 'en')
  const lang = Object.values(_tracks).map(({ meta }) => ({
    language: meta.language ?? !hasEng ? 'eng' : 'unk',
    number: meta.number,
    name: meta.name ?? meta.language ?? !hasEng ? 'eng' : 'unk'
  }))
  return lang.reduce<Record<string, typeof lang>>((acc, track) => {
    if (!acc[track.language]) acc[track.language] = []
    acc[track.language]!.push(track)
    return acc
  }, {})
}

export function autoPiP (video: HTMLVideoElement, pipfn: (enable: boolean) => void) {
  const signal = new AbortController()

  window.addEventListener('visibilitychange', () => {
    if (get(settings).playerAutoPiP) pipfn(document.visibilityState !== 'visible')
  }, { signal: signal.signal })

  return {
    destroy: () => signal.abort()
  }
}

// TODO: de-shittify this code, abort signal, play/pause sync
export function burnIn (video: HTMLVideoElement, subtitles?: Subtitles, deband?: VideoDeband) {
  if (!subtitles?.renderer) return video.requestPictureInPicture()

  const canvasVideo = document.createElement('video')

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return
  let loop: number
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  subtitles.renderer.resize(video.videoWidth, video.videoHeight)
  const renderFrame = () => {
    context.drawImage(deband?.canvas ?? video, 0, 0)
    // @ts-expect-error internal call on canvas
    if (canvas.width && canvas.height && subtitles.renderer?._canvas) context.drawImage(subtitles.renderer._canvas, 0, 0, canvas.width, canvas.height)
    loop = video.requestVideoFrameCallback(renderFrame)
  }
  renderFrame()
  const destroy = () => {
    subtitles.renderer?.resize()
    video.cancelVideoFrameCallback(loop)
    canvas.remove()
  }

  const stream = canvas.captureStream()

  const cleanup = () => {
    destroy()
    canvasVideo.remove()
  }
  return new Promise<PictureInPictureWindow>(resolve => {
    canvasVideo.srcObject = stream
    canvasVideo.onloadedmetadata = () => {
      canvasVideo.play()
      canvasVideo.requestPictureInPicture().then(pipwindow => {
        resolve(pipwindow)
        pipwindow.onresize = () => {
          const { width, height } = pipwindow
          if (isNaN(width) || isNaN(height)) return
          if (!isFinite(width) || !isFinite(height)) return
          subtitles.renderer?.resize(width, height)
        }
      }).catch(e => {
        cleanup()
        console.warn('Failed To Burn In Subtitles ' + e)
      })
    }
    canvasVideo.onleavepictureinpicture = cleanup
  })
}
