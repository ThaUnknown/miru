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
  function authAL (url: string): Promise<AuthResponse>
  function restart (): Promise<void>
  function openURL (url: string): Promise<void>
  function share (...args: Parameters<Navigator['share']>): ReturnType<Navigator['share']>
  function minimise (): Promise<void>
  function maximise (): Promise<void>
  function close (): Promise<void>
  function selectPlayer (): Promise<string>
  function selectDownload (): Promise<string>
  function setAngle (angle: string): Promise<void>
  function getLogs (): Promise<string>
  function getDeviceInfo (): Promise<unknown>
  function openUIDevtools (): Promise<void>
  function openTorrentDevtools (): Promise<void>
  function checkUpdate (): Promise<void>
  function toggleDiscordDetails (enabled: boolean): Promise<void>
  function setMediaSession (metadata: SessionMetadata): Promise<void>
  function setPositionState (state?: MediaPositionState): Promise<void>
  function setPlayBackState (paused: 'none' | 'paused' | 'playing'): Promise<void>
  function setActionHandler (...args: Parameters<Navigator['mediaSession']['setActionHandler']>): ReturnType<Navigator['mediaSession']['setActionHandler']>

  function setTimeout (handler: TimerHandler, timeout?: number): number & { unref?: () => void }

  interface MediaSession {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSession/setActionHandler) */
    setActionHandler: (action: MediaSessionAction | 'enterpictureinpicture', handler: MediaSessionActionHandler | null) => void
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
