import JASSUB, { type ASS_Event as ASSEvent } from 'jassub'
import { writable } from 'simple-store-svelte'
import { get } from 'svelte/store'

import { fontRx, type ResolvedFile } from './resolver'

import type { TorrentFile } from '../../../../app'

import native from '$lib/modules/native'
import { settings, SUPPORTS } from '$lib/modules/settings'
import { HashMap } from '$lib/utils'
// import { toTS } from '$lib/utils'

const defaultHeader = `[Script Info]
Title: English (US)
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1280
PlayResY: 720
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, Roboto Medium,52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2.6,0,2,20,20,46,1
[Events]

`

const stylesRx = /^Style:[^,]*/gm
export default class Subtitles {
  video: HTMLVideoElement
  selected: ResolvedFile
  files: TorrentFile[]
  fonts: string[]
  renderer: JASSUB | null = null
  current = writable<number | string>(-1)
  set = get(settings)

  _tracks = writable<Record<number | string, { events: HashMap<{ text: string, time: number, duration: number, style?: string }, ASSEvent>, meta: { language?: string, type: string, header: string, number: string, name?: string }, styles: Record<string | number, number> }>>({})

  constructor (video: HTMLVideoElement, files: TorrentFile[], selected: ResolvedFile) {
    this.video = video
    this.selected = selected
    this.files = files
    this.fonts = ['/Roboto.ttf', ...files.filter(file => fontRx.test(file.name)).map(file => file.url)]

    this.current.subscribe(value => {
      this.selectCaptions(value)
    })

    native.subtitles(this.selected.hash, this.selected.id, (subtitle: { text: string, time: number, duration: number, style?: string }, trackNumber) => {
      const { events, meta, styles } = this.track(trackNumber)
      if (events.has(subtitle)) return
      const event = this.constructSub(subtitle, meta.type !== 'ass', events.size, '' + (styles[subtitle.style ?? 'Default'] ?? 0))
      events.add(subtitle, event)
      if (Number(this.current.value) === trackNumber) this.renderer?.createEvent(event)
    })

    native.tracks(this.selected.hash, this.selected.id).then(tracklist => {
      for (const track of tracklist) {
        const newtrack = this.track(track.number)
        newtrack.styles.Default = 0
        if (track.header?.startsWith('[Script Info]')) track.type = 'ass'
        track.header ??= defaultHeader
        newtrack.meta = track as { language?: string, type: string, header: string, number: string, name?: string }
        const styleMatches = track.header.match(stylesRx)
        if (!styleMatches) continue
        for (let i = 0; i < styleMatches.length; ++i) {
          newtrack.styles[styleMatches[i]!.replace('Style:', '').trim()] = i + 1
        }
      }
      this.initSubtitleRenderer()

      const tracks = Object.entries(this._tracks.value)
      if (tracks.length) {
        if (tracks.length === 1) {
          this.selectCaptions(tracks[0]![0])
        } else {
          const wantedTrack = tracks.find(([_, { meta }]) => {
            return (meta.language ?? 'eng') === this.set.subtitleLanguage
          })
          if (wantedTrack) return this.selectCaptions(wantedTrack[0])

          const englishTrack = tracks.find(([_, { meta }]) => meta.language == null || meta.language === 'eng')
          if (englishTrack) return this.selectCaptions(englishTrack[0])

          this.selectCaptions(tracks[0]![0])
        }
      }
    })

    native.attachments(this.selected.hash, this.selected.id).then(attachments => {
      for (const attachment of attachments) {
        if (fontRx.test(attachment.filename) || attachment.mimetype.toLowerCase().includes('font')) {
          this.fonts.push(attachment.url)
          this.renderer?.addFont(attachment.url)
        }
      }
    })
  }

