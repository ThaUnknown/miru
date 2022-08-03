<script>
import { set } from '../Settings.svelte'
import { playAnime } from '../RSSView.svelte'
import { client } from '@/modules/torrent.js'
import { onMount, createEventDispatcher } from 'svelte'
import { alEntry } from '@/modules/anilist.js'
// import Peer from '@/modules/Peer.js'
import Subtitles from '@/modules/subtitles.js'
import { toTS, videoRx, fastPrettyBytes } from '@/modules/util.js'
import { addToast } from '../Toasts.svelte'

import { w2gEmitter } from '../WatchTogether/WatchTogether.svelte'
import Keybinds, { loadWithDefaults, condition } from 'svelte-keybinds'

const emit = createEventDispatcher()

w2gEmitter.on('playerupdate', ({ detail }) => {
  currentTime = detail.time
  paused = detail.paused
})

w2gEmitter.on('setindex', ({ detail }) => {
  playFile(detail)
})

export function playFile (file) {
  if (typeof value === 'number') {
    handleCurrent(videos?.[file])
  } else if (videos.includes(file)) {
    handleCurrent(file)
  }
}

function updatew2g () {
  w2gEmitter.emit('player', { time: Math.floor(currentTime), paused })
}

export let miniplayer = false
// eslint-disable-next-line prefer-const
$condition = () => !miniplayer
export let page
export let files = []
$: updateFiles(files)
let src = null
let video = null
let container = null
let current = null
let subs = null
let duration = 0.1
let paused = true
let muted = false
let wasPaused = true
let thumbnail = ' '
let videos = []
let immersed = false
let buffering = false
let immerseTimeout = null
let bufferTimeout = null
let subHeaders = null
let pip = false
const presentationRequest = null
const presentationConnection = null
const canCast = false
let isFullscreen = false
let ended = false
let volume = localStorage.getItem('volume') || 1
let playbackRate = 1
$: localStorage.setItem('volume', volume || 0)

function checkAudio () {
  if ('audioTracks' in HTMLVideoElement.prototype && !video.audioTracks.length) {
    addToast({
      text: "This torrent's audio codec is not supported, try a different release by disabling Autoplay Torrents in RSS settings.",
      title: 'Audio Codec Unsupported',
      type: 'danger'
    })
  }
}
function getFPS () {
  video.fps = new Promise(resolve => {
    let lastmeta = null
    let count = 0

    function handleFrames (now, metadata) {
      if (count) {
        // resolve on 2nd frame, 1st frame might be a cut-off
        if (lastmeta) {
          const msbf = (metadata.mediaTime - lastmeta.mediaTime) / (metadata.presentedFrames - lastmeta.presentedFrames)
          const rawFPS = (1 / msbf).toFixed(3)
          // this is accurate for mp4, mkv is a few ms off
          if (current.name.endsWith('.mkv')) {
            if (rawFPS < 25 && rawFPS > 22) {
              resolve(23.976)
            } else if (rawFPS < 31 && rawFPS > 28) {
              resolve(29.97)
            } else if (rawFPS < 62 && rawFPS > 58) {
              resolve(59.94)
            } else {
              resolve(rawFPS) // smth went VERY wrong
            }
          } else {
            resolve(rawFPS)
          }
        } else {
          lastmeta = metadata
          video.requestVideoFrameCallback(handleFrames)
        }
      } else {
        count++
        video.requestVideoFrameCallback(handleFrames)
      }
    }
    video.requestVideoFrameCallback(handleFrames)
    playFrame()
  })
}

// plays one frame
function playFrame () {
  let wasPaused = false
  video.requestVideoFrameCallback(() => {
    if (wasPaused) paused = true
  })
  if (paused) {
    wasPaused = true
    paused = false
  }
}

// if ('PresentationRequest' in window) {
  //   const handleAvailability = aval => {
  //     canCast = !!aval
  //   }
  //   presentationRequest = new PresentationRequest(['build/cast.html'])
  //   presentationRequest.addEventListener('connectionavailable', e => initCast(e))
  //   navigator.presentation.defaultRequest = presentationRequest
  //   presentationRequest.getAvailability().then(aval => {
  //     aval.onchange = e => handleAvailability(e.target.value)
  //     handleAvailability(aval.value)
  //   })
  // }

  // document.fullscreenElement isn't reactive
document.addEventListener('fullscreenchange', () => {
  isFullscreen = !!document.fullscreenElement
})

function handleHeaders () {
  subHeaders = subs?.headers
}

function updateFiles (files) {
  if (files?.length) {
    videos = files.filter(file => videoRx.test(file.name))
    if (videos?.length) {
      handleCurrent(videos[0])
      if (subs) {
        subs.files = files || []
        subs.findSubtitleFiles(current)
      }
    }
  } else {
    src = ''
    video?.load()
    currentTime = 0
    targetTime = 0
  }
}

async function handleCurrent (file) {
  if (file) {
    if (thumbnailData.video?.src) URL.revokeObjectURL(video?.src)
    Object.assign(thumbnailData, {
      thumbnails: [],
      interval: undefined,
      video: undefined
    })
    currentTime = 0
    targetTime = 0
    completed = false
    current = file
    emit('current', current)
    initSubs()
    src = file.url
    client.send('current', file)
    video?.load()
    clearCanvas()
  }
}

export let media

