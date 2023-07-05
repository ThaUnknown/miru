// currently unused

import { EbmlIteratorDecoder, EbmlTagId } from 'ebml-iterator'
import { EventEmitter } from 'events'
import { inflate } from 'pako'

const SSA_TYPES = new Set(['ssa', 'ass'])
const SSA_KEYS = ['readOrder', 'layer', 'style', 'name', 'marginL', 'marginR', 'marginV', 'effect', 'text']

function getChild (chunk, tag) {
  return chunk?.Children.find(({ id }) => id === tag)
}
function getData (chunk, tag) {
  return getChild(chunk, tag)?.data
}

export class SubtitleParserBase extends EventEmitter {
  constructor () {
    super()
    this.subtitleTracks = new Map()
    this.timecodeScale = 1

    this._currentClusterTimecode = null

    this.destroyed = false

    this._tagMap = {
      // Segment Information
      [EbmlTagId.TimecodeScale]: ({ data }) => {
        this.timecodeScale = data / 1000000
      },
      // Assumption: This is a Cluster `Timecode`
      [EbmlTagId.Timecode]: ({ data }) => {
        this._currentClusterTimecode = data
      },
      // Parse attached files, mainly to allow extracting subtitle font files.
      [EbmlTagId.AttachedFile]: chunk => {
        this.emit('file', {
          filename: getData(chunk, EbmlTagId.FileName),
          mimetype: getData(chunk, EbmlTagId.FileMimeType),
          data: getData(chunk, EbmlTagId.FileData)
        })
      },
      // Duration for chapters which don't specify an end position
      [EbmlTagId.Duration]: ({ data }) => {
        if (this.chapters) {
          this.chapters[this.chapters.length - 1].end = data
          this.emit('chapters', this.chapters)
        } else {
          this.duration = data
        }
      },
      [EbmlTagId.Tracks]: this.handleTracks.bind(this),
      [EbmlTagId.BlockGroup]: this.handleBlockGroup.bind(this),
      [EbmlTagId.Chapters]: this.handleChapters.bind(this)
    }
    this.decoder = new EbmlIteratorDecoder({
      bufferTagIds: [
        EbmlTagId.TimecodeScale,
        EbmlTagId.Tracks,
        EbmlTagId.BlockGroup,
        EbmlTagId.AttachedFile,
        EbmlTagId.Chapters,
        EbmlTagId.Duration
      ]
    })
  }

  decoderWrite (chunk) {
    const tags = this.decoder.parseTags(chunk)
    for (const tag of tags) {
      this._tagMap[tag.id]?.(tag)
      if (tag.id === EbmlTagId.Tracks) {
        if (!tag.Children.some(({ id }) => id === EbmlTagId.TrackEntry)) return this.destroy()
      }
    }
  }

  handleTracks (chunk) {
    for (const entry of chunk.Children.filter(c => c.id === EbmlTagId.TrackEntry)) {
      // Skip non subtitle tracks
      if (getData(entry, EbmlTagId.TrackType) !== 0x11) continue

      const codecID = getData(entry, EbmlTagId.CodecID) || ''
      if (codecID.startsWith('S_TEXT')) {
        const track = {
          number: getData(entry, EbmlTagId.TrackNumber),
          language: getData(entry, EbmlTagId.Language),
          type: codecID.substring(7).toLowerCase()
        }

        const name = getData(entry, EbmlTagId.Name)
        if (name) track.name = name

        const header = getData(entry, EbmlTagId.CodecPrivate)
        if (header) track.header = header.toString()

        // TODO: Assume zlib deflate compression
        const compressed = entry.Children.find(c =>
          c.id === EbmlTagId.ContentEncodings &&
          c.Children.find(cc =>
            cc.id === EbmlTagId.ContentEncoding &&
            getChild(cc, EbmlTagId.ContentCompression)
          )
        )

        if (compressed) track._compressed = true

        this.subtitleTracks.set(track.number, track)
      }
    }

    this.emit('tracks', [...this.subtitleTracks.values()])
  }

