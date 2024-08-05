import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { ipcMain, shell } from 'electron'

log.initialize({ spyRendererConsole: true })
log.transports.file.level = 'info'
autoUpdater.logger = log
ipcMain.on('update', () => {
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.checkForUpdatesAndNotify()
export default class Updater {
  hasUpdate = false
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
      this.hasUpdate = true
      window.webContents.send('update-downloaded', true)
    })
  }

  install (forceRunAfter = false) {
    if (this.hasUpdate) {
      setImmediate(() => {
        this.window.close()
        this.torrentWindow.close()
        autoUpdater.quitAndInstall(true, forceRunAfter)
      })
      if (process.platform === 'darwin') shell.openExternal('https://miru.watch/download')
      this.hasUpdate = false
      return true
    }
  }
}
