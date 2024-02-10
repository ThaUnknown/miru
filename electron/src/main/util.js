import { app, dialog, shell } from 'electron'
import store from './store.js'
import Discord from './discord.js'
import Protocol from './protocol.js'
import Updater from './updater.js'

export const development = process.env.NODE_ENV?.trim() === 'development'

export class Util {
  mainWindow
  discord
  protocol
  updater
  /**
   * @param {import('electron').BrowserWindow} mainWindow
   */
  constructor (mainWindow) {
    this.mainWindow = mainWindow
    this.discord = new Discord(mainWindow)
    this.protocol = new Protocol(mainWindow)
    this.updater = new Updater()
  }

  close () {
    this.mainWindow = null
    // try {
    //   this.webtorrentWindow.webContents.postMessage('destroy', null)
    // } catch (e) {}
    app.quit()
  }

  open (url) {
    shell.openExternal(url)
  }

  doh (dns) {
    try {
      const url = new URL(dns)

      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [url.toString()]
      })
    } catch (e) {}
  }

  angle (angle) {
    return store.set('angle', angle)
  }

  async dialog () {
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
      return path
    }
  }

  version () {
    return app.getVersion()
  }
}

const flags = [
  ['disable-gpu-sandbox'],
  ['disable-direct-composition-video-overlays'],
  ['double-buffer-compositing'],
  ['enable-gpu-rasterization'],
  ['enable-zero-copy'],
  ['ignore-gpu-blocklist'],
  ['enable-hardware-overlays', 'single-fullscreen,single-on-top,underlay'],
  ['enable-features', 'PlatformEncryptedDolbyVision,EnableDrDc,CanvasOopRasterization,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation'],
  ['force_high_performance_gpu'],
  ['disable-features', 'Vulkan,CalculateNativeWinOcclusion,WidgetLayering'],
  ['disable-color-correct-rendering'],
  ['autoplay-policy', 'no-user-gesture-required'], ['disable-notifications'], ['disable-logging'], ['disable-permissions-api'], ['no-sandbox'], ['no-zygote'],
  ['bypasscsp-schemes'],
  ['force-color-profile', 'srgb'] // TODO: should this be "scrgb-linear"?
]
for (const [flag, value] of flags) {
  app.commandLine.appendSwitch(flag, value)
}

app.commandLine.appendSwitch('use-angle', store.get('angle') || 'default')

if (!app.requestSingleInstanceLock()) app.quit()

app.setJumpList?.([
  {
    name: 'Frequent',
    items: [
      {
        type: 'task',
        program: 'miru://schedule/',
        title: 'Airing Schedule',
        description: 'Open The Airing Schedule'
      },
      {
        type: 'task',
        program: 'miru://w2g/',
        title: 'Watch Together',
        description: 'Create a New Watch Together Lobby'
      },
      {
        type: 'task',
        program: 'miru://donate/',
        title: 'Donate',
        description: 'Support This App'
      }
    ]
  }
])
// mainWindow.setThumbarButtons([
//   {
//     tooltip: 'button1',
//     icon: nativeImage.createFromPath('path'),
//     click () { console.log('button1 clicked') }
//   }, {
//     tooltip: 'button2',
//     icon: nativeImage.createFromPath('path'),
//     click () { console.log('button2 clicked.') }
//   }
// ])
