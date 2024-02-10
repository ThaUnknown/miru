import { statfs } from 'node:fs/promises'
import { ipcRenderer } from 'electron'
import { expose } from 'comlink'

import TorrentClient from 'common/modules/webtorrent.js'

async function storageQuota (directory) {
  const { bsize, bavail } = await statfs(directory)
  return bsize * bavail
}

globalThis.client = new TorrentClient(storageQuota, 'node')
ipcRenderer.on('port', ({ ports }) => {
  expose(globalThis.client, ports[0])
})
