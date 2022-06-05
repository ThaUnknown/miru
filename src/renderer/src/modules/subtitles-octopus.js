let supportsWebAssembly = false
try {
  if (typeof WebAssembly === 'object' &&
    typeof WebAssembly.instantiate === 'function') {
    const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))
    if (module instanceof WebAssembly.Module) { supportsWebAssembly = (new WebAssembly.Instance(module) instanceof WebAssembly.Instance) }
  }
} catch (e) {}

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
/**
 * New SubtitlesOctopus instance.
 * @class
 */
export default class SubtitlesOctopus extends EventTarget {
  /**
   * @param {Object} options Settings object.
   * @param {HTMLVideoElement} options.video Video to use as target for event listeners. Optional if canvas is specified instead.
   * @param {HTMLCanvasElement} [options.canvas=HTMLCanvasElement] Canvas to use for manual handling. Not required if video is specified.
   * @param {'js'|'wasm'} [options.blendMode='wasm'] Which color blending mode to use. WASM will perform better on lower end devices, JS can perform better if the device and browser supports hardware acceleration.
   * @param {Boolean} [options.asyncRender=true] Whether or not to use async rendering, which can skip rendering frames when resources aren't available.
   * @param {Boolean} [options.offscreenRender=true] Whether or not to render things fully on the worker, greatly reduces CPU usage.
   * @param {Boolean} [options.onDemandRender=true] Whether or not to render subtitles as the video player decodes frames, rather than predicting which frame the player is on using events.
   * @param {Number} [options.targetFps=24] Target FPS to render subtitles at.
   * @param {Number} [options.timeOffset=0] Subtitle time offset in seconds.
   * @param {Boolean} [options.debug=false] Whether or not to print debug information.
   * @param {Number} [options.prescaleFactor=1.0] Scale down (< 1.0) the subtitles canvas to improve performance at the expense of quality, or scale it up (> 1.0).
   * @param {Number} [options.prescaleHeightLimit=1080] The height in pixels beyond which the subtitles canvas won't be prescaled.
   * @param {Number} [options.maxRenderHeight=0] The maximum rendering height in pixels of the subtitles canvas. Beyond this subtitles will be upscaled by the browser.
   * @param {Boolean} [options.dropAllAnimations] Attempt to discard all animated tags. Enabling this may severly mangle complex subtitles and should only be considered as an last ditch effort of uncertain success for hardware otherwise incapable of displaing anything. Will not reliably work with manually edited or allocated events.
   * @param {String} [options.workerUrl='subtitles-octopus-worker.js'] The URL of the worker.
   * @param {String} [options.subUrl=options.subContent] The URL of the subtitle file to play.
   * @param {String} [options.subContent=options.subUrl] The content of the subtitle file to play.
   * @param {String[]} [options.fonts] An array of links to the fonts used in the subtitle.
   * @param {Object} [options.availableFonts] Object with all available fonts - Key is font name in lower case, value is link: { arial: '/font1.ttf' }.
   * @param {Number} [options.libassMemoryLimit] libass bitmap cache memory limit in MiB (approximate).
   * @param {Number} [options.libassGlyphLimit] libass glyph cache memory limit in MiB (approximate).
   */
  constructor (options = {}) {
    super()
    if (!window.Worker) {
      this.destroy('Worker not supported')
    }
    const _blendMode = options.blendMode || 'wasm'
    const _asyncRender = typeof createImageBitmap !== 'undefined' && (options.asyncRender ?? true)
    const _offscreenRender = typeof OffscreenCanvas !== 'undefined' && (options.offscreenRender ?? true)
    this._onDemandRender = 'requestVideoFrameCallback' in HTMLVideoElement.prototype && (options.onDemandRender ?? true)

    this.timeOffset = options.timeOffset || 0
    this._video = options.video
    this._canvasParent = null
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

    this._canvas = options.canvas || document.createElement('canvas')
    this._canvas.style.display = 'block'
    this._canvas.style.position = 'absolute'
    this._canvas.style.pointerEvents = 'none'
    this._canvasParent.appendChild(this._canvas)

    this._bufferCanvas = document.createElement('canvas')
    this._bufferCtx = this._bufferCanvas.getContext('2d')

    this._canvasctrl = _offscreenRender ? this._canvas.transferControlToOffscreen() : this._canvas
    this._ctx = !_offscreenRender && this._canvasctrl.getContext('2d')

    this._lastRenderTime = 0
    this.debug = !!options.debug

    this.prescaleFactor = options.prescaleFactor || 1.0
    this.prescaleHeightLimit = options.prescaleHeightLimit || 1080
    this.maxRenderHeight = options.maxRenderHeight || 0 // 0 - no limit.

    this._worker = new Worker(options.workerUrl || 'subtitles-octopus-worker.js')
    this._worker.onmessage = e => this._onmessage(e)
    this._worker.onerror = e => this._error(e)

    const canvas2 = document.createElement('canvas')
    const ctx2 = canvas2.getContext('2d')

    // Test for alpha bug, where e.g. WebKit can render a transparent pixel
    // (with alpha == 0) as non-black which then leads to visual artifacts.
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
      currentScript: supportsWebAssembly ? options.workerUrl || 'subtitles-octopus-worker.js' : options.legacyWorkerUrl || 'subtitles-octopus-worker-legacy.js', // Link to WebAssembly worker
      preMain: true,
      blendMode: _blendMode,
      subUrl: options.subUrl,
      subContent: options.subContent || null,
      fonts: options.fonts || [],
      availableFonts: options.availableFonts || [],
      debug: this.debug,
      targetFps: options.targetFps,
      dropAllAnimations: options.dropAllAnimations,
      libassMemoryLimit: options.libassMemoryLimit || 0,
      libassGlyphLimit: options.libassGlyphLimit || 0,
      hasAlphaBug: this.hasAlphaBug
    })
    if (_offscreenRender === true) this.sendMessage('offscreenCanvas', null, [this._canvasctrl])
    this.setVideo(options.video)
    if (this._onDemandRender) {
      this.busy = false
      this._video.requestVideoFrameCallback(this._demandRender.bind(this))
    }
  }

  /**
   * Resize the canvas to given parameters. Auto-generated if values are ommited.
   * @param  {Number} [width=0]
   * @param  {Number} [height=0]
   * @param  {Number} [top=0]
   * @param  {Number} [left=0]
   */
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
        }, 100)
      } else {
        this._canvasctrl.width = width
        this._canvasctrl.height = height
        this.sendMessage('canvas', { width, height })
        this._resizeTimeoutBuffer = setTimeout(() => {
          this._resizeTimeoutBuffer = undefined
        }, 100)
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

  /**
   * Change the video to use as target for event listeners.
   * @param  {HTMLVideoElement} video
   */
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

  /**
   * Overwrites the current subtitle content.
   * @param  {String} url URL to load subtitles from.
   */
  setTrackByUrl (url) {
    this.sendMessage('setTrackByUrl', { url })
  }

  /**
   * Overwrites the current subtitle content.
   * @param  {String} content Content of the ASS file.
   */
  setTrack (content) {
    this.sendMessage('setTrack', { content })
  }

  freeTrack () {
    this.sendMessage('freeTrack')
  }

  /**
   * Sets the playback state of the media.
   * @param  {Boolean} isPaused Pause/Play subtitle playback.
   */
  setIsPaused (isPaused) {
    this.sendMessage('video', { isPaused })
  }

  /**
   * Sets the playback rate of the media [speed multiplier].
   * @param  {Number} rate Playback rate.
   */
  setRate (rate) {
    this.sendMessage('video', { rate })
  }

  /**
   * Sets the current time, playback state and rate of the subtitles.
   * @param  {Boolean} [isPaused] Pause/Play subtitle playback.
   * @param  {Number} [currentTime] Time in seconds.
   * @param  {Number} [rate] Playback rate.
   */
  setCurrentTime (isPaused, currentTime, rate) {
    this.sendMessage('video', { isPaused, currentTime, rate })
  }

  /**
   * @typedef {Object} ASS_Event
   * @property {Number} Start Start Time of the Event, in 0:00:00:00 format ie. Hrs:Mins:Secs:hundredths. This is the time elapsed during script playback at which the text will appear onscreen. Note that there is a single digit for the hours!
   * @property {Number} Duration End Time of the Event, in 0:00:00:00 format ie. Hrs:Mins:Secs:hundredths. This is the time elapsed during script playback at which the text will disappear offscreen. Note that there is a single digit for the hours!
   * @property {String} Style Style name. If it is "Default", then your own *Default style will be subtituted.
   * @property {String} Name Character name. This is the name of the character who speaks the dialogue. It is for information only, to make the script is easier to follow when editing/timing.
   * @property {Number} MarginL 4-figure Left Margin override. The values are in pixels. All zeroes means the default margins defined by the style are used.
   * @property {Number} MarginR 4-figure Right Margin override. The values are in pixels. All zeroes means the default margins defined by the style are used.
   * @property {Number} MarginV 4-figure Bottom Margin override. The values are in pixels. All zeroes means the default margins defined by the style are used.
   * @property {String} Effect Transition Effect. This is either empty, or contains information for one of the three transition effects implemented in SSA v4.x
   * @property {String} Text Subtitle Text. This is the actual text which will be displayed as a subtitle onscreen. Everything after the 9th comma is treated as the subtitle text, so it can include commas.
   * @property {Number} ReadOrder Number in order of which to read this event.
   * @property {Number} Layer Z-index overlap in which to render this event.
   * @property {Number} _index (Internal) index of the event.
  */

  /**
   * Create a new ASS event directly.
   * @param  {ASS_Event} event
   */
  createEvent (event) {
    this.sendMessage('createEvent', { event })
  }

  /**
   * Overwrite the data of the event with the specified index.
   * @param  {ASS_Event} event
   * @param  {Number} index
   */
  setEvent (event, index) {
    this.sendMessage('setEvent', { event, index })
  }

  /**
   * Remove the event with the specified index.
   * @param  {Number} index
   */
  removeEvent (index) {
    this.sendMessage('removeEvent', { index })
  }

  /**
   * Get all ASS events.
   * @param  {function(Error|null, ASS_Event)} callback Function to callback when worker returns the events.
   */
  getEvents (callback) {
    this._fetchFromWorker({
      target: 'getEvents'
    }, (err, { events }) => {
      callback(err, events)
    })
  }

  /**
   * @typedef {Object} ASS_Style
   * @property {String} Name The name of the Style. Case sensitive. Cannot include commas.
   * @property {String} FontName The fontname as used by Windows. Case-sensitive.
   * @property {Number} FontSize Font size.
   * @property {Number} PrimaryColour A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR
   * @property {Number} SecondaryColour A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR
   * @property {Number} OutlineColour A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR
   * @property {Number} BackColour This is the colour of the subtitle outline or shadow, if these are used. A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR.
   * @property {Number} Bold This defines whether text is bold (true) or not (false). -1 is True, 0 is False. This is independant of the Italic attribute - you can have have text which is both bold and italic.
   * @property {Number} Italic  Italic. This defines whether text is italic (true) or not (false). -1 is True, 0 is False. This is independant of the bold attribute - you can have have text which is both bold and italic.
   * @property {Number} Underline -1 or 0
   * @property {Number} StrikeOut -1 or 0
   * @property {Number} ScaleX Modifies the width of the font. [percent]
   * @property {Number} ScaleY Modifies the height of the font. [percent]
   * @property {Number} Spacing Extra space between characters. [pixels]
   * @property {Number} Angle The origin of the rotation is defined by the alignment. Can be a floating point number. [degrees]
   * @property {Number} BorderStyle 1=Outline + drop shadow, 3=Opaque box
   * @property {Number} Outline If BorderStyle is 1,  then this specifies the width of the outline around the text, in pixels. Values may be 0, 1, 2, 3 or 4.
   * @property {Number} Shadow If BorderStyle is 1,  then this specifies the depth of the drop shadow behind the text, in pixels. Values may be 0, 1, 2, 3 or 4. Drop shadow is always used in addition to an outline - SSA will force an outline of 1 pixel if no outline width is given.
   * @property {Number} Alignment This sets how text is "justified" within the Left/Right onscreen margins, and also the vertical placing. Values may be 1=Left, 2=Centered, 3=Right. Add 4 to the value for a "Toptitle". Add 8 to the value for a "Midtitle". eg. 5 = left-justified toptitle
   * @property {Number} MarginL This defines the Left Margin in pixels. It is the distance from the left-hand edge of the screen.The three onscreen margins (MarginL, MarginR, MarginV) define areas in which the subtitle text will be displayed.
   * @property {Number} MarginR This defines the Right Margin in pixels. It is the distance from the right-hand edge of the screen. The three onscreen margins (MarginL, MarginR, MarginV) define areas in which the subtitle text will be displayed.
   * @property {Number} MarginV This defines the vertical Left Margin in pixels. For a subtitle, it is the distance from the bottom of the screen. For a toptitle, it is the distance from the top of the screen. For a midtitle, the value is ignored - the text will be vertically centred.
   * @property {Number} Encoding This specifies the font character set or encoding and on multi-lingual Windows installations it provides access to characters used in multiple than one languages. It is usually 0 (zero) for English (Western, ANSI) Windows.
   * @property {Number} treat_fontname_as_pattern
   * @property {Number} Blur
   * @property {Number} Justify
  */

  /**
   * Create a new ASS style directly.
   * @param  {ASS_Style} event
   */
  createStyle (style) {
    this.sendMessage('createStyle', { style })
  }

  /**
   * Overwrite the data of the style with the specified index.
   * @param  {ASS_Style} event
   * @param  {Number} index
   */
  setStyle (event, index) {
    this.sendMessage('setStyle', { event, index })
  }

  /**
   * Remove the style with the specified index.
   * @param  {Number} index
   */
  removeStyle (index) {
    this.sendMessage('removeStyle', { index })
  }

  /**
   * Get all ASS styles.
   * @param  {function(Error|null, ASS_Style)} callback Function to callback when worker returns the styles.
   */
  getStyles (callback) {
    this._fetchFromWorker({
      target: 'getStyles'
    }, (err, { styles }) => {
      callback(err, styles)
    })
  }

  _unbusy () {
    this.busy = false
  }

  _demandRender (now, metadata) {
    if (this._destroyed) return null
    if (!this.busy) {
      this.busy = true
      this.sendMessage('demand', { time: metadata.mediaTime + this.timeOffset })
    }
    this._video.requestVideoFrameCallback(this._demandRender.bind(this))
  }

  _render ({ images, async, times }) {
    const drawStartTime = Date.now()
    this._ctx.clearRect(0, 0, this._canvasctrl.width, this._canvasctrl.height)
    for (const image of images) {
      if (image.image) {
        if (async) {
          this._ctx.drawImage(image.image, image.x, image.y)
          image.image.close()
        } else {
          this._bufferCanvas.width = image.w
          this._bufferCanvas.height = image.h
          this._bufferCtx.putImageData(new ImageData(this._fixAlpha(new Uint8ClampedArray(image.image)), image.w, image.h), 0, 0)
          this._ctx.drawImage(this._bufferCanvas, image.x, image.y)
        }
      }
    }
    if (this.debug) {
      times.drawTime = Date.now() - drawStartTime
      let total = 0
      for (const key in times) total += times[key]
      console.log('Bitmaps: ' + images.length + ' Total: ' + Math.round(total) + 'ms', times)
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

  /**
   * Send data and execute function in the worker.
   * @param  {String} target Target function.
   * @param  {Object} [data] Data for function.
   * @param  {Transferable[]} [transferable] Array of transferables.
   */
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

  _fetchFromWorker (workerOptions, callback) {
    try {
      const target = workerOptions.target

      const timeout = setTimeout(() => {
        reject(new Error('Error: Timeout while try to fetch ' + target))
      }, 5000)

      const resolve = ({ data }) => {
        if (data.target === target) {
          callback(null, data)
          this._worker.removeEventListener('message', resolve)
          this._worker.removeEventListener('error', reject)
          clearTimeout(timeout)
        }
      }

      const reject = event => {
        callback(event)
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
    if (!(err instanceof ErrorEvent)) this.dispatchEvent(new ErrorEvent('error', { message: err instanceof Error ? err.cause : err }))
    throw err instanceof Error ? err : new Error(err instanceof ErrorEvent ? err.message : 'error', { cause: err })
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

  /**
   * Destroy the object, worker, listeners and all data.
   * @param  {String} [err] Error to throw when destroying.
   */
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
