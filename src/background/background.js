import WebTorrent from 'webtorrent'
import { ipcRenderer } from 'electron'
import HTTPTracker from 'bittorrent-tracker/lib/client/http-tracker.js'
import { hex2bin, arr2hex, text2arr } from 'uint8-util'
import Parser from './parser.js'
import { defaults, subRx, videoRx } from '../common/util.js'

class TorrentClient extends WebTorrent {
  static excludedErrorMessages = ['WebSocket', 'User-Initiated Abort, reason=', 'Connection failed.']

  constructor () {
    const settings = { ...defaults, ...(JSON.parse(localStorage.getItem('settings')) || {}) }
    super({
      dht: !settings.torrentDHT,
      maxConns: settings.maxConns,
      downloadLimit: settings.torrentSpeed * 1048576 || 0,
      uploadLimit: settings.torrentSpeed * 1572864 || 0, // :trolled:
      torrentPort: settings.torrentPort || 0,
      dhtPort: settings.dhtPort || 0
    })
    this._ready = new Promise(resolve => {
      ipcRenderer.on('port', ({ ports }) => {
        this.message = ports[0].postMessage.bind(ports[0])
        resolve()
        ports[0].onmessage = ({ data }) => {
          if (data.type === 'load') this.loadLastTorrent()
          if (data.type === 'destroy') this.predestroy()
          this.handleMessage({ data })
        }
      })
      ipcRenderer.on('destroy', this.predestroy.bind(this))
    })
    this.settings = settings

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

    this.server = this.createServer(undefined, 'node')
    this.server.listen(0)

    this.trackers = {
      cat: new HTTPTracker({}, atob('aHR0cDovL255YWEudHJhY2tlci53Zjo3Nzc3L2Fubm91bmNl'))
    }

    this.on('error', this.dispatchError.bind(this))
    process.on('uncaughtException', this.dispatchError.bind(this))
    window.addEventListener('error', this.dispatchError.bind(this))
    window.addEventListener('unhandledrejection', this.dispatchError.bind(this))
  }

  loadLastTorrent () {
    const torrent = localStorage.getItem('torrent')
    if (torrent) this.addTorrent(new Uint8Array(JSON.parse(torrent)), JSON.parse(localStorage.getItem('lastFinished')))
  }

  handleTorrent (torrent) {
    const files = torrent.files.map(file => {
      return {
        infoHash: torrent.infoHash,
        name: file.name,
        type: file.type,
        size: file.size,
        path: file.path,
        url: 'http://localhost:' + this.server.address().port + file.streamURL
      }
    })
    this.dispatch('files', files)
    this.dispatch('magnet', { magnet: torrent.magnetURI, hash: torrent.infoHash })
    localStorage.setItem('torrent', JSON.stringify([...torrent.torrentFile]))
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
      console.log({ name: file.name, data: new Uint8Array(data) })
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
    if (e instanceof ErrorEvent) return this.dispatchError(e.error)
    if (e instanceof PromiseRejectionEvent) return this.dispatchError(e.reason)
    for (const exclude of TorrentClient.excludedErrorMessages) {
      if (e.message?.startsWith(exclude)) return
    }
    this.dispatch('error', e)
  }

  async addTorrent (data, skipVerify = false) {
    let id
    if (typeof data === 'string' && data.startsWith('http')) {
      // IMPORTANT, this is because node's get bypasses proxies, wut????
      const res = await fetch(data)
      id = new Uint8Array(await res.arrayBuffer())
    } else {
      id = data
    }
    const existing = await this.get(id)
    if (existing) {
      if (existing.ready) this.handleTorrent(existing)
      return
    }
    localStorage.setItem('lastFinished', false)
    if (this.torrents.length) await this.remove(this.torrents[0])
    const torrent = await this.add(id, {
      private: this.settings.torrentPeX,
      path: this.settings.torrentPath,
      destroyStoreOnDestroy: !this.settings.torrentPersist,
      skipVerify,
      announce: [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.webtorrent.dev',
        'wss://tracker.files.fm:7073/announce',
        'wss://tracker.btorrent.xyz/',
        atob('aHR0cDovL255YWEudHJhY2tlci53Zjo3Nzc3L2Fubm91bmNl')
      ]
    })

    torrent.once('done', () => {
      localStorage.setItem('lastFinished', true)
    })
  }

  async handleMessage ({ data }) {
    switch (data.type) {
      case 'current': {
        if (data.data) {
          const found = (await this.get(data.data.infoHash))?.files.find(file => file.path === data.data.path)
          if (this.current) {
            this.current.removeAllListeners('stream')
          }
          this.parser?.destroy()
          this.current = found
          this.parser = new Parser(this, found)
          this.findSubtitleFiles(found)
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

  predestroy () {
    this.destroy()
    this.server.close()
  }
}

// @ts-ignore
window.client = new TorrentClient()
