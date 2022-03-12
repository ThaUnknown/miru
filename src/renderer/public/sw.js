self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  const res = proxyResponse(event)
  if (res) event.respondWith(res)
})

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim())
})

const portTimeoutDuration = 5000
function proxyResponse (event) {
  const { url } = event.request
  if (!(url.includes(self.registration.scope) && url.includes('/webtorrent/')) || url.includes('?')) return null
  if (url.includes(self.registration.scope) && url.includes('/webtorrent/keepalive/')) return new Response()

  return serve(event)
}

async function serve ({ request }) {
  const { url, method, headers, destination } = request
  const clientlist = await clients.matchAll({ type: 'window', includeUncontrolled: true })

  const [data, port] = await new Promise(resolve => {
    // Use race condition for whoever controls the response stream
    for (const client of clientlist) {
      const messageChannel = new MessageChannel()
      const { port1, port2 } = messageChannel
      port1.onmessage = ({ data }) => {
        resolve([data, port1])
      }
      client.postMessage({
        url,
        method,
        headers: Object.fromEntries(headers.entries()),
        scope: self.registration.scope,
        destination,
        type: 'webtorrent'
      }, [port2])
    }
  })

  if (data.body !== 'STREAM' && data.body !== 'DOWNLOAD') return new Response(data.body, data)

  let timeOut = null
  return new Response(new ReadableStream({
    pull (controller) {
      return new Promise(resolve => {
        port.onmessage = ({ data }) => {
          if (data) {
            controller.enqueue(data) // event.data is Uint8Array
          } else {
            clearTimeout(timeOut)
            controller.close() // event.data is null, means the stream ended
            port.onmessage = null
          }
          resolve()
        }

        // 'media player' does NOT signal a close on the stream and we cannot close it because it's locked to the reader,
        // so we just empty it after 5s of inactivity, the browser will request another port anyways
        clearTimeout(timeOut)
        if (data.body === 'STREAM') {
          timeOut = setTimeout(() => {
            controller.close()
            port.postMessage(false) // send timeout
            port.onmessage = null
            resolve()
          }, portTimeoutDuration)
        }
        port.postMessage(true) // send a pull request
      })
    },
    cancel () {
      // This event is never executed
      port.postMessage(false) // send a cancel request
    }
  }), data)
}
