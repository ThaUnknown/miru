import { join } from 'node:path'
import process from 'node:process'

import { BrowserWindow, MessageChannelMain, Notification, app, dialog, ipcMain, nativeImage, powerMonitor, shell } from 'electron'
import electronShutdownHandler from '@paymoapp/electron-shutdown-handler'

import { development } from './util.js'
import Discord from './discord.js'
import Protocol from './protocol.js'
import Updater from './updater.js'
import Dialog from './dialog.js'
import store from './store.js'
import Debug from './debugger.js'

export default class App {
  webtorrentWindow = new BrowserWindow({
    show: development,
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: false,
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
    backgroundColor: '#17191c',
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: false,
      enableBlinkFeatures: 'FontAccess, AudioVideoTracks',
      backgroundThrottling: false,
      preload: join(__dirname, '/preload.js')
    },
    icon: join(__dirname, '/logo_filled.png'),
    show: false
  })

  discord = new Discord(this.mainWindow)
  protocol = new Protocol(this.mainWindow)
  updater = new Updater(this.mainWindow, this.webtorrentWindow)
  dialog = new Dialog(this.webtorrentWindow)
  debug = new Debug()

  constructor () {
    this.mainWindow.setMenuBarVisibility(false)
    this.mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    this.mainWindow.once('ready-to-show', () => this.mainWindow.show())
    this.mainWindow.on('minimize', () => this.mainWindow.webContents.postMessage('visibilitychange', 'hidden'))
    this.mainWindow.on('restore', () => this.mainWindow.webContents.postMessage('visibilitychange', 'visible'))
    ipcMain.on('torrent-devtools', () => this.webtorrentWindow.webContents.openDevTools())
    ipcMain.on('ui-devtools', ({ sender }) => sender.openDevTools())

    this.mainWindow.on('closed', () => this.destroy())
    this.webtorrentWindow.on('closed', () => this.destroy())
    ipcMain.on('close', () => this.destroy())
    ipcMain.on('minimize', () => this.mainWindow?.minimize())
    ipcMain.on('maximize', () => {
      const focusedWindow = this.mainWindow
      focusedWindow?.isMaximized() ? focusedWindow.unmaximize() : focusedWindow.maximize()
});
    app.on('before-quit', e => {
      if (this.destroyed) return
      e.preventDefault()
      this.destroy()
    })

    powerMonitor.on('shutdown', e => {
      if (this.destroyed) return
      e.preventDefault()
      this.destroy()
    })

    ipcMain.on('notification', async (e, opts) => {
      if (opts.icon) {
        const res = await fetch(opts.icon)
        const buffer = await res.arrayBuffer()
        opts.icon = nativeImage.createFromBuffer(Buffer.from(buffer))
      }
      const notification = new Notification(opts)
      notification.on('click', () => {
        if (opts.data.id) {
          this.mainWindow.show()
          this.protocol.protocolMap.anime(opts.data.id)
        }
      })
      notification.show()
    })

    if (process.platform === 'win32') {
      app.setAppUserModelId('com.github.thaunknown.miru')
      // this message usually fires in dev-mode from the parent process
      process.on('message', data => {
        if (data === 'graceful-exit') this.destroy()
      })
      electronShutdownHandler.setWindowHandle(this.mainWindow.getNativeWindowHandle())
      electronShutdownHandler.blockShutdown('Saving torrent data...')
      electronShutdownHandler.on('shutdown', async () => {
        await this.destroy()
        electronShutdownHandler.releaseShutdown()
      })
    } else {
      process.on('SIGTERM', () => this.destroy())
    }

    const torrentLoad = this.webtorrentWindow.loadURL(development ? 'http://localhost:5000/background.html' : `file://${join(__dirname, '/background.html')}`)
    this.mainWindow.loadURL(development ? 'http://localhost:5000/app.html' : `file://${join(__dirname, '/app.html')}`)

    if (development) {
      this.webtorrentWindow.webContents.openDevTools()
      this.mainWindow.webContents.openDevTools()
    }

    let crashcount = 0
    this.mainWindow.webContents.on('render-process-gone', async (e, { reason }) => {
      if (reason === 'crashed') {
        if (++crashcount > 10) {
          await dialog.showMessageBox({ message: 'Crashed too many times.', title: 'Miru', detail: 'App crashed too many times. For a fix visit https://miru.watch/faq/', icon: '/renderer/public/logo_filled.png' })
          shell.openExternal('https://miru.watch/faq/')
        } else {
          app.relaunch()
        }
        app.quit()
      }
    })

    ipcMain.on('portRequest', async ({ sender }) => {
      const { port1, port2 } = new MessageChannelMain()
      await torrentLoad
      this.webtorrentWindow.webContents.postMessage('player', store.get('player'))
      this.webtorrentWindow.webContents.postMessage('torrentPath', store.get('torrentPath'))
      this.webtorrentWindow.webContents.postMessage('port', null, [port1])
      sender.postMessage('port', null, [port2])
    })

    ipcMain.on('quit-and-install', () => {
      if (this.updater.hasUpdate) {
        this.destroy(true)
      }
    })
  }

  destroyed = false

  async destroy (forceRunAfter = false) {
    if (this.destroyed) return
    this.webtorrentWindow.webContents.postMessage('destroy', null)
    await new Promise(resolve => {
      ipcMain.once('destroyed', resolve)
      setTimeout(resolve, 5000).unref?.()
    })
    this.destroyed = true
    if (!this.updater.install(forceRunAfter)) app.quit()
  }
}