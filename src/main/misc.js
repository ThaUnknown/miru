const { dialog, ipcMain, BrowserWindow } = require('electron')

ipcMain.on('dialog', async (event, data) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (filePaths.length) {
    let path = filePaths[0]
    if (!(path.endsWith('\\') || path.endsWith('/'))) {
      if (path.indexOf('\\') !== -1) {
        path += '\\'
      } else if (path.indexOf('/') !== -1) {
        path += '/'
      }
    }
    event.sender.send('path', path)
  }
})

ipcMain.on('minimize', () => {
  BrowserWindow.getAllWindows()[0].minimize()
})
ipcMain.on('maximize', () => {
  const window = BrowserWindow.getAllWindows()[0]
  if (window.isMaximized()) {
    window.unmaximize()
  } else {
    window.maximize()
  }
})

let status = null
const { Client } = require('discord-rpc')
const discord = new Client({
  transport: 'ipc'
})
function setDiscordRPC (event, data) {
  status = data
  if (discord?.user && status) {
    status.pid = process.pid
    discord.request('SET_ACTIVITY', status)
  }
}
ipcMain.on('discord', setDiscordRPC)
discord.on('ready', () => {
  setDiscordRPC(null, status)
})
function loginRPC () {
  discord.login({ clientId: '954855428355915797' }).catch(() => {
    setTimeout(loginRPC, 5000)
  })
}
loginRPC()
