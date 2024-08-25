export default class Event {
  payload = null
  type = ''
  constructor (type, payload) {
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
