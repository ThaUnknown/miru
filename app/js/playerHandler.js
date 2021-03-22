const controls = document.getElementsByClassName('ctrl')

for (const item of controls) {
  item.addEventListener('click', function () {
    const func = this.dataset.name
    window[func]()
  })
}

// video element shit
video.addEventListener('playing', resetBuffer)
video.addEventListener('canplay', resetBuffer)
video.onloadedmetadata = () => {
  initThumbnail()
  updateDisplay();
  (video.audioTracks && video.audioTracks.length > 1) ? baudio.removeAttribute('disabled') : baudio.setAttribute('disabled', '')
}
video.onended = () => {
  updateBar(video.currentTime / video.duration * 100)
  if (settings.player6 && parseInt(playerData.nowPlaying[1]) < playerData.nowPlaying[0].episodes) btnnext()
}
video.addEventListener('waiting', isBuffering)
video.ontimeupdate = () => {
  updateDisplay()
  checkCompletion()
  if ('setPositionState' in navigator.mediaSession) updatePositionState()
}

if (!('pictureInPictureEnabled' in document)) {
  video.setAttribute('disablePictureInPicture', '')
  bpip.setAttribute('disabled', '')
} else {
  bpip.removeAttribute('disabled')
  video.addEventListener('enterpictureinpicture', () => { if (playerData.octopusInstance) btnpip() })
}

let playerData = {}

function cleanupVideo () { // cleans up objects, attemps to clear as much video caching as possible
  if (playerData.octopusInstance) playerData.octopusInstance.dispose()
  if (playerData.fonts) playerData.fonts.forEach(file => URL.revokeObjectURL(file))
  if (dl.href) URL.revokeObjectURL(dl.href)
  dl.setAttribute('disabled', '')
  dl.onclick = undefined
  video.poster = ''
  // some attemt at cache clearing
  video.pause()
  video.src = ''
  video.load()
  document.title = 'Miru'
  progress.value = 0
  // if (typeof client !== 'undefined' && client.torrents[0] && client.torrents[0].files.length > 1) {
  //     client.torrents[0].files.forEach(file => file.deselect());
  //     client.torrents[0].deselect(0, client.torrents[0].pieces.length - 1, false);
  // console.log(videoFiles.filter(file => `${scope}webtorrent/${client.torrents[0].infoHash}/${encodeURI(file.path)}` == video.src))
  // look for file and delete its store
  // }
  playerData = {
    subtitles: [],
    fonts: [],
    headers: []
  }
  nowPlayingDisplay.innerHTML = ''
  bcap.setAttribute('disabled', '')
  bpl.setAttribute('disabled', '')
  bnext.removeAttribute('disabled')
  navNowPlaying.classList.add('d-none')
  if ('mediaSession' in navigator) navigator.mediaSession.metadata = undefined
}

