/* eslint-disable no-new */
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import path from 'path'
import { expose } from 'comlink'
import { Util, development } from './util.js'

function electronEndpoint (nep) {
  const listeners = new WeakMap()
  return {
    postMessage: (...args) => {
      nep.postMessage(...args)
    },
    addEventListener: (_, eh) => {
      const l = data => {
        if (data.data?.argumentList) {
          for (const arg of data.data.argumentList) {
            if (arg.type === 'HANDLER' && arg.name === 'proxy') arg.value = electronEndpoint(data.ports[0])
          }
        }
        if ('handleEvent' in eh) {
          eh.handleEvent(data)
        } else {
          eh(data)
        }
      }
      nep.on('message', l)
      listeners.set(eh, l)
    },
    removeEventListener: (_, eh) => {
      const l = listeners.get(eh)
      if (!l) {
        return
      }
      nep.off('message', l)
      listeners.delete(eh)
    },
    start: nep.start && nep.start.bind(nep)
  }
}

function createWindow () {
  // Create the browser window.
  const webtorrentWindow = new BrowserWindow({
    show: development,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  })
  let mainWindow = new BrowserWindow({
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
      contextIsolation: false,
      preload: path.join(__dirname, '/preload.js')
    },
    icon: path.join(__dirname, '/logo.ico'),
    show: false
  })

  ipcMain.on('mainPort', ({ ports }) => {
    expose(new Util(mainWindow), electronEndpoint(ports[0]))
  })

  ipcMain.on('torrentPort', async ({ ports }) => {
    await torrentLoad
    webtorrentWindow.webContents.postMessage('port', null, [ports[0]])
  })

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

  mainWindow.on('closed', () => {
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
        dialog.showMessageBox({ message: 'Crashed too many times.', title: 'Miru', detail: 'App crashed too many times. For a fix visit https://github.com/ThaUnknown/miru/blob/master/docs/faq.md#miru-crashed-too-many-times', icon: '/renderer/public/logo.ico' }).then(() => {
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
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (!BrowserWindow.getAllWindows().length) createWindow()
})
