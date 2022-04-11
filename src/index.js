const { app, BrowserWindow, protocol, shell, ipcMain } = require('electron')
const path = require('path')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')
require('./main/torrent.js')
require('./main/misc.js')

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('miru', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('miru')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    if (commandLine.length === 3) {
      let token = commandLine[2].slice(9)
      if (token.endsWith('/')) token = token.slice(0, -1)
      if (token) {
        if (process.env.NODE_ENV !== 'development ') {
          mainWindow.loadURL(path.join(__dirname, '/renderer/dist/index.html#' + token))
        } else {
          mainWindow.loadURL('http://localhost:3000#' + token)
        }
      }
    }
  })
}

ipcMain.on('open', (event, url) => {
  shell.openExternal(url)
})

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function UpsertKeyValue (obj, keyToChange, value) {
  const keyToChangeLower = keyToChange.toLowerCase()
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value
      // Done
      return
    }
  }
  // Insert at end instead
  obj[keyToChange] = value
}

function createWindow () {
  autoUpdater.checkForUpdatesAndNotify()

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: false,
    backgroundColor: '#191c20',
    autoHideMenuBar: true,
    experimentalFeatures: true,
    webPreferences: {
      enableBlinkFeatures: 'AudioVideoTracks',
      backgroundThrottling: false,
      preload: path.join(__dirname, '/preload.js')
    },
    icon: path.join(__dirname, '/renderer/public/logo.ico'),
    show: false
  })
  mainWindow.setMenuBarVisibility(false)

  protocol.registerHttpProtocol('miru', (req, cb) => {
    const token = req.url.slice(7)
    if (process.env.NODE_ENV !== 'development ') {
      mainWindow.loadURL(path.join(__dirname, '/renderer/dist/index.html' + token))
    } else {
      mainWindow.loadURL('http://localhost:3000/' + token)
    }
  })

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details
    if (!responseHeaders['access-control-allow-credentials']) UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*'])
    if (!responseHeaders['access-control-allow-credentials']) UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*'])
    const headers = { responseHeaders }
    callback(headers)
  })

  // This block of code is intended for development purpose only.
  // Delete this entire block of code when you are ready to package the application.
  if (process.env.NODE_ENV !== 'development ') {
    // Load production build
    mainWindow.loadFile(path.join(__dirname, '/renderer/dist/index.html'))
  } else {
    // Load vite dev server page
    console.log('Development mode')
    mainWindow.loadURL('http://localhost:3000/')
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // Emitted when the window is ready to be shown
  // This helps in showing the window gracefully.
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})
