import TorrentClient from 'common/modules/webtorrent.js'
import { statfs } from 'fs/promises'
import { channel } from 'bridge'

async function storageQuota (directory) {
  const { bsize, bavail } = await statfs(directory)
  return bsize * bavail
}

globalThis.client = new TorrentClient(channel, storageQuota, 'node')
