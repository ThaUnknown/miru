/* eslint-disable no-new */
import { app, BrowserWindow, shell, ipcMain, dialog, MessageChannelMain } from 'electron'
import path from 'path'
import Discord from './discord.js'
import Updater from './updater.js'
import Protocol from './protocol.js'
import { development } from './util.js'
import Dialog from './dialog.js'
import store from './store.js'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let webtorrentWindow

function createWindow () {
  // Create the browser window.
  webtorrentWindow = new BrowserWindow({
    show: development,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  })
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: process.platform === 'darwin', // Only keep the native frame on Mac
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#17191c',
      symbolColor: '#eee',
      height: 28
    },
    backgroundColor: '#17191c',
    autoHideMenuBar: true,
    webPreferences: {
      enableBlinkFeatures: 'FontAccess, AudioVideoTracks',
      backgroundThrottling: false,
      preload: path.join(__dirname, '/preload.js')
    },
    icon: path.join(__dirname, '/logo_filled.png'),
    show: false
  })
  new Discord(mainWindow)
  new Protocol(mainWindow)
  new Updater(mainWindow)
  new Dialog(webtorrentWindow)
  mainWindow.setMenuBarVisibility(false)

  mainWindow.webContents.session.webRequest.onHeadersReceived(({ responseHeaders }, fn) => {
    delete responseHeaders['Access-Control-Allow-Origin']
    responseHeaders['access-control-allow-origin'] = ['*']
    fn({ responseHeaders })
  })

  const torrentLoad = webtorrentWindow.loadURL(development ? 'http://localhost:5000/background.html' : `file://${path.join(__dirname, '/background.html')}`)
  mainWindow.loadURL(development ? 'http://localhost:5000/app.html' : `file://${path.join(__dirname, '/app.html')}`)

  if (development) {
    webtorrentWindow.webContents.openDevTools()
    mainWindow.webContents.openDevTools()
  }

  ipcMain.on('devtools', () => {
    webtorrentWindow.webContents.openDevTools()
  })

  mainWindow.on('minimize', () => mainWindow.webContents.postMessage('visibilitychange', 'hidden'))
  mainWindow.on('restore', () => mainWindow.webContents.postMessage('visibilitychange', 'visible'))

  mainWindow.on('closed', () => {
    mainWindow = null
    try {
      webtorrentWindow.webContents.postMessage('destroy', null)
    } catch (e) {}
    app.quit()
  })

  ipcMain.on('close', () => {
    mainWindow = null
    try {
      webtorrentWindow.webContents.postMessage('destroy', null)
    } catch (e) {}
    app.quit()
  })

  let crashcount = 0
  mainWindow.webContents.on('render-process-gone', (e, { reason }) => {
    if (reason === 'crashed') {
      if (++crashcount > 10) {
        dialog.showMessageBox({ message: 'Crashed too many times.', title: 'Miru', detail: 'App crashed too many times. For a fix visit https://github.com/ThaUnknown/miru/blob/master/docs/faq.md#miru-crashed-too-many-times', icon: '/renderer/public/logo_filled.png' }).then(() => {
          shell.openExternal('https://github.com/ThaUnknown/miru/blob/master/docs/faq.md#miru-crashed-too-many-times')
          app.quit()
        })
      } else {
        app.relaunch()
        app.quit()
      }
    }
  })

  // Emitted when the window is ready to be shown
  // This helps in showing the window gracefully.
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  ipcMain.on('portRequest', async ({ sender }) => {
    const { port1, port2 } = new MessageChannelMain()
    await torrentLoad
    webtorrentWindow.webContents.postMessage('port', null, [port1])
    webtorrentWindow.webContents.postMessage('player', store.get('player'))
    sender.postMessage('port', null, [port2])
  })
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
