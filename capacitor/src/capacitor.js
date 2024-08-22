/* globals navigationbar, PictureInPicture */
import { StatusBar, Style } from '@capacitor/status-bar'
import { SafeArea } from 'capacitor-plugin-safe-area'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { IntentUri } from 'capacitor-intent-uri'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Device } from '@capacitor/device'
import { FolderPicker } from 'capacitor-folder-picker'
import { toast } from 'svelte-sonner'
import IPC from './ipc.js'

IPC.on('open', url => Browser.open({ url }))
IPC.on('intent', async url => {
  await IntentUri.openUri({ url })
  IPC.emit('intent-end')
})

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

IPC.on('get-device-info', async () => {
  const deviceInfo = {
    features: {},
    info: await Device.getInfo(),
    cpu: {},
    ram: {}
  }
  IPC.emit('device-info', JSON.stringify(deviceInfo))
})

const STORAGE_TYPE_MAP = {
  primary: '/sdcard/',
  secondary: '/sdcard/'
}

IPC.on('dialog', async () => {
  const result = await FolderPicker.chooseFolder()
  const normalizedPath = decodeURIComponent(result.path)

  const [, uri, ...path] = normalizedPath.split(':')
  const [,, app, subpath, type, ...rest] = uri.split('/')

  if (app !== 'com.android.externalstorage.documents') return toast.error('Unverified app', { description: 'Expected com.android.externalstorage.documents, got: ' + app })
  if (rest.length) return toast.error('Unsupported uri', { description: 'Unxpected access type, got: tree/' + rest.join('/') })
  if (subpath !== 'tree') return toast.error('Unsupported subpath type', { description: 'Expected tree subpath, got: ' + subpath })

  let base = STORAGE_TYPE_MAP[type]
  if (!base) {
    if (!/[a-z0-9]{4}-[a-z0-9]{4}/i.test(type)) return toast.error('Unsupported storage type')
    base = `/storage/${type}/`
  }
  IPC.emit('path', base + path.join(''))
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

// hook into pip request, and use our own pip implementation, then instantly report exit pip
// this is more like DOM PiP, rather than video PiP
HTMLVideoElement.prototype.requestPictureInPicture = function () {
  PictureInPicture.enter(this.videoWidth, this.videoHeight, success => {
    this.dispatchEvent(new Event('leavepictureinpicture'))
    if (success) document.querySelector('.content-wrapper').requestFullscreen()
  }, err => {
    this.dispatchEvent(new Event('leavepictureinpicture'))
    console.error(err)
  })

  return Promise.resolve({})
}
