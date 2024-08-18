import { writable } from 'simple-store-svelte'
import { defaults } from './util.js'
import IPC from '@/modules/ipc.js'
import { anilistClient } from './anilist.js'
import { toast } from 'svelte-sonner'
import Debug from 'debug'

const debug = Debug('ui:anilist')

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
