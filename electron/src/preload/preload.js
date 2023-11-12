/* eslint n/no-callback-literal: 0 */
import { contextBridge, ipcRenderer } from 'electron'

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
    postMessage: (a, b) => {
      ports[0].postMessage(a, b)
    }
  })
})
