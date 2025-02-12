export default class Event<T = unknown> {
  payload
  type = ''
  constructor (type: string, payload: T) {
    this.type = type
    this.payload = payload
  }
}

export const EventTypes = {
  SessionInitEvent: 'init',
  MagnetLinkEvent: 'magnet',
  MediaIndexEvent: 'index',
  PlayerStateEvent: 'player',
  MessageEvent: 'message'
}
