import type { AuthResponse, Native } from '../../app'

export default Object.assign<Native, Partial<Native>>({
  authAL: (url: string) => {
    return new Promise<AuthResponse>((resolve, reject) => {
      const popup = open(url, 'authframe', 'popup')
      if (!popup) return reject(new Error('Failed to open popup'))

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
  checkAvailableSpace: () => new Promise(resolve => setTimeout(() => resolve(Math.floor(Math.random() * (1e10 - 1e8 + 1) + 1e8)), 1000)),
  checkIncomingConnections: () => new Promise(resolve => setTimeout(() => resolve(Math.random() > 0.5), 5000)),
  updatePeerCounts: async () => [],
  isApp: false
}, globalThis.native)
