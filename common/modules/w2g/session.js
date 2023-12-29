import { W2GClient } from './client.js'
import Event from './events.js'

/**
 * @typedef {Record<string, {user: any, peer: import('p2pt').Peer<any>}>} PeerList
 */

export class W2GSession {
  player = new Event('player', {
    paused: true,
    time: 0
  })

  index = 0

  /** @type import('./events').default */
  magnet = null

  #isHost = false

  get isHost () {
    return this.#isHost
  }

  set isHost (v) {
    this.#isHost = v
  }

  /** @type {PeerList} */
  peers = {}

  /** @type {W2GClient | null} */
  #client

  get initializated () {
    return this.#client !== null
  }

  get inviteLink () {
    return `https://miru.watch/w2g/${this.#client.code}`
  }

  /**
   * Creates client initializing connection
   * @param {string | null} code initial code if null new generated and returned
   * @returns {string} p2p code
   */
  createClient (code) {
    this.#client = new W2GClient(this, code)

    return this.#client.code
  }

  destroy () {
    this.#client?.destroy()
    this.#client = null
    this.#isHost = false
    this.peers = {}
  }

  /**
   * Fires when peer object updated. On 'peerconnect' and 'peerclose' events of underlying client.
   * @type {(peers: PeerList) => void | null}
  */
  onPeerListUpdated

  /**
   * Fires when 'index' message received from another peer.
   * @type {(index: number) => void | null}
  */
  onMediaIndexUpdated

  /**
   * Fires when 'player' message received from another peer.
   * @type {(state: import('./events.js').default) => void | null}
  */
  onPlayerStateUpdated

  /**
   * Should be called when client picking torrent
   * @param {import('./events.js').default} magnet
   */
  localMagnetLink (magnet) {
    this.magnet = magnet
    // Prevent uninitialized session from becoming host
    if (this.initializated) {
      this.#isHost = true
    }

    this.#client?.onMagnetLink(magnet)
  }

  /**
   * Should be called when media index changed locally
   * @param {number} index
   */
  localMediaIndexChanged (index) {
    this.index = index

    this.#client?.onMediaIndexChanged(index)
  }

  /**
   * Should be called when player state changed locally
   * @param {import('./events.js').default} state
   */
  localPlayerStateChanged ({ payload }) {
    this.player.payload.paused = payload.paused
    this.player.payload.time = payload.time

    this.#client?.onPlayerStateChanged(this.player)
  }
}
