/* globals navigationbar */
import { StatusBar, Style } from '@capacitor/status-bar'
import { SafeArea } from 'capacitor-plugin-safe-area'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { LocalNotifications } from '@capacitor/local-notifications'
import IPC from './ipc.js'

IPC.on('open', url => Browser.open({ url }))

App.addListener('appUrlOpen', ({ url }) => handleProtocol(url))

let canShowNotifications = false

LocalNotifications.checkPermissions().then(async value => {
  if (value) {
    try {
      await LocalNotifications.requestPermissions()
      canShowNotifications = true
    } catch (e) {
      console.error(e)
    }
  }
})

let id = 0
IPC.on('notification', noti => {
  /** @type {import('@capacitor/local-notifications').LocalNotificationSchema} */
  const notification = {
    title: noti.title,
    body: noti.body,
    id: id++,
    attachments: [
      {
        id: '' + id++,
        url: noti.icon
      }
    ]
  }
  if (canShowNotifications) LocalNotifications.schedule({ notifications: [notification] })
})

// schema: miru://key/value
const protocolMap = {
  auth: token => sendToken(token),
  anime: id => IPC.emit('open-anime', id),
  w2g: link => IPC.emit('w2glink', link),
  schedule: () => IPC.emit('schedule'),
  donate: () => Browser.open({ url: 'https://github.com/sponsors/ThaUnknown/' })
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
    IPC.emit('altoken', token)
  }
}

App.getLaunchUrl().then(res => {
  if (location.hash !== '#skipAlLogin') {
    location.hash = '#skipAlLogin'
    if (res) handleProtocol(res.url)
  } else {
    location.hash = ''
  }
})

SafeArea.addListener('safeAreaChanged', updateInsets)
screen.orientation.addEventListener('change', updateInsets)

async function updateInsets () {
  const { insets } = await SafeArea.getSafeAreaInsets()
  for (const [key, value] of Object.entries(insets)) {
    document.documentElement.style.setProperty(`--safe-area-${key}`, `${value}px`)
  }
}
updateInsets()

StatusBar.hide()
StatusBar.setStyle({ style: Style.Dark })
StatusBar.setOverlaysWebView({ overlay: true })

navigationbar.setUp(true)

// cordova screen orientation plugin is also used, and it patches global screen.orientation.lock
