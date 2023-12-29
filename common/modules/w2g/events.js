/**
 * @template T
 * @typedef {Omit<T, 'type'>} EventData<T>
 */

/**
 * @typedef {
    | { type: 'init' } & SessionInitEvent
    | { type: 'magnet' } & MagnetLinkEvent
    | { type: 'index' } & MediaIndexEvent
    | { type: 'player' } & PlayerStateEvent
  } MsgData
 * @typedef {'init' | 'magnet' | 'index' | 'player'} EventType
 */

/**
 * @exports SyncEventBase
 */
export class SyncEventBase {
  /**
   * @type {EventType}
   */
  type

  /**
   * @param {EventType} type
   */
  constructor (type) {
    this.type = type
  }
}

/**
 * @exports SessionInitEvent
 */
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

/**
 * @exports MagnetLinkEvent
 */
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

/**
 * @exports MediaIndexEvent
 */
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

/**
 * @exports PlayerStateEvent
 */
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
