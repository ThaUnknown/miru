import { type ClassValue, clsx } from 'clsx'
import { readable } from 'simple-store-svelte'
import { cubicOut } from 'svelte/easing'
import { twMerge } from 'tailwind-merge'

import type { TransitionConfig } from 'svelte/transition'

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type MediaQuery<Query extends Record<string, string> = Record<string, string>> = {
  [K in keyof Query]?: boolean | string;
}

function calculateMedia (mqls: Record<string, MediaQueryList>) {
  const media: MediaQuery = {}
  for (const [key, query] of Object.entries(mqls)) {
    media[key] = query.matches
  }
  return media
}

const mediaQueries = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  '3xl': '(min-width: 1920px)',
  '4xl': '(min-width: 2560px)',
  '5xl': '(min-width: 3840px)',
  '6xl': '(min-width: 5120px)'
} as const

export const breakpoints = readable<MediaQuery<typeof mediaQueries>>({}, set => {
  const ctrl = new AbortController()
  const mqls: Record<string, MediaQueryList> = {}
  const updateMedia = () => set(calculateMedia(mqls))
  for (const [key, query] of Object.entries(mediaQueries)) {
    mqls[key] = window.matchMedia(query)
    mqls[key].addEventListener('change', updateMedia, { signal: ctrl.signal })
  }
  updateMedia()
  return () => ctrl.abort()
})

interface FlyAndScaleParams {
  y?: number
  x?: number
  start?: number
  duration?: number
}

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform

  const scaleConversion = (
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number]
  ) => {
    const [minA, maxA] = scaleA
    const [minB, maxB] = scaleB

    const percentage = (valueA - minA) / (maxA - minA)
    const valueB = percentage * (maxB - minB) + minB

    return valueB
  }

  const styleToString = (
    style: Record<string, number | string | undefined>
  ): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str
      return str + `${key}:${style[key]};`
    }, '')
  }

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t
      })
    },
    easing: cubicOut
  }
}

export const sleep = (t: number) => new Promise<void>(resolve => setTimeout(resolve, t))

export const highEntropyValues = 'userAgentData' in navigator && navigator.userAgentData.getHighEntropyValues(['architecture', 'platform', 'platformVersion'])

export function safeLocalStorage<T> (key: string): T | undefined {
  try {
    const value = localStorage.getItem(key)
    if (value) return JSON.parse(value) as T
  } catch (e) {
    console.error(e)
  }
}

export const debounce = <T extends (...args: any[]) => unknown>(
  callback: T,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback(...args)
    }, waitFor)
  }
}

const formatter = new Intl.RelativeTimeFormat('en')
const ranges: Partial<Record<Intl.RelativeTimeFormatUnit, number>> = {
  years: 3600 * 24 * 365,
  months: 3600 * 24 * 30,
  weeks: 3600 * 24 * 7,
  days: 3600 * 24,
  hours: 3600,
  minutes: 60,
  seconds: 1
}

export function since (date: Date) {
  const secondsElapsed = (date.getTime() - Date.now()) / 1000
  for (const _key in ranges) {
    const key = _key as Intl.RelativeTimeFormatUnit
    if ((ranges[key] ?? 0) < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / (ranges[key] ?? 0)
      return formatter.format(Math.round(delta), key)
    }
  }
  return 'now'
}
export function eta (seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0s'

  const units = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 },
    { label: 's', secs: 1 }
  ]

  let remaining = Math.floor(seconds)
  const parts: string[] = []

  for (const { label, secs } of units) {
    if (remaining >= secs) {
      const value = Math.floor(remaining / secs)
      parts.push(`${value}${label}`)
      remaining %= secs
      // Only show up to two largest units (e.g., "1h 2m", "2m 3s")
      if (parts.length === 2) break
    }
  }

  // If nothing matched, show "0s"
  return parts.length ? parts.join(' ') : '0s'
}
const bytes = [' B', ' kB', ' MB', ' GB', ' TB']
export function fastPrettyBytes (num: number) {
  if (isNaN(num)) return '0 B'
  if (num < 1) return num + ' B'
  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), bytes.length - 1)
  return Number((num / Math.pow(1000, exponent)).toFixed(1)) + bytes[exponent]!
}

