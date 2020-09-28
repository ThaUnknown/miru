'use strict';

const CACHE_NAME = 'v1.0.0';

const FILES_TO_CACHE = [
  'offline.html',
  'index.html',
  'js/animeHandler.js',
  'js/bundle.min.js',
  'js/playerHandler.js',
  'js/subtitleHandler.js',
  'js/torrentHandler.js',
  'js/util.js',
  'css/misc.css',
  'css/player.css',
  'logo.png'
];

self.addEventListener('install', (evt) => {
  // evt.waitUntil(
  //   caches.open(CACHE_NAME).then((cache) => {
  //     return cache.addAll(FILES_TO_CACHE);
  //   })
  // );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  // evt.waitUntil(
  //   caches.keys().then((keyList) => {
  //     return Promise.all(keyList.map((key) => {
  //       if (key !== CACHE_NAME) {
  //         return caches.delete(key);
  //       }
  //     }));
  //   })
  // );
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

// self.addEventListener('fetch', (evt) => {
//   if (evt.request.mode !== 'navigate') {
//     return;
//   }
//   evt.respondWith(
//     fetch(evt.request)
//       .catch(async () => {
//         const cache = await caches.open(CACHE_NAME);
//         return cache.match('offline.html');
//       })
//   );
// });
