import { writable } from 'simple-store-svelte'

import { malToken, refreshMalToken } from '@/modules/settings.js'
import { codes } from "@/modules/anilist";
import { toast } from 'svelte-sonner'
import Helper from '@/modules/helper.js'

export const clientID = '4c2c172971b9164f924fd5925b443ac3' // app type MUST be set to other, do not generate a seed.

function printError (error) {
  console.warn(error)
  toast.error('Search Failed', {
    description: `Failed making request to MyAnimeList!\nTry again in a minute.\n${error.status || 429} - ${error.message || codes[error.status || 429]}`,
    duration: 3000
  })
}

const queryFields =  [
  'synopsis',
  'alternative_titles',
  'mean',
  'rank',
  'popularity',
  'num_list_users',
  'num_scoring_users',
  'related_anime',
  'media_type',
  'num_episodes',
  'status',
  'my_list_status',
  'start_date',
  'end_date',
  'start_season',
  'broadcast',
  'studios',
  'authors{first_name,last_name}',
  'source',
  'genres',
  'average_episode_duration',
  'rating'
]

class MALClient {
  /** @type {import('simple-store-svelte').Writable<ReturnType<MALClient['getUserLists']>>} */
  userLists = writable()

  userID = malToken

  constructor () {
    if (this.userID?.viewer?.data?.Viewer) {
      this.userLists.value = this.getUserLists({ sort: 'list_updated_at' })
      //  update userLists every 15 mins
      setInterval(() => {
        this.userLists.value = this.getUserLists({ sort: 'list_updated_at' })
      }, 1000 * 60 * 15)
    }
  }

  /**
   * @param {Record<string, any>} query
   * @param {Record<string, any>} body
   * @returns {Promise<import('./mal').Query<any>>}
   */
  malRequest (query, body = {}) {
    /** @type {RequestInit} */
    const options = {
      method: `${query.type}`,
      headers: {
        'Authorization': `Bearer ${query.token ? query.token : this.userID.token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    if (Object.keys(body).length > 0) {
      options.body = new URLSearchParams(body)
    }
    return this.handleRequest(query, options)
  }

  /**
   * @param {Record<string, any>} query
   * @param {Record<string, any>} options
   * @returns {Promise<import('./mal').Query<any>>}
   */
  async handleRequest (query, options) {
    let res = {}
    try {
      res = await fetch(`https://api.myanimelist.net/v2/${query.path}`, options)
    } catch (e) {
      if (res && res && res.status !== 404) {
        switch (res.error) {
          case 'forbidden':
          case 'invalid_token':
            if (await refreshMalToken()) { // refresh authorization token as it typically expires every 31 days.
              return this.handleRequest(query, options);
            }
            throw new Error("NotAuthenticatedError: " + res.message ?? res.error);
          case 'invalid_content':
            throw new Error(`This Entry is currently pending approval. It can't be saved to mal for now`);
          default:
            throw new Error(res.message ?? res.error);
        }
      } else if (!res || res.status !== 404) {
        throw e
      }
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
  }

  async malEntry (media, variables) {
    variables.idMal = media.idMal
    const res = await malClient.entry(variables)
    media.mediaListEntry = res.data.SaveMediaListEntry
    return res
  }

  /** @returns {Promise<import('./mal').Query<{ MediaList: import('./mal').MediaList }>>} */
  async getUserLists (variables) {
    const limit = 1000 // max possible you can fetch
    let offset = 0
    let allMediaList = []
    let hasNextPage = true

    // Check and replace specific sort values
    const customSorts = ['list_start_date_nan', 'list_finish_date_nan', 'list_progress_nan']
    if (customSorts.includes(variables.sort)) {
      variables.originalSort = variables.sort
      variables.sort = 'list_updated_at'
    }

    while (hasNextPage) {
      const query = {
        type: 'GET',
        path: `users/@me/animelist?fields=${queryFields}&nsfw=true&limit=${limit}&offset=${offset}&sort=${variables.sort}`
      }

      const res = await this.malRequest(query)
      allMediaList = allMediaList.concat(res.data)

      if (res.data.length < limit) {
        hasNextPage = false
      } else {
        offset += limit
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay to prevent too many consecutive requests ip block.
      }
    }

    // Custom sorting based on original variables.sort value
    if (variables.originalSort === 'list_start_date_nan') {
      allMediaList.sort((a, b) => {
        return new Date(b.node.my_list_status.start_date) - new Date(a.node.my_list_status.start_date);
      });
    } else if (variables.originalSort === 'list_finish_date_nan') {
      allMediaList.sort((a, b) => {
        return new Date(b.node.my_list_status.finish_date) - new Date(a.node.my_list_status.finish_date);
      });
    } else if (variables.originalSort === 'list_progress_nan') {
      allMediaList.sort((a, b) => {
        return b.node.my_list_status.num_episodes_watched - a.node.my_list_status.num_episodes_watched
      })
    }

    return {
      data: {
        MediaList: allMediaList
      }
    }
  }

  /** @returns {Promise<import('./mal').Query<{ Viewer: import('./mal').Viewer }>>} */
  async viewer (token) {
    const query = {
      type: 'GET',
      path: 'users/@me',
      token
    }
    return {
      data: {
        Viewer: await this.malRequest(query)
      }
    }
  }

  async entry (variables) {
    const query = {
      type: 'PUT',
      path: `anime/${variables.idMal}/my_list_status`
    }
    const padNumber = (num) => num !== undefined && num !== null ? String(num).padStart(2, '0') : null;
    const start_date = variables.startedAt?.year && variables.startedAt.month && variables.startedAt.day ? `${variables.startedAt.year}-${padNumber(variables.startedAt.month)}-${padNumber(variables.startedAt.day)}` : null
    const finish_date = variables.completedAt?.year && variables.completedAt.month && variables.completedAt.day ? `${variables.completedAt.year}-${padNumber(variables.completedAt.month)}-${padNumber(variables.completedAt.day)}` : null
    const updateData = {
      status: Helper.statusMap(variables.status),
      is_rewatching: variables.status?.includes('REPEATING'),
      num_watched_episodes: variables.episode || 0,
      num_times_rewatched: variables.repeat || 0,
      score: variables.score || 0
    }
    if (start_date) {
      updateData.start_date = start_date
    }
    if (finish_date) {
      updateData.finish_date = finish_date
    }
    const res = await this.malRequest(query, updateData)
    this.userLists.value = this.getUserLists({ sort: 'list_updated_at' })

    return res ? {
      data: {
        SaveMediaListEntry: {
          id: variables.id,
          status: variables.status,
          progress: variables.episode,
          score: variables.score,
          repeat: variables.repeat,
          startedAt: variables.startedAt,
          completedAt: variables.completedAt,
          customLists: []
        }
      }
    } : res
  }

  async delete (variables) {
    const query = {
      type: 'DELETE',
      path: `anime/${variables.idMal}/my_list_status`
    }
    const res = await this.malRequest(query)
    this.userLists.value = this.getUserLists({ sort: 'list_updated_at' })
    return res
  }
}

export const malClient = new MALClient()
