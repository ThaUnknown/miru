import lavenshtein from 'js-levenshtein'
import { writable } from 'simple-store-svelte'
import Bottleneck from 'bottleneck'

import { alToken, settings } from '@/modules/settings.js'
import { toast } from 'svelte-sonner'
import { sleep } from './util.js'
import Helper from '@/modules/helper.js'
import IPC from '@/modules/ipc.js'
import Debug from 'debug'

const debug = Debug('ui:anilist')

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
  422: 'Unprocessable Entity',
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
  debug(`Error: ${error.status || 429} - ${error.message || codes[error.status || 429]}`)
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
coverImage {
  extraLarge,
  medium,
  color
},
source,
countryOfOrigin,
isAdult,
bannerImage,
synonyms,
studios(sort: NAME, isMain: true) {
  nodes {
    name
  }
},
stats {
  scoreDistribution {
    score,
    amount
    }
},
nextAiringEpisode {
  timeUntilAiring,
  episode
},
trailer {
  id,
  site
},
streamingEpisodes {
  title,
  thumbnail
},
mediaListEntry {
  id,
  progress,
  repeat,
  status,
  customLists(asArray: true),
  score(format: POINT_10),
  startedAt {
    year,
    month,
    day
  },
  completedAt {
    year,
    month,
    day
  }
},
airingSchedule(page: 1, perPage: 1, notYetAired: true) {
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
      type,
      format,
      seasonYear
    }
  }
}`

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

  lastNotificationDate = Date.now() / 1000

  constructor () {
    debug('Initializing Anilist Client for ID ' + this.userID?.viewer?.data?.Viewer?.id)
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
      // check notifications every 5 mins
      setInterval(() => { this.findNewNotifications() }, 1000 * 60 * 5)
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
    if (!res.ok && res.status !== 404) {
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
          page: 1,
          perPage: 50,
          sort: 'TRENDING_DESC',
          status_in: '[CURRENT,PLANNING,COMPLETED,DROPPED,PAUSED,REPEATING]',
          ...variables
        }
      })
    }
    if (variables?.token) options.headers.Authorization = variables.token
    else if (alToken?.token) options.headers.Authorization = alToken.token

    return this.handleRequest(options)
  }

  async alSearch (method) {
    const res = await this.searchName(method)
    const media = res.data.Page.media.map(media => getDistanceFromTitle(media, method.name))
    if (!media.length) return null
    return media.reduce((prev, curr) => prev.lavenshtein <= curr.lavenshtein ? prev : curr)
  }

  async findNewNotifications () {
    debug('Checking for new notifications')
    const res = await this.getNotifications()
    const notifications = res.data.Page.notifications
    const newNotifications = notifications.filter(({ createdAt }) => createdAt > this.lastNotificationDate)
    this.lastNotificationDate = Date.now() / 1000
    debug(`Found ${newNotifications?.length} new notifications`)
    for (const { media, episode, type } of newNotifications) {
      const options = {
        title: media.title.userPreferred,
        body: type === 'AIRING' ? `Episode ${episode} is out in Japan, it should be available soon.` : 'Was recently added to AniList.',
        icon: media.coverImage.medium,
        data: { id: media.id }
      }
      IPC.emit('notification', options)
    }
  }

  /**
   * @param {{key: string, title: string, year?: string, isAdult: boolean}[]} flattenedTitles
   **/
  async alSearchCompound (flattenedTitles) {
    debug(`Searching for ${flattenedTitles?.length} titles via compound search`)
    if (!flattenedTitles.length) return []
    // isAdult doesn't need an extra variable, as the title is the same regardless of type, so we re-use the same variable for adult and non-adult requests
    /** @type {Record<`v${number}`, string>} */
    const requestVariables = flattenedTitles.reduce((obj, { title, isAdult }, i) => {
      if (isAdult && i !== 0) return obj
      obj[`v${i}`] = title
      return obj
    }, {})

    const queryVariables = flattenedTitles.reduce((arr, { isAdult }, i) => {
      if (isAdult && i !== 0) return arr
      arr.push(`$v${i}: String`)
      return arr
    }, []).join(', ')
    const fragmentQueries = flattenedTitles.map(({ year, isAdult }, i) => /* js */`
    v${i}: Page(perPage: 10) {
      media(type: ANIME, search: $v${(isAdult && i !== 0) ? i - 1 : i}, status_in: [RELEASING, FINISHED], isAdult: ${!!isAdult} ${year ? `, seasonYear: ${year}` : ''}) {
        ...med
      }
    }`)

    const query = /* js */`
    query(${queryVariables}) {
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

  async alEntry (lists, variables) {
    if (!lists.includes('Watched using Miru')) {
      variables.lists.push('Watched using Miru')
    }
    return await this.entry(variables)
  }

  async searchName (variables = {}) {
    debug(`Searching name for ${variables?.name}`)
    const query = /* js */` 
    query($page: Int, $perPage: Int, $sort: [MediaSort], $name: String, $status: [MediaStatus], $year: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        },
        media(type: ANIME, search: $name, sort: $sort, status_in: $status, isAdult: $isAdult, format_not: MUSIC, seasonYear: $year) {
          ${queryObjects}
        }
      }
    }`

    variables.isAdult = variables.isAdult ?? false

    /** @type {import('./al.d.ts').PagedQuery<{media: import('./al.d.ts').Media[]}>} */
    const res = await this.alRequest(query, variables)
    await this.updateCache(res.data.Page.media)

    return res
  }

  async searchIDSingle (variables) {
    debug(`Searching for ID: ${variables?.id}`)
    const query = /* js */` 
    query($id: Int) { 
      Media(id: $id, type: ANIME) {
        ${queryObjects}
      }
    }`

    /** @type {import('./al.d.ts').Query<{Media: import('./al.d.ts').Media}>} */
    const res = await this.alRequest(query, variables)

    await this.updateCache([res.data.Media])

    return res
  }

  async searchIDS (variables) {
    debug(`Searching for IDs: ${variables?.id?.length || variables?.idMal?.length}`)
    const query = /* js */` 
    query($id: [Int], $idMal: [Int], $id_not: [Int], $page: Int, $perPage: Int, $status: [MediaStatus], $onList: Boolean, $sort: [MediaSort], $search: String, $season: MediaSeason, $year: Int, $genre: [String], $tag: [String], $format: MediaFormat) { 
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        },
        media(id_in: $id, idMal_in: $idMal, id_not_in: $id_not, type: ANIME, status_in: $status, onList: $onList, search: $search, sort: $sort, season: $season, seasonYear: $year, genre_in: $genre, tag_in: $tag, format: $format) {
          ${queryObjects}
        }
      }
    }`

    /** @type {import('./al.d.ts').PagedQuery<{media: import('./al.d.ts').Media[]}>} */
    const res = await this.alRequest(query, variables)

    await this.updateCache(res.data.Page.media)

    return res
  }

  /** @returns {Promise<import('./al.d.ts').PagedQuery<{ notifications: { id: number, type: string, createdAt: number, episode: number, media: import('./al.d.ts').Media}[] }>>} */
  getNotifications (variables = {}) {
    debug('Getting notifications')
    const query = /* js */`
    query($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        notifications(resetNotificationCount: false, type_in: [AIRING, RELATED_MEDIA_ADDITION]) {
          ...on&nbsp;AiringNotification {
            id,
            type,
            episode,
            createdAt,
            media {
              id,
              title {
                userPreferred
              },
              coverImage {
                medium
              }
            }
          },
          ...on&nbsp;RelatedMediaAdditionNotification {
            id,
            type,
            createdAt,
            media {
              id,
              title {
                userPreferred
              },
              coverImage {
                medium
              }
            }
          }
        }
      }
    }`

    return this.alRequest(query, variables)
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ Viewer: import('./al.d.ts').Viewer }>>} */
  viewer (variables = {}) {
    debug('Getting viewer')
    const query = /* js */` 
    query {
      Viewer {
        avatar {
          medium,
          large
        },
        name,
        id,
        mediaListOptions {
          animeList {
            customLists
          }
        }
      }
    }`

    return this.alRequest(query, variables)
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ MediaListCollection: import('./al.d.ts').MediaListCollection }>>} */
  async getUserLists (variables = {}) {
    debug('Getting user lists')
    variables.id = !variables.userID ? this.userID?.viewer?.data?.Viewer.id : variables.userID
    variables.sort = variables.sort?.replace('USER_SCORE_DESC', 'SCORE_DESC') || 'UPDATED_TIME_DESC' // doesn't exist, AniList uses SCORE_DESC for both MediaSort and MediaListSort.
    const query = /* js */` 
      query($id: Int, $sort: [MediaListSort]) {
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
    if (!variables.token) await this.updateCache(res.data.MediaListCollection.lists.flatMap(list => list.entries.map(entry => entry.media)))
    return res
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ MediaList: { status: string, progress: number, repeat: number }}>>} */
  async searchIDStatus (variables = {}) {
    variables.id = this.userID?.viewer?.data?.Viewer.id
    debug(`Searching for ID status: ${variables.id}`)
    const query = /* js */` 
      query($id: Int, $mediaId: Int) {
        MediaList(userId: $id, mediaId: $mediaId) {
          status,
          progress,
          repeat
        }
      }`

    return await this.alRequest(query, variables)
  }

  async searchAiringSchedule (variables = {}) {
    debug('Searching for airing schedule')
    variables.to = (variables.from + 7 * 24 * 60 * 60)
    const query = /* js */` 
    query($page: Int, $perPage: Int, $from: Int, $to: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        },
        airingSchedules(airingAt_greater: $from, airingAt_lesser: $to) {
          episode,
          timeUntilAiring,
          airingAt,
          media {
            ${queryObjects}
          }
        }
      }
    }`

    /** @type {import('./al.d.ts').PagedQuery<{ airingSchedules: { timeUntilAiring: number, airingAt: number, episode: number, media: import('./al.d.ts').Media}[]}>} */
    const res = await this.alRequest(query, variables)

    await this.updateCache(res.data.Page.airingSchedules?.map(({media}) => media))

    return res
  }

  /** @returns {Promise<import('./al.d.ts').PagedQuery<{ airingSchedules: { airingAt: number, episode: number }[]}>>} */
  episodes (variables = {}) {
    debug(`Searching for episodes: ${variables.id}`)
    const query = /* js */` 
      query($id: Int) {
        Page(page: 1, perPage: 1000) {
          airingSchedules(mediaId: $id) {
            airingAt,
            episode
          }
        }
      }`

    return this.alRequest(query, variables)
  }

  async search (variables = {}) {
    debug(`Searching ${JSON.stringify(variables)}`)
    const query = /* js */` 
    query($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $onList: Boolean, $status: MediaStatus, $status_not: MediaStatus, $season: MediaSeason, $year: Int, $genre: [String], $tag: [String], $format: MediaFormat, $id_not: [Int], $idMal_not: [Int], $idMal: [Int]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        },
        media(id_not_in: $id_not, idMal_not_in: $idMal_not, idMal_in: $idMal, type: ANIME, search: $search, sort: $sort, onList: $onList, status: $status, status_not: $status_not, season: $season, seasonYear: $year, genre_in: $genre, tag_in: $tag, format: $format, format_not: MUSIC) {
          ${queryObjects}
        }
      }
    }`

    /** @type {import('./al.d.ts').PagedQuery<{media: import('./al.d.ts').Media[]}>} */
    const res = await this.alRequest(query, variables)

    await this.updateCache(res.data.Page.media)

    return res
  }

  /** @returns {Promise<import('./al.d.ts').Query<{ AiringSchedule: { airingAt: number }}>>} */
  episodeDate (variables) {
    debug(`Searching for episode date: ${variables.id}, ${variables.ep}`)
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
    debug('Getting following')
    const query = /* js */`
      query($id: Int) {
        Page {
          mediaList(mediaId: $id, isFollowing: true, sort: UPDATED_TIME_DESC) {
            status,
            score,
            user {
              name,
              avatar {
                medium
              }
            }
          }
        }
      }`

    return this.alRequest(query, variables)
  }

  /** @returns {Promise<import('./al.d.ts').Query<{Media: import('./al.d.ts').Media}>>} */
  recommendations (variables) {
    debug(`Getting recommendations for ${variables.id}`)
    const query = /* js */` 
      query($id: Int) {
        Media(id: $id, type: ANIME) {
          id,
          idMal,
          studios(sort: NAME, isMain: true) {
            nodes {
              name
            }
          },
          recommendations {
            edges {
              node {
                rating,
                mediaRecommendation {
                  id
                }
              }
            }
          }
        }
      }`

    return this.alRequest(query, variables)
  }

  async entry (variables) {
    debug(`Updating entry for ${variables.id}`)
    const query = /* js */`
      mutation($lists: [String], $id: Int, $status: MediaListStatus, $episode: Int, $repeat: Int, $score: Int, $startedAt: FuzzyDateInput, $completedAt: FuzzyDateInput) {
        SaveMediaListEntry(mediaId: $id, status: $status, progress: $episode, repeat: $repeat, scoreRaw: $score, customLists: $lists, startedAt: $startedAt, completedAt: $completedAt) {
          id,
          status,
          progress,
          score,
          repeat,
          startedAt {
            year,
            month,
            day
          },
          completedAt {
            year,
            month,
            day
          }
        }
      }`

    const res = await this.alRequest(query, variables)
    if (!variables.token) this.userLists.value = this.getUserLists({sort: 'UPDATED_TIME_DESC'})
    return res
  }

  async delete (variables) {
    debug(`Deleting entry for ${variables.id}`)
    const query = /* js */`
      mutation($id: Int) {
        DeleteMediaListEntry(id: $id) {
          deleted
        }
      }`
    const res = await this.alRequest(query, variables)
    if (!variables.token) this.userLists.value = this.getUserLists({sort: 'UPDATED_TIME_DESC'})
    return res
  }

  favourite (variables) {
    debug(`Toggling favourite for ${variables.id}`)
    const query = /* js */`
      mutation($id: Int) {
        ToggleFavourite(animeId: $id) { anime { nodes { id } } } 
      }`

    return this.alRequest(query, variables)
  }

  customList (variables = {}) {
    debug('Updating custom list')
    variables.lists = [...variables.lists, 'Watched using Miru']
    const query = /* js */`
      mutation($lists: [String]) {
        UpdateUser(animeListOptions: { customLists: $lists }) {
          id
        }
      }`

    return this.alRequest(query, variables)
  }

  /** @param {import('./al.d.ts').Media} media */
  title(media) {
    const preferredTitle = media?.title.userPreferred
    if (alToken) {
      return preferredTitle
    }

    if (settings.value.titleLang === 'romaji') {
      return media?.title.romaji || preferredTitle
    } else {
      return media?.title.english || preferredTitle
    }
  }

  /** @param {import('./al.d.ts').Media} media */
  reviews(media) {
    const totalReviewers = media.stats?.scoreDistribution?.reduce((total, score) => total + score.amount, 0)
    return media.averageScore && totalReviewers ? totalReviewers.toLocaleString() : '?'
  }

  /** @param {import('./al.d.ts').Media[]} medias */
  async updateCache (medias) {
    for (const media of medias) {
      if (!alToken) {
        // attach any alternative authorization userList information
        await Helper.fillEntry(media)
      }
      // Update the cache
      this.mediaCache[media.id] = media
    }
  }
}

export const anilistClient = new AnilistClient()
