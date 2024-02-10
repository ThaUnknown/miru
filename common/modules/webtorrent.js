import { EventEmitter } from 'node:events'
import WebTorrent from 'webtorrent'
import HTTPTracker from 'bittorrent-tracker/lib/client/http-tracker.js'
import { hex2bin, arr2hex, text2arr } from 'uint8-util'
import Parser from './parser.js'
import { defaults, fontRx, subRx, videoRx } from './util.js'
import { SUPPORTS } from './support.js'

const LARGE_FILESIZE = 32_000_000_000

const announce = [
  atob('d3NzOi8vdHJhY2tlci5vcGVud2VidG9ycmVudC5jb20='),
  atob('d3NzOi8vdHJhY2tlci53ZWJ0b3JyZW50LmRldg=='),
  atob('d3NzOi8vdHJhY2tlci5maWxlcy5mbTo3MDczL2Fubm91bmNl'),
  atob('d3NzOi8vdHJhY2tlci5idG9ycmVudC54eXov'),
  atob('dWRwOi8vb3Blbi5zdGVhbHRoLnNpOjgwL2Fubm91bmNl'),
  atob('aHR0cDovL255YWEudHJhY2tlci53Zjo3Nzc3L2Fubm91bmNl'),
  atob('dWRwOi8vdHJhY2tlci5vcGVudHJhY2tyLm9yZzoxMzM3L2Fubm91bmNl'),
  atob('dWRwOi8vZXhvZHVzLmRlc3luYy5jb206Njk2OS9hbm5vdW5jZQ=='),
  atob('dWRwOi8vdHJhY2tlci5jb3BwZXJzdXJmZXIudGs6Njk2OS9hbm5vdW5jZQ=='),
  atob('dWRwOi8vOS5yYXJiZy50bzoyNzEwL2Fubm91bmNl'),
  atob('dWRwOi8vdHJhY2tlci50b3JyZW50LmV1Lm9yZzo0NTEvYW5ub3VuY2U='),
  atob('aHR0cDovL29wZW4uYWNnbnh0cmFja2VyLmNvbTo4MC9hbm5vdW5jZQ=='),
  atob('aHR0cDovL2FuaWRleC5tb2U6Njk2OS9hbm5vdW5jZQ=='),
  atob('aHR0cDovL3RyYWNrZXIuYW5pcmVuYS5jb206ODAvYW5ub3VuY2U=')
]

let storedSettings = {}

try {
  storedSettings = JSON.parse(localStorage.getItem('settings')) || {}
} catch (error) {}

export default class TorrentClient {
  static excludedErrorMessages = ['WebSocket', 'User-Initiated Abort, reason=', 'Connection failed.']
  emitter = new EventEmitter()
  client
  constructor (storageQuota, serverMode, settingOverrides = {}, controller) {
    const settings = { ...defaults, ...storedSettings, ...settingOverrides }
    this.client = new WebTorrent({
      dht: !settings.torrentDHT,
      maxConns: settings.maxConns,
      downloadLimit: settings.torrentSpeed * 1048576 || 0,
      uploadLimit: settings.torrentSpeed * 1572864 || 0, // :trolled:
      torrentPort: settings.torrentPort || 0,
      dhtPort: settings.dhtPort || 0
    })

    this.settings = settings

    this.serverMode = serverMode
    this.storageQuota = storageQuota

    this.current = null
    this.parsed = false

    setInterval(() => {
      this.emit('stats', {
        numPeers: (this.client.torrents.length && this.client.torrents[0].numPeers) || 0,
        uploadSpeed: (this.client.torrents.length && this.client.torrents[0].uploadSpeed) || 0,
        downloadSpeed: (this.client.torrents.length && this.client.torrents[0].downloadSpeed) || 0,
        progress: (this.client.torrents[0]?.pieces && this.current?.progress) || 0
      })
    }, 1000)
    this.client.on('torrent', this.handleTorrent.bind(this))

    const createServer = controller => {
      this.server = this.client.createServer({ controller }, serverMode)
      this.server.listen(0, () => {})
    }

    if (controller) {
      controller.then(createServer)
    } else {
      createServer()
    }

    this.trackers = {
      cat: new HTTPTracker({}, atob('aHR0cDovL255YWEudHJhY2tlci53Zjo3Nzc3L2Fubm91bmNl'))
    }

    process.on('uncaughtException', this.dispatchError.bind(this))
    this.client.on('error', this.dispatchError.bind(this))
  }

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

  loadLastTorrent (t) {
    if (!localStorage.getItem('torrent') && !t) return
    let torrent = localStorage.getItem('torrent') && new Uint8Array(JSON.parse(localStorage.getItem('torrent')))
    if (!torrent) {
      // this can be a magnet string, or a stringified array, lazy way of makign sure it works
      try {
        torrent = new Uint8Array(JSON.parse(t))
      } catch (e) {
        torrent = t
      }
    }
    if (torrent) this.addTorrent(torrent, JSON.parse(localStorage.getItem('lastFinished')))
  }

