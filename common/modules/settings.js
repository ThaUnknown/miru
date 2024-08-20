import { writable } from 'simple-store-svelte'
import { defaults } from './util.js'
import IPC from '@/modules/ipc.js'
import { toast } from 'svelte-sonner'
import Debug from 'debug'

const debug = Debug('ui:anilist')

/** @type {{viewer: import('./al').Query<{Viewer: import('./al').Viewer}>, token: string} | null} */
export let alToken = JSON.parse(localStorage.getItem('ALviewer')) || null
/** @type {{viewer: import('./mal').Query<{Viewer: import('./mal').Viewer}>, token: string} | null} */
export let malToken = JSON.parse(localStorage.getItem('MALviewer')) || null

let storedSettings = { ...defaults }

let scopedDefaults

try {
  storedSettings = JSON.parse(localStorage.getItem('settings')) || { ...defaults }
} catch (e) {}
try {
  scopedDefaults = {
    homeSections: [...(storedSettings.rssFeedsNew || defaults.rssFeedsNew).map(([title]) => title), 'Continue Watching', 'Sequels You Missed', 'Planning List', 'Popular This Season', 'Trending Now', 'All Time Popular', 'Romance', 'Action', 'Adventure', 'Fantasy', 'Comedy']
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

export function isAuthorized() {
  return alToken || malToken
}

window.addEventListener('paste', ({ clipboardData }) => {
  if (clipboardData.items?.[0]) {
    if (clipboardData.items[0].type === 'text/plain' && clipboardData.items[0].kind === 'string') {
      clipboardData.items[0].getAsString(text => {
        if (text.includes("access_token=")) { // is an AniList token
          let token = text.split('access_token=')?.[1]?.split('&token_type')?.[0]
          if (token) {
            if (token.endsWith('/')) token = token.slice(0, -1)
            handleToken(token)
          }
        } else if (text.includes("code=") && text.includes("&state")) { // is a MyAnimeList authorization
          let code = line.split('code=')[1].split('&state')[0]
          let state = line.split('&state=')[1]
          if (code && state) {
            if (code.endsWith('/')) code = code.slice(0, -1)
            if (state.endsWith('/')) state = state.slice(0, -1)
            if (state.includes('%')) state = decodeURIComponent(state)
            handleMalToken(code, state)
          }
        }
      })
    }
  }
})
IPC.on('altoken', handleToken)
async function handleToken (token) {
  const { anilistClient} = await import('./anilist.js')
  const viewer = await anilistClient.viewer({token})
  if (!viewer.data?.Viewer) {
    toast.error('Failed to sign in with AniList. Please try again.', {description: JSON.stringify(viewer)})
    debug(`Failed to sign in with AniList: ${JSON.stringify(viewer)}`)
    return
  }
  const lists = viewer?.data?.Viewer?.mediaListOptions?.animeList?.customLists || []
  if (!lists.includes('Watched using Miru')) {
    await anilistClient.customList({lists})
  }
  swapProfiles({token, viewer})
  location.reload()
}

IPC.on('maltoken', handleMalToken)
async function handleMalToken (code, state) {
  const { clientID, malClient } = await import('./myanimelist.js')
  if (!state || !code) {
    toast.error('Failed to sign in with MyAnimeList. Please try again.')
    console.error('Failed to get the state and code from MyAnimeList.')
    return
  }
  const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        client_id: clientID,
        grant_type: 'authorization_code',
        code: code,
        code_verifier: sessionStorage.getItem(state)
    })
  })
  if (!response.ok) {
    toast.error('Failed to sign in with MyAnimeList. Please try again.', { description: JSON.stringify(response.status) })
    console.error('Failed to get MyAnimeList User Token.', response)
    return
  }
  const oauth = await response.json()
  const viewer = await malClient.viewer(oauth.access_token)
  if (!viewer?.data?.Viewer?.id) {
    toast.error('Failed to sign in with MyAnimeList. Please try again.', { description: JSON.stringify(viewer) })
    console.error(viewer)
    return
  } else if (!viewer?.data?.Viewer?.picture) {
    viewer.data.Viewer.picture = 'https://cdn.myanimelist.net/images/kaomoji_mal_white.png' // set default image if user doesn't have an image.
  }
  swapProfiles({ token: oauth.access_token, refresh: oauth.refresh_token, viewer })
  location.reload()
}

