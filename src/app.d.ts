/* eslint-disable @typescript-eslint/no-explicit-any */
// See https://kit.svelte.dev/docs/types#app

import type { Search } from '$lib/modules/anilist/queries'
import type { VariablesOf } from 'gql.tada'

// for information about these interfaces
export interface AuthResponse {
  access_token: string
  expires_in: string // seconds
  token_type: 'Bearer'
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
  getDeviceInfo: () => Promise<any>
  openUIDevtools: () => Promise<void>
  openTorrentDevtools: () => Promise<void>
  checkUpdate: () => Promise<void>
  toggleDiscordDetails: (enabled: boolean) => Promise<void>
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
  function getDeviceInfo (): Promise<any>
  function openUIDevtools (): Promise<void>
  function openTorrentDevtools (): Promise<void>
  function checkUpdate (): Promise<void>
  function toggleDiscordDetails (enabled: boolean): Promise<void>

  function setTimeout (handler: TimerHandler, timeout?: number): number & { unref?: () => void }
}

export {}
