import { writable, derived } from 'simple-store-svelte'

// Maximum number of entries to keep in LocalStorage
const maxEntries = 1000

// LocalStorage is structured as an array of objects with the following properties:
// mediaId, episode, currentTime, safeduration, createdAt, updatedAt
function loadFromLocalStorage () {
  const data = localStorage.getItem('animeEpisodeProgress')
  return data ? JSON.parse(data) : []
}

function saveToLocalStorage (data) {
  localStorage.setItem('animeEpisodeProgress', JSON.stringify(data))
  animeProgressStore.set(data)
}

const animeProgressStore = writable(loadFromLocalStorage())

// Return an object with the progress of each episode in percent (0-100), keyed by episode number
export function liveAnimeProgress (mediaId) {
  return derived(animeProgressStore, (data) => {
    if (!mediaId) return {}
    const results = data.filter(item => item.mediaId === mediaId)
    if (!results) return {}
    // Return an object with the episode as the key and the progress as the value
    return Object.fromEntries(results.map(result => [
      result.episode,
      Math.ceil(result.currentTime / result.safeduration * 100)
    ]))
  })
}

// Return an individual episode's progress in percent (0-100)
export function liveAnimeEpisodeProgress (mediaId, episode) {
  return derived(animeProgressStore, (data) => {
    if (!mediaId || !episode) return 0
    const result = data.find(item => item.mediaId === mediaId && item.episode === episode)
    if (!result) return 0
    return Math.ceil(result.currentTime / result.safeduration * 100)
  })
}

// Return an individual episode's record { mediaId, episode, currentTime, safeduration, createdAt, updatedAt }
export function getAnimeProgress (mediaId, episode) {
  const data = loadFromLocalStorage()
  return data.find(item => item.mediaId === mediaId && item.episode === episode)
}

// Set an individual episode's progress
export function setAnimeProgress ({ mediaId, episode, currentTime, safeduration }) {
  if (!mediaId || !episode || !currentTime || !safeduration) return
  const data = loadFromLocalStorage()
  // Update the existing entry or create a new one
  const existing = data.find(item => item.mediaId === mediaId && item.episode === episode)
  if (existing) {
    existing.currentTime = currentTime
    existing.safeduration = safeduration
    existing.updatedAt = Date.now()
  } else {
    data.push({ mediaId, episode, currentTime, safeduration, createdAt: Date.now(), updatedAt: Date.now() })
  }
  // Remove the oldest entries if we have too many
  while (data.length > maxEntries) {
    const oldest = data.reduce((a, b) => a.updatedAt < b.updatedAt ? a : b)
    data.splice(data.indexOf(oldest), 1)
  }
  saveToLocalStorage(data)
}