export async function refreshMalToken (token) {
  const { clientID } = await import('./myanimelist.js')
  const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientID,
      grant_type: 'refresh_token',
      refresh_token: malToken.refresh
    })
  })
  if (!response.ok) {
    toast.error('Failed to re-authenticate with MyAnimeList. You will need to log in again.', { description: JSON.stringify(response.status) })
    console.error('Failed to refresh MyAnimeList User Token.', response)
    if (malToken.token === token) {
      swapProfiles(null)
    } else {
      const profiles = JSON.parse(localStorage.getItem('profiles')) || []
      localStorage.setItem('profiles', JSON.stringify(profiles.filter(profile => profile.token !== token)))
    }
    return
  }
  const oauth = await response.json()
  if (malToken.token === token) {
    const viewer = malToken.viewer
    malToken = { token: oauth.access_token, refresh:oauth.refresh_token, viewer: viewer }
    localStorage.setItem('MALviewer', JSON.stringify({ token: oauth.access_token, refresh: oauth.refresh_token, viewer }))
  } else {
    let profiles = JSON.parse(localStorage.getItem('profiles')) || []
    profiles = profiles.map(profile => {
      if (profile.token === token) {
        return {...profile, token: oauth.access_token, refresh: oauth.refresh_token}
      }
      return profile
    })
    localStorage.setItem('profiles', JSON.stringify(profiles))
  }
}

export function swapProfiles(profile) {
  let profiles = JSON.parse(localStorage.getItem('profiles')) || []
  const currentProfile = isAuthorized()
  const newProfile = profile !== null && !profiles.some(p => p.viewer?.data?.Viewer?.id === currentProfile?.viewer?.data?.Viewer?.id)

  if (currentProfile) {
    const torrent = localStorage.getItem('torrent')
    const lastFinished = localStorage.getItem('lastFinished')
    const settings = localStorage.getItem('settings')
    if (torrent) currentProfile.viewer.data.Viewer.torrent = torrent
    if (lastFinished) currentProfile.viewer.data.Viewer.lastFinished = lastFinished
    if (settings) currentProfile.viewer.data.Viewer.settings = settings
    if (newProfile) profiles.unshift(currentProfile)
  }
  localStorage.removeItem(alToken ? 'ALviewer' : 'MALviewer')

  if (profile === null && profiles.length > 0) {
    const firstProfile = profiles.shift()
    setViewer(firstProfile)
  } else if (profile !== null) {
    profiles = profiles.filter(p => p.viewer?.data?.Viewer?.id !== profile.viewer?.data?.Viewer?.id)
    setViewer(profile)
  } else {
    alToken = null
    malToken = null
  }

  localStorage.setItem('profiles', JSON.stringify(profiles))
}

function setViewer (profile) {
  const { torrent, lastFinished, settings } = profile.viewer?.data?.Viewer
  if (torrent) {
    localStorage.setItem('torrent', torrent)
  } else if (isAuthorized()) {
    localStorage.removeItem('torrent')
  }
  if (lastFinished) {
    localStorage.setItem('lastFinished', lastFinished)
  } else if (isAuthorized()) {
    localStorage.removeItem('lastFinished')
  }
  if (settings) {
    localStorage.setItem('settings', settings)
  } else if (isAuthorized()) {
    localStorage.setItem('settings', writable({ ...defaults, ...scopedDefaults}))
  }
  localStorage.setItem(profile.viewer?.data?.Viewer?.avatar ? 'ALviewer' : 'MALviewer', JSON.stringify(profile))
}
