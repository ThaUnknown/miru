<script context="module">
  export let media = null
  let fileMedia = null
  let hadImage = false
  export function updateMedia(fileMed) {
    fileMedia = fileMed
    media = fileMedia.media
    const name = [fileMedia.mediaTitle, fileMedia.episodeNumber, fileMedia.episodeTitle].filter(i => i).join(' - ')

    fileMedia.episodeThumbnail = !!fileMedia.episodeThumbnail
    const metadata =
      fileMedia.episodeThumbnail || fileMedia.mediaCover
        ? new MediaMetadata({
            title: name || 'Miru',
            artwork: [
              {
                src: fileMedia.episodeThumbnail || fileMedia.mediaCover,
                sizes: '256x256',
                type: 'image/jpg'
              }
            ]
          })
        : new MediaMetadata({
            title: name || 'Miru'
          })
    if (fileMedia.parseObject.release_group) metadata.artist = fileMedia.parseObject.release_group
    navigator.mediaSession.metadata = metadata
  }
</script>

<script>
  import { alEntry } from '@/modules/anilist.js'
  import { client } from '@/modules/torrent.js'
  import { resolveFileMedia } from '@/modules/anime.js'
  import Peer from '@/modules/Peer.js'
  import Subtitles from '@/modules/subtitles.js'
  import { toTS, videoRx, fastPrettyBytes } from '@/modules/util.js'
  import Keyboard from './Keyboard.svelte'

  async function mediaChange(current, image) {
    if (current && 'mediaSession' in navigator) {
      if (!media || (!hadImage && image)) {
        // filename is already mapped so this *should* be fine
        const data = await resolveFileMedia({ fileName: current.name })
        if (image) data.episodeThumbnail = image
        updateMedia(data)
      }
    }
  }

  export let miniplayer = false
  export let page
  $: updateFiles(files)
  export let files = []
  export let name = null
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
  let presentationRequest = null
  let presentationConnection = null
  let canCast = false
  let isFullscreen = false
  let ended = false
  let volume = localStorage.getItem('volume') || 1
  let playbackRate = 1
  $: localStorage.setItem('volume', volume)
  function getFPS() {
    video.fps = new Promise(resolve => {
      let lastmeta = null
      let count = 0

      function handleFrames(now, metadata) {
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
          paused = false
          video.requestVideoFrameCallback(handleFrames)
        }
      }
      video.requestVideoFrameCallback(handleFrames)
    })
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

  //document.fullscreenElement isn't reactive
  document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement
  })

  function handleHeaders() {
    subHeaders = subs?.headers
  }

  function updateFiles(files) {
    if (files && files.length) {
      videos = files.filter(file => videoRx.test(file.name))
      if (videos?.length) {
        handleCurrent(videos[0])
        if (subs) {
          subs.files = files || []
          subs.findSubtitleFiles(current)
        }
      }
    }
  }

  async function handleCurrent(file) {
    if (file) {
      if (thumbnailData.video?.src) URL.revokeObjectURL(video?.src)
      Object.assign(thumbnailData, {
        thumbnails: [],
        interval: undefined,
        video: undefined
      })
      src = ''
      video?.load()
      completed = false
      file.getStreamURL((err, url) => {
        src = url
        current = file
        video?.load()
        currentTime = 0
      })
    }
  }
  $: initSubs(current, video)

  function initSubs(current, video) {
    if (current && video) {
      if (subs) subs.destroy()
      subs = new Subtitles(video, files, current, handleHeaders)
    }
  }
  function cycleSubtitles() {
    if (current && subs?.headers) {
      const tracks = subs.headers.filter(header => header)
      const index = tracks.indexOf(subs.headers[subs.current]) + 1
      subs.selectCaptions(index >= tracks.length ? -1 : subs.headers.indexOf(tracks[index]))
    }
  }

  let subDelay = 0
  $: updateDelay(subDelay)
  function updateDelay(delay) {
    if (subs?.renderer) subs.renderer.timeOffset = delay
  }

  let currentTime = 0
  $: progress = currentTime / duration
  $: targetTime = (!paused && currentTime) || targetTime
  function handleMouseDown({ target }) {
    wasPaused = paused
    paused = true
    targetTime = target.value * duration
  }
  function handleMouseUp() {
    paused = wasPaused
    currentTime = targetTime
  }
  function handleProgress({ target }) {
    targetTime = target.value * duration
  }

  function playPause() {
    paused = !paused
  }
  function toggleMute() {
    muted = !muted
  }
  function playNext() {
    handleCurrent(videos[(videos.indexOf(current) + 1) % videos.length])
  }
  function playLast() {
    const index = videos.indexOf(current)
    handleCurrent(videos[index === 0 ? videos.length - 1 : index - 1])
  }
  function toggleFullscreen() {
    document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen()
  }
  function seek(time) {
    if (time === 85 && currentTime < 10) {
      targetTime = currentTime = 90
    } else if (time === 85 && duration - currentTime < 90) {
      targetTime = currentTime = duration
    } else {
      targetTime = currentTime += time
    }
  }
  function forward() {
    seek(2)
  }
  function rewind() {
    seek(-2)
  }
  function selectAudio(id) {
    if (id !== undefined) {
      for (const track of video.audioTracks) {
        track.enabled = track.id === id
      }
      seek(-0.5) // stupid fix because video freezes up when chaging tracks
    }
  }
  function toggleCast() {
    if (video.readyState) {
      if (presentationConnection) {
        presentationConnection?.terminate()
      } else {
        presentationRequest.start()
      }
    }
  }
  async function togglePopout() {
    if (video.readyState) {
      await video.fps
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
          const { stream, destroy } = await getBurnIn()
          pip = true
          canvasVideo.srcObject = stream
          canvasVideo.onloadedmetadata = () => {
            canvasVideo.play()
            canvasVideo.requestPictureInPicture().catch(e => {
              pip = false
              console.warn('Failed To Burn In Subtitles ' + e)
              destroy()
              canvasVideo.remove()
            })
          }
          canvasVideo.onleavepictureinpicture = () => {
            destroy()
            canvasVideo.remove()
            pip = false
          }
        }
      }
    }
  }
  let showKeybinds = false
  async function handleKeydown({ key }) {
    switch (key) {
      case 'r':
        seek(-90)
        break
      case ',':
        seek(-1 / (await video.fps) || 0)
        break
      case '.':
        seek(1 / (await video.fps) || 0)
        break
      case 'i':
        toggleStats()
        break
      case '`':
        showKeybinds = !showKeybinds
        break
      case ' ':
        playPause()
        break
      case 'n':
        playNext()
        break
      case 'm':
        muted = !muted
        break
      case 'p':
        togglePopout()
        break
      case 'f':
        toggleFullscreen()
        break
      case 's':
        seek(85)
        break
      case 'd':
        toggleCast()
        break
      case 'c':
        cycleSubtitles()
        break
      case 'ArrowLeft':
        rewind()
        break
      case 'ArrowRight':
        forward()
        break
      case 'ArrowUp':
        volume = Math.min(1, volume + 0.05)
        break
      case 'ArrowDown':
        volume = Math.max(0, volume - 0.05)
        break
      case '[':
        playbackRate -= 0.1
        break
      case ']':
        playbackRate += 0.1
        break
      case '\\':
        playbackRate = 1
        break
    }
  }

  async function getBurnIn(noSubs) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    let loop = null
    let destroy = null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const renderFrame = () => {
      context.drawImage(video, 0, 0)
      if (!noSubs) context.drawImage(subs.renderer?._canvas, 0, 0, canvas.width, canvas.height)
      loop = video.requestVideoFrameCallback(renderFrame)
    }
    loop = video.requestVideoFrameCallback(renderFrame)
    destroy = () => {
      video.cancelVideoFrameCallback(loop)
      canvas.remove()
    }

    return { stream: canvas.captureStream(), destroy }
  }

  function initCast(event) {
    // these quality settings are likely to make cast overheat, oh noes!
    let peer = new Peer({
      polite: true,
      quality: {
        audio: {
          stereo: 1,
          'sprop-stereo': 1,
          maxaveragebitrate: 510000,
          maxplaybackrate: 510000,
          cbr: 0,
          useinbandfec: 1,
          usedtx: 1,
          maxptime: 20,
          minptime: 10
        },
        video: {
          bitrate: 2000000,
          codecs: ['VP9', 'VP8', 'H264']
        }
      }
    })

    presentationConnection = event.connection
    presentationConnection.addEventListener('terminate', () => {
      presentationConnection = null
      peer = null
    })

    peer.signalingPort.onmessage = ({ data }) => {
      presentationConnection.send(data)
    }

    presentationConnection.addEventListener('message', ({ data }) => {
      peer.signalingPort.postMessage(data)
    })

    peer.dc.onopen = async () => {
      if (peer && presentationConnection) {
        const tracks = []
        const videostream = video.captureStream(await video.fps)
        if (true) {
          // TODO: check if cast supports codecs
          const { stream, destroy } = await getBurnIn(!subs?.renderer)
          tracks.push(stream.getVideoTracks()[0], videostream.getAudioTracks()[0])
          presentationConnection.addEventListener('terminate', destroy)
        } else {
          tracks.push(videostream.getVideoTracks()[0], videostream.getAudioTracks()[0])
        }
        for (const track of tracks) {
          peer.pc.addTrack(track, videostream)
        }
        paused = false // video pauses for some reason
      }
    }
  }

  function immersePlayer() {
    immersed = true
    immerseTimeout = undefined
  }

  function resetImmerse() {
    if (immerseTimeout) {
      clearTimeout(immerseTimeout)
    } else {
      immersed = false
    }
    immerseTimeout = setTimeout(immersePlayer, 8 * 1000)
  }

  function hideBuffering() {
    if (bufferTimeout) {
      clearTimeout(bufferTimeout)
      bufferTimeout = null
      buffering = false
    }
  }

  function showBuffering() {
    bufferTimeout = setTimeout(() => {
      buffering = true
      resetImmerse()
    }, 150)
  }
  $: navigator.mediaSession?.setPositionState({
    duration: Math.max(0, duration || 0),
    playbackRate: 1,
    position: Math.max(duration || 0, currentTime || 0)
  })
  $: mediaChange(current)

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
  function toggleStats() {
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      if (requestCallback) {
        stats = null
        video.cancelVideoFrameCallback(requestCallback)
        requestCallback = null
      } else {
        requestCallback = video.requestVideoFrameCallback((a, b) => {
          stats = {}
          handleStats(a, b)
        })
      }
    }
  }
  async function handleStats(now, metadata) {
    if (stats) {
      stats = {
        fps: await video.fps,
        presented: metadata.presentedFrames,
        dropped: video.getVideoPlaybackQuality()?.droppedVideoFrames,
        processing: metadata.processingDuration + ' ms',
        viewport: video.clientWidth + 'x' + video.clientHeight,
        resolution: videoWidth + 'x' + videoHeight,
        buffer: getBufferHealth(metadata.mediaTime) + ' s'
      }
      setTimeout(() => video.requestVideoFrameCallback(handleStats), 200)
    }
  }
  function getBufferHealth(time) {
    for (let index = video.buffered.length; index--; ) {
      if (time < video.buffered.end(index) && time > video.buffered.start(index)) {
        return parseInt(video.buffered.end(index) - time)
      }
    }
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
  function handleHover({ offsetX, target }) {
    hoverOffset = offsetX / target.clientWidth
    hoverTime = duration * hoverOffset
    hover.style.setProperty('left', hoverOffset * 100 + '%')
    thumbnail = thumbnailData.thumbnails[Math.floor(hoverTime / thumbnailData.interval)] || ' '
  }
  function createThumbnail(vid = video) {
    if (vid?.readyState >= 2) {
      const index = Math.floor(vid.currentTime / thumbnailData.interval)
      if (!thumbnailData.thumbnails[index]) {
        thumbnailData.context.fillRect(0, 0, 200, thumbnailData.canvas.height)
        thumbnailData.context.drawImage(vid, 0, 0, 200, thumbnailData.canvas.height)
        thumbnailData.thumbnails[index] = thumbnailData.canvas.toDataURL('image/jpeg')
        if (index === 5) mediaChange(current, thumbnailData.thumbnails[index])
      }
    }
  }
  function initThumbnails() {
    const height = 200 / (videoWidth / videoHeight)
    if (!isNaN(height)) {
      thumbnailData.interval = duration / 300 < 5 ? 5 : duration / 300
      thumbnailData.canvas.height = height
    }
  }

  function finishThumbnails() {
    const t0 = performance.now()
    const video = document.createElement('video')
    let index = 0
    video.preload = 'none'
    video.volume = 0
    video.playbackRate = 0
    video.addEventListener('loadeddata', () => loadTime())
    video.addEventListener('canplay', () => {
      createThumbnail(thumbnailData.video)
      loadTime()
    })
    thumbnailData.video = video
    const loadTime = () => {
      while (thumbnailData.thumbnails[index] && index <= Math.floor(thumbnailData.video.duration / thumbnailData.interval)) {
        // only create thumbnails that are missing
        index++
      }
      if (thumbnailData.video?.currentTime !== thumbnailData.video?.duration && thumbnailData.video) {
        thumbnailData.video.currentTime = index * thumbnailData.interval
      } else {
        thumbnailData.video?.removeAttribute('src')
        thumbnailData.video?.load()
        thumbnailData.video?.remove()
        delete thumbnailData.video
        console.log('Thumbnail creating finished', index, toTS((performance.now() - t0) / 1000))
      }
      index++
    }
    thumbnailData.video.src = current.url
    thumbnailData.video.load()
    console.log('Thumbnail creating started')
  }

  const isWindows = navigator.appVersion.includes('Windows')
  let innerWidth, innerHeight, videoWidth, videoHeight
  let menubarOffset = 0
  // $: calcMenubarOffset(innerWidth, innerHeight, videoWidth, videoHeight)
  function calcMenubarOffset(innerWidth, innerHeight, videoWidth, videoHeight) {
    // outerheight resize and innerheight resize is mutual, additionally update on metadata and app state change
    if (videoWidth && videoHeight) {
      // so windows is very dumb, and calculates windowed mode as if it was window XP, with the old bars, but not when maximised
      const isMaximised = screen.availWidth === window.outerWidth && screen.availHeight === window.outerHeight
      const menubar = Math.max(0, isWindows && !isMaximised ? window.outerHeight - innerHeight - 8 : window.outerHeight - innerHeight)
      // element ratio calc
      const videoRatio = videoWidth / videoHeight
      const { offsetWidth, offsetHeight } = video
      const elementRatio = offsetWidth / offsetHeight
      // video is shorter than element && has space for menubar offset
      if (!document.fullscreenElement && menubar && elementRatio <= videoRatio && offsetHeight - offsetWidth / videoRatio > menubar) {
        menubarOffset = (menubar / 2) * -1
      } else {
        menubarOffset = 0
      }
    }
  }

  function toggleDropdown({ target }) {
    target.classList.toggle('active')
    target.closest('.dropdown').classList.toggle('show')
  }

  let completed = false
  function checkCompletion() {
    if (!completed && duration - 180 < currentTime) {
      if (fileMedia?.media?.episodes || fileMedia?.media?.nextAiringEpisode?.episode) {
        if (fileMedia.media.episodes || fileMedia.media.nextAiringEpisode?.episode > fileMedia.episodeNumber) {
          completed = true
          alEntry(fileMedia)
        }
      }
    }
  }
  const torrent = {}
  function updateStats() {
    torrent.peers = (client?.torrents.length && client?.torrents[0].numPeers) || 0
    torrent.up = (client?.torrents.length && client?.torrents[0].uploadSpeed) || 0
    torrent.down = (client?.torrents.length && client?.torrents[0].downloadSpeed) || 0
  }
  setInterval(updateStats, 200)
</script>

<svelte:window on:keydown={handleKeydown} bind:innerWidth bind:innerHeight />
{#if showKeybinds}
  <div class="position-absolute bg-tp w-full h-full z-50 p-20 d-flex align-items-center justify-content-center" on:click|self={() => (showKeybinds = false)}>
    <button class="close" type="button" on:click={() => (showKeybinds = false)}><span>×</span></button>
    <Keyboard />
  </div>
{/if}
<!-- svelte-ignore a11y-media-has-caption -->
{#if files?.length}
  <div
    class="player w-full h-full d-flex flex-column overflow-hidden"
    class:pointer={miniplayer}
    class:miniplayer
    class:pip
    class:immersed
    class:buffering
    bind:this={container}
    on:mousemove={resetImmerse}
    on:touchmove={resetImmerse}
    on:keypress={resetImmerse}
    on:mouseleave={immersePlayer}
    on:click={() => (page = 'player')}>
    <video
      class="position-absolute h-full w-full"
      style={`margin-top: ${menubarOffset}px`}
      autoplay
      preload="auto"
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
      on:timeupdate={() => createThumbnail()}
      on:timeupdate={checkCompletion}
      on:waiting={showBuffering}
      on:loadeddata={hideBuffering}
      on:canplay={hideBuffering}
      on:playing={hideBuffering}
      on:loadedmetadata={hideBuffering}
      on:loadedmetadata={getFPS}
      on:loadedmetadata={initThumbnails}
      on:leavepictureinpicture={() => (pip = false)} />
    {#if stats}
      <div class="position-absolute top-0 bg-tp p-10 m-15 text-monospace rounded z-50">
        <button class="close" type="button" on:click={toggleStats}><span>×</span></button>
        FPS: {stats.fps}<br />
        Presented frames: {stats.presented}<br />
        Dropped frames: {stats.dropped}<br />
        Frame time: {stats.processing}<br />
        Viewport: {stats.viewport}<br />
        Resolution: {stats.resolution}<br />
        Buffer health: {stats.buffer || 0}
      </div>
    {/if}
    <div class="top z-40 d-flex justify-content-between">
      <div />
      <div class="d-flex">
        <span class="material-icons" data-name="peers"> people </span>
        <span class="stats">{torrent.peers}</span>
        <span class="material-icons"> arrow_downward </span>
        <span class="stats">{fastPrettyBytes(torrent.up)}/s</span>
        <span class="material-icons"> arrow_upward </span>
        <span class="stats">{fastPrettyBytes(torrent.down)}/s</span>
      </div>
      <span class="material-icons ctrl font-size-12 p-10" title="Keybinds [`]" data-name="togglePopout" on:click={() => (showKeybinds = true)}> help_outline </span>
    </div>
    <div class="middle d-flex align-items-center justify-content-center flex-grow-1 z-40 position-relative">
      <div class="position-absolute w-full h-full" on:dblclick={toggleFullscreen}>
        <div class="play-overlay w-full h-full" on:click={playPause} />
      </div>
      {#if videos?.length > 1}
        <span class="material-icons ctrl" data-name="playLast" on:click={playLast}> skip_previous </span>
      {/if}
      <span class="material-icons ctrl" data-name="rewind" on:click={rewind}> fast_rewind </span>
      <span class="material-icons ctrl" data-name="playPause" on:click={playPause}> {ended ? 'replay' : paused ? 'play_arrow' : 'pause'} </span>
      <span class="material-icons ctrl" data-name="forward" on:click={forward}> fast_forward </span>
      {#if videos?.length > 1}
        <span class="material-icons ctrl" data-name="playNext" on:click={playNext}> skip_next </span>
      {/if}
      <div data-name="bufferingDisplay" class="position-absolute" />
    </div>
    <div class="bottom d-flex z-40">
      <span class="material-icons ctrl" title="Play/Pause [Space]" data-name="playPause" on:click={playPause}> {ended ? 'replay' : paused ? 'play_arrow' : 'pause'} </span>
      {#if videos?.length > 1}
        <span class="material-icons ctrl" title="Next [N]" data-name="playNext" on:click={playNext}> skip_next </span>
      {/if}
      <div class="d-flex w-auto volume">
        <span class="material-icons ctrl" title="Mute [M]" data-name="toggleMute" on:click={toggleMute}> {muted ? 'volume_off' : 'volume_up'} </span>
        <input class="ctrl" type="range" min="0" max="1" step="any" data-name="setVolume" bind:value={volume} style="--value: {volume * 100}%" />
      </div>
      <!-- svelte-ignore missing-declaration -->
      {#if 'audioTracks' in HTMLVideoElement.prototype && video?.audioTracks?.length > 1}
        <div class="audio-tracks dropdown dropup with-arrow" on:click={toggleDropdown}>
          <span class="material-icons ctrl" title="Audio Tracks" id="baudio" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-name="audioButton">
            queue_music
          </span>
          <div class="dropdown-menu dropdown-menu-left ctrl custom-radio p-10 pb-5 text-capitalize" aria-labelledby="baudio" data-name="selectAudio">
            {#each video.audioTracks as track}
              <input name="audio-radio-set" type="radio" id="audio-{track.id}-radio" value={track.id} checked={track.enabled} />
              <label for="audio-{track.id}-radio" on:click={() => selectAudio(track.id)} class="text-truncate pb-5">
                {(track.language || (!Object.values(video.audioTracks).some(track => track.language === 'eng' || track.language === 'en') ? 'eng' : track.label)) +
                  (track.label ? ' - ' + track.label : '')}</label>
            {/each}
          </div>
        </div>
      {/if}
      <div class="w-full d-flex align-items-center" data-name="progressWrapper">
        <div class="ts">{toTS(targetTime, duration > 3600 ? 2 : 3)}</div>
        <div class="w-full h-full position-relative">
          <input
            class="ctrl w-full h-full"
            type="range"
            min="0"
            max="1"
            step="any"
            data-name="setProgress"
            bind:value={progress}
            on:mousedown={handleMouseDown}
            on:mouseup={handleMouseUp}
            on:mousemove={handleHover}
            on:input={handleProgress}
            on:touchstart={handleMouseDown}
            on:touchend={handleMouseUp}
            style="--value: {progress * 100}%" />
          <div class="hover position-absolute d-flex flex-column align-items-center" bind:this={hover}>
            <img alt="thumbnail" class="w-full mb-5 shadow-lg" src={thumbnail} />
            <div class="ts">{toTS(hoverTime)}</div>
          </div>
        </div>
        <div class="ts">{toTS(duration - targetTime, duration > 3600 ? 2 : 3)}</div>
      </div>
      {#if subHeaders?.length}
        <div class="subtitles dropdown dropup with-arrow" on:click={toggleDropdown}>
          <span class="material-icons ctrl" title="Subtitles [C]" id="bcap" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-name="captionsButton">
            subtitles
          </span>
          <div class="dropdown-menu dropdown-menu-right ctrl custom-radio p-10 pb-5 text-capitalize w-200" aria-labelledby="bcap" data-name="selectCaptions">
            <input name="subtitle-radio-set" type="radio" id="subtitle-off-radio" value="off" checked={subHeaders && subs?.current === -1} />
            <label for="subtitle-off-radio" on:click={() => subs.selectCaptions(-1)} class="text-truncate pb-5"> OFF </label>
            {#each subHeaders as track}
              {#if track}
                <input name="subtitle-radio-set" type="radio" id="subtitle-{track.number}-radio" value={track.numer} checked={track.number === subs.current} />
                <label for="subtitle-{track.nubmer}-radio" on:click={() => subs.selectCaptions(track.number)} class="text-truncate pb-5">
                  {(track.language || (!Object.values(subs.headers).some(header => header.language === 'eng' || header.language === 'en') ? 'eng' : track.type)) +
                    (track.name ? ' - ' + track.name : '')}
                </label>
              {/if}
            {/each}
            <input type="number" step="0.1" bind:value={subDelay} class="form-control text-right form-control-sm" />
          </div>
        </div>
      {/if}
      <!-- svelte-ignore missing-declaration -->
      {#if 'PresentationRequest' in window && canCast && current}
        <span class="material-icons ctrl" title="Cast Video [D]" data-name="toggleCast" on:click={toggleCast}>
          {presentationConnection ? 'cast_connected' : 'cast'}
        </span>
      {/if}
      {#if 'pictureInPictureEnabled' in document}
        <span class="material-icons ctrl" title="Popout Window [P]" data-name="togglePopout" on:click={togglePopout}>
          {pip ? 'featured_video' : 'picture_in_picture'}
        </span>
      {/if}
      <span class="material-icons ctrl" title="Fullscreen [F]" data-name="toggleFullscreen" on:click={toggleFullscreen}>
        {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
      </span>
    </div>
  </div>
{/if}

<style>
  .stats {
    font-size: 1.8rem !important;
    white-space: nowrap;
    align-self: center;
    font-weight: 600;
    font-family: Roboto, Arial, Helvetica, sans-serif;
  }
  .miniplayer {
    transition: width 0.2s ease;
    width: 25vw !important;
    height: auto !important;
    bottom: 2rem;
    right: 2rem;
    z-index: 5;
    position: absolute !important;
  }
  .miniplayer .top,
  .miniplayer .middle,
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
    background: #000;
    will-change: width;
  }

  .pip :global(canvas) {
    left: 99.9% !important;
    /*hack to hide the canvas but still keep it updating*/
  }

  .material-icons {
    font-size: 2.2rem;
    padding: 1.2rem;
    transition: all 0.2s ease;
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
  :fullscreen .ctrl[data-name='toggleCast'],
  :fullscreen .ctrl[data-name='togglePopout'] {
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

  @media (pointer: none), (pointer: coarse) {
    .middle .ctrl {
      display: flex;
    }
    .middle .play-overlay {
      display: none !important;
    }
  }

  .middle .ctrl[data-name='playPause'] {
    font-size: 6rem;
  }

  .middle .ctrl,
  .bottom .ctrl:hover,
  .bottom .ts:hover,
  .bottom .hover .ts {
    filter: drop-shadow(0 0 8px #000);
  }

  .bottom {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4) 25%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.1) 75%, transparent);
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
  .bottom .volume:hover input[type='range'] {
    width: 5vw;
    display: inline-block;
    transition: all 0.1s ease;
    margin-right: 1rem;
  }

  .bottom .volume input[type='range'] {
    width: 0;
    transition: all 0.1s ease;
    height: 100%;
  }

  .bottom [data-name='setProgress'] ~ .hover {
    pointer-events: none;
    opacity: 0;
    top: 1.2rem;
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

  .bottom div[data-name='progressWrapper'] .ts {
    color: #ececec;
    font-size: 1.8rem !important;
    white-space: nowrap;
    align-self: center;
    line-height: var(--base-line-height);
    padding: 0 1.2rem;
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

  /* Radio debloat for halfmoon */
  .custom-radio {
    display: flex;
    flex-direction: column;
  }
  .custom-radio label {
    position: relative;
  }
  .custom-radio input[type='radio']:hover + label:before {
    background-color: var(--lm-radio-bg-color-hover);
    border-color: var(--lm-radio-border-color-hover);
  }
  .custom-radio input[type='radio']:focus + label:before {
    border-color: var(--lm-radio-border-color-focus);
    -moz-box-shadow: var(--lm-radio-box-shadow-focus);
    -webkit-box-shadow: var(--lm-radio-box-shadow-focus);
    box-shadow: var(--lm-radio-box-shadow-focus);
  }
  .custom-radio input[type='radio']:checked + label:before {
    background-color: var(--lm-radio-bg-color-checked);
    border-color: var(--lm-radio-border-color-checked);
  }
  .custom-radio input[type='radio']:checked:focus + label:before {
    border-color: var(--lm-radio-border-color-checked-focus);
    -moz-box-shadow: var(--lm-radio-box-shadow-checked-focus);
    -webkit-box-shadow: var(--lm-radio-box-shadow-checked-focus);
    box-shadow: var(--lm-radio-box-shadow-checked-focus);
  }
  .dark-mode .custom-radio label:before {
    background-color: var(--dm-radio-bg-color);
    border-color: var(--dm-radio-border-color);
  }
  .dark-mode .custom-radio input[type='radio']:hover + label:before {
    background-color: var(--dm-radio-bg-color-hover);
    border-color: var(--dm-radio-border-color-hover);
  }
  .dark-mode .custom-radio input[type='radio']:focus + label:before {
    border-color: var(--dm-radio-border-color-focus);
    -moz-box-shadow: var(--dm-radio-box-shadow-focus);
    -webkit-box-shadow: var(--dm-radio-box-shadow-focus);
    box-shadow: var(--dm-radio-box-shadow-focus);
  }
  .dark-mode .custom-radio input[type='radio']:checked + label:before {
    background-color: var(--dm-radio-bg-color-checked);
    border-color: var(--dm-radio-border-color-checked);
  }
  .dark-mode .custom-radio input[type='radio']:checked:focus + label:before {
    border-color: var(--dm-radio-border-color-checked-focus);
    -moz-box-shadow: var(--dm-radio-box-shadow-checked-focus);
    -webkit-box-shadow: var(--dm-radio-box-shadow-checked-focus);
    box-shadow: var(--dm-radio-box-shadow-checked-focus);
  }
  .custom-radio label:after {
    content: '';
    position: absolute;
    display: none;
    top: var(--radio-checkmark-top);
    left: var(--radio-checkmark-left);
    width: var(--radio-checkmark-width-height);
    height: var(--radio-checkmark-width-height);
    background-color: var(--lm-radio-checkmark-color);
    border-radius: var(--radio-checkmark-border-radius);
  }
  .custom-radio input[type='radio']:checked + label:after {
    display: block;
  }
  .custom-radio input[type='radio']:disabled + label {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .custom-radio input[type='radio']:disabled + label:before,
  .custom-radio input[type='radio']:hover:disabled + label:before {
    background-color: var(--lm-radio-bg-color);
    border-color: var(--lm-radio-border-color);
  }
  .custom-radio input[type='radio']:disabled:checked + label:before,
  .custom-radio input[type='radio']:hover:disabled:checked + label:before {
    background-color: var(--lm-radio-bg-color-checked);
    border-color: var(--lm-radio-border-color-checked);
  }
  .dark-mode .custom-radio input[type='radio']:disabled + label:before,
  .dark-mode .custom-radio input[type='radio']:hover:disabled + label:before {
    background-color: var(--dm-radio-bg-color);
    border-color: var(--dm-radio-border-color);
  }
  .dark-mode .custom-radio input[type='radio']:disabled:checked + label:before,
  .dark-mode .custom-radio input[type='radio']:hover:disabled:checked + label:before {
    background-color: var(--dm-radio-bg-color-checked);
    border-color: var(--dm-radio-border-color-checked);
  }
</style>
