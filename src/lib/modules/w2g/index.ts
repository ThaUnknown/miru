import { EventEmitter } from 'events'

import P2PT, { type Peer } from 'p2pt'
import { writable } from 'simple-store-svelte'
import Debug from 'debug'

import client from '../anilist/client.js'

import Event, { EventTypes } from './events.js'

import type { Viewer } from '../anilist/queries'
import type { ResultOf } from 'gql.tada'

const debug = Debug('ui:w2g')

function generateRandomHexCode (len: number) {
  let hexCode = ''

  while (hexCode.length < len) {
    hexCode += (Math.round(Math.random() * 15)).toString(16)
  }

  return hexCode
}

type PeerList = Record<string, { user: ResultOf<typeof Viewer>['Viewer'] | {id: string }, peer?: Peer }>

interface PlayerState {paused: boolean, time: number}

export class W2GClient extends EventEmitter {
  static readonly #announce = [
    atob('d3NzOi8vdHJhY2tlci5vcGVud2VidG9ycmVudC5jb20='),
    atob('d3NzOi8vdHJhY2tlci53ZWJ0b3JyZW50LmRldg=='),
    atob('d3NzOi8vdHJhY2tlci5maWxlcy5mbTo3MDczL2Fubm91bmNl'),
    atob('d3NzOi8vdHJhY2tlci5idG9ycmVudC54eXov')
  ]

  player: PlayerState = {
    paused: true,
    time: 0
  }

  index = 0
  magnet: {magnet: string, hash: string} | null = null
  isHost = false
  #p2pt: P2PT | null
  code

  messages = writable<Array<{message: string, user: ResultOf<typeof Viewer>['Viewer'] | {id: string }, type: 'incoming' | 'outgoing', date: Date}>>([])

  self = client.viewer.value?.viewer ?? { id: generateRandomHexCode(16) }
  /** @type {import('simple-store-svelte').Writable<PeerList>} */
  peers = writable<PeerList>({ [this.self.id]: { user: this.self } })

  get inviteLink () {
    return `https://miru.watch/w2g/${this.code}`
  }

  localMediaIndexChanged (index: number) {
    this.index = index

    this.mediaIndexChanged(index)
  }

  localPlayerStateChanged ({ payload }: Event<PlayerState>) {
    debug(`localPlayerStateChanged: ${JSON.stringify(payload)}`)
    this.player.paused = payload.paused
    this.player.time = payload.time

    this.playerStateChanged(this.player)
  }

  constructor (code?: string) {
    super()
    this.isHost = !code

    this.code = code ?? generateRandomHexCode(16)

    debug(`W2GClient: ${this.code}, ${this.isHost}`)

    this.#p2pt = new P2PT(W2GClient.#announce, this.code)

    this.#wireEvents()
    this.#p2pt.start()
  }

  magnetLink (magnet: { hash: string, magnet: string }) {
    debug(`magnetLink: ${this.magnet?.hash} ${magnet.hash}`)
    if (this.magnet?.hash !== magnet.hash) {
      this.magnet = magnet
      this.isHost = true
      this.#sendToPeers(new Event('magnet', magnet))
    }
  }

  mediaIndexChanged (index: number) {
    debug(`mediaIndexChanged: ${this.index} ${index}`)
    if (this.index !== index) {
      this.index = index
      this.#sendToPeers(new Event('index', index))
    }
  }

  _playerStateChanged (state: PlayerState) {
    debug(`_playerStateChanged: ${this.player.paused} ${state.paused} ${this.player.time} ${state.time}`)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!state) return false
    if (this.player.paused !== state.paused || this.player.time !== state.time) {
      this.player = state
      return true
    }
  }

  playerStateChanged (state: PlayerState) {
    debug(`playerStateChanged: ${JSON.stringify(state)}`)
    if (this._playerStateChanged(state)) this.#sendToPeers(new Event('player', state))
  }

  message (message: string) {
    debug(`message: ${message}`)
    this.messages.update(messages => [...messages, ({
      message,
      user: this.self,
      type: 'outgoing',
      date: new Date()
    })])
    this.#sendToPeers(new Event('message', message))
  }

  #wireEvents () {
    this.#p2pt?.on('peerconnect', this.#onPeerconnect.bind(this))
    this.#p2pt?.on('msg', this.#onMsg.bind(this))
    this.#p2pt?.on('peerclose', this.#onPeerclose.bind(this))
  }

  #sendEvent (peer: Peer, event: Event) {
    debug(`#sendEvent: ${peer.id} ${JSON.stringify(event)}`)
    this.#p2pt?.send(peer, JSON.stringify(event))
  }

  #sendInitialSessionState (peer: Peer) {
    this.#sendEvent(peer, new Event('magnet', this.magnet))
    this.#sendEvent(peer, new Event('index', this.index))
    this.#sendEvent(peer, new Event('player', this.player))
  }

  async #onPeerconnect (peer: Peer) {
    debug(`#onPeerconnect: ${peer.id}`)
    this.#sendEvent(peer, new Event('init', this.self))

    if (this.isHost) this.#sendInitialSessionState(peer)
  }

  #onMsg (peer: Peer, data: Event<PlayerState | {magnet: string, hash: string} | string | ResultOf<typeof Viewer>['Viewer'] | {index: number}> | string) {
    debug(`#onMsg: ${peer.id} ${JSON.stringify(data)}`)
    data = typeof data === 'string' ? JSON.parse(data) as Event<PlayerState | {magnet: string, hash: string} | string | ResultOf<typeof Viewer>['Viewer'] | {index: number}> : data

    switch (data.type) {
      case EventTypes.SessionInitEvent:
        this.peers.update(peers => {
          peers[peer.id] = {
            peer,
            user: data.payload as ResultOf<typeof Viewer>['Viewer']
          }
          return peers
        })
        break
      case EventTypes.MagnetLinkEvent: {
        const cast = data as Event<{magnet: string, hash: string}>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (cast.payload.magnet === undefined) break
        const { hash, magnet } = cast.payload
        if (hash !== this.magnet?.hash) {
          this.isHost = false
          this.magnet = cast.payload
          add(magnet)
        }

        break
      }
      case EventTypes.MediaIndexEvent: {
        const cast = data as Event<{index: number}>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (cast.payload.index === undefined) break
        if (this.index !== cast.payload.index) {
          this.index = cast.payload.index
          this.emit('index', cast.payload.index)
        }
        break
      }
      case EventTypes.PlayerStateEvent: {
        const cast = data as Event<PlayerState>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (cast.payload.time === undefined) break
        if (this._playerStateChanged(cast.payload)) this.emit('player', data.payload)
        break
      }
      case EventTypes.MessageEvent:{
        const cast = data as Event<string>
        this.messages.update(messages => [...messages, ({ message: cast.payload, user: this.peers.value[peer.id].user, type: 'incoming', date: new Date() })])
        break
      }
      default:
        console.error('Invalid message type', data)
    }
  }

  #onPeerclose (peer: Peer) {
    debug(`#onPeerclose: ${peer.id}`)
    this.peers.update(peers => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete peers[peer.id]
      return peers
    })
  }

  #sendToPeers (event: Event) {
    if (!this.#p2pt) return
    for (const { peer } of Object.values(this.peers.value)) {
      if (peer) this.#sendEvent(peer, event)
    }
  }

  destroy () {
    debug('destroy')
    this.#p2pt?.destroy()
    this.removeAllListeners()
    this.#p2pt = null
    this.isHost = false
    this.peers.value = {}
  }
}
