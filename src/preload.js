/* eslint node/no-callback-literal: 0 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('IPC', {
  emit: (event, data) => {
    ipcRenderer.send(event, data)
  },
  on: (event, callback) => {
    ipcRenderer.on(event, (event, ...args) => callback(...args))
  }
})
contextBridge.exposeInMainWorld('version', {
  version: process.env.npm_package_version,
  arch: process.arch,
  platform: process.platform
})
