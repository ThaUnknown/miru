import lavenshtein from 'js-levenshtein'
import Bottleneck from 'bottleneck'

import { malToken } from '@/modules/settings.js'
import {toast} from 'svelte-sonner'
import {sleep} from './util.js'
import Debug from 'debug'

const debug = Debug('ui:myanimelist')

const codes = {
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
  debug(`Error: ${error.status || 429} - ${error.message || codes[error.status || 429]}`)
  toast.error('Search Failed', {
    description: `Failed making request to MyAnimeList!\nTry again in a minute.\n${error.status || 429} - ${error.message || codes[error.status || 429]}`,
    duration: 3000
  })
}
class MyAnimeListClient {
  limiter = new Bottleneck({
    reservoir: 90,
    reservoirRefreshAmount: 90,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 10,
    minTime: 100
  })

  rateLimitPromise = null

  // TODO: This is a hack to get around the fact that the token is not initialized
  // TODO: figure out why malToken is accessed before being initialized
  userID = JSON.parse(localStorage.getItem('MALviewer')) || null

  /** @type {{code_challenge: string, code_verifier: string}} */
  challenge = {}

  /** @type {string} */
  oauth2_state = ''
  
  anilistStatusToMal = {
    CURRENT: 'watching',
    PLANNING: 'plan_to_watch',
    COMPLETED: 'completed',
    PAUSED: 'on_hold',
    DROPPED: 'dropped'
  }

  constructor () {
    debug('Initializing MyAnimeList Client for ID ' + this.userID?.viewer)
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
  }

  viewer () {
    debug('Getting viewer')
    
    const params = new URLSearchParams()
    params.set('fields', 'id,name,picture')
    const options = {
      url: `https://api.myanimelist.net/v2/users/@me?${params}`,
      method: 'GET'
    }
    return this.handleRequest(options)
  }

