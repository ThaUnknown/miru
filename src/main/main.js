import { app, BrowserWindow, protocol, shell, ipcMain, dialog, MessageChannelMain } from 'electron'
import path from 'path'
import { Client } from 'discord-rpc'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

const flags = [
  ['enable-gpu-rasterization'],
  ['enable-zero-copy'],
  ['ignore-gpu-blocklist'],
  ['enable-hardware-overlays', 'single-fullscreen,single-on-top,underlay'],
  ['enable-features', 'EnableDrDc,CanvasOopRasterization,BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilationEnableDrDc,CanvasOopRasterization,BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation'],
  ['force_high_performance_gpu'],
  ['disable-features', 'Vulkan']
]
for (const [flag, value] of flags) {
  app.commandLine.appendSwitch(flag, value)
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('miru', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('miru')
  if (process.argv.length >= 2) {
    ipcMain.on('version', () => {
      for (const line of process.argv) {
        handleProtocol(line)
      }
    })
  }
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
  anime: id => mainWindow.webContents.send('open-anime', id),
  w2g: link => mainWindow.webContents.send('w2glink', link),
  schedule: () => mainWindow.webContents.send('schedule'),
  donate: () => shell.openExternal('https://github.com/sponsors/ThaUnknown/')
}
const protocolRx = /miru:\/\/([a-z0-9]+)\/(.*)/i
function handleProtocol (text) {
  const match = text.match(protocolRx)
  if (match) protocolMap[match[1]]?.(match[2])
}

function sendToken (line) {
  let token = line.split('access_token=')[1].split('&token_type')[0]
  if (token) {
    if (token.endsWith('/')) token = token.slice(0, -1)
    mainWindow.webContents.send('altoken', token)
  }
}

ipcMain.on('open', (event, url) => {
  shell.openExternal(url)
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let webtorrentWindow

ipcMain.on('devtools', () => {
  webtorrentWindow.webContents.openDevTools()
})

ipcMain.on('doh', (event, dns) => {
  app.configureHostResolver({
    secureDnsMode: 'secure',
    secureDnsServers: [dns]
  })
})

app.setJumpList([
  {
    name: 'Frequent',
    items: [
      {
        type: 'task',
        program: process.execPath,
        args: 'miru://schedule/',
        title: 'Airing Schedule',
        description: 'Open The Airing Schedule'
      },
      {
        type: 'task',
        program: process.execPath,
        args: 'miru://w2g/',
        title: 'Watch Together',
        description: 'Create a New Watch Together Lobby'
      },
      {
        type: 'task',
        program: process.execPath,
        args: 'miru://donate/',
        title: 'Donate',
        description: 'Support This App'
      }
    ]
  }
])

function createWindow () {
  const development = process.env.NODE_ENV?.trim() === 'development'
  // Create the browser window.
  webtorrentWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false
    }
  })
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: process.platform === 'darwin', // Only keep the native frame on Mac
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#17191c',
      symbolColor: '#eee',
      height: 28
    },
    backgroundColor: '#17191c',
    autoHideMenuBar: true,
    webPreferences: {
      enableBlinkFeatures: 'FontAccess, AudioVideoTracks',
      backgroundThrottling: false,
      preload: path.join(__dirname, '/preload.js')
    },
    icon: path.join(__dirname, '/logo.ico'),
    show: false
  })
  mainWindow.setMenuBarVisibility(false)

  // console.log(mainWindow.setThumbarButtons([
  //   {
  //     tooltip: 'button1',
  //     icon: nativeImage.createFromPath('path'),
  //     click () { console.log('button1 clicked') }
  //   }, {
  //     tooltip: 'button2',
  //     icon: nativeImage.createFromPath('path'),
  //     click () { console.log('button2 clicked.') }
  //   }
  // ]))

  protocol.registerHttpProtocol('miru', (req, cb) => {
    const token = req.url.slice(7)
    if (development) {
      mainWindow.loadURL(path.join(__dirname, '/app.html' + token))
    } else {
      mainWindow.loadURL('http://localhost:5000/app.html' + token)
    }
  })

  mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: ['https://sneedex.moe/api/public/nyaa', 'http://animetosho.org/storage/torrent/*'] }, ({ responseHeaders }, fn) => {
    responseHeaders['Access-Control-Allow-Origin'] = '*'

    fn({ responseHeaders })
  })

  let torrentLoad = null

  if (!development) {
    // Load production build
    torrentLoad = webtorrentWindow.loadFile(path.join(__dirname, '/background.html'))
    mainWindow.loadFile(path.join(__dirname, '/app.html'))
  } else {
    // Load vite dev server page
    console.log('Development mode')
    torrentLoad = webtorrentWindow.loadURL('http://localhost:5000/background.html')
    webtorrentWindow.webContents.openDevTools()
    mainWindow.loadURL('http://localhost:5000/app.html')
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    app.quit()
  })

  let crashcount = 0
  mainWindow.webContents.on('render-process-gone', (e, { reason }) => {
    if (reason === 'crashed') {
      if (++crashcount > 10) {
        dialog.showMessageBox({ message: 'Crashed too many times.', title: 'Miru', detail: 'App crashed too many times. For a fix visit https://github.com/ThaUnknown/miru/blob/master/docs/faq.md#miru-crashed-too-many-times', icon: '/renderer/public/logo.ico' }).then(() => {
          shell.openExternal('https://github.com/ThaUnknown/miru/blob/master/docs/faq.md#miru-crashed-too-many-times')
          app.quit()
        })
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
  ipcMain.on('portRequest', async ({ sender }) => {
    const { port1, port2 } = new MessageChannelMain()
    await torrentLoad
    webtorrentWindow.webContents.postMessage('port', null, [port1])
    sender.postMessage('port', null, [port2])
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

ipcMain.on('dialog', async (event, data) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (filePaths.length) {
    let path = filePaths[0]
    if (!(path.endsWith('\\') || path.endsWith('/'))) {
      if (path.indexOf('\\') !== -1) {
        path += '\\'
      } else if (path.indexOf('/') !== -1) {
        path += '/'
      }
    }
    event.sender.send('path', path)
  }
})

let status = null
const discord = new Client({
  transport: 'ipc'
})

function setDiscordRPC (data) {
  if (!data) {
    data = {
      activity: {
        timestamps: {
          start: Date.now()
        },
        details: 'Stream anime torrents, real-time.',
        state: 'Watching anime',
        assets: {
          small_image: 'logo',
          small_text: 'https://github.com/ThaUnknown/miru'
        },
        buttons: [
          {
            label: 'Download app',
            url: 'https://github.com/ThaUnknown/miru/releases/latest'
          }
        ],
        instance: true,
        type: 3
      }
    }
  }
  status = data
  if (discord?.user && status) {
    status.pid = process.pid
    discord.request('SET_ACTIVITY', status)
  }
}

let allowDiscordDetails = false
let requestedDiscordDetails = false
let rpcStarted = false
let cachedPresence = null

ipcMain.on('discord_status', (event, data) => {
  requestedDiscordDetails = data
  if (!rpcStarted) {
    handleRPC()
    setInterval(handleRPC, 5000) // According to Discord documentation, clients can only update their presence 5 times per 20 seconds. We will add an extra second to be safe.
    rpcStarted = true
  }
})

function handleRPC () {
  if (allowDiscordDetails === requestedDiscordDetails) return

  allowDiscordDetails = requestedDiscordDetails
  if (!allowDiscordDetails) {
    setDiscordRPC(null)
  } else if (cachedPresence) {
    setDiscordRPC(cachedPresence)
  }
}

ipcMain.on('discord', (event, data) => {
  cachedPresence = data
  if (allowDiscordDetails) {
    setDiscordRPC(data)
  }
})
discord.on('ready', async () => {
  setDiscordRPC(status)
  discord.subscribe('ACTIVITY_JOIN_REQUEST')
  discord.subscribe('ACTIVITY_JOIN')
  discord.subscribe('ACTIVITY_SPECTATE')
})
discord.on('ACTIVITY_JOIN', (args) => {
  BrowserWindow.getAllWindows()[0]?.send('w2glink', args.secret)
})

function loginRPC () {
  discord.login({ clientId: '954855428355915797' }).catch(() => {
    setTimeout(loginRPC, 5000).unref()
  })
}
loginRPC()

ipcMain.on('version', (event) => {
  event.sender.send('version', app.getVersion()) // fucking stupid
})

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
ipcMain.on('update', () => {
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.checkForUpdatesAndNotify()
autoUpdater.on('update-available', () => {
  BrowserWindow.getAllWindows()[0]?.send('update-available', true)
})
autoUpdater.on('update-downloaded', () => {
  BrowserWindow.getAllWindows()[0]?.send('update-downloaded', true)
})