$: checkAvail(media)
let hasNext = false
let hasLast = false
function checkAvail () {
  console.log(media)
  if ((media?.media?.nextAiringEpisode?.episode - 1 || media?.media?.episodes) > media?.episode) {
    hasNext = true
  } else if (videos.indexOf(current) !== videos.length - 1) {
    hasNext = true
  } else {
    hasNext = false
  }
  if (media?.episode > 1) {
    hasLast = true
  } else if (videos.indexOf(current) > 0) {
    hasLast = true
  } else {
    hasLast = false
  }
}

function initSubs () {
  if (subs) subs.destroy()
  subs = new Subtitles(video, files, current, handleHeaders)
}
function cycleSubtitles () {
  if (current && subs?.headers) {
    const tracks = subs.headers.filter(header => header)
    const index = tracks.indexOf(subs.headers[subs.current]) + 1
    subs.selectCaptions(index >= tracks.length ? -1 : subs.headers.indexOf(tracks[index]))
  }
}

let subDelay = 0
$: updateDelay(subDelay)
function updateDelay (delay) {
  if (subs?.renderer) subs.renderer.timeOffset = delay
}

let currentTime = 0
$: progress = currentTime / duration
$: targetTime = (!paused && currentTime) || targetTime
function handleMouseDown ({ target }) {
  wasPaused = paused
  paused = true
  targetTime = target.value * duration
}
function handleMouseUp () {
  paused = wasPaused
  currentTime = targetTime
}
function handleProgress ({ target }) {
  targetTime = target.value * duration
}

function autoPlay () {
  if (!miniplayer) video.play()
}
function playPause () {
  paused = !paused
}
function toggleMute () {
  muted = !muted
}
let visibilityPaused = true
document.addEventListener('visibilitychange', () => {
  if (!video?.ended && set.playerPause && !pip) {
    if (document.visibilityState === 'hidden') {
      visibilityPaused = paused
      paused = true
    } else {
      if (!visibilityPaused) paused = false
    }
  }
})
function tryPlayNext () {
  if (set.playerAutoplay) playNext()
}
function playNext () {
  if (hasNext) {
    const index = videos.indexOf(current)
    if (index + 2 < videos.length) {
      const target = (index + 1) % videos.length
      handleCurrent(videos[target])
      w2gEmitter.emit('index', { index: target })
    } else if (media?.media?.nextAiringEpisode?.episode - 1 || media?.media?.episodes > media?.episode) {
      playAnime(media.media, media.episode + 1)
    }
  }
}
function playLast () {
  if (hasLast) {
    const index = videos.indexOf(current)
    if (index > 1) {
      handleCurrent(videos[index - 1])
      w2gEmitter.emit('index', { index: index - 1 })
    } else if (media?.episode > 1) {
      playAnime(media.media, media.episode - 1)
    }
  }
}
function toggleFullscreen () {
  document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen()
}
function seek (time) {
  if (time === 85 && currentTime < 10) {
    currentTime = currentTime = 90
  } else if (time === 85 && duration - currentTime < 90) {
    currentTime = currentTime = duration
  } else {
    currentTime = currentTime += time
  }
  targetTime = currentTime
}
function forward () {
  seek(2)
}
function rewind () {
  seek(-2)
}
function selectAudio (id) {
  if (id !== undefined) {
    for (const track of video.audioTracks) {
      track.enabled = track.id === id
    }
    seek(-0.2) // stupid fix because video freezes up when chaging tracks
  }
}
function selectVideo (id) {
  if (id !== undefined) {
    for (const track of video.videoTracks) {
      track.selected = track.id === id
    }
    setTimeout(() => subs?.renderer?.resize(), 200) // stupid fix because video metadata doesnt update for multiple frames
  }
}
function toggleCast () {
  if (video.readyState) {
    if (presentationConnection) {
      presentationConnection?.terminate()
    } else {
      presentationRequest.start()
    }
  }
}
async function screenshot () {
  if ('clipboard' in navigator) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    if (subs?.renderer) {
      subs.renderer.resize(video.videoWidth, video.videoHeight)
      await new Promise(resolve => setTimeout(resolve, 1000)) // this is hacky, but TLDR wait for canvas to update and re-render, in practice this will take at MOST 100ms, but just to be safe
      context.drawImage(subs.renderer._canvas, 0, 0, canvas.width, canvas.height)
      subs.renderer.resize(0, 0, 0, 0) // undo resize
    }
    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    canvas.remove()
    addToast({
      text: 'Saved screenshot to clipboard.',
      title: 'Screenshot',
      type: 'success'
    })
  }
}
function togglePopout () {
  if (video.readyState) {
    if (!subs?.renderer) {
      if (video !== document.pictureInPictureElement) {
        video.requestPictureInPicture()
        pip = true
      } else {
        document.exitPictureInPicture()
        pip = false
      }
    } else {
      if (document.pictureInPictureElement && !document.pictureInPictureElement.id) {
        // only exit if pip is the custom one, else overwrite existing pip with custom
        document.exitPictureInPicture()
        pip = false
      } else {
        const canvasVideo = document.createElement('video')
        const { stream, destroy } = getBurnIn()
        const cleanup = () => {
          pip = false
          destroy()
          canvasVideo.remove()
        }
        pip = true
        canvasVideo.srcObject = stream
        canvasVideo.onloadedmetadata = () => {
          canvasVideo.play()
          if (pip) {
            canvasVideo.requestPictureInPicture().catch(e => {
              cleanup()
              console.warn('Failed To Burn In Subtitles ' + e)
            })
          } else {
            cleanup()
          }
        }
        canvasVideo.onleavepictureinpicture = cleanup
      }
    }
  }
}
let showKeybinds = false
loadWithDefaults({
  KeyX: {
    fn: () => screenshot(),
    id: 'screenshot_monitor',
    type: 'icon'
  },
  KeyR: {
    fn: () => seek(-90),
    id: '-90'
  },
  Comma: {
    fn: async () => seek(-1 / (await video.fps) || 0),
    id: 'fast_rewind',
    type: 'icon'
  },
  Period: {
    fn: async () => seek(1 / (await video.fps) || 0),
    id: 'fast_forward',
    type: 'icon'
  },
  KeyI: {
    fn: () => toggleStats(),
    id: 'list',
    type: 'icon'
  },
  Backquote: {
    fn: () => (showKeybinds = !showKeybinds),
    id: 'help_outline',
    type: 'icon'
  },
  Space: {
    fn: () => playPause(),
    id: 'play_arrow',
    type: 'icon'
  },
  KeyN: {
    fn: () => playNext(),
    id: 'skip_next',
    type: 'icon'
  },
  KeyB: {
    fn: () => playLast(),
    id: 'skip_previous',
    type: 'icon'
  },
  KeyM: {
    fn: () => (muted = !muted),
    id: 'volume_off',
    type: 'icon'
  },
  KeyP: {
    fn: () => togglePopout(),
    id: 'picture_in_picture',
    type: 'icon'
  },
  KeyF: {
    fn: () => toggleFullscreen(),
    id: 'fullscreen',
    type: 'icon'
  },
  KeyS: {
    fn: () => seek(85),
    id: '+90'
  },
  KeyD: {
    fn: () => toggleCast(),
    id: 'cast',
    type: 'icon'
  },
  KeyC: {
    fn: () => cycleSubtitles(),
    id: 'subtitles',
    type: 'icon'
  },
  ArrowLeft: {
    fn: () => rewind(),
    id: '-2'
  },
  ArrowRight: {
    fn: () => forward(),
    id: '+2'
  },
  ArrowUp: {
    fn: () => (volume = Math.min(1, volume + 0.05)),
    id: 'volume_up',
    type: 'icon'
  },
  ArrowDown: {
    fn: () => (volume = Math.max(0, volume - 0.05)),
    id: 'volume_down',
    type: 'icon'
  },
  BracketLeft: {
    fn: () => (playbackRate -= 0.1),
    id: 'history',
    type: 'icon'
  },
  BracketRight: {
    fn: () => (playbackRate += 0.1),
    id: 'update',
    type: 'icon'
  },
  Backslash: {
    fn: () => (playbackRate = 1),
    id: 'schedule',
    type: 'icon'
  }
})

