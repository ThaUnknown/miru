const { app, BrowserWindow, protocol } = require('electron')
const path = require('path')
const remote = require('@electron/remote/main')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

remote.initialize()

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
      nodeIntegration: true,
      contextIsolation: false,
      enableBlinkFeatures: 'AudioVideoTracks',
      enableRemoteModule: true,
      backgroundThrottling: false
    },
    icon: path.join(__dirname, '/renderer/public/logo.ico'),
    show: false
  })
  mainWindow.setMenuBarVisibility(false)
  remote.enable(mainWindow.webContents)

  protocol.registerHttpProtocol('miru', (req, cb) => {
    const token = req.url.slice(7)
    if (process.env.NODE_ENV !== 'development ') {
      mainWindow.loadURL(path.join(__dirname, '/renderer/dist/index.html' + token))
    } else {
      mainWindow.loadURL('http://localhost:3000/' + token)
    }
  })

  // mainWindow.removeMenu()
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      const { requestHeaders } = details
      UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*'])
      callback({ requestHeaders })
    }
  )

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*'])
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*'])
    callback({ responseHeaders })
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

  // Uncomment the following line of code when app is ready to be packaged.
  // loadURL(mainWindow);

  // Open the DevTools and also disable Electron Security Warning.
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
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
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})
