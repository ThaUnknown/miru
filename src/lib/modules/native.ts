import type { AuthResponse, Native, TorrentInfo } from '../../app'

import { sleep } from '$lib/utils'

const rnd = (range = 100) => Math.floor(Math.random() * range)

const dummyFiles = [
  {
    name: 'AmebkuUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU.webm',
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
// function makeRandomPeer (): PeerInfo {
//   const ip = `${rnd(256)}.${rnd(256)}.${rnd(256)}.${rnd(256)}:${rnd(65536)}`
//   return {
//     ip,
//     seeder: Math.random() < 0.5,
//     client: ['qBittorrent 4.5.4', 'WebTorrent 1.0.0', 'Transmission 3.00', 'Deluge 2.1.1', 'μTorrent 3.5.5', 'Vuze 5.7.7.0', 'Azureus 5.7.6.0'].sort(() => Math.random() - 0.5)[0]!,
//     progress: Math.random(),
//     size: {
//       downloaded: rnd(1000000),
//       uploaded: rnd(1000000)
//     },
//     speed: {
//       down: rnd(1000),
//       up: rnd(1000)
//     },
//     time: rnd(1000),
//     flags: (['encrypted', 'utp', 'incoming', 'outgoing'] as const).filter(() => Math.random() < 0.5).slice(0, 3)
//   }
// }
// const dummyPeerInfo: PeerInfo[] = []
// for (let i = 0; i < 100; i++) {
//   dummyPeerInfo.push(makeRandomPeer())
// }

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
  focus: async () => undefined,
  close: async () => undefined,
  checkUpdate: async () => undefined,
  updateAndRestart: async () => undefined,
  updateReady: () => sleep(rnd(10_000)),
  toggleDiscordDetails: async () => undefined,
  setMediaSession: async (metadata) => { navigator.mediaSession.metadata = new MediaMetadata({ title: metadata.title, artist: metadata.description, artwork: [{ src: metadata.image }] }) },
  setPositionState: async e => navigator.mediaSession.setPositionState(e),
  setPlayBackState: async e => { navigator.mediaSession.playbackState = e },
  setActionHandler: async (...args) => navigator.mediaSession.setActionHandler(...args as [action: MediaSessionAction, handler: MediaSessionActionHandler | null]),
  checkAvailableSpace: () => new Promise(resolve => setTimeout(() => resolve(Math.floor(Math.random() * (1e10 - 1e8 + 1) + 1e8)), 1000)),
  checkIncomingConnections: () => new Promise(resolve => setTimeout(() => resolve(false), 1000)),
  updatePeerCounts: async () => [],
  isApp: false,
  playTorrent: async () => dummyFiles,
  library: async () => [],
  attachments: async () => [],
  tracks: async () => [],
  subtitles: async () => undefined,
  chapters: async () => [
    { start: 5 * 1000, end: 15 * 1000, text: 'OP' },
    { start: 1.0 * 60 * 1000, end: 1.2 * 60 * 1000, text: 'Chapter 1' },
    { start: 1.4 * 60 * 1000, end: 88 * 1000, text: 'Chapter 2 ' }
  ],
  version: async () => 'v6.4.4',
  updateSettings: async () => undefined,
  setDOH: async () => undefined,
  cachedTorrents: async () => ['40a9047de61859035659e449d7b84286934486b0'],
  spawnPlayer: () => sleep(rnd(100_000)),
  setHideToTray: async () => undefined,
  transparency: async () => undefined,
  setZoom: async () => undefined,
  navigate: async () => undefined,
  downloadProgress: async () => undefined,
  updateProgress: async () => undefined,
  torrentInfo: async (): Promise<TorrentInfo> => ({
    name: '',
    progress: 0,
    size: { total: 0, downloaded: 0, uploaded: 0 },
    speed: { down: 0, up: 0 },
    time: { remaining: 0, elapsed: 0 },
    peers: { seeders: 0, leechers: 0, wires: 0 },
    pieces: { total: 0, size: 0 },
    hash: ''
  }),
  fileInfo: async () => [],
  peerInfo: async () => [],
  protocolStatus: async () => ({
    dht: false,
    lsd: false,
    pex: false,
    nat: false,
    forwarding: false,
    persisting: false,
    streaming: false
  }),
  defaultTransparency: () => false,
  errors: async () => undefined,
  debug: async () => undefined
  // @ts-expect-error idk
}, globalThis.native as Partial<Native>)
