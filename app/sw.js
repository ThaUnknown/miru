self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  return self.clients.claim()
})

self.addEventListener('fetch', evt => {
  const { request } = evt
  const { url, method, headers } = request
  if (!url.includes(self.registration.scope + 'webtorrent/')) return null

  function getConsumer (clients) {
    return new Promise(resolve => {
      // Use race condition for whoever controls the response stream
      for (const client of clients) {
        const mc = new MessageChannel()
        const { port1, port2 } = mc
        port1.onmessage = evt => {
          resolve([evt.data, mc])
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
        let tm = null
        const body = data.body === 'stream'
          ? new ReadableStream({
              pull (controller) {
                return new Promise(resolve => {
                  mc.port1.onmessage = evt => {
                    if (evt.data) {
                      controller.enqueue(evt.data) // evt.data is Uint8Array
                    } else {
                      clearTimeout(tm)
                      controller.close() // evt.data is null, means the stream ended
                      mc.port1.onmessage = null
                    }
                    resolve()
                  }
                  // 'media player' does NOT signal a close on the stream and we cannot close it because it's locked to the reader,
                  // so we just empty it after 5s of inactivity,
                  // the browser will request another port anyways
                  clearTimeout(tm)
                  tm = setTimeout(() => {
                    controller.close()
                    mc.port1.postMessage(false) // send timeout
                    mc.port1.onmessage = null
                    resolve()
                  }, 5000)

                  mc.port1.postMessage(true) // send a pull request
                })
              },
              cancel () {
                // This event is never executed
                mc.port1.postMessage(false) // send a cancel request
              }
            })
          : data.body

        return new Response(body, data)
      })
      .catch(console.error)
  )
})
