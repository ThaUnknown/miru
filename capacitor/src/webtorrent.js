import TorrentClient from 'common/modules/webtorrent.js'
import { ipcRendererWebTorrent } from './ipc.js'

globalThis.chrome.runtime = { lastError: false, id: 'something' }

const controller = (async () => {
  const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' })

  const worker = reg.active || reg.waiting || reg.installing
  if (!worker) throw new Error('No worker registration')
  return new Promise(resolve => {
    function checkState ({ state }) {
      if (state === 'activated') {
        resolve(reg)
        return true
      }
      return false
    }
    if (!checkState(worker)) {
      worker.addEventListener('statechange', ({ target }) => checkState(target))
    }
  })
})()
globalThis.controller = controller

async function storageQuota () {
  const { quota, usage } = await navigator.storage.estimate()
  return quota - usage
}

globalThis.client = new TorrentClient(ipcRendererWebTorrent, storageQuota, 'browser', controller)
