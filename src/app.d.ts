// See https://kit.svelte.dev/docs/types#app
import type { SessionMetadata } from '$lib/components/ui/player/util'
import type { Search } from '$lib/modules/anilist/queries'
import type { VariablesOf } from 'gql.tada'
import type { CompositionEventHandler } from 'svelte/elements'

// for information about these interfaces
export interface AuthResponse {
  access_token: string
  expires_in: string // seconds
  token_type: 'Bearer'
}

export interface Track {
  selected: boolean
  enabled: boolean
  id: string
  kind: string
  label: string
  language: string
}

export interface TorrentFile {
  name: string
  hash: string
  type: string
  size: number
  path: string
  url: string
  id: number
}

export interface Attachment {
  filename: string
  mimetype: string
  id: number
  url: string
}

export interface TorrentInfo {
  name: string
  progress: number
  size: {
    total: number
    downloaded: number
    uploaded: number
  }
  speed: {
    down: number
    up: number
  }
  time: {
    remaining: number
    elapsed: number
  }
  peers: {
    seeders: number
    leechers: number
    wires: number
  }
  pieces: {
    total: number
    size: number
  }
  hash: string
}

export interface PeerInfo {
  ip: string
  seeder: boolean
  client: string
  progress: number
  size: {
    downloaded: number
    uploaded: number
  }
  speed: {
    down: number
    up: number
  }
  flags: Array<'incoming' | 'outgoing' | 'utp' | 'encrypted'>
  time: number
}

export interface FileInfo {
  name: string
  size: number
  progress: number
  selections: number
}

export interface TorrentSettings {
  torrentPersist: boolean
  torrentDHT: boolean
  torrentStreamedDownload: boolean
  torrentSpeed: number
  maxConns: number
  torrentPort: number
  dhtPort: number
  torrentPeX: boolean
}

export interface Native {
  authAL: (url: string) => Promise<AuthResponse>
  restart: () => Promise<void>
  openURL: (url: string) => Promise<void>
  share: Navigator['share']
  minimise: () => Promise<void>
  maximise: () => Promise<void>
  focus: () => Promise<void>
  close: () => Promise<void>
  selectPlayer: () => Promise<string>
  selectDownload: () => Promise<string>
  setAngle: (angle: string) => Promise<void>
  getLogs: () => Promise<string>
  getDeviceInfo: () => Promise<unknown>
  openUIDevtools: () => Promise<void>
  openTorrentDevtools: () => Promise<void>
  checkUpdate: () => Promise<void>
  updateAndRestart: () => Promise<void>
  updateReady: () => Promise<void>
  toggleDiscordDetails: (enabled: boolean) => Promise<void>
  setMediaSession: (metadata: SessionMetadata, mediaId: number) => Promise<void>
  setPositionState: (state?: MediaPositionState) => Promise<void>
  setPlayBackState: (paused: 'none' | 'paused' | 'playing') => Promise<void>
  setActionHandler: (action: MediaSessionAction | 'enterpictureinpicture', handler: MediaSessionActionHandler | null) => void
  checkAvailableSpace: (_?: unknown) => Promise<number>
  checkIncomingConnections: (port: number) => Promise<boolean>
  updatePeerCounts: (hashes: string[]) => Promise<Array<{ hash: string, complete: string, downloaded: string, incomplete: string }>>
  playTorrent: (id: string) => Promise<TorrentFile[]>
  attachments: (hash: string, id: number) => Promise<Attachment[]>
  tracks: (hash: string, id: number) => Promise<Array<{ number: string, language?: string, type: string, header?: string, name?: string }>>
  subtitles: (hash: string, id: number, cb: (subtitle: { text: string, time: number, duration: number }, trackNumber: number) => void) => Promise<void>
  errors: (cb: (error: Error) => void) => Promise<void>
  chapters: (hash: string, id: number) => Promise<Array<{ start: number, end: number, text: string }>>
  torrentInfo: (hash: string) => Promise<TorrentInfo>
  peerInfo: (hash: string) => Promise<PeerInfo[]>
  fileInfo: (hash: string) => Promise<FileInfo[]>
  protocolStatus: (hash: string) => Promise<{
    dht: boolean
    lsd: boolean
    pex: boolean
    nat: boolean
    forwarding: boolean
    persisting: boolean
    streaming: boolean
  }>
  setDOH: (dns: string) => Promise<void>
  cachedTorrents: () => Promise<string[]>
  downloadProgress: (percent: number) => Promise<void>
  updateSettings: (settings: TorrentSettings) => Promise<void>
  updateProgress: (cb: (progress: number) => void) => Promise<void>
  spawnPlayer: (url: string) => Promise<void>
  setHideToTray: (enabled: boolean) => Promise<void>
  transparency: (enabled: boolean) => Promise<void>
  setZoom: (scale: number) => Promise<void>
  isApp: boolean
  version: () => Promise<string>
  navigate: (cb: (data: { target: string, value: string | undefined }) => void) => Promise<void>
  defaultTransparency: () => boolean
  debug: (levels: string) => Promise<void>
}

declare global {

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}

    interface PageState {
      search?: VariablesOf<typeof Search>
    }
    // interface Platform {}
  }

  interface HTMLMediaElement {
    videoTracks?: Track[]
    audioTracks?: Track[]
  }

  interface ScreenOrientation {
    lock: (orientation: 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary') => Promise<void>
  }

  interface Navigator {
    userAgentData: {
      getHighEntropyValues: (keys: string[]) => Promise<Record<string, string>>
    }
  }

  declare namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:navigate'?: CompositionEventHandler<T>
    }
  }

  // declare module '*.svelte' {
  //   export default SvelteComponentTyped
  // }
}

export {}
