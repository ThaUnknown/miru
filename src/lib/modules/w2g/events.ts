import type { ChatUser } from '$lib/components/ui/chat'

export default class Event<K extends keyof W2GEvents = keyof W2GEvents> {
  readonly type: K
  readonly payload: W2GEvents[K]

  constructor (type: K, payload: W2GEvents[K]) {
    this.type = type
    this.payload = payload
  }
}

export interface PlayerState { paused: boolean, time: number }

export interface MediaState { torrent: string, mediaId: number, episode: number }

export interface W2GEvents {
  init: ChatUser
  media?: MediaState
  index?: number
  player: PlayerState
  message: string
}
