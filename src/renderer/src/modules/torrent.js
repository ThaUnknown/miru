// import WebTorrent from 'webtorrent'
import { set } from '@/lib/pages/Settings.svelte'
import { files } from '@/lib/Router.svelte'
import { page } from '@/App.svelte'

export const client = null

window.IPC.emit('settings', { ...set })

window.IPC.on('files', arr => {
  files.set(arr)
})

export async function add (torrentID, hide) {
  if (torrentID) {
    files.set([])
    if (!hide) page.set('player')
    if (typeof torrentID === 'string' && !torrentID.startsWith('magnet:')) {
      // IMPORTANT, this is because node's get bypasses proxies, wut????
      const res = await fetch(torrentID)
      torrentID = Array.from(new Uint8Array(await res.arrayBuffer()))
    }
    window.IPC.emit('torrent', torrentID)
  }
}

window.IPC.on('torrent', file => {
  localStorage.setItem('torrent', JSON.stringify(file))
})

// load last used torrent
queueMicrotask(() => {
  if (localStorage.getItem('torrent')) {
    window.IPC.emit('torrent', JSON.parse(localStorage.getItem('torrent')))
  }
})
