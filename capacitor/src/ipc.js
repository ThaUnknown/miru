import EventEmitter from 'events'

const ipcRendererUI = new EventEmitter()

export default {
  emit: (event, data) => {
    // ipcRendererUI.emit(event, data)
    if (event === 'portRequest') portRequest(data)
  },
  on: (event, callback) => {
    ipcRendererUI.on(event, (event, ...args) => callback(...args))
  },
  once: (event, callback) => {
    ipcRendererUI.once(event, (event, ...args) => callback(...args))
  },
  off: event => {
    ipcRendererUI.removeAllListeners(event)
  }
}

async function portRequest (data) {
  const { port1, port2 } = new MessageChannel()
  window.port = {
    onmessage: cb => {
      port2.onmessage = ({ type, data }) => cb({ type, data })
    },
    postMessage: (a, b) => {
      port2.postMessage(a, b)
    }
  }
  await window.controller
  ipcRendererUI.emit('port', { ports: [port2] })
  ipcRendererWebTorrent.emit('port', { ports: [port1] })
}

export const ipcRendererWebTorrent = new EventEmitter()

const [_platform, arch] = navigator.platform.split(' ')

window.version = {
  platform: globalThis.cordova?.platformId,
  arch,
  version: globalThis.cordova?.version
}
