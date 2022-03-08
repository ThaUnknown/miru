/* eslint-env browser */

// test ImageData constructor
; (() => {
  if (typeof ImageData.prototype.constructor === 'function') {
    try {
      // try actually calling ImageData, as on some browsers it's reported
      // as existing but calling it errors out as "TypeError: Illegal constructor"
      return new ImageData(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1)
    } catch (e) {
      console.log('detected that ImageData is not constructable despite browser saying so')
    }
  }

  const ctx = document.createElement('canvas').getContext('2d')

  window.ImageData = (data, width, height) => {
    const imageData = ctx.createImageData(width, height)
    if (data) imageData.data.set(data)
    return imageData
  }
})()

export default class SubtitlesOctopus extends EventTarget {
  constructor (options = {}) {
    super()
    if (!window.Worker) {
      this.destroy('Worker not supported')
    }
    // blending mode, 'js' for hardware acceleration [if browser supports it], 'wasm' for devices/browsers that don't benetit from hardware acceleration
    const _blendMode = options.blendMode || 'wasm'
    // drop frames when under heavy load, good for website performance
    const _asyncRender = typeof createImageBitmap !== 'undefined' && (options.asyncRender ?? true)
    // render in worker, rather than on main thread
    const _offscreenRender = typeof OffscreenCanvas !== 'undefined' && (options.offscreenRender ?? true)
    // render subs as video player renders video frames, rather than "predicting" the time with events
    this._onDemandRender = 'requestVideoFrameCallback' in HTMLVideoElement.prototype && (options.onDemandRender ?? true)

    this.timeOffset = options.timeOffset || 0
    this._video = options.video // HTML video element (optional if canvas specified)
    this._canvasParent = null // HTML canvas parent element
    if (this._video) {
      this._canvasParent = document.createElement('div')
      this._canvasParent.className = 'subtitles-octopus'
      this._canvasParent.style.position = 'relative'

      if (this._video.nextSibling) {
        this._video.parentNode.insertBefore(this._canvasParent, this._video.nextSibling)
      } else {
        this._video.parentNode.appendChild(this._canvasParent)
      }
    } else if (!this._canvas) {
      this.destroy('Don\'t know where to render: you should give video or canvas in options.')
    }

    this._canvas = options.canvas || document.createElement('canvas') // HTML canvas element (optional if video specified)
    this._canvas.style.display = 'block'
    this._canvas.style.position = 'absolute'
    this._canvas.style.pointerEvents = 'none'
    this._canvasParent.appendChild(this._canvas)

    this._bufferCanvas = document.createElement('canvas')
    this._bufferCtx = this._bufferCanvas.getContext('2d')

    this._canvasctrl = _offscreenRender ? this._canvas.transferControlToOffscreen() : this._canvas
    this._ctx = !_offscreenRender && this._canvasctrl.getContext('2d')

    this._lastRenderTime = 0 // Last time we got some frame from worker
    this.debug = !!options.debug // When debug enabled, some performance info printed in console.

    this.prescaleFactor = options.prescaleFactor || 1.0
    this.prescaleHeightLimit = options.prescaleHeightLimit || 1080
    this.maxRenderHeight = options.maxRenderHeight || 0 // 0 - no limit

    this._worker = new Worker(options.workerUrl || 'subtitles-octopus-worker.js')
    this._worker.onmessage = e => this._onmessage(e)
    this._worker.onerror = e => this._error(e)

    // test alpha bug
    const canvas2 = document.createElement('canvas')
    const ctx2 = canvas2.getContext('2d')

    // test for alpha bug, where e.g. WebKit can render a transparent pixel
    // (with alpha == 0) as non-black which then leads to visual artifacts
    this._bufferCanvas.width = 1
    this._bufferCanvas.height = 1
    this._bufferCtx.clearRect(0, 0, 1, 1)
    ctx2.clearRect(0, 0, 1, 1)
    const prePut = ctx2.getImageData(0, 0, 1, 1).data
    this._bufferCtx.putImageData(new ImageData(new Uint8ClampedArray([0, 255, 0, 0]), 1, 1), 0, 0)
    ctx2.drawImage(this._bufferCanvas, 0, 0)
    const postPut = ctx2.getImageData(0, 0, 1, 1).data
    this.hasAlphaBug = prePut[1] !== postPut[1]
    if (this.hasAlphaBug) console.log('Detected a browser having issue with transparent pixels, applying workaround')

    this._worker.postMessage({
      target: 'init',
      asyncRender: _asyncRender,
      width: this._canvas.width,
      height: this._canvas.height,
      URL: document.URL,
      currentScript: options.workerUrl || 'subtitles-octopus-worker.js', // Link to WebAssembly worker
      preMain: true,
      blendMode: _blendMode,
      subUrl: options.subUrl, // Link to sub file (optional if subContent specified)
      subContent: options.subContent || null, // Sub content (optional if subUrl specified)
      fonts: options.fonts || [], // Array with links to fonts used in sub (optional)
      availableFonts: options.availableFonts || [], // Object with all available fonts (optional). Key is font name in lower case, value is link: {"arial": "/font1.ttf"}
      debug: this.debug,
      targetFps: options.targetFps,
      libassMemoryLimit: options.libassMemoryLimit || 0, // set libass bitmap cache memory limit in MiB (approximate)
      libassGlyphLimit: options.libassGlyphLimit || 0, // set libass glyph cache memory limit in MiB (approximate),
      hasAlphaBug: this.hasAlphaBug
    })
    if (_offscreenRender === true) this.sendMessage('offscreenCanvas', null, [this._canvasctrl])
    this.setVideo(options.video)
    if (this._onDemandRender) this._video.requestVideoFrameCallback(this._demandRender.bind(this))
  }

