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
    console.log('WebAssembly support detected: ' + (supportsWebAssembly ? 'yes' : 'no'))

    const self = this
    self.canvas = options.canvas // HTML canvas element (optional if video specified)
    self.renderMode = options.renderMode || (options.lossyRender ? 'fast' : (options.blendRender ? 'blend' : 'normal'))

    // play with those when you need some speed, e.g. for slow devices
    self.dropAllAnimations = options.dropAllAnimations || false
    self.libassMemoryLimit = options.libassMemoryLimit || 0 // set libass bitmap cache memory limit in MiB (approximate)
    self.libassGlyphLimit = options.libassGlyphLimit || 0 // set libass glyph cache memory limit in MiB (approximate)
    self.targetFps = options.targetFps || 23.976
    self.prescaleTradeoff = options.prescaleTradeoff || null // render subtitles less than viewport when less than 1.0 to improve speed, render to more than 1.0 to improve quality; set to null to disable scaling
    self.softHeightLimit = options.softHeightLimit || 1080 // don't apply prescaleTradeoff < 1 when viewport height is less that this limit
    self.hardHeightLimit = options.hardHeightLimit || 2160 // don't ever go above this limit
    self.resizeVariation = options.resizeVariation || 0.2 // by how many a size can vary before it would cause clearance of prerendered buffer

    self.renderAhead = options.renderAhead || 0 // how many MiB to render ahead and store; 0 to disable (approximate)
    self.isOurCanvas = false // (internal) we created canvas and manage it
    self.video = options.video // HTML video element (optional if canvas specified)
    self.canvasParent = null // (internal) HTML canvas parent element
    self.fonts = options.fonts || [] // Array with links to fonts used in sub (optional)
    self.availableFonts = options.availableFonts || [] // Object with all available fonts (optional). Key is font name in lower case, value is link: {"arial": "/font1.ttf"}
    self.onReadyEvent = options.onReady // Function called when SubtitlesOctopus is ready (optional)
    if (supportsWebAssembly) {
      self.workerUrl = options.workerUrl || 'subtitles-octopus-worker.js' // Link to WebAssembly worker
    } else {
      self.workerUrl = options.legacyWorkerUrl || 'subtitles-octopus-worker-legacy.js' // Link to legacy worker
    }
    self.subUrl = options.subUrl // Link to sub file (optional if subContent specified)
    self.subContent = options.subContent || null // Sub content (optional if subUrl specified)
    self.onErrorEvent = options.onError // Function called in case of critical error meaning sub wouldn't be shown and you should use alternative method (for instance it occurs if browser doesn't support web workers).
    self.debug = options.debug || false // When debug enabled, some performance info printed in console.
    self.lastRenderTime = 0 // (internal) Last time we got some frame from worker
    self.pixelRatio = window.devicePixelRatio || 1 // (internal) Device pixel ratio (for high dpi devices)

    self.timeOffset = options.timeOffset || 0 // Time offset would be applied to currentTime from video (option)

    self.renderedItems = [] // used to store items rendered ahead when renderAhead > 0
    self.renderAhead = self.renderAhead * 1024 * 1024 * 0.9 /* try to eat less than requested */
    self.oneshotState = {
      eventStart: null,
      eventOver: false,
      iteration: 0,
      renderRequested: false,
      requestNextTimestamp: -1,
      prevWidth: null,
      prevHeight: null
    }

    self.hasAlphaBug = false;

    (function () {
      if (typeof ImageData.prototype.constructor === 'function') {
        try {
          // try actually calling ImageData, as on some browsers it's reported
          // as existing but calling it errors out as "TypeError: Illegal constructor"
          const test = new window.ImageData(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1)
          return
        } catch (e) {
          console.log('detected that ImageData is not constructable despite browser saying so')
        }
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      window.ImageData = function () {
        let i = 0
        let data
        if (arguments[0] instanceof Uint8ClampedArray) {
          data = arguments[i++]
        }
        const width = arguments[i++]
        const height = arguments[i]

        const imageData = ctx.createImageData(width, height)
        if (data) imageData.data.set(data)
        return imageData
      }
    })()

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
        renderMode: self.renderMode,
        subUrl: self.subUrl,
        subContent: self.subContent,
        fonts: self.fonts,
        availableFonts: self.availableFonts,
        debug: self.debug,
        targetFps: self.targetFps,
        libassMemoryLimit: self.libassMemoryLimit,
        libassGlyphLimit: self.libassGlyphLimit,
        renderOnDemand: self.renderAhead > 0,
        dropAllAnimations: self.dropAllAnimations
      })
      if (self.renderMode === 'offscreenCanvas') {
        self.pushOffscreenCanvas()
        self.initDone = true
      }
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
      if (!(self.renderMode === 'offscreenCanvas')) {
        self.ctx = self.canvas.getContext('2d')
      }
      self.bufferCanvas = document.createElement('canvas')
      self.bufferCanvasCtx = self.bufferCanvas.getContext('2d')
      self.bufferCanvas2 = document.createElement('canvas')
      self.bufferCanvasCtx2 = self.bufferCanvas.getContext('2d')

      // test for alpha bug, where e.g. WebKit can render a transparent pixel
      // (with alpha == 0) as non-black which then leads to visual artifacts
      self.bufferCanvas.width = 1
      self.bufferCanvas.height = 1
      self.bufferCanvas2.width = 1
      self.bufferCanvas2.height = 1
      const testBuf = new Uint8ClampedArray([0, 255, 0, 0])
      const testImage = new ImageData(testBuf, 1, 1)
      self.bufferCanvasCtx.clearRect(0, 0, 1, 1)
      self.bufferCanvasCtx2.clearRect(0, 0, 1, 1)
      const prePut = self.bufferCanvasCtx2.getImageData(0, 0, 1, 1).data
      self.bufferCanvasCtx.putImageData(testImage, 0, 0)
      self.bufferCanvasCtx2.drawImage(self.bufferCanvas, 0, 0)
      const postPut = self.bufferCanvasCtx2.getImageData(0, 0, 1, 1).data
      self.hasAlphaBug = prePut[1] !== postPut[1]
      if (self.hasAlphaBug) {
        console.log('Detected a browser having issue with transparent pixels, applying workaround')
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

    function _cleanPastRendered (currentTime, seekClean) {
      let retainedItems = []
      for (const item in self.renderedItems) {
        if (item.emptyFinish < 0 || item.emptyFinish >= currentTime) {
          // item is not yet finished, retain it
          retainedItems.push(item)
        }
      }

      if (seekClean && retainedItems.length > 0) {
        // items are ordered by event start time when we push to self.renderedItems,
        // so first item is the earliest
        if (currentTime < retainedItems[0].eventStart) {
          if (retainedItems[0].eventStart - currentTime > 60) {
            console.info('seeked back too far, cleaning prerender buffer')
            retainedItems = []
          } else {
            console.info('seeked backwards, need to free up some buffer')
            let size = 0; const limit = self.renderAhead * 0.3 /* try to take no more than 1/3 of buffer */
            const retain = []
            for (const item in retainedItems) {
              size += item.size
              if (size >= limit) { break }
              retain.push(item)
            }
            retainedItems = retain
          }
        }
      }

      const removed = retainedItems.length < self.renderedItems
      self.renderedItems = retainedItems
      return removed
    }

    function tryRequestOneshot (currentTime, renderNow) {
      if (!self.renderAhead || self.renderAhead <= 0) { return }
      if (self.oneshotState.renderRequested && !renderNow) { return }

      if (typeof currentTime === 'undefined') {
        if (!self.video) { return }
        currentTime = self.video.currentTime + self.timeOffset
      }

      let size = 0
      for (let i = 0, len = self.renderedItems.length; i < len; i++) {
        const item = self.renderedItems[i]
        if (item.emptyFinish < 0) {
          console.info('oneshot already reached end-of-events')
          return
        }
        if (currentTime >= item.eventStart && currentTime < item.emptyFinish) {
          // an event for requested time already exists
          console.debug('not requesting a render for ' + currentTime +
            ' as event already covering it exists (start=' +
            item.eventStart + ', empty=' + item.emptyFinish + ')')
          return
        }
        size += item.size
      }

      if (size <= self.renderAhead) {
        lastRendered = currentTime - (renderNow ? 0 : 0.001)
        if (!self.oneshotState.renderRequested) {
          self.oneshotState.renderRequested = true
          self.worker.postMessage({
            target: 'oneshot-render',
            lastRendered: lastRendered,
            renderNow: renderNow,
            iteration: self.oneshotState.iteration
          })
        } else {
          if (self.workerActive) {
            console.info('worker busy, requesting to seek')
          }
          self.oneshotState.requestNextTimestamp = lastRendered
        }
      }
    }

    function _renderSubtitleEvent (event, currentTime) {
      const eventOver = event.eventFinish < currentTime
      if (self.oneshotState.eventStart === event.eventStart && self.oneshotState.eventOver === eventOver) { return }
      self.oneshotState.eventStart = event.eventStart
      self.oneshotState.eventOver = eventOver

      const beforeDrawTime = performance.now()
      if (event.viewport.width !== self.canvas.width || event.viewport.height !== self.canvas.height) {
        self.canvas.width = event.viewport.width
        self.canvas.height = event.viewport.height
      }
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
      if (!eventOver) {
        for (let i = 0; i < event.items.length; i++) {
          const image = event.items[i]
          self.bufferCanvas.width = image.w
          self.bufferCanvas.height = image.h
          self.bufferCanvasCtx.putImageData(image.image, 0, 0)
          self.ctx.drawImage(self.bufferCanvas, image.x, image.y)
        }
      }
      if (self.debug) {
        const drawTime = Math.round(performance.now() - beforeDrawTime)
        console.log('render: ' + Math.round(event.spentTime - event.blendTime) + ' ms, blend: ' + Math.round(event.blendTime) + ' ms, draw: ' + drawTime + ' ms')
      }
    }

    function oneshotRender () {
      window.requestAnimationFrame(oneshotRender)
      if (!self.video) { return }

      const currentTime = self.video.currentTime + self.timeOffset
      let finishTime = -1; let eventShown = false; let animated = false
      for (let i = 0, len = self.renderedItems.length; i < len; i++) {
        const item = self.renderedItems[i]
        if (!eventShown && item.eventStart <= currentTime && (item.emptyFinish < 0 || item.emptyFinish > currentTime)) {
          _renderSubtitleEvent(item, currentTime)
          eventShown = true
          finishTime = item.emptyFinish
        } else if (finishTime >= 0) {
          // we've already found a known event, now find
          // the farthest point of consequent events
          // NOTE: self.renderedItems may have gaps due to seeking
          if (item.eventStart - finishTime < 0.01) {
            finishTime = item.emptyFinish
            animated = item.animated
          } else {
            break
          }
        }
      }

      if (!eventShown) {
        if (Math.abs(self.oneshotState.requestNextTimestamp - currentTime) > 0.01) {
          _cleanPastRendered(currentTime)
          tryRequestOneshot(currentTime, true)
        }
      } else if (_cleanPastRendered(currentTime) && finishTime >= 0) {
        tryRequestOneshot(finishTime, animated)
      }
    }

    self.resetRenderAheadCache = function (isResizing) {
      if (self.renderAhead > 0) {
        const newCache = []
        if (isResizing && self.oneshotState.prevHeight && self.oneshotState.prevWidth) {
          if (self.oneshotState.prevHeight === self.canvas.height &&
            self.oneshotState.prevWidth === self.canvas.width) { return }
          let timeLimit = 10; let sizeLimit = self.renderAhead * 0.3
          if (self.canvas.height >= self.oneshotState.prevHeight * (1.0 - self.resizeVariation) &&
            self.canvas.height <= self.oneshotState.prevHeight * (1.0 + self.resizeVariation) &&
            self.canvas.width >= self.oneshotState.prevWidth * (1.0 - self.resizeVariation) &&
            self.canvas.width <= self.oneshotState.prevWidth * (1.0 + self.resizeVariation)) {
            console.debug('viewport changes are small, leaving more of prerendered buffer')
            timeLimit = 30
            sizeLimit = self.renderAhead * 0.5
          }
          const stopTime = self.video.currentTime + self.timeOffset + timeLimit
          let size = 0
          for (let i = 0; i < self.renderedItems.length; i++) {
            const item = self.renderedItems[i]
            if (item.emptyFinish < 0 || item.emptyFinish >= stopTime) { break }
            size += item.size
            if (size >= sizeLimit) { break }
            newCache.push(item)
          }
        }

        console.info('resetting prerender cache')
        self.renderedItems = newCache
        self.oneshotState.eventStart = null
        self.oneshotState.iteration++
        self.oneshotState.renderRequested = false
        self.oneshotState.prevHeight = self.canvas.height
        self.oneshotState.prevWidth = self.canvas.width

        window.requestAnimationFrame(oneshotRender)
        tryRequestOneshot(undefined, true)
      }
    }

    self.renderFrameData = null
    function renderFrames () {
      const data = self.renderFramesData
      const beforeDrawTime = performance.now()
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
      for (let i = 0; i < data.canvases.length; i++) {
        const image = data.canvases[i]
        self.bufferCanvas.width = image.w
        self.bufferCanvas.height = image.h
        const imageBuffer = new Uint8ClampedArray(image.buffer)
        if (self.hasAlphaBug) {
          for (let j = 3; j < imageBuffer.length; j = j + 4) {
            imageBuffer[j] = (imageBuffer[j] >= 1) ? imageBuffer[j] : 1
          }
        }
        const imageData = new ImageData(imageBuffer, image.w, image.h)
        self.bufferCanvasCtx.putImageData(imageData, 0, 0)
        self.ctx.drawImage(self.bufferCanvas, image.x, image.y)
      }
      if (self.debug) {
        const drawTime = Math.round(performance.now() - beforeDrawTime)
        const blendTime = data.blendTime
        if (typeof blendTime !== 'undefined') {
          console.log('render: ' + Math.round(data.spentTime - blendTime) + ' ms, blend: ' + Math.round(blendTime) + ' ms, draw: ' + drawTime + ' ms; TOTAL=' + Math.round(data.spentTime + drawTime) + ' ms')
        } else {
          console.log(Math.round(data.spentTime) + ' ms (+ ' + drawTime + ' ms draw)')
        }
        self.renderStart = performance.now()
      }
    }

    /**
       * Lossy Render Mode
       *
       */
    function renderFastFrames () {
      const data = self.renderFramesData
      const beforeDrawTime = performance.now()
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
      for (let i = 0; i < data.bitmaps.length; i++) {
        const image = data.bitmaps[i]
        self.ctx.drawImage(image.bitmap, image.x, image.y)
      }
      if (self.debug) {
        const drawTime = Math.round(performance.now() - beforeDrawTime)
        console.log(data.bitmaps.length + ' bitmaps, libass: ' + Math.round(data.libassTime) + 'ms, decode: ' + Math.round(data.decodeTime) + 'ms, draw: ' + drawTime + 'ms')
        self.renderStart = performance.now()
      }
    }

    self.workerActive = false
    self.frameId = 0
    self.onWorkerMessage = function (event) {
      // dump('\nclient got ' + JSON.stringify(event.data).substr(0, 150) + '\n');
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
            case 'getContext': {
              if (!(self.renderMode === 'offscreenCanvas')) { self.ctx = self.canvas.getContext(data.type, data.attributes) }
              break
            }
            case 'resize': {
              self.resize(data.width, data.height)
              break
            }
            case 'renderCanvas': {
              if (self.lastRenderTime < data.time) {
                self.lastRenderTime = data.time
                self.renderFramesData = data
                window.requestAnimationFrame(renderFrames)
              }
              break
            }
            case 'renderFastCanvas': {
              if (self.lastRenderTime < data.time) {
                self.lastRenderTime = data.time
                self.renderFramesData = data
                window.requestAnimationFrame(renderFastFrames)
              }
              break
            }
            case 'setObjectProperty': {
              self.canvas[data.object][data.property] = data.value
              break
            }
            case 'oneshot-result': {
              if (data.iteration !== self.oneshotState.iteration) {
                console.debug('received stale prerender, ignoring')
                return
              }

              if (self.debug) {
                console.info('oneshot received (start=' +
                  data.eventStart + ', empty=' + data.emptyFinish +
                  '), render: ' + Math.round(data.spentTime) + ' ms')
              }
              self.oneshotState.renderRequested = false
              if (Math.abs(data.lastRenderedTime - self.oneshotState.requestNextTimestamp) < 0.01) {
                self.oneshotState.requestNextTimestamp = -1
              }
              if (data.eventStart - data.lastRenderedTime > 0.01) {
                // generate bogus empty element, so all timeline is covered anyway
                self.renderedItems.push({
                  eventStart: data.lastRenderedTime,
                  eventFinish: data.lastRenderedTime - 0.001,
                  emptyFinish: data.eventStart,
                  viewport: data.viewport,
                  spentTime: 0,
                  blendTime: 0,
                  items: [],
                  animated: false,
                  size: 0
                })
              }

              const items = []
              let size = 0
              for (let i = 0, len = data.canvases.length; i < len; i++) {
                const item = data.canvases[i]
                items.push({
                  w: item.w,
                  h: item.h,
                  x: item.x,
                  y: item.y,
                  image: new ImageData(new Uint8ClampedArray(item.buffer), item.w, item.h)
                })
                size += item.buffer.byteLength
              }

              let eventSplitted = false
              if ((data.emptyFinish > 0 && data.emptyFinish - data.eventStart < 1.0 / self.targetFps) || data.animated) {
                const newFinish = data.eventStart + 1.0 / self.targetFps
                data.emptyFinish = newFinish
                data.eventFinish = newFinish
                eventSplitted = true
              }
              self.renderedItems.push({
                eventStart: data.eventStart,
                eventFinish: data.eventFinish,
                emptyFinish: data.emptyFinish,
                spentTime: data.spentTime,
                blendTime: data.blendTime,
                viewport: data.viewport,
                items: items,
                animated: data.animated,
                size: size
              })

              self.renderedItems.sort(function (a, b) {
                return a.eventStart - b.eventStart
              })

              if (self.oneshotState.requestNextTimestamp >= 0) {
                // requesting an out of order event render
                tryRequestOneshot(self.oneshotState.requestNextTimestamp, true)
              } else if (data.eventStart < 0) {
                console.info('oneshot received "end of frames" event')
              } else if (data.emptyFinish >= 0) {
                // there's some more event to render, try requesting next event
                tryRequestOneshot(data.emptyFinish, eventSplitted)
              } else {
                console.info('there are no more events to prerender')
              }
              break
            }
            default:
              console.error('eh?')
          }
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
          if (self.renderMode === 'offscreenCanvas' && self.initDone) {
            self.canvasParent.remove()
            self.canvasParent = undefined
            self.createCanvas()
          }
          function rePaint () {
            if (self.canvasParent && self.renderMode === 'offscreenCanvas' && self.initDone) {
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
            if (self.renderMode === 'offscreenCanvas' && self.initDone) {
              self.pushOffscreenCanvas()
            }
            self.worker.postMessage({
              target: 'canvas',
              width: self.canvas.width,
              height: self.canvas.height
            })
            self.resetRenderAheadCache(true)
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
      self.resetRenderAheadCache(false)
    }

    self.setTrack = function (content) {
      self.worker.postMessage({
        target: 'set-track',
        content: content
      })
      self.resetRenderAheadCache(false)
    }

    self.freeTrack = function (content) {
      self.worker.postMessage({
        target: 'free-track'
      })
      self.resetRenderAheadCache(false)
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

if (typeof SubtitlesOctopusOnLoad === 'function') {
  SubtitlesOctopusOnLoad()
}

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = SubtitlesOctopus
  }
}
