/**
 * @template T
 * @typedef {Omit<T, 'type'>} EventData
 */

export class SyncEventBase {
  /**
   * @type {string}
   */
  type
  constructor (type) {
    this.type = type
  }
}

export class SessionInitEvent extends SyncEventBase {
  static type = 'init'
  constructor (id, user) {
    super(SessionInitEvent.type)
    this.id = id
    Object.assign(this, user)
  }
}

export class MagnetLinkEvent extends SyncEventBase {
  static type = 'torrent'
  constructor (magnet) {
    super(MagnetLinkEvent.type)
    this.hash = magnet.hash
    this.magnet = magnet.magnet
  }
}

export class MediaIndexEvent extends SyncEventBase {
  static type = 'index'
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
   * @param {{time: number, paused: boolean}} state
   */
  constructor (state) {
    super(PlayerStateEvent.type)
    this.time = state.time
    this.paused = state.paused
  }
}

export class BatchEvent extends SyncEventBase {
  static type = 'batch'
  /**
   * @param {SyncEventBase[]} batch
   */
  constructor (batch) {
    super(BatchEvent.type)
    this.batch = batch
  }
}
