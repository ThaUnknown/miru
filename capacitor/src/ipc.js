import EventEmitter from 'events'

export const ipcRendererUI = new EventEmitter()

export const main = new EventEmitter()

export default {
  emit: (event, data) => {
    main.emit(event, data)
  },
  on: (event, callback) => {
    ipcRendererUI.on(event, (...args) => callback(...args))
  },
  once: (event, callback) => {
    ipcRendererUI.once(event, (...args) => callback(...args))
  },
  off: event => {
    ipcRendererUI.removeAllListeners(event)
  }
}

main.on('portRequest', portRequest)

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
  await globalThis.controller
  await globalThis.prefetchNetworkInterfaces
  await new Promise(resolve => setTimeout(() => resolve(), 50))
  ipcRendererUI.emit('port', { ports: [port2] })
  ipcRendererWebTorrent.emit('port', { ports: [port1] })
}

export const ipcRendererWebTorrent = new EventEmitter()

const [_platform, arch] = navigator.platform.split(' ')

globalThis.version = {
  platform: globalThis.cordova?.platformId,
  arch,
  version: globalThis.cordova?.version
}
