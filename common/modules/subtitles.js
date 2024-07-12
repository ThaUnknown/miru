import JASSUB from 'jassub'
import { hex2arr, bin2hex } from 'uint8-util'
import { toTS, subRx, videoRx } from './util.js'
import { settings } from '@/modules/settings.js'
import { client } from '@/modules/torrent.js'
import clipboard from './clipboard.js'
import { SUPPORTS } from '@/modules/support.js'

const defaultHeader = `[Script Info]
Title: English (US)
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1280
PlayResY: 720
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, ${settings.value.font?.name.toLowerCase() || 'Roboto Medium'},52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2.6,0,2,20,20,46,1
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
    this._stylesMap = []
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
    this.handleFile = ({ detail }) => {
      if (this.selected) {
        const uint8 = hex2arr(bin2hex(detail))
        this.fonts.push(uint8)
        this.renderer?.addFont(uint8)
      }
    }
    this.handleSubtitle = ({ detail }) => {
      const { subtitle, trackNumber } = detail
      if (this.selected) {
        const string = JSON.stringify(subtitle)
        if (this._tracksString[trackNumber] && !this._tracksString[trackNumber].has(string)) {
          this._tracksString[trackNumber].add(string)
          const assSub = this.constructSub(subtitle, this.headers[trackNumber].type !== 'ass', this.tracks[trackNumber].length, trackNumber)
          this.tracks[trackNumber].push(assSub)
          if (this.current === trackNumber) this.renderer?.createEvent(assSub)
        }
      }
    }

    this.handleTracks = ({ detail }) => {
      if (this.selected) {
        for (const track of detail) {
          if (!this.tracks[track.number]) {
            // overwrite webvtt or other header with custom one
            if (track.type !== 'ass') track.header = defaultHeader
            this.tracks[track.number] = []
            this._tracksString[track.number] = new Set()
            this.headers[track.number] = track
            this._stylesMap[track.number] = {
              Default: 0
            }
            const styleMatches = track.header.match(stylesRx)
            for (let i = 0; i < styleMatches.length; ++i) {
              const style = styleMatches[i].replace('Style:', '').trim()
              this._stylesMap[track.number][style] = i + 1
            }

            this.onHeader()
          }
        }
        this.initSubtitleRenderer()
        const tracks = this.headers?.filter(t => t)
        if (tracks?.length && settings.value.subtitleLanguage) {
          if (tracks.length === 1) {
            this.selectCaptions(tracks[0].number)
          } else {
            const wantedTrack = tracks.find(({ language }) => {
              if (language == null) language = 'eng'
              return language === settings.value.subtitleLanguage
            })
            if (wantedTrack) return this.selectCaptions(wantedTrack.number)

            const englishTrack = tracks.find(({ language }) => language === null || language === 'eng')
            if (englishTrack) return this.selectCaptions(englishTrack.number)

            this.selectCaptions(tracks[0].number)
          }
        }
      }
    }
    this.handleClipboardText = ({ detail }) => {
      for (const { text, type } of detail) {
        if (text.startsWith('[Script Info]')) this.addSingleSubtitleFile(new File([text], 'Subtitle', { type }))
      }
    }
    this.handleClipboardFiles = ({ detail }) => {
      for (const file of detail) {
        if (subRx.test(file.name)) this.addSingleSubtitleFile(file)
      }
    }
    this.handleSubtitleFile = ({ detail }) => {
      this.addSingleSubtitleFile(new File([detail.data], detail.name))
    }

    client.on('tracks', this.handleTracks)
    client.on('subtitle', this.handleSubtitle)
    client.on('file', this.handleFile)
    client.on('subtitleFile', this.handleSubtitleFile)
    clipboard.on('text', this.handleClipboardText)
    clipboard.on('files', this.handleClipboardFiles)
  }

  async addSingleSubtitleFile (file) {
    // lets hope there's no more than 100 subtitle tracks in a file
    const index = 100 + this.headers.length
    this.subtitleFiles[index] = file
    const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
    const subname = file.name.slice(0, file.name.lastIndexOf('.'))
    // sub name could contain video name with or without extension, possibly followed by lang, or not.
    const name = subname.includes(this.selected.name)
      ? subname.replace(this.selected.name, '')
      : subname.replace(this.selected.name.slice(0, this.selected.name.lastIndexOf('.')), '')
    this.headers[index] = {
      header: defaultHeader,
      language: name.replace(/[,._-]/g, ' ').trim() || 'Track ' + index,
      number: index,
      type
    }
    this.onHeader()
    this.tracks[index] = []
    const subtitles = Subtitles.convertSubText(await file.text(), type)
    if (type === 'ass') {
      this.headers[index].header = subtitles
    } else {
      this.headers[index].header += subtitles.join('\n')
    }
    if (!this.current) {
      this.current = index
      this.initSubtitleRenderer()
      this.selectCaptions(this.current)
      this.onHeader()
    }
  }

  initSubtitleRenderer () {
    if (!this.renderer) {
      const options = {
        video: this.video,
        subContent: defaultHeader,
        fonts: this.fonts,
        offscreenRender: SUPPORTS.offscreenRender,
        libassMemoryLimit: 1024,
        libassGlyphLimit: 80000,
        maxRenderHeight: parseInt(settings.value.subtitleRenderHeight) || 0,
        fallbackFont: settings.value.font?.name || 'roboto medium',
        availableFonts: {
          'roboto medium': './Roboto.ttf'
        },
        workerUrl: new URL('jassub/dist/jassub-worker.js', import.meta.url).toString(),
        wasmUrl: new URL('jassub/dist/jassub-worker.wasm', import.meta.url).toString(),
        legacyWasmUrl: new URL('jassub/dist/jassub-worker.wasm.js', import.meta.url).toString(),
        modernWasmUrl: new URL('jassub/dist/jassub-worker-modern.wasm', import.meta.url).toString(),
        useLocalFonts: settings.value.missingFont,
        dropAllBlur: settings.value.disableSubtitleBlur
      }
      this.renderer = new JASSUB(options)
    }
  }

  static convertSubText (text, type) {
    const srtRx = /(?:\d+\r?\n)?(\S{9,12})\s?-->\s?(\S{9,12})(.*)\r?\n([\s\S]*)$/i
    const srt = text => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      for (const split of replaced.split(/\r?\n\r?\n/)) {
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
          subtitles.push('Dialogue: 0,' + match[1].replace(',', '.') + ',' + match[2].replace(',', '.') + ',Default,,0,0,0,,' + match[4].replace(/\r?\n/g, '\\N'))
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
      for (const split of replaced.split('\r?\n')) {
        const match = split.match(subRx)
        if (match) subtitles.push('Dialogue: 0,' + toTS((match[1] * frames) / 1000, 1) + ',' + toTS((match[2] * frames) / 1000, 1) + ',Default,,0,0,0,,' + match[3].replace('|', '\\N'))
      }
      return subtitles
    }
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

  constructSub (subtitle, isNotAss, subtitleIndex, trackNumber) {
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
      subtitle.text = subtitle.text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\\h').replace(/\r?\n/g, '\\N')
    }
    return {
      Start: subtitle.time,
      Duration: subtitle.duration,
      Style: this._stylesMap[trackNumber][subtitle.style || 'Default'] || 0,
      Name: subtitle.name || '',
      MarginL: Number(subtitle.marginL) || 0,
      MarginR: Number(subtitle.marginR) || 0,
      MarginV: Number(subtitle.marginV) || 0,
      Effect: subtitle.effect || '',
      Text: subtitle.text || '',
      ReadOrder: 1,
      Layer: Number(subtitle.layer) || 0,
      _index: subtitleIndex
    }
  }

  selectCaptions (trackNumber) {
    if (trackNumber != null) {
      this.current = Number(trackNumber)
      this.onHeader()
      if (this.headers) {
        this.renderer?.setTrack(this.current !== -1 ? this.headers[this.current].header.slice(0, -1) : defaultHeader)
        if (this.tracks[this.current]) {
          if (this.renderer) for (const subtitle of this.tracks[this.current]) this.renderer.createEvent(subtitle)
        }
      }
    }
  }

  destroy () {
    client.off('tracks', this.handleTracks)
    client.off('subtitle', this.handleSubtitle)
    client.off('file', this.handleFile)
    client.off('files', this.handleClipboardFiles)
    client.off('text', this.handleClipboardText)
    client.off('subtitleFile', this.handleSubtitleFile)
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