function getBurnIn (noSubs) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  let loop = null
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  if (!noSubs) subs.renderer.resize(video.videoWidth, video.videoHeight)
  const renderFrame = () => {
    context.drawImage(video, 0, 0)
    if (!noSubs) context.drawImage(subs.renderer?._canvas, 0, 0, canvas.width, canvas.height)
    loop = video.requestVideoFrameCallback(renderFrame)
  }
  renderFrame()
  const destroy = () => {
    if (!noSubs) subs.renderer.resize()
    video.cancelVideoFrameCallback(loop)
    canvas.remove()
  }

  return { stream: canvas.captureStream(), destroy }
}

// function initCast (event) {
  //   // these quality settings are likely to make cast overheat, oh noes!
  //   let peer = new Peer({
  //     polite: true,
  //     quality: {
  //       audio: {
  //         stereo: 1,
  //         'sprop-stereo': 1,
  //         maxaveragebitrate: 510000,
  //         maxplaybackrate: 510000,
  //         cbr: 0,
  //         useinbandfec: 1,
  //         usedtx: 1,
  //         maxptime: 20,
  //         minptime: 10
  //       },
  //       video: {
  //         bitrate: 2000000,
  //         codecs: ['VP9', 'VP8', 'H264']
  //       }
  //     }
  //   })

  //   presentationConnection = event.connection
  //   presentationConnection.addEventListener('terminate', () => {
  //     presentationConnection = null
  //     peer = null
  //   })

  //   peer.signalingPort.onmessage = ({ data }) => {
  //     presentationConnection.send(data)
  //   }

  //   presentationConnection.addEventListener('message', ({ data }) => {
  //     peer.signalingPort.postMessage(data)
  //   })

  //   peer.dc.onopen = () => {
  //     if (peer && presentationConnection) {
  //       const tracks = []
  //       const videostream = video.captureStream()
  //       if (true) {
  //         // TODO: check if cast supports codecs
  //         const { stream, destroy } = getBurnIn(!subs?.renderer)
  //         tracks.push(stream.getVideoTracks()[0], videostream.getAudioTracks()[0])
  //         presentationConnection.addEventListener('terminate', destroy)
  //       } else {
  //         tracks.push(videostream.getVideoTracks()[0], videostream.getAudioTracks()[0])
  //       }
  //       for (const track of tracks) {
  //         peer.pc.addTrack(track, videostream)
  //       }
  //       paused = false // video pauses for some reason
  //     }
  //   }
  // }

function immersePlayer () {
  immersed = true
  immerseTimeout = undefined
}

function resetImmerse () {
  if (immerseTimeout) {
    clearTimeout(immerseTimeout)
  } else {
    immersed = false
  }
  immerseTimeout = setTimeout(immersePlayer, 8 * 1000)
}

