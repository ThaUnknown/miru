/* eslint-env serviceworker */
'use strict'

const staticCacheName = 'v1.0.0'

const filesToCache = [
  '/app/index.html',
  '/app/js/settingsHandler.js',
  '/app/js/animeHandler.js',
  '/app/js/playerHandler.js',
  '/app/js/torrentHandler.js',
  '/app/js/rangeParser.js',
  '/app/js/util.js',
  '/app/css/misc.css',
  '/app/css/player.css',
  '/app/logo.png',
  'https://cdn.jsdelivr.net/npm/matroska-subtitles@3.0.1/dist/matroska-subtitles.min.js',
  'https://cdn.jsdelivr.net/npm/halfmoon@1.1.0/css/halfmoon-variables.min.css',
  'https://cdn.jsdelivr.net/gh/halfmoonui/halfmoon@1.1.0/js/halfmoon.min.js',
  'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache)
      })
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  const cacheWhitelist = [staticCacheName]

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
          return null
        })
      )
    })
  )
  return self.clients.claim()
})

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => {
//         if (response) {
//           return response
//         }
//         return fetch(event.request)
//           .then(response => {
//             if (response.status === 404) {
//               return
//             }
//             return response
//           })
//       }).catch(error => {
//         return caches.match('index.html')
//       })
//   )
// })
