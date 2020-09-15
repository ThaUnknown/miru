self.addEventListener('activate', evt =>  {
	return self.clients.claim()
})

self.addEventListener('fetch', evt => {
  const { request } = evt
  const { url, method, headers } = request
  if (!url.includes(self.registration.scope + 'webtorrent/')) return null

  function getConsumer(clients) {
    return new Promise(rs => {
      // Use race condition for whoever controls the response stream
      for (const client of clients) {
        const mc = new MessageChannel()
        const {port1, port2} = mc
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