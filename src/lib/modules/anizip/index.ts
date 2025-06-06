import type { EpisodesResponse, MappingsResponse } from './types'

import { safefetch } from '$lib/utils'

// const episodes = safefetch<EpisodesResponse>(`https://hayase.ani.zip/v1/episodes?anilist_id=${params.id}`)
// const mappings = safefetch<MappingsResponse>(fetch, `https://hayase.ani.zip/v1/mappings?anilist_id=${params.id}`)

export async function episodes (id: number, _fetch = fetch) {
  return await safefetch<EpisodesResponse>(_fetch, `https://hayase.ani.zip/v1/episodes?anilist_id=${id}`)
}

export async function mappings (id: number, _fetch = fetch) {
  return await safefetch<MappingsResponse>(_fetch, `https://hayase.ani.zip/v1/mappings?anilist_id=${id}`)
}

export async function mappingsByKitsuId (kitsuId: number, _fetch = fetch) {
  return await safefetch<MappingsResponse>(_fetch, `https://hayase.ani.zip/v1/mappings?kitsu_id=${kitsuId}`)
}
