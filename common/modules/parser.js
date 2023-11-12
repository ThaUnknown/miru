import { fontRx } from './util.js'
import Metadata from 'matroska-metadata'

export default class Parser {
  parsed = false
  /** @type {Metadata} */
  metadata = null
  client = null
  file = null
  destroyed = false
  constructor (client, file) {
    this.client = client
    this.file = file
    this.metadata = new Metadata(file)

    this.metadata.getTracks().then(tracks => {
      if (this.destroyed) return
      if (!tracks.length) {
        this.parsed = true
        this.destroy()
      } else {
        this.client.dispatch('tracks', tracks)
      }
    })

    this.metadata.getChapters().then(chapters => {
      if (this.destroyed) return
      this.client.dispatch('chapters', chapters)
    })

    this.metadata.getAttachments().then(files => {
      if (this.destroyed) return
      for (const file of files) {
        if (fontRx.test(file.filename) || file.mimetype.toLowerCase().includes('font')) {
          const data = new Uint8Array(file.data)
          this.client.dispatch('file', { data }, [data.buffer])
        }
      }
    })

    this.metadata.on('subtitle', (subtitle, trackNumber) => {
      if (this.destroyed) return
      this.client.dispatch('subtitle', { subtitle, trackNumber })
    })

    if (this.file.name.endsWith('.mkv') || this.file.name.endsWith('.webm')) {
      this.file.on('iterator', ({ iterator }, cb) => {
        if (this.destroyed) return cb(iterator)
        cb(this.metadata.parseStream(iterator))
      })
    }
  }

  async parseSubtitles () {
    if (this.file.name.endsWith('.mkv') || this.file.name.endsWith('.webm')) {
      console.log('Sub parsing started')
      await this.metadata.parseFile()
      console.log('Sub parsing finished')
    }
  }

  destroy () {
    this.destroyed = true
    this.metadata?.destroy()
    this.metadata = undefined
  }
}
