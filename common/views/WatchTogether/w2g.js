import { EventEmitter } from 'events'

import P2PT from 'p2pt'

import Event, { EventTypes } from './events.js'
import { anilistClient } from '@/modules/anilist.js'
import { add } from '@/modules/torrent.js'
import { generateRandomHexCode } from '@/modules/util.js'
import { writable } from 'simple-store-svelte'
import Debug from 'debug'

const debug = Debug('ui:w2g')

/**
 * @typedef {Record<string, {user: import('@/modules/al.d.ts').Viewer | {id: string }, peer?: import('p2pt').Peer<any>}>} PeerList
 */

export class W2GClient extends EventEmitter {
  static #announce = [
    atob('d3NzOi8vdHJhY2tlci5vcGVud2VidG9ycmVudC5jb20='),
    atob('d3NzOi8vdHJhY2tlci53ZWJ0b3JyZW50LmRldg=='),
    atob('d3NzOi8vdHJhY2tlci5maWxlcy5mbTo3MDczL2Fubm91bmNl'),
    atob('d3NzOi8vdHJhY2tlci5idG9ycmVudC54eXov')
  ]

  player = {
    paused: true,
    time: 0
  }

  index = 0
  /** @type {{maget: 'string', hash: 'string'} | null} */
  magnet = null
  isHost = false
  #p2pt
  code
  /** @type {import('simple-store-svelte').Writable<{message: string, user: import('@/modules/al.d.ts').Viewer | {id: string }, type: 'incoming' | 'outgoing', date: Date}[]>} */
  messages = writable([])

  self = anilistClient.userID?.viewer.data.Viewer || { id: generateRandomHexCode(16) }
  /** @type {import('simple-store-svelte').Writable<PeerList>} */
  peers = writable({ [this.self.id]: { user: this.self } })

  get inviteLink () {
    return `https://miru.watch/w2g/${this.code}`
  }

  /**
   * Should be called when media index changed locally
   * @param {number} index
   */
  localMediaIndexChanged (index) {
    this.index = index

    this.mediaIndexChanged(index)
  }

  /**
   * Should be called when player state changed locally
   * @param {import('./events.js').default} state
   */
  localPlayerStateChanged ({ payload }) {
    debug(`localPlayerStateChanged: ${JSON.stringify(payload)}`)
    this.player.payload.paused = payload.paused
    this.player.payload.time = payload.time

    this.playerStateChanged(this.player)
  }

  /**
   * @param {string} code lobby code
   */
  constructor (code) {
    super()
    this.isHost = !code

    this.code = code ?? generateRandomHexCode(16)

    debug(`W2GClient: ${this.code}, ${this.isHost}`)

    this.#p2pt = new P2PT(W2GClient.#announce, this.code)

    this.#wireEvents()
    this.#p2pt.start()
  }

  magnetLink (magnet) {
    debug(`magnetLink: ${this.magnet?.hash} ${magnet.hash}`)
    if (this.magnet?.hash !== magnet.hash) {
      this.magnet = magnet
      this.isHost = true
      this.#sendToPeers(new Event('magnet', magnet))
    }
  }

  /** @param {number} index */
  mediaIndexChanged (index) {
    debug(`mediaIndexChanged: ${this.index} ${index}`)
    if (this.index !== index) {
      this.index = index
      this.#sendToPeers(new Event('index', index))
    }
  }

  _playerStateChanged (state) {
    debug(`_playerStateChanged: ${this.player?.paused} ${state?.paused} ${this.player?.time} ${state?.time}`)
    if (!state) return false
    if (this.player.paused !== state.paused || this.player.time !== state.time) {
      this.player = state
      return true
    }
  }

  playerStateChanged (state) {
    debug(`playerStateChanged: ${JSON.stringify(state)}`)
    if (this._playerStateChanged(state)) this.#sendToPeers(new Event('player', state))
  }

  message (message) {
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
    this.#p2pt.on('peerconnect', this.#onPeerconnect.bind(this))
    this.#p2pt.on('msg', this.#onMsg.bind(this))
    this.#p2pt.on('peerclose', this.#onPeerclose.bind(this))
  }

  /**
   * @param {import('p2pt').Peer} peer
   * @param {import('./events.js').default} event
   */
  #sendEvent (peer, event) {
    debug(`#sendEvent: ${peer.id} ${JSON.stringify(event)}`)
    this.#p2pt?.send(peer, JSON.stringify(event))
  }

  /**
   * Should be called only on 'peerconnect'
   * @param {import('p2pt').Peer} peer
   */
  #sendInitialSessionState (peer) {
    this.#sendEvent(peer, new Event('magnet', this.magnet))
    this.#sendEvent(peer, new Event('index', this.index))
    this.#sendEvent(peer, new Event('player', this.player))
  }

  async #onPeerconnect (peer) {
    debug(`#onPeerconnect: ${peer.id}`)
    this.#sendEvent(peer, new Event('init', this.self))

    if (this.isHost) this.#sendInitialSessionState(peer)
  }

  /**
   * @param {import('p2pt').Peer} peer
   * @param {Event} data
   */
  #onMsg (peer, data) {
    debug(`#onMsg: ${peer.id} ${JSON.stringify(data)}`)
    data = typeof data === 'string' ? JSON.parse(data) : data

    switch (data.type) {
      case EventTypes.SessionInitEvent:
        this.peers.update(peers => {
          peers[peer.id] = {
            peer,
            user: data.payload
          }
          return peers
        })
        break
      case EventTypes.MagnetLinkEvent: {
        if (data.payload?.magnet === undefined) break
        const { hash, magnet } = data.payload
        if (hash !== this.magnet?.hash) {
          this.isHost = false
          this.magnet = data.payload
          add(magnet)
        }

        break
      }
      case EventTypes.MediaIndexEvent: {
        if (data.payload?.index === undefined) break
        if (this.index !== data.payload.index) {
          this.index = data.payload.index
          this.emit('index', data.payload.index)
        }
        break
      }
      case EventTypes.PlayerStateEvent: {
        if (data.payload?.time === undefined) break
        if (this._playerStateChanged(data.payload)) this.emit('player', data.payload)
        break
      }
      case EventTypes.MessageEvent:{
        this.messages.update(messages => [...messages, ({ message: data.payload, user: this.peers.value[peer.id].user, type: 'incoming', date: new Date() })])
        break
      }
      default:
        console.error('Invalid message type', data)
    }
  }

  #onPeerclose (peer) {
    debug(`#onPeerclose: ${peer.id}`)
    this.peers.update(peers => {
      delete peers[peer.id]
      return peers
    })
  }

  /** @param {import('./events.js').default} event */
  #sendToPeers (event) {
    if (!this.#p2pt) return
    for (const { peer } of Object.values(this.peers.value)) {
      if (peer) this.#sendEvent(peer, event)
    }
  }

  destroy () {
    debug('destroy')
    this.#p2pt.destroy()
    this.removeAllListeners()
    this.#p2pt = null
    this.isHost = false
    this.peers.value = {}
  }
}
