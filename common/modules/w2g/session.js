import { W2GClient } from './client.js'

/**
 * @typedef {Record<string, {user: any, peer: import('p2pt').Peer<any>}>} PeerList
 */

export class W2GSession {
  /**
   * @type {import('./events').EventData<import('./events').PlayerStateEvent>}
   */
  #player = {
    paused: true,
    time: 0
  }

  get player () {
    return this.#player
  }

  /**
   * @type {number}
   */
  #index = 0

  get index () {
    return this.#index
  }

  /**
   * @type {import('./events.js').EventData<import('./events.js').MagnetLinkEvent> | null}
   */
  #magnet = null

  get magnet () {
    return this.#magnet
  }

  /**
   * @type {boolean}
   */
  #isHost = false

  get isHost () {
    return this.#isHost
  }

  set isHost (v) {
    this.#isHost = v
  }

  /**
   * @type {PeerList}
   */
  #peers = {}

  get peers () {
    return this.#peers
  }

  /**
   * @type {W2GClient | null}
   */
  #client
  /**
   * @returns Wether client initialized or not
   */
  get initializated () {
    return this.#client !== null
  }

  /**
   * @returns Invite link ready to be copied
   */
  get inviteLink () {
    return `https://miru.watch/w2g/${this.#client.code}`
  }

  /**
   * Creates client initializing connection
   * @param {string | null} code initial code if null new generated and returned
   * @returns p2p code
   */
  createClient (code) {
    this.#client = new W2GClient(this, code)

    return this.#client.code
  }

  /**
   * Disposes inner client and some session properties
   */
  dispose () {
    this.#client?.dispose()
    this.#client = null
    this.#isHost = false
    this.#peers = {}
  }

  // #region Compatibility events

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
   * @type {(state: import('./events.js').EventData<import('./events.js').PlayerStateEvent>) => void | null}
  */
  onPlayerStateUpdated

  /**
   * Should be called when client picking torrent
   * @param {import('./events.js').EventData<import('./events.js').MagnetLinkEvent>} magnet
   */
  localMagnetLink (magnet) {
    this.#magnet = magnet
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
    this.#index = index

    this.#client?.onMediaIndexChanged(index)
  }

  /**
   * Should be called when player state changed locally
   * @param {import('./events.js').EventData<import('./events.js').PlayerStateEvent>} state
   */
  localPlayerStateChanged (state) {
    this.#player.paused = state.paused
    this.#player.time = state.time

    this.#client?.onPlayerStateChanged(this.#player)
  }

  // #endregion
}
