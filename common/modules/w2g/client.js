import P2PT from 'p2pt'
import { generateRandomHexCode } from '../util.js'
import { alID } from '../anilist.js'
import Event, { EventTypes } from './events.js'
import { add } from '../torrent.js'

export class W2GClient {
  static #announce = [
    atob('d3NzOi8vdHJhY2tlci5vcGVud2VidG9ycmVudC5jb20='),
    atob('d3NzOi8vdHJhY2tlci53ZWJ0b3JyZW50LmRldg=='),
    atob('d3NzOi8vdHJhY2tlci5maWxlcy5mbTo3MDczL2Fubm91bmNl'),
    atob('d3NzOi8vdHJhY2tlci5idG9ycmVudC54eXov')
  ]

  #session
  #p2pt
  code

  /**
   * @param {import('./session.js').W2GSession} session
   * @param {string} code lobby code
   */
  constructor (session, code) {
    this.#session = session
    this.#session.isHost = !code

    this.code = code ?? generateRandomHexCode(16)

    this.#p2pt = new P2PT(W2GClient.#announce, this.code)

    this.#wireEvents()
    this.#p2pt.start()
  }

  onMagnetLink (magnet) {
    this.#emit(new Event('magnet', magnet))
  }

  /** @param {number} index */
  onMediaIndexChanged (index) {
    this.#emit(new Event('index', index))
  }

  onPlayerStateChanged (state) {
    this.#emit(new Event('player', state))
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
    console.log('out W2GMsg', event)
    this.#p2pt?.send(peer, JSON.stringify(event))
  }

  /**
   * Should be called only on 'peerconnect'
   * @param {import('p2pt').Peer} peer
   * @param {import('./session.js').W2GSession} state
   */
  #sendInitialSessionState (peer, state) {
    this.#sendEvent(peer, new Event('magnet', state.magnet))
    this.#sendEvent(peer, new Event('index', state.index))
    this.#sendEvent(peer, new Event('player', state.player))
  }

  async #onPeerconnect (peer) {
    const user = (await alID)?.data?.Viewer || { id: generateRandomHexCode(16) }

    this.#sendEvent(peer, new Event('init', user))

    if (this.#session.isHost) this.#sendInitialSessionState(peer, this.#session)
  }

  /**
   * @param {import('p2pt').Peer} peer
   * @param {Event} data
   */
  #onMsg (peer, data) {
    data = typeof data === 'string' ? JSON.parse(data) : data

    console.log('in W2GMsg', data)

    switch (data.type) {
      case EventTypes.SessionInitEvent:
        this.#session.peers[peer.id] = {
          peer,
          user: data
        }
        this.#session.onPeerListUpdated?.(this.#session.peers)
        break
      case EventTypes.MagnetLinkEvent: {
        const { hash, magnet } = data.payload
        if (hash !== this.#session.magnet?.payload.hash) {
          this.#session.isHost = false
          add(magnet)
        }

        break
      }
      case EventTypes.MediaIndexEvent: {
        this.#session.onMediaIndexUpdated?.(data.payload.index)
        break
      }
      case EventTypes.PlayerStateEvent: {
        this.#session.onPlayerStateUpdated?.(data.payload)
        break
      }
      default:
        console.error('Invalid message type', data)
    }
  }

  #onPeerclose (peer) {
    delete this.#session.peers[peer.id]
    this.#session.onPeerListUpdated?.(this.#session.peers)
  }

  /** @param {import('./events.js').default} event */
  #emit (event) {
    if (!this.#p2pt) return

    for (const { peer } of Object.values(this.#session.peers)) {
      this.#sendEvent(peer, event)
    }
  }

  destroy () {
    this.#p2pt.destroy()
    this.#p2pt = null
  }
}
