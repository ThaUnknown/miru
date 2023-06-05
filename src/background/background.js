import WebTorrent from 'webtorrent'
import { SubtitleParser, SubtitleStream } from './matroska.js'
import { ipcRenderer } from 'electron'

class TorrentClient extends WebTorrent {
  constructor (settings) {
    super({
      dht: !settings.torrentDHT,
      maxConns: settings.maxConns,
      downloadLimit: settings.torrentSpeed * 1048576 || 0,
      uploadLimit: settings.torrentSpeed * 1572864 || 0 // :trolled:
    })
    this.settings = settings

    this.current = null
    this.parsed = false
    this.parserInstance = null
    this.boundParse = this.parseSubtitles.bind(this)

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
    this.dispatch('torrent', Array.from(torrent.torrentFile))
  }

  async handleMessage ({ data }) {
    switch (data.type) {
      case 'current': {
        this.current?.removeListener('done', this.boundParse)
        this.cancelParse()
        this.parserInstance?.destroy()
        this.parserInstance = null
        this.current = null
        this.parsed = false
        if (data.data) {
          this.current = (await this.get(data.data.infoHash))?.files.find(file => file.path === data.data.path)
          if (this.current?.name.endsWith('.mkv')) {
            // if (this.current.done) this.parseSubtitles()
            // this.current.once('done', this.boundParse)
            this.parseFonts(this.current)
            this.current.on('iterator', ({ iterator, req }, cb) => {
              if (!this.parsed) {
                this.stream = new SubtitleStream(this.stream, iterator)
                this.handleSubtitleParser(this.stream, true)
                cb(this.stream)
              }
            })
          }
          // TODO: findSubtitleFiles(current)
        }
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
            'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
            'wss://peertube.cpy.re/tracker/socket'
          ]
        })
        break
      }
    }
  }

  dispatch (type, data) {
    message({ type, data })
  }

  parseSubtitles () {
    if (this.current.name.endsWith('.mkv')) {
      const parser = new SubtitleParser()
      this.handleSubtitleParser(parser, true)
      const finish = () => {
        console.log('Sub parsing finished')
        this.parsed = true
        this.parser?.destroy()
        this.parser = undefined
        fileStream?.destroy()
      }
      parser.once('tracks', tracks => {
        if (!tracks.length) finish()
      })
      parser.once('finish', finish)
      console.log('Sub parsing started')
      const fileStream = this.current.createReadStream()
      this.parser = fileStream.pipe(parser)
    }
  }

  cancelParse () {
    this.parser?.destroy()
    this.parser = undefined
  }

  parseFonts (file) {
    const stream = new SubtitleParser(file)
    this.handleSubtitleParser(stream)
    stream.once('tracks', tracks => {
      if (!tracks.length) {
        this.parsed = true
        stream.destroy()
      }
    })
    stream.once('subtitle', () => {
      stream.destroy()
    })
  }

  handleSubtitleParser (parser, skipFile) {
    parser.once('tracks', tracks => {
      if (!tracks.length) {
        this.parsed = true
        parser?.destroy()
      } else {
        this.dispatch('tracks', tracks)
      }
    })
    parser.on('subtitle', (subtitle, trackNumber) => {
      this.dispatch('subtitle', { subtitle, trackNumber })
    })
    if (!skipFile) {
      parser.once('chapters', chapters => {
        this.dispatch('chapters', chapters)
      })
      parser.on('file', file => {
        if (file.mimetype === 'application/x-truetype-font' || file.mimetype === 'application/font-woff' || file.mimetype === 'application/vnd.ms-opentype' || file.mimetype === 'font/sfnt' || file.mimetype.startsWith('font/') || file.filename.toLowerCase().endsWith('.ttf')) {
          this.dispatch('file', { mimetype: file.mimetype, data: Array.from(file.data) })
        }
      })
    }
  }

  predestroy () {
    this.destroy()
    this.server.close()
    this.parser?.destroy()
    this.parser = undefined
  }
}

let client = null
let message = null

ipcRenderer.on('port', (e) => {
  e.ports[0].onmessage = ({ data }) => {
    const cloned = structuredClone(data)
    if (!client && cloned.type === 'settings') window.client = client = new TorrentClient(cloned.data)
    if (cloned.type === 'destroy') client?.predestroy()

    client.handleMessage({ data: cloned })
  }
  message = e.ports[0].postMessage.bind(e.ports[0])
})
