import { clientsClaim, skipWaiting } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute, PrecacheFallbackPlugin } from 'workbox-precaching'
import { registerRoute, Route } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

import { build, files, prerendered, version } from '$service-worker'

const fallbackURL = '/offline.html'

precacheAndRoute([fallbackURL, ...prerendered, ...build, ...files.filter(e => !['/Ameku.webm', '/video.mkv', '/NotoSansHK.woff2', '/NotoSansJP.woff2', '/NotoSansKR.woff2'].includes(e))].map(url => ({ url, revision: version })))
cleanupOutdatedCaches()
clientsClaim()
skipWaiting()

registerRoute(new Route(({ request }) => request.mode === 'navigate',
  new NetworkOnly({ plugins: [new PrecacheFallbackPlugin({ fallbackURL })] })
))
