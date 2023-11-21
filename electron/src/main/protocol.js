import { app, protocol, shell, ipcMain } from 'electron'
import { development } from './util.js'
import path from 'path'

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('miru', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('miru')
}

export default class {
  // schema: miru://key/value
  protocolMap = {
    auth: token => this.sendToken(token),
    anime: id => this.window.webContents.send('open-anime', id),
    w2g: link => this.window.webContents.send('w2glink', link),
    schedule: () => this.window.webContents.send('schedule'),
    donate: () => shell.openExternal('https://github.com/sponsors/ThaUnknown/')
  }

  protocolRx = /miru:\/\/([a-z0-9]+)\/(.*)/i

  /**
   * @param {import('electron').BrowserWindow} window
   */
  constructor (window) {
    this.window = window

    protocol.registerHttpProtocol('miru', (req, cb) => {
      const token = req.url.slice(7)
      this.window.loadURL(development ? 'http://localhost:5000/app.html' + token : `file://${path.join(__dirname, '/app.html')}${token}`)
    })

    app.on('open-url', (event, url) => {
      event.preventDefault()
      this.handleProtocol(url)
    })

    if (process.argv.length >= 2 && !process.defaultApp) {
      ipcMain.on('version', () => {
        for (const line of process.argv) {
          this.handleProtocol(line)
        }
      })
    }

    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (this.window) {
        if (this.window.isMinimized()) this.window.restore()
        this.window.focus()
      }
      // There's probably a better way to do this instead of a for loop and split[1][0]
      // but for now it works as a way to fix multiple OS's commandLine differences
      for (const line of commandLine) {
        this.handleProtocol(line)
      }
    })
  }

  sendToken (line) {
    let token = line.split('access_token=')[1].split('&token_type')[0]
    if (token) {
      if (token.endsWith('/')) token = token.slice(0, -1)
      this.window.webContents.send('altoken', token)
    }
  }

  handleProtocol (text) {
    const match = text.match(this.protocolRx)
    if (match) this.protocolMap[match[1]]?.(match[2])
  }
}