function hideBuffering () {
  if (bufferTimeout) {
    clearTimeout(bufferTimeout)
    bufferTimeout = null
    buffering = false
  }
}

function showBuffering () {
  bufferTimeout = setTimeout(() => {
    buffering = true
    resetImmerse()
  }, 150)
}
$: navigator.mediaSession?.setPositionState({
  duration: Math.max(0, duration || 0),
  playbackRate: 1,
  position: Math.max(0, Math.min(duration || 0, currentTime || 0))
})

if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', playPause)
  navigator.mediaSession.setActionHandler('pause', playPause)
  navigator.mediaSession.setActionHandler('nexttrack', playNext)
  navigator.mediaSession.setActionHandler('previoustrack', playLast)
  navigator.mediaSession.setActionHandler('seekforward', forward)
  navigator.mediaSession.setActionHandler('seekbackward', rewind)
}
let stats = null
let requestCallback = null
function toggleStats () {
  if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
    if (requestCallback) {
      stats = null
      video.cancelVideoFrameCallback(requestCallback)
      requestCallback = null
    } else {
      requestCallback = video.requestVideoFrameCallback((a, b) => {
        stats = {}
        handleStats(a, b, b)
      })
    }
  }
}
async function handleStats (now, metadata, lastmeta) {
  if (stats) {
    const msbf = (metadata.mediaTime - lastmeta.mediaTime) / (metadata.presentedFrames - lastmeta.presentedFrames)
    const fps = (1 / msbf).toFixed(3)
    stats = {
      fps,
      presented: metadata.presentedFrames,
      dropped: video.getVideoPlaybackQuality()?.droppedVideoFrames,
      processing: metadata.processingDuration + ' ms',
      viewport: video.clientWidth + 'x' + video.clientHeight,
      resolution: videoWidth + 'x' + videoHeight,
      buffer: getBufferHealth(metadata.mediaTime) + ' s',
      speed: video.playbackRate || 1
    }
    setTimeout(() => video.requestVideoFrameCallback((n, m) => handleStats(n, m, metadata)), 200)
  }
}
function getBufferHealth (time) {
  for (let index = video.buffered.length; index--;) {
    if (time < video.buffered.end(index) && time > video.buffered.start(index)) {
      return parseInt(video.buffered.end(index) - time)
    }
  }
  return 0
}
const thumbCanvas = document.createElement('canvas')
thumbCanvas.width = 200
const thumbnailData = {
  thumbnails: [],
  canvas: thumbCanvas,
  context: thumbCanvas.getContext('2d'),
  interval: null,
  video: null
}
let hover = null
let hoverTime = 0
let hoverOffset = 0
function handleHover ({ offsetX, target }) {
  hoverOffset = offsetX / target.clientWidth
  hoverTime = duration * hoverOffset
  hover.style.setProperty('left', hoverOffset * 100 + '%')
  thumbnail = thumbnailData.thumbnails[Math.floor(hoverTime / thumbnailData.interval)] || ' '
}
function createThumbnail (vid = video) {
  if (vid?.readyState >= 2) {
    const index = Math.floor(vid.currentTime / thumbnailData.interval)
    if (!thumbnailData.thumbnails[index]) {
      thumbnailData.context.fillRect(0, 0, 200, thumbnailData.canvas.height)
      thumbnailData.context.drawImage(vid, 0, 0, 200, thumbnailData.canvas.height)
      thumbnailData.thumbnails[index] = thumbnailData.canvas.toDataURL('image/jpeg')
    }
  }
}
let videoWidth, videoHeight
function initThumbnails () {
  const height = 200 / (videoWidth / videoHeight)
  if (!isNaN(height)) {
    thumbnailData.interval = duration / 300 < 5 ? 5 : duration / 300
    thumbnailData.canvas.height = height
  }
}

// function finishThumbnails () {
  //   const t0 = performance.now()
  //   const video = document.createElement('video')
  //   let index = 0
  //   video.preload = 'none'
  //   video.volume = 0
  //   video.playbackRate = 0
  //   video.addEventListener('loadeddata', () => loadTime())
  //   video.addEventListener('canplay', () => {
  //     createThumbnail(thumbnailData.video)
  //     loadTime()
  //   })
  //   thumbnailData.video = video
  //   const loadTime = () => {
  //     while (thumbnailData.thumbnails[index] && index <= Math.floor(thumbnailData.video.duration / thumbnailData.interval)) {
  //       // only create thumbnails that are missing
  //       index++
  //     }
  //     if (thumbnailData.video?.currentTime !== thumbnailData.video?.duration && thumbnailData.video) {
  //       thumbnailData.video.currentTime = index * thumbnailData.interval
  //     } else {
  //       thumbnailData.video?.removeAttribute('src')
  //       thumbnailData.video?.load()
  //       thumbnailData.video?.remove()
  //       delete thumbnailData.video
  //       console.log('Thumbnail creating finished', index, toTS((performance.now() - t0) / 1000))
  //     }
  //     index++
  //   }
  //   thumbnailData.video.src = current.url
  //   thumbnailData.video.load()
  //   console.log('Thumbnail creating started')
  // }

  // const isWindows = navigator.appVersion.includes('Windows')
