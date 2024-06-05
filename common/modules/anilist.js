import lavenshtein from 'js-levenshtein'
import { writable } from 'simple-store-svelte'
import Bottleneck from 'bottleneck'

import { alToken } from '@/modules/settings.js'
import { toast } from 'svelte-sonner'
import { sleep } from './util.js'

export const codes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  406: 'Not Acceptable',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  511: 'Network Authentication Required'
}

function printError (error) {
  console.warn(error)
  toast.error('Search Failed', {
    description: `Failed making request to anilist!\nTry again in a minute.\n${error.status || 429} - ${error.message || codes[error.status || 429]}`,
    duration: 3000
  })
}

const date = new Date()
export const currentSeason = ['WINTER', 'SPRING', 'SUMMER', 'FALL'][Math.floor((date.getMonth() / 12) * 4) % 4]
export const currentYear = date.getFullYear()

/**
 * @param {import('./al.d.ts').Media & {lavenshtein?: number}} media
 * @param {string} name
 */
function getDistanceFromTitle (media, name) {
  if (media) {
    const titles = Object.values(media.title).filter(v => v).map(title => lavenshtein(title.toLowerCase(), name.toLowerCase()))
    const synonyms = media.synonyms.filter(v => v).map(title => lavenshtein(title.toLowerCase(), name.toLowerCase()) + 2)
    const distances = [...titles, ...synonyms]
    const min = distances.reduce((prev, curr) => prev < curr ? prev : curr)
    media.lavenshtein = min
    return media
  }
}

const queryObjects = /* js */`
id,
idMal,
title {
  romaji,
  english,
  native,
  userPreferred
},
description(asHtml: false),
season,
seasonYear,
format,
status,
episodes,
duration,
averageScore,
genres,
tags {
  name,
  rank
},
isFavourite,
coverImage{
  extraLarge,
  medium,
  color
},
source,
countryOfOrigin,
isAdult,
bannerImage,
synonyms,
nextAiringEpisode{
  timeUntilAiring,
  episode
},
startDate{
  year,
  month,
  day
},
trailer{
  id,
  site
},
streamingEpisodes{
  title,
  thumbnail
},
mediaListEntry{
  id,
  progress,
  repeat,
  status,
  customLists(asArray: true),
  score(format: POINT_10)
},
studios(isMain: true){
  nodes {
    name
  }
},
airingSchedule(page: 1, perPage: 1, notYetAired: true){
  nodes {
    episode,
    airingAt
  }
},
relations {
  edges {
    relationType(version:2),
    node {
      id,
      title{userPreferred},
      coverImage{medium},
      type,
      status,
      format,
      episodes,
      synonyms,
      season,
      seasonYear,
      startDate{
        year,
        month,
        day
      },
      endDate{
        year,
        month,
        day
      }
    }
  }
}`

// recommendations{
//   edges{
//     node{
//       mediaRecommendation{
//         id,
//         title{
//           userPreferred
//         },
//         coverImage{
//           medium
//         }
//       }
//     }
//   }
// }

class AnilistClient {
  limiter = new Bottleneck({
    reservoir: 90,
    reservoirRefreshAmount: 90,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 10,
    minTime: 100
  })

  rateLimitPromise = null

  /** @type {import('simple-store-svelte').Writable<ReturnType<AnilistClient['getUserLists']>>} */
  userLists = writable()

  userID = alToken

  /** @type {Record<number, import('./al.d.ts').Media>} */
  mediaCache = {}

  constructor () {
    this.limiter.on('failed', async (error, jobInfo) => {
      printError(error)

      if (error.status === 500) return 1

      if (!error.statusText) {
        if (!this.rateLimitPromise) this.rateLimitPromise = sleep(61 * 1000).then(() => { this.rateLimitPromise = null })
        return 61 * 1000
      }
      const time = ((error.headers.get('retry-after') || 60) + 1) * 1000
      if (!this.rateLimitPromise) this.rateLimitPromise = sleep(time).then(() => { this.rateLimitPromise = null })
      return time
    })

    if (this.userID?.viewer?.data?.Viewer) {
      this.userLists.value = this.getUserLists({ sort: 'UPDATED_TIME_DESC' })
      // update userLists every 15 mins
      setInterval(() => this.userLists.value = this.getUserLists({ sort: 'UPDATED_TIME_DESC' }), 1000 * 60 * 15)
    }
  }

