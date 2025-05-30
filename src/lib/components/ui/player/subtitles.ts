import JASSUB, { type ASS_Style as ASSStyle, type ASS_Event as ASSEvent } from 'jassub'
import { writable } from 'simple-store-svelte'
import { get } from 'svelte/store'

import type { ResolvedFile } from './resolver'
import type { TorrentFile } from '../../../../app'

import native from '$lib/modules/native'
import { type defaults, settings, SUPPORTS } from '$lib/modules/settings'
import { fontRx, HashMap, subRx, subtitleExtensions, toTS } from '$lib/utils'

const defaultHeader = `[Script Info]
Title: English (US)
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, Roboto Medium,52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2.6,0,2,20,20,46,1
[Events]

`

const STYLE_OVERRIDES: Record<typeof defaults.subtitleStyle, Pick<ASSStyle, 'FontName' |'Spacing' | 'ScaleX'>> = {
  none: {
    FontName: 'Roboto Medium',
    Spacing: 0,
    ScaleX: 1
  },
  gandhisans: {
    FontName: 'Gandhi Sans',
    Spacing: 0.2,
    ScaleX: 0.98
  },
  notosans: {
    FontName: 'Noto Sans',
    Spacing: 0,
    ScaleX: 0.99
  },
  roboto: {
    FontName: 'Roboto Medium',
    Spacing: 0,
    ScaleX: 1
  }
}

const OVERRIDE_FONTS: Partial<Record<typeof defaults.subtitleStyle, string>> = {
  gandhisans: '/GandhiSans-Bold.woff2',
  notosans: '/NotoSans-Bold.woff2'
}

const LANGUAGE_OVERRIDES: Record<string, {url: string, name: string}> = {
  jpn: { url: '/NotoSansJP.woff2', name: 'Noto Sans JP Bold' },
  kor: { url: '/NotoSansKR.woff2', name: 'Noto Sans KR Bold' },
  chi: { url: '/NotoSansHK.woff2', name: 'Noto Sans HK' },
  ja: { url: '/NotoSansJP.woff2', name: 'Noto Sans JP Bold' },
  ko: { url: '/NotoSansKR.woff2', name: 'Noto Sans KR Bold' },
  zh: { url: '/NotoSansHK.woff2', name: 'Noto Sans HK' }
}

const stylesRx = /^Style:[^,]*/gm
export default class Subtitles {
  video: HTMLVideoElement
  selected: ResolvedFile
  fonts: string[]
  renderer: JASSUB | null = null
  current = writable<number | string>(-1)
  set = get(settings)

  _tracks = writable<Record<number | string, { events: HashMap<{ text: string, time: number, duration: number, style?: string }, ASSEvent>, meta: { language?: string, type: string, header: string, number: string, name?: string }, styles: Record<string | number, number> }>>({})

  ctrl = new AbortController()

