export interface Result {
  title: string // torrent title
  link: string // link to .torrent file, or magnet link
  id?: number
  seeders: number
  leechers: number
  downloads: number
  hash: string // info hash
  size: number // size in bytes
  verified: boolean // if it's a verified release, e.g. it's 100% certain it's the correct episode, manually verified by the provider e.g. anidb
  date: Date // date the torrent was uploaded
  type?: 'batch' | 'best' | 'alt'
}

export interface Options {
  anilistId: number // anilist anime id
  anidbAid?: number // anidb anime id
  anidbEid?: number // anidb episode id
  titles: string[] // list of titles and alternative titles
  episode?: number
  episodeCount?: number // total episode count for the series
  resolution: '2160' | '1080' | '720' | '540' | '480' | ''
  exclusions: string[] // list of keywords to exclude from searches
}

export type SearchFunction = (options: Options) => Promise<Result[]>

export type Config = {
  seed?: 'perma' | number // seed ratio to hit
}

export type Accuracy = 'High' | 'Medium' | 'Low'

export class Source {
  name: string
  description: string
  accuracy: Accuracy
  config: Config
  single: SearchFunction
  batch: SearchFunction
  movie: SearchFunction
}