  /** @type {(options: RequestInit) => Promise<any>} */
  handleRequest = this.limiter.wrap(async opts => {
    await this.rateLimitPromise
    let res = {}
    try {
      res = await fetch('https://graphql.anilist.co', opts)
    } catch (e) {
      if (!res || res.status !== 404) throw e
    }
    if (!res.ok && (res.status === 429 || res.status === 500)) {
      throw res
    }
    let json = null
    try {
      json = await res.json()
    } catch (error) {
      if (res.ok) printError(error)
    }
    if (!res.ok) {
      if (json) {
        for (const error of json?.errors || []) {
          printError(error)
        }
      } else {
        printError(res)
      }
    }
    return json
  })

  /**
   * @param {string} query
   * @param {Record<string, any>} variables
   */
  alRequest (query, variables) {
    /** @type {RequestInit} */
    const options = {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query: query.replace(/\s/g, '').replaceAll('&nbsp;', ' '),
        variables: {
          sort: 'TRENDING_DESC',
          page: 1,
          perPage: 50,
          status_in: '[CURRENT,PLANNING,COMPLETED,DROPPED,PAUSED,REPEATING]',
          ...variables
        }
      })
    }
    // @ts-ignore
    if (alToken?.token) options.headers.Authorization = alToken.token

    return this.handleRequest(options)
  }

  async alSearch (method) {
    const res = await this.searchName(method)
    const media = res.data.Page.media.map(media => getDistanceFromTitle(media, method.name))
    if (!media.length) return null
    return media.reduce((prev, curr) => prev.lavenshtein <= curr.lavenshtein ? prev : curr)
  }

  /**
   * @param {{key: string, title: string, year?: string, isAdult: boolean}[]} flattenedTitles
   **/
  async alSearchCompound (flattenedTitles) {
    if (!flattenedTitles.length) return []
    /** @type {Record<`v${number}`, string>} */
    const requestVariables = flattenedTitles.reduce((obj, { title, isAdult }, i) => {
      if (isAdult) return obj
      obj[`v${i}`] = title
      return obj
    }, {})

    const queryVariables = flattenedTitles.reduce((arr, { isAdult }, i) => {
      if (isAdult) return arr
      arr.push(`$v${i}: String`)
      return arr
    }, []).join(', ')
    const fragmentQueries = flattenedTitles.map(({ year, isAdult }, i) => /* js */`
    v${i}: Page(perPage: 10) {
      media(type: ANIME, search: $v${isAdult ? i - 1 : i}, status_in: [RELEASING, FINISHED], isAdult: ${!!isAdult} ${year ? `, seasonYear: ${year}` : ''}) {
        ...med
      }
    }`)

    const query = /* js */`
    query(${queryVariables}){
      ${fragmentQueries}
    }
    
    fragment&nbsp;med&nbsp;on&nbsp;Media {
      id,
      title {
        romaji,
        english,
        native
      },
      synonyms
    }`

    /**
     * @type {import('./al.d.ts').Query<Record<string, {media: import('./al.d.ts').Media[]}>>}
     * @returns {Promise<[string, import('./al.d.ts').Media][]>}
     * */
    const res = await this.alRequest(query, requestVariables)

    /** @type {Record<string, number>} */
    const searchResults = {}
    for (const [variableName, { media }] of Object.entries(res.data)) {
      if (!media.length) continue
      const titleObject = flattenedTitles[Number(variableName.slice(1))]
      if (searchResults[titleObject.key]) continue
      searchResults[titleObject.key] = media.map(media => getDistanceFromTitle(media, titleObject.title)).reduce((prev, curr) => prev.lavenshtein <= curr.lavenshtein ? prev : curr).id
    }

    const ids = Object.values(searchResults)
    const search = await this.searchIDS({ id: ids, perPage: 50 })
    return Object.entries(searchResults).map(([filename, id]) => [filename, search.data.Page.media.find(media => media.id === id)])
  }

  async alEntry (filemedia) {
    // check if values exist
    if (filemedia.media && alToken) {
      if (filemedia.failed) return
      const { media } = filemedia
      // check if media can even be watched, ex: it was resolved incorrectly
      if (media.status === 'FINISHED' || media.status === 'RELEASING') {
        // some anime/OVA's can have a single episode, or some movies can have multiple episodes
        const singleEpisode = ((!media.episodes && (Number(filemedia.episode) === 1 || isNaN(Number(filemedia.episode)))) || (media.format === 'MOVIE' && media.episodes === 1)) && 1 // movie check
        const videoEpisode = Number(filemedia.episode) || singleEpisode
        const mediaEpisode = media.episodes || media.nextAiringEpisode?.episode || singleEpisode
        // check episode range
        if (videoEpisode && mediaEpisode && (mediaEpisode >= videoEpisode)) {
          // check user's own watch progress
          const lists = media.mediaListEntry?.customLists.filter(list => list.enabled).map(list => list.name) || []

          const status = media.mediaListEntry?.status === 'REPEATING' ? 'REPEATING' : 'CURRENT'

          if (!media.mediaListEntry || (media.mediaListEntry?.progress <= videoEpisode) || singleEpisode) {
            const variables = {
              repeat: media.mediaListEntry?.repeat || 0,
              id: media.id,
              status,
              episode: videoEpisode,
              lists
            }
            if (videoEpisode === mediaEpisode) {
              variables.status = 'COMPLETED'
              if (media.mediaListEntry?.status === 'REPEATING') variables.repeat = media.mediaListEntry.repeat + 1
            }
            if (!lists.includes('Watched using Miru')) {
              variables.lists.push('Watched using Miru')
            }
            await this.entry(variables)
            this.userLists.value = this.getUserLists({ sort: 'UPDATED_TIME_DESC' })
          }
        }
      }
    }
  }

  async searchName (variables = {}) {
    const query = /* js */` 
    query($page: Int, $perPage: Int, $sort: [MediaSort], $name: String, $status: [MediaStatus], $year: Int, $isAdult: Boolean){
      Page(page: $page, perPage: $perPage){
        pageInfo{
          hasNextPage
        },
        media(type: ANIME, search: $name, sort: $sort, status_in: $status, isAdult: $isAdult, format_not: MUSIC, seasonYear: $year){
          ${queryObjects}
        }
      }
    }`

    variables.isAdult = variables.isAdult ?? false

    /** @type {import('./al.d.ts').PagedQuery<{media: import('./al.d.ts').Media[]}>} */
    const res = await this.alRequest(query, variables)

    this.updateCache(res.data.Page.media)

    return res
  }

  async searchIDSingle (variables) {
    const query = /* js */` 
    query($id: Int){ 
      Media(id: $id, type: ANIME){
        ${queryObjects}
      }
    }`

    /** @type {import('./al.d.ts').Query<{Media: import('./al.d.ts').Media}>} */
    const res = await this.alRequest(query, variables)

    this.updateCache([res.data.Media])

    return res
  }

  async searchIDS (variables) {
    const query = /* js */` 
    query($id: [Int], $page: Int, $perPage: Int, $status: [MediaStatus], $onList: Boolean, $sort: [MediaSort], $search: String, $season: MediaSeason, $year: Int, $genre: [String], $tag: [String], $format: MediaFormat){ 
      Page(page: $page, perPage: $perPage){
        pageInfo{
          hasNextPage
        },
        media(id_in: $id, type: ANIME, status_in: $status, onList: $onList, search: $search, sort: $sort, season: $season, seasonYear: $year, genre_in: $genre, tag_in: $tag, format: $format){
          ${queryObjects}
        }
      }
    }`

    /** @type {import('./al.d.ts').PagedQuery<{media: import('./al.d.ts').Media[]}>} */
    const res = await this.alRequest(query, variables)

    this.updateCache(res.data.Page.media)

    return res
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ Viewer: import('./al.d.ts').Viewer }>>} */
  viewer (variables = {}) {
    const query = /* js */` 
    query{
      Viewer{
        avatar{
          medium
        },
        name,
        id,
        mediaListOptions{
          animeList{
            customLists
          }
        }
      }
    }`

    return this.alRequest(query, variables)
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ MediaListCollection: import('./al.d.ts').MediaListCollection }>>} */
  async getUserLists (variables) {
    const userId = this.userID?.viewer?.data?.Viewer.id
    variables.id = userId
    variables.sort = variables.sort?.replace('USER_SCORE_DESC', 'SCORE_DESC');
    const query = /* js */` 
      query($id: Int $sort: [MediaListSort]){
        MediaListCollection(userId: $id, type: ANIME, sort: $sort, forceSingleCompletedList: true) {
          lists {
            status,
            entries {
              media {
                ${queryObjects}
              }
            }
          }
        }
      }`

    const res = await this.alRequest(query, variables)

    this.updateCache(res.data.MediaListCollection.lists.flatMap(list => list.entries.map(entry => entry.media)));

    return res
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ MediaList: { status: string, progress: number, repeat: number }}>>} */
  async searchIDStatus (variables = {}) {
    const userId = this.userID?.viewer?.data?.Viewer.id
    variables.id = userId
    const query = /* js */` 
      query($id: Int, $mediaId: Int){
        MediaList(userId: $id, mediaId: $mediaId){
          status,
          progress,
          repeat
        }
      }`

    return await this.alRequest(query, variables)
  }

  async searchAiringSchedule (variables = {}) {
    variables.to = (variables.from + 7 * 24 * 60 * 60)
    const query = /* js */` 
    query($page: Int, $perPage: Int, $from: Int, $to: Int){
      Page(page: $page, perPage: $perPage){
        pageInfo{
          hasNextPage
        },
        airingSchedules(airingAt_greater: $from, airingAt_lesser: $to){
          episode,
          timeUntilAiring,
          airingAt,
          media{
            ${queryObjects}
          }
        }
      }
    }`

    /** @type {import('./al.d.ts').PagedQuery<{ airingSchedules: { timeUntilAiring: number, airingAt: number, episode: number, media: import('./al.d.ts').Media}[]}>} */
    const res = await this.alRequest(query, variables)

    this.updateCache(res.data.Page.airingSchedules?.map(({ media }) => media))

    return res
  }

  /** @returns {Promise<import('./al.d.ts').PagedQuery<{ airingSchedules: { airingAt: number, episode: number }[]}>>} */
  episodes (variables) {
    const query = /* js */` 
      query($id: Int){
        Page(page: 1, perPage: 1000){
          airingSchedules(mediaId: $id){
            airingAt,
            episode
          }
        }
      }`

    return this.alRequest(query, variables)
  }

  async search (variables = {}) {
    variables.sort ||= 'SEARCH_MATCH'
    const query = /* js */` 
    query($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $onList: Boolean, $status: MediaStatus, $season: MediaSeason, $year: Int, $genre: [String], $tag: [String], $format: MediaFormat, $id_not: [Int]){
      Page(page: $page, perPage: $perPage){
        pageInfo{
          hasNextPage
        },
        media(id_not_in: $id_not, type: ANIME, search: $search, sort: $sort, onList: $onList, status: $status, season: $season, seasonYear: $year, genre_in: $genre, tag_in: $tag, format: $format, format_not: MUSIC){
          ${queryObjects}
        }
      }
    }`

    /** @type {import('./al.d.ts').PagedQuery<{media: import('./al.d.ts').Media[]}>} */
    const res = await this.alRequest(query, variables)

    this.updateCache(res.data.Page.media)

    return res
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ AiringSchedule: { airingAt: number }}>>} */
  episodeDate (variables) {
    const query = /* js */`
      query($id: Int, $ep: Int) {
        AiringSchedule(mediaId: $id, episode: $ep) {
          airingAt
        }
      }`

    return this.alRequest(query, variables)
  }

  /** @returns {Promise<import('./al.d.ts').PagedQuery<{ mediaList: import('./al.d.ts').Following[]}>>} */
  following (variables) {
    const query = /* js */`
      query($id: Int){
        Page{
          mediaList(mediaId: $id, isFollowing: true, sort: UPDATED_TIME_DESC){
            status,
            score,
            progress,
            user{
              name,
              avatar{
                medium
              }
            }
          }
        }
      }`

    return this.alRequest(query, variables)
  }

  entry (variables) {
    const query = /* js */`
      mutation($lists: [String], $id: Int, $status: MediaListStatus, $episode: Int, $repeat: Int, $score: Int){
        SaveMediaListEntry(mediaId: $id, status: $status, progress: $episode, repeat: $repeat, scoreRaw: $score, customLists: $lists){
          id,
          status,
          progress,
          repeat
        }
      }`

    return this.alRequest(query, variables)
  }

  delete (variables) {
    const query = /* js */`
      mutation($id: Int){
        DeleteMediaListEntry(id: $id){
          deleted
        }
      }`

    return this.alRequest(query, variables)
  }

  favourite (variables) {
    const query = /* js */`
      mutation($id: Int){
        ToggleFavourite(animeId: $id){ anime { nodes { id } } } 
      }`

    return this.alRequest(query, variables)
  }

  customList (variables = {}) {
    variables.lists = [...variables.lists, 'Watched using Miru']
    const query = /* js */`
      mutation($lists: [String]){
        UpdateUser(animeListOptions: { customLists: $lists }){
          id
        }
      }`

    return this.alRequest(query, variables)
  }

  /** @param {import('./al.d.ts').Media[]} medias */
  updateCache (medias) {
    this.mediaCache = { ...this.mediaCache, ...Object.fromEntries(medias.map(media => [media.id, media])) }
  }
}

export const anilistClient = new AnilistClient()
