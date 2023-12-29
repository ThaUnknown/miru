import { W2GClient } from './client'

/**
 * @typedef {Object} Magnet
 * @property {string} hash
 * @property {string} magnet
 */

/**
 * @typedef {Record<string, {user: any, peer: import('p2pt').Peer<any>}>} PeerList
 */

export class W2GSession {
  /**
   * @type {Omit<import('./events').PlayerStateEvent, 'type'>}
   */
  #player = {
    paused: true,
    time: 0
  }

  get player () { return this.#player }

  /**
   * @type {number}
   */
  #index = 0
  get index () { return this.#index }

  /**
   * @type {Magnet | null}
   */
  #magnet = null
  get magnet () { return this.#magnet }

  /**
   * @type {boolean}
   */
  #isHost = false
  get isHost () { return this.#isHost }
  set isHost (v) { this.#isHost = v }

  /**
   * @type {PeerList}
   */
  #peers = {}
  get peers () { return this.#peers }

  /**
   * @type {W2GClient | null}
   */
  #client
  /**
   * @returns Wether client initialized or not
   */
  get initializated () { return this.#client !== null }
  /**
   * @returns Invite link ready to be copied
   */
  get inviteLink () { return this.#client.inviteLink }

  /**
   * Reinitializes session with underlying client
   * @param {string | null} code initial code if null new generated and returned
   * @returns p2p code
   */
  reinitialize (code) {
    this.dispose()
    this.#client = new W2GClient(this, code)

    return this.#client.code
  }

  /**
   * Disposes inner client and some session properties
   */
  dispose () {
    this.#client?.dispose()
    this.#client = null
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
   * @type {(state: import('./events').EventData<import('./events').PlayerStateEvent>) => void | null}
  */
  onPlayerStateUpdated

  /**
   * Should be called when client picking torrent
   * @param {{hash: string, magnet: string}} magnet
   */
  localMagnetLink (magnet) {
    this.#index = 0
    this.#magnet = magnet
    this.#isHost = true

    this.#client?.onMagnetLinkEvent(magnet)
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
   * @param {import('./events').EventData<import('./events').PlayerStateEvent>} state
   */
  localPlayerStateChanged (state) {
    this.#player.paused = state.paused
    this.#player.time = state.time

    this.#client?.onPlayerStateChangedEvent(this.#player)
  }

  // #endregion
}
