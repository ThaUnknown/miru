const { app, ipcMain } = require('electron')
const WebTorrent = require('webtorrent')
const http = require('http')
const pump = require('pump')
const rangeParser = require('range-parser')
const mime = require('mime')
const { SubtitleParser, SubtitleStream } = require('matroska-subtitles')

let window = null
app.on('browser-window-created', (event, data) => {
  window = data
  window.on('closed', () => {
    window = null
  })
})

let client = null

let settings = {}

const server = http.createServer((request, response) => {
  if (!request.url) return null
  let [infoHash, ...filePath] = request.url.slice(request.url.indexOf('/webtorrent/') + 12).split('/')
  filePath = decodeURI(filePath.join('/'))
  if (!infoHash || !filePath) return null

  const file = client?.get(infoHash)?.files.find(file => file.path === filePath)
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

  if (stream && !parsed) {
    if (file.name.endsWith('.mkv')) {
      parserInstance = new SubtitleStream(parserInstance)
      handleSubtitleParser(parserInstance, true)
      stream = pump(stream, parserInstance)
    }
  }

  pump(stream, response)
})

server.listen(41785)

let current = null
let parsed = false
let parserInstance = null

function parseSubtitles () {
  if (current.name.endsWith('.mkv')) {
    const parser = new SubtitleParser()
    handleSubtitleParser(parser, true)
    const finish = () => {
      console.log('Sub parsing finished')
      parsed = true
      fileStream?.destroy()
      stream?.destroy()
      stream = undefined
    }
    parser.once('tracks', tracks => {
      if (!tracks.length) finish()
    })
    parser.once('finish', finish)
    console.log('Sub parsing started')
    const fileStream = current.createReadStream()
    let stream = fileStream.pipe(parser)
  }
}

function parseFonts (file) {
  const stream = new SubtitleParser()
  handleSubtitleParser(stream)
  stream.once('tracks', tracks => {
    if (!tracks.length) {
      parsed = true
      stream.destroy()
      fileStreamStream.destroy()
    }
  })
  stream.once('subtitle', () => {
    fileStreamStream.destroy()
    stream.destroy()
    window?.webContents.send('fonts')
  })
  const fileStreamStream = file.createReadStream()
  fileStreamStream.pipe(stream)
}

function handleSubtitleParser (parser, skipFile) {
  parser.once('tracks', tracks => {
    if (!tracks.length) {
      parsed = true
      parser?.destroy()
    } else {
      window?.webContents.send('tracks', tracks)
    }
  })
  parser.on('subtitle', (subtitle, trackNumber) => {
    window?.webContents.send('subtitle', { subtitle, trackNumber })
  })
  if (!skipFile) {
    parser.on('file', file => {
      if (file.mimetype === 'application/x-truetype-font' || file.mimetype === 'application/font-woff' || file.mimetype === 'application/vnd.ms-opentype') {
        window?.webContents.send('file', { mimetype: file.mimetype, data: Array.from(file.data) })
      }
    })
  }
}

ipcMain.on('current', (event, data) => {
  current?.removeListener('done', parseSubtitles)
  parserInstance?.destroy()
  parserInstance = null
  current = null
  parsed = false
  if (data) {
    current = client?.get(data.infoHash)?.files.find(file => file.path === data.path)
    if (current.name.endsWith('.mkv')) {
      if (current.done) parseSubtitles()
      current.on('done', parseSubtitles)
      parseFonts(current)
    }
    // findSubtitleFiles(current) TODO:
  }
})

ipcMain.on('settings', (event, data) => {
  settings = data
  client = new WebTorrent({
    dht: !settings.torrentDHT,
    downloadLimit: settings.torrentSpeed * 1048576 || 0,
    uploadLimit: settings.torrentSpeed * 1572864 || 0 // :trolled:
  })
  setInterval(() => {
    window?.webContents?.send('stats', {
      numPeers: (client?.torrents.length && client?.torrents[0].numPeers) || 0,
      uploadSpeed: (client?.torrents.length && client?.torrents[0].uploadSpeed) || 0,
      downloadSpeed: (client?.torrents.length && client?.torrents[0].downloadSpeed) || 0
    })
  }, 200)
  client.on('torrent', torrent => {
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
    window?.webContents.send('files', files)
    window?.webContents.send('torrent', Array.from(torrent.torrentFile))
  })
})

ipcMain.on('torrent', (event, data) => {
  if (client.torrents.length) client.remove(client.torrents[0].infoHash)
  if (typeof data !== 'string') data = Buffer.from(data)
  client.add(data, {
    private: settings.torrentPeX,
    path: settings.torrentPath,
    destroyStoreOnDestroy: !settings.torrentPersist,
    announce: [
      'wss://tracker.openwebtorrent.com',
      'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
      'wss://peertube.cpy.re:443/tracker/socket'
    ]
  })
})
