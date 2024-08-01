export type Media = {
  id: number
  title: string
  alternative_titles: {
    synonyms: string[]
    en: string
    ja: string
  }
  rank?: number
  nsfw?: string
  media_type: string
  status: string
  my_list_status?: AnimeListStatus
  start_season?: {
    year: number
    season: string
  }
  average_episode_duration?: number
  related_anime?: {
    node: Media
    relation_type: string
    relation_type_formatted: string
  }[]
}

export type AnimeListStatus = {
  status: string
  score: number
  num_episodes_watched: number
  is_rewatching: boolean
  start_date?: string
  finish_date?: string
  priority: number
  number_times_rewatched: number
  rewatch_value: number
  updated_at: number
}

export type Viewer = {
  id: number
  name: string
  picture: string
}

export type MediaList = {
  node: Media
}[];

export type Query<T> = {
  data: T
}