  resize (width = 0, height = 0, top = 0, left = 0) {
    let videoSize = null
    if ((!width || !height) && this._video) {
      videoSize = this._getVideoPosition()
      const newsize = this._computeCanvasSize(videoSize.width || 0 * (window.devicePixelRatio || 1), videoSize.height || 0 * (window.devicePixelRatio || 1))
      width = newsize.width
      height = newsize.height
      top = videoSize.y - (this._canvasParent.getBoundingClientRect().top - this._video.getBoundingClientRect().top)
      left = videoSize.x
    }

    if (this._canvas.style.top !== top || this._canvas.style.left !== left) {
      if (videoSize != null) {
        this._canvas.style.top = top + 'px'
        this._canvas.style.left = left + 'px'
        this._canvas.style.width = videoSize.width + 'px'
        this._canvas.style.height = videoSize.height + 'px'
      }
      if (!(this._canvasctrl.width === width && this._canvasctrl.height === height)) {
        // only re-paint if dimensions actually changed
        // dont spam re-paints like crazy when re-sizing with animations, but still update instantly without them
        if (this._resizeTimeoutBuffer) {
          clearTimeout(this._resizeTimeoutBuffer)
          this._resizeTimeoutBuffer = setTimeout(() => {
            this._resizeTimeoutBuffer = undefined
            this._canvasctrl.width = width
            this._canvasctrl.height = height
            this.sendMessage('canvas', { width, height })
          }, 50)
        } else {
          this._canvasctrl.width = width
          this._canvasctrl.height = height
          this.sendMessage('canvas', { width, height })
          this._resizeTimeoutBuffer = setTimeout(() => {
            this._resizeTimeoutBuffer = undefined
          }, 50)
        }
      }
    }
  }

  _getVideoPosition () {
    const videoRatio = this._video.videoWidth / this._video.videoHeight
    const { offsetWidth, offsetHeight } = this._video
    const elementRatio = offsetWidth / offsetHeight
    let width = offsetWidth
    let height = offsetHeight
    if (elementRatio > videoRatio) {
      width = Math.floor(offsetHeight * videoRatio)
    } else {
      height = Math.floor(offsetWidth / videoRatio)
    }

    const x = (offsetWidth - width) / 2
    const y = (offsetHeight - height) / 2

    return { width, height, x, y }
  }

  _computeCanvasSize (width = 0, height = 0) {
    const scalefactor = this.prescaleFactor <= 0 ? 1.0 : this.prescaleFactor

    if (height <= 0 || width <= 0) {
      width = 0
      height = 0
    } else {
      const sgn = scalefactor < 1 ? -1 : 1
      let newH = height
      if (sgn * newH * scalefactor <= sgn * this.prescaleHeightLimit) {
        newH *= scalefactor
      } else if (sgn * newH < sgn * this.prescaleHeightLimit) {
        newH = this.prescaleHeightLimit
      }

      if (this.maxRenderHeight > 0 && newH > this.maxRenderHeight) newH = this.maxRenderHeight

      width *= newH / height
      height = newH
    }

    return { width, height }
  }

  _timeupdate ({ type }) {
    const eventmap = {
      seeking: true,
      waiting: true,
      playing: false
    }
    const playing = eventmap[type]
    if (playing != null) this._playstate = playing
    this.setCurrentTime(this._video.paused || this._playstate, this._video.currentTime + this.timeOffset)
  }

  setVideo (video) {
    if (video instanceof HTMLVideoElement) {
      this._removeListeners()
      this._video = video
      if (this._onDemandRender !== true) {
        this._playstate = video.paused

        video.addEventListener('timeupdate', e => this._timeupdate(e), false)
        video.addEventListener('progress', e => this._timeupdate(e), false)
        video.addEventListener('waiting', e => this._timeupdate(e), false)
        video.addEventListener('seeking', e => this._timeupdate(e), false)
        video.addEventListener('playing', e => this._timeupdate(e), false)
        video.addEventListener('ratechange', e => this.setRate(e), false)
      }
      if (video.videoWidth > 0) {
        this.resize()
      } else {
        video.addEventListener('loadedmetadata', () => this.resize(0, 0, 0, 0), false)
      }
      // Support Element Resize Observer
      if (typeof ResizeObserver !== 'undefined') {
        if (!this._ro) this._ro = new ResizeObserver(() => this.resize(0, 0, 0, 0))
        this._ro.observe(video)
      }
    } else {
      this._error('Video element invalid!')
    }
  }

