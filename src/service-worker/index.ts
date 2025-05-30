import { clientsClaim, skipWaiting } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

import { build, files, prerendered, version } from '$service-worker'

precacheAndRoute([...build, ...files.filter(e => !['/Ameku.webm', '/video.mkv', '/NotoSansHK.woff2', '/NotoSansJP.woff2', '/NotoSansKR.woff2'].includes(e)), ...prerendered, '/'].map(url => ({ url, revision: version })))
cleanupOutdatedCaches()
clientsClaim()
skipWaiting()
