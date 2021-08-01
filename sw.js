/* eslint-env serviceworker */
'use strict'

const staticCacheName = 'v1.0.0'

const filesToCache = [
  '/app/index.html',
  '/app/js/bundle.js',
  '/app/css/misc.css',
  '/app/css/torrent-player.css',
  '/app/logo.png',
  'https://cdn.jsdelivr.net/npm/halfmoon@1.1.0/css/halfmoon-variables.min.css',
  'https://cdn.jsdelivr.net/gh/halfmoonui/halfmoon@1.1.0/js/halfmoon.min.js',
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
//       }).catch(_error => {
//         return caches.match('index.html')
//       })
//   )
// })
