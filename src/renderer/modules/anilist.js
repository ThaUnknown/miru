import lavenshtein from 'js-levenshtein'
import { writable } from 'simple-store-svelte'
import Bottleneck from 'bottleneck'

import { alToken } from '../views/Settings.svelte'
import { toast } from 'svelte-sonner'
import { sleep } from './util.js'

const codes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a teapot',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Unordered Collection',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
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

const limiter = new Bottleneck({
  reservoir: 90,
  reservoirRefreshAmount: 90,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 10,
  minTime: 100
})

let rl = null

limiter.on('failed', async (error, jobInfo) => {
  printError(error)

  if (!error.statusText) {
    if (!rl) rl = sleep(61 * 1000).then(() => { rl = null })
    return 61 * 1000
  }
  const time = ((error.headers.get('retry-after') || 60) + 1) * 1000
  if (!rl) rl = sleep(time).then(() => { rl = null })
  return time
})

const handleRequest = limiter.wrap(async opts => {
  await rl
  let res = {}
  try {
    res = await fetch('https://graphql.anilist.co', opts)
  } catch (e) {
    if (!res || res.status !== 404) throw e
  }
  if (!res.ok && res.status === 429) {
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

export let alID = null
if (alToken) {
  alID = alRequest({ method: 'Viewer', token: alToken }).then(result => {
    const lists = result?.data?.Viewer?.mediaListOptions?.animeList?.customLists || []
    if (!lists.includes('Watched using Miru')) {
      alRequest({ method: 'CustomList', lists })
    }
    return result
  })
}

function printError (error) {
  console.warn(error)
  toast.error('Search Failed', {
    description: `Failed making request to anilist!\nTry again in a minute.\n${error.status || 429} - ${error.message || codes[error.status || 429]}`,
    duration: 3000
  })
}

export async function alEntry (filemedia) {
  // check if values exist
  if (filemedia.media && alToken) {
    const { media } = filemedia
    // check if media can even be watched, ex: it was resolved incorrectly
    if (media.status === 'FINISHED' || media.status === 'RELEASING') {
      // some anime/OVA's can have a single episode, or some movies can have multiple episodes
      const singleEpisode = (!media.episodes || (media.format === 'MOVIE' && media.episodes === 1)) && 1
      const videoEpisode = Number(filemedia.episode) || singleEpisode
      const mediaEpisode = media.episodes || media.nextAiringEpisode?.episode || singleEpisode
      // check episode range
      if (videoEpisode && mediaEpisode && (mediaEpisode >= videoEpisode)) {
        // check user's own watch progress
        const lists = media.mediaListEntry?.customLists.filter(list => list.enabled).map(list => list.name) || []

        const status = media.mediaListEntry?.status === 'REPEATING' ? 'REPEATING' : 'CURRENT'

        if (!media.mediaListEntry || (media.mediaListEntry?.progress <= videoEpisode) || singleEpisode) {
          const variables = {
            method: 'Entry',
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
          await alRequest(variables)
          userLists.value = alRequest({ method: 'UserLists' })
        }
      }
    }
  }
}

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

export async function alSearch (method) {
  const res = await alRequest(method)
  const media = res.data.Page.media.map(media => getDistanceFromTitle(media, method.name))
  if (!media.length) return res
  const lowest = media.reduce((prev, curr) => prev.lavenshtein <= curr.lavenshtein ? prev : curr)
  return { data: { Page: { media: [lowest] } } }
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
isFavourite,
coverImage{
  extraLarge,
  medium,
  color
},
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
source,
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
},
recommendations{
  edges{
    node{
      mediaRecommendation{
        id,
        title{
          userPreferred
        },
        coverImage{
          medium
        }
      }
    }
  }
}`

export async function alRequest (opts) {
  let query
  const variables = {
    ...opts,
    sort: opts.sort || 'TRENDING_DESC',
    page: opts.page || 1,
    perPage: opts.perPage || 30,
    status_in: opts.status_in || '[CURRENT,PLANNING]'
  }
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }
  if (alToken) options.headers.Authorization = alToken
  switch (opts.method) {
    case 'SearchName': {
      variables.search = opts.name
      variables.isAdult = variables.isAdult ?? false
      query = /* js */` 
query($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $status: [MediaStatus], $year: Int, $isAdult: Boolean){
  Page(page: $page, perPage: $perPage){
    pageInfo{
      hasNextPage
    },
    media(type: ANIME, search: $search, sort: $sort, status_in: $status, isAdult: $isAdult, format_not: MUSIC, seasonYear: $year){
      ${queryObjects}
    }
  }
}`
      break
    } case 'SearchIDSingle': {
      query = /* js */` 
query($id: Int){ 
  Media(id: $id, type: ANIME){
    ${queryObjects}
  }
}`
      break
    } case 'SearchIDS': {
      query = /* js */` 
query($id: [Int], $page: Int, $perPage: Int, $status: [MediaStatus], $onList: Boolean, $sort: [MediaSort], $search: String, $season: MediaSeason, $year: Int, $genre: String, $format: MediaFormat){ 
  Page(page: $page, perPage: $perPage){
    pageInfo{
      hasNextPage
    },
    media(id_in: $id, type: ANIME, status_in: $status, onList: $onList, search: $search, sort: $sort, season: $season, seasonYear: $year, genre: $genre, format: $format){
      ${queryObjects}
    }
  }
}`
      break
    } case 'Viewer': {
      variables.id = alToken
      query = /* js */` 
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
      break
    } case 'UserLists': {
      const userId = (await alID)?.data?.Viewer.id
      variables.id = userId
      query = /* js */` 
query($id: Int){
  MediaListCollection(userId: $id, type: ANIME, forceSingleCompletedList: true) {
    lists {
      status,
      entries {
        media {
          id,
          status,
          mediaListEntry {
            progress
          },
          nextAiringEpisode {
            episode
          },
          relations {
            edges {
              relationType(version:2)
              node {
                id
              }
            }
          }
        }
      }
    }
  }
}`
      break
    } case 'SearchIDStatus': {
      const userId = (await alID)?.data?.Viewer.id
      variables.id = userId
      variables.mediaId = opts.id
      query = /* js */` 
query($id: Int, $mediaId: Int){
  MediaList(userId: $id, mediaId: $mediaId){
    status,
    progress,
    repeat
  }
}`
      break
    } case 'AiringSchedule': {
      variables.to = (variables.from + 7 * 24 * 60 * 60)
      query = /* js */` 
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
      break
    } case 'Episodes': {
      query = /* js */` 
query($id: Int){
  Page(page: 1, perPage: 1000){
    airingSchedules(mediaId: $id){
      airingAt,
      episode
    }
  }
}`
      break
    } case 'Search': {
      variables.sort = opts.sort || 'SEARCH_MATCH'
      query = /* js */` 
query($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $onList: Boolean, $status: MediaStatus, $season: MediaSeason, $year: Int, $genre: String, $format: MediaFormat){
  Page(page: $page, perPage: $perPage){
    pageInfo{
      hasNextPage
    },
    media(type: ANIME, search: $search, sort: $sort, onList: $onList, status: $status, season: $season, seasonYear: $year, genre: $genre, format: $format, format_not: MUSIC){
      ${queryObjects}
    }
  }
}`
      break
    } case 'Entry': {
      query = /* js */`
mutation($lists: [String], $id: Int, $status: MediaListStatus, $episode: Int, $repeat: Int, $score: Int){
  SaveMediaListEntry(mediaId: $id, status: $status, progress: $episode, repeat: $repeat, scoreRaw: $score, customLists: $lists){
    id,
    status,
    progress,
    repeat
  }
}`
      break
    } case 'EpisodeDate': {
      query = /* js */`
query($id: Int, $ep: Int) {
  AiringSchedule(mediaId: $id, episode: $ep) {
    airingAt
  }
}`
      break
    } case 'Delete': {
      query = /* js */`
mutation($id: Int){
  DeleteMediaListEntry(id: $id){
    deleted
  }
}`
      break
    } case 'Favourite': {
      query = /* js */`
mutation($id: Int){
  ToggleFavourite(animeId: $id){ anime { nodes { id } } } 
}`
      break
    } case 'Following': {
      query = /* js */`
query($id: Int){
  Page{
    pageInfo{
      total,
      perPage,
      currentPage,
      lastPage,
      hasNextPage
    },
    mediaList(mediaId: $id, isFollowing: true, sort: UPDATED_TIME_DESC){
      id,
      status,
      score,
      progress,
      user{
        id,
        name,
        avatar{
          medium
        },
        mediaListOptions{
          scoreFormat
        }
      }
    }
  }
}`
      break
    } case 'CustomList':{
      variables.lists = [...opts.lists, 'Watched using Miru']
      query = /* js */`
mutation($lists: [String]){
  UpdateUser(animeListOptions: { customLists: $lists }){
    id
  }
}`
      break
    }
  }
  options.body = JSON.stringify({
    query: query.replace(/\s/g, ''),
    variables
  })

  return handleRequest(options)
}

export const userLists = writable(alToken && alRequest({ method: 'UserLists' }))
