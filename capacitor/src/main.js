import TorrentClient from 'common/modules/webtorrent.js'
import { channel } from 'bridge'

async function storageQuota (directory) {
  return Infinity
}

if (typeof localStorage === 'undefined') {
  const data = {}
  globalThis.localStorage = {
    setItem: (k, v) => { data[k] = v },
    getItem: (k) => data[k] || null
  }
}

channel.on('port-init', data => {
  localStorage.setItem('settings', data)
  const port = {
    onmessage: _ => {},
    postMessage: data => {
      channel.send('ipc', { data })
    }
  }

  channel.on('ipc', a => port.onmessage(a))
  channel.emit('port', ({
    ports: [port]
  }))
})

globalThis.client = new TorrentClient(channel, storageQuota, 'node')
