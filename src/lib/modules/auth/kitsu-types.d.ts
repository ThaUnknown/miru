export interface OAuth {
  access_token: string
  created_at: number
  expires_in: number // Seconds until the access_token expires (30 days default)
  refresh_token: string
  scope: string
  token_type: string
}

export interface KitsuError {
  error: string
  error_description: string
}

export interface Resource<T> {
  id: string
  type: string
  attributes: T
  relationships?: Record<string, { data: Array<{id: string, type: string }> | {id: string, type: string }}>
}

export interface Res<Attributes, Included = never> {
  data: Array<Resource<Attributes>>
  links?: {
    first?: string
    next?: string
    prev?: string
    last?: string
  }
  included?: Included extends never ? never : Array<Resource<Included>>
  meta?: Record<string, unknown>
}

export interface ResSingle<Attributes, Included = never> {
  data: Resource<Attributes>
  links?: {
    first?: string
    next?: string
    prev?: string
    last?: string
  }
  included?: Included extends never ? never : Array<Resource<Included>>
  meta?: Record<string, unknown>
}

export interface User {
  name: string
  about?: string
  avatar?: {
    original: string // TODO: maybe this can be done better with speficic sizes?
  }
  coverImage?: {
    original: string
  }
  createdAt: string // Date
}

type KitsuMediaStatus = 'current' | 'planned' | 'completed' | 'dropped' | 'on_hold'

export interface KEntry {
  createdAt: string // Date
  updatedAt: string // Date
  status?: KitsuMediaStatus
  progress?: number
  volumesOwned?: number
  reconsuming?: boolean
  reconsumeCount?: number
  notes?: string
  private?: boolean
  reactionSkipped?: string
  progressedAt?: string // Date
  startedAt?: string // Date
  finishedAt?: string
  rating?: string
  ratingTwenty?: null
}

export interface Fav {
  favRank: number
}

export interface Anime {
  status?: string
  episodeCount?: number
}

export interface Mapping {
  externalSite?: 'anilist/anime' | (string & {})
  externalId?: string
}
