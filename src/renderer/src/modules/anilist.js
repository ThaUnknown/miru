import { alToken } from '@/lib/pages/Settings.svelte'

export const alID =
  !!alToken &&
  alRequest({ method: 'Viewer', token: alToken })

async function handleRequest (opts) {
  return await fetch('https://graphql.anilist.co', opts).then(async res => {
    const json = await res.json()
    if (!res.ok) {
      for (const error of json.errors) {
        // halfmoon.initStickyAlert({
        //   content: `Failed making request to anilist!<br>${error.status} - ${error.message}`,
        //   title: 'Search Failed',
        //   alertType: 'alert-danger',
        //   fillType: ''
        // })
        console.error(error)
      }
    }
    return json
  })
}

export function alEntry (filemedia) {
  if (filemedia.media && alToken) {
    alRequest({ method: 'SearchIDStatus', id: filemedia.media.id }).then(res => {
      if ((res.errors && res.errors[0].status === 404) || res.data.MediaList.progress <= filemedia.episodeNumber || filemedia.episodes === 1) {
        const query = `
mutation ($id: Int, $status: MediaListStatus, $episode: Int, $repeat: Int) {
  SaveMediaListEntry (mediaId: $id, status: $status, progress: $episode, repeat: $repeat) {
    id,
    status,
    progress,
    repeat
  }
}`
        const variables = {
          repeat: 0,
          id: filemedia.media.id,
          status: 'CURRENT',
          episode: filemedia.episodeNumber || 1
        }
        if (filemedia.episodeNumber === filemedia.media.episodes || filemedia.episodes === 1) {
          variables.status = 'COMPLETED'
          if (res.data.MediaList.status === 'COMPLETED') {
            variables.repeat = res.data.MediaList.repeat + 1
          }
        }
        const options = {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + alToken,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            query: query,
            variables: variables
          })
        }
        handleRequest(options)
      }
    })
  }
}

export async function alRequest (opts) {
  let query
  const variables = {
    type: 'ANIME',
    sort: opts.sort || 'TRENDING_DESC',
    page: opts.page || 1,
    perPage: opts.perPage || 30,
    status_in: opts.status_in || '[CURRENT,PLANNING]',
    chunk: opts.chunk || 1,
    perchunk: opts.perChunk || 30
  }
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }
  const queryObjects = `
id,
title {
  romaji,
  english,
  native,
  userPreferred
},
description(
  asHtml: true
),
season,
seasonYear,
format,
status,
episodes,
duration,
averageScore,
genres,
coverImage {
  extraLarge,
  medium,
  color
},
countryOfOrigin,
isAdult,
bannerImage,
synonyms,
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
  progress
},
source,
studios(isMain: true) {
  nodes {
    name
  }
},
relations {
  edges {
    relationType(version:2)
    node {
      id,
      title {
        userPreferred
      },
      coverImage {
        medium
      },
      type,
      status,
      format,
      episodes
    }
  }
}`
  if (opts.status) variables.status = opts.status
  if (localStorage.getItem('ALtoken')) options.headers.Authorization = localStorage.getItem('ALtoken')
  switch (opts.method) {
    case 'SearchName': {
      variables.search = opts.name
      query = ` 
query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $search: String, $status: [MediaStatus]) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    },
    media(type: $type, search: $search, sort: $sort, status_in: $status, isAdult: false) {
      ${queryObjects}
    }
  }
}`
      break
    } case 'SearchIDSingle': {
      variables.id = opts.id
      query = ` 
query ($id: Int, $type: MediaType) { 
  Media (id: $id, type: $type) {
    ${queryObjects}
  }
}`
      break
    } case 'SearchIDS': {
      variables.id = opts.id
      query = ` 
query ($id: [Int], $type: MediaType, $page: Int, $perPage: Int) { 
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    },
    media (id_in: $id, type: $type) {
      ${queryObjects}
    }
  }
}`
      break
    } case 'Viewer': {
      variables.id = alToken
      query = ` 
query {
  Viewer {
    avatar {
      medium
    },
    name,
    id
  }
}`
      break
    } case 'UserLists': {
      variables.id = (await alID).data.Viewer.id
      query = ` 
query ($page: Int, $perPage: Int, $id: Int, $type: MediaType, $status_in: [MediaListStatus]){
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    },
    mediaList (userId: $id, type: $type, status_in: $status_in) {
      media {
        ${queryObjects}
      }
    }
  }
}`
      break
    } case 'SearchIDStatus': {
      variables.id = (await alID).data.Viewer.id
      variables.mediaId = opts.id
      query = ` 
query ($id: Int, $mediaId: Int){
  MediaList(userId: $id, mediaId: $mediaId) {
    status,
    progress,
    repeat
  }
}`
      break
    } case 'AiringSchedule': {
      const date = new Date()
      const diff = date.getDay() >= 1 ? date.getDay() - 1 : 6 - date.getDay()
      date.setDate(date.getDate() - diff)
      date.setHours(0, 0, 0, 0)
      variables.from = date.getTime() / 1000
      variables.to = (date.getTime() + 7 * 24 * 60 * 60 * 1000) / 1000
      query = ` 
query ($page: Int, $perPage: Int, $from: Int, $to: Int) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    },
    airingSchedules(airingAt_greater: $from, airingAt_lesser: $to) {
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
    } case 'Search': {
      variables.genre = opts.genre
      variables.search = opts.search
      variables.year = opts.year
      variables.season = opts.season
      variables.format = opts.format
      variables.status = opts.status
      variables.sort = opts.sort || 'SEARCH_MATCH'
      query = ` 
query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $search: String, $status: MediaStatus, $season: MediaSeason, $year: Int, $genre: String, $format: MediaFormat) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    },
    media(type: $type, search: $search, sort: $sort, status: $status, season: $season, seasonYear: $year, genre: $genre, format: $format, isAdult: false) {
      ${queryObjects}
    }
  }
}`
    }
  }
  options.body = JSON.stringify({
    query: query.replace(/\s/g, ''),
    variables: variables
  })

  return await handleRequest(options)
}
