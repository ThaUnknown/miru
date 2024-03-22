import { spawn } from 'node:child_process'
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

export default class TorrentClient extends WebTorrent {
  static excludedErrorMessages = ['WebSocket', 'User-Initiated Abort, reason=', 'Connection failed.']

  player = ''
  /** @type {ReturnType<spawn>} */
  playerProcess = null

  constructor (ipc, storageQuota, serverMode, settingOverrides = {}, controller) {
    const settings = { ...defaults, ...storedSettings, ...settingOverrides }
    super({
      dht: !settings.torrentDHT,
      maxConns: settings.maxConns,
      downloadLimit: settings.torrentSpeed * 1048576 || 0,
      uploadLimit: settings.torrentSpeed * 1572864 || 0, // :trolled:
      torrentPort: settings.torrentPort || 0,
      dhtPort: settings.dhtPort || 0
    })
    this._ready = new Promise(resolve => {
      ipc.on('port', ({ ports }) => {
        this.message = ports[0].postMessage.bind(ports[0])
        ports[0].onmessage = ({ data }) => {
          if (data.type === 'load') this.loadLastTorrent(data.data)
          if (data.type === 'destroy') this.destroy()
          this.handleMessage({ data })
        }
        resolve()
      })
      ipc.on('destroy', this.destroy.bind(this))
    })
    ipc.on('player', (event, data) => {
      this.player = data
    })
    this.settings = settings

    this.serverMode = serverMode
    this.storageQuota = storageQuota

    this.current = null
    this.parsed = false

    setInterval(() => {
      this.dispatch('stats', {
        numPeers: (this.torrents.length && this.torrents[0].numPeers) || 0,
        uploadSpeed: (this.torrents.length && this.torrents[0].uploadSpeed) || 0,
        downloadSpeed: (this.torrents.length && this.torrents[0].downloadSpeed) || 0
      })
    }, 200)
    setInterval(() => {
      if (this.torrents[0]?.pieces) this.dispatch('progress', this.current?.progress)
    }, 2000)
    this.on('torrent', this.handleTorrent.bind(this))

    const createServer = controller => {
      this.server = this.createServer({ controller }, serverMode)
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
    this.on('error', this.dispatchError.bind(this))
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
      this.dispatch('warn', 'Detected Large Torrent! To Conserve Drive Space Files Will Be Downloaded Selectively Instead Of Downloading The Entire Torrent.')
    }
    this.dispatch('files', files)
    this.dispatch('magnet', { magnet: torrent.magnetURI, hash: torrent.infoHash })
    localStorage.setItem('torrent', JSON.stringify([...torrent.torrentFile]))

    if (torrent.length > await this.storageQuota(torrent.path)) {
      this.dispatch('error', 'Torrent Too Big! This Torrent Exceeds The Selected Drive\'s Available Space. Change Download Location In Torrent Settings To A Drive With More Space And Restart The App!')
    }
  }

  async findFontFiles (targetFile) {
    const files = this.torrents[0].files
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
      this.dispatch('file', { data: new Uint8Array(data) }, [data])
    }
  }

  async findSubtitleFiles (targetFile) {
    const files = this.torrents[0].files
    const videoFiles = files.filter(file => videoRx.test(file.name))
    const videoName = targetFile.name.substring(0, targetFile.name.lastIndexOf('.')) || targetFile.name
    // array of subtitle files that match video name, or all subtitle files when only 1 vid file
    const subfiles = files.filter(file => {
      return subRx.test(file.name) && (videoFiles.length === 1 ? true : file.name.includes(videoName))
    })
    for (const file of subfiles) {
      const data = await file.arrayBuffer()
      if (targetFile !== this.current) return
      this.dispatch('subtitleFile', { name: file.name, data: new Uint8Array(data) }, [data])
    }
  }

  _scrape ({ id, infoHashes }) {
    this.trackers.cat._request(this.trackers.cat.scrapeUrl, { info_hash: infoHashes.map(infoHash => hex2bin(infoHash)) }, (err, data) => {
      if (err) {
        this.dispatch('error', err)
        return this.dispatch('scrape', { id, result: [] })
      }
      const { files } = data
      const result = []
      for (const [key, data] of Object.entries(files || {})) {
        result.push({ hash: key.length !== 40 ? arr2hex(text2arr(key)) : key, ...data })
      }
      this.dispatch('scrape', { id, result })
    })
  }

  dispatchError (e) {
    if (typeof ErrorEvent !== 'undefined' && e instanceof ErrorEvent) return this.dispatchError(e.error)
    if (typeof PromiseRejectionEvent !== 'undefined' && e instanceof PromiseRejectionEvent) return this.dispatchError(e.reason)
    for (const exclude of TorrentClient.excludedErrorMessages) {
      if (e.message?.startsWith(exclude)) return
    }
    this.dispatch('error', JSON.stringify(e?.message || e))
  }

  async addTorrent (data, skipVerify = false) {
    const existing = await this.get(data)
    if (existing) {
      if (existing.ready) this.handleTorrent(existing)
      return
    }
    localStorage.setItem('lastFinished', false)
    if (this.torrents.length) await this.remove(this.torrents[0])
    const torrent = await this.add(data, {
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

  async handleMessage ({ data }) {
    switch (data.type) {
      case 'current': {
        if (data.data) {
          const torrent = await this.get(data.data.current.infoHash)
          const found = torrent?.files.find(file => file.path === data.data.current.path)
          if (!found) return
          if (this.playerProcess) {
            this.playerProcess.kill()
            this.playerProcess = null
          }
          if (this.current) {
            this.current.removeAllListeners('stream')
          }
          this.parser?.destroy()
          found.select()
          this.current = found
          if (data.data.external && this.player) {
            this.playerProcess = spawn(this.player, ['http://localhost:' + this.server.address().port + found.streamURL])
            this.playerProcess.stdout.on('data', () => {})
            const startTime = Date.now()
            this.playerProcess.once('close', () => {
              this.playerProcess = null
              const seconds = (Date.now() - startTime) / 1000
              console.log(seconds)
              this.dispatch('externalWatched', seconds)
            })
          } else {
            this.parser = new Parser(this, found)
            this.findSubtitleFiles(found)
            this.findFontFiles(found)
          }
        }
        break
      }
      case 'scrape': {
        this._scrape(data.data)
        break
      }
      case 'torrent': {
        this.addTorrent(data.data)
        break
      }
    }
  }

  async dispatch (type, data, transfer) {
    await this._ready
    this.message?.({ type, data }, transfer)
  }

  destroy () {
    this.parser?.destroy()
    this.server.close()
    super.destroy()
  }
}
