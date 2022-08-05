const { dialog, ipcMain, BrowserWindow, app } = require('electron')
const { Client } = require('discord-rpc')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

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

ipcMain.on('minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize()
})
ipcMain.on('maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window.isMaximized()) {
    window.unmaximize()
  } else {
    window.maximize()
  }
})

let status = null
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
discord.on('ready', async () => {
  setDiscordRPC(null, status)
  discord.subscribe('ACTIVITY_JOIN_REQUEST')
  discord.subscribe('ACTIVITY_JOIN')
  discord.subscribe('ACTIVITY_SPECTATE')
})
discord.on('ACTIVITY_JOIN_REQUEST', console.log)
discord.on('ACTIVITY_SPECTATE', console.log)
discord.on('ACTIVITY_JOIN', (args) => {
  console.log('ACTIVITY_JOIN')
  console.log(args)
  console.log('------')
  BrowserWindow.getAllWindows()[0]?.send('w2glink', args.secret)
})

function loginRPC () {
  discord.login({ clientId: '954855428355915797' }).catch(() => {
    setTimeout(loginRPC, 5000).unref()
  })
}
loginRPC()

ipcMain.on('version', (event) => {
  event.sender.send('version', app.getVersion()) // fucking stupid
})

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
ipcMain.on('update', () => {
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.checkForUpdatesAndNotify()
autoUpdater.on('update-available', () => {
  BrowserWindow.getAllWindows()[0]?.send('update', true)
})
