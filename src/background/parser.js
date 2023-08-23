import { pipeline } from 'streamx'
import { SubtitleParser, SubtitleStream } from 'matroska-subtitles'

export default class Parser {
  parsed = false
  metadata = null
  client = null
  file = null
  parser = null
  stream = null
  destroyed = false
  constructor (client, file) {
    this.client = client
    this.file = file
    if (this.file.name.endsWith('.mkv')) {
      // if (this.file.done) this.parseSubtitles()
      // this.file.once('done', this.boundParse)
      this.parseFonts(this.file)
      this.file.on('stream', (_, cb) => {
        if (!this.parsed) {
          this.stream = new SubtitleStream(this.metadata || this.stream)
          this.handleSubtitleParser(this.stream, true)
          cb(this.stream)
        }
      })
    }
  }

  parseSubtitles () {
    if (this.file.name.endsWith('.mkv')) {
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
      const fileStream = this.file.createReadStream()
      this.parser = fileStream.pipe(parser)
    }
  }

  destroy () {
    this.destroyed = true
    this.parser?.destroy()
    this.stream?.destroy()
    this.metadata?.destroy()
    this.metadata = undefined
    this.parser = undefined
    this.stream = undefined
  }

  parseFonts (file) {
    const metadata = pipeline(file.createReadStream(), new SubtitleParser())
    this.handleSubtitleParser(metadata)
    metadata.once('tracks', tracks => {
      if (!tracks.length) {
        this.parsed = true
        metadata.destroy()
      }
    })
    metadata.once('subtitle', () => {
      metadata.destroy()
      if (this.destroyed) return
      this.metadata = metadata
    })
  }

  handleSubtitleParser (parser, skipFile) {
    parser.once('tracks', tracks => {
      if (!tracks.length) {
        this.parsed = true
        parser?.destroy()
      } else {
        if (this.destroyed) return
        this.client.dispatch('tracks', tracks)
      }
    })
    parser.on('subtitle', (subtitle, trackNumber) => {
      if (this.destroyed) return
      this.client.dispatch('subtitle', { subtitle, trackNumber })
    })
    if (!skipFile) {
      parser.once('chapters', chapters => {
        if (this.destroyed) return
        this.client.dispatch('chapters', chapters)
      })
      parser.on('file', file => {
        if (this.destroyed) return
        if (file.mimetype.toLowerCase().includes('font') || file.filename.toLowerCase().endsWith('.ttf')) {
          const data = new Uint8Array(file.data).slice(0)
          this.client.dispatch('file', { mimetype: file.mimetype, data }, [data.buffer])
        }
      })
    }
  }
}
