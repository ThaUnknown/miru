class TorrentPlayer extends WebTorrent {
  constructor (options = {}) {
    super(options.WebTorrentOpts)

    this.worker = navigator.serviceWorker.register('sw.js', { scope: '/app/' }).then(() => {
      if (searchParams.get('file')) addTorrent(searchParams.get('file'), {}) // add a torrent if its in the link params
    }).catch(e => {
      if (String(e) === 'InvalidStateError: Failed to register a ServiceWorker: The document is in an invalid state.') {
        location.reload() // weird workaround for a weird bug
      } else {
        throw e
      }
    })
    window.addEventListener('beforeunload', () => {
      this.cleanupVideo()
      this.cleanupTorrents()
    })
    // kind of a fetch event from service worker but for the main thread.
    navigator.serviceWorker.addEventListener('message', evt => {
      let [infoHash, ...filePath] = evt.data.url.split(evt.data.scope + 'webtorrent/')[1].split('/')
      filePath = decodeURI(filePath.join('/'))

      if (!infoHash || !filePath) return

      const [port] = evt.ports
      const [response, stream] = this.serveFile(this.get(infoHash).files.find(file => file.path === filePath), new Request(evt.data.url, {
        headers: evt.data.headers,
        method: evt.data.method
      }))
      const asyncIterator = stream && stream[Symbol.asyncIterator]()
      port.postMessage(response)

      port.onmessage = async msg => {
        if (msg.data) {
          const chunk = (await asyncIterator.next()).value
          port.postMessage(chunk)
          if (!chunk) port.onmessage = null
        } else {
          console.log('Closing stream')
          stream.destroy()
          port.onmessage = null
        }
      }
    })

    this.video = options.video
    this.controls = options.controls // object of controls
    // playPause, playNext, openPlaylist, toggleMute, setVolume, setProgress, showCaptions, showAudio, toggleTheatre, toggleFullscreen, togglePopout, downloadFile

    this.controls.setVolume.addEventListener('input', (e) => this.setVolume(e.target.value))
    this.setVolume()
    this.controls.ppToggle.addEventListener('click', () => this.playPause())
    this.oldVolume = undefined

    this.controls.setProgress.addEventListener('input', (e) => this.setProgress(e.target.value))
    this.controls.setProgress.addEventListener('mouseup', (e) => this.dragBarEnd(e.target.value))
    this.controls.setProgress.addEventListener('thouchend', (e) => this.dragBarEnd(e.target.value))
    this.controls.setProgress.addEventListener('mousedown', (e) => this.dragBarStart(e.target.value))
    this.video.addEventListener('timeupdate', (e) => {
      if (this.immerseTimeout && document.location.hash === '#player' && !this.video.paused) this.setProgress(e.target.currentTime / e.target.duration * 100)
    })
    this.video.addEventListener('ended', () => this.setProgress(100))

    this.player = options.player
    this.playerWrapper = options.playerWrapper
    this.player.addEventListener('fullscreenchange', () => this.updateFullscreen())
    this.controls.ppToggle.addEventListener('dblclick', () => this.toggleFullscreen())

    this.video.addEventListener('loadedmetadata', () => this.findSubtitleFiles(this.currentFile))
    this.subtitleData = {
      fonts: ['https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2'],
      headers: [],
      tracks: [],
      current: undefined,
      renderer: undefined,
      stream: undefined,
      parser: undefined,
      parsed: undefined,
      timeout: undefined,
      defaultHeader: `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${options.defaultSSAStyles || 'Roboto Medium,26,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,0,0,0,0,100,100,0,0,1,1.3,0,2,20,20,23,1'}
[Events]

`
    }
    if ('audioTracks' in HTMLVideoElement.prototype) {
      this.video.addEventListener('loadedmetadata', () => {
        if (this.video.audioTracks.length > 1) {
          this.controls.audioButton.removeAttribute('disabled')
          for (const track of this.video.audioTracks) {
            this.createRadioElement(track, 'audio')
          }
        } else {
          this.controls.audioButton.setAttribute('disabled', '')
        }
      })
    }

    this.completed = false
    this.onWatched = options.onWatched
    if (this.onWatched) this.video.addEventListener('timeupdate', () => this.checkCompletion())

    this.onPlaylist = options.onPlaylist

    this.onNext = options.onNext
    this.nextTimeout = undefined
    if (this.onNext && options.autoNext) this.video.addEventListener('ended', () => this.onNext())

    this.resolveFileMedia = options.resolveFileMedia
    this.currentFile = undefined
    this.videoFile = undefined

    this.generateThumbnails = options.generateThumbnails
    const thumbCanvas = document.createElement('canvas')
    thumbCanvas.width = options.thumbnailWidth || 150
    this.thumbnailData = {
      thumbnails: [],
      canvas: thumbCanvas,
      context: thumbCanvas.getContext('2d'),
      interval: undefined,
      video: undefined
    }
    this.video.addEventListener('loadedmetadata', () => this.initThumbnail())
    this.video.addEventListener('timeupdate', () => this.createThumbnail(this.video))

    if (options.visibilityLossPause) {
      document.addEventListener('visibilitychange', () => {
        if (!this.video.ended) document.visibilityState === 'hidden' ? this.video.pause() : this.playPause()
      })
    }

    this.onDownloadDone = options.onDownloadDone
    this.onDone = undefined

    this.immerseTimeout = undefined
    this.immerseTime = options.immerseTime || 5
    this.player.addEventListener('mousemove', () => requestAnimationFrame(() => this.resetImmerse()))
    this.player.addEventListener('keypress', () => requestAnimationFrame(() => this.resetImmerse()))
    this.player.addEventListener('mouseleave', () => requestAnimationFrame(() => this.immersePlayer()))

    this.bufferTimeout = undefined
    this.video.addEventListener('playing', () => this.hideBuffering())
    this.video.addEventListener('canplay', () => this.hideBuffering())
    this.video.addEventListener('timeupdate', () => this.hideBuffering())
    this.video.addEventListener('waiting', () => this.showBuffering())

    if ('pictureInPictureEnabled' in document) {
      this.burnIn = options.burnIn
      this.controls.togglePopout.removeAttribute('disabled')
      if (this.burnIn) this.video.addEventListener('enterpictureinpicture', () => { if (this.subtitleData.renderer) this.togglePopout() })
    } else {
      this.video.setAttribute('disablePictureInPicture', '')
      this.controls.togglePopout.setAttribute('disabled', '')
    }

    this.seekTime = options.seekTime || 5
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.playPause())
      navigator.mediaSession.setActionHandler('pause', () => this.playPause())
      navigator.mediaSession.setActionHandler('seekbackward', () => this.seek(seekTime))
      navigator.mediaSession.setActionHandler('seekforward', () => this.seek(seekTime))
      navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext())
    }
    if ('setPositionState' in navigator.mediaSession) this.video.addEventListener('timeupdate', () => this.updatePositionState())

    this.subtitleExtensions = ['.srt', '.vtt', '.ass', '.ssa']
    this.videoExtensions = ['.3g2', '.3gp', '.asf', '.avi', '.dv', '.flv', '.gxf', '.m2ts', '.m4a', '.m4b', '.m4p', '.m4r', '.m4v', '.mkv', '.mov', '.mp4', '.mpd', '.mpeg', '.mpg', '.mxf', '.nut', '.ogm', '.ogv', '.swf', '.ts', '.vob', '.webm', '.wmv', '.wtv']
    this.videoFiles = undefined

    this.updateDisplay()
    this.offlineTorrents = JSON.parse(localStorage.getItem('offlineTorrents')) || {}
    // adds all offline store torrents to the client
    Object.values(this.offlineTorrents).forEach(torrentID => this.offlineDownload(new Blob([new Uint8Array(torrentID)]), true))

    this.streamedDownload = options.streamedDownload

    this.fps = 23.976
    this.video.addEventListener('loadedmetadata', () => {
      if (this.currentFile.name.endsWith('.mkv') || this.currentFile.name.endsWith('.webm')) {
        this.fps = new Promise((resolve, reject) => {
          if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
            this.video.onplay = () => {
              setTimeout(() => this.video.requestVideoFrameCallback((now, metaData) => {
                let duration = 0
                for (let index = this.video.played.length; index--;) {
                  duration += this.video.played.end(index) - this.video.played.start(index)
                }
                const rawFPS = metaData.presentedFrames / duration
                console.log(rawFPS, metaData)
                if (rawFPS < 28) {
                  resolve(23.976)
                } else if (rawFPS <= 35) {
                  resolve(29.97)
                } else if (rawFPS <= 70) {
                  resolve(59.94)
                } else {
                  resolve(23.976) // smth went VERY wrong
                }
              }), 2000)
              this.video.onplay = undefined
            }
            this.playVideo()
          } else {
            setTimeout(() => {
              resolve(23.976)
            }, 2000)
          }
        })
      }
    })

    for (const [key, value] of Object.entries(this.controls)) {
      if (this[key]) {
        value.addEventListener('click', (e) => {
          this[key](e.target.value)
        })
      }
    }
    document.addEventListener('keydown', a => {
      if (a.key === 'F5') {
        a.preventDefault()
      }
      if (document.location.hash === '#player') {
        switch (a.key) {
          case ' ':
            this.playPause()
            break
          case 'n':
            this.playNext()
            break
          case 'm':
            this.toggleMute()
            break
          case 'p':
            this.togglePopout()
            break
          case 't':
            this.toggleTheatre()
            break
          case 'c':
            this.captions()
            break
          case 'f':
            this.toggleFullscreen()
            break
          case 's':
            this.seek(85)
            break
          case 'ArrowLeft':
            this.seek(-this.seekTime)
            break
          case 'ArrowRight':
            this.seek(this.seekTime)
            break
          case 'ArrowUp':
            this.setVolume(Number(this.controls.setVolume.value) + 5)
            break
          case 'ArrowDown':
            this.setVolume(Number(this.controls.setVolume.value) - 5)
            break
          case 'Escape':
            document.location.hash = '#home'
            break
        }
      }
    })
  }

  serveFile (file, req) {
    const res = {
      status: 200,
      headers: {
        'Content-Type': file._getMimeType(),
        // Support range-requests
        'Accept-Ranges': 'bytes'
      }
    }

    // `rangeParser` returns an array of ranges, or an error code (number) if
    // there was an error parsing the range.
    let range = rangeParser(file.length, req.headers.get('range') || '')

    if (Array.isArray(range)) {
      res.status = 206 // indicates that range-request was understood

      // no support for multi-range request, just use the first range
      range = range[0]

      res.headers['Content-Range'] = `bytes ${range.start}-${range.end}/${file.length}`
      res.headers['Content-Length'] = `${range.end - range.start + 1}`
    } else {
      range = null
      res.headers['Content-Length'] = file.length
    }

    res.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    res.headers.Expires = '0'
    res.body = req.method === 'HEAD' ? '' : 'stream'
    // parser is really a passthrough mkv stream now
    const stream = file.createReadStream(range)
    if ((file.name.endsWith('.mkv') || file.name.endsWith('.webm')) && !this.subtitleData.parsed) {
      this.subtitleData.stream = new MatroskaSubtitles.SubtitleStream(this.subtitleData.stream)
      this.handleSubtitleParser(this.subtitleData.stream)
      stream.pipe(this.subtitleData.stream)
    }

    return [res, req.method === 'GET' && (this.subtitleData.stream || stream)]
  }

  async buildVideo (torrent, opts) { // sets video source and creates a bunch of other media stuff
    // play wanted episode from opts, or the 1st episode, or 1st file [batches: plays wanted episode, single: plays the only episode, manually added: plays first or only file]
    if (opts.file) {
      this.currentFile = opts.file
    } else if (this.videoFiles.length > 1) {
      // TODO play selected media too!
      this.currentFile = this.videoFiles.filter(async file => await anitomyscript(file.name).then(object => Number(object.episode_number) === Number(opts.episode || 1)))[0] || this.videoFiles[0]
    } else {
      this.currentFile = this.videoFiles[0]
    }
    this.video.src = `/app/webtorrent/${torrent.infoHash}/${encodeURI(this.currentFile.path)}`
    this.video.load()

    if (this.videoFiles.length > 1) this.controls.playNext.removeAttribute('disabled')

    if (this.currentFile.done) {
      this.postDownload()
    } else {
      this.onDone = this.currentFile.on('done', () => {
        this.postDownload()
      })
    }
    // opts.media: mediaTitle, episodeNumber, episodeTitle, episodeThumbnail, mediaCover, name

    this.nowPlaying = (opts.media && this.videoFiles.length === 1) ? opts.media : await this.resolveFileMedia({ fileName: this.currentFile.name, method: 'SearchName' })

    if (this.nowPlaying) {
      navNowPlaying.classList.remove('d-none') // TODO: fix

      const episodeInfo = [this.nowPlaying.episodeNumber, this.nowPlaying.episodeTitle].filter(s => s).join(' - ')

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.nowPlaying.mediaTitle || this.nowPlaying.name || 'TorrentPlayer',
          artist: 'Episode ' + episodeInfo,
          album: this.nowPlaying.name || 'TorrentPlayer',
          artwork: [{
            src: this.nowPlaying.episodeThumbnail || this.nowPlaying.mediaCover || '',
            sizes: '256x256',
            type: 'image/jpg'
          }]
        })
      }
      if (this.nowPlaying.episodeThumbnail) this.video.poster = this.nowPlaying.episodeThumbnail
      this.controls.nowPlaying.textContent = 'EP ' + episodeInfo
      document.title = [this.nowPlaying.mediaTitle, episodeInfo ? 'EP ' + episodeInfo : false, this.nowPlaying.name || 'TorrentPlayer'].filter(s => s).join(' - ')
    }
  }

  cleanupVideo () { // cleans up objects, attemps to clear as much video caching as possible
    if (this.subtitleData.renderer) this.subtitleData.renderer.dispose()
    if (this.subtitleData.parser) this.subtitleData.parser.destroy()
    if (this.subtitleData.fonts) this.subtitleData.fonts.forEach(file => URL.revokeObjectURL(file)) // ideally this should clean up after its been downloaded by the sw renderer, but oh well
    this.controls.downloadFile.setAttribute('disabled', '')
    this.currentFile = undefined
    this.video.poster = ''
    // some attemt at cache clearing
    this.video.pause()
    this.video.src = ''
    this.video.load()
    this.onDone = undefined
    document.title = 'Miru'
    this.setProgress(0)
    // look for file and delete its store, idk how to do this
    Object.assign(this.subtitleData, {
      fonts: ['https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2'],
      headers: [],
      tracks: [],
      current: undefined,
      renderer: undefined,
      stream: undefined,
      parser: undefined,
      parsed: undefined,
      timeout: undefined
    })

    Object.assign(this.thumbnailData, {
      thumbnails: [],
      interval: undefined,
      video: undefined
    })
    this.completed = false
    this.controls.nowPlaying.textContent = ''
    this.controls.captionsButton.setAttribute('disabled', '')
    this.controls.selectCaptions.textContent = ''
    this.controls.selectAudio.textContent = ''
    this.controls.openPlaylist.setAttribute('disabled', '')
    navNowPlaying.classList.add('d-none') // TODO: fix
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = undefined
    this.fps = 23.976
  }

  async playVideo () {
    try {
      await this.video.play()
      this.controls.playPause.textContent = 'pause'
    } catch (err) {
      this.controls.playPause.textContent = 'play_arrow'
    }
  }

  playPause () {
    if (this.video.paused) {
      this.playVideo()
    } else {
      this.controls.playPause.textContent = 'play_arrow'
      this.video.pause()
    }
  }

  setVolume (volume) {
    const level = volume === undefined ? Number(this.controls.setVolume.value) : volume
    this.controls.setVolume.value = level
    this.controls.setVolume.style.setProperty('--volume-level', level + '%')
    this.controls.toggleMute.textContent = level === 0 ? 'volume_off' : 'volume_up'
    this.video.volume = level / 100
  }

  toggleMute () {
    if (this.video.volume === 0) {
      this.setVolume(this.oldVolume)
    } else {
      this.oldVolume = this.video.volume * 100
      this.setVolume(0)
    }
  }

  toggleTheatre () {
    this.playerWrapper.classList.toggle('nav-hidden')
  }

  toggleFullscreen () {
    document.fullscreenElement ? document.exitFullscreen() : this.player.requestFullscreen()
  }

  updateFullscreen () {
    this.controls.toggleFullscreen.textContent = document.fullscreenElement ? 'fullscreen_exit' : 'fullscreen'
  }

  openPlaylist () {
    if (this.onPlaylist) this.onPlaylist()
  }

  playNext () {
    clearTimeout(this.nextTimeout)
    this.nextTimeout = setTimeout(() => {
      if (this.videoFiles?.indexOf(this.currentFile) < this.videoFiles?.length) {
        const nowPlaying = this.nowPlaying
        nowPlaying.episodeNumber += 1
        const torrent = this.currentFile._torrent
        this.cleanupVideo()
        this.buildVideo(torrent, { media: nowPlaying, file: this.videoFiles[this.videoFiles.indexOf(this.currentFile) + 1] })
      } else {
        if (this.onNext) this.onNext()
      }
    }, 200)
  }

  async togglePopout () {
    if (this.video.readyState) {
      if (!(this.burnIn && this.subtitleData.renderer)) {
        this.video !== document.pictureInPictureElement ? await this.video.requestPictureInPicture() : await document.exitPictureInPicture()
      } else {
        if (document.pictureInPictureElement && !document.pictureInPictureElement.id) { // only exit if pip is the custom one, else overwrite existing pip with custom
          await document.exitPictureInPicture()
        } else {
          const canvas = document.createElement('canvas')
          const canvasVideo = document.createElement('video')
          const context = canvas.getContext('2d', { alpha: false })
          const subtitleCanvas = this.subtitleData.renderer.canvas
          let running = true
          canvas.width = this.video.videoWidth
          canvas.height = this.video.videoHeight

          const renderFrame = () => {
            if (running === true) {
              context.drawImage(this.video, 0, 0)
              context.drawImage(subtitleCanvas, 0, 0, canvas.width, canvas.height)
              requestAnimationFrame(renderFrame)
            }
          }
          canvasVideo.srcObject = canvas.captureStream()
          canvasVideo.onloadedmetadata = () => {
            canvasVideo.play()
            canvasVideo.requestPictureInPicture().then(
              this.player.classList.add('pip')
            ).catch(e => {
              console.warn('Failed To Burn In Subtitles ' + e)
              running = false
              canvasVideo.remove()
              canvas.remove()
              this.player.classList.remove('pip')
            })
          }
          canvasVideo.onleavepictureinpicture = () => {
            running = false
            canvasVideo.remove()
            canvas.remove()
            this.player.classList.remove('pip')
          }
          requestAnimationFrame(renderFrame)
        }
      }
    }
  }

  toTS (sec, full) {
    if (isNaN(sec) || sec < 0) {
      return full ? '0:00:00.00' : '00:00'
    }
    const hours = Math.floor(sec / 3600)
    let minutes = Math.floor(sec / 60) - (hours * 60)
    let seconds = full ? (sec % 60).toFixed(2) : Math.floor(sec % 60)
    if (minutes < 10) minutes = '0' + minutes
    if (seconds < 10) seconds = '0' + seconds
    return (hours > 0 || full) ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds
  }

  prettyBytes (num) {
    if (num < 1) return num + ' B'
    const units = [' B', ' kB', ' MB', ' GB', ' TB']
    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    return num + units[exponent]
  }

  seek (time) {
    if (time === 85 && this.video.currentTime < 10) {
      this.video.currentTime = 90
    } else if (time === 85 && (this.video.duration - this.video.currentTime) < 90) {
      this.video.currentTime = this.video.duration
    } else {
      this.video.currentTime += time
    }
    this.setProgress(this.video.currentTime / this.video.duration * 100)
  }

  immersePlayer () {
    this.player.classList.add('immersed')
    this.immerseTimeout = undefined
  }

  resetImmerse () {
    if (this.immerseTimeout) {
      clearTimeout(this.immerseTimeout)
    } else {
      this.player.classList.remove('immersed')
    }
    this.immerseTimeout = setTimeout(() => this.immersePlayer(), this.immerseTime * 1000)
  }

  hideBuffering () {
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout)
      this.bufferTimeout = undefined
      this.player.classList.remove('buffering')
    }
  }

  showBuffering () {
    this.bufferTimeout = setTimeout(() => {
      this.player.classList.add('buffering')
      this.resetImmerse()
    }, 150)
  }

  checkCompletion () {
    if (!this.completed && this.video.duration - 180 < this.video.currentTime) {
      this.completed = true
      this.onWatched()
    }
  }

  updatePositionState () {
    if (this.video.duration) {
      navigator.mediaSession.setPositionState({
        duration: this.video.duration || 0,
        playbackRate: this.video.playbackRate || 0,
        position: this.video.currentTime || 0
      })
    }
  }

  initThumbnail () {
    const height = this.thumbnailData.canvas.width / (this.video.videoWidth / this.video.videoHeight)
    this.thumbnailData.interval = this.video.duration / 300 < 5 ? 5 : this.video.duration / 300
    this.thumbnailData.canvas.height = height
    this.controls.thumbnail.style.setProperty('height', height + 'px')
  }

  createThumbnail (video) {
    if (video?.readyState >= 2) {
      const index = Math.floor(video.currentTime / this.thumbnailData.interval)
      if (!this.thumbnailData.thumbnails[index]) {
        this.thumbnailData.context.fillRect(0, 0, 150, this.thumbnailData.canvas.height)
        this.thumbnailData.context.drawImage(video, 0, 0, 150, this.thumbnailData.canvas.height)
        this.thumbnailData.thumbnails[index] = this.thumbnailData.canvas.toDataURL('image/jpeg')
      }
    }
  }

  finishThumbnails (src) {
    const t0 = performance.now()
    const video = document.createElement('video')
    let index = 0
    video.preload = 'none'
    video.volume = 0
    video.playbackRate = 0
    video.addEventListener('loadeddata', () => loadTime())
    video.addEventListener('canplay', () => {
      this.createThumbnail(this.thumbnailData.video)
      loadTime()
    })
    this.thumbnailData.video = video
    const loadTime = () => {
      while (this.thumbnailData.thumbnails[index] && index <= Math.floor(this.thumbnailData.video.duration / this.thumbnailData.interval)) { // only create thumbnails that are missing
        index++
      }
      if (this.thumbnailData.video?.currentTime !== this.thumbnailData.video?.duration) {
        this.thumbnailData.video.currentTime = index * this.thumbnailData.interval
      } else {
        this.thumbnailData.video?.removeAttribute('src')
        this.thumbnailData.video?.load()
        this.thumbnailData.video?.remove()
        delete this.thumbnailData.video
        console.log('Thumbnail creating finished', index, this.toTS((performance.now() - t0) / 1000))
      }
      index++
    }
    this.thumbnailData.video.src = src
    this.thumbnailData.video.play()
    console.log('Thumbnail creating started')
  }

  dragBarEnd (progressPercent) {
    this.video.currentTime = this.video.duration * progressPercent / 100 || 0
    this.playVideo()
  }

  async dragBarStart (progressPercent) {
    await this.video.pause()
    this.setProgress(progressPercent)
  }

  setProgress (progressPercent) {
    progressPercent = progressPercent || 0
    const currentTime = this.video.duration * progressPercent / 100 || 0
    this.controls.progressWrapper.style.setProperty('--progress', progressPercent + '%')
    this.controls.thumbnail.src = this.thumbnailData.thumbnails[Math.floor(currentTime / this.thumbnailData.interval)] || ' '
    this.controls.setProgress.dataset.elapsed = this.toTS(currentTime)
    this.controls.progressWrapper.dataset.elapsed = this.toTS(currentTime)
    this.controls.progressWrapper.dataset.remaining = this.toTS(this.video.duration - currentTime)
    this.controls.setProgress.value = progressPercent
  }

  updateDisplay () {
    if (this.currentFile && this.currentFile._torrent) {
      this.player.style.setProperty('--download', this.currentFile.progress * 100 + '%')
      this.controls.peers.dataset.value = this.currentFile._torrent.numPeers
      this.controls.downSpeed.dataset.value = this.prettyBytes(this.currentFile._torrent.downloadSpeed) + '/s'
      this.controls.upSpeed.dataset.value = this.prettyBytes(this.currentFile._torrent.uploadSpeed) + '/s'
    }
    setTimeout(() => requestAnimationFrame(() => this.updateDisplay()), 200)
  }

  createRadioElement (track, type) {
    // type: captions audio
    const frag = document.createDocumentFragment()
    const input = document.createElement('input')
    const label = document.createElement('label')
    input.name = `${type}-radio-set`
    input.type = 'radio'
    input.id = type === 'captions' ? `${type}-${track ? track.number : 'off'}-radio` : `${type}-${track.id}-radio`
    input.value = type === 'captions' ? track ? track.number : -1 : track.id
    input.checked = type === 'captions' ? track?.number === this.subtitleData.current : track.enabled
    label.htmlFor = type === 'captions' ? `${type}-${track ? track.number : 'off'}-radio` : `${type}-${track.id}-radio`
    label.textContent = track
      ? type === 'captions'
          ? (track.language || (!Object.values(this.subtitleData.headers).some(header => header.language === 'eng' || header.language === 'en') ? 'eng' : header.type)) + (track.name ? ' - ' + track.name : '')
          : (track.language || (!Object.values(this.video.audioTracks).some(track => track.language === 'eng' || track.language === 'en') ? 'eng' : track.label)) + (track.label ? ' - ' + track.label : '')
      : 'OFF' // TODO: clean this up, TLDR assume english track if track lang is undefined || 'und' and there isnt an existing eng track already
    frag.appendChild(input)
    frag.appendChild(label)
    if (type === 'captions') {
      this.controls.selectCaptions.appendChild(frag)
      this.controls.captionsButton.removeAttribute('disabled')
    } else {
      this.controls.selectAudio.appendChild(frag)
    }
  }

  selectAudio (id) {
    if (id !== undefined) {
      for (const track of this.video.audioTracks) {
        track.id === id ? track.enabled = true : track.enabled = false
      }
      this.seek(-0.5) // stupid fix because video freezes up when chaging tracks
    }
  }

  selectCaptions (trackNumber) {
    if (trackNumber !== undefined) {
      trackNumber = Number(trackNumber)
      this.subtitleData.current = trackNumber
      if (!this.subtitleData.timeout) {
        this.subtitleData.timeout = setTimeout(() => {
          this.subtitleData.timeout = undefined
          if (this.subtitleData.renderer) {
            this.subtitleData.renderer.setTrack(trackNumber !== -1 ? this.subtitleData.headers[trackNumber].header.slice(0, -1) + Array.from(this.subtitleData.tracks[trackNumber]).join('\n') : this.subtitleData.defaultHeader)
          }
        }, 1000)
      }
    }
  }

  constructSub (subtitle, isNotAss) {
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
      subtitle.text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\\h')
    }
    return 'Dialogue: ' +
    (subtitle.layer || 0) + ',' +
    this.toTS(subtitle.time / 1000, true) + ',' +
    this.toTS((subtitle.time + subtitle.duration) / 1000, true) + ',' +
    (subtitle.style || 'Default') + ',' +
    (subtitle.name || '') + ',' +
    (subtitle.marginL || '0') + ',' +
    (subtitle.marginR || '0') + ',' +
    (subtitle.marginV || '0') + ',' +
    (subtitle.effect || '') + ',' +
    subtitle.text || ''
  }

  async parseSubtitles (file) { // parse subtitles fully after a download is finished
    return new Promise((resolve, reject) => {
      if (file.name.endsWith('.mkv') || file.name.endsWith('.webm')) {
        let parser = new MatroskaSubtitles.SubtitleParser()
        this.handleSubtitleParser(parser, true)
        parser.on('finish', () => {
          console.log('Sub parsing finished')
          this.subtitleData.parsed = true
          this.subtitleData.stream = undefined
          this.subtitleData.parser.destroy()
          this.selectCaptions(this.subtitleData.current)
          parser = undefined
          if (!this.video.paused) {
            this.video.pause()
            this.playVideo()
          }
          resolve()
        })
        console.log('Sub parsing started')
        this.subtitleData.parser = file.createReadStream().pipe(parser)
      } else {
        resolve()
      }
    })
  }

  handleSubtitleParser (parser, skipFile) {
    parser.once('tracks', tracks => {
      tracks.forEach(track => {
        if (!this.subtitleData.tracks[track.number]) {
        // overwrite webvtt or other header with custom one
          if (track.type !== 'ass') track.header = this.subtitleData.defaultHeader
          if (!this.subtitleData.current) {
            this.subtitleData.current = track.number
            this.createRadioElement(undefined, 'captions')
          }
          this.subtitleData.tracks[track.number] = new Set()
          this.subtitleData.headers[track.number] = track
          this.createRadioElement(track, 'captions')
        }
      })
    })
    parser.on('subtitle', (subtitle, trackNumber) => {
      if (!this.subtitleData.parsed) {
        if (!this.subtitleData.renderer) this.initSubtitleRenderer()
        this.subtitleData.tracks[trackNumber].add(this.constructSub(subtitle, this.subtitleData.headers[trackNumber].type !== 'ass'))
        if (this.subtitleData.current === trackNumber) this.selectCaptions(trackNumber)
      }
    })
    if (!skipFile) {
      parser.on('file', file => {
        if (file.mimetype === 'application/x-truetype-font' || file.mimetype === 'application/font-woff') {
          this.subtitleData.fonts.push(window.URL.createObjectURL(new Blob([file.data], { type: file.mimetype })))
        }
      })
    }
  }

  async initSubtitleRenderer () {
    if (!this.subtitleData.renderer) {
      const options = {
        video: this.video,
        targetFps: await this.fps,
        subContent: this.subtitleData.headers[this.subtitleData.current].header.slice(0, -1),
        renderMode: 'offscreenCanvas',
        fonts: this.subtitleData.fonts,
        workerUrl: 'js/subtitles-octopus-worker.js',
        timeOffset: 0,
        onReady: () => { // weird hack for laggy subtitles, this is some issue in SO
          if (!this.video.paused) {
            this.video.pause()
            this.playVideo()
          }
        }
      }
      if (!this.subtitleData.renderer) {
        this.subtitleData.renderer = new SubtitlesOctopus(options)
        this.selectCaptions(this.subtitleData.current)
      }
    }
  }

  convertSubFile (file, isAss, callback) {
    const regex = /(?:\d+\n)?(\S{9,12})\s?-->\s?(\S{9,12})(.*)\n([\s\S]*)$/i
    file.getBuffer((_err, buffer) => {
      const subtitles = isAss ? buffer.toString() : []
      if (isAss) {
        callback(subtitles)
      } else {
        for (const split of buffer.toString().split('\n\n')) {
          const match = split.match(regex)
          if (match) {
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
            const matches = match[4].match(/<[^>]+>/g) // create array of all tags
            if (matches) {
              matches.forEach(matched => {
                if (/<\//.test(matched)) { // check if its a closing tag
                  match[4] = match[4].replace(matched, matched.replace('</', '{\\').replace('>', '0}'))
                } else {
                  match[4] = match[4].replace(matched, matched.replace('<', '{\\').replace('>', '1}'))
                }
              })
            }
            subtitles.push('Dialogue: 0,' + match[1].replace(',', '.') + ',' + match[2].replace(',', '.') + ',Default,,0,0,0,,' + match[4])
          }
        }
        callback(subtitles)
      }
    })
  }

  findSubtitleFiles (targetFile) {
    const path = targetFile.path.split(targetFile.name)[0]
    // array of subtitle files that match video name, or all subtitle files when only 1 vid file
    const subtitleFiles = targetFile._torrent.files.filter(file => {
      return this.subtitleExtensions.some(ext => file.name.endsWith(ext)) && (this.videoFiles.length === 1 ? true : file.path.split(path).length === 2)
    })
    if (subtitleFiles.length) {
      this.createRadioElement(undefined, 'captions')
      this.subtitleData.parsed = true
      this.subtitleData.current = 0
      for (const [index, file] of subtitleFiles.entries()) {
        const isAss = file.name.endsWith('.ass') || file.name.endsWith('.ssa')
        const extension = /\.(\w+)$/
        const name = file.name.replace(targetFile.name, '') === file.name
          ? file.name.replace(targetFile.name.replace(extension, ''), '').slice(0, -4).replace(/[,._-]/g, ' ').trim()
          : file.name.replace(targetFile.name, '').slice(0, -4).replace(/[,._-]/g, ' ').trim()
        const header = {
          header: this.subtitleData.defaultHeader,
          language: name,
          number: index,
          type: file.name.match(extension)[1]
        }
        this.subtitleData.headers.push(header)
        this.subtitleData.tracks[index] = []
        this.createRadioElement(header, 'captions')
        this.convertSubFile(file, isAss, subtitles => {
          if (isAss) {
            this.subtitleData.headers[index].header = subtitles
          } else {
            this.subtitleData.tracks[index] = subtitles
          }
          if (this.subtitleData.current === index) this.selectCaptions(this.subtitleData.current)
        })
        this.initSubtitleRenderer()
      }
    }
  }

  async downloadFile () {
    if (this.currentFile?.done && !this.currentFile._torrent.store.store._store) {
      this.currentFile.getBlobURL((err, url) => {
        if (err) throw err
        const a = document.createElement('a')
        a.download = this.currentFile.name
        a.href = url
        document.body.appendChild(a)
        a.click(e)
        a.remove()
        window.URL.revokeObjectURL(url)
      })
    }
  }

  async postDownload () {
    this.onDownloadDone(this.currentFile.name)
    await this.parseSubtitles(this.currentFile)
    if (this.generateThumbnails) {
      this.finishThumbnails(this.video.src)
    }
    if (!this.currentFile._torrent.store.store._store) { // only allow download from RAM
      this.controls.downloadFile.removeAttribute('disabled')
    }
  }

  // this should be cleaned up
  addTorrent (torrentID, opts) {
    halfmoon.hideModal('tsearch')
    document.location.hash = '#player'
    this.cleanupVideo()
    this.cleanupTorrents()
    if (torrentID instanceof Object) {
      this.playTorrent(torrentID, opts)
    } else if (client.get(torrentID)) {
      this.playTorrent(client.get(torrentID), opts)
    } else {
      this.add(torrentID, {
        store: settings.torrent5 ? IdbChunkStore : undefined,
        announce: [
          'wss://tracker.openwebtorrent.com',
          'wss://tracker.sloppyta.co:443/announce',
          'wss://hub.bugout.link:443/announce'
        ]
      }, torrent => {
        this.playTorrent(torrent, opts)
        if (this.streamedDownload) torrent.deselect(0, torrent.pieces.length - 1, false)
      })
    }
  }

  async playTorrent (torrent, opts) {
    torrent.on('noPeers', () => {
      if (torrent.progress !== 1) {
        halfmoon.initStickyAlert({
          content: `Couldn't find peers for <span class="text-break">${torrent.infoHash}</span>! Try a torrent with more seeders.`,
          title: 'Search Failed',
          alertType: 'alert-danger',
          fillType: ''
        })
      }
    })
    await this.worker
    this.videoFiles = torrent.files.filter(file => this.videoExtensions.some(ext => file.name.endsWith(ext)))
    if (this.videoFiles.length > 1) {
      (async () => {
        torrent.files.forEach(file => file.deselect())
        const frag = document.createDocumentFragment()
        for (const file of this.videoFiles) {
          const mediaInformation = await resolveFileMedia({ fileName: file.name, method: 'SearchName' })
          mediaInformation.onclick = () => {
            this.cleanupVideo()
            this.buildVideo(torrent, {
              media: mediaInformation,
              episode: mediaInformation.parseObject.episode,
              file: file
            })
          }
          frag.appendChild(template)
        }
        document.querySelector('.playlist').appendChild(frag)
      })()
    }
    if (this.videoFiles) {
      this.buildVideo(torrent, opts)
    } else {
      halfmoon.initStickyAlert({
        content: `Couldn't find video file for <span class="text-break">${torrent.infoHash}</span>!`,
        title: 'Search Failed',
        alertType: 'alert-danger',
        fillType: ''
      })
      this.cleanupTorrents()
    }
  }

  // cleanup torrent and store
  cleanupTorrents () {
  // creates an array of all non-offline store torrents and removes them
    this.torrents.filter(torrent => !this.offlineTorrents[torrent.infoHash]).forEach(torrent => torrent.destroy({ destroyStore: true }))
    document.querySelector('.playlist').textContent = ''
  }

  // add torrent for offline download
  offlineDownload (torrentID, skipVerify) {
    const torrent = this.add(torrentID, {
      store: IdbChunkStore,
      skipVerify: skipVerify,
      announce: [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.sloppyta.co:443/announce',
        'wss://hub.bugout.link:443/announce'
      ]
    })
    torrent.on('metadata', async () => {
      console.log(torrent)
      if (!this.offlineTorrents[torrent.infoHash]) {
        this.offlineTorrents[torrent.infoHash] = Array.from(torrent.torrentFile)
        localStorage.setItem('offlineTorrents', JSON.stringify(this.offlineTorrents))
      }
      const mediaInformation = await resolveFileMedia({ fileName: torrent.name, method: 'SearchName' })
      mediaInformation.onclick = () => this.addTorrent(torrent, { media: mediaInformation, episode: mediaInformation.episode })
      const template = cardCreator(mediaInformation)
      document.querySelector('.downloads').appendChild(template)
    })
  }
}

