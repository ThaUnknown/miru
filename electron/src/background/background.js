import { ipcRenderer } from 'electron'
import { statfs } from 'fs/promises'

import TorrentClient from 'common/modules/webtorrent.js'

// @ts-ignore
window.client = new TorrentClient(ipcRenderer, statfs, 'node')
