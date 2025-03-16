import type { AuthResponse, Native } from '../../app'

const native: Native = {
  authAL: (url: string) => {
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
  },
  restart: async () => location.reload(),
  openURL: async (url: string) => { open(url) },
  selectPlayer: async () => 'mpv',
  selectDownload: async () => '/tmp/webtorrent',
  share: (...args) => navigator.share(...args),
  setAngle: async () => undefined,
  getLogs: async () => '',
  getDeviceInfo: async () => ({}),
  openUIDevtools: async () => undefined,
  openTorrentDevtools: async () => undefined,
  minimise: async () => undefined,
  maximise: async () => undefined,
  close: async () => undefined,
  checkUpdate: async () => undefined,
  toggleDiscordDetails: async () => undefined,
  setMediaSession: async (metadata) => { navigator.mediaSession.metadata = new MediaMetadata({ title: metadata.title, artist: metadata.description, artwork: [{ src: metadata.image }] }) },
  setPositionState: async e => navigator.mediaSession.setPositionState(e),
  setPlayBackState: async e => { navigator.mediaSession.playbackState = e },
  setActionHandler: async (...args) => navigator.mediaSession.setActionHandler(...args as [action: MediaSessionAction, handler: MediaSessionActionHandler | null]),
  isApp: false
}

globalThis.native ??= native

export default globalThis.native