  async handleTorrent (torrent) {
    const files = torrent.files.map(file => {
      return {
        infoHash: torrent.infoHash,
        name: file.name,
        type: file.type,
        size: file.size,
        path: file.path,
        url: this.serverMode === 'node' ? 'http://localhost:' + this.server.address().port + file.streamURL : file.streamURL
      }
    })
    if (torrent.length > LARGE_FILESIZE) {
      for (const file of torrent.files) {
        file.deselect()
      }
      this.emit('warn', 'Detected Large Torrent! To Conserve Drive Space Files Will Be Downloaded Selectively Instead Of Downloading The Entire Torrent.')
    }
    this.emit('files', files)
    this.emit('magnet', { magnet: torrent.magnetURI, hash: torrent.infoHash })
    localStorage.setItem('torrent', JSON.stringify([...torrent.torrentFile]))

    if (torrent.length > await this.storageQuota(torrent.path)) {
      this.emit('error', 'Torrent Too Big! This Torrent Exceeds The Selected Drive\'s Available Space. Change Download Location In Torrent Settings To A Drive With More Space And Restart The App!')
    }
  }

  async findFontFiles (targetFile) {
    const files = this.client.torrents[0].files
    const fontFiles = files.filter(file => fontRx.test(file.name))

    const map = {}

    // deduplicate fonts
    // some releases have duplicate fonts for diff languages
    // if they have different chars, we can't find that out anyways
    // so some chars might fail, on REALLY bad releases
    for (const file of fontFiles) {
      map[file.name] = file
    }

    for (const file of Object.values(map)) {
      const data = await file.arrayBuffer()
      if (targetFile !== this.current) return
      this.emit('file', { data: new Uint8Array(data) }, [data])
    }
  }

  async findSubtitleFiles (targetFile) {
    const files = this.client.torrents[0].files
    const videoFiles = files.filter(file => videoRx.test(file.name))
    const videoName = targetFile.name.substring(0, targetFile.name.lastIndexOf('.')) || targetFile.name
    // array of subtitle files that match video name, or all subtitle files when only 1 vid file
    const subfiles = files.filter(file => {
      return subRx.test(file.name) && (videoFiles.length === 1 ? true : file.name.includes(videoName))
    })
    for (const file of subfiles) {
      const data = await file.arrayBuffer()
      if (targetFile !== this.current) return
      this.emit('subtitleFile', { name: file.name, data: new Uint8Array(data) }, [data])
    }
  }

  scrape ({ id, infoHashes }) {
    return new Promise((resolve, reject) => {
      this.trackers.cat._request(this.trackers.cat.scrapeUrl, { info_hash: infoHashes.map(infoHash => hex2bin(infoHash)) }, (err, data) => {
        if (err) {
          this.emit('warn', err)
          return resolve({ id, result: [] })
        }
        const { files } = data
        const result = []
        for (const [key, data] of Object.entries(files || {})) {
          result.push({ hash: key.length !== 40 ? arr2hex(text2arr(key)) : key, ...data })
        }
        resolve({ id, result })
      })
    })
  }

  dispatchError (e) {
    if (typeof ErrorEvent !== 'undefined' && e instanceof ErrorEvent) return this.dispatchError(e.error)
    if (typeof PromiseRejectionEvent !== 'undefined' && e instanceof PromiseRejectionEvent) return this.dispatchError(e.reason)
    for (const exclude of TorrentClient.excludedErrorMessages) {
      if (e.message?.startsWith(exclude)) return
    }
    this.emit('error', JSON.stringify(e?.message || e))
  }

  async addTorrent (data, skipVerify = false) {
    const existing = await this.client.get(data)
    if (existing) {
      if (existing.ready) this.handleTorrent(existing)
      return
    }
    localStorage.setItem('lastFinished', false)
    if (this.client.torrents.length) await this.client.remove(this.client.torrents[0])
    const torrent = await this.client.add(data, {
      private: this.settings.torrentPeX,
      path: this.settings.torrentPath,
      destroyStoreOnDestroy: !this.settings.torrentPersist,
      skipVerify,
      announce
    })

    torrent.once('done', () => {
      if (SUPPORTS.torrentPersist && this.settings.torrentPath) localStorage.setItem('lastFinished', true)
    })
  }

  async setCurrent (file) {
    const torrent = await this.client.get(file.infoHash)
    const found = torrent?.files.find(f => f.path === file.path)
    if (!found) return
    if (this.current) {
      this.current.removeAllListeners('stream')
    }
    this.parser?.destroy()
    found.select()
    this.current = found
    this.parser = new Parser(this, found)
    this.findSubtitleFiles(found)
    this.findFontFiles(found)
  }


  destroy () {
    this.parser?.destroy()
    this.server.close()
    this.client.destroy()
  }
}
