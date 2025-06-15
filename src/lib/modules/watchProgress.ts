import { derived, get } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'

export interface WatchProgress {
  episode: number
  currentTime: number
  safeduration: number
}

const animeProgressStore = persisted<Record<number, WatchProgress>>('watchProgress', {})

export function liveAnimeProgress (mediaId: number) {
  return derived(animeProgressStore, (data) => {
    if (!mediaId) return
    const entry = data[mediaId]
    if (!entry) return
    return {
      progress: Math.ceil(entry.currentTime / entry.safeduration * 100),
      episode: entry.episode
    }
  })
}

export function getAnimeProgress (mediaId: number) {
  return get(animeProgressStore)[mediaId]
}

export function setAnimeProgress (mediaId: number, progress: WatchProgress) {
  animeProgressStore.update(data => {
    data[mediaId] = progress
    return data
  })
}
