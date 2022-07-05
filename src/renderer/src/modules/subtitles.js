import JASSUB from 'jassub'
import workerUrl from 'jassub/dist/jassub-worker.js?url'
import 'jassub/dist/jassub-worker.wasm?raw'
import { toTS, videoRx, subRx } from './util.js'

import { client } from '@/modules/torrent.js'

const defaultHeader = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, Roboto Medium,26,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,0,0,0,0,100,100,0,0,1,1.3,0,2,20,20,23,1
[Events]

`
const stylesRx = /^Style:[^,]*/gm
export default class Subtitles {
  constructor (video, files, selected, onHeader) {
    this.video = video
    this.selected = selected || null
    this.files = files || []
    this.headers = []
    this.tracks = []
    this._tracksString = []
    this._stylesMap = {
      Default: 0
    }
    this.fonts = ['/Roboto.ttf']
    this.renderer = null
    this.parsed = false
    this.stream = null
    this.parser = null
    this.current = 0
    this.onHeader = onHeader
    this.videoFiles = files.filter(file => videoRx.test(file.name))
    this.subtitleFiles = []
    this.timeout = null
    client.on('tracks', this.handleTracks.bind(this))
    client.on('subtitle', this.handleSubtitle.bind(this))
    client.on('file', this.handleFile.bind(this))
  }

  handleFile ({ detail }) {
    if (this.selected) {
      const uint8 = new Uint8Array(detail.data)
      this.fonts.push(uint8)
      this.renderer.addFont(uint8)
    }
  }

  handleSubtitle ({ detail }) {
    const { subtitle, trackNumber } = detail
    if (this.selected) {
      const string = JSON.stringify(subtitle)
      if (!this._tracksString[trackNumber].has(string)) {
        this._tracksString[trackNumber].add(string)
        const assSub = this.constructSub(subtitle, this.headers[trackNumber].type !== 'ass', this.tracks[trackNumber].length)
        this.tracks[trackNumber].push(assSub)
        if (this.current === trackNumber) this.renderer.createEvent(assSub)
      }
    }
  }

  handleTracks ({ detail }) {
    if (this.selected) {
      for (const track of detail) {
        if (!this.tracks[track.number]) {
          // overwrite webvtt or other header with custom one
          if (track.type !== 'ass') track.header = defaultHeader
          if (!this.current) {
            this.current = track.number
          }
          this.tracks[track.number] = []
          this._tracksString[track.number] = new Set()
          this.headers[track.number] = track
          const styleMatches = track.header.match(stylesRx)
          for (let i = 0; i < styleMatches.length; ++i) {
            const style = styleMatches[i].replace('Style:', '').trim()
            this._stylesMap[style] = i + 1
          }

          this.onHeader()
        }
      }
      this.initSubtitleRenderer()
    }
  }

  async findSubtitleFiles (targetFile) {
    const videoName = targetFile.name.substring(0, targetFile.name.lastIndexOf('.')) || targetFile.name
    // array of subtitle files that match video name, or all subtitle files when only 1 vid file
    const subfiles = this.files.filter(file => {
      return !this.subtitleFiles.some(sub => { // exclude already existing files
        return sub.lastModified === file.lastModified && sub.name === file.name && sub.size === file.size
      }) && subRx.test(file.name) && (this.videoFiles.length === 1 ? true : file.name.includes(videoName))
    })
    if (subfiles.length) {
      this.parsed = true
      const length = this.headers.length
      for (const [i, file] of subfiles.entries()) {
        const index = i + length
        this.subtitleFiles[index] = file
        const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
        const subname = file.name.slice(0, file.name.lastIndexOf('.'))
        // sub name could contain video name with or without extension, possibly followed by lang, or not.
        const name = subname.includes(targetFile.name)
          ? subname.replace(targetFile.name, '')
          : subname.replace(targetFile.name.slice(0, targetFile.name.lastIndexOf('.')), '')
        this.headers[index] = {
          header: defaultHeader,
          language: name.replace(/[,._-]/g, ' ').trim() || 'Track ' + index,
          number: index,
          type
        }
        this.onHeader()
        this.tracks[index] = []
        const subtitles = await Subtitles.convertSubFile(file, type)
        if (type === 'ass') {
          this.headers[index].header = subtitles
        } else {
          this.headers[index].header += subtitles.join('\n')
        }
      }
      if (!this.current) {
        this.current = 0
        this.initSubtitleRenderer()
        this.selectCaptions(this.current)
        this.onHeader()
      }
    }
  }

  initSubtitleRenderer () {
    if (!this.renderer) {
      this.renderer = new JASSUB({
        video: this.video,
        subContent: this.headers[this.current].header.slice(0, -1),
        fonts: this.fonts,
        fallbackFont: 'roboto medium',
        availableFonts: {
          'roboto medium': '/Roboto.ttf'
        },
        useLocalFonts: true,
        workerUrl
      })
      this.selectCaptions(this.current)
    }
  }

  static async convertSubFile (file, type) {
    const srtRx = /(?:\d+\n)?(\S{9,12})\s?-->\s?(\S{9,12})(.*)\n([\s\S]*)$/i
    const srt = text => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      for (const split of replaced.split('\n\n')) {
        const match = split.match(srtRx)
        if (match) {
          // timestamps
          match[1] = match[1].match(/.*[.,]\d{2}/)[0]
          match[2] = match[2].match(/.*[.,]\d{2}/)[0]
          if (match[1].length === 9) {
            match[1] = '0:' + match[1]
          } else {
            if (match[1][0] === '0') {
              match[1] = match[1].substring(1)
            }
          }
          match[1].replace(',', '.')
          if (match[2].length === 9) {
            match[2] = '0:' + match[2]
          } else {
            if (match[2][0] === '0') {
              match[2] = match[2].substring(1)
            }
          }
          match[2].replace(',', '.')
          // create array of all tags
          const matches = match[4].match(/<[^>]+>/g)
          if (matches) {
            matches.forEach(matched => {
              if (/<\//.test(matched)) { // check if its a closing tag
                match[4] = match[4].replace(matched, matched.replace('</', '{\\').replace('>', '0}'))
              } else {
                match[4] = match[4].replace(matched, matched.replace('<', '{\\').replace('>', '1}'))
              }
            })
          }
          subtitles.push('Dialogue: 0,' + match[1].replace(',', '.') + ',' + match[2].replace(',', '.') + ',Default,,0,0,0,,' + match[4].replace(/\n/g, '\\N'))
        }
      }
      return subtitles
    }
    const subRx = /[{[](\d+)[}\]][{[](\d+)[}\]](.+)/i
    const sub = text => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      let frames = 1000 / Number(replaced.match(subRx)[3])
      if (!frames || isNaN(frames)) frames = 41.708
      for (const split of replaced.split('\n')) {
        const match = split.match(subRx)
        if (match) subtitles.push('Dialogue: 0,' + toTS((match[1] * frames) / 1000, 1) + ',' + toTS((match[2] * frames) / 1000, 1) + ',Default,,0,0,0,,' + match[3].replace('|', '\\N'))
      }
      return subtitles
    }
    const text = await file.text()
    const subtitles = type === 'ass' ? text : []
    if (type === 'ass') {
      return subtitles
    } else if (type === 'srt' || type === 'vtt') {
      return srt(text)
    } else if (type === 'sub') {
      return sub(text)
    } else {
      // subbers have a tendency to not set the extensions properly
      if (srtRx.test(text)) return srt(text)
      if (subRx.test(text)) return sub(text)
    }
  }

  constructSub (subtitle, isNotAss, index) {
    if (isNotAss === true) { // converts VTT or other to SSA
      const matches = subtitle.text.match(/<[^>]+>/g) // create array of all tags
      if (matches) {
        matches.forEach(match => {
          if (/<\//.test(match)) { // check if its a closing tag
            subtitle.text = subtitle.text.replace(match, match.replace('</', '{\\').replace('>', '0}'))
          } else {
            subtitle.text = subtitle.text.replace(match, match.replace('<', '{\\').replace('>', '1}'))
          }
        })
      }
      // replace all html special tags with normal ones
      subtitle.text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\\h').replace(/\n/g, '\\N')
    }
    return {
      Start: subtitle.time,
      Duration: subtitle.duration,
      Style: this._stylesMap[subtitle.style || 'Default'] || 0,
      Name: subtitle.name || '',
      MarginL: Number(subtitle.marginL) || 0,
      MarginR: Number(subtitle.marginR) || 0,
      MarginV: Number(subtitle.marginV) || 0,
      Effect: subtitle.effect || '',
      Text: subtitle.text || '',
      ReadOrder: 1,
      Layer: Number(subtitle.layer) || 0,
      _index: index
    }
  }

  selectCaptions (trackNumber) {
    if (trackNumber !== undefined) {
      this.current = Number(trackNumber)
      this.onHeader()
      if (this.renderer && this.headers) {
        this.renderer.setTrack(this.current !== -1 ? this.headers[this.current].header.slice(0, -1) : defaultHeader)
        if (this.tracks[this.current]) {
          for (const subtitle of this.tracks[this.current]) this.renderer.createEvent(subtitle)
        }
      }
    }
  }

  destroy () {
    client.removeListener('tracks', this.handleTracks.bind(this))
    client.removeListener('subtitle', this.handleSubtitle.bind(this))
    client.removeListener('file', this.handleFile.bind(this))
    this.stream?.destroy()
    this.parser?.destroy()
    this.renderer?.destroy()
    this.files = null
    this.video = null
    this.selected = null
    this.tracks = null
    this.headers = null
    this.onHeader()
  }
}
