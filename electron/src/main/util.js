import { app, ipcMain, shell } from 'electron'
import store from './store.js'

export const development = process.env.NODE_ENV?.trim() === 'development'

const flags = [
  // not sure if safe?
  ['disable-gpu-sandbox'], ['disable-direct-composition-video-overlays'], ['double-buffer-compositing'], ['enable-zero-copy'], ['ignore-gpu-blocklist'],
  // should be safe
  ['enable-hardware-overlays', 'single-fullscreen,single-on-top,underlay'],
  // safe performance stuff
  ['enable-features', 'PlatformEncryptedDolbyVision,CanvasOopRasterization,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation'],
  // disabling shit, vulkan rendering, widget layering aka right click context menus [I think] for macOS [I think]
  ['disable-features', 'Vulkan,WidgetLayering'],
  // utility stuff, aka website security that's useless for a native app:
  ['autoplay-policy', 'no-user-gesture-required'], ['disable-notifications'], ['disable-logging'], ['disable-permissions-api'], ['no-sandbox'], ['no-zygote'], ['bypasscsp-schemes'],
  ['force_high_performance_gpu', 'disable-renderer-backgroundin']
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
