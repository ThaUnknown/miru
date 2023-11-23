import TorrentClient from 'common/modules/webtorrent.js'
import { ipcRendererWebTorrent } from './ipc.js'
import { prefetchNetworkInterfaces } from 'os'

globalThis.chrome.runtime = { lastError: false, id: 'something' }

const controller = (async () => {
  const reg = await navigator.serviceWorker.register(new URL('webtorrent/dist/sw.min.js', import.meta.url))

  const worker = reg.active || reg.waiting || reg.installing
  if (!worker) throw new Error('No worker registration')
  return new Promise(resolve => {
    function checkState ({ state }) {
      if (state === 'activated') {
        resolve(reg)
        return true
      }
    }
    if (!checkState(worker)) worker.addEventListener('statechange', ({ target }) => checkState(target))
  })
})()
globalThis.prefetchNetworkInterfaces = await prefetchNetworkInterfaces()
globalThis.controller = controller

async function storageQuota () {
  const { quota, usage } = await navigator.storage.estimate()
  return quota - usage
}

await prefetchNetworkInterfaces

globalThis.client = new TorrentClient(ipcRendererWebTorrent, storageQuota, 'browser', controller, { torrentPort: Math.floor(Math.random() * 65535 + 1) })
