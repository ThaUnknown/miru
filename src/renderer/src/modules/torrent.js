import WebTorrent from 'webtorrent'
import { set } from '@/lib/pages/Settings.svelte'
export const client = new WebTorrent({
  maxConns: 127,
  downloadLimit: set.torrentSpeed * 1048576 || 0,
  uploadLimit: set.torrentSpeed * 1572864 || 0 // :trolled:
})
window.client = client
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

export function add (torrentID) {
  if (torrentID) {
    if (client.torrents.length) client.remove(client.torrents[0].infoHash)
    client.add(torrentID, {
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
if (localStorage.getItem('torrent')) {
  const buffer = Buffer.from(JSON.parse(localStorage.getItem('torrent')))
  add(buffer)
}
