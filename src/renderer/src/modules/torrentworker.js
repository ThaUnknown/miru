const WebTorrent = require('webtorrent')
const http = require('http')
const pump = require('pump')
const rangeParser = require('range-parser')
const mime = require('mime')
const { SubtitleParser, SubtitleStream } = require('matroska-subtitles')

class TorrentClient extends WebTorrent {
  constructor (settings) {
    super({
      dht: !settings.torrentDHT,
      downloadLimit: settings.torrentSpeed * 1048576 || 0,
      uploadLimit: settings.torrentSpeed * 1572864 || 0 // :trolled:
    })
    this.settings = settings

    this.current = null
    this.parsed = false
    this.parserInstance = null

    setInterval(() => {
      this.dispatch('stats', {
        numPeers: (this.torrents.length && this.torrents[0].numPeers) || 0,
        uploadSpeed: (this.torrents.length && this.torrents[0].uploadSpeed) || 0,
        downloadSpeed: (this.torrents.length && this.torrents[0].downloadSpeed) || 0
      })
    }, 200)
    setInterval(() => {
      if (this.torrents[0]?.pieces) this.dispatch('pieces', [...this.torrents[0]?.pieces.map(piece => piece === null ? 77 : 33)])
    }, 2000)
    this.on('torrent', torrent => {
      const files = torrent.files.map(file => {
        return {
          infoHash: torrent.infoHash,
          name: file.name,
          type: file._getMimeType(),
          size: file.size,
          path: file.path,
          url: encodeURI('http://localhost:41785/webtorrent/' + torrent.infoHash + '/' + file.path)
        }
      })
      this.dispatch('files', files)
      this.dispatch('pieces', torrent.pieces.length)
      this.dispatch('magnet', { magnet: torrent.magnetURI, hash: torrent.infoHash })
      this.dispatch('torrent', Array.from(torrent.torrentFile))
    })

    this.server = http.createServer((request, response) => {
      if (!request.url) return null
      let [infoHash, ...filePath] = request.url.slice(request.url.indexOf('/webtorrent/') + 12).split('/')
      filePath = decodeURI(filePath.join('/'))
      if (!infoHash || !filePath) return null

      const file = this.get(infoHash)?.files.find(file => file.path === filePath)
      if (!file) return null

      response.setHeader('Access-Control-Allow-Origin', '*')
      response.setHeader('Content-Type', mime.getType(file.name) || 'application/octet-stream')

      response.setHeader('Accept-Ranges', 'bytes')

      let range = rangeParser(file.length, request.headers.range || '')

      if (Array.isArray(range)) {
        response.statusCode = 206
        range = range[0]

        response.setHeader(
          'Content-Range',
          `bytes ${range.start}-${range.end}/${file.length}`
        )
        response.setHeader('Content-Length', range.end - range.start + 1)
      } else {
        response.statusCode = 200
        range = null
        response.setHeader('Content-Length', file.length)
      }

      if (response.method === 'HEAD') {
        return response.end()
      }

      let stream = file.createReadStream(range)

      if (stream && !this.parsed) {
        if (file.name.endsWith('.mkv')) {
          this.parserInstance = new SubtitleStream(this.parserInstance)
          this.handleSubtitleParser(this.parserInstance, true)
          stream = pump(stream, this.parserInstance)
        }
      }

      pump(stream, response)
    })

    this.server.on('error', console.log)

    this.server.listen(41785)

    onmessage = this.handleMessage.bind(this)
  }

  handleMessage ({ data }) {
    switch (data.type) {
      case 'current': {
        this.current?.removeListener('done', this.parseSubtitles.bind(this))
        this.parserInstance?.destroy()
        this.parserInstance = null
        this.current = null
        this.parsed = false
        if (data) {
          this.current = this?.get(data.data.infoHash)?.files.find(file => file.path === data.data.path)
          if (this.current.name.endsWith('.mkv')) {
            if (this.current.done) this.parseSubtitles()
            this.current.on('done', this.parseSubtitles.bind(this))
            this.parseFonts(this.current)
          }
          // findSubtitleFiles(current) TODO:
        }
        break
      }
      case 'torrent': {
        if (this.torrents.length) this.remove(this.torrents[0].infoHash)

        const id = typeof data.data !== 'string' ? Buffer.from(data.data) : data.data
        this.add(id, {
          private: this.settings.torrentPeX,
          path: this.settings.torrentPath,
          destroyStoreOnDestroy: !this.settings.torrentPersist,
          announce: [
            'wss://tracker.openwebtorrent.com',
            'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
            'wss://peertube.cpy.re:443/tracker/socket'
          ]
        })
        break
      }
    }
  }

  dispatch (type, data) {
    postMessage({ type, data })
  }

  parseSubtitles () {
    if (this.current.name.endsWith('.mkv')) {
      const parser = new SubtitleParser()
      this.handleSubtitleParser(parser, true)
      const finish = () => {
        console.log('Sub parsing finished')
        this.parsed = true
        fileStream?.destroy()
        stream?.destroy()
        stream = undefined
      }
      parser.once('tracks', tracks => {
        if (!tracks.length) finish()
      })
      parser.once('finish', finish)
      console.log('Sub parsing started')
      const fileStream = this.current.createReadStream()
      let stream = fileStream.pipe(parser)
    }
  }

  parseFonts (file) {
    const stream = new SubtitleParser()
    this.handleSubtitleParser(stream)
    stream.once('tracks', tracks => {
      if (!tracks.length) {
        this.parsed = true
        stream.destroy()
        fileStreamStream.destroy()
      }
    })
    stream.once('subtitle', () => {
      fileStreamStream.destroy()
      stream.destroy()
    })
    const fileStreamStream = file.createReadStream()
    fileStreamStream.pipe(stream)
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
  }
}

let client = null

onmessage = ({ data }) => {
  if (!client && data.type === 'settings') client = new TorrentClient(data.data)
  if (data.type === 'destroy') client?.predestroy()
}
