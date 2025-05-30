import type { AnimeThemesResponse } from './types'

import { safefetch } from '$lib/utils'

export function themes (id: number, _fetch = fetch) {
  return safefetch<AnimeThemesResponse>(_fetch, `https://api.animethemes.moe/anime/?fields[audio]=id,basename,link,size&fields[video]=id,basename,link,tags&filter[external_id]=${id}&filter[has]=resources&filter[site]=AniList&include=animethemes.animethemeentries.videos,animethemes.song,animethemes.song.artists`)
}
