import { writable } from 'simple-store-svelte'
import { defaults } from './util.js'
import IPC from '@/modules/ipc.js'
import { anilistClient } from './anilist.js'
import {myAnimeListClient} from "@/modules/myanimelist";
import { toast } from 'svelte-sonner'
import Debug from 'debug'

const debug = Debug('ui:anilist')

/** @type {{viewer: import('./mal').Viewer, token: string, refresh_token: string} | null} */
export let malToken = JSON.parse(localStorage.getItem('MALviewer')) || null

/** @type {{viewer: import('./al').Query<{Viewer: import('./al').Viewer}>, token: string} | null} */
export let alToken = JSON.parse(localStorage.getItem('ALviewer')) || null

let storedSettings = { ...defaults }

let scopedDefaults

try {
  storedSettings = JSON.parse(localStorage.getItem('settings')) || { ...defaults }
} catch (e) {}
try {
  scopedDefaults = {
    homeSections: [...(storedSettings.rssFeedsNew || defaults.rssFeedsNew).map(([title]) => title), 'Continue Watching', 'Sequels You Missed', 'Your List', 'Popular This Season', 'Trending Now', 'All Time Popular', 'Romance', 'Action', 'Adventure', 'Fantasy', 'Comedy']
  }
} catch (e) {
  resetSettings()
  location.reload()
}

/**
 * @type {import('simple-store-svelte').Writable<typeof defaults>}
 */
export const settings = writable({ ...defaults, ...scopedDefaults, ...storedSettings })

settings.subscribe(value => {
  localStorage.setItem('settings', JSON.stringify(value))
})

export function resetSettings () {
  settings.value = { ...defaults, ...scopedDefaults }
}

window.addEventListener('paste', ({ clipboardData }) => {
  if (clipboardData.items?.[0]) {
    if (clipboardData.items[0].type === 'text/plain' && clipboardData.items[0].kind === 'string') {
      clipboardData.items[0].getAsString(text => {
        // Handle MyAnimeList OAuth2 1st stage (where we get the code)
        if (text.startsWith('miru://authmal/')) {
          const code = text.split('code=')?.[1]?.split('&state')?.[0]
          let state = text.split('state=')?.[1]
          // strip the state of possible trailing newlines (funny bug where it said the state was invalid, took a while to figure out)
          if (state?.endsWith('\n')) state = state.slice(0, -1)
          handleOAuth2(code, state)
          return
        }
        // AniList
        let token = text.split('access_token=')?.[1]?.split('&token_type')?.[0]
        if (token) {
          if (token.endsWith('/')) token = token.slice(0, -1)
          handleToken(token)
        }
      })
    }
  }
})
IPC.on('altoken', handleToken)
async function handleToken (token) {
  alToken = { token, viewer: null }
  const viewer = await anilistClient.viewer({ token })
  if (!viewer.data?.Viewer) {
    toast.error('Failed to sign in with AniList. Please try again.', { description: JSON.stringify(viewer) })
    debug(`Failed to sign in with AniList: ${JSON.stringify(viewer)}`)
    return
  }
  const lists = viewer?.data?.Viewer?.mediaListOptions?.animeList?.customLists || []
  if (!lists.includes('Watched using Miru')) {
    await anilistClient.customList({ lists })
  }
  localStorage.setItem('ALviewer', JSON.stringify({ token, viewer }))
  location.reload()
}

// Handle MyAnimeList OAuth2 2nd stage (where we exchange the code for a token)
// https://myanimelist.net/apiconfig/references/authorization
IPC.on('maloauth2', handleOAuth2)
async function handleOAuth2(code, state) {
  // Sometimes the oauth2_state is empty, because we already completed the auth and there is a weird bug
  // where it will do the request multiple times if you fail (i guess). It seems that the proto/clipboard handlers are
  // made every time you press the login button (maybe?), so it will do the request multiple times if you fail.
  if (state !== myAnimeListClient.oauth2_state && myAnimeListClient.oauth2_state) {
    toast.error('Invalid state parameter returned from MyAnimeList')
    console.error(`Invalid state parameter returned from MyAnimeList: '${state}' should be '${myAnimeListClient.oauth2_state}'`)
    return
  }

  // exchange code for auth token
  fetch(`https://myanimelist.net/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    // MAL only supports plain PKCE (where code_verifier = code_challenge), so we will just pass the code_challenge as the code_verifier here
    // If MAL ever supports S256, we can simply change this to the actual code_verifier
    // Source: https://datatracker.ietf.org/doc/html/rfc7636#section-4.2
    body: `client_id=4e775f7b91ab35a806321856bad911ca&grant_type=authorization_code&code=${code}&code_verifier=${myAnimeListClient.PKCEchallenge.code_challenge}`
  }).then(response => response.json())
    .then(async data => {
      malToken = {token: data.access_token, refresh_token: data.refresh_token, viewer: null}
      const viewer = await myAnimeListClient.viewer()
      
      if (!viewer) {
        toast.error('Failed to sign in with MyAnimeList. Please try again.', {description: JSON.stringify(viewer)})
        debug(`Failed to sign in with MyAnimeList: ${JSON.stringify(viewer)}`)
        return
      }
      if (!viewer.picture) { // add a default picture if MAL doesn't have one
        viewer.picture = 'https://cdn.myanimelist.net/images/kaomoji_mal_white.png'
      }
      
      // save the token and viewer to localStorage
      localStorage.setItem('MALviewer', JSON.stringify({
        token: data.access_token,
        refresh_token: data.refresh_token,
        viewer
      }))
      location.reload()
    })
}