let innerWidth, innerHeight
const menubarOffset = 0
// $: calcMenubarOffset(innerWidth, innerHeight, videoWidth, videoHeight)
  // function calcMenubarOffset (innerWidth, innerHeight, videoWidth, videoHeight) {
  //   // outerheight resize and innerheight resize is mutual, additionally update on metadata and app state change
  //   if (videoWidth && videoHeight) {
  //     // so windows is very dumb, and calculates windowed mode as if it was window XP, with the old bars, but not when maximised
  //     const isMaximised = screen.availWidth === window.outerWidth && screen.availHeight === window.outerHeight
  //     const menubar = Math.max(0, isWindows && !isMaximised ? window.outerHeight - innerHeight - 8 : window.outerHeight - innerHeight)
  //     // element ratio calc
  //     const videoRatio = videoWidth / videoHeight
  //     const { offsetWidth, offsetHeight } = video
  //     const elementRatio = offsetWidth / offsetHeight
  //     // video is shorter than element && has space for menubar offset
  //     if (!document.fullscreenElement && menubar && elementRatio <= videoRatio && offsetHeight - offsetWidth / videoRatio > menubar) {
  //       menubarOffset = (menubar / 2) * -1
  //     } else {
  //       menubarOffset = 0
  //     }
  //   }
  // }

function toggleDropdown ({ target }) {
  target.classList.toggle('active')
  target.closest('.dropdown').classList.toggle('show')
}

let completed = false
function checkCompletion () {
  if (!completed && duration && video?.readyState && duration - 180 < currentTime) {
    if (media?.media?.episodes || media?.media?.nextAiringEpisode?.episode) {
      if (media.media.episodes || media.media.nextAiringEpisode?.episode > media.episode) {
        completed = true
        alEntry(media)
      }
    }
  }
}
const torrent = {}
client.on('stats', updateStats)
function updateStats ({ detail }) {
  torrent.peers = detail.numPeers || 0
  torrent.up = detail.uploadSpeed || 0
  torrent.down = detail.downloadSpeed || 0
}
let bufferCanvas = null
let ctx = null
onMount(() => {
  ctx = bufferCanvas.getContext('2d')
  clearCanvas()
})
function clearCanvas () {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.fillRect(0, 0, bufferCanvas.width, 1)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
}
let imageData = null
function handlePieces ({ detail }) {
  if (detail.constructor === Array) {
    if (imageData) {
      for (let i = 0; i < detail.length; ++i) {
        imageData.data[i * 4 + 3] = detail[i]
      }
      ctx.putImageData(imageData, 0, 0)
    }
  } else {
    const uint32 = new Uint32Array(detail)
    uint32.fill(872415231) // rgba(255, 255, 255, 0.2) to HEX to DEC
    imageData = new ImageData(new Uint8ClampedArray(uint32.buffer), detail, 1)
    bufferCanvas.width = detail
    clearCanvas()
  }
}
client.on('pieces', handlePieces)

function checkError ({ target }) {
  // video playback failed - show a message saying why
  switch (target.error?.code) {
    case target.error.MEDIA_ERR_ABORTED:
      console.log('You aborted the video playback.')
      break
    case target.error.MEDIA_ERR_NETWORK:
      console.warn('A network error caused the video download to fail part-way.', target.error)
      addToast({
        text: 'A network error caused the video download to fail part-way. Click here to reload the video.',
        title: 'Video Network Error',
        type: 'danger',
        duration: 1000000,
        click: () => target.load()
      })
      break
    case target.error.MEDIA_ERR_DECODE:
      console.warn('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.', target.error)
      addToast({
        text: 'The video playback was aborted due to a corruption problem. Click here to reload the video.',
        title: 'Video Decode Error',
        type: 'danger',
        duration: 1000000,
        click: () => target.load()
      })
      break
    case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      if (target.error.message !== 'MEDIA_ELEMENT_ERROR: Empty src attribute') {
        console.warn('The video could not be loaded, either because the server or network failed or because the format is not supported.', target.error)
        addToast({
          text: 'The video could not be loaded, either because the server or network failed or because the format is not supported. Try a different release by disabling Autoplay Torrents in RSS settings.',
          title: 'Video Codec Unsupported',
          type: 'danger',
          duration: 300000
        })
      }
      break
    default:
      console.warn('An unknown error occurred.')
      break
  }
}
</script>

