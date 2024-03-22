import { app, ipcMain, shell, dialog } from 'electron'
import store from './store.js'

export const development = process.env.NODE_ENV?.trim() === 'development'

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

ipcMain.on('open', (event, url) => {
  shell.openExternal(url)
})

ipcMain.on('doh', (event, dns) => {
  try {
    app.configureHostResolver({
      secureDnsMode: 'secure',
      secureDnsServers: ['' + new URL(dns)]
    })
  } catch (e) {}
})

ipcMain.on('angle', (e, data) => {
  store.set('angle', data)
})

ipcMain.on('close', () => {
  app.quit()
})

ipcMain.on('dialog', async ({ sender }) => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
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
    sender.send('path', path)
  }
})

ipcMain.on('version', ({ sender }) => {
  sender.send('version', app.getVersion()) // fucking stupid
})

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