const bits = [' b', ' kb', ' Mb', ' Gb', ' Tb']
export function fastPrettyBits (num: number) {
  if (isNaN(num)) return '0 b'
  if (num < 1) return num + ' b'
  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), bits.length - 1)
  return Number((num / Math.pow(1000, exponent)).toFixed(1)) + bits[exponent]!
}

export function toTS (sec: number, full?: number) {
  if (isNaN(sec) || sec < 0) {
    switch (full) {
      case 1:
        return '0:00:00.00'
      case 2:
        return '0:00:00'
      case 3:
        return '00:00'
      default:
        return '0:00'
    }
  }
  const hours = Math.floor(sec / 3600)
  let minutes: string | number = Math.floor(sec / 60) - hours * 60
  let seconds: string | number = full === 1 ? (sec % 60).toFixed(2) : Math.floor(sec % 60)
  if (minutes < 10 && (hours > 0 || full)) minutes = '0' + minutes
  if (Number(seconds) < 10) seconds = '0' + seconds
  return (hours > 0 || full === 1 || full === 2) ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds
}

export interface TraceAnime {
  anilist: number
  filename: string
  episode: number
  from: number
  to: number
  similarity: number
  video: string
  image: string
}

export async function traceAnime (image: File | string) { // WAIT lookup logic
  let res: Response
  if (image instanceof File) {
    res = await fetch('https://api.trace.moe/search?cutBorders', {
      method: 'POST',
      body: image,
      headers: { 'Content-type': image.type }
    })
  } else {
    res = await fetch(`https://api.trace.moe/search?cutBorders&url=${image}`)
  }
  const { result } = await res.json() as { result: TraceAnime[] }

  if (result.length) {
    return result
  } else {
    throw new Error('Search Failed\nCouldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.')
  }
}

export function codeToEmoji (c: string) {
  return c.replace(/./g, (ch) => String.fromCodePoint(0x1f1a5 + ch.charCodeAt(0)))
}

export class HashMap<K extends object, T> {
  map = new Map<string, T>()

  _id (k: K): string {
    return JSON.stringify(k, Object.keys(k).sort())
  }

  has (k: K): boolean {
    return this.map.has(this._id(k))
  }

  add (k: K, o: T) {
    return this.map.set(this._id(k), o)
  }

  delete (k: K): boolean {
    return this.map.delete(this._id(k))
  }

  clear () {
    this.map.clear()
  }

  get size (): number {
    return this.map.size
  }

  values (): IterableIterator<T> {
    return this.map.values()
  }

  [Symbol.iterator] (): IterableIterator<T> {
    return this.values()
  }
}

export const subtitleExtensions = ['srt', 'vtt', 'ass', 'ssa', 'sub', 'txt']
export const subRx = new RegExp(`.(${subtitleExtensions.join('|')})$`, 'i')

export const videoExtensions = ['3g2', '3gp', 'asf', 'avi', 'dv', 'flv', 'gxf', 'm2ts', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'mkv', 'mov', 'mp4', 'mpd', 'mpeg', 'mpg', 'mxf', 'nut', 'ogm', 'ogv', 'swf', 'ts', 'vob', 'webm', 'wmv', 'wtv']
export const videoRx = new RegExp(`.(${videoExtensions.join('|')})$`, 'i')

export const fontExtensions = ['ttf', 'ttc', 'woff', 'woff2', 'otf', 'cff', 'otc', 'pfa', 'pfb', 'pcf', 'fnt', 'bdf', 'pfr', 'eot']
export const fontRx = new RegExp(`.(${fontExtensions.join('|')})$`, 'i')

export const safefetch = async <T> (_fetch: typeof fetch, ...args: Parameters<typeof fetch>): Promise<T | null> => {
  try {
    const res = await _fetch(...args)
    return await res.json()
  } catch (e) {
    return null
  }
}

export function arrayEqual <T> (a: T[], b: T[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}
