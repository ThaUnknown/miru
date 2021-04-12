class SubtitlesOctopus {
  constructor (options) {
    let supportsWebAssembly = false
    try {
      if (typeof WebAssembly === 'object' &&
        typeof WebAssembly.instantiate === 'function') {
        const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))
        if (module instanceof WebAssembly.Module) { supportsWebAssembly = (new WebAssembly.Instance(module) instanceof WebAssembly.Instance) }
      }
    } catch (e) {
    }
    if (!supportsWebAssembly) {
      throw new Error('WASM not supported!')
    }
    const self = this
    self.canvas = options.canvas // HTML canvas element (optional if video specified)

    // play with those when you need some speed, e.g. for slow devices
    self.dropAllAnimations = options.dropAllAnimations || false
    self.libassMemoryLimit = options.libassMemoryLimit || 0 // set libass bitmap cache memory limit in MiB (approximate)
    self.libassGlyphLimit = options.libassGlyphLimit || 0 // set libass glyph cache memory limit in MiB (approximate)
    self.targetFps = options.targetFps || 23.976
    self.prescaleTradeoff = options.prescaleTradeoff || null // render subtitles less than viewport when less than 1.0 to improve speed, render to more than 1.0 to improve quality; set to null to disable scaling
    self.softHeightLimit = options.softHeightLimit || 1080 // don't apply prescaleTradeoff < 1 when viewport height is less that this limit
    self.hardHeightLimit = options.hardHeightLimit || 2160 // don't ever go above this limit
    self.resizeVariation = options.resizeVariation || 0.2 // by how many a size can vary before it would cause clearance of prerendered buffer

    self.isOurCanvas = false // (internal) we created canvas and manage it
    self.video = options.video // HTML video element (optional if canvas specified)
    self.canvasParent = null // (internal) HTML canvas parent element
    self.fonts = options.fonts || [] // Array with links to fonts used in sub (optional)
    self.availableFonts = options.availableFonts || [] // Object with all available fonts (optional). Key is font name in lower case, value is link: {"arial": "/font1.ttf"}
    self.onReadyEvent = options.onReady // Function called when SubtitleDuet is ready (optional)
    self.workerUrl = options.workerUrl || 'subtitleDuetWorker.js' // Link to WebAssembly worker
    self.subUrl = options.subUrl // Link to sub file (optional if subContent specified)
    self.subContent = options.subContent || null // Sub content (optional if subUrl specified)
    self.onErrorEvent = options.onError // Function called in case of critical error meaning sub wouldn't be shown and you should use alternative method (for instance it occurs if browser doesn't support web workers).
    self.debug = options.debug || false // When debug enabled, some performance info printed in console.
    self.lastRenderTime = 0 // (internal) Last time we got some frame from worker
    self.pixelRatio = window.devicePixelRatio || 1 // (internal) Device pixel ratio (for high dpi devices)

    self.timeOffset = options.timeOffset || 0 // Time offset would be applied to currentTime from video (option)

    self.workerError = function (error) {
      console.error('Worker error: ', error)
      if (self.onErrorEvent) {
        self.onErrorEvent(error)
      }
      if (!self.debug) {
        self.dispose()
        throw new Error('Worker error: ' + error)
      }
    }

    // Not tested for repeated usage yet
    self.init = function () {
      if (!window.Worker) {
        self.workerError('worker not supported')
        return
      }
      // Worker
      if (!self.worker) {
        self.worker = new Worker(self.workerUrl)
        self.worker.onmessage = self.onWorkerMessage
        self.worker.onerror = self.workerError
      }
      self.workerActive = false
      self.createCanvas()
      self.setVideo(options.video)
      self.setSubUrl(options.subUrl)
      self.worker.postMessage({
        target: 'worker-init',
        width: self.canvas.width,
        height: self.canvas.height,
        URL: document.URL,
        currentScript: self.workerUrl,
        preMain: true,
        subUrl: self.subUrl,
        subContent: self.subContent,
        fonts: self.fonts,
        availableFonts: self.availableFonts,
        targetFps: self.targetFps,
        libassMemoryLimit: self.libassMemoryLimit,
        libassGlyphLimit: self.libassGlyphLimit,
        dropAllAnimations: self.dropAllAnimations
      })
      self.pushOffscreenCanvas()
      self.initDone = true
    }
    self.pushOffscreenCanvas = function () {
      const canvasControl = self.canvas.transferControlToOffscreen()
      self.worker.postMessage({
        target: 'offscreenCanvas',
        canvas: canvasControl
      }, [canvasControl])
    }

    self.createCanvas = function () {
      if (self.video) {
        self.isOurCanvas = true
        self.canvas = document.createElement('canvas')
        self.canvas.className = 'libassjs-canvas'
        self.canvas.style.display = 'none'
        self.canvas.id = 'subtitleCanvas'

        self.canvasParent = document.createElement('div')
        self.canvasParent.className = 'libassjs-canvas-parent'
        self.canvasParent.appendChild(self.canvas)

        if (self.video.nextSibling) {
          self.video.parentNode.insertBefore(self.canvasParent, self.video.nextSibling)
        } else {
          self.video.parentNode.appendChild(self.canvasParent)
        }
      } else {
        if (!self.canvas) {
          self.workerError('Don\'t know where to render: you should give video or canvas in options.')
        }
      }
    }

    self.setVideo = function (video) {
      self.video = video
      if (self.video) {
        const timeupdate = function () {
          self.setCurrentTime(video.currentTime + self.timeOffset)
        }
        self.video.addEventListener('timeupdate', timeupdate, false)
        self.video.addEventListener('playing', function () {
          self.setIsPaused(false, video.currentTime + self.timeOffset)
        }, false)
        self.video.addEventListener('pause', function () {
          self.setIsPaused(true, video.currentTime + self.timeOffset)
        }, false)
        self.video.addEventListener('seeking', function () {
          self.video.removeEventListener('timeupdate', timeupdate)
        }, false)
        self.video.addEventListener('seeked', function () {
          self.video.addEventListener('timeupdate', timeupdate, false)
          self.setCurrentTime(video.currentTime + self.timeOffset)
          if (self.renderAhead > 0) {
            _cleanPastRendered(video.currentTime + self.timeOffset, true)
          }
        }, false)
        self.video.addEventListener('ratechange', function () {
          self.setRate(video.playbackRate)
        }, false)
        self.video.addEventListener('timeupdate', function () {
          self.setCurrentTime(video.currentTime + self.timeOffset)
        }, false)
        self.video.addEventListener('waiting', function () {
          self.setIsPaused(true, video.currentTime + self.timeOffset)
        }, false)

        document.addEventListener('fullscreenchange', self.resizeWithTimeout, false)
        document.addEventListener('mozfullscreenchange', self.resizeWithTimeout, false)
        document.addEventListener('webkitfullscreenchange', self.resizeWithTimeout, false)
        document.addEventListener('msfullscreenchange', self.resizeWithTimeout, false)
        window.addEventListener('resize', self.resizeWithTimeout, false)

        // Support Element Resize Observer
        if (typeof ResizeObserver !== 'undefined') {
          self.ro = new ResizeObserver(self.resizeWithTimeout)
          self.ro.observe(self.video)
        }

        if (self.video.videoWidth > 0) {
          self.resize()
        } else {
          self.video.addEventListener('loadedmetadata', function (e) {
            self.resize()
          }, false)
        }
      }
    }

    self.getVideoPosition = function () {
      const videoRatio = self.video.videoWidth / self.video.videoHeight
      const width = self.video.offsetWidth; const height = self.video.offsetHeight
      const elementRatio = width / height
      let realWidth = width; let realHeight = height
      if (elementRatio > videoRatio) { realWidth = Math.floor(height * videoRatio) } else { realHeight = Math.floor(width / videoRatio) }

      const x = (width - realWidth) / 2
      const y = (height - realHeight) / 2

      return {
        width: realWidth,
        height: realHeight,
        x: x,
        y: y
      }
    }

    self.setSubUrl = function (subUrl) {
      self.subUrl = subUrl
    }

    self.workerActive = false
    self.frameId = 0
    self.onWorkerMessage = function (event) {
      if (!self.workerActive) {
        self.workerActive = true
        if (self.onReadyEvent) {
          self.onReadyEvent()
        }
      }
      const data = event.data
      switch (data.target) {
        case 'stdout': {
          console.log(data.content)
          break
        }
        case 'console-log': {
          console.log.apply(console, JSON.parse(data.content))
          break
        }
        case 'console-debug': {
          console.debug.apply(console, JSON.parse(data.content))
          break
        }
        case 'console-info': {
          console.info.apply(console, JSON.parse(data.content))
          break
        }
        case 'console-warn': {
          console.warn.apply(console, JSON.parse(data.content))
          break
        }
        case 'console-error': {
          console.error.apply(console, JSON.parse(data.content))
          break
        }
        case 'stderr': {
          console.error(data.content)
          break
        }
        case 'window': {
          window[data.method]()
          break
        }
        case 'ready': {
          break
        }
        case 'canvas': {
          switch (data.op) {
            case 'resize': {
              self.resize(data.width, data.height)
              break
            }
            case 'setObjectProperty': {
              self.canvas[data.object][data.property] = data.value
              break
            }
            case 'tick': {
              self.frameId = data.id
              self.worker.postMessage({
                target: 'tock',
                id: self.frameId
              })
              break
            }
            case 'custom': {
              if (self.onCustomMessage) {
                self.onCustomMessage(event)
              } else {
                console.error('Custom message received but client onCustomMessage not implemented.')
              }
              break
            }
            case 'setimmediate': {
              self.worker.postMessage({
                target: 'setimmediate'
              })
              break
            }
            case 'get-events': {
              console.log(data.target)
              console.log(data.events)
              break
            }
            case 'get-styles': {
              console.log(data.target)
              console.log(data.styles)
              break
            }
            default:
              throw data.target
          }
        }
      }
    }

    function _computeCanvasSize (width, height) {
      if (self.prescaleTradeoff === null) {
        if (height > self.hardHeightLimit) {
          width = width * self.hardHeightLimit / height
          height = self.hardHeightLimit
        }
      } else if (self.prescaleTradeoff > 1) {
        if (height * self.prescaleTradeoff <= self.softHeightLimit) {
          width *= self.prescaleTradeoff
          height *= self.prescaleTradeoff
        } else if (height < self.softHeightLimit) {
          width = width * self.softHeightLimit / height
          height = self.softHeightLimit
        } else if (height >= self.hardHeightLimit) {
          width = width * self.hardHeightLimit / height
          height = self.hardHeightLimit
        }
      } else if (height >= self.softHeightLimit) {
        if (height * self.prescaleTradeoff <= self.softHeightLimit) {
          width = width * self.softHeightLimit / height
          height = self.softHeightLimit
        } else if (height * self.prescaleTradeoff <= self.hardHeightLimit) {
          width *= self.prescaleTradeoff
          height *= self.prescaleTradeoff
        } else {
          width = width * self.hardHeightLimit / height
          height = self.hardHeightLimit
        }
      }

      return { width: width, height: height }
    }

    self.resize = function (width, height, top, left) {
      let videoSize = null
      top = top || 0
      left = left || 0
      if ((!width || !height) && self.video) {
        videoSize = self.getVideoPosition()
        const newsize = _computeCanvasSize(videoSize.width * self.pixelRatio, videoSize.height * self.pixelRatio)
        width = newsize.width
        height = newsize.height
        const offset = self.canvasParent.getBoundingClientRect().top - self.video.getBoundingClientRect().top
        top = videoSize.y - offset
        left = videoSize.x
      }
      if (!width || !height) {
        if (!self.video) {
          console.error('width or height is 0. You should specify width & height for resize.')
        }
        return
      }

      if (self.canvas.width !== width ||
        self.canvas.height !== height ||
        self.canvas.style.top !== top ||
        self.canvas.style.left !== left) {
        if (videoSize != null) {
          self.canvasParent.style.position = 'relative'
          self.canvas.style.display = 'block'
          self.canvas.style.position = 'absolute'
          self.canvas.style.top = top + 'px'
          self.canvas.style.left = left + 'px'
          self.canvas.style.pointerEvents = 'none'
        }
        if (!(self.canvas.width === width && self.canvas.height === height)) {
          // only re-paint if dimensions actually changed
          if (self.initDone) {
            self.canvasParent.remove()
            self.canvasParent = undefined
            self.createCanvas()
          }
          function rePaint () {
            if (self.canvasParent && self.initDone) {
              self.canvasParent.remove()
              self.createCanvas()
            }
            self.canvas.width = width
            self.canvas.height = height
            if (videoSize != null) {
              self.canvasParent.style.position = 'relative'
              self.canvas.style.display = 'block'
              self.canvas.style.position = 'absolute'
              self.canvas.style.top = top + 'px'
              self.canvas.style.left = left + 'px'
              self.canvas.style.pointerEvents = 'none'
            }
            if (self.initDone) {
              self.pushOffscreenCanvas()
            }
            self.worker.postMessage({
              target: 'canvas',
              width: self.canvas.width,
              height: self.canvas.height
            })
          }
          // dont spam re-paints like crazy when re-sizing with animations, but still update instantly without them
          if (self.resizeTimeoutBuffer) {
            clearTimeout(self.resizeTimeoutBuffer)
            self.resizeTimeoutBuffer = setTimeout(() => {
              self.resizeTimeoutBuffer = undefined
              rePaint()
            }, 50)
          } else {
            rePaint()
            self.resizeTimeoutBuffer = setTimeout(() => {
              self.resizeTimeoutBuffer = undefined
            }, 50)
          }
        }
      }
    }

    self.resizeWithTimeout = function () {
      self.resize()
    }

    self.runBenchmark = function () {
      self.worker.postMessage({
        target: 'runBenchmark'
      })
    }

    self.customMessage = function (data, options) {
      options = options || {}
      self.worker.postMessage({
        target: 'custom',
        userData: data,
        preMain: options.preMain
      })
    }

    self.setCurrentTime = function (currentTime) {
      self.worker.postMessage({
        target: 'video',
        currentTime: currentTime
      })
    }

    self.setTrackByUrl = function (url) {
      self.worker.postMessage({
        target: 'set-track-by-url',
        url: url
      })
    }

    self.setTrack = function (content) {
      self.worker.postMessage({
        target: 'set-track',
        content: content
      })
    }

    self.freeTrack = function (content) {
      self.worker.postMessage({
        target: 'free-track'
      })
    }

    self.render = self.setCurrentTime

    self.setIsPaused = function (isPaused, currentTime) {
      self.worker.postMessage({
        target: 'video',
        isPaused: isPaused,
        currentTime: currentTime
      })
    }

    self.setRate = function (rate) {
      self.worker.postMessage({
        target: 'video',
        rate: rate
      })
    }

    self.dispose = function () {
      self.worker.postMessage({
        target: 'destroy'
      })

      self.worker.terminate()
      self.workerActive = false
      // Remove the canvas element to remove residual subtitles rendered on player
      if (self.video) {
        self.video.parentNode.removeChild(self.canvasParent)
      }
    }

    self.createEvent = function (event) {
      self.worker.postMessage({
        target: 'create-event',
        event: event
      })
    }

    self.getEvents = function () {
      self.worker.postMessage({
        target: 'get-events'
      })
    }

    self.setEvent = function (event, index) {
      self.worker.postMessage({
        target: 'set-event',
        event: event,
        index: index
      })
    }

    self.removeEvent = function (index) {
      self.worker.postMessage({
        target: 'remove-event',
        index: index
      })
    }

    self.createStyle = function (style) {
      self.worker.postMessage({
        target: 'create-style',
        style: style
      })
    }

    self.getStyles = function () {
      self.worker.postMessage({
        target: 'get-styles'
      })
    }

    self.setStyle = function (style, index) {
      self.worker.postMessage({
        target: 'set-style',
        style: style,
        index: index
      })
    }

    self.removeStyle = function (index) {
      self.worker.postMessage({
        target: 'remove-style',
        index: index
      })
    }

    self.init()
  }
}
