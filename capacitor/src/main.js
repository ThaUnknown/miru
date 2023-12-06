import TorrentClient from 'common/modules/webtorrent.js'
import { statfs } from 'fs/promises'
import { channel } from 'bridge'

async function storageQuota (directory) {
  const { bsize, bavail } = await statfs(directory)
  return bsize * bavail
}

channel.on('port-init', () => {
  const port = {
    onmessage: () => {},
    postMessage: data=> {
      channel.send('ipc', data)
    }
  }
  channel.on('ipc', port.onmessage)
  channel.emit('port', ({
    ports: [port]
  }))
})

globalThis.client = new TorrentClient(channel, storageQuota, 'node')