async function buildVideo (torrent, opts) { // sets video source and creates a bunch of other media stuff
  // play wanted episode from opts, or the 1st episode, or 1st file [batches: plays wanted episode, single: plays the only episode, manually added: plays first or only file]
  let selectedFile = videoFiles[0]
  if (opts.file) {
    selectedFile = opts.file
  } else if (videoFiles.length > 1) {
    // TODO play selected media too!
    selectedFile = videoFiles.filter(async file => await anitomyscript(file.name).then(object => Number(object.episode_number) === Number(opts.episode || 1)))[0] || videoFiles[0]
  }
  video.src = `${scope}webtorrent/${torrent.infoHash}/${encodeURI(selectedFile.path)}`
  video.load()
  // "predict" video FPS for subtitle renderer
  playerData.fps = new Promise((resolve, reject) => {
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      let wasSeeked
      video.onseeking = function () { wasSeeked = true }
      video.onplay = () => setTimeout(() => video.requestVideoFrameCallback((now, metadata) => {
        const rawFPS = metadata.presentedFrames / metadata.mediaTime
        console.log(rawFPS, metadata)
        if (!wasSeeked) {
          if (rawFPS >= 19 && rawFPS <= 26) {
            resolve(23.976)
          } else if (rawFPS > 26 && rawFPS <= 35) {
            resolve(29.97)
          } else if (rawFPS > 50 && rawFPS <= 70) {
            resolve(59.94)
          } else {
            // smth went VERY wrong XD
            resolve(23.976)
          }
        } else {
          // video was seeked, cant predict fps
          resolve(23.976)
        }
        video.onseeking = undefined
        video.onplay = undefined
      }), 3000)
    } else {
      // can't predict fps, API unsupported, assume 24fps
      resolve(23.976)
    }
  })
  playVideo()

  if (videoFiles.length > 1) bpl.removeAttribute('disabled')

  async function processFile () {
    halfmoon.initStickyAlert({
      content: `<span class="text-break">${selectedFile.name}</span> has finished downloading. Now seeding.`,
      title: 'Download Complete',
      alertType: 'alert-success',
      fillType: ''
    })
    await postDownload(selectedFile)
    if (settings.player5) {
      finishThumbnails(`${scope}webtorrent/${torrent.infoHash}/${encodeURI(selectedFile.path)}`)
    }
    if (!torrent.store.store._store) { // only allow download from RAM
      downloadFile(selectedFile)
    }
  }
  if (selectedFile.done) {
    processFile()
  } else {
    playerData.onDone = selectedFile.on('done', () => {
      processFile()
    })
  }
  playerData.onProgress = () => {
    if (document.location.hash === '#player') {
      if (!player.classList.contains('immersed')) {
        player.style.setProperty('--download', selectedFile.progress * 100 + '%')
        peers.innerHTML = torrent.numPeers
        downSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s'
        upSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s'
      }
    }
    setTimeout(playerData.onProgress, 100)
  }
  setTimeout(playerData.onProgress, 100)

  if (opts.media && videoFiles.length === 1) {
    // if this is a single file, then the media is most likely accurate, just update it!
    playerData.nowPlaying = [await alRequest({ id: opts.media?.id, method: 'SearchIDSingle' }).then(res => res.data.Media), opts.episode || 1]
    // update store with entry, but dont really do anything with it
    resolveFileMedia({ fileName: selectedFile.name, method: 'SearchName' })
  } else {
    // if this is a batch or single unresolved file, then resolve the single selected file, batches can include specials
    const mediaInformation = await resolveFileMedia({ fileName: selectedFile.name, method: 'SearchName' })
    playerData.nowPlaying = [mediaInformation.media, mediaInformation.episode || 1]
  }
  let mediaMetadata
  // only set mediasession and other shit if the playerdata is parsed correctly
  if (playerData.nowPlaying[0]) {
    navNowPlaying.classList.remove('d-none')
    mediaMetadata = new MediaMetadata({
      title: playerData.nowPlaying[0].title.userPreferred,
      artist: `Episode ${Number(playerData.nowPlaying[1])}`,
      album: 'Miru',
      artwork: [{
        src: playerData.nowPlaying[0].coverImage.medium,
        sizes: '256x256',
        type: 'image/jpg'
      }]
    })
    if (parseInt(playerData.nowPlaying[1]) >= playerData.nowPlaying[0].episodes) bnext.setAttribute('disabled', '')
    let streamingEpisode
    if (playerData.nowPlaying[0].streamingEpisodes.length >= Number(playerData.nowPlaying[1])) {
      streamingEpisode = playerData.nowPlaying[0].streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(playerData.nowPlaying[1]))[0]
    }
    // TODO: this should also use absolute episode numbers instead of relative but AL will change this anyways....
    if (streamingEpisode) {
      video.poster = streamingEpisode.thumbnail
      document.title = `${playerData.nowPlaying[0].title.userPreferred} - EP ${Number(playerData.nowPlaying[1])} - ${episodeRx.exec(streamingEpisode.title)[2]} - Miru`
      mediaMetadata.artist = `Episode ${Number(playerData.nowPlaying[1])} - ${episodeRx.exec(streamingEpisode.title)[2]}`
      mediaMetadata.artwork = [{
        src: streamingEpisode.thumbnail,
        sizes: '256x256',
        type: 'image/jpg'
      }]
      nowPlayingDisplay.innerHTML = `EP ${Number(playerData.nowPlaying[1])} - ${episodeRx.exec(streamingEpisode.title)[2]}`
    } else {
      document.title = `${playerData.nowPlaying[0].title.userPreferred} -  EP ${Number(playerData.nowPlaying[1])} - Miru`
      nowPlayingDisplay.innerHTML = `EP ${Number(playerData.nowPlaying[1])}`
    }
  }
  if ('mediaSession' in navigator && mediaMetadata) navigator.mediaSession.metadata = mediaMetadata
}

