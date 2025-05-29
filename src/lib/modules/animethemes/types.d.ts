export interface AnimeThemesResponse {
  anime?: Anime[]
  links?: Links
  meta?: Meta
}

export interface Anime {
  id?: number
  name?: string
  media_format?: string
  season?: string
  slug?: string
  synopsis?: string
  year?: number
  animethemes?: AnimeTheme[]
}

export interface AnimeTheme {
  id?: number
  sequence?: null
  slug?: string
  type?: string
  song?: Song
  animethemeentries?: AnimeThemeEntry[]
}

export interface AnimeThemeEntry {
  id?: number
  episodes?: string
  notes?: null
  nsfw?: boolean
  spoiler?: boolean
  version?: null
  videos?: Video[]
}

export interface Video {
  id?: number
  basename?: string
  tags?: string
  link?: string
  audio?: Audio
}

export interface Audio {
  id?: number
  basename?: string
  size?: number
  link?: string
}

export interface Song {
  id?: number
  title?: string
  artists?: Artist[]
}

export interface Artist {
  id?: number
  name?: string
  slug?: string
  information?: null
  artistsong?: ArtistSong
}

export interface ArtistSong {
  alias?: null
  as?: null
}

export interface Links {
  first?: string
  last?: null
  prev?: null
  next?: null
}

export interface Meta {
  current_page?: number
  from?: number
  path?: string
  per_page?: number
  to?: number
}
