import { ipcRenderer } from 'electron'
import { statfs } from 'fs/promises'

import TorrentClient from 'common/modules/webtorrent.js'

async function storageQuota (directory) {
  const { bsize, bavail } = await statfs(directory)
  return bsize * bavail
}

globalThis.client = new TorrentClient(ipcRenderer, storageQuota, 'node')