// visibility loss pause
if (settings.player10) {
  document.addEventListener('visibilitychange', () => {
    if (!video.ended) document.visibilityState === 'hidden' ? video.pause() : playVideo()
  })
}

// progress seek bar and display

progress.addEventListener('input', dragBar)
progress.addEventListener('mouseup', dragBarEnd)
progress.addEventListener('touchend', dragBarEnd)
progress.addEventListener('click', dragBarEnd)
progress.addEventListener('mousedown', dragBarStart)

function updateDisplay () {
  if (!player.classList.contains('immersed') && document.location.hash === '#player') {
    progress.style.setProperty('--buffer', video.buffered.length === 0 ? 0 : video.buffered.end(video.buffered.length - 1) / video.duration * 100 + '%')
    updateBar((video.currentTime / video.duration * 100) || progress.value)
  }
  createThumbnail(video)
}

function dragBar () {
  updateBar(progress.value)
  thumb.src = playerData.thumbnailData.thumbnails[Math.floor(currentTime / playerData.thumbnailData.interval)] || ' '
}

function dragBarEnd () {
  video.currentTime = currentTime || 0
  playVideo()
}

async function dragBarStart () {
  await video.pause()
  updateBar(progress.value)
}

let currentTime = 0
function updateBar (progressPercent) {
  progress.style.setProperty('--progress', progressPercent + '%')
  thumb.style.setProperty('--progress', progressPercent + '%')
  currentTime = video.duration * progressPercent / 100
  elapsed.innerHTML = toTS(currentTime)
  remaining.innerHTML = toTS(video.duration - currentTime)
  progress.value = progressPercent
  progress.setAttribute('data-ts', toTS(currentTime))
}

// dynamic thumbnail previews

function initThumbnail () {
  const canvas = document.createElement('canvas')
  playerData.thumbnailData = {
    canvas: canvas,
    context: canvas.getContext('2d'),
    height: parseInt(150 / (video.videoWidth / video.videoHeight)),
    thumbnails: [],
    interval: video.duration / 300 < 5 ? 5 : video.duration / 300
  }
  canvas.width = 150
  canvas.height = playerData.thumbnailData.height
  thumb.style.setProperty('--height', playerData.thumbnailData.height + 'px')
}

function createThumbnail (vid) {
  if (vid?.readyState >= 2) {
    const index = Math.floor(vid.currentTime / playerData.thumbnailData.interval)
    if (!playerData.thumbnailData.thumbnails[index]) {
      playerData.thumbnailData.context.fillRect(0, 0, 150, playerData.thumbnailData.height)
      playerData.thumbnailData.context.drawImage(vid, 0, 0, 150, playerData.thumbnailData.height)
      playerData.thumbnailData.thumbnails[index] = playerData.thumbnailData.canvas.toDataURL('image/jpeg')
    }
  }
}

function finishThumbnails (src) {
  const t0 = performance.now()
  playerData.thumbnailData.video = document.createElement('video')
  let index = 0
  playerData.thumbnailData.video.preload = 'none'
  playerData.thumbnailData.video.volume = 0
  playerData.thumbnailData.video.playbackRate = 0
  playerData.thumbnailData.video.width = playerData.thumbnailData.canvas.width
  playerData.thumbnailData.video.addEventListener('loadeddata', loadTime)
  playerData.thumbnailData.video.addEventListener('canplay', () => {
    createThumbnail(playerData.thumbnailData?.video)
    loadTime()
  })
  function loadTime () {
    while (playerData.thumbnailData?.thumbnails[index] && index <= Math.floor(playerData.thumbnailData.video.duration / playerData.thumbnailData.interval)) { // only create thumbnails that are missing
      index++
    }
    if (playerData.thumbnailData?.video?.currentTime !== playerData.thumbnailData?.video?.duration) {
      playerData.thumbnailData.video.currentTime = index * playerData.thumbnailData.interval
    } else {
      playerData.thumbnailData?.video?.removeAttribute('src')
      playerData.thumbnailData?.video?.load()
      playerData.thumbnailData?.video?.remove()
      delete playerData.thumbnailData?.video
      console.log('Thumbnail creating finished', index, performance.now() - t0)
    }
    index++
  }
  playerData.thumbnailData.video.src = src
  playerData.thumbnailData.video.play()
  console.log('Thumbnail creating started')
}

