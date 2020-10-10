'use strict';

const staticCacheName = 'v1.0.0';

const filesToCache = [
  'index.html',
  'js/settingsHandler.js',
  'js/animeHandler.js',
  'js/playerHandler.js',
  'js/subtitleHandler.js',
  'js/torrentHandler.js',
  'js/rangeParser.js',
  'js/util.js',
  'css/misc.css',
  'css/player.css',
  'logo.png',
  'https://cdn.jsdelivr.net/npm/matroska-subtitles@3.0.1/dist/matroska-subtitles.min.js',
  'https://cdn.jsdelivr.net/npm/halfmoon@1.1.0/css/halfmoon-variables.min.css',
  'https://cdn.jsdelivr.net/gh/halfmoonui/halfmoon@1.1.0/js/halfmoon.min.js',
  'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {

  const cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const { request } = evt
  const { url, method, headers } = request
  if (!url.includes(self.registration.scope + 'webtorrent/')) return null

  function getConsumer(clients) {
    return new Promise(rs => {
      // Use race condition for whoever controls the response stream
      for (const client of clients) {
        const mc = new MessageChannel()
        const { port1, port2 } = mc
        port1.onmessage = evt => {
          rs([evt.data, mc])
        }
        client.postMessage({
          url,
          method,
          headers: [...headers],
          scope: self.registration.scope
        }, [port2])
      }
    })
  }

  evt.respondWith(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(getConsumer)
      .then(([data, mc]) => {
        const body = data.body === 'stream' ? new ReadableStream({
          pull(controller) {
            return new Promise(rs => {
              mc.port1.onmessage = evt => {
                evt.data
                  ? controller.enqueue(evt.data) // evt.data is Uint8Array
                  : controller.close() // evt.data is null, means the stream ended
                rs()
              }
              mc.port1.postMessage(true) // send a pull request
            })
          },
          cancel() {
            // This event is never executed
            mc.port1.postMessage(false) // send a cancel request
          }
        }) : data.body

        return new Response(body, data)
      })
      .catch(console.error)
  )
})

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => {
//         if (response) {
//           return response;
//         }
//         return fetch(event.request)
//           .then(response => {
//             if (response.status === 404) {
//               return;
//             }
//             return response;
//           });
//       }).catch(error => {
//         return caches.match('index.html');
//       })
//   );
// });