  runBenchmark () {
    this.sendMessage('runBenchmark')
  }

  setTrackByUrl (url) {
    this.sendMessage('setTrackByUrl', { url })
  }

  setTrack (content) {
    this.sendMessage('setTrack', { content })
  }

  freeTrack () {
    this.sendMessage('freeTrack')
  }

  setIsPaused (isPaused) {
    this.sendMessage('video', { isPaused })
  }

  setRate (rate) {
    this.sendMessage('video', { rate })
  }

  setCurrentTime (isPaused, currentTime, rate) {
    this.sendMessage('video', { isPaused, currentTime, rate })
  }

  createEvent (event) {
    this.sendMessage('createEvent', { event })
  }

  setEvent (event, index) {
    this.sendMessage('setEvent', { event, index })
  }

  removeEvent (index) {
    this.sendMessage('removeEvent', { index })
  }

  getEvents (onError, onSuccess) {
    this._fetchFromWorker({
      target: 'getEvents'
    }, onError, ({ events }) => {
      onSuccess(events)
    })
  }

  createStyle (style) {
    this.sendMessage('createStyle', { style })
  }

  setStyle (event, index) {
    this.sendMessage('setStyle', { event, index })
  }

  removeStyle (index) {
    this.sendMessage('removeStyle', { index })
  }

  getStyles (onError, onSuccess) {
    this._fetchFromWorker({
      target: 'get-styles'
    }, onError, ({ styles }) => {
      onSuccess(styles)
    })
  }

  _demandRender (now, metadata) {
    if (this._destroyed) return null
    this.sendMessage('demand', { time: metadata.mediaTime + this.timeOffset })
    this._video.requestVideoFrameCallback(this._demandRender.bind(this))
  }

  _render (data) {
    this._ctx.clearRect(0, 0, this._canvasctrl.width, this._canvasctrl.height)
    for (const image of data.images) {
      if (image.buffer) {
        if (data.async) {
          this._ctx.drawImage(image.buffer, image.x, image.y)
        } else {
          this._bufferCanvas.width = image.w
          this._bufferCanvas.height = image.h
          this._bufferCtx.putImageData(new ImageData(this._fixAlpha(new Uint8ClampedArray(image.buffer)), image.w, image.h), 0, 0)
          this._ctx.drawImage(this._bufferCanvas, image.x, image.y)
        }
      }
    }
  }

  _fixAlpha (uint8) {
    if (this.hasAlphaBug) {
      for (let j = 3; j < uint8.length; j += 4) {
        uint8[j] = uint8[j] > 1 ? uint8[j] : 1
      }
    }
    return uint8
  }

  _ready () {
    this.dispatchEvent(new CustomEvent('ready'))
  }

  sendMessage (target, data = {}, transferable) {
    if (transferable) {
      this._worker.postMessage({
        target,
        transferable,
        ...data
      }, [...transferable])
    } else {
      this._worker.postMessage({
        target,
        ...data
      })
    }
  }

  _fetchFromWorker (workerOptions, onError, onSuccess) {
    try {
      const target = workerOptions.target

      const timeout = setTimeout(() => {
        reject(new Error('Error: Timeout while try to fetch ' + target))
      }, 5000)

      const resolve = ({ data }) => {
        if (data.target === target) {
          onSuccess(data)
          this._worker.removeEventListener('message', resolve)
          this._worker.removeEventListener('error', reject)
          clearTimeout(timeout)
        }
      }

      const reject = function (event) {
        onError(event)
        this._worker.removeEventListener('message', resolve)
        this._worker.removeEventListener('error', reject)
        clearTimeout(timeout)
      }

      this._worker.addEventListener('message', resolve)
      this._worker.addEventListener('error', reject)

      this._worker.postMessage(workerOptions)
    } catch (error) {
      this._error(error)
    }
  }

  _console ({ content, command }) {
    console[command].apply(console, JSON.parse(content))
  }

  _onmessage ({ data }) {
    if (this['_' + data.target]) this['_' + data.target](data)
  }

  _error (err) {
    this.dispatchEvent(new CustomEvent('error', { detail: err }))
    throw err
  }

  _removeListeners () {
    if (this._video) {
      if (this._ro) this._ro.unobserve(this._video)
      this._video.removeEventListener('timeupdate', this._timeupdate)
      this._video.removeEventListener('progress', this._timeupdate)
      this._video.removeEventListener('waiting', this._timeupdate)
      this._video.removeEventListener('seeking', this._timeupdate)
      this._video.removeEventListener('playing', this._timeupdate)
      this._video.removeEventListener('ratechange', this.setRate)
    }
  }

  destroy (err) {
    if (err) this._error(err)
    if (this._video) this._video.parentNode.removeChild(this._canvasParent)
    this._destroyed = true
    this._removeListeners()
    this.sendMessage('destroy')
    this._worker.terminate()
  }
}

if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
  exports = module.exports = SubtitlesOctopus
}