// file download
function downloadFile (file) {
  dl.removeAttribute('disabled')
  dl.onclick = async e => {
    file.getBlobURL((_err, url) => {
      const a = document.createElement('a')
      a.download = file.name
      a.href = url
      document.body.appendChild(a)
      a.click(e)
      a.remove()
      window.URL.revokeObjectURL(url)
    })
  }
}

// bufering spinner

let buffer
function resetBuffer () {
  if (buffer) {
    clearTimeout(buffer)
    buffer = undefined
    buffering.classList.add('hidden')
  }
}

function isBuffering () {
  buffer = setTimeout(displayBuffer, 150)
}

function displayBuffer () {
  buffering.classList.remove('hidden')
  resetTimer()
}

// immerse timeout
let immerseTime

player.onmousemove = resetTimer
player.onkeypress = resetTimer
function immersePlayer () {
  player.classList.add('immersed')
  immerseTime = undefined
}

function resetTimer () {
  if (!immerseTime) {
    clearTimeout(immerseTime)
    player.classList.remove('immersed')
    immerseTime = setTimeout(immersePlayer, parseInt(settings.player2) * 1000)
  }
}

function toTS (sec) {
  if (Number.isNaN(sec) || sec < 0) {
    return '00:00'
  }

  const hours = Math.floor(sec / 3600)
  let minutes = Math.floor((sec - (hours * 3600)) / 60)
  let seconds = Math.floor(sec - (hours * 3600) - (minutes * 60))

  if (minutes < 10) {
    minutes = `0${minutes}`
  }

  if (seconds < 10) {
    seconds = `0${seconds}`
  }

  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`
  } else {
    return `${minutes}:${seconds}`
  }
  // return new Date(sec*1000).toISOString().slice(12, -1).slice(0, -4).replace(/^0:/,"") // laggy :/
}

// play/pause button
ptoggle.addEventListener('click', btnpp)
async function playVideo () {
  try {
    await video.play()
    bpp.innerHTML = 'pause'
  } catch (err) {
    bpp.innerHTML = 'play_arrow'
  }
}

function btnpp () {
  if (video.paused) {
    playVideo()
  } else {
    bpp.innerHTML = 'play_arrow'
    video.pause()
  }
}
// next video button
let nextCooldown
function btnnext () {
  clearTimeout(nextCooldown)
  nextCooldown = setTimeout(() => {
    const currentFile = videoFiles.filter(file => `${window.location.origin}${scope}webtorrent/${client.torrents[0].infoHash}/${encodeURI(file.path)}` === video.src)[0]
    if (videoFiles.length > 1 && videoFiles.indexOf(currentFile) < videoFiles.length - 1) {
      const fileIndex = videoFiles.indexOf(currentFile) + 1
      const nowPlaying = [playerData.nowPlaying[0], parseInt(playerData.nowPlaying[1]) + 1]
      cleanupVideo()
      buildVideo(videoFiles[fileIndex], nowPlaying)
    } else {
      if (playerData.nowPlaying[0]) {
        nyaaSearch(playerData.nowPlaying[0], parseInt(playerData.nowPlaying[1]) + 1)
      } else {
        halfmoon.initStickyAlert({
          content: 'Couldn\'t find anime name! Try specifying a torrent manually.',
          title: 'Search Failed',
          alertType: 'alert-danger',
          fillType: ''
        })
      }
    }
  }, 200)
}
// volume shit
volume.addEventListener('input', () => updateVolume())
let oldlevel

function btnmute () {
  if (video.volume === 0) {
    updateVolume(oldlevel)
  } else {
    oldlevel = video.volume * 100
    updateVolume(0)
  }
}

function updateVolume (a) {
  let level
  if (a == null || isNaN(a)) {
    level = Number(volume.value)
  } else {
    level = a
    volume.value = a
  }
  volume.style.setProperty('--volume-level', level + '%')
  bmute.innerHTML = (level === 0) ? 'volume_off' : 'volume_up'
  video.volume = level / 100
}
updateVolume(parseInt(settings.volume))

// PiP

async function btnpip () {
  if (video.readyState) {
    if (!playerData.octopusInstance) {
      video !== document.pictureInPictureElement ? await video.requestPictureInPicture() : await document.exitPictureInPicture()
    } else {
      if (document.pictureInPictureElement && !document.pictureInPictureElement.id) { // only exit if pip is the custom one, else overwrite existing pip with custom
        await document.exitPictureInPicture()
      } else {
        const canvas = document.createElement('canvas')
        const canvasVideo = document.createElement('video')
        const context = canvas.getContext('2d', { alpha: false })
        let running = true
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        function renderFrame () {
          if (running === true) {
            context.drawImage(video, 0, 0)
            context.drawImage(subtitleCanvas, 0, 0, canvas.width, canvas.height)
            window.requestAnimationFrame(renderFrame)
          }
        }
        canvasVideo.srcObject = canvas.captureStream()
        canvasVideo.onloadedmetadata = () => {
          canvasVideo.play()
          canvasVideo.requestPictureInPicture().then(
            player.classList.add('pip')
          ).catch(e => {
            console.warn('Failed To Burn In Subtitles ' + e)
            running = false
            canvasVideo.remove()
            canvas.remove()
            player.classList.remove('pip')
          })
        }
        canvasVideo.onleavepictureinpicture = () => {
          running = false
          canvasVideo.remove()
          canvas.remove()
          player.classList.remove('pip')
        }
        window.requestAnimationFrame(renderFrame)
      }
    }
  }
}

// theathe mode

function btntheatre () {
  pageWrapper.classList.toggle('nav-hidden')
}

// fullscreen
player.addEventListener('fullscreenchange', updateFullscreen)
ptoggle.addEventListener('dblclick', btnfull)
function btnfull () {
  document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen()
}
function updateFullscreen () {
  document.fullscreenElement ? bfull.innerHTML = 'fullscreen_exit' : bfull.innerHTML = 'fullscreen'
}

// seeking and skipping

function seek (a) {
  if (a === 85 && video.currentTime < 10) {
    video.currentTime = 90
  } else if (a === 85 && (video.duration - video.currentTime) < 90) {
    video.currentTime = video.duration
  } else {
    video.currentTime += a
  }
  updateBar(video.currentTime / video.duration * 100)
}
// subtitles, generates content every single time its opened because fuck knows when the parser will find new shit
// this needs to go.... really badly
function btncap () {
  const frag = document.createDocumentFragment()
  const off = document.createElement('a')
  off.classList.add('dropdown-item', 'pointer')
  playerData.selectedHeader ? off.classList.add('text-muted') : off.classList.add('text-white')
  off.innerHTML = 'OFF'
  off.onclick = () => {
    renderSubs()
    playerData.selectedHeader = undefined
    btncap()
  }
  frag.appendChild(off)
  for (const track of playerData.headers) {
    if (track) {
      const template = document.createElement('a')
      template.classList.add('dropdown-item', 'pointer', 'text-capitalize')
      template.innerHTML = (track.language || (!Object.values(playerData.headers).some(header => header.language === 'eng' || header.language === 'en') ? 'eng' : header.type)) + (track.name ? ' - ' + track.name : '')
      if (playerData.selectedHeader === track.number) {
        template.classList.add('text-white')
      } else {
        template.classList.add('text-muted')
      }
      template.onclick = () => {
        renderSubs(track.number)
        playerData.selectedHeader = track.number
        btncap()
      }
      frag.appendChild(template)
    }
  }
  const timeOffset = document.createElement('div')
  timeOffset.classList.add('btn-group', 'w-full', 'pt-5')
  timeOffset.setAttribute('role', 'group')
  timeOffset.innerHTML = `<button class="btn" type="button" onclick="playerData.octopusInstance.timeOffset+=1">-1s</button>
<button class="btn" type="button" onclick="playerData.octopusInstance.timeOffset-=1">+1s</button>`
  frag.appendChild(timeOffset)
  subMenu.innerHTML = ''
  subMenu.appendChild(frag)
}
// playlist

function btnpl () {
  window.location.hash = '#playlist'
}

// audio tracks

function btnaudio () {
  const frag = document.createDocumentFragment()
  for (const track of video.audioTracks) {
    const template = document.createElement('a')
    template.classList.add('dropdown-item', 'pointer', 'text-capitalize')
    template.innerHTML = (track.language || (!Object.values(video.audioTracks).some(track => track.language === 'eng' || track.language === 'en') ? 'eng' : track.label)) + (track.label ? ' - ' + track.label : '')
    track.enabled === true ? template.classList.add('text-white') : template.classList.add('text-muted')
    template.onclick = () => {
      selectAudio(track.id)
    }
    frag.appendChild(template)
  }

  audioTracksMenu.innerHTML = ''
  audioTracksMenu.appendChild(frag)
}
function selectAudio (id) {
  for (const track of video.audioTracks) {
    track.id === id ? track.enabled = true : track.enabled = false
  }
  seek(-1) // stupid fix because video freezes up when chaging tracks
  btnaudio()
}
// keybinds

document.onkeydown = a => {
  if (a.key === 'F5') {
    a.preventDefault()
  }
  if (document.location.hash === '#player') {
    switch (a.key) {
      case ' ':
        btnpp()
        break
      case 'n':
        btnnext()
        break
      case 'm':
        btnmute()
        break
      case 'p':
        btnpip()
        break
      case 't':
        btntheatre()
        break
      case 'c':
        btncap()
        break
      case 'f':
        btnfull()
        break
      case 's':
        seek(85)
        break
      case 'ArrowLeft':
        seek(-parseInt(settings.player3))
        break
      case 'ArrowRight':
        seek(parseInt(settings.player3))
        break
      case 'ArrowUp':
        updateVolume(parseInt(volume.value) + 5)
        break
      case 'ArrowDown':
        updateVolume(parseInt(volume.value) - 5)
        break
      case 'Escape':
        document.location.hash = '#home'
        break
    }
  }
}
// media session shit

function updatePositionState () {
  if (video.duration) {
    navigator.mediaSession.setPositionState({
      duration: video.duration || 0,
      playbackRate: video.playbackRate || 0,
      position: video.currentTime || 0
    })
  }
}

if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', btnpp)
  navigator.mediaSession.setActionHandler('pause', btnpp)
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    seek(-parseInt(settings.player3))
  })
  navigator.mediaSession.setActionHandler('seekforward', () => {
    seek(parseInt(settings.player3))
  })
  navigator.mediaSession.setActionHandler('nexttrack', btnnext)
}

// AL entry auto add
function checkCompletion () {
  if (!playerData.watched && video.duration - 180 < video.currentTime && playerData.nowPlaying && (playerData.nowPlaying[0].episodes || playerData.nowPlaying[0].nextAiringEpisode.episode)) {
    if (settings.other2 && !(!(playerData.nowPlaying[0].episodes || playerData.nowPlaying[0].nextAiringEpisode.episode) && playerData.nowPlaying[0].streamingEpisodes.length && parseInt(playerData.nowPlaying[1] > 12))) {
      alEntry()
    } else {
      halfmoon.initStickyAlert({
        content: `Do You Want To Mark <br><b>${playerData.nowPlaying[0].title.userPreferred}</b><br>Episode ${playerData.nowPlaying[1]} As Completed?<br>
                <button class="btn btn-sm btn-square btn-success mt-5" onclick="alEntry()" data-dismiss="alert" type="button" aria-label="Close">✓</button>
                <button class="btn btn-sm btn-square mt-5" data-dismiss="alert" type="button" aria-label="Close"><span aria-hidden="true">X</span></button>`,
        title: 'Episode Complete',
        timeShown: 180000
      })
    }
    playerData.watched = true
  }
}
