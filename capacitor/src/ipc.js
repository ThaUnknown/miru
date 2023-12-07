import { NodeJS } from 'capacitor-nodejs'

let portListener
const ready = NodeJS.whenReady()

export default {
  emit: async (event, data) => {
    if (event === 'portRequest') return portRequest()
    await ready
    NodeJS.send({ eventName: event, args: [data] })
  },
  on: async (event, callback) => {
    NodeJS.addListener(event, ({ args }) => callback(...args))
    await ready
  },
  once: async (event, callback) => {
    if (event === 'port') portListener = callback
    await ready
    const handle = NodeJS.addListener(event, ({ args }) => {
      NodeJS.removeListener(handle)
      callback(...args)
    })
  },
  off: event => {
    NodeJS.removeAllListeners(event)
  }
}

async function portRequest (data) {
  globalThis.port = {
    onmessage: cb => {
      NodeJS.addListener('ipc', ({ args }) => cb(args[0]))
    },
    postMessage: (data, b) => {
      NodeJS.send({ eventName: 'ipc', args: [{ data }] })
    }
  }
  await ready
  portListener()
  NodeJS.send({ eventName: 'port-init', args: [localStorage.getItem('settings')] })
}

const [_platform, arch] = navigator.platform.split(' ')

globalThis.version = {
  platform: globalThis.cordova?.platformId,
  arch,
  version: globalThis.cordova?.version
}
