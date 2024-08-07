import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { ipcMain, shell } from 'electron'

let hasUpdate = false

log.initialize({ spyRendererConsole: true })
log.transports.file.level = 'info'
autoUpdater.logger = log
ipcMain.on('update', () => {
  if (!hasUpdate) autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.checkForUpdatesAndNotify()
export default class Updater {
  window
  torrentWindow
  /**
   * @param {import('electron').BrowserWindow} window
   * @param {import('electron').BrowserWindow} torrentWindow
   */
  constructor (window, torrentWindow) {
    this.window = window
    this.torrentWindow = torrentWindow
    autoUpdater.on('update-available', () => {
      window.webContents.send('update-available', true)
    })
    autoUpdater.on('update-downloaded', () => {
      hasUpdate = true
      window.webContents.send('update-downloaded', true)
    })
  }

  install (forceRunAfter = false) {
    if (hasUpdate) {
      setImmediate(() => {
        this.window.close()
        this.torrentWindow.close()
        autoUpdater.quitAndInstall(true, forceRunAfter)
      })
      if (process.platform === 'darwin') shell.openExternal('https://miru.watch/download')
      hasUpdate = false
      return true
    }
  }
}