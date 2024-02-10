import EventEmitter from 'events'
import { NodeJS } from 'capacitor-nodejs'
import { wrap } from 'comlink'

const ready = NodeJS.whenReady()

function capacitorEndpoint (nep) {
  const listeners = new WeakMap()
  return {
    postMessage: async (...args) => {
      await ready
      nep.send({ eventName: 'message', args })
    },
    addEventListener: (_, eh) => {
      const l = (data) => {
        if ('handleEvent' in eh) {
          eh.handleEvent({ data })
        } else {
          eh({ data })
        }
      }
      const handle = nep.addListener('message', ({ args }) => l(...args))
      listeners.set(eh, handle)
    },
    removeEventListener: (_, eh) => {
      const l = listeners.get(eh)
      if (!l) return
      nep.removeListener(l)
      listeners.delete(eh)
    }
  }
}
export default {
  discord: {
    on () {},
    handleDiscordStatus () {},
    showDiscordStatus () {}
  },
  protocol: new EventEmitter(),
  updater: new EventEmitter(),
  close () {},
  open () {},
  doh () {},
  angle () {},
  dialog () {},
  async version () {}
}

export const TorrentClient = wrap(capacitorEndpoint(NodeJS))

const [_platform, arch] = navigator.platform.split(' ')

globalThis.version = {
  platform: globalThis.cordova?.platformId,
  arch,
  version: globalThis.cordova?.version
}
