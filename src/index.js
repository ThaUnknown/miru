const { app, BrowserWindow, protocol, shell, ipcMain, dialog } = require('electron')
const path = require('path')
require('./main/misc.js')

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('miru', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('miru')
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    // There's probably a better way to do this instead of a for loop and split[1][0]
    // but for now it works as a way to fix multiple OS's commandLine differences
    for (const line of commandLine) {
      handleProtocol(line)
    }
  })
}
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleProtocol(url)
})

// schema: miru://key/value
const protocolMap = {
  auth: sendToken,
  anime: openAnime,
  w2g: joinLobby
}
const protocolRx = /miru:\/\/([a-z0-9]+)\/(.+)/i
function handleProtocol (text) {
  const match = text.match(protocolRx)
  if (match) protocolMap[match[1]]?.(match[2])
}

function joinLobby (link) {
  mainWindow.webContents.send('w2glink', link)
}

function sendToken (line) {
  let token = line.split('access_token=')[1].split('&token_type')[0]
  if (token) {
    if (token.endsWith('/')) token = token.slice(0, -1)
    mainWindow.webContents.send('altoken', token)
  }
}

function openAnime (id) {
  if (!isNaN(id)) mainWindow.webContents.send('open-anime', id)
}

ipcMain.on('open', (event, url) => {
  shell.openExternal(url)
})

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
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: false,
    backgroundColor: '#191c20',
    autoHideMenuBar: true,
    webPreferences: {
      enableBlinkFeatures: 'FontAccess, AudioVideoTracks',
      backgroundThrottling: false,
      nodeIntegrationInWorker: true,
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
      mainWindow.loadURL('http://localhost:5173/' + token)
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
    mainWindow.loadURL('http://localhost:5173/')
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  let crashcount = 0
  mainWindow.webContents.on('render-process-gone', (e, { reason }) => {
    if (reason === 'crashed') {
      if (++crashcount > 10) {
        dialog.showMessageBox({ message: 'Crashed too many times.', title: 'Miru', detail: 'App crashed too many times. For a fix visit https://github.com/ThaUnknown/miru/blob/master/docs/faq.md#miru-crashed-too-many-times', icon: '/renderer/public/logo.ico' })
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
