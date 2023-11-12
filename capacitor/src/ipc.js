import EventEmitter from 'events'

const ipcRendererUI = new EventEmitter()

export default {
  emit: (event, data) => {
    ipcRendererUI.emit(event, data)
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

ipcRendererUI.on('portRequest', async () => {
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
  ipcRendererWebTorrent.emit('port', { ports: [port1] })
  ipcRendererUI.emit('port', { ports: [port2] })
})

export const ipcRendererWebTorrent = new EventEmitter()

window.version = {
  arch: 'uwu',
  platform: 'nyaa'
}