  initSubtitleRenderer () {
    if (this.renderer) return

    // @ts-expect-error yeah, patching the library
    if (SUPPORTS.isAndroid) JASSUB._hasBitmapBug = true
    this.renderer = new JASSUB({
      video: this.video,
      subContent: defaultHeader,
      fonts: this.fonts,
      offscreenRender: !SUPPORTS.isAndroid,
      libassMemoryLimit: 1024, // TODO: more? check how much MPV uses
      libassGlyphLimit: 80000,
      maxRenderHeight: parseInt(this.set.subtitleRenderHeight) || 0,
      fallbackFont: 'roboto medium',
      availableFonts: {
        'roboto medium': './Roboto.ttf'
      },
      workerUrl: new URL('jassub/dist/jassub-worker.js', import.meta.url).toString(),
      wasmUrl: new URL('jassub/dist/jassub-worker.wasm', import.meta.url).toString(),
      legacyWasmUrl: new URL('jassub/dist/jassub-worker.wasm.js', import.meta.url).toString(),
      modernWasmUrl: new URL('jassub/dist/jassub-worker-modern.wasm', import.meta.url).toString(),
      useLocalFonts: this.set.missingFont,
      dropAllBlur: this.set.disableSubtitleBlur
    })
  }

  track (trackNumber: number | string) {
    const tracks = this._tracks.value
    if (tracks[trackNumber]) {
      return tracks[trackNumber]
    } else {
      tracks[trackNumber] = {
        events: new HashMap(),
        // @ts-expect-error initializing with empty object
        meta: {},
        styles: {}
      }
      return tracks[trackNumber]!
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructSub (subtitle: any, isNotAss: boolean, subtitleIndex: number, Style: string) {
    let Text = subtitle.text || ''
    if (isNotAss) { // converts VTT or other to SSA
      const matches: string[] | null = Text.match(/<[^>]+>/g) // create array of all tags
      if (matches) {
        matches.forEach(match => {
          if (match.includes('</')) { // check if its a closing tag
            Text = Text.replace(match, match.replace('</', '{\\').replace('>', '0}'))
          } else {
            Text = Text.replace(match, match.replace('<', '{\\').replace('>', '1}'))
          }
        })
      }
      // replace all html special tags with normal ones
      Text = Text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\\h').replace(/1?\n/g, '\\N')
    }
    return {
      Start: subtitle.time,
      Duration: subtitle.duration,
      Style,
      Name: subtitle.name || '',
      MarginL: Number(subtitle.marginL) || 0,
      MarginR: Number(subtitle.marginR) || 0,
      MarginV: Number(subtitle.marginV) || 0,
      Effect: subtitle.effect || '',
      Text,
      ReadOrder: 1,
      Layer: Number(subtitle.layer) || 0,
      _index: subtitleIndex
    }
  }

  selectCaptions (trackNumber: number | string) {
    this.current.value = trackNumber

    if (!this.renderer) return

    if (trackNumber === -1) {
      this.renderer.setTrack(defaultHeader)
      return this.renderer.resize()
    }

    const track = this._tracks.value[trackNumber]
    if (!track) return

    this.renderer.setTrack(track.meta.header.slice(0, -1))
    for (const subtitle of track.events) this.renderer.createEvent(subtitle)
    this.renderer.resize()
  }

  destroy () {
    this.renderer?.destroy()
    this.files = []
    for (const { events } of Object.values(this._tracks.value)) {
      events.clear()
    }
  }

  // async addSingleSubtitleFile (file: File) {
  //   // lets hope there's no more than 100 subtitle tracks in a file
  //   const index = 100 + this.headers.length
  //   this.subtitleFiles[index] = file
  //   const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
  //   const subname = file.name.slice(0, file.name.lastIndexOf('.'))
  //   // sub name could contain video name with or without extension, possibly followed by lang, or not.
  //   const name = subname.includes(this.selected.name)
  //     ? subname.replace(this.selected.name, '')
  //     : subname.replace(this.selected.name.slice(0, this.selected.name.lastIndexOf('.')), '')
  //   this.headers[index] = {
  //     header: defaultHeader,
  //     language: name.replace(/[,._-]/g, ' ').trim() || 'Track ' + index,
  //     number: index,
  //     type
  //   }
  //   this.tracks[index] = []
  //   const subtitles = Subtitles.convertSubText(await file.text(), type) ?? ['']
  //   if (type === 'ass') {
  //     this.headers[index].header = subtitles
  //   } else {
  //     this.headers[index].header += subtitles.join('\n')
  //   }
  //   if (!this.current) {
  //     this.current = index
  //     this.initSubtitleRenderer()
  //     this.selectCaptions(this.current)
  //   }
  // }

  // static convertSubText (text: string, type: string) {
  //   const srtRx = /(?:\d+\r?\n)?(\S{9,12})\s?-->\s?(\S{9,12})(.*)\r?\n([\s\S]*)$/i
  //   const srt = (text: string) => {
  //     const subtitles = []
  //     const replaced = text.replace(/\r/g, '')
  //     for (const split of replaced.split(/\r?\n\r?\n/)) {
  //       const match: string[] | null = split.match(srtRx)
  //       if (match?.length !== 5) continue
  //       // timestamps
  //       match[1] = match[1]!.match(/.*[.,]\d{2}/)![0]
  //       match[2] = match[2]!.match(/.*[.,]\d{2}/)![0]
  //       if (match[1]?.length === 9) {
  //         match[1] = '0:' + match[1]
  //       } else {
  //         if (match[1]?.[0] === '0') {
  //           match[1] = match[1].substring(1)
  //         }
  //       }
  //       match[1]?.replace(',', '.')
  //       if (match[2]?.length === 9) {
  //         match[2] = '0:' + match[2]
  //       } else {
  //         if (match[2]?.[0] === '0') {
  //           match[2] = match[2].substring(1)
  //         }
  //       }
  //       match[2]?.replace(',', '.')
  //       // create array of all tags
  //       const matches = match[4]?.match(/<[^>]+>/g)
  //       if (matches) {
  //         matches.forEach(matched => {
  //           if (matched.includes('</')) { // check if its a closing tag
  //             match[4] = match[4]!.replace(matched, matched.replace('</', '{\\').replace('>', '0}'))
  //           } else {
  //             match[4] = match[4]!.replace(matched, matched.replace('<', '{\\').replace('>', '1}'))
  //           }
  //         })
  //       }
  //       subtitles.push('Dialogue: 0,' + match[1].replace(',', '.') + ',' + match[2].replace(',', '.') + ',Default,,0,0,0,,' + match[4]!.replace(/\r?\n/g, '\\N'))
  //     }
  //     return subtitles
  //   }
  //   const subRx = /[{[](\d+)[}\]][{[](\d+)[}\]](.+)/i
  //   const sub = (text: string) => {
  //     const subtitles = []
  //     const replaced = text.replace(/\r/g, '')
  //     let frames = 1000 / Number(replaced.match(subRx)?.[3])
  //     if (!frames || isNaN(frames)) frames = 41.708
  //     for (const split of replaced.split('\r?\n')) {
  //       const match = split.match(subRx)
  //       if (match) subtitles.push('Dialogue: 0,' + toTS((Number(match[1]) * frames) / 1000, 1) + ',' + toTS((Number(match[2]) * frames) / 1000, 1) + ',Default,,0,0,0,,' + match[3]?.replace('|', '\\N'))
  //     }
  //     return subtitles
  //   }
  //   const subtitles = type === 'ass' ? text : []
  //   if (type === 'ass') {
  //     return subtitles
  //   } else if (type === 'srt' || type === 'vtt') {
  //     return srt(text)
  //   } else if (type === 'sub') {
  //     return sub(text)
  //   } else {
  //     // subbers have a tendency to not set the extensions properly
  //     if (srtRx.test(text)) return srt(text)
  //     if (subRx.test(text)) return sub(text)
  //   }
  // }
}