const announceList = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.sloppyta.co:443/announce',
  'wss://hub.bugout.link:443/announce'
]
const playerControls = {}
for (const item of document.getElementsByClassName('ctrl')) {
  playerControls[item.dataset.name] = item
}
const client = new TorrentPlayer({
  WebTorrentOpts: {
    maxConns: settings.torrent6,
    downloadLimit: settings.torrent7 * 1048576,
    uploadLimit: settings.torrent7 * 1572864,
    tracker: {
      announce: announceList
    }
  },
  controls: playerControls,
  video: video,
  player: player,
  playerWrapper: pageWrapper,
  burnIn: settings.subtitle3,
  seekTime: Number(settings.player3),
  immerseTime: Number(settings.player2),
  visibilityLossPause: settings.player10,
  autoNext: settings.player6,
  streamedDownload: settings.torrent8,
  generateThumbnails: settings.player5,
  defaultSSAStyles: Object.values(subtitle1list.options).filter(item => item.value === settings.subtitle1)[0].textContent,
  resolveFileMedia: resolveFileMedia,
  onDownloadDone: (name) => {
    halfmoon.initStickyAlert({
      content: `<span class="text-break">${name}</span> has finished downloading. Now seeding.`,
      title: 'Download Complete',
      alertType: 'alert-success',
      fillType: ''
    })
  },
  onWatched: () => {
    if (client.nowPlaying?.media?.episodes || client.nowPlaying?.media?.nextAiringEpisode?.episode) {
      if (settings.other2 && (client.nowPlaying.media?.episodes || client.nowPlaying.media?.nextAiringEpisode?.episode > client.nowPlaying.episodeNumber)) {
        alEntry()
      } else {
        halfmoon.initStickyAlert({
          content: `Do You Want To Mark <br><b>${client.nowPlaying.mediaTitle}</b><br>Episode ${client.nowPlaying.episodeNumber} As Completed?<br>
                <button class="btn btn-sm btn-square btn-success mt-5" onclick="alEntry()" data-dismiss="alert" type="button" aria-label="Close">✓</button>
                <button class="btn btn-sm btn-square mt-5" data-dismiss="alert" type="button" aria-label="Close"><span aria-hidden="true">X</span></button>`,
          title: 'Episode Complete',
          timeShown: 180000
        })
      }
    }
  },
  onPlaylist: () => {
    window.location.hash = '#playlist'
  },
  onNext: () => {
    if (client.nowPlaying.media) {
      nyaaSearch(client.nowPlaying.media, client.nowPlaying.episodeNumber)
    } else {
      halfmoon.initStickyAlert({
        content: 'Couldn\'t find anime name! Try specifying a torrent manually.',
        title: 'Search Failed',
        alertType: 'alert-danger',
        fillType: ''
      })
    }
  }
})

window.onbeforeunload = function () {
  return ''
}

function t (a) {
  switch (a) {
    case 1:
      client.addTorrent('https://webtorrent.io/torrents/sintel.torrent', {})
      break
    case 2:
      client.addTorrent('https://webtorrent.io/torrents/tears-of-steel.torrent', {})
      break
    case 3:
      client.addTorrent('magnet:?xt=urn:btih:CE9156EB497762F8B7577B71C0647A4B0C3423E1&dn=Inception+%282010%29+720p+-+mkv+-+1.0GB+-+YIFY&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce', {})
      break
  }
}
