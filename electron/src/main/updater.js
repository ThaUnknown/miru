import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

log.transports.file.level = 'info'
autoUpdater.logger = log

autoUpdater.checkForUpdatesAndNotify()
export default class Updater {
  emit (event, ...args) {
    if (!this.events[event]?.length) return
    for (const cb of this.events[event]) {
      cb(...args)
    }
  }

  off (event) {
    delete this.events[event]
  }

  events = {}

  on (event, cb) {
    (this.events[event] ||= []).push(cb)
  }

  constructor () {
    autoUpdater.on('update-available', () => {
      this.emit('update-available', true)
    })
    autoUpdater.on('update-downloaded', () => {
      this.emit('update-downloaded', true)
    })
  }

  checkForUpdates () {
    autoUpdater.checkForUpdatesAndNotify()
  }
}