  constructor (video: HTMLVideoElement, otherFiles: TorrentFile[], selected: ResolvedFile) {
    this.video = video
    this.selected = selected
    this.fonts = ['/Roboto.woff2', ...otherFiles.filter(file => fontRx.test(file.name)).map(file => file.url)]

    this.current.subscribe(value => {
      this.selectCaptions(value)
    })

    settings.subscribe(set => {
      this._applyStyleOverride(set.subtitleStyle)
    })

    const subFiles = otherFiles.filter(({ name }) => subRx.test(name))

    const fetchAndLoad = async (file: TorrentFile) => {
      const res = await fetch(file.url)
      const blob = await res.blob()
      this.addSingleSubtitleFile(new File([blob], file.name))
    }

    if (subFiles.length === 1) {
      fetchAndLoad(subFiles[0]!)
    } else if (subFiles.length > 1) {
      const videoName = selected.name.substring(0, selected.name.lastIndexOf('.')) || selected.name
      for (const file of subFiles) {
        if (file.name.includes(videoName)) {
          fetchAndLoad(file)
        }
      }
    }

    const tracks = native.tracks(this.selected.hash, this.selected.id).then(tracklist => {
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
          const wantedTrack = tracks.filter(([_, { meta }]) => {
            return (meta.language ?? 'eng') === this.set.subtitleLanguage
          })
          if (wantedTrack.length) {
            if (wantedTrack.length === 1) return this.selectCaptions(wantedTrack[0]![0])

            const nonForced = wantedTrack.find(([_, { meta }]) => {
              return !meta.name?.toLowerCase().includes('forced')
            }) ?? wantedTrack[0]!

            return this.selectCaptions(nonForced[0])
          }

          const englishTrack = tracks.filter(([_, { meta }]) => meta.language == null || meta.language === 'eng')
          if (englishTrack.length) {
            if (englishTrack.length === 1) return this.selectCaptions(englishTrack[0]![0])

            const nonForced = englishTrack.find(([_, { meta }]) => {
              return !meta.name?.toLowerCase().includes('forced')
            }) ?? englishTrack[0]!

            return this.selectCaptions(nonForced[0])
          }

          this.selectCaptions(tracks[0]![0])
        }
      }
    })

    native.subtitles(this.selected.hash, this.selected.id, async (subtitle: { text: string, time: number, duration: number, style?: string }, trackNumber) => {
      await tracks
      const { events, meta, styles } = this.track(trackNumber)
      if (events.has(subtitle)) return
      const event = this.constructSub(subtitle, meta.type !== 'ass', events.size, '' + (styles[subtitle.style ?? 'Default'] ?? 0))
      events.add(subtitle, event)
      if (Number(this.current.value) === trackNumber) this.renderer?.createEvent(event)
    }).catch(console.error)

    native.attachments(this.selected.hash, this.selected.id).then(attachments => {
      for (const attachment of attachments) {
        if (fontRx.test(attachment.filename) || attachment.mimetype.toLowerCase().includes('font')) {
          this.addFont(attachment.url)
        }
      }
    })

    video.parentElement!.addEventListener('drop', e => this.handleTransfer(e), { signal: this.ctrl.signal })
    video.parentElement!.addEventListener('paste', e => this.handleTransfer(e), { signal: this.ctrl.signal })
    video.parentElement!.addEventListener('dragover', e => e.preventDefault(), { signal: this.ctrl.signal })
  }

  async handleTransfer (e: { dataTransfer?: DataTransfer | null, clipboardData?: DataTransfer | null } & Event) {
    e.preventDefault()
    const promises = [...(e.dataTransfer ?? e.clipboardData)!.items].map(item => {
      const type = item.type
      return new Promise<File>(resolve => item.kind === 'string' ? item.getAsString(text => resolve(new File([text], 'Subtitle.txt', { type }))) : resolve(item.getAsFile()!))
    })

    for (const file of await Promise.all(promises)) {
      if (subRx.test(file.name)) this.addSingleSubtitleFile(file)
    }
  }

  addFont (url: string) {
    if (!this.fonts.includes(url)) {
      this.fonts.push(url)
      this.renderer?.addFont(url)
    }
  }

  pickFile () {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = subtitleExtensions.map(ext => '.' + ext).join(',')
    input.multiple = true
    input.addEventListener('change', () => {
      for (const file of input.files ?? []) {
        if (subRx.test(file.name)) this.addSingleSubtitleFile(file)
      }
    })
    input.click()
  }

  async addSingleSubtitleFile (file: File) {
    // lets hope there's no more than 100 subtitle tracks in a file
    const trackNumber = 1000 + Object.keys(this._tracks.value).length

    const dot = file.name.lastIndexOf('.')
    const extension = file.name.substring(dot + 1).toLowerCase()
    if (!subtitleExtensions.includes(extension)) return
    const filename = file.name.slice(0, dot)
    // sub name could contain video name with or without extension, possibly followed by lang, or not.
    const name = filename.includes(this.selected.name)
      ? filename.replace(this.selected.name, '')
      : filename.replace(this.selected.name.slice(0, this.selected.name.lastIndexOf('.')), '')

    const convert = Subtitles.convertSubText(await file.text(), extension)
    if (!convert) return
    const { header, type } = convert
    const newtrack = this.track(trackNumber)
    newtrack.styles.Default = 0
    newtrack.meta = { type, header, number: '' + trackNumber, name, language: name.replace(/[,._-]/g, ' ').trim() || 'Track ' + trackNumber }
    const styleMatches = header.match(stylesRx)
    if (styleMatches) {
      for (let i = 0; i < styleMatches.length; ++i) {
        newtrack.styles[styleMatches[i]!.replace('Style:', '').trim()] = i + 1
      }
    }
    if (this.current.value === -1) {
      this.selectCaptions(trackNumber)
      this.initSubtitleRenderer()
    }
  }

  initSubtitleRenderer () {
    if (this.renderer) return

    if (SUPPORTS.isAndroid) JASSUB._hasBitmapBug = true
    this.renderer = new JASSUB({
      video: this.video,
      subContent: defaultHeader,
      fonts: this.fonts,
      offscreenRender: !SUPPORTS.isAndroid,
      maxRenderHeight: parseInt(this.set.subtitleRenderHeight) || 0,
      fallbackFont: 'roboto medium',
      workerUrl: new URL('jassub/dist/jassub-worker.js', import.meta.url).toString(),
      wasmUrl: new URL('jassub/dist/jassub-worker.wasm', import.meta.url).toString(),
      modernWasmUrl: new URL('jassub/dist/jassub-worker-modern.wasm', import.meta.url).toString(),
      useLocalFonts: this.set.missingFont,
      dropAllBlur: this.set.disableSubtitleBlur
    })

    this._applyStyleOverride(this.set.subtitleStyle)
  }

  lastSubtitleStyle: typeof defaults.subtitleStyle | undefined = undefined
  _applyStyleOverride (subtitleStyle: typeof defaults.subtitleStyle) {
    if (this.lastSubtitleStyle === subtitleStyle) return
    if (this.renderer) this.lastSubtitleStyle = subtitleStyle
    if (subtitleStyle !== 'none') {
      const font = OVERRIDE_FONTS[subtitleStyle]
      if (font) this.addFont(font)
      const overrideStyle: ASSStyle = {
        Name: 'DialogueStyleOverride',
        FontSize: 72,
        PrimaryColour: 0xFFFFFF00,
        SecondaryColour: 0xFF000000,
        OutlineColour: 0,
        BackColour: 0,
        Bold: 1,
        Italic: 0,
        Underline: 0,
        StrikeOut: 0,
        ScaleY: 1,
        Angle: 0,
        BorderStyle: 1,
        Outline: 4,
        Shadow: 0,
        Alignment: 2,
        MarginL: 135,
        MarginR: 135,
        MarginV: 50,
        Encoding: 1,
        treat_fontname_as_pattern: 0,
        Blur: 0,
        Justify: 0,
        ...STYLE_OVERRIDES[subtitleStyle]
      }
      this.renderer?.styleOverride(overrideStyle)
    } else {
      this.renderer?.disableStyleOverride()
    }
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
    let Text = subtitle.text ?? ''
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
      Name: subtitle.name ?? '',
      MarginL: Number(subtitle.marginL) || 0,
      MarginR: Number(subtitle.marginR) || 0,
      MarginV: Number(subtitle.marginV) || 0,
      Effect: subtitle.effect ?? '',
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
    if (LANGUAGE_OVERRIDES[track.meta.language ?? '']) {
      const { name, url } = LANGUAGE_OVERRIDES[track.meta.language ?? '']!
      this.addFont(url)
      this.renderer.setDefaultFont(name)
    }
    this.renderer.resize()
  }

  destroy () {
    this.renderer?.destroy()
    this.ctrl.abort()
    for (const { events } of Object.values(this._tracks.value)) {
      events.clear()
    }
  }

  static convertSubText (text: string, type: string) {
    const srtRx = /(?:\d+\r?\n)?(\S{9,12})\s?-->\s?(\S{9,12})(.*)\r?\n([\s\S]*)$/i
    const srt = (text: string) => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      for (const split of replaced.split(/\r?\n\r?\n/)) {
        const match: string[] | null = split.match(srtRx)
        if (match?.length !== 5) continue
        // timestamps
        match[1] = match[1]!.match(/.*[.,]\d{2}/)![0]
        match[2] = match[2]!.match(/.*[.,]\d{2}/)![0]
        if (match[1]?.length === 9) {
          match[1] = '0:' + match[1]
        } else {
          if (match[1]?.[0] === '0') {
            match[1] = match[1].substring(1)
          }
        }
        match[1]?.replace(',', '.')
        if (match[2]?.length === 9) {
          match[2] = '0:' + match[2]
        } else {
          if (match[2]?.[0] === '0') {
            match[2] = match[2].substring(1)
          }
        }
        match[2]?.replace(',', '.')
        // create array of all tags
        const matches = match[4]?.match(/<[^>]+>/g)
        if (matches) {
          matches.forEach(matched => {
            if (matched.includes('</')) { // check if its a closing tag
              match[4] = match[4]!.replace(matched, matched.replace('</', '{\\').replace('>', '0}'))
            } else {
              match[4] = match[4]!.replace(matched, matched.replace('<', '{\\').replace('>', '1}'))
            }
          })
        }
        subtitles.push('Dialogue: 0,' + match[1].replace(',', '.') + ',' + match[2].replace(',', '.') + ',Default,,0,0,0,,' + match[4]!.replace(/\r?\n/g, '\\N'))
      }
      return subtitles
    }
    const subRx = /[{[](\d+)[}\]][{[](\d+)[}\]](.+)/i
    const sub = (text: string) => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      let frames = 1000 / Number(replaced.match(subRx)?.[3])
      if (!frames || isNaN(frames)) frames = 41.708
      for (const split of replaced.split('\r?\n')) {
        const match = split.match(subRx)
        if (match) subtitles.push('Dialogue: 0,' + toTS((Number(match[1]) * frames) / 1000, 1) + ',' + toTS((Number(match[2]) * frames) / 1000, 1) + ',Default,,0,0,0,,' + match[3]?.replace('|', '\\N'))
      }
      return subtitles
    }
    if (type === 'ass') {
      return { type: 'ass', header: text }
    } else if (type === 'srt' || type === 'vtt') {
      return { type: 'srt', header: defaultHeader + srt(text).join('\n') }
    } else if (type === 'sub') {
      return { type: 'sub', header: defaultHeader + sub(text).join('\n') }
    } else {
      // subbers have a tendency to not set the extensions at all
      if (text.startsWith('[Script Info]')) return { type: 'ass', header: text }
      if (srtRx.test(text)) return { type: 'srt', header: defaultHeader + srt(text).join('\n') }
      if (subRx.test(text)) return { type: 'sub', header: defaultHeader + sub(text).join('\n') }
    }
  }
}
