/* eslint n/no-callback-literal: 0 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('IPC', {
  emit: (event, data) => {
    ipcRenderer.send(event, data)
  },
  on: (event, callback) => {
    ipcRenderer.on(event, (event, ...args) => callback(...args))
  },
  once: (event, callback) => {
    ipcRenderer.once(event, (event, ...args) => callback(...args))
  },
  off: (event) => {
    ipcRenderer.removeAllListeners(event)
  }
})
contextBridge.exposeInMainWorld('version', {
  arch: process.arch,
  platform: process.platform
})

ipcRenderer.once('port', ({ ports }) => {
  contextBridge.exposeInMainWorld('port', {
    onmessage: (cb) => {
      ports[0].onmessage = ({ type, data }) => cb({ type, data })
    },
    postMessage: (...args) => {
      ports[0].postMessage(...args)
    }
  })
})
