import TorrentClient from 'common/modules/webtorrent.js'
import { channel } from 'bridge'
import { env } from 'node:process'
import { statfs } from 'fs/promises'
import { expose } from 'comlink'

async function storageQuota (directory) {
  const { bsize, bavail } = await statfs(directory)
  return bsize * bavail
}

if (typeof localStorage === 'undefined') {
  const data = {}
  globalThis.localStorage = {
    setItem: (k, v) => { data[k] = v },
    getItem: (k) => data[k] || null
  }
}

// localStorage.setItem('settings', data)

function capacitorEndpoint (nep) {
  const listeners = new WeakMap()
  return {
    postMessage: (...args) => {
      nep.send('message', ...args)
    },
    addEventListener: (_, eh) => {
      const l = (data) => {
        if ('handleEvent' in eh) {
          eh.handleEvent({ data })
        } else {
          eh({ data })
        }
      }
      nep.on('message', l)
      listeners.set(eh, l)
    },
    removeEventListener: (_, eh) => {
      const l = listeners.get(eh)
      if (!l) return
      nep.removeListener('message', l)
      listeners.delete(eh)
    }
  }
}

globalThis.client = new TorrentClient(storageQuota, 'node', { torrentPath: env.TMPDIR })

expose(globalThis.client, capacitorEndpoint(channel))
