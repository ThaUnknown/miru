import WebTorrent from 'webtorrent'
import { set } from '@/lib/pages/Settings.svelte'
import { files } from '@/lib/Router.svelte'
import { page } from '@/App.svelte'
export const client = new WebTorrent({
  dht: !set.torrentDHT,
  downloadLimit: set.torrentSpeed * 1048576 || 0,
  uploadLimit: set.torrentSpeed * 1572864 || 0 // :trolled:
})
// save loaded torrent for persistence

// should use HTTP createserver... oopps xd
const scope = location.pathname.substr(0, location.pathname.lastIndexOf('/') + 1)
const worker = location.origin + scope + 'sw.js' === navigator.serviceWorker?.controller?.scriptURL && navigator.serviceWorker.controller
const handleWorker = worker => {
  const checkState = worker => {
    return worker.state === 'activated' && client.loadWorker(worker)
  }
  if (!checkState(worker)) {
    worker.addEventListener('statechange', ({ target }) => checkState(target))
  }
}
if (worker) {
  handleWorker(worker)
} else {
  navigator.serviceWorker.register('sw.js', { scope }).then(reg => {
    handleWorker(reg.active || reg.waiting || reg.installing)
  }).catch(e => {
    if (String(e) === 'InvalidStateError: Failed to register a ServiceWorker: The document is in an invalid state.') {
      location.reload() // weird workaround for a weird bug
    } else {
      throw e
    }
  })
}
window.client = client
client.on('torrent', torrent => {
  files.set(torrent.files)
})

export async function add (torrentID) {
  if (torrentID) {
    if (client.torrents.length) client.remove(client.torrents[0].infoHash)
    files.set([])
    page.set('player')
    if (typeof torrentID === 'string' && !torrentID.startsWith('magnet:')) {
      const res = await fetch(torrentID)
      torrentID = new File([await res.arrayBuffer()], 'file.torrent', {
        type: 'application/x-bittorrent'
      })
    }
    client.add(torrentID, {
      private: set.torrentPeX,
      path: set.torrentPath,
      destroyStoreOnDestroy: !set.torrentPersist,
      announce: [
        'wss://tracker.openwebtorrent.com',
        'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
        'wss://peertube.cpy.re:443/tracker/socket'
      ]
    })
  }
}

client.on('torrent', torrent => {
  console.log('ready', torrent.name)
  const string = JSON.stringify(Array.from(torrent.torrentFile))
  localStorage.setItem('torrent', string)
})

// load last used torrent
queueMicrotask(() => {
  if (localStorage.getItem('torrent')) {
    const buffer = Buffer.from(JSON.parse(localStorage.getItem('torrent')))
    add(buffer)
  }
})