  handleBlockGroup (chunk) {
    const block = getChild(chunk, EbmlTagId.Block)

    if (block && this.subtitleTracks.has(block.track)) {
      const blockDuration = getData(chunk, EbmlTagId.BlockDuration)
      const track = this.subtitleTracks.get(block.track)

      const payload = track._compressed
        ? inflate(Buffer.from(block.payload), { to: 'string' })
        : block.payload

      const subtitle = {
        text: payload.toString('utf8'),
        time: (block.value + this._currentClusterTimecode) * this.timecodeScale,
        duration: blockDuration * this.timecodeScale
      }

      if (SSA_TYPES.has(track.type)) {
        // extract SSA/ASS keys
        const values = subtitle.text.split(',')

        // ignore read-order, and skip layer if ssa
        for (let i = track.type === 'ssa' ? 2 : 1; i < 8; i++) {
          subtitle[SSA_KEYS[i]] = values[i]
        }

        subtitle.text = values.slice(8).join(',')
      }

      this.emit('subtitle', subtitle, block.track)
    }
  }

  handleChapters ({ Children }) {
    const editions = Children.filter(c => c.id === EbmlTagId.EditionEntry)
    // https://www.matroska.org/technical/chapters.html#default-edition
    // finds first default edition, or first entry
    const defaultEdition = editions.find(c => {
      return c.Children.some(cc => {
        return cc.id === EbmlTagId.EditionFlagDefault && Boolean(cc.data)
      })
    }) || editions[0]

    // exclude hidden atoms
    const atoms = defaultEdition.Children.filter(c => c.id === EbmlTagId.ChapterAtom && !getData(c, EbmlTagId.ChapterFlagHidden))
    const chapters = []
    for (let i = atoms.length - 1; i >= 0; --i) {
      const start = getData(atoms[i], EbmlTagId.ChapterTimeStart) / this.timecodeScale / 1000000
      const end = (getData(atoms[i], EbmlTagId.ChapterTimeEnd) / this.timecodeScale / 1000000)
      const disp = getChild(atoms[i], EbmlTagId.ChapterDisplay)

      chapters[i] = {
        start,
        end,
        text: getData(disp, EbmlTagId.ChapString),
        language: getData(disp, EbmlTagId.ChapLanguage)
      }
    }

    chapters.sort((a, b) => a.start - b.start)
    for (let i = chapters.length - 1; i >= 0; --i) {
      chapters[i].end ||= chapters[i + 1]?.start || this.duration
    }

    if (this.duration) {
      this.emit('chapters', chapters)
    } else {
      this.chapters = chapters
    }
  }

  destroy () {
    this.destroyed = true
    this.emit('finish')
  }
}

export class SubtitleParser extends SubtitleParserBase {
  constructor (stream) {
    super()

    ;(async () => {
      const iterator = stream[Symbol.asyncIterator]()
      try {
        // eslint-disable-next-line no-unused-vars
        for await (const chunk of iterator) {
          if (this.destroyed) return iterator.return()
          this.decoderWrite(chunk)
        }
      } catch (e) {
        iterator.return()
      }
      this.emit('finish')
    })()
  }
}

export class SubtitleStream extends SubtitleParserBase {
  constructor (prevInstance, stream) {
    super()

    this._stream = stream

    if (prevInstance instanceof SubtitleParserBase) {
      // copy previous metadata
      this.subtitleTracks = prevInstance.subtitleTracks
      this.timecodeScale = prevInstance.timecodeScale

      // may not be at ebml tag offset
      this.unstable = true
    }
  }

  destroy () {
    this.destroyed = true
    this.emit('finish')
    this._stream.return()
  }

  async * [Symbol.asyncIterator] () {
    try {
      for await (const chunk of this._stream) {
        if (this.destroyed) return this._stream.return()
        if (this.unstable) {
          // the ebml decoder expects to see a tag, so we won't use it until we find a cluster
          for (let i = 0; i < chunk.length - 12; i++) {
            // cluster id 0x1F43B675
            // https://matroska.org/technical/elements.html#LevelCluster
            if (chunk[i] === 0x1f && chunk[i + 1] === 0x43 && chunk[i + 2] === 0xb6 && chunk[i + 3] === 0x75) {
              // length of cluster size tag
              const len = 8 - Math.floor(Math.log2(chunk[i + 4]))
              // first tag in cluster is a valid EbmlTag
              if (EbmlTagId[chunk[i + 4 + len]]) {
                // okay this is probably a cluster
                this.unstable = false
                this.decoderWrite(chunk.slice(i))
              }
            }
          }
        } else {
          this.decoderWrite(chunk)
        }
        yield chunk
      }
    } finally {
      this._stream.return()
    }
    this._stream.return()
  }
}
