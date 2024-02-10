import { ipcRenderer } from 'electron'

const mainChannel = new MessageChannel()
globalThis.Native = mainChannel.port1
ipcRenderer.postMessage('mainPort', null, [mainChannel.port2])
const d = mainChannel.port1.postMessage.bind(mainChannel.port1)
mainChannel.port1.postMessage = (...args) => {
  if (args[0]?.argumentList) {
    for (const arg of args[0].argumentList) {
      if (arg.type === 'HANDLER' && arg.name === 'proxy') delete arg.value
    }
  }
  d(...args)
}
const torrentChannel = new MessageChannel()
globalThis.Torrent = torrentChannel.port1
ipcRenderer.postMessage('torrentPort', null, [torrentChannel.port2])

globalThis.version = {
  arch: process.arch,
  platform: process.platform
}
