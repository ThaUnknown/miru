import P2PT from 'p2pt'
import { generateRandomHexCode } from '../util'
import { alID } from '../anilist'
import { BatchEvent, MediaIndexEvent, SessionInitEvent, PlayerStateEvent, MagnetLinkEvent } from './events'
import { add } from '../torrent'

export class W2GClient {
  static #announce = [
    atob('d3NzOi8vdHJhY2tlci5vcGVud2VidG9ycmVudC5jb20='),
    atob('d3NzOi8vdHJhY2tlci53ZWJ0b3JyZW50LmRldg=='),
    atob('d3NzOi8vdHJhY2tlci5maWxlcy5mbTo3MDczL2Fubm91bmNl'),
    atob('d3NzOi8vdHJhY2tlci5idG9ycmVudC54eXov')
  ]

  /**
   * @type {import('./session').W2GSession}
   */
  #session

  /**
   * @type {P2PT | null}
  */
  #p2pt = null
  /**
   * @type {string}
   */
  #code = null
  get code () { return this.#code }

  // @ts-ignore
  get inviteLink () { return `https://miru.watch/w2g/${this.#p2pt.identifierString}` }

  /**
   * @param {import('./session').W2GSession} session
   * @param {string} code lobby code
   */
  constructor (session, code) {
    this.#session = session
    this.#session.isHost = !code

    code ??= generateRandomHexCode(16)
    this.#code = code

    this.#p2pt = new P2PT(W2GClient.#announce, this.#code)

    this.#wireEvents()
    this.#p2pt.start()
  }

  /**
   * @param {import('./session').Magnet} magnet
   */
  onMagnetLinkEvent (magnet) {
    this.#emit(new MagnetLinkEvent(magnet))
  }

  onMediaIndexChanged (index) {
    if (index === this.#session.index) return
    this.#emit(new MediaIndexEvent(index))
  }

  onPlayerStateChangedEvent (state) {
    this.#emit(new PlayerStateEvent(state))
  }

  dispose () {
    this.#p2pt.destroy()
    this.#p2pt = null
  }

  #wireEvents () {
    this.#p2pt.on('peerconnect', this.#onPeerconnect.bind(this))
    this.#p2pt.on('msg', this.#onMsg.bind(this))
    this.#p2pt.on('peerclose', this.#onPeerclose.bind(this))
  }

  /**
   * @param {import('p2pt').Peer<any>} peer
   * @param {import('./events').SyncEventBase} event
   */
  #sendEvent (peer, event) {
    console.log('out W2GMsg', event)
    this.#p2pt?.send(peer, JSON.stringify(event))
  }

  /**
   * @param {import('p2pt').Peer} peer
   * @param {import('./session').W2GSession} state
   */
  #sendSessionState (peer, state) {
    this.#sendEvent(peer, new BatchEvent([
      new MagnetLinkEvent(state.magnet),
      new MediaIndexEvent(state.index),
      new PlayerStateEvent(state.player)
    ]))
  }

  async #onPeerconnect (peer) {
    const user = (await alID)?.data?.Viewer || {}

    this.#sendEvent(peer, new SessionInitEvent(user.id || generateRandomHexCode(16), user))

    if (this.#session.isHost) this.#sendSessionState(peer, this.#session)
  }

  /**
   *
   * @param {import('p2pt').Peer} peer
   * @param {import('./events').SyncEventBase} data
   */
  #onMsg (peer, data) {
    data = typeof data === 'string' ? JSON.parse(data) : data

    console.log('in W2GMsg', data)

    switch (data.type) {
      case SessionInitEvent.type:
        this.#session.peers[peer.id] = {
          peer,
          user: data
        }
        this.#session.onPeerListUpdated?.(this.#session.peers)
        break
      case MagnetLinkEvent.type: {
        // @ts-ignore
        const { hash, magnet } = data
        if (hash === this.#session.magnet?.hash) break

        this.#session.isHost = false
        add(magnet)
        break
      }
      case MediaIndexEvent.type: {
        // @ts-ignore
        this.#session.onMediaIndexUpdated?.(data.index)
        break
      }
      case PlayerStateEvent.type: {
        // @ts-ignore
        this.#session.onPlayerStateUpdated?.(data)
        break
      }
      case BatchEvent.type: {
        // @ts-ignore
        const { batch } = data

        for (const event of batch) {
          this.#onMsg(peer, event)
        }
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

  /**
   * @param {import('./events').SyncEventBase} event
   */
  #emit (event) {
    if (!this.#p2pt) return

    for (const { peer } of Object.values(this.#session.peers)) {
      this.#sendEvent(peer, event)
    }
  }
}
