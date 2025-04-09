// See https://kit.svelte.dev/docs/types#app

import type { SessionMetadata } from '$lib/components/ui/player/util'
import type { Search } from '$lib/modules/anilist/queries'
import type { VariablesOf } from 'gql.tada'

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

export interface Native {
  authAL: (url: string) => Promise<AuthResponse>
  restart: () => Promise<void>
  openURL: (url: string) => Promise<void>
  share: Navigator['share']
  minimise: () => Promise<void>
  maximise: () => Promise<void>
  close: () => Promise<void>
  selectPlayer: () => Promise<string>
  selectDownload: () => Promise<string>
  setAngle: (angle: string) => Promise<void>
  getLogs: () => Promise<string>
  getDeviceInfo: () => Promise<unknown>
  openUIDevtools: () => Promise<void>
  openTorrentDevtools: () => Promise<void>
  checkUpdate: () => Promise<void>
  toggleDiscordDetails: (enabled: boolean) => Promise<void>
  setMediaSession: (metadata: SessionMetadata) => Promise<void>
  setPositionState: (state?: MediaPositionState) => Promise<void>
  setPlayBackState: (paused: 'none' | 'paused' | 'playing') => Promise<void>
  setActionHandler: (action: MediaSessionAction | 'enterpictureinpicture', handler: MediaSessionActionHandler | null) => void
  checkAvailableSpace: (_?: unknown) => Promise<number>
  checkIncomingConnections: (_?: unknown) => Promise<boolean>
  updatePeerCounts: (hashes: string[]) => Promise<Array<{ hash: string, complete: string, downloaded: string, incomplete: string }>>
  playTorrent: (id: string) => Promise<TorrentFile[]>
  attachments: (hash: string, id: number) => Promise<Attachment[]>
  tracks: (hash: string, id: number) => Promise<Array<{ number: string, language?: string, type: string, header: string, name?: string }>>
  subtitles: (hash: string, id: number, cb: (subtitle: { text: string, time: number, duration: number }, trackNumber: number) => void) => Promise<void>
  chapters: (hash: string, id: number) => Promise<Array<{ start: number, end: number, text: string }>>
  isApp: boolean
  version: () => string
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
}

export {}
