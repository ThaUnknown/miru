/**
 * @template T
 * @typedef {Omit<T, 'type'>} EventData<T>
 */

/**
 * @typedef {
    | { type: SessionInitEvent.type } & SessionInitEvent
    | { type: MagnetLinkEvent.type } & MagnetLinkEvent
    | { type: MediaIndexEvent.type } & MediaIndexEvent
    | { type: PlayerStateEvent.type } & PlayerStateEvent
  } MsgData
 */

export class SyncEventBase {
  /**
   * @type {String}
   */
  type

  /**
   * @param {String} type
   */
  constructor (type) {
    this.type = type
  }
}

export class SessionInitEvent extends SyncEventBase {
  /**
   * @type {'init'}
   */
  static type = 'init'

  /**
   * @type {string | number}
   */
  id

  /**
   * @type {string | undefined}
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
   * @type {MediaListOptions | undefined}
   */
  mediaListOptions

  /**
   * @typedef {Object} Avatar
   * @property {string} medium
   */

  /**
   * @type {Avatar | undefined}
   */
  avatar

  /**
   * @param {string} id
   * @param {Partial<EventData<SessionInitEvent>>} user
   */
  constructor (id, user) {
    super(SessionInitEvent.type)
    this.id = user?.id ?? id
    this.name = user.name
    this.mediaListOptions = user.mediaListOptions
    this.avatar = user.avatar
  }
}

export class MagnetLinkEvent extends SyncEventBase {
  /**
   * @type {'magnet'}
   */
  static type = 'magnet'

  /**
   * @type {unknown}
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
  /**
   * @type {'index'}
   */
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
  /**
   * @type {'player'}
   */
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
