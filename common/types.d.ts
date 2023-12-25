import type { SvelteComponentTyped } from 'svelte'

export {}

type Track = {
  selected: boolean
  enabled: boolean
  id: string
  kind: string
  label: string
  language: string
}

declare global {
  interface Window {
    IPC: any
    port: MessagePort
    version: {
      platform: string
      arch: string
    }
  }
  interface EventTarget {
    on: (type: string, callback: (any) => void, options?: boolean | {}) => void
    once: (type: string, callback: (any) => void, options?: boolean | {}) => void
    emit: (type: string, data?: any) => void
    dispatch: (type: string, data?: any) => void
    removeListener: (type: string, callback: (any) => void) => void
    off: (type: string, callback: (any) => void) => void
  }
  interface HTMLMediaElement {
    videoTracks: Track[]
    audioTracks: Track[]
  }
}

declare module '*.svelte' {
  export default SvelteComponentTyped
}
