import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'

let hasUpdate = false

log.initialize({ spyRendererConsole: true })
log.transports.file.level = 'info'
autoUpdater.logger = log
ipcMain.on('update', () => {
  if (!hasUpdate) autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.checkForUpdatesAndNotify()
export default class Updater {
  /**
   * @param {import('electron').BrowserWindow} window
   */
  constructor (window) {
    autoUpdater.on('update-available', () => {
      window.webContents.send('update-available', true)
    })
    autoUpdater.on('update-downloaded', () => {
      hasUpdate = true
      window.webContents.send('update-downloaded', true)
    })
    ipcMain.on('quit-and-install', () => {
      if (hasUpdate) {
        autoUpdater.quitAndInstall()
        hasUpdate = false
      }
    })
  }

  install () {
    if (hasUpdate) {
      autoUpdater.quitAndInstall()
      hasUpdate = false
      return true
    }
  }
}
