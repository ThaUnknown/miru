const { SubtitleStream } = MatroskaSubtitles
const { SubtitleParser } = MatroskaSubtitles

function subStream (stream) { // subtitle parsing with seeking support
  if (playerData.subtitleStream) {
    playerData.subtitleStream = new SubtitleStream(playerData.subtitleStream)
  } else {
    playerData.subtitleStream = new SubtitleStream()
    playerData.subtitleStream.once('tracks', pTracks => {
      bcap.removeAttribute('disabled')
      playerData.headers = []
      pTracks.forEach(track => {
        if (track.type !== 'ass') { // overwrite webvtt header with custom one
          track.header = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${Object.values(subtitle1list.options).filter(item => item.value === settings.subtitle1)[0].innerText}
[Events]

`
        }
        playerData.headers[track.number] = track
        playerData.subtitles[track.number] = new Set()
        if (!playerData.selectedHeader) playerData.selectedHeader = track.number
      })
    })
  }
  playerData.subtitleStream.on('subtitle', (subtitle, trackNumber) => {
    if (playerData.headers && !playerData.parsed) {
      if (playerData.headers[trackNumber].type === 'webvtt') convertSub(subtitle)
      const formatSub = 'Dialogue: ' + (subtitle.layer || 0) + ',' + new Date(subtitle.time).toISOString().slice(12, -1).slice(0, -1) + ',' + new Date(subtitle.time + subtitle.duration).toISOString().slice(12, -1).slice(0, -1) + ',' + (subtitle.style || 'Default') + ',' + (subtitle.name || '') + ',' + (subtitle.marginL || '0') + ',' + (subtitle.marginR || '0') + ',' + (subtitle.marginV || '0') + ',' + (subtitle.effect || '') + ',' + subtitle.text
      playerData.subtitles[trackNumber].add(formatSub)
      if (playerData.selectedHeader === trackNumber) renderSubs(trackNumber)
    }
  })
  playerData.subtitleStream.on('file', file => {
    if (file.mimetype === 'application/x-truetype-font' || file.mimetype === 'application/font-woff') playerData.fonts.push(window.URL.createObjectURL(new Blob([file.data], { type: file.mimetype })))
  })
  stream.pipe(playerData.subtitleStream)
}
let octopusTimeout
async function renderSubs (trackNumber) {
  if (!playerData.octopusInstance) {
    const options = {
      video: video,
      targetFps: await playerData.fps,
      subContent: trackNumber ? playerData.headers[trackNumber].header.slice(0, -1) + Array.from(playerData.subtitles[trackNumber]).join('\n') : playerData.headers[3].header.slice(0, -1),
      renderMode: 'offscreenCanvas',
      fonts: playerData.fonts?.length !== 0 ? playerData.fonts : ['https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2'],
      workerUrl: 'js/subtitles-octopus-worker.js',
      timeOffset: 0,
      onReady: function () {
        if (!video.paused) {
          video.pause()
          playVideo()
        }
      }
    }
    if (!playerData.octopusInstance) playerData.octopusInstance = new SubtitlesOctopus(options)
  } else {
    if (!octopusTimeout) {
      octopusTimeout = setTimeout(() => {
        octopusTimeout = undefined
        if (playerData.octopusInstance) playerData.octopusInstance.setTrack(trackNumber ? playerData.headers[trackNumber].header.slice(0, -1) + Array.from(playerData.subtitles[trackNumber]).join('\n') : playerData.headers[3].header.slice(0, -1))
      }, 1000)
    }
  }
}
function convertSub (subtitle) { // converts vtt subtitles to ssa ones
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
  subtitle.text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\\h')
}
function postDownload (file) { // parse subtitles fully after a download is finished
  return new Promise((resolve, reject) => {
    if (file.name.endsWith('.mkv') || file.name.endsWith('.webm')) {
      let parser = new SubtitleParser()
      parser.once('tracks', pTracks => {
        pTracks.forEach(track => {
          if (track.type !== 'ass') { // overwrite webvtt header with custom one
            track.header = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${Object.values(subtitle1list.options).filter(item => item.value === settings.subtitle1)[0].innerText}
[Events]

`
          }
          playerData.headers[track.number] = track
          if (!playerData.subtitles[track.number]) playerData.subtitles[track.number] = new Set()
          if (!playerData.selectedHeader) playerData.selectedHeader = track.number
        })
      })
      parser.on('subtitle', (subtitle, trackNumber) => {
        if (playerData.headers[trackNumber].type === 'webvtt') convertSub(subtitle)
        playerData.subtitles[trackNumber].add('Dialogue: ' + (subtitle.layer || 0) + ',' + new Date(subtitle.time).toISOString().slice(12, -1).slice(0, -1) + ',' + new Date(subtitle.time + subtitle.duration).toISOString().slice(12, -1).slice(0, -1) + ',' + (subtitle.style || 'Default') + ',' + (subtitle.name || '') + ',' + (subtitle.marginL || '0') + ',' + (subtitle.marginR || '0') + ',' + (subtitle.marginV || '0') + ',' + (subtitle.effect || '') + ',' + subtitle.text)
      })
      parser.on('finish', () => {
        console.log('Sub parsing finished')
        playerData.parsed = 1
        playerData.subtitleStream = undefined
        renderSubs(playerData.selectedHeader)
        parser = undefined
        bcap.removeAttribute('disabled')
        if (!video.paused) {
          video.pause()
          playVideo()
        }
        resolve()
      })
      console.log('Sub parsing started')
      playerData.subtitlePraseStream = file.createReadStream().pipe(parser)
      // when this gets overwritten the parser stays so it might "leak" some RAM???
    }
  })
}
