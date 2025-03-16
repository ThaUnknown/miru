import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'
import { readable, type Writable } from 'simple-store-svelte'

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export const sleep = (t: number) => new Promise(resolve => setTimeout(resolve, t))

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

const mql = typeof matchMedia !== 'undefined' ? matchMedia('(min-width: 768px)') : null
export const isMobile = readable(!mql?.matches, set => {
  const check: ({ matches }: { matches: boolean }) => void = ({ matches }) => set(!matches)
  mql?.addEventListener('change', check)
  return () => mql?.removeEventListener('change', check)
})

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
}
const units = [' B', ' kB', ' MB', ' GB', ' TB']
export function fastPrettyBytes (num: number) {
  if (isNaN(num)) return '0 B'
  if (num < 1) return num + ' B'
  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  return Number((num / Math.pow(1000, exponent)).toFixed(2)) + units[exponent]!
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

export function bindPiP (doc: Document, store: Writable<HTMLVideoElement | null>) {
  const signal = new AbortController()
  doc.addEventListener('enterpictureinpicture', (e) => {
    store.set(e.target as HTMLVideoElement)
  }, { signal: signal.signal })
  doc.addEventListener('leavepictureinpicture', () => {
    store.set(null)
  }, { signal: signal.signal })
  return { destroy: () => signal.abort() }
}
