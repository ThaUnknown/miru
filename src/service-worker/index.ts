import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim, skipWaiting } from 'workbox-core'

import { build, files, prerendered, version } from '$service-worker'

const precache = [...build, ...files, ...prerendered, '/'].map(url => ({ url, revision: version }))
precacheAndRoute(precache)
cleanupOutdatedCaches()
clientsClaim()
skipWaiting()
