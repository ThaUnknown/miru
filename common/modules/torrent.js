import { files, media } from '../views/Player/MediaHandler.svelte'
import { page } from '@/App.svelte'
import { toast } from 'svelte-sonner'
import clipboard from './clipboard.js'
import 'browser-event-target-emitter'
import { TorrentClient } from '@/modules/ipc.js'
import { proxy } from 'comlink'

const torrentRx = /(^magnet:){1}|(^[A-F\d]{8,40}$){1}|(.*\.torrent$){1}/i

clipboard.on('text', ({ detail }) => {
  for (const { text } of detail) {
    if (torrentRx.exec(text)) {
      media.set(null)
      add(text)
    }
  }
})
clipboard.on('files', async ({ detail }) => {
  for (const file of detail) {
    if (file.name.endsWith('.torrent')) {
      media.set(null)
      add(new Uint8Array(await file.arrayBuffer()))
    }
  }
})

globalThis.ddd = TorrentClient

/** @type {import('comlink').Remote<import('@/modules/webtorrent.js').default>} */
export const client = TorrentClient

queueMicrotask(() => client.loadLastTorrent(localStorage.getItem('torrent')))

window.dd = client
window.aa = proxy

client.on('files', proxy((detail) => {
  files.set(detail)
}))

client.on('error', proxy((detail) => {
  console.error(detail)
  toast.error('Torrent Error', { description: detail.message || detail })
}))

client.on('warn', proxy((detail) => {
  console.error(detail)
  toast.warning('Torrent Warning', { description: detail.message || detail })
}))

export async function add (torrentID, hide) {
  if (torrentID) {
    console.info('Torrent: adding torrent', { torrentID })
    localStorage.setItem('torrent', torrentID)
    files.set([])
    if (!hide) page.set('player')
    client.addTorrent(torrentID)
  }
}
