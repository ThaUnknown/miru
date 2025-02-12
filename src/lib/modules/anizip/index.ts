import type { EpisodesResponse, MappingsResponse } from './types'

const safefetch = async <T> (_fetch: typeof fetch, ...args: Parameters<typeof fetch>): Promise<T | null> => {
  try {
    const res = await _fetch(...args)
    return await res.json()
  } catch (e) {
    return null
  }
}

// const episodes = safefetch<EpisodesResponse>(`https://api.ani.zip/v1/episodes?anilist_id=${params.id}`)
// const mappings = safefetch<MappingsResponse>(fetch, `https://api.ani.zip/v1/mappings?anilist_id=${params.id}`)

export async function episodes (id: number, _fetch = fetch) {
  return await safefetch<EpisodesResponse>(_fetch, `https://api.ani.zip/v1/episodes?anilist_id=${id}`)
}

export async function mappings (id: number, _fetch = fetch) {
  return await safefetch<MappingsResponse>(_fetch, `https://api.ani.zip/v1/mappings?anilist_id=${id}`)
}
