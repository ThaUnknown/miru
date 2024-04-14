export type Media = {
  id: number
  title: {
    romaji?: string
    english?: string
    native?: string
    userPreferred: string
  }
  description?: string
  season?: string
  seasonYear?: string
  format: string
  status: string
  episodes?: number
  duration?: number
  averageScore?: number
  genres?: string[]
  isFavourite: boolean
  coverImage?: {
    extraLarge: string
    color: string
    medium: string
  }
  source?: string
  countryOfOrigin?: string
  isAdult?: boolean
  bannerImage?: string
  synonyms?: string[]
  nextAiringEpisode?: {
    episode: number
    airingAt: number
  }
  startDate?: {
    year: number
    month?: number
    day?: number
  }
  trailer?: {
    id: string
    site: string
  }
  streamingEpisodes?: {
    title: string
    thumbnail: string
  }[]
  mediaListEntry?: {
    id: number
    progress: number
    repeat: number
    status?: string
    customLists?: string[]
    score?: number
  }
  studios?: {
    edges: {
      node: {
        name: string
      }
    }[]
  }
  airingSchedule?: {
    nodes?: {
      episode: number
      airingAt: number
    }[]
  }
  relations?: {
    edges: {
      relationType: string
      node: {
        id: number
        title: {
          userPreferred: string
        }
        type: string
        status: string
        format?: string
        episodes?: number
        synonyms?: string[]
        season?: string
        seasonYear?: number
        startDate?: {
          year: number
          month?: number
          day?: number
        }
        endDate?: {
          year: number
          month: number
          day: number
        }
      }
    }[]
  }
  // recommendations?: {
  //   edges?: {
  //     node: {
  //       media: {
  //         id: number
  //         title: {
  //           userPreferred: string
  //         }
  //         coverImage?: {
  //           medium: string
  //         }
  //       }
  //     }
  //   }[]
  // }
}

export type Following = {
  status: string
  score: number
  progress: number
  user: {
    name: string
    avatar: {
      medium: string
    }
  }
}

export type MediaListMedia = {
  id: number
  status: string
  mediaListEntry: {
    progress: number
  }
  nextAiringEpisode?: {
    episode: number
  }
  relations?: {
    edges: {
      relationType: string
      node: {
        id: number
      }
    }[]
  }
}

export type MediaListCollection = {
  lists: {
    status: string
    entries: {
      media: MediaListMedia
    }[]
  }[]
}

export type Viewer = {
  avatar: {
    medium: string
  }
  name: string
  id: number
  mediaListOptions?: {
    animeList?: {
      customLists?: string[]
    }
  }
}

export type Query<T> = {
  data: T
}

export type PagedQuery<T> = Query<{
  Page: {
    pageInfo: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      hasNextPage: boolean
    }
  } & T
}>

// TODO: error responses and nullish values