<svelte:window bind:innerWidth bind:innerHeight />
{#if showKeybinds && !miniplayer}
  <div class='position-absolute bg-tp w-full h-full z-50 font-size-12 p-20 d-flex align-items-center justify-content-center' on:click|self={() => (showKeybinds = false)}>
    <button class='close' type='button' on:click={() => (showKeybinds = false)}><span>×</span></button>
    <Keybinds let:prop={item} autosave={true} clickable={true}>
      <div class:material-icons={item?.type} class='bind'>{item?.id || ''}</div>
    </Keybinds>
  </div>
{/if}
<div
  class='player w-full h-full d-flex flex-column overflow-hidden'
  class:pointer={miniplayer}
  class:miniplayer
  class:pip
  class:immersed
  class:buffering
  bind:this={container}
  on:mousemove={resetImmerse}
  on:touchmove={resetImmerse}
  on:keypress={resetImmerse}
  on:mouseleave={immersePlayer}>
  <!-- eslint-disable-next-line svelte/valid-compile -->
  <video
    crossorigin='anonymous'
    class='position-absolute h-full w-full'
    style={`margin-top: ${menubarOffset}px`}
    autoplay
    preload='auto'
    {src}
    bind:videoHeight
    bind:videoWidth
    bind:this={video}
    bind:volume
    bind:duration
    bind:currentTime
    bind:paused
    bind:ended
    bind:muted
    bind:playbackRate
    on:error={checkError}
    on:pause={updatew2g}
    on:play={updatew2g}
    on:seeked={updatew2g}
    on:timeupdate={() => createThumbnail()}
    on:timeupdate={checkCompletion}
    on:waiting={showBuffering}
    on:loadeddata={hideBuffering}
    on:canplay={hideBuffering}
    on:playing={hideBuffering}
    on:loadedmetadata={hideBuffering}
    on:ended={tryPlayNext}
    on:loadedmetadata={getFPS}
    on:loadedmetadata={initThumbnails}
    on:loadedmetadata={autoPlay}
    on:loadedmetadata={checkAudio}
    on:leavepictureinpicture={() => (pip = false)} />
  {#if stats}
    <div class='position-absolute top-0 bg-tp p-10 m-15 text-monospace rounded z-50'>
      <button class='close' type='button' on:click={toggleStats}><span>×</span></button>
      FPS: {stats.fps}<br />
      Presented frames: {stats.presented}<br />
      Dropped frames: {stats.dropped}<br />
      Frame time: {stats.processing}<br />
      Viewport: {stats.viewport}<br />
      Resolution: {stats.resolution}<br />
      Buffer health: {stats.buffer}<br />
      Playback speed: x{stats.speed?.toFixed(1)}
    </div>
  {/if}
  <div class='top z-40 d-flex justify-content-between'>
    <div />
    <div class='d-flex'>
      <span class='material-icons' data-name='peers'> people </span>
      <span class='stats'>{torrent.peers || 0}</span>
      <span class='material-icons'> arrow_downward </span>
      <span class='stats'>{fastPrettyBytes(torrent.down)}/s</span>
      <span class='material-icons'> arrow_upward </span>
      <span class='stats'>{fastPrettyBytes(torrent.up)}/s</span>
    </div>
    <span class='material-icons ctrl' title='Keybinds [`]' on:click={() => (showKeybinds = true)}> help_outline </span>
  </div>
  <div class='middle d-flex align-items-center justify-content-center flex-grow-1 position-relative'>
    <div class='position-absolute w-full h-full' on:dblclick={toggleFullscreen} on:click|self={() => (page = 'player')}>
      <div class='play-overlay w-full h-full' on:click={playPause} />
    </div>
    <span class='material-icons ctrl' class:text-muted={!hasLast} class:disabled={!hasLast} data-name='playLast' on:click={playLast}> skip_previous </span>
    <span class='material-icons ctrl' data-name='rewind' on:click={rewind}> fast_rewind </span>
    <span class='material-icons ctrl' data-name='playPause' on:click={playPause}> {ended ? 'replay' : paused ? 'play_arrow' : 'pause'} </span>
    <span class='material-icons ctrl' data-name='forward' on:click={forward}> fast_forward </span>
    <span class='material-icons ctrl' class:text-muted={!hasNext} class:disabled={!hasNext} data-name='playNext' on:click={playNext}> skip_next </span>
    <div data-name='bufferingDisplay' class='position-absolute' />
  </div>
  <div class='bottom d-flex z-40 flex-column px-20'>
    <div class='w-full d-flex align-items-center h-20 mb--5'>
      <div class='w-full h-full position-relative d-flex align-items-center'>
        <canvas class='position-absolute buffer w-full' height='1px' bind:this={bufferCanvas} />
        <input
          class='ctrl w-full h-full prog'
          type='range'
          min='0'
          max='1'
          step='any'
          data-name='setProgress'
          bind:value={progress}
          on:mousedown={handleMouseDown}
          on:mouseup={handleMouseUp}
          on:mousemove={handleHover}
          on:input={handleProgress}
          on:touchstart={handleMouseDown}
          on:touchend={handleMouseUp}
          on:keydown|preventDefault
          style='--value: {progress * 100}%' />
        <div class='hover position-absolute d-flex flex-column align-items-center' bind:this={hover}>
          <img alt='thumbnail' class='w-full mb-5 shadow-lg' src={thumbnail} />
          <div class='ts'>{toTS(hoverTime)}</div>
        </div>
      </div>
    </div>
    <div class='d-flex'>
      <span class='material-icons ctrl' title='Play/Pause [Space]' data-name='playPause' on:click={playPause}> {ended ? 'replay' : paused ? 'play_arrow' : 'pause'} </span>
      {#if hasLast}
        <span class='material-icons ctrl' title='Last [B]' data-name='playLast' on:click={playLast}> skip_previous </span>
      {/if}
      {#if hasNext}
        <span class='material-icons ctrl' title='Next [N]' data-name='playNext' on:click={playNext}> skip_next </span>
      {/if}
      <div class='d-flex w-auto volume'>
        <span class='material-icons ctrl' title='Mute [M]' data-name='toggleMute' on:click={toggleMute}> {muted ? 'volume_off' : 'volume_up'} </span>
        <input class='ctrl' type='range' min='0' max='1' step='any' data-name='setVolume' bind:value={volume} style='--value: {volume * 100}%' />
      </div>
      <div class='ts mr-auto'>{toTS(targetTime, duration > 3600 ? 2 : 3)} / {toTS(duration - targetTime, duration > 3600 ? 2 : 3)}</div>
      {#if 'audioTracks' in HTMLVideoElement.prototype && video?.audioTracks?.length > 1}
        <div class='dropdown dropup with-arrow' on:click={toggleDropdown}>
          <span class='material-icons ctrl' title='Audio Tracks' id='baudio' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' data-name='audioButton'>
            queue_music
          </span>
          <div class='dropdown-menu dropdown-menu-left ctrl custom-radio p-10 pb-5 text-capitalize' aria-labelledby='baudio' data-name='selectAudio'>
            {#each video.audioTracks as track}
              <input name='audio-radio-set' type='radio' id='audio-{track.id}-radio' value={track.id} checked={track.enabled} />
              <label for='audio-{track.id}-radio' on:click={() => selectAudio(track.id)} class='text-truncate pb-5'>
                {(track.language || (!Object.values(video.audioTracks).some(track => track.language === 'eng' || track.language === 'en') ? 'eng' : track.label)) +
                  (track.label ? ' - ' + track.label : '')}</label>
            {/each}
          </div>
        </div>
      {/if}
      {#if 'videoTracks' in HTMLVideoElement.prototype && video?.videoTracks?.length > 1}
        <div class='dropdown dropup with-arrow'>
          <span class='material-icons ctrl' title='Video Tracks' id='bvideo' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' data-name='videoButton'>
            playlist_play
          </span>
          <div class='dropdown-menu dropdown-menu-left ctrl custom-radio p-10 pb-5 text-capitalize' aria-labelledby='bvideo' data-name='selectVideo'>
            {#each video.videoTracks as track}
              <input name='video-radio-set' type='radio' id='video-{track.id}-radio' value={track.id} checked={track.selected} />
              <label for='video-{track.id}-radio' on:click={() => selectVideo(track.id)} class='text-truncate pb-5'>
                {(track.language || (!Object.values(video.videoTracks).some(track => track.language === 'eng' || track.language === 'en') ? 'eng' : track.label)) +
                  (track.label ? ' - ' + track.label : '')}</label>
            {/each}
          </div>
        </div>
      {/if}
      {#if subHeaders?.length}
        <div class='subtitles dropdown dropup with-arrow' on:click={toggleDropdown}>
          <span class='material-icons ctrl' title='Subtitles [C]' id='bcap' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' data-name='captionsButton'>
            subtitles
          </span>
          <div class='dropdown-menu dropdown-menu-right ctrl custom-radio p-10 pb-5 text-capitalize w-200' aria-labelledby='bcap' data-name='selectCaptions'>
            <input name='subtitle-radio-set' type='radio' id='subtitle-off-radio' value='off' checked={subHeaders && subs?.current === -1} />
            <label for='subtitle-off-radio' on:click={() => subs.selectCaptions(-1)} class='text-truncate pb-5'> OFF </label>
            {#each subHeaders as track}
              {#if track}
                <input name='subtitle-radio-set' type='radio' id='subtitle-{track.number}-radio' value={track.numer} checked={track.number === subs.current} />
                <label for='subtitle-{track.nubmer}-radio' on:click={() => subs.selectCaptions(track.number)} class='text-truncate pb-5'>
                  {(track.language || (!Object.values(subs.headers).some(header => header.language === 'eng' || header.language === 'en') ? 'eng' : track.type)) +
                    (track.name ? ' - ' + track.name : '')}
                </label>
              {/if}
            {/each}
            <input type='number' step='0.1' bind:value={subDelay} class='form-control text-right form-control-sm' />
          </div>
        </div>
      {/if}
      {#if 'PresentationRequest' in window && canCast && current}
        <span class='material-icons ctrl' title='Cast Video [D]' data-name='toggleCast' on:click={toggleCast}>
          {presentationConnection ? 'cast_connected' : 'cast'}
        </span>
      {/if}
      {#if 'pictureInPictureEnabled' in document}
        <span class='material-icons ctrl' title='Popout Window [P]' data-name='togglePopout' on:click={togglePopout}>
          {pip ? 'featured_video' : 'picture_in_picture'}
        </span>
      {/if}
      <span class='material-icons ctrl' title='Fullscreen [F]' data-name='toggleFullscreen' on:click={toggleFullscreen}>
        {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
      </span>
    </div>
  </div>
</div>

<style>
  .bind {
    font-size: 1.8rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .bind.material-icons {
    font-size: 2.2rem !important;
    font-weight: unset !important;
  }
  .stats {
    font-size: 2.3rem !important;
    white-space: nowrap;
    align-self: center;
    font-weight: 600;
    font-family: Roboto, Arial, Helvetica, sans-serif;
  }
  .miniplayer {
    height: auto !important;
  }
  .miniplayer .top,
  .miniplayer .bottom {
    display: none !important;
  }
  .miniplayer video {
    position: relative !important;
  }
  .bg-tp {
    background: #000000bb;
    backdrop-filter: blur(10px);
  }
  .bg-tp .close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    color: inherit;
    padding: var(--alert-close-padding);
    line-height: var(--alert-close-line-height);
    font-size: var(--alert-close-font-size);
    background-color: transparent;
    border-color: transparent;
  }

  video {
    transition: margin-top 0.2s ease;
  }
  .player {
    user-select: none;
    font-family: Roboto, Arial, Helvetica, sans-serif;
    background-color: var(--dark-color-light);
    will-change: width;
  }
  .player.miniplayer {
    background: #00000066;
    backdrop-filter: blur(3px);
  }

  .pip :global(canvas:not(.w-full)) {
    left: 99.9% !important;
    /*hack to hide the canvas but still keep it updating*/
  }

  .material-icons {
    font-size: 2.6rem;
    padding: 1.5rem;
    display: flex;
  }

  .immersed {
    cursor: none;
  }

  .immersed .middle .ctrl,
  .immersed .top,
  .immersed .bottom {
    opacity: 0;
  }

  .bottom img[src=' '],
  :fullscreen .ctrl[data-name='toggleCast'] {
    display: none !important;
  }

  .pip video {
    visibility: hidden;
  }

  .middle div[data-name='bufferingDisplay'] {
    border: 4px solid #ffffff00;
    border-top: 4px solid #fff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    opacity: 0;
    transition: 0.5s opacity ease;
    filter: drop-shadow(0 0 8px #000);
  }
  .disabled {
    cursor: not-allowed !important;
  }

  .buffering .middle div[data-name='bufferingDisplay'] {
    opacity: 1 !important;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .middle .ctrl {
    font-size: 4rem;
    margin: 2rem;
    z-index: 3;
    display: none;
  }
  :fullscreen {
    background: #000 !important;
  }

  /* @media (pointer: none), (pointer: coarse) {
    .middle .ctrl {
      display: flex;
    }
    .middle .play-overlay {
      display: none !important;
    }
  } */
  .miniplayer .middle {
    transition: background 0.2s ease;
    position: absolute !important;
    width: 100%;
    height: 100%;
  }
  .miniplayer .middle .ctrl {
    display: flex;
    font-size: 2.8rem;
    margin: 0.6rem;
  }
  .miniplayer .middle .play-overlay {
    display: none !important;
  }
  .miniplayer .middle .ctrl[data-name='playPause'] {
    font-size: 5.625rem;
  }
  .miniplayer:hover .middle {
    background: #00000066;
  }
  .middle .ctrl[data-name='playPause'] {
    font-size: 6.75rem;
  }

  .middle .ctrl,
  .bottom .ctrl:hover,
  .bottom .ts:hover,
  .bottom .hover .ts {
    filter: drop-shadow(0 0 8px #000);
  }

  .bottom {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6) 25%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 75%, transparent);
    transition: 0.5s opacity ease;
  }
  .top {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4) 25%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.1) 75%, transparent);
    transition: 0.5s opacity ease;
  }

  .ctrl {
    cursor: pointer;
  }

  input[type='range'] {
    -webkit-appearance: none;
    background: transparent;
    margin: 0;
    cursor: pointer;
    height: 8px;
  }

  input[type='range']:focus {
    outline: none;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 3px;
  }

  input[type='range']::-moz-range-track {
    height: 3px;
    border: none;
  }

  input[type='range']::-webkit-slider-thumb {
    height: 0;
    width: 0;
    border-radius: 50%;
    background: #ff3c00;
    -webkit-appearance: none;
    appearance: none;
    transition: all 0.1s ease;
  }
  input[type='range']::-moz-range-thumb {
    height: 0;
    width: 0;
    border-radius: 50%;
    background: #ff3c00;
    -webkit-appearance: none;
    appearance: none;
    transition: all 0.1s ease;
    border: none;
  }

  input[type='range']:hover::-webkit-slider-thumb {
    height: 12px;
    width: 12px;
    margin-top: -4px;
  }

  input[type='range']:hover::-moz-range-thumb {
    height: 12px;
    width: 12px;
    margin-top: -4px;
  }

  input[type='range']::-moz-range-track {
    background: linear-gradient(90deg, #ff3c00 var(--value), rgba(255, 255, 255, 0.2) var(--value));
  }
  input[type='range']::-webkit-slider-runnable-track {
    background: linear-gradient(90deg, #ff3c00 var(--value), rgba(255, 255, 255, 0.2) var(--value));
  }
  input[type='range'].prog::-webkit-slider-runnable-track {
    background: linear-gradient(90deg, #ff3c00 var(--value), #00000000 var(--value)) !important;
  }
  canvas.buffer {
    height: 3px;
    z-index: -1;
  }
  .bottom .volume:hover input[type='range'] {
    width: 5vw;
    display: inline-block;
    margin-right: 1.125rem;
  }

  .bottom .volume input[type='range'] {
    width: 0;
    transition: width 0.1s ease;
    height: 100%;
  }

  .bottom [data-name='setProgress'] ~ .hover {
    pointer-events: none;
    opacity: 0;
    top: 0;
    transform: translate(-50%, -100%);
    position: absolute;
    font-family: Roboto, Arial, Helvetica, sans-serif;
    white-space: nowrap;
    font-weight: 600;
    width: 200px;
    transition: 0.2s opacity ease;
  }

  .bottom [data-name='setProgress']:hover ~ .hover {
    opacity: 1;
  }
  .h-20 {
    height: 2rem
  }
  .mb--5 {
    margin-bottom: -.5rem;
  }

  .bottom .ts {
    color: #ececec;
    font-size: 2rem !important;
    white-space: nowrap;
    align-self: center;
    line-height: var(--base-line-height);
    padding: 0 1.56rem;
    font-weight: 600;
  }

  @media (pointer: none), (pointer: coarse) {
    .bottom .ctrl[data-name='playPause'],
    .bottom .ctrl[data-name='playNext'],
    .bottom .volume,
    .bottom .ctrl[data-name='toggleFullscreen'] {
      display: none;
    }
  }

  ::-webkit-inner-spin-button {
    opacity: 1;
    margin-left: 0.4rem;
    margin-right: -0.5rem;
    filter: invert(0.84);
    padding-top: 2rem;
  }
</style>
