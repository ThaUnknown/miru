import { NodeJS } from 'capacitor-nodejs'

let portListener

export default {
  emit: (event, data) => {
    if (event === 'portRequest') return portRequest()
    NodeJS.send({ eventName: event, args: [data] })
  },
  on: (event, callback) => {
    NodeJS.addListener(event, ({ args }) => callback(...args))
    if (event === 'port') portListener = callback
  },
  once: (event, callback) => {
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
  const { port1, port2 } = new MessageChannel()
  globalThis.port = {
    onmessage: cb => {
      port2.onmessage = ({ type, data }) => cb({ type, data })
    },
    postMessage: (a, b) => {
      port2.postMessage(a, b)
    }
  }
  await NodeJS.whenReady()
  await new Promise(resolve => setTimeout(() => resolve(), 50))
  portListener({ ports: [port2] })
  NodeJS.send({ eventName: 'port', args: [{ ports: [port1] }] })
}

const [_platform, arch] = navigator.platform.split(' ')

globalThis.version = {
  platform: globalThis.cordova?.platformId,
  arch,
  version: globalThis.cordova?.version
}
