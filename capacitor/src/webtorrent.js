/* globals navigationbar */
import TorrentClient from 'common/modules/webtorrent.js'
import { ipcRendererWebTorrent } from './ipc.js'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SafeArea } from 'capacitor-plugin-safe-area'

SafeArea.addListener('safeAreaChanged', data => {
  const { insets } = data
  for (const [key, value] of Object.entries(insets)) {
    document.documentElement.style.setProperty(
      `--safe-area-${key}`,
      `${value}px`
    )
  }
})

StatusBar.hide()
StatusBar.setStyle({ style: Style.Dark })
StatusBar.setOverlaysWebView({ overlay: true })

navigationbar.setUp(true)

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
