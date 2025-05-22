export type * from './types.d.ts'

export interface Image {
  coverType?: 'Banner' | 'Poster' | 'Fanart' | 'Clearlogo'
  url?: string
}

export interface Mappings {
  animeplanet_id?: string
  kitsu_id?: number
  mal_id?: number
  type?: string
  anilist_id?: number
  anisearch_id?: number
  anidb_id?: number
  notifymoe_id?: string
  livechart_id?: number
  thetvdb_id?: number
  imdb_id?: string
  themoviedb_id?: string
}

export type Languages = 'x-jat' | 'ru' | 'ar' | 'nl' | 'lt' | 'tr' | 'uk' | 'fa' | 'ja' | 'zh' | 'en' | 'de' | 'fr' | 'it' | 'es' | 'ko' | 'pl' | 'pt' | 'pt-BR' | 'es-CA' | 'cs' | 'fi' | 'he' | 'hu' | 'ro' | 'bg' | 'zh-Hant' | 'zh-Hans' | 'es-419'

export type Titles = Record<Languages, string>

export interface Episode {
  tvdbShowId?: number
  tvdbId?: number
  seasonNumber?: number // TVDB shit
  episodeNumber?: number // TVDB shit
  absoluteEpisodeNumber?: number // TVDB shit
  title?: Titles
  airDate?: string
  airDateUtc?: string
  runtime?: number
  overview?: string
  image?: string
  episode: string // anidb
  anidbEid?: number
  length?: number
  airdate?: string
  rating?: string
  summary?: string
  finaleType?: string
}

export type Episodes = Record<string | number, Episode>

export interface EpisodesResponse {
  titles?: Titles
  episodes?: Episodes
  episodeCount?: number
  specialCount?: number
  images?: Image[]
  mappings?: Mappings
}

export interface MappingsResponse {
  animeplanet_id?: string
  kitsu_id?: number
  mal_id?: number
  type?: string
  anilist_id?: number
  anisearch_id?: number
  anidb_id?: number
  notifymoe_id?: string
  livechart_id?: number
  thetvdb_id?: number
  imdb_id?: string
  themoviedb_id?: string
}
