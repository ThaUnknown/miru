import WebTorrent from 'webtorrent'
import { ipcRenderer } from 'electron'
import HTTPTracker from 'bittorrent-tracker/lib/client/http-tracker.js'
import { hex2bin, arr2hex, text2arr } from 'uint8-util'
import Parser from './parser.js'

class TorrentClient extends WebTorrent {
  constructor (settings) {
    super({
      dht: !settings.torrentDHT,
      maxConns: settings.maxConns,
      downloadLimit: settings.torrentSpeed * 1048576 || 0,
      uploadLimit: settings.torrentSpeed * 1572864 || 0, // :trolled:
      torrentPort: settings.torrentPort || 0,
      dhtPort: settings.dhtPort || 0
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

    this.on('error', e => {
      this.dispatch('error', e)
    })
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
    const clonedTorrentFile = new Uint8Array(torrent.torrentFile)
    this.dispatch('torrent', clonedTorrentFile, [clonedTorrentFile.buffer])
  }

  _scrape ({ id, infoHashes }) {
    this.trackers.cat._request(this.trackers.cat.scrapeUrl, { info_hash: infoHashes.map(infoHash => hex2bin(infoHash)) }, (err, data) => {
      if (err) {
        console.error(err)
        return this.dispatch('scrape', { id, result: [] })
      }
      const { files } = data
      const result = []
      for (const [key, data] of Object.entries(files || {})) {
        result.push({ hash: key.length !== 40 ? arr2hex(text2arr(key)) : key, ...data })
      }
      this.dispatch('scrape', { id, result })
      console.log(result, data)
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
          // TODO: parser.findSubtitleFiles(found)
        }
        break
      }
      case 'scrape': {
        this._scrape(data.data)
        break
      }
      case 'torrent': {
        const id = typeof data.data !== 'string' ? new Uint8Array(data.data) : data.data
        const existing = await this.get(id)
        if (existing) {
          if (existing.ready) return this.handleTorrent(existing)
          existing.once('ready', this.handleTorrent.bind(this))
        }
        if (this.torrents.length) await this.remove(this.torrents[0])
        this.add(id, {
          private: this.settings.torrentPeX,
          path: this.settings.torrentPath,
          destroyStoreOnDestroy: !this.settings.torrentPersist,
          announce: [
            'wss://tracker.openwebtorrent.com',
            'wss://tracker.webtorrent.dev',
            'wss://tracker.files.fm:7073/announce',
            'wss://tracker.btorrent.xyz/'
          ]
        })
        break
      }
    }
  }

  dispatch (type, data, transfer) {
    message({ type, data }, transfer)
  }

  predestroy () {
    this.destroy()
    this.server.close()
  }
}

let client = null
let message = null

ipcRenderer.on('port', (e) => {
  e.ports[0].onmessage = ({ data }) => {
    if (!client && data.type === 'settings') window.client = client = new TorrentClient(data.data)
    if (data.type === 'destroy') client?.predestroy()

    client.handleMessage({ data })
  }
  message = e.ports[0].postMessage.bind(e.ports[0])
})

const excludedErrorMessages = ['WebSocket']

function dispatchError (e) {
  if (e instanceof ErrorEvent) return dispatchError(e.error)
  if (e instanceof PromiseRejectionEvent) return dispatchError(e.reason)
  for (const exclude of excludedErrorMessages) {
    if (e.message?.startsWith(exclude)) return
  }
  client?.dispatch('error', e)
}

process.on('uncaughtException', dispatchError)

window.addEventListener('error', dispatchError)

window.addEventListener('unhandledrejection', dispatchError)
