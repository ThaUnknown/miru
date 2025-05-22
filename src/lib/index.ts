// TODO: update these
import { writable } from 'simple-store-svelte'

import type { Media } from './modules/anilist'

export const CHANGELOG_URL = 'https://api.github.com/repos/ThaUnknown/miru/releases'
export const WEB_URL = 'https://miru.watch'
export const DEFAULT_EXTENSIONS = 'gh:hayase-app/extensions'
export const SETUP_VERSION = 2

// episode is optional here, but is actually always defined
export const searchStore = writable<{episode?: number, media?: Media}>({})
