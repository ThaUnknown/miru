import { writable } from 'simple-store-svelte'

import type { Media } from './modules/anilist'

// TODO: update these
export const COMMITS_URL = 'https://api.github.com/repos/ThaUnknown/miru/commits'
export const WEB_URL = 'https://hayase.watch'
export const DEFAULT_EXTENSIONS = 'gh:hayase-app/extensions'
export const SETUP_VERSION = 3

// episode is optional here, but is actually always defined
export const searchStore = writable<{episode?: number, media?: Media}>({})
