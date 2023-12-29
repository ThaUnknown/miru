/**
 * @template T
 * @typedef {Omit<T, 'type'>} EventData
 */

export class SyncEventBase {
  /**
   * @type {string}
   */
  type

  /**
   * @param {string} type
   */
  constructor (type) {
    this.type = type
  }
}

export class SessionInitEvent extends SyncEventBase {
  static type = 'init'

  /**
   * @type {string | number}
   */
  id

  /**
   * @type {string}
   */
  name

  /**
   * @typedef {Object} AnimeList
   * @property {string[]} customLists
   *
   * @typedef {Object} MediaListOptions
   * @property {AnimeList} animeList
   */

  /**
   * @type {MediaListOptions}
   */
  mediaListOptions

  /**
   * @typedef {Object} Avatar
   * @property {string} medium
   */

  /**
   * @type {Avatar}
   */
  avatar

  /**
   * @param {string} id
   * @param {object} user
   */
  constructor (id, user) {
    super(SessionInitEvent.type)
    this.id = id
    Object.assign(this, user)
  }
}

export class MagnetLinkEvent extends SyncEventBase {
  static type = 'magnet'

  /**
   * @type {string}
   */
  magnet
  /**
   * @type {string}
   */
  hash

  /**
   *
   * @param {EventData<MagnetLinkEvent>} magnet
   */
  constructor (magnet) {
    super(MagnetLinkEvent.type)
    this.hash = magnet.hash
    this.magnet = magnet.magnet
  }
}

export class MediaIndexEvent extends SyncEventBase {
  static type = 'index'

  /**
   * @type {number}
   */
  index

  /**
   * @param {number} index
   */
  constructor (index) {
    super(MediaIndexEvent.type)
    this.index = index
  }
}

export class PlayerStateEvent extends SyncEventBase {
  static type = 'player'

  /**
   * @type {number}
   */
  time
  /**
   * @type {boolean}
   */
  paused

  /**
   * @param {EventData<PlayerStateEvent>} state
   */
  constructor (state) {
    super(PlayerStateEvent.type)
    this.time = state.time
    this.paused = state.paused
  }
}
