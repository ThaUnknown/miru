import { files, media } from '../views/Player/MediaHandler.svelte'
import { page } from '@/App.svelte'
import { toast } from 'svelte-sonner'
import clipboard from './clipboard.js'
import 'browser-event-target-emitter'

const torrentRx = /(^magnet:){1}|(^[A-F\d]{8,40}$){1}|(.*\.torrent$){1}/i

class TorrentWorker extends EventTarget {
  constructor () {
    super()
    this.ready = new Promise(resolve => {
      window.IPC.once('port', () => {
        this.port = window.port
        this.port.onmessage(this.handleMessage.bind(this))
        resolve()
      })
      window.IPC.emit('portRequest')
    })
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
  }

  handleMessage ({ data }) {
    this.emit(data.type, data.data)
  }

  async send (type, data, transfer) {
    await this.ready
    console.info('Torrent: sending message', { type, data })
    this.port.postMessage({ type, data }, transfer)
  }
}

export const client = new TorrentWorker()

client.send('load')

client.on('files', ({ detail }) => {
  files.set(detail)
})

client.on('error', ({ detail }) => {
  console.error(detail)
  toast.error('Torrent Error', { description: detail.message || detail })
})

client.on('warn', ({ detail }) => {
  console.error(detail)
  toast.warning('Torrent Warning', { description: detail.message || detail })
})

export async function add (torrentID, hide) {
  if (torrentID) {
    console.info('Torrent: adding torrent', { torrentID })
    files.set([])
    if (!hide) page.set('player')
    client.send('torrent', torrentID)
  }
}
