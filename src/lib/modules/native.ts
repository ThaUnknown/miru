/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { Native, AuthResponse } from '../../app'

globalThis.authAL ??= (url: string) => {
  return new Promise<AuthResponse>((resolve, reject) => {
    const popup = open(url, 'authframe', 'popup')
    if (!popup) {
      reject(new Error('Failed to open popup'))
      return
    }

    popup.onload = () => {
      if (popup.location.hash.startsWith('#access_token=')) {
        const search = Object.fromEntries(new URLSearchParams(popup.location.hash.replace('#', '?')).entries()) as unknown as AuthResponse
        resolve(search)
        popup.close()
      }
    }
  })
}

globalThis.restart ??= async () => location.reload()
globalThis.openURL ??= async (url: string) => {
  open(url)
}
globalThis.selectPlayer ??= async () => 'mpv'
globalThis.selectDownload ??= async () => '/tmp/webtorrent'
globalThis.share ??= (...args) => navigator.share(...args)
globalThis.setAngle ??= async () => undefined
globalThis.getLogs ??= async () => ''
globalThis.getDeviceInfo ??= async () => ({})
globalThis.openUIDevtools ??= async () => undefined
globalThis.openTorrentDevtools ??= async () => undefined
globalThis.minimise ??= async () => undefined
globalThis.maximise ??= async () => undefined
globalThis.close ??= async () => undefined
globalThis.checkUpdate ??= async () => undefined
globalThis.toggleDiscordDetails ??= async () => undefined

const native = globalThis as Native

export default native