  /** @type {(options: RequestInit) => Promise<any>} */
  handleRequest = this.limiter.wrap(async opts => {
    opts.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Bearer ${malToken.token}`
    }
    await this.rateLimitPromise
    let res = {}
    const url = opts.url
    // if no url is set generate an error
    if (!url) throw new Error('No URL set for request')
    try {
      delete opts.url
      res = await fetch(url, opts)
    } catch (e) {
      if (!res || (res.status !== 404 && res.status !== 401)) throw e
    }
    // invalid token
    if (!res.ok && res.status === 401) {
      // refresh token
      await myAnimeListClient.refreshToken()
      opts.url = url
      return this.handleRequest(opts)
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


  async malEntry (filemedia) {
    // check if values exist
    console.log(filemedia)
    console.log(malToken)
    if (filemedia.media && malToken) {
      const {media, failed} = filemedia
      debug(`Checking entry for ${media.title.userPreferred}`)
      debug(`Media viability: ${media.status}, Is from failed resolve: ${failed}`)

      console.log(media)
      
      if (failed) return
      if (media.status !== 'FINISHED' && media.status !== 'RELEASING') return

      // check if media can even be watched, ex: it was resolved incorrectly
      // some anime/OVA's can have a single episode, or some movies can have multiple episodes
      const singleEpisode = ((!media.episodes && (Number(filemedia.episode) === 1 || isNaN(Number(filemedia.episode)))) || (media.format === 'MOVIE' && media.episodes === 1)) && 1 // movie check
      const videoEpisode = Number(filemedia.episode) || singleEpisode
      const mediaEpisode = media.episodes || media.nextAiringEpisode?.episode || singleEpisode

      debug(`Episode viability: ${videoEpisode}, ${mediaEpisode}, ${singleEpisode}`)
      if (!videoEpisode || !mediaEpisode) return
      // check episode range, safety check if `failed` didn't catch this
      if (videoEpisode > mediaEpisode) return

      const lists = media.mediaListEntry?.customLists.filter(list => list.enabled).map(list => list.name) || []

      const status = media.mediaListEntry?.status === 'REPEATING' ? 'REPEATING' : 'CURRENT'
      const progress = media.mediaListEntry?.progress

      debug(`User's progress: ${progress}, Media's progress: ${videoEpisode}`)
      // check user's own watch progress
      if (progress > videoEpisode) return
      if (progress === videoEpisode && videoEpisode !== mediaEpisode && !singleEpisode) return

      debug(`Updating entry for ${media.title.userPreferred}`)
      const variables = {
        repeat: media.mediaListEntry?.repeat || 0,
        id: media.id,
        status,
        episode: videoEpisode,
        title: media.title,
        lists
      }
      if (videoEpisode === mediaEpisode) {
        variables.status = 'COMPLETED'
        if (media.mediaListEntry?.status === 'REPEATING') variables.repeat = media.mediaListEntry.repeat + 1
      }
      if (!lists.includes('Watched using Miru')) {
        variables.lists.push('Watched using Miru')
      }
      if (media.idMal) {
        variables.idMal = media.idMal
      }
      await this.entry(variables)
    }
  }

  async entry (variables) {
    debug(`Updating entry for ${variables.id}`)
    console.log(`Updating entry for ${variables.id}`)
    
    console.log(variables)
    
    // if we don't have a MAL ID, we need to get it
    await this.addMalId(variables)
    
    const options = {
      url: 'https://api.myanimelist.net/v2/anime/' + variables.idMal + '/my_list_status',
      method: 'PATCH',
      body: new URLSearchParams({
        status: this.anilistStatusToMal[variables.status],
        num_watched_episodes: variables.episode
      }).toString()
    }

    console.log("Options: ")
    console.log(options)
    return this.handleRequest(options)
  }

  /** generates a PKCE challenge */
  async generateChallenge() {
    const code_verifier = this.random(128)
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code_verifier))
    const code_challenge = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    this.challenge = { code_challenge, code_verifier }
  }

  random(size) {
    const mask =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
    let result = "";
    const randomUints = this.getRandomValues(size);
    for (let i = 0; i < size; i++) {
      // cap the value of the randomIndex to mask.length - 1
      const randomIndex = randomUints[i] % mask.length;
      result += mask[randomIndex];
    }
    return result;
  }

  getRandomValues(size) {
    return crypto.getRandomValues(new Uint8Array(size));
  }

  // TODO: untested but should work
  async refreshToken() {
    if (malToken?.refresh_token) {
      const res = await fetch('https://myanimelist.net/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=4e775f7b91ab35a806321856bad911ca&grant_type=refresh_token&refresh_token=${malToken.refresh_token}`
      })
      if (res.ok) {
        const json = await res.json()
        malToken.token = json.access_token
        malToken.refresh_token = json.refresh_token
        localStorage.setItem('MALviewer', JSON.stringify(malToken))
      }
    }
  }

  // TODO: this might need a lot of improving to go around edge cases
  // TODO: let's hope users will report errors so we can fix them :)
  normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/\b1st\b/g, '')
      .replace(/\b2nd\b/g, '2')
      .replace(/\b3rd\b/g, '3')
      .replace(/\b(\d)th\b/g, '$1')
      .replace(/\b(\d+)\s+season\b/g, '$1');
  }
  
  // TODO: add a way for a user to manually correct this
  /** @param {import('./al.d.ts').Media} media */
  async addMalId(media) {
    if (!this.userID || media.idMal) return media
    
    const params = new URLSearchParams()
    // MAL prefers the romaji title, but if it doesn't exist for some odd reason, we can use the native or english title
    const normalizedRomajiTitle = this.normalizeTitle(media.title.romaji || media.title.native || media.title.english);
    params.set('q', normalizedRomajiTitle);
    
    const options = {
        url: `https://api.myanimelist.net/v2/anime?${params}`,
        method: 'GET',
    }
    
    let res = await this.handleRequest(options)

    if (res.data) {
      // Go over the data to see if we have an exact match
      let node = null
      let bestMatch = 10 // we don't want to set this too high, as we want to discard any matches that are too far off
      // TODO: if there are discrepancies with 2nd vs second, we should probably replace the numbers with their word equivalent
      // TODO: or vice versa. This is a very edge case, but it's worth considering, but I cbf to do it right now
      for (const data of res.data) {
        const normalizedTitle = this.normalizeTitle(data.node.title);
        
        if (normalizedTitle === normalizedRomajiTitle) {
          node = data.node
          bestMatch = 0
          break
        }
        else {
          const distance = lavenshtein(normalizedTitle, normalizedRomajiTitle);
          if (distance < bestMatch) {
            node = data.node
            bestMatch = distance
          }
        }
      }

      if (!node) {
        console.log(`Could not find a match for '${media.title.romaji}'`)
        return media
      }
      media.idMal = node.id
      console.log(`Added MAL ID ${media.idMal} (${node.title}) to '${media.title.romaji}' with AL ID ${media.id} and distance ${bestMatch}`)
    }
    
    return media
  }
}

export const myAnimeListClient = new MyAnimeListClient()
