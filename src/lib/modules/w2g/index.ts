import { EventEmitter } from 'events'

import Debug from 'debug'
import P2PT, { type Peer } from 'p2pt'
import { writable } from 'simple-store-svelte'

import client from '../anilist/client.js'
import { server } from '../torrent'

import Event, { type MediaState, type PlayerState, type W2GEvents } from './events.js'

import type { ChatMessage, ChatUser } from '$lib/components/ui/chat'

const debug = Debug('ui:w2g')

export function generateRandomHexCode (len: number) {
  let hexCode = ''

  while (hexCode.length < len) {
    hexCode += (Math.round(Math.random() * 15)).toString(16)
  }

  return hexCode
}

type AppEvent = {
  [K in keyof W2GEvents]-?: Event<K>
}[keyof W2GEvents]

type PeerList = Record<string, { user: ChatUser, peer?: Peer }>

const ANNOUNCE = [
  atob('d3NzOi8vdHJhY2tlci5vcGVud2VidG9ycmVudC5jb20='),
  atob('d3NzOi8vdHJhY2tlci53ZWJ0b3JyZW50LmRldg=='),
  atob('d3NzOi8vdHJhY2tlci5maWxlcy5mbTo3MDczL2Fubm91bmNl'),
  atob('d3NzOi8vdHJhY2tlci5idG9ycmVudC54eXov')
]

export class W2GClient extends EventEmitter<{index: [number], player: [PlayerState]}> {
  player: PlayerState = {
    paused: true,
    time: 0
  }

  index = 0
  media: MediaState | undefined
  isHost
  readonly #p2pt
  code
  destroyed = false

  messages = writable<ChatMessage[]>([])

  self: ChatUser = client.viewer.value?.viewer ?? { id: generateRandomHexCode(16), avatar: null, mediaListOptions: null, name: 'Guest' }
  peers = writable<PeerList>({ [this.self.id]: { user: this.self } })

  get inviteLink () {
    return `https://hayas.ee/w2g/${this.code}`
  }

  constructor (code: string, isHost: boolean) {
    super()
    this.isHost = isHost

    this.code = code

    debug(`W2GClient: ${this.code}, ${this.isHost}`)

    this.#p2pt = new P2PT<Event>(ANNOUNCE, this.code)

    this.#p2pt.on('peerconnect', peer => {
      debug(`peerconnect: ${peer.id}`)
      this._sendEvent(peer, new Event('init', this.self))

      if (this.isHost) this._sendInitialSessionState(peer)
    })

    this.#p2pt.on('peerclose', peer => {
      debug(`peerclose: ${peer.id}`)
      this.peers.update(peers => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete peers[peer.id]
        return peers
      })
    })

    this.#p2pt.on('msg', this._onMsg)

    this.#p2pt.start()
  }

  mediaChange (media: MediaState) {
    debug(`mediaChange: ${this.media?.torrent} ${media.torrent}`)
    if (this.media?.torrent !== media.torrent) {
      this.media = media
      this.isHost = true
      this._sendToPeers(new Event('media', media))
    }
  }

  mediaIndexChanged (index: number) {
    debug(`mediaIndexChanged: ${this.index} ${index}`)
    if (this.index !== index) {
      this.index = index
      this._sendToPeers(new Event('index', index))
    }
  }

  _playerStateChanged (state: PlayerState) {
    debug(`_playerStateChanged: ${this.player.paused} ${state.paused} ${this.player.time} ${state.time}`)
    if (!state) return false
    if (this.player.paused !== state.paused || this.player.time !== state.time) {
      this.player = state
      return true
    }
  }

  _remotePlayerStateChanged (state: PlayerState) {
    debug(`_remotePlayerStateChanged: ${this.player.paused} ${state.paused} ${this.player.time} ${state.time}`)
    if (!state) return false
    // allow for 1s of error
    if (Math.abs(this.player.time - state.time) > 2 || this.player.paused !== state.paused) {
      this.player = state
      return true
    }
  }

  playerStateChanged (state: PlayerState) {
    debug(`playerStateChanged: ${JSON.stringify(state)}`)
    if (this._playerStateChanged(state)) this._sendToPeers(new Event('player', state))
  }

  message (message: string) {
    debug(`message: ${message}`)
    this.messages.update(messages => [...messages, ({
      message,
      user: this.self,
      type: 'outgoing',
      date: new Date()
    })])
    this._sendToPeers(new Event('message', message))
  }

  _sendEvent (peer: Peer, event: Event) {
    debug(`sendEvent: ${peer.id} ${JSON.stringify(event)}`)
    this.#p2pt.send(peer, event)
  }

  _sendInitialSessionState (peer: Peer) {
    this._sendEvent(peer, new Event('media', this.media))
    this._sendEvent(peer, new Event('index', this.index))
    this._sendEvent(peer, new Event('player', this.player))
  }

  _onMsg = async (peer: Peer, data: AppEvent) => {
    debug(`onMsg: ${peer.id} ${JSON.stringify(data)}`)

    switch (data.type) {
      case 'init':
        this.peers.update(peers => {
          peers[peer.id] = {
            peer,
            user: data.payload
          }
          return peers
        })
        break
      case 'media': {
        if (data.payload?.torrent == null || data.payload?.mediaId == null) break
        const { torrent, mediaId, episode } = data.payload
        if (torrent !== this.media?.torrent) {
          this.isHost = false
          this.media = data.payload
          const media = (await client.single(mediaId)).data?.Media
          if (media == null) break
          server.play(torrent, media, episode)
        }

        break
      }
      case 'index': {
        if (data.payload == null) break
        if (this.index !== data.payload) {
          this.index = data.payload
          this.emit('index', data.payload)
        }
        break
      }
      case 'player': {
        if (data.payload?.time == null) break
        if (this._remotePlayerStateChanged(data.payload)) this.emit('player', data.payload)
        break
      }
      case 'message': {
        this.messages.update(messages => [...messages, ({ message: data.payload, user: this.peers.value[peer.id]!.user, type: 'incoming', date: new Date() })])
        break
      }
      default:
        console.error('Invalid message type', data)
    }
  }

  _sendToPeers (event: Event) {
    for (const { peer } of Object.values(this.peers.value)) {
      if (peer) this._sendEvent(peer, event)
    }
  }

  destroy () {
    debug('destroy')
    this.destroyed = true
    this.#p2pt.destroy()
    this.removeAllListeners()
    this.isHost = false
    this.peers.value = {}
  }
}
