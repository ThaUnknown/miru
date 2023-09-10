import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'

log.transports.file.level = 'info'
autoUpdater.logger = log
ipcMain.on('update', () => {
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.checkForUpdatesAndNotify()
export default class {
  /**
   * @param {import('electron').BrowserWindow} window
   */
  constructor (window) {
    autoUpdater.on('update-available', () => {
      window.webContents.send('update-available', true)
    })
    autoUpdater.on('update-downloaded', () => {
      window.webContents.send('update-downloaded', true)
    })
  }
}
