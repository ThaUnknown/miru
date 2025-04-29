import type { AuthResponse, Native, TorrentInfo } from '../../app'

import { sleep } from '$lib/utils'

const rnd = (range = 100) => Math.floor(Math.random() * range)

const dummyFiles = [
  {
    name: 'Amebku.webm',
    hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'video/webm',
    size: 1234567890,
    path: '/Amebku.webm',
    url: '/Ameku.webm',
    id: 0
  }
// {
//   name: 'My Happy Marriage Season 2.mkv',
//   hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
//   type: 'video/mkv',
//   size: 1234567890,
//   path: '/video.mkv',
//   url: '/video.mkv',
//   id: 1
// }
]

export default Object.assign<Native, Partial<Native>>({
  authAL: (url: string) => {
    return new Promise<AuthResponse>((resolve, reject) => {
      const popup = open(url, 'authframe', 'popup')
      if (!popup) return reject(new Error('Failed to open popup'))
      const check = () => {
        if (popup.closed) return reject(new Error('Popup closed'))
        try {
          if (popup.location.hash.startsWith('#access_token=')) {
            const search = Object.fromEntries(new URLSearchParams(popup.location.hash.replace('#', '?')).entries()) as unknown as AuthResponse
            resolve(search)
            popup.close()
            return
          }
        } catch (e) {}
        setTimeout(check, 100)
      }
      check()
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
  isApp: false,
  playTorrent: async () => dummyFiles,
  attachments: async () => [],
  tracks: async () => [],
  subtitles: async () => undefined,
  chapters: async () => [
    { start: 5, end: 15, text: 'OP' },
    { start: 1.0 * 60, end: 1.2 * 60, text: 'Chapter 1' },
    { start: 1.4 * 60, end: 88, text: 'Chapter 2 ' }
  ],
  version: async () => 'v6.1.0',
  updateSettings: async () => undefined,
  setDOH: async () => undefined,
  cachedTorrents: async () => ['40a9047de61859035659e449d7b84286934486b0'],
  spawnPlayer: () => sleep(rnd(100_000)),
  setHideToTray: async () => undefined,
  updateProgress: async (cb: (progress: number) => void) => undefined,
  torrentStats: async (): Promise<TorrentInfo> => ({ peers: rnd(), seeders: rnd(), leechers: rnd(), progress: Math.random(), down: rnd(100000000), up: rnd(100000000), name: 'Amebku.webm', downloaded: rnd(100000), hash: '1234567890abcdef', size: 1234567890, eta: rnd() }),
  torrents: async (): Promise<TorrentInfo[]> => [{ peers: rnd(), seeders: rnd(), leechers: rnd(), progress: Math.random(), down: rnd(100000000), up: rnd(100000000), name: 'Amebku.webm', downloaded: rnd(100000), hash: '1234567890abcdef', size: 1234567890, eta: rnd() }]
  // @ts-expect-error idk
}, globalThis.native as Partial<Native>)
