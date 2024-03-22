import { basename, extname } from 'node:path'
import { ipcMain, dialog } from 'electron'
import store from './store.js'

export default class Dialog {
  /**
   * @param {import('electron').BrowserWindow} torrentWindow
   */
  constructor (torrentWindow) {
    ipcMain.on('player', async ({ sender }) => {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Select video player executable',
        properties: ['openFile']
      })
      if (canceled) return
      if (filePaths.length) {
        const path = filePaths[0]

        store.set('player', path)
        torrentWindow.webContents.send('player', path)
        sender.send('player', basename(path, extname(path)))
      }
    })
    ipcMain.on('dialog', async ({ sender }) => {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Select torrent download location',
        properties: ['openDirectory']
      })
      if (canceled) return
      if (filePaths.length) {
        let path = filePaths[0]
        if (!(path.endsWith('\\') || path.endsWith('/'))) {
          if (path.indexOf('\\') !== -1) {
            path += '\\'
          } else if (path.indexOf('/') !== -1) {
            path += '/'
          }
        }
        store.set('torrentPath', path)
        torrentWindow.webContents.send('torrentPath', path)
        sender.send('path', path)
      }
    })
  }
}
