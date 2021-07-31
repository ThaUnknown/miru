var Module = typeof Module !== 'undefined' ? Module : {}
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0
}
Module.expectedDataFileDownloads++;
(function () {
  var loadPackage = function (metadata) {
    function runWithFS () {
      Module.FS_createPath('/', 'assets', true, true)
      var fileData0 = []
      fileData0.push.apply(fileData0, [60, 63, 120, 109, 108, 32, 118, 101, 114, 115, 105, 111, 110, 61, 34, 49, 46, 48, 34, 63, 62, 10, 60, 33, 68, 79, 67, 84, 89, 80, 69, 32, 102, 111, 110, 116, 99, 111, 110, 102, 105, 103, 32, 83, 89, 83, 84, 69, 77, 32, 34, 102, 111, 110, 116, 115, 46, 100, 116, 100, 34, 62, 10, 60, 102, 111, 110, 116, 99, 111, 110, 102, 105, 103, 62, 10, 9, 60, 100, 105, 114, 62, 47, 102, 111, 110, 116, 115, 60, 47, 100, 105, 114, 62, 10, 9, 60, 109, 97, 116, 99, 104, 32, 116, 97, 114, 103, 101, 116, 61, 34, 112, 97, 116, 116, 101, 114, 110, 34, 62, 10, 9, 9, 60, 116, 101, 115, 116, 32, 113, 117, 97, 108, 61, 34, 97, 110, 121, 34, 32, 110, 97, 109, 101, 61, 34, 102, 97, 109, 105, 108, 121, 34, 62, 10, 9, 9, 9, 60, 115, 116, 114, 105, 110, 103, 62, 109, 111, 110, 111, 60, 47, 115, 116, 114, 105, 110, 103, 62, 10, 9, 9, 60, 47, 116, 101, 115, 116, 62, 10, 9, 9, 60, 101, 100, 105, 116, 32, 110, 97, 109, 101, 61, 34, 102, 97, 109, 105, 108, 121, 34, 32, 109, 111, 100, 101, 61, 34, 97, 115, 115, 105, 103, 110, 34, 32, 98, 105, 110, 100, 105, 110, 103, 61, 34, 115, 97, 109, 101, 34, 62, 10, 9, 9, 9, 60, 115, 116, 114, 105, 110, 103, 62, 109, 111, 110, 111, 115, 112, 97, 99, 101, 60, 47, 115, 116, 114, 105, 110, 103, 62, 10, 9, 9, 60, 47, 101, 100, 105, 116, 62, 10, 9, 60, 47, 109, 97, 116, 99, 104, 62, 10, 9, 60, 109, 97, 116, 99, 104, 32, 116, 97, 114, 103, 101, 116, 61, 34, 112, 97, 116, 116, 101, 114, 110, 34, 62, 10, 9, 9, 60, 116, 101, 115, 116, 32, 113, 117, 97, 108, 61, 34, 97, 110, 121, 34, 32, 110, 97, 109, 101, 61, 34, 102, 97, 109, 105, 108, 121, 34, 62, 10, 9, 9, 9, 60, 115, 116, 114, 105, 110, 103, 62, 115, 97, 110, 115, 32, 115, 101, 114, 105, 102, 60, 47, 115, 116, 114, 105, 110, 103, 62, 10, 9, 9, 60, 47, 116, 101, 115, 116, 62, 10, 9, 9, 60, 101, 100, 105, 116, 32, 110, 97, 109, 101, 61, 34, 102, 97, 109, 105, 108, 121, 34, 32, 109, 111, 100, 101, 61, 34, 97, 115, 115, 105, 103, 110, 34, 32, 98, 105, 110, 100, 105, 110, 103, 61, 34, 115, 97, 109, 101, 34, 62, 10, 9, 9, 9, 60, 115, 116, 114, 105, 110, 103, 62, 115, 97, 110, 115, 45, 115, 101, 114, 105, 102, 60, 47, 115, 116, 114, 105, 110, 103, 62, 10, 9, 9, 60, 47, 101, 100, 105, 116, 62, 10, 9, 60, 47, 109, 97, 116, 99, 104, 62, 10, 9, 60, 109, 97, 116, 99, 104, 32, 116, 97, 114, 103, 101, 116, 61, 34, 112, 97, 116, 116, 101, 114, 110, 34, 62, 10, 9, 9, 60, 116, 101, 115, 116, 32, 113, 117, 97, 108, 61, 34, 97, 110, 121, 34, 32, 110, 97, 109, 101, 61, 34, 102, 97, 109, 105, 108, 121, 34, 62, 10, 9, 9, 9, 60, 115, 116, 114, 105, 110, 103, 62, 115, 97, 110, 115, 60, 47, 115, 116, 114, 105, 110, 103, 62, 10, 9, 9, 60, 47, 116, 101, 115, 116, 62, 10, 9, 9, 60, 101, 100, 105, 116, 32, 110, 97, 109, 101, 61, 34, 102, 97, 109, 105, 108, 121, 34, 32, 109, 111, 100, 101, 61, 34, 97, 115, 115, 105, 103, 110, 34, 32, 98, 105, 110, 100, 105, 110, 103, 61, 34, 115, 97, 109, 101, 34, 62, 10, 9, 9, 9, 60, 115, 116, 114, 105, 110, 103, 62, 115, 97, 110, 115, 45, 115, 101, 114, 105, 102, 60, 47, 115, 116, 114, 105, 110, 103, 62, 10, 9, 9, 60, 47, 101, 100, 105, 116, 62, 10, 9, 60, 47, 109, 97, 116, 99, 104, 62, 10, 9, 60, 99, 97, 99, 104, 101, 100, 105, 114, 62, 47, 46, 102, 111, 110, 116, 99, 111, 110, 102, 105, 103, 60, 47, 99, 97, 99, 104, 101, 100, 105, 114, 62, 10, 9, 60, 99, 111, 110, 102, 105, 103, 62, 10, 9, 9, 60, 114, 101, 115, 99, 97, 110, 62, 10, 9, 9, 9, 60, 105, 110, 116, 62, 51, 48, 60, 47, 105, 110, 116, 62, 10, 9, 9, 60, 47, 114, 101, 115, 99, 97, 110, 62, 10, 9, 60, 47, 99, 111, 110, 102, 105, 103, 62, 10, 60, 47, 102, 111, 110, 116, 99, 111, 110, 102, 105, 103, 62, 10])
      Module.FS_createDataFile('/assets', 'fonts.conf', fileData0, true, true, false)
    }
    if (Module.calledRun) {
      runWithFS()
    } else {
      if (!Module.preRun) Module.preRun = []
      Module.preRun.push(runWithFS)
    }
  }
  loadPackage({
    files: []
  })
})()
/* eslint camelcase: 0, no-return-assign: 0, no-var: 0, prefer-regex-literals: 0, no-control-regex: 0 */
Module = Module || {}

Module.preRun = Module.preRun || []

Module.preRun.push(() => {
  let i
  Module.FS_createFolder('/', 'fonts', true, true)
  Module.FS_createFolder('/', '.fontconfig', true, true)

  // We can use sync xhr cause we're inside Web Worker
  if (!self.subContent) self.subContent = read_(self.subUrl)

  let result
  {
    // shit crashes if regex is done correctly, thanks emscripten
    const regex = new RegExp('^fontname((v2:[ \t]*(?<fontName2>[^_]+)_(?<fontProperties2>[^,]*).(?<fontExtension2>[a-z0-9]{3,5}),[ \t]*(?<fontContent2>.+)$)|(:[ \t]*(?<fontName>[^_]+)_(?<fontProperties>[^$]*).(?<fontExtension>[a-z0-9]{3,5})(?<fontContent>(?:\r?\n[\x21-\x60]+)+)))', 'mg')
    while ((result = regex.exec(self.subContent)) !== null) {
      let font
      if ('fontName2' in result.groups && result.groups.fontName2 !== undefined) {
        font = {
          content: self.readDataUri(result.groups.fontContent2),
          id: result.groups.fontName2,
          name: result.groups.fontName2 + '.' + result.groups.fontExtension2
        }
      } else {
        font = {
          content: self.decodeASSFontEncoding(result.groups.fontContent),
          id: result.groups.fontName2,
          name: result.groups.fontName + '.' + result.groups.fontExtension
        }
      }

      self.fontMap_[font.id] = true
      Module.FS.writeFile('/fonts/font' + (self.fontId++) + '-' + font.name, font.content, { encoding: 'binary' })
      console.log('libass: attaching embedded font ' + font.name)
    }
  }

  if ((self.availableFonts && self.availableFonts.length !== 0)) {
    for (const selection of parseAss(self.subContent)) {
      for (const body of selection.body) {
        if (body.key === 'Style') self.writeFontToFS(body.value.Fontname)
      }
    }

    const regex = /\\fn([^\\}]*?)[\\}]/g
    let matches
    while ((matches = regex.exec(self.subContent)) !== null) self.writeFontToFS(matches[1])
  }

  if (self.subContent) Module.FS.writeFile('/sub.ass', self.subContent)

  self.subContent = null

  Module.FS_createLazyFile('/fonts', '.fallback-' + self.fallbackFont.split('/').pop(), self.fallbackFont, true, false)
  for (const file of self.fontFiles || []) {
    Module.FS_createLazyFile('/fonts', 'font' + i + '-' + file.split('/').pop(), file, true, false)
  }
})

Module.onRuntimeInitialized = () => {
  self.octObj = new Module.SubtitleOctopus()
  self.changed = Module._malloc(4)

  if (self.debug) self.octObj.setLogLevel(7)
  self.octObj.initLibrary(screen.width, screen.height, '/fonts/.fallback-' + self.fallbackFont.split('/').pop())
  self.octObj.setDropAnimations(!!self.dropAllAnimations)
  self.octObj.createTrack('/sub.ass')
  self.ass_track = self.octObj.track
  self.ass_library = self.octObj.ass_library
  self.ass_renderer = self.octObj.ass_renderer
  if (self.libassMemoryLimit > 0 || self.libassGlyphLimit > 0) self.octObj.setMemoryLimits(self.libassGlyphLimit, self.libassMemoryLimit)
}

Module.print = function (text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ')
  console.log(text)
}
Module.printErr = function (text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ')
  console.error(text)
}

var moduleOverrides = {}
var key
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key]
  }
}
var arguments_ = []
var thisProgram = './this.program'
var quit_ = function (status, toThrow) {
  throw toThrow
}
var ENVIRONMENT_IS_WEB = false
var ENVIRONMENT_IS_WORKER = false
var ENVIRONMENT_IS_NODE = false
var ENVIRONMENT_IS_SHELL = false
ENVIRONMENT_IS_WEB = typeof window === 'object'
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string'
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER
var scriptDirectory = ''

function locateFile (path) {
  if (Module.locateFile) {
    return Module.locateFile(path, scriptDirectory)
  }
  return scriptDirectory + path
}
var read_, readAsync, readBinary, setWindowTitle
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href
  } else if (document.currentScript) {
    scriptDirectory = document.currentScript.src
  }
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1)
  } else {
    scriptDirectory = ''
  }
  read_ = function shell_read (url) {
    try {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', url, false)
      xhr.send(null)
      return xhr.responseText
    } catch (err) {
      var data = tryParseAsDataURI(url)
      if (data) {
        return intArrayToString(data)
      }
      throw err
    }
  }
  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function readBinary (url) {
      try {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, false)
        xhr.responseType = 'arraybuffer'
        xhr.send(null)
        return new Uint8Array(xhr.response)
      } catch (err) {
        var data = tryParseAsDataURI(url)
        if (data) {
          return data
        }
        throw err
      }
    }
  }
  readAsync = function readAsync (url, onload, onerror) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'arraybuffer'
    xhr.onload = function xhr_onload () {
      if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
        onload(xhr.response)
        return
      }
      var data = tryParseAsDataURI(url)
      if (data) {
        onload(data.buffer)
        return
      }
      onerror()
    }
    xhr.onerror = onerror
    xhr.send(null)
  }

  setWindowTitle = function (title) {
    document.title = title
  }
}
var out = Module.print || console.log.bind(console)
var err = Module.printErr || console.warn.bind(console)
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key]
  }
}
moduleOverrides = null
if (Module.arguments) arguments_ = Module.arguments
if (Module.thisProgram) thisProgram = Module.thisProgram
if (Module.quit) quit_ = Module.quit
var STACK_ALIGN = 16

function dynamicAlloc (size) {
  var ret = HEAP32[DYNAMICTOP_PTR >> 2]
  var end = ret + size + 15 & -16
  HEAP32[DYNAMICTOP_PTR >> 2] = end
  return ret
}

function alignMemory (size, factor) {
  if (!factor) factor = STACK_ALIGN
  return Math.ceil(size / factor) * factor
}
var tempRet0 = 0
var setTempRet0 = function (value) {
  tempRet0 = value
}
var getTempRet0 = function () {
  return tempRet0
}
var wasmBinary
if (Module.wasmBinary) wasmBinary = Module.wasmBinary
var noExitRuntime
if (Module.noExitRuntime) noExitRuntime = Module.noExitRuntime

function getValue (ptr, type, noSafe) {
  type = type || 'i8'
  if (type.charAt(type.length - 1) === '*') type = 'i32'
  switch (type) {
    case 'i1':
      return HEAP8[ptr >> 0]
    case 'i8':
      return HEAP8[ptr >> 0]
    case 'i16':
      return HEAP16[ptr >> 1]
    case 'i32':
      return HEAP32[ptr >> 2]
    case 'i64':
      return HEAP32[ptr >> 2]
    case 'float':
      return HEAPF32[ptr >> 2]
    case 'double':
      return HEAPF64[ptr >> 3]
    default:
      abort('invalid type for getValue: ' + type)
  }
  return null
}
var wasmMemory
var wasmTable = new WebAssembly.Table({
  initial: 1013,
  maximum: 1013,
  element: 'anyfunc'
})
var ABORT = false
var EXITSTATUS = 0

function assert (condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text)
  }
}

function getCFunc (ident) {
  var func = Module['_' + ident]
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported')
  return func
}

function ccall (ident, returnType, argTypes, args, opts) {
  var toC = {
    string: function (str) {
      var ret = 0
      if (str !== null && str !== undefined && str !== 0) {
        var len = (str.length << 2) + 1
        ret = stackAlloc(len)
        stringToUTF8(str, ret, len)
      }
      return ret
    },
    array: function (arr) {
      var ret = stackAlloc(arr.length)
      writeArrayToMemory(arr, ret)
      return ret
    }
  }

  function convertReturnValue (ret) {
    if (returnType === 'string') return UTF8ToString(ret)
    if (returnType === 'boolean') return Boolean(ret)
    return ret
  }
  var func = getCFunc(ident)
  var cArgs = []
  var stack = 0
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]]
      if (converter) {
        if (stack === 0) stack = stackSave()
        cArgs[i] = converter(args[i])
      } else {
        cArgs[i] = args[i]
      }
    }
  }
  var ret = func.apply(null, cArgs)
  ret = convertReturnValue(ret)
  if (stack !== 0) stackRestore(stack)
  return ret
}

function cwrap (ident, returnType, argTypes, opts) {
  argTypes = argTypes || []
  var numericArgs = argTypes.every(function (type) {
    return type === 'number'
  })
  var numericRet = returnType !== 'string'
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident)
  }
  return function () {
    return ccall(ident, returnType, argTypes, arguments, opts)
  }
}

function getMemory (size) {
  if (!runtimeInitialized) return dynamicAlloc(size)
  return _malloc(size)
}
var UTF8Decoder = new TextDecoder('utf8')

function UTF8ArrayToString (heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead
  var endPtr = idx
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr
  return UTF8Decoder.decode(heap.subarray ? heap.subarray(idx, endPtr) : new Uint8Array(heap.slice(idx, endPtr)))
}

function UTF8ToString (ptr, maxBytesToRead) {
  if (!ptr) return ''
  var maxPtr = ptr + maxBytesToRead
  for (var end = ptr; !(end >= maxPtr) && HEAPU8[end];) ++end
  return UTF8Decoder.decode(HEAPU8.subarray(ptr, end))
}

function stringToUTF8Array (str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0
  var startIdx = outIdx
  var endIdx = outIdx + maxBytesToWrite - 1
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i)
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i)
      u = 65536 + ((u & 1023) << 10) | u1 & 1023
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break
      heap[outIdx++] = u
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break
      heap[outIdx++] = 192 | u >> 6
      heap[outIdx++] = 128 | u & 63
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break
      heap[outIdx++] = 224 | u >> 12
      heap[outIdx++] = 128 | u >> 6 & 63
      heap[outIdx++] = 128 | u & 63
    } else {
      if (outIdx + 3 >= endIdx) break
      heap[outIdx++] = 240 | u >> 18
      heap[outIdx++] = 128 | u >> 12 & 63
      heap[outIdx++] = 128 | u >> 6 & 63
      heap[outIdx++] = 128 | u & 63
    }
  }
  heap[outIdx] = 0
  return outIdx - startIdx
}

function stringToUTF8 (str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}

function lengthBytesUTF8 (str) {
  var len = 0
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i)
    if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023
    if (u <= 127) ++len
    else if (u <= 2047) len += 2
    else if (u <= 65535) len += 3
    else len += 4
  }
  return len
}

function allocateUTF8OnStack (str) {
  var size = lengthBytesUTF8(str) + 1
  var ret = stackAlloc(size)
  stringToUTF8Array(str, HEAP8, ret, size)
  return ret
}

function writeArrayToMemory (array, buffer) {
  HEAP8.set(array, buffer)
}

function writeAsciiToMemory (str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++ >> 0] = str.charCodeAt(i)
  }
  if (!dontAddNull) HEAP8[buffer >> 0] = 0
}
var WASM_PAGE_SIZE = 65536

function alignUp (x, multiple) {
  if (x % multiple > 0) {
    x += multiple - x % multiple
  }
  return x
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64

function updateGlobalBufferAndViews (buf) {
  buffer = buf
  Module.HEAP8 = HEAP8 = new Int8Array(buf)
  Module.HEAP16 = HEAP16 = new Int16Array(buf)
  Module.HEAP32 = HEAP32 = new Int32Array(buf)
  Module.HEAPU8 = HEAPU8 = new Uint8Array(buf)
  Module.HEAPU16 = HEAPU16 = new Uint16Array(buf)
  Module.HEAPU32 = HEAPU32 = new Uint32Array(buf)
  Module.HEAPF32 = HEAPF32 = new Float32Array(buf)
  Module.HEAPF64 = HEAPF64 = new Float64Array(buf)
}
var DYNAMIC_BASE = 5891344
var DYNAMICTOP_PTR = 648448
var INITIAL_INITIAL_MEMORY = Module.INITIAL_MEMORY || 67108864
if (Module.wasmMemory) {
  wasmMemory = Module.wasmMemory
} else {
  wasmMemory = new WebAssembly.Memory({
    initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
    maximum: 2147483648 / WASM_PAGE_SIZE
  })
}
if (wasmMemory) {
  buffer = wasmMemory.buffer
}
INITIAL_INITIAL_MEMORY = buffer.byteLength
updateGlobalBufferAndViews(buffer)
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE
var __ATPRERUN__ = []
var __ATINIT__ = []
var __ATMAIN__ = []
var __ATPOSTRUN__ = []
var runtimeInitialized = false
var runtimeExited = false

function preRun () {
  if (Module.preRun) {
    if (typeof Module.preRun === 'function') Module.preRun = [Module.preRun]
    while (Module.preRun.length) {
      addOnPreRun(Module.preRun.shift())
    }
  }
  callRuntimeCallbacks(__ATPRERUN__)
}

function initRuntime () {
  runtimeInitialized = true
  if (!Module.noFSInit && !FS.init.initialized) FS.init()
  TTY.init()
  callRuntimeCallbacks(__ATINIT__)
}

function preMain () {
  FS.ignorePermissions = false
  callRuntimeCallbacks(__ATMAIN__)
}

function exitRuntime () {
  runtimeExited = true
}

function postRun () {
  if (Module.postRun) {
    if (typeof Module.postRun === 'function') Module.postRun = [Module.postRun]
    while (Module.postRun.length) {
      addOnPostRun(Module.postRun.shift())
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun (cb) {
  __ATPRERUN__.unshift(cb)
}

function addOnPreMain (cb) {
  __ATMAIN__.unshift(cb)
}

function addOnPostRun (cb) {
  __ATPOSTRUN__.unshift(cb)
}
var Math_abs = Math.abs
var Math_ceil = Math.ceil
var Math_floor = Math.floor
var Math_min = Math.min
var runDependencies = 0
var runDependencyWatcher = null
var dependenciesFulfilled = null

function getUniqueRunDependency (id) {
  return id
}

function addRunDependency (id) {
  runDependencies++
  if (Module.monitorRunDependencies) {
    Module.monitorRunDependencies(runDependencies)
  }
}

function removeRunDependency (id) {
  runDependencies--
  if (Module.monitorRunDependencies) {
    Module.monitorRunDependencies(runDependencies)
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher)
      runDependencyWatcher = null
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled
      dependenciesFulfilled = null
      callback()
    }
  }
}
Module.preloadedImages = {}
Module.preloadedAudios = {}

function abort (what) {
  if (Module.onAbort) {
    Module.onAbort(what)
  }
  what += ''
  err(what)
  ABORT = true
  EXITSTATUS = 1
  what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.'
  var e = new WebAssembly.RuntimeError(what)
  throw e
}

function hasPrefix (str, prefix) {
  return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0
}
var dataURIPrefix = 'data:application/octet-stream;base64,'

function isDataURI (filename) {
  return hasPrefix(filename, dataURIPrefix)
}
var wasmBinaryFile = 'subtitles-octopus-worker.wasm'
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile)
}

function getBinary () {
  try {
    if (wasmBinary) {
      return new Uint8Array(wasmBinary)
    }
    var binary = tryParseAsDataURI(wasmBinaryFile)
    if (binary) {
      return binary
    }
    if (readBinary) {
      return readBinary(wasmBinaryFile)
    } else {
      throw 'both async and sync fetching of the wasm failed'
    }
  } catch (err) {
    abort(err)
  }
}

function getBinaryPromise () {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === 'function') {
    return fetch(wasmBinaryFile, {
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) {
        throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
      }
      return response.arrayBuffer()
    }).catch(function () {
      return getBinary()
    })
  }
  return Promise.resolve().then(getBinary)
}

function createWasm () {
  var info = {
    a: asmLibraryArg
  }

  function receiveInstance (instance, module) {
    var exports = instance.exports
    Module.asm = exports
    removeRunDependency('wasm-instantiate')
  }
  addRunDependency('wasm-instantiate')

  function receiveInstantiatedSource (output) {
    receiveInstance(output.instance)
  }

  function instantiateArrayBuffer (receiver) {
    return getBinaryPromise().then(function (binary) {
      return WebAssembly.instantiate(binary, info)
    }).then(receiver, function (reason) {
      err('failed to asynchronously prepare wasm: ' + reason)
      var search = location.search
      if (search.indexOf('_rwasm=0') < 0) {
        location.href += (search ? search + '&' : '?') + '_rwasm=0'
      }
      abort(reason)
    })
  }

  function instantiateAsync () {
    if (!wasmBinary && typeof WebAssembly.instantiateStreaming === 'function' && !isDataURI(wasmBinaryFile) && typeof fetch === 'function') {
      fetch(wasmBinaryFile, {
        credentials: 'same-origin'
      }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info)
        return result.then(receiveInstantiatedSource, function (reason) {
          err('wasm streaming compile failed: ' + reason)
          err('falling back to ArrayBuffer instantiation')
          return instantiateArrayBuffer(receiveInstantiatedSource)
        })
      })
    } else {
      return instantiateArrayBuffer(receiveInstantiatedSource)
    }
  }
  if (Module.instantiateWasm) {
    try {
      var exports = Module.instantiateWasm(info, receiveInstance)
      return exports
    } catch (e) {
      err('Module.instantiateWasm callback failed with error: ' + e)
      return false
    }
  }
  instantiateAsync()
  return {}
}
var tempDouble
var tempI64
__ATINIT__.push({
  func: function () {
    ___wasm_call_ctors()
  }
})

function callRuntimeCallbacks (callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift()
    if (typeof callback === 'function') {
      callback(Module)
      continue
    }
    var func = callback.func
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        wasmTable.get(func)()
      } else {
        wasmTable.get(func)(callback.arg)
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg)
    }
  }
}

function demangle (func) {
  return func
}

function demangleAll (text) {
  var regex = /\b_Z[\w\d_]+/g
  return text.replace(regex, function (x) {
    var y = demangle(x)
    return x === y ? x : y + ' [' + x + ']'
  })
}

function jsStackTrace () {
  var error = new Error()
  if (!error.stack) {
    try {
      throw new Error()
    } catch (e) {
      error = e
    }
    if (!error.stack) {
      return '(no stack trace available)'
    }
  }
  return error.stack.toString()
}

function stackTrace () {
  var js = jsStackTrace()
  if (Module.extraStackTrace) js += '\n' + Module.extraStackTrace()
  return demangleAll(js)
}

function ___assert_fail (condition, filename, line, func) {
  abort('Assertion failed: ' + UTF8ToString(condition) + ', at: ' + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function'])
}
var _emscripten_get_now
_emscripten_get_now = function () {
  return performance.now()
}
var _emscripten_get_now_is_monotonic = true

function setErrNo (value) {
  HEAP32[___errno_location() >> 2] = value
  return value
}

function _clock_gettime (clk_id, tp) {
  var now
  if (clk_id === 0) {
    now = Date.now()
  } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
    now = _emscripten_get_now()
  } else {
    setErrNo(28)
    return -1
  }
  HEAP32[tp >> 2] = now / 1e3 | 0
  HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0
  return 0
}

function ___clock_gettime (a0, a1) {
  return _clock_gettime(a0, a1)
}
var PATH = {
  splitPath: function (filename) {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
    return splitPathRe.exec(filename).slice(1)
  },
  normalizeArray: function (parts, allowAboveRoot) {
    var up = 0
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i]
      if (last === '.') {
        parts.splice(i, 1)
      } else if (last === '..') {
        parts.splice(i, 1)
        up++
      } else if (up) {
        parts.splice(i, 1)
        up--
      }
    }
    if (allowAboveRoot) {
      for (; up; up--) {
        parts.unshift('..')
      }
    }
    return parts
  },
  normalize: function (path) {
    var isAbsolute = path.charAt(0) === '/'
    var trailingSlash = path.substr(-1) === '/'
    path = PATH.normalizeArray(path.split('/').filter(function (p) {
      return !!p
    }), !isAbsolute).join('/')
    if (!path && !isAbsolute) {
      path = '.'
    }
    if (path && trailingSlash) {
      path += '/'
    }
    return (isAbsolute ? '/' : '') + path
  },
  dirname: function (path) {
    var result = PATH.splitPath(path)
    var root = result[0]
    var dir = result[1]
    if (!root && !dir) {
      return '.'
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1)
    }
    return root + dir
  },
  basename: function (path) {
    if (path === '/') return '/'
    path = PATH.normalize(path)
    path = path.replace(/\/$/, '')
    var lastSlash = path.lastIndexOf('/')
    if (lastSlash === -1) return path
    return path.substr(lastSlash + 1)
  },
  extname: function (path) {
    return PATH.splitPath(path)[3]
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0)
    return PATH.normalize(paths.join('/'))
  },
  join2: function (l, r) {
    return PATH.normalize(l + '/' + r)
  }
}
var PATH_FS = {
  resolve: function () {
    var resolvedPath = ''
    var resolvedAbsolute = false
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd()
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings')
      } else if (!path) {
        return ''
      }
      resolvedPath = path + '/' + resolvedPath
      resolvedAbsolute = path.charAt(0) === '/'
    }
    resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function (p) {
      return !!p
    }), !resolvedAbsolute).join('/')
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.'
  },
  relative: function (from, to) {
    from = PATH_FS.resolve(from).substr(1)
    to = PATH_FS.resolve(to).substr(1)

    function trim (arr) {
      var start = 0
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break
      }
      var end = arr.length - 1
      for (; end >= 0; end--) {
        if (arr[end] !== '') break
      }
      if (start > end) return []
      return arr.slice(start, end - start + 1)
    }
    var fromParts = trim(from.split('/'))
    var toParts = trim(to.split('/'))
    var length = Math.min(fromParts.length, toParts.length)
    var samePartsLength = length
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i
        break
      }
    }
    var outputParts = []
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..')
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength))
    return outputParts.join('/')
  }
}
var TTY = {
  ttys: [],
  init: function () {},
  shutdown: function () {},
  register: function (dev, ops) {
    TTY.ttys[dev] = {
      input: [],
      output: [],
      ops: ops
    }
    FS.registerDevice(dev, TTY.stream_ops)
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev]
      if (!tty) {
        throw new FS.ErrnoError(43)
      }
      stream.tty = tty
      stream.seekable = false
    },
    close: function (stream) {
      stream.tty.ops.flush(stream.tty)
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty)
    },
    read: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60)
      }
      var bytesRead = 0
      for (var i = 0; i < length; i++) {
        var result
        try {
          result = stream.tty.ops.get_char(stream.tty)
        } catch (e) {
          throw new FS.ErrnoError(29)
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6)
        }
        if (result === null || result === undefined) break
        bytesRead++
        buffer[offset + i] = result
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now()
      }
      return bytesRead
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60)
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i])
        }
      } catch (e) {
        throw new FS.ErrnoError(29)
      }
      if (length) {
        stream.node.timestamp = Date.now()
      }
      return i
    }
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null
        if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
          result = window.prompt('Input: ')
          if (result !== null) {
            result += '\n'
          }
        } else if (typeof readline === 'function') {
          result = readline()
          if (result !== null) {
            result += '\n'
          }
        }
        if (!result) {
          return null
        }
        tty.input = intArrayFromString(result, true)
      }
      return tty.input.shift()
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      } else {
        if (val != 0) tty.output.push(val)
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      }
    }
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      } else {
        if (val != 0) tty.output.push(val)
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      }
    }
  }
}
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, '/', 16384 | 511, 0)
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      throw new FS.ErrnoError(63)
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek
          }
        },
        file: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync
          }
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          },
          stream: {}
        },
        chrdev: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          },
          stream: FS.chrdev_stream_ops
        }
      }
    }
    var node = FS.createNode(parent, name, mode, dev)
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node
      node.stream_ops = MEMFS.ops_table.dir.stream
      node.contents = {}
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node
      node.stream_ops = MEMFS.ops_table.file.stream
      node.usedBytes = 0
      node.contents = null
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node
      node.stream_ops = MEMFS.ops_table.link.stream
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node
      node.stream_ops = MEMFS.ops_table.chrdev.stream
    }
    node.timestamp = Date.now()
    if (parent) {
      parent.contents[name] = node
    }
    return node
  },
  getFileDataAsRegularArray: function (node) {
    if (node.contents && node.contents.subarray) {
      var arr = []
      for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i])
      return arr
    }
    return node.contents
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array(0)
    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes)
    return new Uint8Array(node.contents)
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0
    if (prevCapacity >= newCapacity) return
    var CAPACITY_DOUBLING_MAX = 1024 * 1024
    newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0)
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256)
    var oldContents = node.contents
    node.contents = new Uint8Array(newCapacity)
    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return
    if (newSize == 0) {
      node.contents = null
      node.usedBytes = 0
      return
    }
    if (!node.contents || node.contents.subarray) {
      var oldContents = node.contents
      node.contents = new Uint8Array(newSize)
      if (oldContents) {
        node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
      }
      node.usedBytes = newSize
      return
    }
    if (!node.contents) node.contents = []
    if (node.contents.length > newSize) node.contents.length = newSize
    else { while (node.contents.length < newSize) node.contents.push(0) }
    node.usedBytes = newSize
  },
  node_ops: {
    getattr: function (node) {
      var attr = {}
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1
      attr.ino = node.id
      attr.mode = node.mode
      attr.nlink = 1
      attr.uid = 0
      attr.gid = 0
      attr.rdev = node.rdev
      if (FS.isDir(node.mode)) {
        attr.size = 4096
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length
      } else {
        attr.size = 0
      }
      attr.atime = new Date(node.timestamp)
      attr.mtime = new Date(node.timestamp)
      attr.ctime = new Date(node.timestamp)
      attr.blksize = 4096
      attr.blocks = Math.ceil(attr.size / attr.blksize)
      return attr
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size)
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[44]
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev)
    },
    rename: function (old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node
        try {
          new_node = FS.lookupNode(new_dir, new_name)
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55)
          }
        }
      }
      delete old_node.parent.contents[old_node.name]
      old_node.name = new_name
      new_dir.contents[new_name] = old_node
      old_node.parent = new_dir
    },
    unlink: function (parent, name) {
      delete parent.contents[name]
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name)
      for (var i in node.contents) {
        throw new FS.ErrnoError(55)
      }
      delete parent.contents[name]
    },
    readdir: function (node) {
      var entries = ['.', '..']
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue
        }
        entries.push(key)
      }
      return entries
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0)
      node.link = oldpath
      return node
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28)
      }
      return node.link
    }
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents
      if (position >= stream.node.usedBytes) return 0
      var size = Math.min(stream.node.usedBytes - position, length)
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset)
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
      }
      return size
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false
      }
      if (!length) return 0
      var node = stream.node
      node.timestamp = Date.now()
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length)
          node.usedBytes = length
          return length
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length)
          node.usedBytes = length
          return length
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position)
          return length
        }
      }
      MEMFS.expandFileStorage(node, position + length)
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position)
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i]
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length)
      return length
    },
    llseek: function (stream, offset, whence) {
      var position = offset
      if (whence === 1) {
        position += stream.position
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28)
      }
      return position
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length)
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
    },
    mmap: function (stream, address, length, position, prot, flags) {
      assert(address === 0)
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43)
      }
      var ptr
      var allocated
      var contents = stream.node.contents
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false
        ptr = contents.byteOffset
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length)
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length)
          }
        }
        allocated = true
        ptr = FS.mmapAlloc(length)
        if (!ptr) {
          throw new FS.ErrnoError(48)
        }
        HEAP8.set(contents, ptr)
      }
      return {
        ptr: ptr,
        allocated: allocated
      }
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43)
      }
      if (mmapFlags & 2) {
        return 0
      }
      var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false)
      return 0
    }
  }
}
var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: '/',
  initialized: false,
  ignorePermissions: true,
  trackingDelegate: {},
  tracking: {
    openFlags: {
      READ: 1,
      WRITE: 2
    }
  },
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  handleFSError: function (e) {
    if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace()
    return setErrNo(e.errno)
  },
  lookupPath: function (path, opts) {
    path = PATH_FS.resolve(FS.cwd(), path)
    opts = opts || {}
    if (!path) {
      return {
        path: '',
        node: null
      }
    }
    var defaults = {
      follow_mount: true,
      recurse_count: 0
    }
    for (var key in defaults) {
      if (opts[key] === undefined) {
        opts[key] = defaults[key]
      }
    }
    if (opts.recurse_count > 8) {
      throw new FS.ErrnoError(32)
    }
    var parts = PATH.normalizeArray(path.split('/').filter(function (p) {
      return !!p
    }), false)
    var current = FS.root
    var current_path = '/'
    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1
      if (islast && opts.parent) {
        break
      }
      current = FS.lookupNode(current, parts[i])
      current_path = PATH.join2(current_path, parts[i])
      if (FS.isMountpoint(current)) {
        if (!islast || islast && opts.follow_mount) {
          current = current.mounted.root
        }
      }
      if (!islast || opts.follow) {
        var count = 0
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path)
          current_path = PATH_FS.resolve(PATH.dirname(current_path), link)
          var lookup = FS.lookupPath(current_path, {
            recurse_count: opts.recurse_count
          })
          current = lookup.node
          if (count++ > 40) {
            throw new FS.ErrnoError(32)
          }
        }
      }
    }
    return {
      path: current_path,
      node: current
    }
  },
  getPath: function (node) {
    var path
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint
        if (!path) return mount
        return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path
      }
      path = path ? node.name + '/' + path : node.name
      node = node.parent
    }
  },
  hashName: function (parentid, name) {
    var hash = 0
    for (var i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i) | 0
    }
    return (parentid + hash >>> 0) % FS.nameTable.length
  },
  hashAddNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name)
    node.name_next = FS.nameTable[hash]
    FS.nameTable[hash] = node
  },
  hashRemoveNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name)
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next
    } else {
      var current = FS.nameTable[hash]
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next
          break
        }
        current = current.name_next
      }
    }
  },
  lookupNode: function (parent, name) {
    var errCode = FS.mayLookup(parent)
    if (errCode) {
      throw new FS.ErrnoError(errCode, parent)
    }
    var hash = FS.hashName(parent.id, name)
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name
      if (node.parent.id === parent.id && nodeName === name) {
        return node
      }
    }
    return FS.lookup(parent, name)
  },
  createNode: function (parent, name, mode, rdev) {
    var node = new FS.FSNode(parent, name, mode, rdev)
    FS.hashAddNode(node)
    return node
  },
  destroyNode: function (node) {
    FS.hashRemoveNode(node)
  },
  isRoot: function (node) {
    return node === node.parent
  },
  isMountpoint: function (node) {
    return !!node.mounted
  },
  isFile: function (mode) {
    return (mode & 61440) === 32768
  },
  isDir: function (mode) {
    return (mode & 61440) === 16384
  },
  isLink: function (mode) {
    return (mode & 61440) === 40960
  },
  isChrdev: function (mode) {
    return (mode & 61440) === 8192
  },
  isBlkdev: function (mode) {
    return (mode & 61440) === 24576
  },
  isFIFO: function (mode) {
    return (mode & 61440) === 4096
  },
  isSocket: function (mode) {
    return (mode & 49152) === 49152
  },
  flagModes: {
    r: 0,
    rs: 1052672,
    'r+': 2,
    w: 577,
    wx: 705,
    xw: 705,
    'w+': 578,
    'wx+': 706,
    'xw+': 706,
    a: 1089,
    ax: 1217,
    xa: 1217,
    'a+': 1090,
    'ax+': 1218,
    'xa+': 1218
  },
  modeStringToFlags: function (str) {
    var flags = FS.flagModes[str]
    if (typeof flags === 'undefined') {
      throw new Error('Unknown file open mode: ' + str)
    }
    return flags
  },
  flagsToPermissionString: function (flag) {
    var perms = ['r', 'w', 'rw'][flag & 3]
    if (flag & 512) {
      perms += 'w'
    }
    return perms
  },
  nodePermissions: function (node, perms) {
    if (FS.ignorePermissions) {
      return 0
    }
    if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
      return 2
    } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
      return 2
    } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
      return 2
    }
    return 0
  },
  mayLookup: function (dir) {
    var errCode = FS.nodePermissions(dir, 'x')
    if (errCode) return errCode
    if (!dir.node_ops.lookup) return 2
    return 0
  },
  mayCreate: function (dir, name) {
    try {
      var node = FS.lookupNode(dir, name)
      return 20
    } catch (e) {}
    return FS.nodePermissions(dir, 'wx')
  },
  mayDelete: function (dir, name, isdir) {
    var node
    try {
      node = FS.lookupNode(dir, name)
    } catch (e) {
      return e.errno
    }
    var errCode = FS.nodePermissions(dir, 'wx')
    if (errCode) {
      return errCode
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31
      }
    }
    return 0
  },
  mayOpen: function (node, flags) {
    if (!node) {
      return 44
    }
    if (FS.isLink(node.mode)) {
      return 32
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
        return 31
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
  },
  MAX_OPEN_FDS: 4096,
  nextfd: function (fd_start, fd_end) {
    fd_start = fd_start || 0
    fd_end = fd_end || FS.MAX_OPEN_FDS
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd
      }
    }
    throw new FS.ErrnoError(33)
  },
  getStream: function (fd) {
    return FS.streams[fd]
  },
  createStream: function (stream, fd_start, fd_end) {
    if (!FS.FSStream) {
      FS.FSStream = function () {}
      FS.FSStream.prototype = {
        object: {
          get: function () {
            return this.node
          },
          set: function (val) {
            this.node = val
          }
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1
          }
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0
          }
        },
        isAppend: {
          get: function () {
            return this.flags & 1024
          }
        }
      }
    }
    var newStream = new FS.FSStream()
    for (var p in stream) {
      newStream[p] = stream[p]
    }
    stream = newStream
    var fd = FS.nextfd(fd_start, fd_end)
    stream.fd = fd
    FS.streams[fd] = stream
    return stream
  },
  closeStream: function (fd) {
    FS.streams[fd] = null
  },
  chrdev_stream_ops: {
    open: function (stream) {
      var device = FS.getDevice(stream.node.rdev)
      stream.stream_ops = device.stream_ops
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream)
      }
    },
    llseek: function () {
      throw new FS.ErrnoError(70)
    }
  },
  major: function (dev) {
    return dev >> 8
  },
  minor: function (dev) {
    return dev & 255
  },
  makedev: function (ma, mi) {
    return ma << 8 | mi
  },
  registerDevice: function (dev, ops) {
    FS.devices[dev] = {
      stream_ops: ops
    }
  },
  getDevice: function (dev) {
    return FS.devices[dev]
  },
  getMounts: function (mount) {
    var mounts = []
    var check = [mount]
    while (check.length) {
      var m = check.pop()
      mounts.push(m)
      check.push.apply(check, m.mounts)
    }
    return mounts
  },
  syncfs: function (populate, callback) {
    if (typeof populate === 'function') {
      callback = populate
      populate = false
    }
    FS.syncFSRequests++
    if (FS.syncFSRequests > 1) {
      err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work')
    }
    var mounts = FS.getMounts(FS.root.mount)
    var completed = 0

    function doCallback (errCode) {
      FS.syncFSRequests--
      return callback(errCode)
    }

    function done (errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true
          return doCallback(errCode)
        }
        return
      }
      if (++completed >= mounts.length) {
        doCallback(null)
      }
    }
    mounts.forEach(function (mount) {
      if (!mount.type.syncfs) {
        return done(null)
      }
      mount.type.syncfs(mount, populate, done)
    })
  },
  mount: function (type, opts, mountpoint) {
    var root = mountpoint === '/'
    var pseudo = !mountpoint
    var node
    if (root && FS.root) {
      throw new FS.ErrnoError(10)
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, {
        follow_mount: false
      })
      mountpoint = lookup.path
      node = lookup.node
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10)
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54)
      }
    }
    var mount = {
      type: type,
      opts: opts,
      mountpoint: mountpoint,
      mounts: []
    }
    var mountRoot = type.mount(mount)
    mountRoot.mount = mount
    mount.root = mountRoot
    if (root) {
      FS.root = mountRoot
    } else if (node) {
      node.mounted = mount
      if (node.mount) {
        node.mount.mounts.push(mount)
      }
    }
    return mountRoot
  },
  unmount: function (mountpoint) {
    var lookup = FS.lookupPath(mountpoint, {
      follow_mount: false
    })
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28)
    }
    var node = lookup.node
    var mount = node.mounted
    var mounts = FS.getMounts(mount)
    Object.keys(FS.nameTable).forEach(function (hash) {
      var current = FS.nameTable[hash]
      while (current) {
        var next = current.name_next
        if (mounts.indexOf(current.mount) !== -1) {
          FS.destroyNode(current)
        }
        current = next
      }
    })
    node.mounted = null
    var idx = node.mount.mounts.indexOf(mount)
    node.mount.mounts.splice(idx, 1)
  },
  lookup: function (parent, name) {
    return parent.node_ops.lookup(parent, name)
  },
  mknod: function (path, mode, dev) {
    var lookup = FS.lookupPath(path, {
      parent: true
    })
    var parent = lookup.node
    var name = PATH.basename(path)
    if (!name || name === '.' || name === '..') {
      throw new FS.ErrnoError(28)
    }
    var errCode = FS.mayCreate(parent, name)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63)
    }
    return parent.node_ops.mknod(parent, name, mode, dev)
  },
  create: function (path, mode) {
    mode = mode !== undefined ? mode : 438
    mode &= 4095
    mode |= 32768
    return FS.mknod(path, mode, 0)
  },
  mkdir: function (path, mode) {
    mode = mode !== undefined ? mode : 511
    mode &= 511 | 512
    mode |= 16384
    return FS.mknod(path, mode, 0)
  },
  mkdirTree: function (path, mode) {
    var dirs = path.split('/')
    var d = ''
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue
      d += '/' + dirs[i]
      try {
        FS.mkdir(d, mode)
      } catch (e) {
        if (e.errno != 20) throw e
      }
    }
  },
  mkdev: function (path, mode, dev) {
    if (typeof dev === 'undefined') {
      dev = mode
      mode = 438
    }
    mode |= 8192
    return FS.mknod(path, mode, dev)
  },
  symlink: function (oldpath, newpath) {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44)
    }
    var lookup = FS.lookupPath(newpath, {
      parent: true
    })
    var parent = lookup.node
    if (!parent) {
      throw new FS.ErrnoError(44)
    }
    var newname = PATH.basename(newpath)
    var errCode = FS.mayCreate(parent, newname)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63)
    }
    return parent.node_ops.symlink(parent, newname, oldpath)
  },
  rename: function (old_path, new_path) {
    var old_dirname = PATH.dirname(old_path)
    var new_dirname = PATH.dirname(new_path)
    var old_name = PATH.basename(old_path)
    var new_name = PATH.basename(new_path)
    var lookup, old_dir, new_dir
    lookup = FS.lookupPath(old_path, {
      parent: true
    })
    old_dir = lookup.node
    lookup = FS.lookupPath(new_path, {
      parent: true
    })
    new_dir = lookup.node
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44)
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75)
    }
    var old_node = FS.lookupNode(old_dir, old_name)
    var relative = PATH_FS.relative(old_path, new_dirname)
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(28)
    }
    relative = PATH_FS.relative(new_path, old_dirname)
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(55)
    }
    var new_node
    try {
      new_node = FS.lookupNode(new_dir, new_name)
    } catch (e) {}
    if (old_node === new_node) {
      return
    }
    var isdir = FS.isDir(old_node.mode)
    var errCode = FS.mayDelete(old_dir, old_name, isdir)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
      throw new FS.ErrnoError(10)
    }
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, 'w')
      if (errCode) {
        throw new FS.ErrnoError(errCode)
      }
    }
    try {
      if (FS.trackingDelegate.willMovePath) {
        FS.trackingDelegate.willMovePath(old_path, new_path)
      }
    } catch (e) {
      err("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
    }
    FS.hashRemoveNode(old_node)
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name)
    } finally {
      FS.hashAddNode(old_node)
    }
    try {
      if (FS.trackingDelegate.onMovePath) FS.trackingDelegate.onMovePath(old_path, new_path)
    } catch (e) {
      err("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
    }
  },
  rmdir: function (path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    })
    var parent = lookup.node
    var name = PATH.basename(path)
    var node = FS.lookupNode(parent, name)
    var errCode = FS.mayDelete(parent, name, true)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10)
    }
    try {
      if (FS.trackingDelegate.willDeletePath) {
        FS.trackingDelegate.willDeletePath(path)
      }
    } catch (e) {
      err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
    }
    parent.node_ops.rmdir(parent, name)
    FS.destroyNode(node)
    try {
      if (FS.trackingDelegate.onDeletePath) FS.trackingDelegate.onDeletePath(path)
    } catch (e) {
      err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
    }
  },
  readdir: function (path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    })
    var node = lookup.node
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(54)
    }
    return node.node_ops.readdir(node)
  },
  unlink: function (path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    })
    var parent = lookup.node
    var name = PATH.basename(path)
    var node = FS.lookupNode(parent, name)
    var errCode = FS.mayDelete(parent, name, false)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10)
    }
    try {
      if (FS.trackingDelegate.willDeletePath) {
        FS.trackingDelegate.willDeletePath(path)
      }
    } catch (e) {
      err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
    }
    parent.node_ops.unlink(parent, name)
    FS.destroyNode(node)
    try {
      if (FS.trackingDelegate.onDeletePath) FS.trackingDelegate.onDeletePath(path)
    } catch (e) {
      err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
    }
  },
  readlink: function (path) {
    var lookup = FS.lookupPath(path)
    var link = lookup.node
    if (!link) {
      throw new FS.ErrnoError(44)
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28)
    }
    return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
  },
  stat: function (path, dontFollow) {
    var lookup = FS.lookupPath(path, {
      follow: !dontFollow
    })
    var node = lookup.node
    if (!node) {
      throw new FS.ErrnoError(44)
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(63)
    }
    return node.node_ops.getattr(node)
  },
  lstat: function (path) {
    return FS.stat(path, true)
  },
  chmod: function (path, mode, dontFollow) {
    var node
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      })
      node = lookup.node
    } else {
      node = path
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63)
    }
    node.node_ops.setattr(node, {
      mode: mode & 4095 | node.mode & ~4095,
      timestamp: Date.now()
    })
  },
  lchmod: function (path, mode) {
    FS.chmod(path, mode, true)
  },
  fchmod: function (fd, mode) {
    var stream = FS.getStream(fd)
    if (!stream) {
      throw new FS.ErrnoError(8)
    }
    FS.chmod(stream.node, mode)
  },
  chown: function (path, uid, gid, dontFollow) {
    var node
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      })
      node = lookup.node
    } else {
      node = path
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63)
    }
    node.node_ops.setattr(node, {
      timestamp: Date.now()
    })
  },
  lchown: function (path, uid, gid) {
    FS.chown(path, uid, gid, true)
  },
  fchown: function (fd, uid, gid) {
    var stream = FS.getStream(fd)
    if (!stream) {
      throw new FS.ErrnoError(8)
    }
    FS.chown(stream.node, uid, gid)
  },
  truncate: function (path, len) {
    if (len < 0) {
      throw new FS.ErrnoError(28)
    }
    var node
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, {
        follow: true
      })
      node = lookup.node
    } else {
      node = path
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31)
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28)
    }
    var errCode = FS.nodePermissions(node, 'w')
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    node.node_ops.setattr(node, {
      size: len,
      timestamp: Date.now()
    })
  },
  ftruncate: function (fd, len) {
    var stream = FS.getStream(fd)
    if (!stream) {
      throw new FS.ErrnoError(8)
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28)
    }
    FS.truncate(stream.node, len)
  },
  utime: function (path, atime, mtime) {
    var lookup = FS.lookupPath(path, {
      follow: true
    })
    var node = lookup.node
    node.node_ops.setattr(node, {
      timestamp: Math.max(atime, mtime)
    })
  },
  open: function (path, flags, mode, fd_start, fd_end) {
    if (path === '') {
      throw new FS.ErrnoError(44)
    }
    flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags
    mode = typeof mode === 'undefined' ? 438 : mode
    if (flags & 64) {
      mode = mode & 4095 | 32768
    } else {
      mode = 0
    }
    var node
    if (typeof path === 'object') {
      node = path
    } else {
      path = PATH.normalize(path)
      try {
        var lookup = FS.lookupPath(path, {
          follow: !(flags & 131072)
        })
        node = lookup.node
      } catch (e) {}
    }
    var created = false
    if (flags & 64) {
      if (node) {
        if (flags & 128) {
          throw new FS.ErrnoError(20)
        }
      } else {
        node = FS.mknod(path, mode, 0)
        created = true
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44)
    }
    if (FS.isChrdev(node.mode)) {
      flags &= ~512
    }
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54)
    }
    if (!created) {
      var errCode = FS.mayOpen(node, flags)
      if (errCode) {
        throw new FS.ErrnoError(errCode)
      }
    }
    if (flags & 512) {
      FS.truncate(node, 0)
    }
    flags &= ~(128 | 512 | 131072)
    var stream = FS.createStream({
      node: node,
      path: FS.getPath(node),
      flags: flags,
      seekable: true,
      position: 0,
      stream_ops: node.stream_ops,
      ungotten: [],
      error: false
    }, fd_start, fd_end)
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream)
    }
    if (Module.logReadFiles && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {}
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1
        err('FS.trackingDelegate error on read file: ' + path)
      }
    }
    try {
      if (FS.trackingDelegate.onOpenFile) {
        var trackingFlags = 0
        if ((flags & 2097155) !== 1) {
          trackingFlags |= FS.tracking.openFlags.READ
        }
        if ((flags & 2097155) !== 0) {
          trackingFlags |= FS.tracking.openFlags.WRITE
        }
        FS.trackingDelegate.onOpenFile(path, trackingFlags)
      }
    } catch (e) {
      err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
    }
    return stream
  },
  close: function (stream) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if (stream.getdents) stream.getdents = null
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream)
      }
    } finally {
      FS.closeStream(stream.fd)
    }
    stream.fd = null
  },
  isClosed: function (stream) {
    return stream.fd === null
  },
  llseek: function (stream, offset, whence) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70)
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28)
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence)
    stream.ungotten = []
    return stream.position
  },
  read: function (stream, buffer, offset, length, position) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28)
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8)
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31)
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28)
    }
    var seeking = typeof position !== 'undefined'
    if (!seeking) {
      position = stream.position
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70)
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position)
    if (!seeking) stream.position += bytesRead
    return bytesRead
  },
  write: function (stream, buffer, offset, length, position, canOwn) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28)
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8)
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31)
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28)
    }
    if (stream.seekable && stream.flags & 1024) {
      FS.llseek(stream, 0, 2)
    }
    var seeking = typeof position !== 'undefined'
    if (!seeking) {
      position = stream.position
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70)
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn)
    if (!seeking) stream.position += bytesWritten
    try {
      if (stream.path && FS.trackingDelegate.onWriteToFile) FS.trackingDelegate.onWriteToFile(stream.path)
    } catch (e) {
      err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
    }
    return bytesWritten
  },
  allocate: function (stream, offset, length) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(28)
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8)
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(43)
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(138)
    }
    stream.stream_ops.allocate(stream, offset, length)
  },
  mmap: function (stream, address, length, position, prot, flags) {
    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
      throw new FS.ErrnoError(2)
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2)
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43)
    }
    return stream.stream_ops.mmap(stream, address, length, position, prot, flags)
  },
  msync: function (stream, buffer, offset, length, mmapFlags) {
    if (!stream || !stream.stream_ops.msync) {
      return 0
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
  },
  munmap: function (stream) {
    return 0
  },
  ioctl: function (stream, cmd, arg) {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59)
    }
    return stream.stream_ops.ioctl(stream, cmd, arg)
  },
  readFile: function (path, opts) {
    opts = opts || {}
    opts.flags = opts.flags || 'r'
    opts.encoding = opts.encoding || 'binary'
    if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
      throw new Error('Invalid encoding type "' + opts.encoding + '"')
    }
    var ret
    var stream = FS.open(path, opts.flags)
    var stat = FS.stat(path)
    var length = stat.size
    var buf = new Uint8Array(length)
    FS.read(stream, buf, 0, length, 0)
    if (opts.encoding === 'utf8') {
      ret = UTF8ArrayToString(buf, 0)
    } else if (opts.encoding === 'binary') {
      ret = buf
    }
    FS.close(stream)
    return ret
  },
  writeFile: function (path, data, opts) {
    opts = opts || {}
    opts.flags = opts.flags || 'w'
    var stream = FS.open(path, opts.flags, opts.mode)
    if (typeof data === 'string') {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1)
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length)
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
    } else {
      throw new Error('Unsupported data type')
    }
    FS.close(stream)
  },
  cwd: function () {
    return FS.currentPath
  },
  chdir: function (path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    })
    if (lookup.node === null) {
      throw new FS.ErrnoError(44)
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54)
    }
    var errCode = FS.nodePermissions(lookup.node, 'x')
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    FS.currentPath = lookup.path
  },
  createDefaultDirectories: function () {
    FS.mkdir('/tmp')
    FS.mkdir('/home')
    FS.mkdir('/home/web_user')
  },
  createDefaultDevices: function () {
    FS.mkdir('/dev')
    FS.registerDevice(FS.makedev(1, 3), {
      read: function () {
        return 0
      },
      write: function (stream, buffer, offset, length, pos) {
        return length
      }
    })
    FS.mkdev('/dev/null', FS.makedev(1, 3))
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops)
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops)
    FS.mkdev('/dev/tty', FS.makedev(5, 0))
    FS.mkdev('/dev/tty1', FS.makedev(6, 0))
    var random_device
    if (typeof crypto === 'object' && typeof crypto.getRandomValues === 'function') {
      var randomBuffer = new Uint8Array(1)
      random_device = function () {
        crypto.getRandomValues(randomBuffer)
        return randomBuffer[0]
      }
    } else {}
    if (!random_device) {
      random_device = function () {
        abort('random_device')
      }
    }
    FS.createDevice('/dev', 'random', random_device)
    FS.createDevice('/dev', 'urandom', random_device)
    FS.mkdir('/dev/shm')
    FS.mkdir('/dev/shm/tmp')
  },
  createSpecialDirectories: function () {
    FS.mkdir('/proc')
    FS.mkdir('/proc/self')
    FS.mkdir('/proc/self/fd')
    FS.mount({
      mount: function () {
        var node = FS.createNode('/proc/self', 'fd', 16384 | 511, 73)
        node.node_ops = {
          lookup: function (parent, name) {
            var fd = +name
            var stream = FS.getStream(fd)
            if (!stream) throw new FS.ErrnoError(8)
            var ret = {
              parent: null,
              mount: {
                mountpoint: 'fake'
              },
              node_ops: {
                readlink: function () {
                  return stream.path
                }
              }
            }
            ret.parent = ret
            return ret
          }
        }
        return node
      }
    }, {}, '/proc/self/fd')
  },
  createStandardStreams: function () {
    if (Module.stdin) {
      FS.createDevice('/dev', 'stdin', Module.stdin)
    } else {
      FS.symlink('/dev/tty', '/dev/stdin')
    }
    if (Module.stdout) {
      FS.createDevice('/dev', 'stdout', null, Module.stdout)
    } else {
      FS.symlink('/dev/tty', '/dev/stdout')
    }
    if (Module.stderr) {
      FS.createDevice('/dev', 'stderr', null, Module.stderr)
    } else {
      FS.symlink('/dev/tty1', '/dev/stderr')
    }
    const stdin = FS.open('/dev/stdin', 'r')
    const stdout = FS.open('/dev/stdout', 'w')
    const stderr = FS.open('/dev/stderr', 'w')
  },
  ensureErrnoError: function () {
    if (FS.ErrnoError) return
    FS.ErrnoError = function ErrnoError (errno, node) {
      this.node = node
      this.setErrno = function (errno) {
        this.errno = errno
      }
      this.setErrno(errno)
      this.message = 'FS error'
    }
    FS.ErrnoError.prototype = new Error()
    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
    [44].forEach(function (code) {
      FS.genericErrors[code] = new FS.ErrnoError(code)
      FS.genericErrors[code].stack = '<generic error, no stack>'
    })
  },
  staticInit: function () {
    FS.ensureErrnoError()
    FS.nameTable = new Array(4096)
    FS.mount(MEMFS, {}, '/')
    FS.createDefaultDirectories()
    FS.createDefaultDevices()
    FS.createSpecialDirectories()
    FS.filesystems = {
      MEMFS: MEMFS
    }
  },
  init: function (input, output, error) {
    FS.init.initialized = true
    FS.ensureErrnoError()
    Module.stdin = input || Module.stdin
    Module.stdout = output || Module.stdout
    Module.stderr = error || Module.stderr
    FS.createStandardStreams()
  },
  quit: function () {
    FS.init.initialized = false
    var fflush = Module._fflush
    if (fflush) fflush(0)
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i]
      if (!stream) {
        continue
      }
      FS.close(stream)
    }
  },
  getMode: function (canRead, canWrite) {
    var mode = 0
    if (canRead) mode |= 292 | 73
    if (canWrite) mode |= 146
    return mode
  },
  joinPath: function (parts, forceRelative) {
    var path = PATH.join.apply(null, parts)
    if (forceRelative && path[0] == '/') path = path.substr(1)
    return path
  },
  absolutePath: function (relative, base) {
    return PATH_FS.resolve(base, relative)
  },
  standardizePath: function (path) {
    return PATH.normalize(path)
  },
  findObject: function (path, dontResolveLastLink) {
    var ret = FS.analyzePath(path, dontResolveLastLink)
    if (ret.exists) {
      return ret.object
    } else {
      setErrNo(ret.error)
      return null
    }
  },
  analyzePath: function (path, dontResolveLastLink) {
    try {
      var lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      })
      path = lookup.path
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null
    }
    try {
      var lookup = FS.lookupPath(path, {
        parent: true
      })
      ret.parentExists = true
      ret.parentPath = lookup.path
      ret.parentObject = lookup.node
      ret.name = PATH.basename(path)
      lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      })
      ret.exists = true
      ret.path = lookup.path
      ret.object = lookup.node
      ret.name = lookup.node.name
      ret.isRoot = lookup.path === '/'
    } catch (e) {
      ret.error = e.errno
    }
    return ret
  },
  createFolder: function (parent, name, canRead, canWrite) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
    var mode = FS.getMode(canRead, canWrite)
    return FS.mkdir(path, mode)
  },
  createPath: function (parent, path, canRead, canWrite) {
    parent = typeof parent === 'string' ? parent : FS.getPath(parent)
    var parts = path.split('/').reverse()
    while (parts.length) {
      var part = parts.pop()
      if (!part) continue
      var current = PATH.join2(parent, part)
      try {
        FS.mkdir(current)
      } catch (e) {}
      parent = current
    }
    return current
  },
  createFile: function (parent, name, properties, canRead, canWrite) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
    var mode = FS.getMode(canRead, canWrite)
    return FS.create(path, mode)
  },
  createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
    var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent
    var mode = FS.getMode(canRead, canWrite)
    var node = FS.create(path, mode)
    if (data) {
      if (typeof data === 'string') {
        var arr = new Array(data.length)
        for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i)
        data = arr
      }
      FS.chmod(node, mode | 146)
      var stream = FS.open(node, 'w')
      FS.write(stream, data, 0, data.length, 0, canOwn)
      FS.close(stream)
      FS.chmod(node, mode)
    }
    return node
  },
  createDevice: function (parent, name, input, output) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
    var mode = FS.getMode(!!input, !!output)
    if (!FS.createDevice.major) FS.createDevice.major = 64
    var dev = FS.makedev(FS.createDevice.major++, 0)
    FS.registerDevice(dev, {
      open: function (stream) {
        stream.seekable = false
      },
      close: function (stream) {
        if (output && output.buffer && output.buffer.length) {
          output(10)
        }
      },
      read: function (stream, buffer, offset, length, pos) {
        var bytesRead = 0
        for (var i = 0; i < length; i++) {
          var result
          try {
            result = input()
          } catch (e) {
            throw new FS.ErrnoError(29)
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6)
          }
          if (result === null || result === undefined) break
          bytesRead++
          buffer[offset + i] = result
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now()
        }
        return bytesRead
      },
      write: function (stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i])
          } catch (e) {
            throw new FS.ErrnoError(29)
          }
        }
        if (length) {
          stream.node.timestamp = Date.now()
        }
        return i
      }
    })
    return FS.mkdev(path, mode, dev)
  },
  createLink: function (parent, name, target, canRead, canWrite) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
    return FS.symlink(target, path)
  },
  forceLoadFile: function (obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true
    var success = true
    if (typeof XMLHttpRequest !== 'undefined') {
      throw new Error('Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.')
    } else if (read_) {
      try {
        obj.contents = intArrayFromString(read_(obj.url), true)
        obj.usedBytes = obj.contents.length
      } catch (e) {
        success = false
      }
    } else {
      throw new Error('Cannot load without read() or XMLHttpRequest.')
    }
    if (!success) setErrNo(29)
    return success
  },
  createLazyFile: function (parent, name, url, canRead, canWrite) {
    function LazyUint8Array () {
      this.lengthKnown = false
      this.chunks = []
    }
    LazyUint8Array.prototype.get = function LazyUint8Array_get (idx) {
      if (idx > this.length - 1 || idx < 0) {
        return undefined
      }
      var chunkOffset = idx % this.chunkSize
      var chunkNum = idx / this.chunkSize | 0
      return this.getter(chunkNum)[chunkOffset]
    }
    LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter (getter) {
      this.getter = getter
    }
    LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength () {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', url, false)
      xhr.send(null)
      if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + '. Status: ' + xhr.status)
      var datalength = Number(xhr.getResponseHeader('Content-length'))
      var header
      var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes'
      var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip'
      var chunkSize = 1024 * 1024
      if (!hasByteServing) chunkSize = datalength
      var doXHR = function (from, to) {
        if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!')
        if (to > datalength - 1) throw new Error('only ' + datalength + ' bytes available! programmer error!')
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, false)
        if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to)
        if (typeof Uint8Array !== 'undefined') xhr.responseType = 'arraybuffer'
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('text/plain; charset=x-user-defined')
        }
        xhr.send(null)
        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + '. Status: ' + xhr.status)
        if (xhr.response !== undefined) {
          return new Uint8Array(xhr.response || [])
        } else {
          return intArrayFromString(xhr.responseText || '', true)
        }
      }
      var lazyArray = this
      lazyArray.setDataGetter(function (chunkNum) {
        var start = chunkNum * chunkSize
        var end = (chunkNum + 1) * chunkSize - 1
        end = Math.min(end, datalength - 1)
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') {
          lazyArray.chunks[chunkNum] = doXHR(start, end)
        }
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') throw new Error('doXHR failed!')
        return lazyArray.chunks[chunkNum]
      })
      if (usesGzip || !datalength) {
        chunkSize = datalength = 1
        datalength = this.getter(0).length
        chunkSize = datalength
        out('LazyFiles on gzip forces download of the whole file when length is accessed')
      }
      this._length = datalength
      this._chunkSize = chunkSize
      this.lengthKnown = true
    }
    if (typeof XMLHttpRequest !== 'undefined') {
      if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
      var lazyArray = new LazyUint8Array()
      Object.defineProperties(lazyArray, {
        length: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength()
            }
            return this._length
          }
        },
        chunkSize: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength()
            }
            return this._chunkSize
          }
        }
      })
      var properties = {
        isDevice: false,
        contents: lazyArray
      }
    } else {
      var properties = {
        isDevice: false,
        url: url
      }
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite)
    if (properties.contents) {
      node.contents = properties.contents
    } else if (properties.url) {
      node.contents = null
      node.url = properties.url
    }
    Object.defineProperties(node, {
      usedBytes: {
        get: function () {
          return this.contents.length
        }
      }
    })
    var stream_ops = {}
    var keys = Object.keys(node.stream_ops)
    keys.forEach(function (key) {
      var fn = node.stream_ops[key]
      stream_ops[key] = function forceLoadLazyFile () {
        if (!FS.forceLoadFile(node)) {
          throw new FS.ErrnoError(29)
        }
        return fn.apply(null, arguments)
      }
    })
    stream_ops.read = function stream_ops_read (stream, buffer, offset, length, position) {
      if (!FS.forceLoadFile(node)) {
        throw new FS.ErrnoError(29)
      }
      var contents = stream.node.contents
      if (position >= contents.length) return 0
      var size = Math.min(contents.length - position, length)
      if (contents.slice) {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i]
        }
      } else {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents.get(position + i)
        }
      }
      return size
    }
    node.stream_ops = stream_ops
    return node
  },
  createPreloadedFile: function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
    Browser.init()
    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent
    var dep = getUniqueRunDependency('cp ' + fullname)

    function processData (byteArray) {
      function finish (byteArray) {
        if (preFinish) preFinish()
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
        }
        if (onload) onload()
        removeRunDependency(dep)
      }
      var handled = false
      Module.preloadPlugins.forEach(function (plugin) {
        if (handled) return
        if (plugin.canHandle(fullname)) {
          plugin.handle(byteArray, fullname, finish, function () {
            if (onerror) onerror()
            removeRunDependency(dep)
          })
          handled = true
        }
      })
      if (!handled) finish(byteArray)
    }
    addRunDependency(dep)
    if (typeof url === 'string') {
      Browser.asyncLoad(url, function (byteArray) {
        processData(byteArray)
      }, onerror)
    } else {
      processData(url)
    }
  },
  indexedDB: function () {
    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
  },
  DB_NAME: function () {
    return 'EM_FS_' + window.location.pathname
  },
  DB_VERSION: 20,
  DB_STORE_NAME: 'FILE_DATA',
  saveFilesToDB: function (paths, onload, onerror) {
    onload = onload || function () {}
    onerror = onerror || function () {}
    var indexedDB = FS.indexedDB()
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
    } catch (e) {
      return onerror(e)
    }
    openRequest.onupgradeneeded = function openRequest_onupgradeneeded () {
      out('creating db')
      var db = openRequest.result
      db.createObjectStore(FS.DB_STORE_NAME)
    }
    openRequest.onsuccess = function openRequest_onsuccess () {
      var db = openRequest.result
      var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite')
      var files = transaction.objectStore(FS.DB_STORE_NAME)
      var ok = 0
      var fail = 0
      var total = paths.length

      function finish () {
        if (fail == 0) onload()
        else onerror()
      }
      paths.forEach(function (path) {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path)
        putRequest.onsuccess = function putRequest_onsuccess () {
          ok++
          if (ok + fail == total) finish()
        }
        putRequest.onerror = function putRequest_onerror () {
          fail++
          if (ok + fail == total) finish()
        }
      })
      transaction.onerror = onerror
    }
    openRequest.onerror = onerror
  },
  loadFilesFromDB: function (paths, onload, onerror) {
    onload = onload || function () {}
    onerror = onerror || function () {}
    var indexedDB = FS.indexedDB()
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
    } catch (e) {
      return onerror(e)
    }
    openRequest.onupgradeneeded = onerror
    openRequest.onsuccess = function openRequest_onsuccess () {
      var db = openRequest.result
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly')
      } catch (e) {
        onerror(e)
        return
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME)
      var ok = 0
      var fail = 0
      var total = paths.length

      function finish () {
        if (fail == 0) onload()
        else onerror()
      }
      paths.forEach(function (path) {
        var getRequest = files.get(path)
        getRequest.onsuccess = function getRequest_onsuccess () {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path)
          }
          FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true)
          ok++
          if (ok + fail == total) finish()
        }
        getRequest.onerror = function getRequest_onerror () {
          fail++
          if (ok + fail == total) finish()
        }
      })
      transaction.onerror = onerror
    }
    openRequest.onerror = onerror
  },
  mmapAlloc: function (size) {
    var alignedSize = alignMemory(size, 16384)
    var ptr = _malloc(alignedSize)
    while (size < alignedSize) HEAP8[ptr + size++] = 0
    return ptr
  }
}
var SYSCALLS = {
  mappings: {},
  DEFAULT_POLLMASK: 5,
  umask: 511,
  calculateAt: function (dirfd, path) {
    if (path[0] !== '/') {
      var dir
      if (dirfd === -100) {
        dir = FS.cwd()
      } else {
        var dirstream = FS.getStream(dirfd)
        if (!dirstream) throw new FS.ErrnoError(8)
        dir = dirstream.path
      }
      path = PATH.join2(dir, path)
    }
    return path
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path)
    } catch (e) {
      if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
        return -54
      }
      throw e
    }
    HEAP32[buf >> 2] = stat.dev
    HEAP32[buf + 4 >> 2] = 0
    HEAP32[buf + 8 >> 2] = stat.ino
    HEAP32[buf + 12 >> 2] = stat.mode
    HEAP32[buf + 16 >> 2] = stat.nlink
    HEAP32[buf + 20 >> 2] = stat.uid
    HEAP32[buf + 24 >> 2] = stat.gid
    HEAP32[buf + 28 >> 2] = stat.rdev
    HEAP32[buf + 32 >> 2] = 0
    tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1]
    HEAP32[buf + 48 >> 2] = 4096
    HEAP32[buf + 52 >> 2] = stat.blocks
    HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0
    HEAP32[buf + 60 >> 2] = 0
    HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0
    HEAP32[buf + 68 >> 2] = 0
    HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0
    HEAP32[buf + 76 >> 2] = 0
    tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1]
    return 0
  },
  doMsync: function (addr, stream, len, flags, offset) {
    var buffer = HEAPU8.slice(addr, addr + len)
    FS.msync(stream, buffer, offset, len, flags)
  },
  doMkdir: function (path, mode) {
    path = PATH.normalize(path)
    if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1)
    FS.mkdir(path, mode, 0)
    return 0
  },
  doMknod: function (path, mode, dev) {
    switch (mode & 61440) {
      case 32768:
      case 8192:
      case 24576:
      case 4096:
      case 49152:
        break
      default:
        return -28
    }
    FS.mknod(path, mode, dev)
    return 0
  },
  doReadlink: function (path, buf, bufsize) {
    if (bufsize <= 0) return -28
    var ret = FS.readlink(path)
    var len = Math.min(bufsize, lengthBytesUTF8(ret))
    var endChar = HEAP8[buf + len]
    stringToUTF8(ret, buf, bufsize + 1)
    HEAP8[buf + len] = endChar
    return len
  },
  doAccess: function (path, amode) {
    if (amode & ~7) {
      return -28
    }
    var node
    var lookup = FS.lookupPath(path, {
      follow: true
    })
    node = lookup.node
    if (!node) {
      return -44
    }
    var perms = ''
    if (amode & 4) perms += 'r'
    if (amode & 2) perms += 'w'
    if (amode & 1) perms += 'x'
    if (perms && FS.nodePermissions(node, perms)) {
      return -2
    }
    return 0
  },
  doDup: function (path, flags, suggestFD) {
    var suggest = FS.getStream(suggestFD)
    if (suggest) FS.close(suggest)
    return FS.open(path, flags, 0, suggestFD, suggestFD).fd
  },
  doReadv: function (stream, iov, iovcnt, offset) {
    var ret = 0
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[iov + i * 8 >> 2]
      var len = HEAP32[iov + (i * 8 + 4) >> 2]
      var curr = FS.read(stream, HEAP8, ptr, len, offset)
      if (curr < 0) return -1
      ret += curr
      if (curr < len) break
    }
    return ret
  },
  doWritev: function (stream, iov, iovcnt, offset) {
    var ret = 0
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[iov + i * 8 >> 2]
      var len = HEAP32[iov + (i * 8 + 4) >> 2]
      var curr = FS.write(stream, HEAP8, ptr, len, offset)
      if (curr < 0) return -1
      ret += curr
    }
    return ret
  },
  varargs: undefined,
  get: function () {
    SYSCALLS.varargs += 4
    var ret = HEAP32[SYSCALLS.varargs - 4 >> 2]
    return ret
  },
  getStr: function (ptr) {
    var ret = UTF8ToString(ptr)
    return ret
  },
  getStreamFromFD: function (fd) {
    var stream = FS.getStream(fd)
    if (!stream) throw new FS.ErrnoError(8)
    return stream
  },
  get64: function (low, high) {
    return low
  }
}

function ___sys_access (path, amode) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doAccess(path, amode)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_chmod (path, mode) {
  try {
    path = SYSCALLS.getStr(path)
    FS.chmod(path, mode)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_fcntl64 (fd, cmd, varargs) {
  SYSCALLS.varargs = varargs
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    switch (cmd) {
      case 0: {
        var arg = SYSCALLS.get()
        if (arg < 0) {
          return -28
        }
        var newStream
        newStream = FS.open(stream.path, stream.flags, 0, arg)
        return newStream.fd
      }
      case 1:
      case 2:
        return 0
      case 3:
        return stream.flags
      case 4: {
        var arg = SYSCALLS.get()
        stream.flags |= arg
        return 0
      }
      case 12: {
        var arg = SYSCALLS.get()
        var offset = 0
        HEAP16[arg + offset >> 1] = 2
        return 0
      }
      case 13:
      case 14:
        return 0
      case 16:
      case 8:
        return -28
      case 9:
        setErrNo(28)
        return -1
      default: {
        return -28
      }
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_fstat64 (fd, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    return SYSCALLS.doStat(FS.stat, stream.path, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_getcwd (buf, size) {
  try {
    if (size === 0) return -28
    var cwd = FS.cwd()
    var cwdLengthInBytes = lengthBytesUTF8(cwd)
    if (size < cwdLengthInBytes + 1) return -68
    stringToUTF8(cwd, buf, size)
    return buf
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_getdents64 (fd, dirp, count) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    if (!stream.getdents) {
      stream.getdents = FS.readdir(stream.path)
    }
    var struct_size = 280
    var pos = 0
    var off = FS.llseek(stream, 0, 1)
    var idx = Math.floor(off / struct_size)
    while (idx < stream.getdents.length && pos + struct_size <= count) {
      var id
      var type
      var name = stream.getdents[idx]
      if (name[0] === '.') {
        id = 1
        type = 4
      } else {
        var child = FS.lookupNode(stream.node, name)
        id = child.id
        type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
      }
      tempI64 = [id >>> 0, (tempDouble = id, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1]
      tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1]
      HEAP16[dirp + pos + 16 >> 1] = 280
      HEAP8[dirp + pos + 18 >> 0] = type
      stringToUTF8(name, dirp + pos + 19, 256)
      pos += struct_size
      idx += 1
    }
    FS.llseek(stream, idx * struct_size, 0)
    return pos
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_getpid () {
  return 42
}

function ___sys_ioctl (fd, op, varargs) {
  SYSCALLS.varargs = varargs
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    switch (op) {
      case 21509:
      case 21505: {
        if (!stream.tty) return -59
        return 0
      }
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508: {
        if (!stream.tty) return -59
        return 0
      }
      case 21519: {
        if (!stream.tty) return -59
        var argp = SYSCALLS.get()
        HEAP32[argp >> 2] = 0
        return 0
      }
      case 21520: {
        if (!stream.tty) return -59
        return -28
      }
      case 21531: {
        var argp = SYSCALLS.get()
        return FS.ioctl(stream, op, argp)
      }
      case 21523: {
        if (!stream.tty) return -59
        return 0
      }
      case 21524: {
        if (!stream.tty) return -59
        return 0
      }
      default:
        abort('bad ioctl syscall ' + op)
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_link (oldpath, newpath) {
  return -34
}

function ___sys_lstat64 (path, buf) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doStat(FS.lstat, path, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_mkdir (path, mode) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doMkdir(path, mode)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_mprotect (addr, len, size) {
  return 0
}

function ___sys_open (path, flags, varargs) {
  SYSCALLS.varargs = varargs
  try {
    var pathname = SYSCALLS.getStr(path)
    var mode = SYSCALLS.get()
    var stream = FS.open(pathname, flags, mode)
    return stream.fd
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_read (fd, buf, count) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    return FS.read(stream, HEAP8, buf, count)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_readlink (path, buf, bufsize) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doReadlink(path, buf, bufsize)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_rename (old_path, new_path) {
  try {
    old_path = SYSCALLS.getStr(old_path)
    new_path = SYSCALLS.getStr(new_path)
    FS.rename(old_path, new_path)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_rmdir (path) {
  try {
    path = SYSCALLS.getStr(path)
    FS.rmdir(path)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_stat64 (path, buf) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doStat(FS.stat, path, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_symlink (target, linkpath) {
  try {
    target = SYSCALLS.getStr(target)
    linkpath = SYSCALLS.getStr(linkpath)
    FS.symlink(target, linkpath)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function ___sys_unlink (path) {
  try {
    path = SYSCALLS.getStr(path)
    FS.unlink(path)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return -e.errno
  }
}

function _abort () {
  abort()
}

function _longjmp (env, value) {
  _setThrew(env, value || 1)
  throw 'longjmp'
}

function _emscripten_longjmp (env, value) {
  _longjmp(env, value)
}

function _emscripten_memcpy_big (dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num)
}

function _emscripten_get_heap_size () {
  return HEAPU8.length
}

function emscripten_realloc_buffer (size) {
  try {
    wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16)
    updateGlobalBufferAndViews(wasmMemory.buffer)
    return 1
  } catch (e) {}
}

function _emscripten_resize_heap (requestedSize) {
  requestedSize = requestedSize >>> 0
  var oldSize = _emscripten_get_heap_size()
  var maxHeapSize = 2147483648
  if (requestedSize > maxHeapSize) {
    return false
  }
  var minHeapSize = 16777216
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown)
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296)
    var newSize = Math.min(maxHeapSize, alignUp(Math.max(minHeapSize, requestedSize, overGrownHeapSize), 65536))
    var replacement = emscripten_realloc_buffer(newSize)
    if (replacement) {
      return true
    }
  }
  return false
}
var ENV = {}

function getExecutableName () {
  return thisProgram || './this.program'
}

function getEnvStrings () {
  if (!getEnvStrings.strings) {
    var lang = (typeof navigator === 'object' && navigator.languages && navigator.languages[0] || 'C').replace('-', '_') + '.UTF-8'
    var env = {
      USER: 'web_user',
      LOGNAME: 'web_user',
      PATH: '/',
      PWD: '/',
      HOME: '/home/web_user',
      LANG: lang,
      _: getExecutableName()
    }
    for (var x in ENV) {
      env[x] = ENV[x]
    }
    var strings = []
    for (var x in env) {
      strings.push(x + '=' + env[x])
    }
    getEnvStrings.strings = strings
  }
  return getEnvStrings.strings
}

function _environ_get (__environ, environ_buf) {
  var bufSize = 0
  getEnvStrings().forEach(function (string, i) {
    var ptr = environ_buf + bufSize
    HEAP32[__environ + i * 4 >> 2] = ptr
    writeAsciiToMemory(string, ptr)
    bufSize += string.length + 1
  })
  return 0
}

function _environ_sizes_get (penviron_count, penviron_buf_size) {
  var strings = getEnvStrings()
  HEAP32[penviron_count >> 2] = strings.length
  var bufSize = 0
  strings.forEach(function (string) {
    bufSize += string.length + 1
  })
  HEAP32[penviron_buf_size >> 2] = bufSize
  return 0
}

function _exit (status) {
  exit(status)
}

function _fd_close (fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    FS.close(stream)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return e.errno
  }
}

function _fd_fdstat_get (fd, pbuf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4
    HEAP8[pbuf >> 0] = type
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return e.errno
  }
}

function _fd_read (fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var num = SYSCALLS.doReadv(stream, iov, iovcnt)
    HEAP32[pnum >> 2] = num
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return e.errno
  }
}

function _fd_seek (fd, offset_low, offset_high, whence, newOffset) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var HIGH_OFFSET = 4294967296
    var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0)
    var DOUBLE_LIMIT = 9007199254740992
    if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
      return -61
    }
    FS.llseek(stream, offset, whence)
    tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1]
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return e.errno
  }
}

function _fd_write (fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var num = SYSCALLS.doWritev(stream, iov, iovcnt)
    HEAP32[pnum >> 2] = num
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
    return e.errno
  }
}

function _gettimeofday (ptr) {
  var now = Date.now()
  HEAP32[ptr >> 2] = now / 1e3 | 0
  HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0
  return 0
}

function _sysconf (name) {
  switch (name) {
    case 30:
      return 16384
    case 85:
      var maxHeapSize = 2147483648
      return maxHeapSize / 16384
    case 132:
    case 133:
    case 12:
    case 137:
    case 138:
    case 15:
    case 235:
    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 149:
    case 13:
    case 10:
    case 236:
    case 153:
    case 9:
    case 21:
    case 22:
    case 159:
    case 154:
    case 14:
    case 77:
    case 78:
    case 139:
    case 80:
    case 81:
    case 82:
    case 68:
    case 67:
    case 164:
    case 11:
    case 29:
    case 47:
    case 48:
    case 95:
    case 52:
    case 51:
    case 46:
    case 79:
      return 200809
    case 27:
    case 246:
    case 127:
    case 128:
    case 23:
    case 24:
    case 160:
    case 161:
    case 181:
    case 182:
    case 242:
    case 183:
    case 184:
    case 243:
    case 244:
    case 245:
    case 165:
    case 178:
    case 179:
    case 49:
    case 50:
    case 168:
    case 169:
    case 175:
    case 170:
    case 171:
    case 172:
    case 97:
    case 76:
    case 32:
    case 173:
    case 35:
      return -1
    case 176:
    case 177:
    case 7:
    case 155:
    case 8:
    case 157:
    case 125:
    case 126:
    case 92:
    case 93:
    case 129:
    case 130:
    case 131:
    case 94:
    case 91:
      return 1
    case 74:
    case 60:
    case 69:
    case 70:
    case 4:
      return 1024
    case 31:
    case 42:
    case 72:
      return 32
    case 87:
    case 26:
    case 33:
      return 2147483647
    case 34:
    case 1:
      return 47839
    case 38:
    case 36:
      return 99
    case 43:
    case 37:
      return 2048
    case 0:
      return 2097152
    case 3:
      return 65536
    case 28:
      return 32768
    case 44:
      return 32767
    case 75:
      return 16384
    case 39:
      return 1e3
    case 89:
      return 700
    case 71:
      return 256
    case 40:
      return 255
    case 2:
      return 100
    case 180:
      return 64
    case 25:
      return 20
    case 5:
      return 16
    case 6:
      return 6
    case 73:
      return 4
    case 84: {
      if (typeof navigator === 'object') return navigator.hardwareConcurrency || 1
      return 1
    }
  }
  setErrNo(28)
  return -1
}

function _time (ptr) {
  var ret = Date.now() / 1e3 | 0
  if (ptr) {
    HEAP32[ptr >> 2] = ret
  }
  return ret
}
var FSNode = function (parent, name, mode, rdev) {
  if (!parent) {
    parent = this
  }
  this.parent = parent
  this.mount = parent.mount
  this.mounted = null
  this.id = FS.nextInode++
  this.name = name
  this.mode = mode
  this.node_ops = {}
  this.stream_ops = {}
  this.rdev = rdev
}
var readMode = 292 | 73
var writeMode = 146
Object.defineProperties(FSNode.prototype, {
  read: {
    get: function () {
      return (this.mode & readMode) === readMode
    },
    set: function (val) {
      val ? this.mode |= readMode : this.mode &= ~readMode
    }
  },
  write: {
    get: function () {
      return (this.mode & writeMode) === writeMode
    },
    set: function (val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode
    }
  },
  isFolder: {
    get: function () {
      return FS.isDir(this.mode)
    }
  },
  isDevice: {
    get: function () {
      return FS.isChrdev(this.mode)
    }
  }
})
FS.FSNode = FSNode
FS.staticInit()
Module.FS_createFolder = FS.createFolder
Module.FS_createPath = FS.createPath
Module.FS_createDataFile = FS.createDataFile
Module.FS_createPreloadedFile = FS.createPreloadedFile
Module.FS_createLazyFile = FS.createLazyFile
Module.FS_createLink = FS.createLink
Module.FS_createDevice = FS.createDevice
Module.FS_unlink = FS.unlink
var ASSERTIONS = false

function intArrayFromString (stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1
  var u8array = new Array(len)
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length)
  if (dontAddNull) u8array.length = numBytesWritten
  return u8array
}

function intArrayToString (array) {
  var ret = []
  for (var i = 0; i < array.length; i++) {
    var chr = array[i]
    if (chr > 255) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.')
      }
      chr &= 255
    }
    ret.push(String.fromCharCode(chr))
  }
  return ret.join('')
}
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var output = ''
  var chr1, chr2, chr3
  var enc1, enc2, enc3, enc4
  var i = 0
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
  do {
    enc1 = keyStr.indexOf(input.charAt(i++))
    enc2 = keyStr.indexOf(input.charAt(i++))
    enc3 = keyStr.indexOf(input.charAt(i++))
    enc4 = keyStr.indexOf(input.charAt(i++))
    chr1 = enc1 << 2 | enc2 >> 4
    chr2 = (enc2 & 15) << 4 | enc3 >> 2
    chr3 = (enc3 & 3) << 6 | enc4
    output = output + String.fromCharCode(chr1)
    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2)
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3)
    }
  } while (i < input.length)
  return output
}

function intArrayFromBase64 (s) {
  try {
    var decoded = decodeBase64(s)
    var bytes = new Uint8Array(decoded.length)
    for (var i = 0; i < decoded.length; ++i) {
      bytes[i] = decoded.charCodeAt(i)
    }
    return bytes
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.')
  }
}

function tryParseAsDataURI (filename) {
  if (!isDataURI(filename)) {
    return
  }
  return intArrayFromBase64(filename.slice(dataURIPrefix.length))
}
var asmLibraryArg = {
  a: ___assert_fail,
  D: ___clock_gettime,
  G: ___sys_access,
  C: ___sys_chmod,
  c: ___sys_fcntl64,
  A: ___sys_fstat64,
  J: ___sys_getcwd,
  P: ___sys_getdents64,
  h: ___sys_getpid,
  O: ___sys_ioctl,
  F: ___sys_link,
  z: ___sys_lstat64,
  B: ___sys_mkdir,
  y: ___sys_mprotect,
  i: ___sys_open,
  H: ___sys_read,
  E: ___sys_readlink,
  M: ___sys_rename,
  L: ___sys_rmdir,
  n: ___sys_stat64,
  K: ___sys_symlink,
  I: ___sys_unlink,
  k: _abort,
  o: _emscripten_get_now,
  g: _emscripten_longjmp,
  t: _emscripten_memcpy_big,
  u: _emscripten_resize_heap,
  w: _environ_get,
  x: _environ_sizes_get,
  f: _exit,
  e: _fd_close,
  v: _fd_fdstat_get,
  N: _fd_read,
  s: _fd_seek,
  j: _fd_write,
  d: getTempRet0,
  Q: _gettimeofday,
  r: invoke_iii,
  m: invoke_iiii,
  q: invoke_iiiii,
  R: invoke_vii,
  memory: wasmMemory,
  b: setTempRet0,
  p: _sysconf,
  table: wasmTable,
  l: _time
}
var asm = createWasm()
var ___wasm_call_ctors = Module.___wasm_call_ctors = function () {
  return (___wasm_call_ctors = Module.___wasm_call_ctors = Module.asm.S).apply(null, arguments)
}
var _main = Module._main = function () {
  return (_main = Module._main = Module.asm.T).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_Start_0 = Module._emscripten_bind_ASS_Event_get_Start_0 = function () {
  return (_emscripten_bind_ASS_Event_get_Start_0 = Module._emscripten_bind_ASS_Event_get_Start_0 = Module.asm.U).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_Start_1 = Module._emscripten_bind_ASS_Event_set_Start_1 = function () {
  return (_emscripten_bind_ASS_Event_set_Start_1 = Module._emscripten_bind_ASS_Event_set_Start_1 = Module.asm.V).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_Duration_0 = Module._emscripten_bind_ASS_Event_get_Duration_0 = function () {
  return (_emscripten_bind_ASS_Event_get_Duration_0 = Module._emscripten_bind_ASS_Event_get_Duration_0 = Module.asm.W).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_Duration_1 = Module._emscripten_bind_ASS_Event_set_Duration_1 = function () {
  return (_emscripten_bind_ASS_Event_set_Duration_1 = Module._emscripten_bind_ASS_Event_set_Duration_1 = Module.asm.X).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_ReadOrder_0 = Module._emscripten_bind_ASS_Event_get_ReadOrder_0 = function () {
  return (_emscripten_bind_ASS_Event_get_ReadOrder_0 = Module._emscripten_bind_ASS_Event_get_ReadOrder_0 = Module.asm.Y).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_ReadOrder_1 = Module._emscripten_bind_ASS_Event_set_ReadOrder_1 = function () {
  return (_emscripten_bind_ASS_Event_set_ReadOrder_1 = Module._emscripten_bind_ASS_Event_set_ReadOrder_1 = Module.asm.Z).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_Layer_0 = Module._emscripten_bind_ASS_Event_get_Layer_0 = function () {
  return (_emscripten_bind_ASS_Event_get_Layer_0 = Module._emscripten_bind_ASS_Event_get_Layer_0 = Module.asm._).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_Layer_1 = Module._emscripten_bind_ASS_Event_set_Layer_1 = function () {
  return (_emscripten_bind_ASS_Event_set_Layer_1 = Module._emscripten_bind_ASS_Event_set_Layer_1 = Module.asm.$).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_Style_0 = Module._emscripten_bind_ASS_Event_get_Style_0 = function () {
  return (_emscripten_bind_ASS_Event_get_Style_0 = Module._emscripten_bind_ASS_Event_get_Style_0 = Module.asm.aa).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_Style_1 = Module._emscripten_bind_ASS_Event_set_Style_1 = function () {
  return (_emscripten_bind_ASS_Event_set_Style_1 = Module._emscripten_bind_ASS_Event_set_Style_1 = Module.asm.ba).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_Name_0 = Module._emscripten_bind_ASS_Event_get_Name_0 = function () {
  return (_emscripten_bind_ASS_Event_get_Name_0 = Module._emscripten_bind_ASS_Event_get_Name_0 = Module.asm.ca).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_Name_1 = Module._emscripten_bind_ASS_Event_set_Name_1 = function () {
  return (_emscripten_bind_ASS_Event_set_Name_1 = Module._emscripten_bind_ASS_Event_set_Name_1 = Module.asm.da).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_MarginL_0 = Module._emscripten_bind_ASS_Event_get_MarginL_0 = function () {
  return (_emscripten_bind_ASS_Event_get_MarginL_0 = Module._emscripten_bind_ASS_Event_get_MarginL_0 = Module.asm.ea).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_MarginL_1 = Module._emscripten_bind_ASS_Event_set_MarginL_1 = function () {
  return (_emscripten_bind_ASS_Event_set_MarginL_1 = Module._emscripten_bind_ASS_Event_set_MarginL_1 = Module.asm.fa).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_MarginR_0 = Module._emscripten_bind_ASS_Event_get_MarginR_0 = function () {
  return (_emscripten_bind_ASS_Event_get_MarginR_0 = Module._emscripten_bind_ASS_Event_get_MarginR_0 = Module.asm.ga).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_MarginR_1 = Module._emscripten_bind_ASS_Event_set_MarginR_1 = function () {
  return (_emscripten_bind_ASS_Event_set_MarginR_1 = Module._emscripten_bind_ASS_Event_set_MarginR_1 = Module.asm.ha).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_MarginV_0 = Module._emscripten_bind_ASS_Event_get_MarginV_0 = function () {
  return (_emscripten_bind_ASS_Event_get_MarginV_0 = Module._emscripten_bind_ASS_Event_get_MarginV_0 = Module.asm.ia).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_MarginV_1 = Module._emscripten_bind_ASS_Event_set_MarginV_1 = function () {
  return (_emscripten_bind_ASS_Event_set_MarginV_1 = Module._emscripten_bind_ASS_Event_set_MarginV_1 = Module.asm.ja).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_Effect_0 = Module._emscripten_bind_ASS_Event_get_Effect_0 = function () {
  return (_emscripten_bind_ASS_Event_get_Effect_0 = Module._emscripten_bind_ASS_Event_get_Effect_0 = Module.asm.ka).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_Effect_1 = Module._emscripten_bind_ASS_Event_set_Effect_1 = function () {
  return (_emscripten_bind_ASS_Event_set_Effect_1 = Module._emscripten_bind_ASS_Event_set_Effect_1 = Module.asm.la).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_get_Text_0 = Module._emscripten_bind_ASS_Event_get_Text_0 = function () {
  return (_emscripten_bind_ASS_Event_get_Text_0 = Module._emscripten_bind_ASS_Event_get_Text_0 = Module.asm.ma).apply(null, arguments)
}
var _emscripten_bind_ASS_Event_set_Text_1 = Module._emscripten_bind_ASS_Event_set_Text_1 = function () {
  return (_emscripten_bind_ASS_Event_set_Text_1 = Module._emscripten_bind_ASS_Event_set_Text_1 = Module.asm.na).apply(null, arguments)
}
var _emscripten_bind_RenderBlendResult_get_changed_0 = Module._emscripten_bind_RenderBlendResult_get_changed_0 = function () {
  return (_emscripten_bind_RenderBlendResult_get_changed_0 = Module._emscripten_bind_RenderBlendResult_get_changed_0 = Module.asm.oa).apply(null, arguments)
}
var _emscripten_bind_RenderBlendResult_set_changed_1 = Module._emscripten_bind_RenderBlendResult_set_changed_1 = function () {
  return (_emscripten_bind_RenderBlendResult_set_changed_1 = Module._emscripten_bind_RenderBlendResult_set_changed_1 = Module.asm.pa).apply(null, arguments)
}
var _emscripten_bind_RenderBlendResult_get_blend_time_0 = Module._emscripten_bind_RenderBlendResult_get_blend_time_0 = function () {
  return (_emscripten_bind_RenderBlendResult_get_blend_time_0 = Module._emscripten_bind_RenderBlendResult_get_blend_time_0 = Module.asm.qa).apply(null, arguments)
}
var _emscripten_bind_RenderBlendResult_set_blend_time_1 = Module._emscripten_bind_RenderBlendResult_set_blend_time_1 = function () {
  return (_emscripten_bind_RenderBlendResult_set_blend_time_1 = Module._emscripten_bind_RenderBlendResult_set_blend_time_1 = Module.asm.ra).apply(null, arguments)
}
var _emscripten_bind_RenderBlendResult_get_part_0 = Module._emscripten_bind_RenderBlendResult_get_part_0 = function () {
  return (_emscripten_bind_RenderBlendResult_get_part_0 = Module._emscripten_bind_RenderBlendResult_get_part_0 = Module.asm.sa).apply(null, arguments)
}
var _emscripten_bind_RenderBlendResult_set_part_1 = Module._emscripten_bind_RenderBlendResult_set_part_1 = function () {
  return (_emscripten_bind_RenderBlendResult_set_part_1 = Module._emscripten_bind_RenderBlendResult_set_part_1 = Module.asm.ta).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_SubtitleOctopus_0 = Module._emscripten_bind_SubtitleOctopus_SubtitleOctopus_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_SubtitleOctopus_0 = Module._emscripten_bind_SubtitleOctopus_SubtitleOctopus_0 = Module.asm.ua).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_setLogLevel_1 = Module._emscripten_bind_SubtitleOctopus_setLogLevel_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_setLogLevel_1 = Module._emscripten_bind_SubtitleOctopus_setLogLevel_1 = Module.asm.va).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_setDropAnimations_1 = Module._emscripten_bind_SubtitleOctopus_setDropAnimations_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_setDropAnimations_1 = Module._emscripten_bind_SubtitleOctopus_setDropAnimations_1 = Module.asm.wa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_getDropAnimations_0 = Module._emscripten_bind_SubtitleOctopus_getDropAnimations_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_getDropAnimations_0 = Module._emscripten_bind_SubtitleOctopus_getDropAnimations_0 = Module.asm.xa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_initLibrary_3 = Module._emscripten_bind_SubtitleOctopus_initLibrary_3 = function () {
  return (_emscripten_bind_SubtitleOctopus_initLibrary_3 = Module._emscripten_bind_SubtitleOctopus_initLibrary_3 = Module.asm.ya).apply(null, arguments)
}
var _free = Module._free = function () {
  return (_free = Module._free = Module.asm.za).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_createTrack_1 = Module._emscripten_bind_SubtitleOctopus_createTrack_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_createTrack_1 = Module._emscripten_bind_SubtitleOctopus_createTrack_1 = Module.asm.Aa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_createTrackMem_2 = Module._emscripten_bind_SubtitleOctopus_createTrackMem_2 = function () {
  return (_emscripten_bind_SubtitleOctopus_createTrackMem_2 = Module._emscripten_bind_SubtitleOctopus_createTrackMem_2 = Module.asm.Ba).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_removeTrack_0 = Module._emscripten_bind_SubtitleOctopus_removeTrack_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_removeTrack_0 = Module._emscripten_bind_SubtitleOctopus_removeTrack_0 = Module.asm.Ca).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_resizeCanvas_2 = Module._emscripten_bind_SubtitleOctopus_resizeCanvas_2 = function () {
  return (_emscripten_bind_SubtitleOctopus_resizeCanvas_2 = Module._emscripten_bind_SubtitleOctopus_resizeCanvas_2 = Module.asm.Da).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_renderImage_2 = Module._emscripten_bind_SubtitleOctopus_renderImage_2 = function () {
  return (_emscripten_bind_SubtitleOctopus_renderImage_2 = Module._emscripten_bind_SubtitleOctopus_renderImage_2 = Module.asm.Ea).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_quitLibrary_0 = Module._emscripten_bind_SubtitleOctopus_quitLibrary_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_quitLibrary_0 = Module._emscripten_bind_SubtitleOctopus_quitLibrary_0 = Module.asm.Fa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_reloadLibrary_0 = Module._emscripten_bind_SubtitleOctopus_reloadLibrary_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_reloadLibrary_0 = Module._emscripten_bind_SubtitleOctopus_reloadLibrary_0 = Module.asm.Ga).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_reloadFonts_0 = Module._emscripten_bind_SubtitleOctopus_reloadFonts_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_reloadFonts_0 = Module._emscripten_bind_SubtitleOctopus_reloadFonts_0 = Module.asm.Ha).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_setMargin_4 = Module._emscripten_bind_SubtitleOctopus_setMargin_4 = function () {
  return (_emscripten_bind_SubtitleOctopus_setMargin_4 = Module._emscripten_bind_SubtitleOctopus_setMargin_4 = Module.asm.Ia).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_getEventCount_0 = Module._emscripten_bind_SubtitleOctopus_getEventCount_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_getEventCount_0 = Module._emscripten_bind_SubtitleOctopus_getEventCount_0 = Module.asm.Ja).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_allocEvent_0 = Module._emscripten_bind_SubtitleOctopus_allocEvent_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_allocEvent_0 = Module._emscripten_bind_SubtitleOctopus_allocEvent_0 = Module.asm.Ka).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_allocStyle_0 = Module._emscripten_bind_SubtitleOctopus_allocStyle_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_allocStyle_0 = Module._emscripten_bind_SubtitleOctopus_allocStyle_0 = Module.asm.La).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_removeEvent_1 = Module._emscripten_bind_SubtitleOctopus_removeEvent_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_removeEvent_1 = Module._emscripten_bind_SubtitleOctopus_removeEvent_1 = Module.asm.Ma).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_getStyleCount_0 = Module._emscripten_bind_SubtitleOctopus_getStyleCount_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_getStyleCount_0 = Module._emscripten_bind_SubtitleOctopus_getStyleCount_0 = Module.asm.Na).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_getStyleByName_1 = Module._emscripten_bind_SubtitleOctopus_getStyleByName_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_getStyleByName_1 = Module._emscripten_bind_SubtitleOctopus_getStyleByName_1 = Module.asm.Oa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_removeStyle_1 = Module._emscripten_bind_SubtitleOctopus_removeStyle_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_removeStyle_1 = Module._emscripten_bind_SubtitleOctopus_removeStyle_1 = Module.asm.Pa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_removeAllEvents_0 = Module._emscripten_bind_SubtitleOctopus_removeAllEvents_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_removeAllEvents_0 = Module._emscripten_bind_SubtitleOctopus_removeAllEvents_0 = Module.asm.Qa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_setMemoryLimits_2 = Module._emscripten_bind_SubtitleOctopus_setMemoryLimits_2 = function () {
  return (_emscripten_bind_SubtitleOctopus_setMemoryLimits_2 = Module._emscripten_bind_SubtitleOctopus_setMemoryLimits_2 = Module.asm.Ra).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_renderBlend_2 = Module._emscripten_bind_SubtitleOctopus_renderBlend_2 = function () {
  return (_emscripten_bind_SubtitleOctopus_renderBlend_2 = Module._emscripten_bind_SubtitleOctopus_renderBlend_2 = Module.asm.Sa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_findNextEventStart_1 = Module._emscripten_bind_SubtitleOctopus_findNextEventStart_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_findNextEventStart_1 = Module._emscripten_bind_SubtitleOctopus_findNextEventStart_1 = Module.asm.Ta).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_findEventStopTimes_1 = Module._emscripten_bind_SubtitleOctopus_findEventStopTimes_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_findEventStopTimes_1 = Module._emscripten_bind_SubtitleOctopus_findEventStopTimes_1 = Module.asm.Ua).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_setTrackFeatures_0 = Module._emscripten_bind_SubtitleOctopus_setTrackFeatures_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_setTrackFeatures_0 = Module._emscripten_bind_SubtitleOctopus_setTrackFeatures_0 = Module.asm.Va).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_rescanAllAnimations_0 = Module._emscripten_bind_SubtitleOctopus_rescanAllAnimations_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_rescanAllAnimations_0 = Module._emscripten_bind_SubtitleOctopus_rescanAllAnimations_0 = Module.asm.Wa).apply(null, arguments)
}
var _malloc = Module._malloc = function () {
  return (_malloc = Module._malloc = Module.asm.Xa).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_get_track_0 = Module._emscripten_bind_SubtitleOctopus_get_track_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_get_track_0 = Module._emscripten_bind_SubtitleOctopus_get_track_0 = Module.asm.Ya).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_set_track_1 = Module._emscripten_bind_SubtitleOctopus_set_track_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_set_track_1 = Module._emscripten_bind_SubtitleOctopus_set_track_1 = Module.asm.Za).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_get_ass_renderer_0 = Module._emscripten_bind_SubtitleOctopus_get_ass_renderer_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_get_ass_renderer_0 = Module._emscripten_bind_SubtitleOctopus_get_ass_renderer_0 = Module.asm._a).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_set_ass_renderer_1 = Module._emscripten_bind_SubtitleOctopus_set_ass_renderer_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_set_ass_renderer_1 = Module._emscripten_bind_SubtitleOctopus_set_ass_renderer_1 = Module.asm.$a).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_get_ass_library_0 = Module._emscripten_bind_SubtitleOctopus_get_ass_library_0 = function () {
  return (_emscripten_bind_SubtitleOctopus_get_ass_library_0 = Module._emscripten_bind_SubtitleOctopus_get_ass_library_0 = Module.asm.ab).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus_set_ass_library_1 = Module._emscripten_bind_SubtitleOctopus_set_ass_library_1 = function () {
  return (_emscripten_bind_SubtitleOctopus_set_ass_library_1 = Module._emscripten_bind_SubtitleOctopus_set_ass_library_1 = Module.asm.bb).apply(null, arguments)
}
var _emscripten_bind_SubtitleOctopus___destroy___0 = Module._emscripten_bind_SubtitleOctopus___destroy___0 = function () {
  return (_emscripten_bind_SubtitleOctopus___destroy___0 = Module._emscripten_bind_SubtitleOctopus___destroy___0 = Module.asm.cb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_n_styles_0 = Module._emscripten_bind_ASS_Track_get_n_styles_0 = function () {
  return (_emscripten_bind_ASS_Track_get_n_styles_0 = Module._emscripten_bind_ASS_Track_get_n_styles_0 = Module.asm.db).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_n_styles_1 = Module._emscripten_bind_ASS_Track_set_n_styles_1 = function () {
  return (_emscripten_bind_ASS_Track_set_n_styles_1 = Module._emscripten_bind_ASS_Track_set_n_styles_1 = Module.asm.eb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_max_styles_0 = Module._emscripten_bind_ASS_Track_get_max_styles_0 = function () {
  return (_emscripten_bind_ASS_Track_get_max_styles_0 = Module._emscripten_bind_ASS_Track_get_max_styles_0 = Module.asm.fb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_max_styles_1 = Module._emscripten_bind_ASS_Track_set_max_styles_1 = function () {
  return (_emscripten_bind_ASS_Track_set_max_styles_1 = Module._emscripten_bind_ASS_Track_set_max_styles_1 = Module.asm.gb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_n_events_0 = Module._emscripten_bind_ASS_Track_get_n_events_0 = function () {
  return (_emscripten_bind_ASS_Track_get_n_events_0 = Module._emscripten_bind_ASS_Track_get_n_events_0 = Module.asm.hb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_n_events_1 = Module._emscripten_bind_ASS_Track_set_n_events_1 = function () {
  return (_emscripten_bind_ASS_Track_set_n_events_1 = Module._emscripten_bind_ASS_Track_set_n_events_1 = Module.asm.ib).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_max_events_0 = Module._emscripten_bind_ASS_Track_get_max_events_0 = function () {
  return (_emscripten_bind_ASS_Track_get_max_events_0 = Module._emscripten_bind_ASS_Track_get_max_events_0 = Module.asm.jb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_max_events_1 = Module._emscripten_bind_ASS_Track_set_max_events_1 = function () {
  return (_emscripten_bind_ASS_Track_set_max_events_1 = Module._emscripten_bind_ASS_Track_set_max_events_1 = Module.asm.kb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_styles_1 = Module._emscripten_bind_ASS_Track_get_styles_1 = function () {
  return (_emscripten_bind_ASS_Track_get_styles_1 = Module._emscripten_bind_ASS_Track_get_styles_1 = Module.asm.lb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_styles_2 = Module._emscripten_bind_ASS_Track_set_styles_2 = function () {
  return (_emscripten_bind_ASS_Track_set_styles_2 = Module._emscripten_bind_ASS_Track_set_styles_2 = Module.asm.mb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_events_1 = Module._emscripten_bind_ASS_Track_get_events_1 = function () {
  return (_emscripten_bind_ASS_Track_get_events_1 = Module._emscripten_bind_ASS_Track_get_events_1 = Module.asm.nb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_events_2 = Module._emscripten_bind_ASS_Track_set_events_2 = function () {
  return (_emscripten_bind_ASS_Track_set_events_2 = Module._emscripten_bind_ASS_Track_set_events_2 = Module.asm.ob).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_style_format_0 = Module._emscripten_bind_ASS_Track_get_style_format_0 = function () {
  return (_emscripten_bind_ASS_Track_get_style_format_0 = Module._emscripten_bind_ASS_Track_get_style_format_0 = Module.asm.pb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_style_format_1 = Module._emscripten_bind_ASS_Track_set_style_format_1 = function () {
  return (_emscripten_bind_ASS_Track_set_style_format_1 = Module._emscripten_bind_ASS_Track_set_style_format_1 = Module.asm.qb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_event_format_0 = Module._emscripten_bind_ASS_Track_get_event_format_0 = function () {
  return (_emscripten_bind_ASS_Track_get_event_format_0 = Module._emscripten_bind_ASS_Track_get_event_format_0 = Module.asm.rb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_event_format_1 = Module._emscripten_bind_ASS_Track_set_event_format_1 = function () {
  return (_emscripten_bind_ASS_Track_set_event_format_1 = Module._emscripten_bind_ASS_Track_set_event_format_1 = Module.asm.sb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_PlayResX_0 = Module._emscripten_bind_ASS_Track_get_PlayResX_0 = function () {
  return (_emscripten_bind_ASS_Track_get_PlayResX_0 = Module._emscripten_bind_ASS_Track_get_PlayResX_0 = Module.asm.tb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_PlayResX_1 = Module._emscripten_bind_ASS_Track_set_PlayResX_1 = function () {
  return (_emscripten_bind_ASS_Track_set_PlayResX_1 = Module._emscripten_bind_ASS_Track_set_PlayResX_1 = Module.asm.ub).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_PlayResY_0 = Module._emscripten_bind_ASS_Track_get_PlayResY_0 = function () {
  return (_emscripten_bind_ASS_Track_get_PlayResY_0 = Module._emscripten_bind_ASS_Track_get_PlayResY_0 = Module.asm.vb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_PlayResY_1 = Module._emscripten_bind_ASS_Track_set_PlayResY_1 = function () {
  return (_emscripten_bind_ASS_Track_set_PlayResY_1 = Module._emscripten_bind_ASS_Track_set_PlayResY_1 = Module.asm.wb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_Timer_0 = Module._emscripten_bind_ASS_Track_get_Timer_0 = function () {
  return (_emscripten_bind_ASS_Track_get_Timer_0 = Module._emscripten_bind_ASS_Track_get_Timer_0 = Module.asm.xb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_Timer_1 = Module._emscripten_bind_ASS_Track_set_Timer_1 = function () {
  return (_emscripten_bind_ASS_Track_set_Timer_1 = Module._emscripten_bind_ASS_Track_set_Timer_1 = Module.asm.yb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_WrapStyle_0 = Module._emscripten_bind_ASS_Track_get_WrapStyle_0 = function () {
  return (_emscripten_bind_ASS_Track_get_WrapStyle_0 = Module._emscripten_bind_ASS_Track_get_WrapStyle_0 = Module.asm.zb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_WrapStyle_1 = Module._emscripten_bind_ASS_Track_set_WrapStyle_1 = function () {
  return (_emscripten_bind_ASS_Track_set_WrapStyle_1 = Module._emscripten_bind_ASS_Track_set_WrapStyle_1 = Module.asm.Ab).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0 = Module._emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0 = function () {
  return (_emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0 = Module._emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0 = Module.asm.Bb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1 = Module._emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1 = function () {
  return (_emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1 = Module._emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1 = Module.asm.Cb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_Kerning_0 = Module._emscripten_bind_ASS_Track_get_Kerning_0 = function () {
  return (_emscripten_bind_ASS_Track_get_Kerning_0 = Module._emscripten_bind_ASS_Track_get_Kerning_0 = Module.asm.Db).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_Kerning_1 = Module._emscripten_bind_ASS_Track_set_Kerning_1 = function () {
  return (_emscripten_bind_ASS_Track_set_Kerning_1 = Module._emscripten_bind_ASS_Track_set_Kerning_1 = Module.asm.Eb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_Language_0 = Module._emscripten_bind_ASS_Track_get_Language_0 = function () {
  return (_emscripten_bind_ASS_Track_get_Language_0 = Module._emscripten_bind_ASS_Track_get_Language_0 = Module.asm.Fb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_Language_1 = Module._emscripten_bind_ASS_Track_set_Language_1 = function () {
  return (_emscripten_bind_ASS_Track_set_Language_1 = Module._emscripten_bind_ASS_Track_set_Language_1 = Module.asm.Gb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_default_style_0 = Module._emscripten_bind_ASS_Track_get_default_style_0 = function () {
  return (_emscripten_bind_ASS_Track_get_default_style_0 = Module._emscripten_bind_ASS_Track_get_default_style_0 = Module.asm.Hb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_default_style_1 = Module._emscripten_bind_ASS_Track_set_default_style_1 = function () {
  return (_emscripten_bind_ASS_Track_set_default_style_1 = Module._emscripten_bind_ASS_Track_set_default_style_1 = Module.asm.Ib).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_get_name_0 = Module._emscripten_bind_ASS_Track_get_name_0 = function () {
  return (_emscripten_bind_ASS_Track_get_name_0 = Module._emscripten_bind_ASS_Track_get_name_0 = Module.asm.Jb).apply(null, arguments)
}
var _emscripten_bind_ASS_Track_set_name_1 = Module._emscripten_bind_ASS_Track_set_name_1 = function () {
  return (_emscripten_bind_ASS_Track_set_name_1 = Module._emscripten_bind_ASS_Track_set_name_1 = Module.asm.Kb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Name_0 = Module._emscripten_bind_ASS_Style_get_Name_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Name_0 = Module._emscripten_bind_ASS_Style_get_Name_0 = Module.asm.Lb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Name_1 = Module._emscripten_bind_ASS_Style_set_Name_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Name_1 = Module._emscripten_bind_ASS_Style_set_Name_1 = Module.asm.Mb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_FontName_0 = Module._emscripten_bind_ASS_Style_get_FontName_0 = function () {
  return (_emscripten_bind_ASS_Style_get_FontName_0 = Module._emscripten_bind_ASS_Style_get_FontName_0 = Module.asm.Nb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_FontName_1 = Module._emscripten_bind_ASS_Style_set_FontName_1 = function () {
  return (_emscripten_bind_ASS_Style_set_FontName_1 = Module._emscripten_bind_ASS_Style_set_FontName_1 = Module.asm.Ob).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_FontSize_0 = Module._emscripten_bind_ASS_Style_get_FontSize_0 = function () {
  return (_emscripten_bind_ASS_Style_get_FontSize_0 = Module._emscripten_bind_ASS_Style_get_FontSize_0 = Module.asm.Pb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_FontSize_1 = Module._emscripten_bind_ASS_Style_set_FontSize_1 = function () {
  return (_emscripten_bind_ASS_Style_set_FontSize_1 = Module._emscripten_bind_ASS_Style_set_FontSize_1 = Module.asm.Qb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_PrimaryColour_0 = Module._emscripten_bind_ASS_Style_get_PrimaryColour_0 = function () {
  return (_emscripten_bind_ASS_Style_get_PrimaryColour_0 = Module._emscripten_bind_ASS_Style_get_PrimaryColour_0 = Module.asm.Rb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_PrimaryColour_1 = Module._emscripten_bind_ASS_Style_set_PrimaryColour_1 = function () {
  return (_emscripten_bind_ASS_Style_set_PrimaryColour_1 = Module._emscripten_bind_ASS_Style_set_PrimaryColour_1 = Module.asm.Sb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_SecondaryColour_0 = Module._emscripten_bind_ASS_Style_get_SecondaryColour_0 = function () {
  return (_emscripten_bind_ASS_Style_get_SecondaryColour_0 = Module._emscripten_bind_ASS_Style_get_SecondaryColour_0 = Module.asm.Tb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_SecondaryColour_1 = Module._emscripten_bind_ASS_Style_set_SecondaryColour_1 = function () {
  return (_emscripten_bind_ASS_Style_set_SecondaryColour_1 = Module._emscripten_bind_ASS_Style_set_SecondaryColour_1 = Module.asm.Ub).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_OutlineColour_0 = Module._emscripten_bind_ASS_Style_get_OutlineColour_0 = function () {
  return (_emscripten_bind_ASS_Style_get_OutlineColour_0 = Module._emscripten_bind_ASS_Style_get_OutlineColour_0 = Module.asm.Vb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_OutlineColour_1 = Module._emscripten_bind_ASS_Style_set_OutlineColour_1 = function () {
  return (_emscripten_bind_ASS_Style_set_OutlineColour_1 = Module._emscripten_bind_ASS_Style_set_OutlineColour_1 = Module.asm.Wb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_BackColour_0 = Module._emscripten_bind_ASS_Style_get_BackColour_0 = function () {
  return (_emscripten_bind_ASS_Style_get_BackColour_0 = Module._emscripten_bind_ASS_Style_get_BackColour_0 = Module.asm.Xb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_BackColour_1 = Module._emscripten_bind_ASS_Style_set_BackColour_1 = function () {
  return (_emscripten_bind_ASS_Style_set_BackColour_1 = Module._emscripten_bind_ASS_Style_set_BackColour_1 = Module.asm.Yb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Bold_0 = Module._emscripten_bind_ASS_Style_get_Bold_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Bold_0 = Module._emscripten_bind_ASS_Style_get_Bold_0 = Module.asm.Zb).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Bold_1 = Module._emscripten_bind_ASS_Style_set_Bold_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Bold_1 = Module._emscripten_bind_ASS_Style_set_Bold_1 = Module.asm._b).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Italic_0 = Module._emscripten_bind_ASS_Style_get_Italic_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Italic_0 = Module._emscripten_bind_ASS_Style_get_Italic_0 = Module.asm.$b).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Italic_1 = Module._emscripten_bind_ASS_Style_set_Italic_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Italic_1 = Module._emscripten_bind_ASS_Style_set_Italic_1 = Module.asm.ac).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Underline_0 = Module._emscripten_bind_ASS_Style_get_Underline_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Underline_0 = Module._emscripten_bind_ASS_Style_get_Underline_0 = Module.asm.bc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Underline_1 = Module._emscripten_bind_ASS_Style_set_Underline_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Underline_1 = Module._emscripten_bind_ASS_Style_set_Underline_1 = Module.asm.cc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_StrikeOut_0 = Module._emscripten_bind_ASS_Style_get_StrikeOut_0 = function () {
  return (_emscripten_bind_ASS_Style_get_StrikeOut_0 = Module._emscripten_bind_ASS_Style_get_StrikeOut_0 = Module.asm.dc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_StrikeOut_1 = Module._emscripten_bind_ASS_Style_set_StrikeOut_1 = function () {
  return (_emscripten_bind_ASS_Style_set_StrikeOut_1 = Module._emscripten_bind_ASS_Style_set_StrikeOut_1 = Module.asm.ec).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_ScaleX_0 = Module._emscripten_bind_ASS_Style_get_ScaleX_0 = function () {
  return (_emscripten_bind_ASS_Style_get_ScaleX_0 = Module._emscripten_bind_ASS_Style_get_ScaleX_0 = Module.asm.fc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_ScaleX_1 = Module._emscripten_bind_ASS_Style_set_ScaleX_1 = function () {
  return (_emscripten_bind_ASS_Style_set_ScaleX_1 = Module._emscripten_bind_ASS_Style_set_ScaleX_1 = Module.asm.gc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_ScaleY_0 = Module._emscripten_bind_ASS_Style_get_ScaleY_0 = function () {
  return (_emscripten_bind_ASS_Style_get_ScaleY_0 = Module._emscripten_bind_ASS_Style_get_ScaleY_0 = Module.asm.hc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_ScaleY_1 = Module._emscripten_bind_ASS_Style_set_ScaleY_1 = function () {
  return (_emscripten_bind_ASS_Style_set_ScaleY_1 = Module._emscripten_bind_ASS_Style_set_ScaleY_1 = Module.asm.ic).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Spacing_0 = Module._emscripten_bind_ASS_Style_get_Spacing_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Spacing_0 = Module._emscripten_bind_ASS_Style_get_Spacing_0 = Module.asm.jc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Spacing_1 = Module._emscripten_bind_ASS_Style_set_Spacing_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Spacing_1 = Module._emscripten_bind_ASS_Style_set_Spacing_1 = Module.asm.kc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Angle_0 = Module._emscripten_bind_ASS_Style_get_Angle_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Angle_0 = Module._emscripten_bind_ASS_Style_get_Angle_0 = Module.asm.lc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Angle_1 = Module._emscripten_bind_ASS_Style_set_Angle_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Angle_1 = Module._emscripten_bind_ASS_Style_set_Angle_1 = Module.asm.mc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_BorderStyle_0 = Module._emscripten_bind_ASS_Style_get_BorderStyle_0 = function () {
  return (_emscripten_bind_ASS_Style_get_BorderStyle_0 = Module._emscripten_bind_ASS_Style_get_BorderStyle_0 = Module.asm.nc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_BorderStyle_1 = Module._emscripten_bind_ASS_Style_set_BorderStyle_1 = function () {
  return (_emscripten_bind_ASS_Style_set_BorderStyle_1 = Module._emscripten_bind_ASS_Style_set_BorderStyle_1 = Module.asm.oc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Outline_0 = Module._emscripten_bind_ASS_Style_get_Outline_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Outline_0 = Module._emscripten_bind_ASS_Style_get_Outline_0 = Module.asm.pc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Outline_1 = Module._emscripten_bind_ASS_Style_set_Outline_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Outline_1 = Module._emscripten_bind_ASS_Style_set_Outline_1 = Module.asm.qc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Shadow_0 = Module._emscripten_bind_ASS_Style_get_Shadow_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Shadow_0 = Module._emscripten_bind_ASS_Style_get_Shadow_0 = Module.asm.rc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Shadow_1 = Module._emscripten_bind_ASS_Style_set_Shadow_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Shadow_1 = Module._emscripten_bind_ASS_Style_set_Shadow_1 = Module.asm.sc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Alignment_0 = Module._emscripten_bind_ASS_Style_get_Alignment_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Alignment_0 = Module._emscripten_bind_ASS_Style_get_Alignment_0 = Module.asm.tc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Alignment_1 = Module._emscripten_bind_ASS_Style_set_Alignment_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Alignment_1 = Module._emscripten_bind_ASS_Style_set_Alignment_1 = Module.asm.uc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_MarginL_0 = Module._emscripten_bind_ASS_Style_get_MarginL_0 = function () {
  return (_emscripten_bind_ASS_Style_get_MarginL_0 = Module._emscripten_bind_ASS_Style_get_MarginL_0 = Module.asm.vc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_MarginL_1 = Module._emscripten_bind_ASS_Style_set_MarginL_1 = function () {
  return (_emscripten_bind_ASS_Style_set_MarginL_1 = Module._emscripten_bind_ASS_Style_set_MarginL_1 = Module.asm.wc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_MarginR_0 = Module._emscripten_bind_ASS_Style_get_MarginR_0 = function () {
  return (_emscripten_bind_ASS_Style_get_MarginR_0 = Module._emscripten_bind_ASS_Style_get_MarginR_0 = Module.asm.xc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_MarginR_1 = Module._emscripten_bind_ASS_Style_set_MarginR_1 = function () {
  return (_emscripten_bind_ASS_Style_set_MarginR_1 = Module._emscripten_bind_ASS_Style_set_MarginR_1 = Module.asm.yc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_MarginV_0 = Module._emscripten_bind_ASS_Style_get_MarginV_0 = function () {
  return (_emscripten_bind_ASS_Style_get_MarginV_0 = Module._emscripten_bind_ASS_Style_get_MarginV_0 = Module.asm.zc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_MarginV_1 = Module._emscripten_bind_ASS_Style_set_MarginV_1 = function () {
  return (_emscripten_bind_ASS_Style_set_MarginV_1 = Module._emscripten_bind_ASS_Style_set_MarginV_1 = Module.asm.Ac).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Encoding_0 = Module._emscripten_bind_ASS_Style_get_Encoding_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Encoding_0 = Module._emscripten_bind_ASS_Style_get_Encoding_0 = Module.asm.Bc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Encoding_1 = Module._emscripten_bind_ASS_Style_set_Encoding_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Encoding_1 = Module._emscripten_bind_ASS_Style_set_Encoding_1 = Module.asm.Cc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0 = Module._emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0 = function () {
  return (_emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0 = Module._emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0 = Module.asm.Dc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1 = Module._emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1 = function () {
  return (_emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1 = Module._emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1 = Module.asm.Ec).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Blur_0 = Module._emscripten_bind_ASS_Style_get_Blur_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Blur_0 = Module._emscripten_bind_ASS_Style_get_Blur_0 = Module.asm.Fc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Blur_1 = Module._emscripten_bind_ASS_Style_set_Blur_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Blur_1 = Module._emscripten_bind_ASS_Style_set_Blur_1 = Module.asm.Gc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_get_Justify_0 = Module._emscripten_bind_ASS_Style_get_Justify_0 = function () {
  return (_emscripten_bind_ASS_Style_get_Justify_0 = Module._emscripten_bind_ASS_Style_get_Justify_0 = Module.asm.Hc).apply(null, arguments)
}
var _emscripten_bind_ASS_Style_set_Justify_1 = Module._emscripten_bind_ASS_Style_set_Justify_1 = function () {
  return (_emscripten_bind_ASS_Style_set_Justify_1 = Module._emscripten_bind_ASS_Style_set_Justify_1 = Module.asm.Ic).apply(null, arguments)
}
var _emscripten_bind_EventStopTimesResult_get_eventFinish_0 = Module._emscripten_bind_EventStopTimesResult_get_eventFinish_0 = function () {
  return (_emscripten_bind_EventStopTimesResult_get_eventFinish_0 = Module._emscripten_bind_EventStopTimesResult_get_eventFinish_0 = Module.asm.Jc).apply(null, arguments)
}
var _emscripten_bind_EventStopTimesResult_set_eventFinish_1 = Module._emscripten_bind_EventStopTimesResult_set_eventFinish_1 = function () {
  return (_emscripten_bind_EventStopTimesResult_set_eventFinish_1 = Module._emscripten_bind_EventStopTimesResult_set_eventFinish_1 = Module.asm.Kc).apply(null, arguments)
}
var _emscripten_bind_EventStopTimesResult_get_emptyFinish_0 = Module._emscripten_bind_EventStopTimesResult_get_emptyFinish_0 = function () {
  return (_emscripten_bind_EventStopTimesResult_get_emptyFinish_0 = Module._emscripten_bind_EventStopTimesResult_get_emptyFinish_0 = Module.asm.Lc).apply(null, arguments)
}
var _emscripten_bind_EventStopTimesResult_set_emptyFinish_1 = Module._emscripten_bind_EventStopTimesResult_set_emptyFinish_1 = function () {
  return (_emscripten_bind_EventStopTimesResult_set_emptyFinish_1 = Module._emscripten_bind_EventStopTimesResult_set_emptyFinish_1 = Module.asm.Mc).apply(null, arguments)
}
var _emscripten_bind_EventStopTimesResult_get_is_animated_0 = Module._emscripten_bind_EventStopTimesResult_get_is_animated_0 = function () {
  return (_emscripten_bind_EventStopTimesResult_get_is_animated_0 = Module._emscripten_bind_EventStopTimesResult_get_is_animated_0 = Module.asm.Nc).apply(null, arguments)
}
var _emscripten_bind_EventStopTimesResult_set_is_animated_1 = Module._emscripten_bind_EventStopTimesResult_set_is_animated_1 = function () {
  return (_emscripten_bind_EventStopTimesResult_set_is_animated_1 = Module._emscripten_bind_EventStopTimesResult_set_is_animated_1 = Module.asm.Oc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_w_0 = Module._emscripten_bind_ASS_Image_get_w_0 = function () {
  return (_emscripten_bind_ASS_Image_get_w_0 = Module._emscripten_bind_ASS_Image_get_w_0 = Module.asm.Pc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_w_1 = Module._emscripten_bind_ASS_Image_set_w_1 = function () {
  return (_emscripten_bind_ASS_Image_set_w_1 = Module._emscripten_bind_ASS_Image_set_w_1 = Module.asm.Qc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_h_0 = Module._emscripten_bind_ASS_Image_get_h_0 = function () {
  return (_emscripten_bind_ASS_Image_get_h_0 = Module._emscripten_bind_ASS_Image_get_h_0 = Module.asm.Rc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_h_1 = Module._emscripten_bind_ASS_Image_set_h_1 = function () {
  return (_emscripten_bind_ASS_Image_set_h_1 = Module._emscripten_bind_ASS_Image_set_h_1 = Module.asm.Sc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_stride_0 = Module._emscripten_bind_ASS_Image_get_stride_0 = function () {
  return (_emscripten_bind_ASS_Image_get_stride_0 = Module._emscripten_bind_ASS_Image_get_stride_0 = Module.asm.Tc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_stride_1 = Module._emscripten_bind_ASS_Image_set_stride_1 = function () {
  return (_emscripten_bind_ASS_Image_set_stride_1 = Module._emscripten_bind_ASS_Image_set_stride_1 = Module.asm.Uc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_bitmap_0 = Module._emscripten_bind_ASS_Image_get_bitmap_0 = function () {
  return (_emscripten_bind_ASS_Image_get_bitmap_0 = Module._emscripten_bind_ASS_Image_get_bitmap_0 = Module.asm.Vc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_bitmap_1 = Module._emscripten_bind_ASS_Image_set_bitmap_1 = function () {
  return (_emscripten_bind_ASS_Image_set_bitmap_1 = Module._emscripten_bind_ASS_Image_set_bitmap_1 = Module.asm.Wc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_color_0 = Module._emscripten_bind_ASS_Image_get_color_0 = function () {
  return (_emscripten_bind_ASS_Image_get_color_0 = Module._emscripten_bind_ASS_Image_get_color_0 = Module.asm.Xc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_color_1 = Module._emscripten_bind_ASS_Image_set_color_1 = function () {
  return (_emscripten_bind_ASS_Image_set_color_1 = Module._emscripten_bind_ASS_Image_set_color_1 = Module.asm.Yc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_dst_x_0 = Module._emscripten_bind_ASS_Image_get_dst_x_0 = function () {
  return (_emscripten_bind_ASS_Image_get_dst_x_0 = Module._emscripten_bind_ASS_Image_get_dst_x_0 = Module.asm.Zc).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_dst_x_1 = Module._emscripten_bind_ASS_Image_set_dst_x_1 = function () {
  return (_emscripten_bind_ASS_Image_set_dst_x_1 = Module._emscripten_bind_ASS_Image_set_dst_x_1 = Module.asm._c).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_dst_y_0 = Module._emscripten_bind_ASS_Image_get_dst_y_0 = function () {
  return (_emscripten_bind_ASS_Image_get_dst_y_0 = Module._emscripten_bind_ASS_Image_get_dst_y_0 = Module.asm.$c).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_dst_y_1 = Module._emscripten_bind_ASS_Image_set_dst_y_1 = function () {
  return (_emscripten_bind_ASS_Image_set_dst_y_1 = Module._emscripten_bind_ASS_Image_set_dst_y_1 = Module.asm.ad).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_get_next_0 = Module._emscripten_bind_ASS_Image_get_next_0 = function () {
  return (_emscripten_bind_ASS_Image_get_next_0 = Module._emscripten_bind_ASS_Image_get_next_0 = Module.asm.bd).apply(null, arguments)
}
var _emscripten_bind_ASS_Image_set_next_1 = Module._emscripten_bind_ASS_Image_set_next_1 = function () {
  return (_emscripten_bind_ASS_Image_set_next_1 = Module._emscripten_bind_ASS_Image_set_next_1 = Module.asm.cd).apply(null, arguments)
}
var _emscripten_bind_VoidPtr___destroy___0 = Module._emscripten_bind_VoidPtr___destroy___0 = function () {
  return (_emscripten_bind_VoidPtr___destroy___0 = Module._emscripten_bind_VoidPtr___destroy___0 = Module.asm.dd).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_get_dest_x_0 = Module._emscripten_bind_RenderBlendPart_get_dest_x_0 = function () {
  return (_emscripten_bind_RenderBlendPart_get_dest_x_0 = Module._emscripten_bind_RenderBlendPart_get_dest_x_0 = Module.asm.ed).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_set_dest_x_1 = Module._emscripten_bind_RenderBlendPart_set_dest_x_1 = function () {
  return (_emscripten_bind_RenderBlendPart_set_dest_x_1 = Module._emscripten_bind_RenderBlendPart_set_dest_x_1 = Module.asm.fd).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_get_dest_y_0 = Module._emscripten_bind_RenderBlendPart_get_dest_y_0 = function () {
  return (_emscripten_bind_RenderBlendPart_get_dest_y_0 = Module._emscripten_bind_RenderBlendPart_get_dest_y_0 = Module.asm.gd).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_set_dest_y_1 = Module._emscripten_bind_RenderBlendPart_set_dest_y_1 = function () {
  return (_emscripten_bind_RenderBlendPart_set_dest_y_1 = Module._emscripten_bind_RenderBlendPart_set_dest_y_1 = Module.asm.hd).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_get_dest_width_0 = Module._emscripten_bind_RenderBlendPart_get_dest_width_0 = function () {
  return (_emscripten_bind_RenderBlendPart_get_dest_width_0 = Module._emscripten_bind_RenderBlendPart_get_dest_width_0 = Module.asm.id).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_set_dest_width_1 = Module._emscripten_bind_RenderBlendPart_set_dest_width_1 = function () {
  return (_emscripten_bind_RenderBlendPart_set_dest_width_1 = Module._emscripten_bind_RenderBlendPart_set_dest_width_1 = Module.asm.jd).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_get_dest_height_0 = Module._emscripten_bind_RenderBlendPart_get_dest_height_0 = function () {
  return (_emscripten_bind_RenderBlendPart_get_dest_height_0 = Module._emscripten_bind_RenderBlendPart_get_dest_height_0 = Module.asm.kd).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_set_dest_height_1 = Module._emscripten_bind_RenderBlendPart_set_dest_height_1 = function () {
  return (_emscripten_bind_RenderBlendPart_set_dest_height_1 = Module._emscripten_bind_RenderBlendPart_set_dest_height_1 = Module.asm.ld).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_get_image_0 = Module._emscripten_bind_RenderBlendPart_get_image_0 = function () {
  return (_emscripten_bind_RenderBlendPart_get_image_0 = Module._emscripten_bind_RenderBlendPart_get_image_0 = Module.asm.md).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_set_image_1 = Module._emscripten_bind_RenderBlendPart_set_image_1 = function () {
  return (_emscripten_bind_RenderBlendPart_set_image_1 = Module._emscripten_bind_RenderBlendPart_set_image_1 = Module.asm.nd).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_get_next_0 = Module._emscripten_bind_RenderBlendPart_get_next_0 = function () {
  return (_emscripten_bind_RenderBlendPart_get_next_0 = Module._emscripten_bind_RenderBlendPart_get_next_0 = Module.asm.od).apply(null, arguments)
}
var _emscripten_bind_RenderBlendPart_set_next_1 = Module._emscripten_bind_RenderBlendPart_set_next_1 = function () {
  return (_emscripten_bind_RenderBlendPart_set_next_1 = Module._emscripten_bind_RenderBlendPart_set_next_1 = Module.asm.pd).apply(null, arguments)
}
var _emscripten_bind_libass_libass_0 = Module._emscripten_bind_libass_libass_0 = function () {
  return (_emscripten_bind_libass_libass_0 = Module._emscripten_bind_libass_libass_0 = Module.asm.qd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_library_version_0 = Module._emscripten_bind_libass_oct_library_version_0 = function () {
  return (_emscripten_bind_libass_oct_library_version_0 = Module._emscripten_bind_libass_oct_library_version_0 = Module.asm.rd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_library_init_0 = Module._emscripten_bind_libass_oct_library_init_0 = function () {
  return (_emscripten_bind_libass_oct_library_init_0 = Module._emscripten_bind_libass_oct_library_init_0 = Module.asm.sd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_library_done_1 = Module._emscripten_bind_libass_oct_library_done_1 = function () {
  return (_emscripten_bind_libass_oct_library_done_1 = Module._emscripten_bind_libass_oct_library_done_1 = Module.asm.td).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_fonts_dir_2 = Module._emscripten_bind_libass_oct_set_fonts_dir_2 = function () {
  return (_emscripten_bind_libass_oct_set_fonts_dir_2 = Module._emscripten_bind_libass_oct_set_fonts_dir_2 = Module.asm.ud).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_extract_fonts_2 = Module._emscripten_bind_libass_oct_set_extract_fonts_2 = function () {
  return (_emscripten_bind_libass_oct_set_extract_fonts_2 = Module._emscripten_bind_libass_oct_set_extract_fonts_2 = Module.asm.vd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_style_overrides_2 = Module._emscripten_bind_libass_oct_set_style_overrides_2 = function () {
  return (_emscripten_bind_libass_oct_set_style_overrides_2 = Module._emscripten_bind_libass_oct_set_style_overrides_2 = Module.asm.wd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_process_force_style_1 = Module._emscripten_bind_libass_oct_process_force_style_1 = function () {
  return (_emscripten_bind_libass_oct_process_force_style_1 = Module._emscripten_bind_libass_oct_process_force_style_1 = Module.asm.xd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_renderer_init_1 = Module._emscripten_bind_libass_oct_renderer_init_1 = function () {
  return (_emscripten_bind_libass_oct_renderer_init_1 = Module._emscripten_bind_libass_oct_renderer_init_1 = Module.asm.yd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_renderer_done_1 = Module._emscripten_bind_libass_oct_renderer_done_1 = function () {
  return (_emscripten_bind_libass_oct_renderer_done_1 = Module._emscripten_bind_libass_oct_renderer_done_1 = Module.asm.zd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_frame_size_3 = Module._emscripten_bind_libass_oct_set_frame_size_3 = function () {
  return (_emscripten_bind_libass_oct_set_frame_size_3 = Module._emscripten_bind_libass_oct_set_frame_size_3 = Module.asm.Ad).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_storage_size_3 = Module._emscripten_bind_libass_oct_set_storage_size_3 = function () {
  return (_emscripten_bind_libass_oct_set_storage_size_3 = Module._emscripten_bind_libass_oct_set_storage_size_3 = Module.asm.Bd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_shaper_2 = Module._emscripten_bind_libass_oct_set_shaper_2 = function () {
  return (_emscripten_bind_libass_oct_set_shaper_2 = Module._emscripten_bind_libass_oct_set_shaper_2 = Module.asm.Cd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_margins_5 = Module._emscripten_bind_libass_oct_set_margins_5 = function () {
  return (_emscripten_bind_libass_oct_set_margins_5 = Module._emscripten_bind_libass_oct_set_margins_5 = Module.asm.Dd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_use_margins_2 = Module._emscripten_bind_libass_oct_set_use_margins_2 = function () {
  return (_emscripten_bind_libass_oct_set_use_margins_2 = Module._emscripten_bind_libass_oct_set_use_margins_2 = Module.asm.Ed).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_pixel_aspect_2 = Module._emscripten_bind_libass_oct_set_pixel_aspect_2 = function () {
  return (_emscripten_bind_libass_oct_set_pixel_aspect_2 = Module._emscripten_bind_libass_oct_set_pixel_aspect_2 = Module.asm.Fd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_aspect_ratio_3 = Module._emscripten_bind_libass_oct_set_aspect_ratio_3 = function () {
  return (_emscripten_bind_libass_oct_set_aspect_ratio_3 = Module._emscripten_bind_libass_oct_set_aspect_ratio_3 = Module.asm.Gd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_font_scale_2 = Module._emscripten_bind_libass_oct_set_font_scale_2 = function () {
  return (_emscripten_bind_libass_oct_set_font_scale_2 = Module._emscripten_bind_libass_oct_set_font_scale_2 = Module.asm.Hd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_hinting_2 = Module._emscripten_bind_libass_oct_set_hinting_2 = function () {
  return (_emscripten_bind_libass_oct_set_hinting_2 = Module._emscripten_bind_libass_oct_set_hinting_2 = Module.asm.Id).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_line_spacing_2 = Module._emscripten_bind_libass_oct_set_line_spacing_2 = function () {
  return (_emscripten_bind_libass_oct_set_line_spacing_2 = Module._emscripten_bind_libass_oct_set_line_spacing_2 = Module.asm.Jd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_line_position_2 = Module._emscripten_bind_libass_oct_set_line_position_2 = function () {
  return (_emscripten_bind_libass_oct_set_line_position_2 = Module._emscripten_bind_libass_oct_set_line_position_2 = Module.asm.Kd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_fonts_6 = Module._emscripten_bind_libass_oct_set_fonts_6 = function () {
  return (_emscripten_bind_libass_oct_set_fonts_6 = Module._emscripten_bind_libass_oct_set_fonts_6 = Module.asm.Ld).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_selective_style_override_enabled_2 = Module._emscripten_bind_libass_oct_set_selective_style_override_enabled_2 = function () {
  return (_emscripten_bind_libass_oct_set_selective_style_override_enabled_2 = Module._emscripten_bind_libass_oct_set_selective_style_override_enabled_2 = Module.asm.Md).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_selective_style_override_2 = Module._emscripten_bind_libass_oct_set_selective_style_override_2 = function () {
  return (_emscripten_bind_libass_oct_set_selective_style_override_2 = Module._emscripten_bind_libass_oct_set_selective_style_override_2 = Module.asm.Nd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_set_cache_limits_3 = Module._emscripten_bind_libass_oct_set_cache_limits_3 = function () {
  return (_emscripten_bind_libass_oct_set_cache_limits_3 = Module._emscripten_bind_libass_oct_set_cache_limits_3 = Module.asm.Od).apply(null, arguments)
}
var _emscripten_bind_libass_oct_render_frame_4 = Module._emscripten_bind_libass_oct_render_frame_4 = function () {
  return (_emscripten_bind_libass_oct_render_frame_4 = Module._emscripten_bind_libass_oct_render_frame_4 = Module.asm.Pd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_new_track_1 = Module._emscripten_bind_libass_oct_new_track_1 = function () {
  return (_emscripten_bind_libass_oct_new_track_1 = Module._emscripten_bind_libass_oct_new_track_1 = Module.asm.Qd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_free_track_1 = Module._emscripten_bind_libass_oct_free_track_1 = function () {
  return (_emscripten_bind_libass_oct_free_track_1 = Module._emscripten_bind_libass_oct_free_track_1 = Module.asm.Rd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_alloc_style_1 = Module._emscripten_bind_libass_oct_alloc_style_1 = function () {
  return (_emscripten_bind_libass_oct_alloc_style_1 = Module._emscripten_bind_libass_oct_alloc_style_1 = Module.asm.Sd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_alloc_event_1 = Module._emscripten_bind_libass_oct_alloc_event_1 = function () {
  return (_emscripten_bind_libass_oct_alloc_event_1 = Module._emscripten_bind_libass_oct_alloc_event_1 = Module.asm.Td).apply(null, arguments)
}
var _emscripten_bind_libass_oct_free_style_2 = Module._emscripten_bind_libass_oct_free_style_2 = function () {
  return (_emscripten_bind_libass_oct_free_style_2 = Module._emscripten_bind_libass_oct_free_style_2 = Module.asm.Ud).apply(null, arguments)
}
var _emscripten_bind_libass_oct_free_event_2 = Module._emscripten_bind_libass_oct_free_event_2 = function () {
  return (_emscripten_bind_libass_oct_free_event_2 = Module._emscripten_bind_libass_oct_free_event_2 = Module.asm.Vd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_flush_events_1 = Module._emscripten_bind_libass_oct_flush_events_1 = function () {
  return (_emscripten_bind_libass_oct_flush_events_1 = Module._emscripten_bind_libass_oct_flush_events_1 = Module.asm.Wd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_read_file_3 = Module._emscripten_bind_libass_oct_read_file_3 = function () {
  return (_emscripten_bind_libass_oct_read_file_3 = Module._emscripten_bind_libass_oct_read_file_3 = Module.asm.Xd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_add_font_4 = Module._emscripten_bind_libass_oct_add_font_4 = function () {
  return (_emscripten_bind_libass_oct_add_font_4 = Module._emscripten_bind_libass_oct_add_font_4 = Module.asm.Yd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_clear_fonts_1 = Module._emscripten_bind_libass_oct_clear_fonts_1 = function () {
  return (_emscripten_bind_libass_oct_clear_fonts_1 = Module._emscripten_bind_libass_oct_clear_fonts_1 = Module.asm.Zd).apply(null, arguments)
}
var _emscripten_bind_libass_oct_step_sub_3 = Module._emscripten_bind_libass_oct_step_sub_3 = function () {
  return (_emscripten_bind_libass_oct_step_sub_3 = Module._emscripten_bind_libass_oct_step_sub_3 = Module.asm._d).apply(null, arguments)
}
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NONE = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_NONE = function () {
  return (_emscripten_enum_ASS_Hinting_ASS_HINTING_NONE = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_NONE = Module.asm.$d).apply(null, arguments)
}
var _emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT = function () {
  return (_emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT = Module.asm.ae).apply(null, arguments)
}
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL = function () {
  return (_emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL = Module.asm.be).apply(null, arguments)
}
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE = function () {
  return (_emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE = Module._emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE = Module.asm.ce).apply(null, arguments)
}
var _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE = Module._emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE = function () {
  return (_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE = Module._emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE = Module.asm.de).apply(null, arguments)
}
var _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX = Module._emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX = function () {
  return (_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX = Module._emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX = Module.asm.ee).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT = Module.asm.fe).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE = Module.asm.ge).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = Module.asm.he).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE = Module.asm.ie).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = Module.asm.je).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME = Module.asm.ke).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS = Module.asm.le).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES = Module.asm.me).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER = Module.asm.ne).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT = Module.asm.oe).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS = Module.asm.pe).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE = Module.asm.qe).apply(null, arguments)
}
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY = Module._emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY = Module.asm.re).apply(null, arguments)
}
var ___errno_location = Module.___errno_location = function () {
  return (___errno_location = Module.___errno_location = Module.asm.se).apply(null, arguments)
}
var _setThrew = Module._setThrew = function () {
  return (_setThrew = Module._setThrew = Module.asm.te).apply(null, arguments)
}
var stackSave = Module.stackSave = function () {
  return (stackSave = Module.stackSave = Module.asm.ue).apply(null, arguments)
}
var stackRestore = Module.stackRestore = function () {
  return (stackRestore = Module.stackRestore = Module.asm.ve).apply(null, arguments)
}
var stackAlloc = Module.stackAlloc = function () {
  return (stackAlloc = Module.stackAlloc = Module.asm.we).apply(null, arguments)
}

function invoke_iii (index, a1, a2) {
  var sp = stackSave()
  try {
    return wasmTable.get(index)(a1, a2)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}

function invoke_iiiii (index, a1, a2, a3, a4) {
  var sp = stackSave()
  try {
    return wasmTable.get(index)(a1, a2, a3, a4)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}

function invoke_iiii (index, a1, a2, a3) {
  var sp = stackSave()
  try {
    return wasmTable.get(index)(a1, a2, a3)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}

function invoke_vii (index, a1, a2) {
  var sp = stackSave()
  try {
    wasmTable.get(index)(a1, a2)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
Module.ccall = ccall
Module.cwrap = cwrap
Module.getValue = getValue
Module.getMemory = getMemory
Module.addRunDependency = addRunDependency
Module.removeRunDependency = removeRunDependency
Module.FS_createFolder = FS.createFolder
Module.FS_createPath = FS.createPath
Module.FS_createDataFile = FS.createDataFile
Module.FS_createPreloadedFile = FS.createPreloadedFile
Module.FS_createLazyFile = FS.createLazyFile
Module.FS_createLink = FS.createLink
Module.FS_createDevice = FS.createDevice
Module.FS_unlink = FS.unlink
var calledRun

function ExitStatus (status) {
  this.name = 'ExitStatus'
  this.message = 'Program terminated with exit(' + status + ')'
  this.status = status
}
var calledMain = false
dependenciesFulfilled = function runCaller () {
  if (!calledRun) run()
  if (!calledRun) dependenciesFulfilled = runCaller
}

function callMain (args) {
  var entryFunction = Module._main
  args = args || []
  var argc = args.length + 1
  var argv = stackAlloc((argc + 1) * 4)
  HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram)
  for (var i = 1; i < argc; i++) {
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1])
  }
  HEAP32[(argv >> 2) + argc] = 0
  try {
    var ret = entryFunction(argc, argv)
    exit(ret, true)
  } catch (e) {
    if (e instanceof ExitStatus) {
      return
    } else if (e == 'unwind') {
      noExitRuntime = true
      return
    } else {
      var toLog = e
      if (e && typeof e === 'object' && e.stack) {
        toLog = [e, e.stack]
      }
      err('exception thrown: ' + toLog)
      quit_(1, e)
    }
  } finally {
    calledMain = true
  }
}

function run (args) {
  args = args || arguments_
  if (runDependencies > 0) {
    return
  }
  preRun()
  if (runDependencies > 0) return

  function doRun () {
    if (calledRun) return
    calledRun = true
    Module.calledRun = true
    if (ABORT) return
    initRuntime()
    preMain()
    if (Module.onRuntimeInitialized) Module.onRuntimeInitialized()
    if (shouldRunNow) callMain(args)
    postRun()
  }
  if (Module.setStatus) {
    Module.setStatus('Running...')
    setTimeout(function () {
      setTimeout(function () {
        Module.setStatus('')
      }, 1)
      doRun()
    }, 1)
  } else {
    doRun()
  }
}
Module.run = run

function exit (status, implicit) {
  if (implicit && noExitRuntime && status === 0) {
    return
  }
  if (noExitRuntime) {} else {
    ABORT = true
    EXITSTATUS = status
    exitRuntime()
    if (Module.onExit) Module.onExit(status)
  }
  quit_(status, new ExitStatus(status))
}
if (Module.preInit) {
  if (typeof Module.preInit === 'function') Module.preInit = [Module.preInit]
  while (Module.preInit.length > 0) {
    Module.preInit.pop()()
  }
}
var shouldRunNow = true
if (Module.noInitialRun) shouldRunNow = false
noExitRuntime = true
run()

function WrapperObject () {}
WrapperObject.prototype = Object.create(WrapperObject.prototype)
WrapperObject.prototype.constructor = WrapperObject
WrapperObject.prototype.__class__ = WrapperObject
WrapperObject.__cache__ = {}
Module.WrapperObject = WrapperObject

function getCache (__class__) {
  return (__class__ || WrapperObject).__cache__
}
Module.getCache = getCache

function wrapPointer (ptr, __class__) {
  var cache = getCache(__class__)
  var ret = cache[ptr]
  if (ret) return ret
  ret = Object.create((__class__ || WrapperObject).prototype)
  ret.ptr = ptr
  return cache[ptr] = ret
}
Module.wrapPointer = wrapPointer

function castObject (obj, __class__) {
  return wrapPointer(obj.ptr, __class__)
}
Module.castObject = castObject
Module.NULL = wrapPointer(0)

function destroy (obj) {
  if (!obj.__destroy__) throw 'Error: Cannot destroy object. (Did you create it yourself?)'
  obj.__destroy__()
  delete getCache(obj.__class__)[obj.ptr]
}
Module.destroy = destroy

function compare (obj1, obj2) {
  return obj1.ptr === obj2.ptr
}
Module.compare = compare

function getPointer (obj) {
  return obj.ptr
}
Module.getPointer = getPointer

function getClass (obj) {
  return obj.__class__
}
Module.getClass = getClass
var ensureCache = {
  buffer: 0,
  size: 0,
  pos: 0,
  temps: [],
  needed: 0,
  prepare: function () {
    if (ensureCache.needed) {
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module._free(ensureCache.temps[i])
      }
      ensureCache.temps.length = 0
      Module._free(ensureCache.buffer)
      ensureCache.buffer = 0
      ensureCache.size += ensureCache.needed
      ensureCache.needed = 0
    }
    if (!ensureCache.buffer) {
      ensureCache.size += 128
      ensureCache.buffer = Module._malloc(ensureCache.size)
      assert(ensureCache.buffer)
    }
    ensureCache.pos = 0
  },
  alloc: function (array, view) {
    assert(ensureCache.buffer)
    var bytes = view.BYTES_PER_ELEMENT
    var len = array.length * bytes
    len = len + 7 & -8
    var ret
    if (ensureCache.pos + len >= ensureCache.size) {
      assert(len > 0)
      ensureCache.needed += len
      ret = Module._malloc(len)
      ensureCache.temps.push(ret)
    } else {
      ret = ensureCache.buffer + ensureCache.pos
      ensureCache.pos += len
    }
    return ret
  },
  copy: function (array, view, offset) {
    var offsetShifted = offset
    var bytes = view.BYTES_PER_ELEMENT
    switch (bytes) {
      case 2:
        offsetShifted >>= 1
        break
      case 4:
        offsetShifted >>= 2
        break
      case 8:
        offsetShifted >>= 3
        break
    }
    for (var i = 0; i < array.length; i++) {
      view[offsetShifted + i] = array[i]
    }
  }
}

function ensureString (value) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value)
    var offset = ensureCache.alloc(intArray, HEAP8)
    ensureCache.copy(intArray, HEAP8, offset)
    return offset
  }
  return value
}

function ASS_ParserPriv () {
  throw 'cannot construct a ASS_ParserPriv, no constructor in IDL'
}
ASS_ParserPriv.prototype = Object.create(WrapperObject.prototype)
ASS_ParserPriv.prototype.constructor = ASS_ParserPriv
ASS_ParserPriv.prototype.__class__ = ASS_ParserPriv
ASS_ParserPriv.__cache__ = {}
Module.ASS_ParserPriv = ASS_ParserPriv

function ASS_Event () {
  throw 'cannot construct a ASS_Event, no constructor in IDL'
}
ASS_Event.prototype = Object.create(WrapperObject.prototype)
ASS_Event.prototype.constructor = ASS_Event
ASS_Event.prototype.__class__ = ASS_Event
ASS_Event.__cache__ = {}
Module.ASS_Event = ASS_Event
ASS_Event.prototype.get_Start = ASS_Event.prototype.get_Start = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_Start_0(self)
}
ASS_Event.prototype.set_Start = ASS_Event.prototype.set_Start = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_Start_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'Start', {
  get: ASS_Event.prototype.get_Start,
  set: ASS_Event.prototype.set_Start
})
ASS_Event.prototype.get_Duration = ASS_Event.prototype.get_Duration = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_Duration_0(self)
}
ASS_Event.prototype.set_Duration = ASS_Event.prototype.set_Duration = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_Duration_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'Duration', {
  get: ASS_Event.prototype.get_Duration,
  set: ASS_Event.prototype.set_Duration
})
ASS_Event.prototype.get_ReadOrder = ASS_Event.prototype.get_ReadOrder = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_ReadOrder_0(self)
}
ASS_Event.prototype.set_ReadOrder = ASS_Event.prototype.set_ReadOrder = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_ReadOrder_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'ReadOrder', {
  get: ASS_Event.prototype.get_ReadOrder,
  set: ASS_Event.prototype.set_ReadOrder
})
ASS_Event.prototype.get_Layer = ASS_Event.prototype.get_Layer = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_Layer_0(self)
}
ASS_Event.prototype.set_Layer = ASS_Event.prototype.set_Layer = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_Layer_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'Layer', {
  get: ASS_Event.prototype.get_Layer,
  set: ASS_Event.prototype.set_Layer
})
ASS_Event.prototype.get_Style = ASS_Event.prototype.get_Style = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_Style_0(self)
}
ASS_Event.prototype.set_Style = ASS_Event.prototype.set_Style = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_Style_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'Style', {
  get: ASS_Event.prototype.get_Style,
  set: ASS_Event.prototype.set_Style
})
ASS_Event.prototype.get_Name = ASS_Event.prototype.get_Name = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Name_0(self))
}
ASS_Event.prototype.set_Name = ASS_Event.prototype.set_Name = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Event_set_Name_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'Name', {
  get: ASS_Event.prototype.get_Name,
  set: ASS_Event.prototype.set_Name
})
ASS_Event.prototype.get_MarginL = ASS_Event.prototype.get_MarginL = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_MarginL_0(self)
}
ASS_Event.prototype.set_MarginL = ASS_Event.prototype.set_MarginL = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_MarginL_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'MarginL', {
  get: ASS_Event.prototype.get_MarginL,
  set: ASS_Event.prototype.set_MarginL
})
ASS_Event.prototype.get_MarginR = ASS_Event.prototype.get_MarginR = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_MarginR_0(self)
}
ASS_Event.prototype.set_MarginR = ASS_Event.prototype.set_MarginR = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_MarginR_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'MarginR', {
  get: ASS_Event.prototype.get_MarginR,
  set: ASS_Event.prototype.set_MarginR
})
ASS_Event.prototype.get_MarginV = ASS_Event.prototype.get_MarginV = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Event_get_MarginV_0(self)
}
ASS_Event.prototype.set_MarginV = ASS_Event.prototype.set_MarginV = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Event_set_MarginV_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'MarginV', {
  get: ASS_Event.prototype.get_MarginV,
  set: ASS_Event.prototype.set_MarginV
})
ASS_Event.prototype.get_Effect = ASS_Event.prototype.get_Effect = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Effect_0(self))
}
ASS_Event.prototype.set_Effect = ASS_Event.prototype.set_Effect = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Event_set_Effect_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'Effect', {
  get: ASS_Event.prototype.get_Effect,
  set: ASS_Event.prototype.set_Effect
})
ASS_Event.prototype.get_Text = ASS_Event.prototype.get_Text = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Text_0(self))
}
ASS_Event.prototype.set_Text = ASS_Event.prototype.set_Text = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Event_set_Text_1(self, arg0)
}
Object.defineProperty(ASS_Event.prototype, 'Text', {
  get: ASS_Event.prototype.get_Text,
  set: ASS_Event.prototype.set_Text
})

function ASS_Renderer () {
  throw 'cannot construct a ASS_Renderer, no constructor in IDL'
}
ASS_Renderer.prototype = Object.create(WrapperObject.prototype)
ASS_Renderer.prototype.constructor = ASS_Renderer
ASS_Renderer.prototype.__class__ = ASS_Renderer
ASS_Renderer.__cache__ = {}
Module.ASS_Renderer = ASS_Renderer

function RenderBlendResult () {
  throw 'cannot construct a RenderBlendResult, no constructor in IDL'
}
RenderBlendResult.prototype = Object.create(WrapperObject.prototype)
RenderBlendResult.prototype.constructor = RenderBlendResult
RenderBlendResult.prototype.__class__ = RenderBlendResult
RenderBlendResult.__cache__ = {}
Module.RenderBlendResult = RenderBlendResult
RenderBlendResult.prototype.get_changed = RenderBlendResult.prototype.get_changed = function () {
  var self = this.ptr
  return _emscripten_bind_RenderBlendResult_get_changed_0(self)
}
RenderBlendResult.prototype.set_changed = RenderBlendResult.prototype.set_changed = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendResult_set_changed_1(self, arg0)
}
Object.defineProperty(RenderBlendResult.prototype, 'changed', {
  get: RenderBlendResult.prototype.get_changed,
  set: RenderBlendResult.prototype.set_changed
})
RenderBlendResult.prototype.get_blend_time = RenderBlendResult.prototype.get_blend_time = function () {
  var self = this.ptr
  return _emscripten_bind_RenderBlendResult_get_blend_time_0(self)
}
RenderBlendResult.prototype.set_blend_time = RenderBlendResult.prototype.set_blend_time = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendResult_set_blend_time_1(self, arg0)
}
Object.defineProperty(RenderBlendResult.prototype, 'blend_time', {
  get: RenderBlendResult.prototype.get_blend_time,
  set: RenderBlendResult.prototype.set_blend_time
})
RenderBlendResult.prototype.get_part = RenderBlendResult.prototype.get_part = function () {
  var self = this.ptr
  return wrapPointer(_emscripten_bind_RenderBlendResult_get_part_0(self), RenderBlendPart)
}
RenderBlendResult.prototype.set_part = RenderBlendResult.prototype.set_part = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendResult_set_part_1(self, arg0)
}
Object.defineProperty(RenderBlendResult.prototype, 'part', {
  get: RenderBlendResult.prototype.get_part,
  set: RenderBlendResult.prototype.set_part
})

function SubtitleOctopus () {
  this.ptr = _emscripten_bind_SubtitleOctopus_SubtitleOctopus_0()
  getCache(SubtitleOctopus)[this.ptr] = this
}
SubtitleOctopus.prototype = Object.create(WrapperObject.prototype)
SubtitleOctopus.prototype.constructor = SubtitleOctopus
SubtitleOctopus.prototype.__class__ = SubtitleOctopus
SubtitleOctopus.__cache__ = {}
Module.SubtitleOctopus = SubtitleOctopus
SubtitleOctopus.prototype.setLogLevel = SubtitleOctopus.prototype.setLogLevel = function (level) {
  var self = this.ptr
  if (level && typeof level === 'object') level = level.ptr
  _emscripten_bind_SubtitleOctopus_setLogLevel_1(self, level)
}
SubtitleOctopus.prototype.setDropAnimations = SubtitleOctopus.prototype.setDropAnimations = function (value) {
  var self = this.ptr
  if (value && typeof value === 'object') value = value.ptr
  _emscripten_bind_SubtitleOctopus_setDropAnimations_1(self, value)
}
SubtitleOctopus.prototype.getDropAnimations = SubtitleOctopus.prototype.getDropAnimations = function () {
  var self = this.ptr
  return _emscripten_bind_SubtitleOctopus_getDropAnimations_0(self)
}
SubtitleOctopus.prototype.initLibrary = SubtitleOctopus.prototype.initLibrary = function (frame_w, frame_h, default_font) {
  var self = this.ptr
  ensureCache.prepare()
  if (frame_w && typeof frame_w === 'object') frame_w = frame_w.ptr
  if (frame_h && typeof frame_h === 'object') frame_h = frame_h.ptr
  if (default_font && typeof default_font === 'object') default_font = default_font.ptr
  else default_font = ensureString(default_font)
  _emscripten_bind_SubtitleOctopus_initLibrary_3(self, frame_w, frame_h, default_font)
}
SubtitleOctopus.prototype.createTrack = SubtitleOctopus.prototype.createTrack = function (subfile) {
  var self = this.ptr
  ensureCache.prepare()
  if (subfile && typeof subfile === 'object') subfile = subfile.ptr
  else subfile = ensureString(subfile)
  _emscripten_bind_SubtitleOctopus_createTrack_1(self, subfile)
}
SubtitleOctopus.prototype.createTrackMem = SubtitleOctopus.prototype.createTrackMem = function (buf, bufsize) {
  var self = this.ptr
  ensureCache.prepare()
  if (buf && typeof buf === 'object') buf = buf.ptr
  else buf = ensureString(buf)
  if (bufsize && typeof bufsize === 'object') bufsize = bufsize.ptr
  _emscripten_bind_SubtitleOctopus_createTrackMem_2(self, buf, bufsize)
}
SubtitleOctopus.prototype.removeTrack = SubtitleOctopus.prototype.removeTrack = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus_removeTrack_0(self)
}
SubtitleOctopus.prototype.resizeCanvas = SubtitleOctopus.prototype.resizeCanvas = function (frame_w, frame_h) {
  var self = this.ptr
  if (frame_w && typeof frame_w === 'object') frame_w = frame_w.ptr
  if (frame_h && typeof frame_h === 'object') frame_h = frame_h.ptr
  _emscripten_bind_SubtitleOctopus_resizeCanvas_2(self, frame_w, frame_h)
}
SubtitleOctopus.prototype.renderImage = SubtitleOctopus.prototype.renderImage = function (time, changed) {
  var self = this.ptr
  if (time && typeof time === 'object') time = time.ptr
  if (changed && typeof changed === 'object') changed = changed.ptr
  return wrapPointer(_emscripten_bind_SubtitleOctopus_renderImage_2(self, time, changed), ASS_Image)
}
SubtitleOctopus.prototype.quitLibrary = SubtitleOctopus.prototype.quitLibrary = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus_quitLibrary_0(self)
}
SubtitleOctopus.prototype.reloadLibrary = SubtitleOctopus.prototype.reloadLibrary = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus_reloadLibrary_0(self)
}
SubtitleOctopus.prototype.reloadFonts = SubtitleOctopus.prototype.reloadFonts = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus_reloadFonts_0(self)
}
SubtitleOctopus.prototype.setMargin = SubtitleOctopus.prototype.setMargin = function (top, bottom, left, right) {
  var self = this.ptr
  if (top && typeof top === 'object') top = top.ptr
  if (bottom && typeof bottom === 'object') bottom = bottom.ptr
  if (left && typeof left === 'object') left = left.ptr
  if (right && typeof right === 'object') right = right.ptr
  _emscripten_bind_SubtitleOctopus_setMargin_4(self, top, bottom, left, right)
}
SubtitleOctopus.prototype.getEventCount = SubtitleOctopus.prototype.getEventCount = function () {
  var self = this.ptr
  return _emscripten_bind_SubtitleOctopus_getEventCount_0(self)
}
SubtitleOctopus.prototype.allocEvent = SubtitleOctopus.prototype.allocEvent = function () {
  var self = this.ptr
  return _emscripten_bind_SubtitleOctopus_allocEvent_0(self)
}
SubtitleOctopus.prototype.allocStyle = SubtitleOctopus.prototype.allocStyle = function () {
  var self = this.ptr
  return _emscripten_bind_SubtitleOctopus_allocStyle_0(self)
}
SubtitleOctopus.prototype.removeEvent = SubtitleOctopus.prototype.removeEvent = function (eid) {
  var self = this.ptr
  if (eid && typeof eid === 'object') eid = eid.ptr
  _emscripten_bind_SubtitleOctopus_removeEvent_1(self, eid)
}
SubtitleOctopus.prototype.getStyleCount = SubtitleOctopus.prototype.getStyleCount = function () {
  var self = this.ptr
  return _emscripten_bind_SubtitleOctopus_getStyleCount_0(self)
}
SubtitleOctopus.prototype.getStyleByName = SubtitleOctopus.prototype.getStyleByName = function (name) {
  var self = this.ptr
  ensureCache.prepare()
  if (name && typeof name === 'object') name = name.ptr
  else name = ensureString(name)
  return _emscripten_bind_SubtitleOctopus_getStyleByName_1(self, name)
}
SubtitleOctopus.prototype.removeStyle = SubtitleOctopus.prototype.removeStyle = function (eid) {
  var self = this.ptr
  if (eid && typeof eid === 'object') eid = eid.ptr
  _emscripten_bind_SubtitleOctopus_removeStyle_1(self, eid)
}
SubtitleOctopus.prototype.removeAllEvents = SubtitleOctopus.prototype.removeAllEvents = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus_removeAllEvents_0(self)
}
SubtitleOctopus.prototype.setMemoryLimits = SubtitleOctopus.prototype.setMemoryLimits = function (glyph_limit, bitmap_cache_limit) {
  var self = this.ptr
  if (glyph_limit && typeof glyph_limit === 'object') glyph_limit = glyph_limit.ptr
  if (bitmap_cache_limit && typeof bitmap_cache_limit === 'object') bitmap_cache_limit = bitmap_cache_limit.ptr
  _emscripten_bind_SubtitleOctopus_setMemoryLimits_2(self, glyph_limit, bitmap_cache_limit)
}
SubtitleOctopus.prototype.renderBlend = SubtitleOctopus.prototype.renderBlend = function (tm, force) {
  var self = this.ptr
  if (tm && typeof tm === 'object') tm = tm.ptr
  if (force && typeof force === 'object') force = force.ptr
  return wrapPointer(_emscripten_bind_SubtitleOctopus_renderBlend_2(self, tm, force), RenderBlendResult)
}
SubtitleOctopus.prototype.findNextEventStart = SubtitleOctopus.prototype.findNextEventStart = function (tm) {
  var self = this.ptr
  if (tm && typeof tm === 'object') tm = tm.ptr
  return _emscripten_bind_SubtitleOctopus_findNextEventStart_1(self, tm)
}
SubtitleOctopus.prototype.findEventStopTimes = SubtitleOctopus.prototype.findEventStopTimes = function (tm) {
  var self = this.ptr
  if (tm && typeof tm === 'object') tm = tm.ptr
  return wrapPointer(_emscripten_bind_SubtitleOctopus_findEventStopTimes_1(self, tm), EventStopTimesResult)
}
SubtitleOctopus.prototype.setTrackFeatures = SubtitleOctopus.prototype.setTrackFeatures = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus_setTrackFeatures_0(self)
}
SubtitleOctopus.prototype.rescanAllAnimations = SubtitleOctopus.prototype.rescanAllAnimations = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus_rescanAllAnimations_0(self)
}
SubtitleOctopus.prototype.get_track = SubtitleOctopus.prototype.get_track = function () {
  var self = this.ptr
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_track_0(self), ASS_Track)
}
SubtitleOctopus.prototype.set_track = SubtitleOctopus.prototype.set_track = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_SubtitleOctopus_set_track_1(self, arg0)
}
Object.defineProperty(SubtitleOctopus.prototype, 'track', {
  get: SubtitleOctopus.prototype.get_track,
  set: SubtitleOctopus.prototype.set_track
})
SubtitleOctopus.prototype.get_ass_renderer = SubtitleOctopus.prototype.get_ass_renderer = function () {
  var self = this.ptr
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_ass_renderer_0(self), ASS_Renderer)
}
SubtitleOctopus.prototype.set_ass_renderer = SubtitleOctopus.prototype.set_ass_renderer = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_SubtitleOctopus_set_ass_renderer_1(self, arg0)
}
Object.defineProperty(SubtitleOctopus.prototype, 'ass_renderer', {
  get: SubtitleOctopus.prototype.get_ass_renderer,
  set: SubtitleOctopus.prototype.set_ass_renderer
})
SubtitleOctopus.prototype.get_ass_library = SubtitleOctopus.prototype.get_ass_library = function () {
  var self = this.ptr
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_ass_library_0(self), ASS_Library)
}
SubtitleOctopus.prototype.set_ass_library = SubtitleOctopus.prototype.set_ass_library = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_SubtitleOctopus_set_ass_library_1(self, arg0)
}
Object.defineProperty(SubtitleOctopus.prototype, 'ass_library', {
  get: SubtitleOctopus.prototype.get_ass_library,
  set: SubtitleOctopus.prototype.set_ass_library
})
SubtitleOctopus.prototype.__destroy__ = SubtitleOctopus.prototype.__destroy__ = function () {
  var self = this.ptr
  _emscripten_bind_SubtitleOctopus___destroy___0(self)
}

function ASS_Track () {
  throw 'cannot construct a ASS_Track, no constructor in IDL'
}
ASS_Track.prototype = Object.create(WrapperObject.prototype)
ASS_Track.prototype.constructor = ASS_Track
ASS_Track.prototype.__class__ = ASS_Track
ASS_Track.__cache__ = {}
Module.ASS_Track = ASS_Track
ASS_Track.prototype.get_n_styles = ASS_Track.prototype.get_n_styles = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_n_styles_0(self)
}
ASS_Track.prototype.set_n_styles = ASS_Track.prototype.set_n_styles = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_n_styles_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'n_styles', {
  get: ASS_Track.prototype.get_n_styles,
  set: ASS_Track.prototype.set_n_styles
})
ASS_Track.prototype.get_max_styles = ASS_Track.prototype.get_max_styles = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_max_styles_0(self)
}
ASS_Track.prototype.set_max_styles = ASS_Track.prototype.set_max_styles = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_max_styles_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'max_styles', {
  get: ASS_Track.prototype.get_max_styles,
  set: ASS_Track.prototype.set_max_styles
})
ASS_Track.prototype.get_n_events = ASS_Track.prototype.get_n_events = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_n_events_0(self)
}
ASS_Track.prototype.set_n_events = ASS_Track.prototype.set_n_events = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_n_events_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'n_events', {
  get: ASS_Track.prototype.get_n_events,
  set: ASS_Track.prototype.set_n_events
})
ASS_Track.prototype.get_max_events = ASS_Track.prototype.get_max_events = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_max_events_0(self)
}
ASS_Track.prototype.set_max_events = ASS_Track.prototype.set_max_events = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_max_events_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'max_events', {
  get: ASS_Track.prototype.get_max_events,
  set: ASS_Track.prototype.set_max_events
})
ASS_Track.prototype.get_styles = ASS_Track.prototype.get_styles = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  return wrapPointer(_emscripten_bind_ASS_Track_get_styles_1(self, arg0), ASS_Style)
}
ASS_Track.prototype.set_styles = ASS_Track.prototype.set_styles = function (arg0, arg1) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr
  _emscripten_bind_ASS_Track_set_styles_2(self, arg0, arg1)
}
Object.defineProperty(ASS_Track.prototype, 'styles', {
  get: ASS_Track.prototype.get_styles,
  set: ASS_Track.prototype.set_styles
})
ASS_Track.prototype.get_events = ASS_Track.prototype.get_events = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  return wrapPointer(_emscripten_bind_ASS_Track_get_events_1(self, arg0), ASS_Event)
}
ASS_Track.prototype.set_events = ASS_Track.prototype.set_events = function (arg0, arg1) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr
  _emscripten_bind_ASS_Track_set_events_2(self, arg0, arg1)
}
Object.defineProperty(ASS_Track.prototype, 'events', {
  get: ASS_Track.prototype.get_events,
  set: ASS_Track.prototype.set_events
})
ASS_Track.prototype.get_style_format = ASS_Track.prototype.get_style_format = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Track_get_style_format_0(self))
}
ASS_Track.prototype.set_style_format = ASS_Track.prototype.set_style_format = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Track_set_style_format_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'style_format', {
  get: ASS_Track.prototype.get_style_format,
  set: ASS_Track.prototype.set_style_format
})
ASS_Track.prototype.get_event_format = ASS_Track.prototype.get_event_format = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Track_get_event_format_0(self))
}
ASS_Track.prototype.set_event_format = ASS_Track.prototype.set_event_format = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Track_set_event_format_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'event_format', {
  get: ASS_Track.prototype.get_event_format,
  set: ASS_Track.prototype.set_event_format
})
ASS_Track.prototype.get_PlayResX = ASS_Track.prototype.get_PlayResX = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_PlayResX_0(self)
}
ASS_Track.prototype.set_PlayResX = ASS_Track.prototype.set_PlayResX = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_PlayResX_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'PlayResX', {
  get: ASS_Track.prototype.get_PlayResX,
  set: ASS_Track.prototype.set_PlayResX
})
ASS_Track.prototype.get_PlayResY = ASS_Track.prototype.get_PlayResY = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_PlayResY_0(self)
}
ASS_Track.prototype.set_PlayResY = ASS_Track.prototype.set_PlayResY = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_PlayResY_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'PlayResY', {
  get: ASS_Track.prototype.get_PlayResY,
  set: ASS_Track.prototype.set_PlayResY
})
ASS_Track.prototype.get_Timer = ASS_Track.prototype.get_Timer = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_Timer_0(self)
}
ASS_Track.prototype.set_Timer = ASS_Track.prototype.set_Timer = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_Timer_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'Timer', {
  get: ASS_Track.prototype.get_Timer,
  set: ASS_Track.prototype.set_Timer
})
ASS_Track.prototype.get_WrapStyle = ASS_Track.prototype.get_WrapStyle = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_WrapStyle_0(self)
}
ASS_Track.prototype.set_WrapStyle = ASS_Track.prototype.set_WrapStyle = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_WrapStyle_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'WrapStyle', {
  get: ASS_Track.prototype.get_WrapStyle,
  set: ASS_Track.prototype.set_WrapStyle
})
ASS_Track.prototype.get_ScaledBorderAndShadow = ASS_Track.prototype.get_ScaledBorderAndShadow = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0(self)
}
ASS_Track.prototype.set_ScaledBorderAndShadow = ASS_Track.prototype.set_ScaledBorderAndShadow = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'ScaledBorderAndShadow', {
  get: ASS_Track.prototype.get_ScaledBorderAndShadow,
  set: ASS_Track.prototype.set_ScaledBorderAndShadow
})
ASS_Track.prototype.get_Kerning = ASS_Track.prototype.get_Kerning = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_Kerning_0(self)
}
ASS_Track.prototype.set_Kerning = ASS_Track.prototype.set_Kerning = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_Kerning_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'Kerning', {
  get: ASS_Track.prototype.get_Kerning,
  set: ASS_Track.prototype.set_Kerning
})
ASS_Track.prototype.get_Language = ASS_Track.prototype.get_Language = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Track_get_Language_0(self))
}
ASS_Track.prototype.set_Language = ASS_Track.prototype.set_Language = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Track_set_Language_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'Language', {
  get: ASS_Track.prototype.get_Language,
  set: ASS_Track.prototype.set_Language
})
ASS_Track.prototype.get_default_style = ASS_Track.prototype.get_default_style = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Track_get_default_style_0(self)
}
ASS_Track.prototype.set_default_style = ASS_Track.prototype.set_default_style = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Track_set_default_style_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'default_style', {
  get: ASS_Track.prototype.get_default_style,
  set: ASS_Track.prototype.set_default_style
})
ASS_Track.prototype.get_name = ASS_Track.prototype.get_name = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Track_get_name_0(self))
}
ASS_Track.prototype.set_name = ASS_Track.prototype.set_name = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Track_set_name_1(self, arg0)
}
Object.defineProperty(ASS_Track.prototype, 'name', {
  get: ASS_Track.prototype.get_name,
  set: ASS_Track.prototype.set_name
})

function ASS_RenderPriv () {
  throw 'cannot construct a ASS_RenderPriv, no constructor in IDL'
}
ASS_RenderPriv.prototype = Object.create(WrapperObject.prototype)
ASS_RenderPriv.prototype.constructor = ASS_RenderPriv
ASS_RenderPriv.prototype.__class__ = ASS_RenderPriv
ASS_RenderPriv.__cache__ = {}
Module.ASS_RenderPriv = ASS_RenderPriv

function ASS_Style () {
  throw 'cannot construct a ASS_Style, no constructor in IDL'
}
ASS_Style.prototype = Object.create(WrapperObject.prototype)
ASS_Style.prototype.constructor = ASS_Style
ASS_Style.prototype.__class__ = ASS_Style
ASS_Style.__cache__ = {}
Module.ASS_Style = ASS_Style
ASS_Style.prototype.get_Name = ASS_Style.prototype.get_Name = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Style_get_Name_0(self))
}
ASS_Style.prototype.set_Name = ASS_Style.prototype.set_Name = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Style_set_Name_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Name', {
  get: ASS_Style.prototype.get_Name,
  set: ASS_Style.prototype.set_Name
})
ASS_Style.prototype.get_FontName = ASS_Style.prototype.get_FontName = function () {
  var self = this.ptr
  return UTF8ToString(_emscripten_bind_ASS_Style_get_FontName_0(self))
}
ASS_Style.prototype.set_FontName = ASS_Style.prototype.set_FontName = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Style_set_FontName_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'FontName', {
  get: ASS_Style.prototype.get_FontName,
  set: ASS_Style.prototype.set_FontName
})
ASS_Style.prototype.get_FontSize = ASS_Style.prototype.get_FontSize = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_FontSize_0(self)
}
ASS_Style.prototype.set_FontSize = ASS_Style.prototype.set_FontSize = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_FontSize_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'FontSize', {
  get: ASS_Style.prototype.get_FontSize,
  set: ASS_Style.prototype.set_FontSize
})
ASS_Style.prototype.get_PrimaryColour = ASS_Style.prototype.get_PrimaryColour = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_PrimaryColour_0(self)
}
ASS_Style.prototype.set_PrimaryColour = ASS_Style.prototype.set_PrimaryColour = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_PrimaryColour_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'PrimaryColour', {
  get: ASS_Style.prototype.get_PrimaryColour,
  set: ASS_Style.prototype.set_PrimaryColour
})
ASS_Style.prototype.get_SecondaryColour = ASS_Style.prototype.get_SecondaryColour = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_SecondaryColour_0(self)
}
ASS_Style.prototype.set_SecondaryColour = ASS_Style.prototype.set_SecondaryColour = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_SecondaryColour_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'SecondaryColour', {
  get: ASS_Style.prototype.get_SecondaryColour,
  set: ASS_Style.prototype.set_SecondaryColour
})
ASS_Style.prototype.get_OutlineColour = ASS_Style.prototype.get_OutlineColour = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_OutlineColour_0(self)
}
ASS_Style.prototype.set_OutlineColour = ASS_Style.prototype.set_OutlineColour = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_OutlineColour_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'OutlineColour', {
  get: ASS_Style.prototype.get_OutlineColour,
  set: ASS_Style.prototype.set_OutlineColour
})
ASS_Style.prototype.get_BackColour = ASS_Style.prototype.get_BackColour = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_BackColour_0(self)
}
ASS_Style.prototype.set_BackColour = ASS_Style.prototype.set_BackColour = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_BackColour_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'BackColour', {
  get: ASS_Style.prototype.get_BackColour,
  set: ASS_Style.prototype.set_BackColour
})
ASS_Style.prototype.get_Bold = ASS_Style.prototype.get_Bold = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Bold_0(self)
}
ASS_Style.prototype.set_Bold = ASS_Style.prototype.set_Bold = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Bold_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Bold', {
  get: ASS_Style.prototype.get_Bold,
  set: ASS_Style.prototype.set_Bold
})
ASS_Style.prototype.get_Italic = ASS_Style.prototype.get_Italic = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Italic_0(self)
}
ASS_Style.prototype.set_Italic = ASS_Style.prototype.set_Italic = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Italic_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Italic', {
  get: ASS_Style.prototype.get_Italic,
  set: ASS_Style.prototype.set_Italic
})
ASS_Style.prototype.get_Underline = ASS_Style.prototype.get_Underline = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Underline_0(self)
}
ASS_Style.prototype.set_Underline = ASS_Style.prototype.set_Underline = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Underline_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Underline', {
  get: ASS_Style.prototype.get_Underline,
  set: ASS_Style.prototype.set_Underline
})
ASS_Style.prototype.get_StrikeOut = ASS_Style.prototype.get_StrikeOut = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_StrikeOut_0(self)
}
ASS_Style.prototype.set_StrikeOut = ASS_Style.prototype.set_StrikeOut = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_StrikeOut_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'StrikeOut', {
  get: ASS_Style.prototype.get_StrikeOut,
  set: ASS_Style.prototype.set_StrikeOut
})
ASS_Style.prototype.get_ScaleX = ASS_Style.prototype.get_ScaleX = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_ScaleX_0(self)
}
ASS_Style.prototype.set_ScaleX = ASS_Style.prototype.set_ScaleX = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_ScaleX_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'ScaleX', {
  get: ASS_Style.prototype.get_ScaleX,
  set: ASS_Style.prototype.set_ScaleX
})
ASS_Style.prototype.get_ScaleY = ASS_Style.prototype.get_ScaleY = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_ScaleY_0(self)
}
ASS_Style.prototype.set_ScaleY = ASS_Style.prototype.set_ScaleY = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_ScaleY_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'ScaleY', {
  get: ASS_Style.prototype.get_ScaleY,
  set: ASS_Style.prototype.set_ScaleY
})
ASS_Style.prototype.get_Spacing = ASS_Style.prototype.get_Spacing = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Spacing_0(self)
}
ASS_Style.prototype.set_Spacing = ASS_Style.prototype.set_Spacing = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Spacing_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Spacing', {
  get: ASS_Style.prototype.get_Spacing,
  set: ASS_Style.prototype.set_Spacing
})
ASS_Style.prototype.get_Angle = ASS_Style.prototype.get_Angle = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Angle_0(self)
}
ASS_Style.prototype.set_Angle = ASS_Style.prototype.set_Angle = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Angle_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Angle', {
  get: ASS_Style.prototype.get_Angle,
  set: ASS_Style.prototype.set_Angle
})
ASS_Style.prototype.get_BorderStyle = ASS_Style.prototype.get_BorderStyle = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_BorderStyle_0(self)
}
ASS_Style.prototype.set_BorderStyle = ASS_Style.prototype.set_BorderStyle = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_BorderStyle_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'BorderStyle', {
  get: ASS_Style.prototype.get_BorderStyle,
  set: ASS_Style.prototype.set_BorderStyle
})
ASS_Style.prototype.get_Outline = ASS_Style.prototype.get_Outline = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Outline_0(self)
}
ASS_Style.prototype.set_Outline = ASS_Style.prototype.set_Outline = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Outline_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Outline', {
  get: ASS_Style.prototype.get_Outline,
  set: ASS_Style.prototype.set_Outline
})
ASS_Style.prototype.get_Shadow = ASS_Style.prototype.get_Shadow = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Shadow_0(self)
}
ASS_Style.prototype.set_Shadow = ASS_Style.prototype.set_Shadow = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Shadow_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Shadow', {
  get: ASS_Style.prototype.get_Shadow,
  set: ASS_Style.prototype.set_Shadow
})
ASS_Style.prototype.get_Alignment = ASS_Style.prototype.get_Alignment = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Alignment_0(self)
}
ASS_Style.prototype.set_Alignment = ASS_Style.prototype.set_Alignment = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Alignment_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Alignment', {
  get: ASS_Style.prototype.get_Alignment,
  set: ASS_Style.prototype.set_Alignment
})
ASS_Style.prototype.get_MarginL = ASS_Style.prototype.get_MarginL = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_MarginL_0(self)
}
ASS_Style.prototype.set_MarginL = ASS_Style.prototype.set_MarginL = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_MarginL_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'MarginL', {
  get: ASS_Style.prototype.get_MarginL,
  set: ASS_Style.prototype.set_MarginL
})
ASS_Style.prototype.get_MarginR = ASS_Style.prototype.get_MarginR = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_MarginR_0(self)
}
ASS_Style.prototype.set_MarginR = ASS_Style.prototype.set_MarginR = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_MarginR_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'MarginR', {
  get: ASS_Style.prototype.get_MarginR,
  set: ASS_Style.prototype.set_MarginR
})
ASS_Style.prototype.get_MarginV = ASS_Style.prototype.get_MarginV = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_MarginV_0(self)
}
ASS_Style.prototype.set_MarginV = ASS_Style.prototype.set_MarginV = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_MarginV_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'MarginV', {
  get: ASS_Style.prototype.get_MarginV,
  set: ASS_Style.prototype.set_MarginV
})
ASS_Style.prototype.get_Encoding = ASS_Style.prototype.get_Encoding = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Encoding_0(self)
}
ASS_Style.prototype.set_Encoding = ASS_Style.prototype.set_Encoding = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Encoding_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Encoding', {
  get: ASS_Style.prototype.get_Encoding,
  set: ASS_Style.prototype.set_Encoding
})
ASS_Style.prototype.get_treat_fontname_as_pattern = ASS_Style.prototype.get_treat_fontname_as_pattern = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0(self)
}
ASS_Style.prototype.set_treat_fontname_as_pattern = ASS_Style.prototype.set_treat_fontname_as_pattern = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'treat_fontname_as_pattern', {
  get: ASS_Style.prototype.get_treat_fontname_as_pattern,
  set: ASS_Style.prototype.set_treat_fontname_as_pattern
})
ASS_Style.prototype.get_Blur = ASS_Style.prototype.get_Blur = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Blur_0(self)
}
ASS_Style.prototype.set_Blur = ASS_Style.prototype.set_Blur = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Blur_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Blur', {
  get: ASS_Style.prototype.get_Blur,
  set: ASS_Style.prototype.set_Blur
})
ASS_Style.prototype.get_Justify = ASS_Style.prototype.get_Justify = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Style_get_Justify_0(self)
}
ASS_Style.prototype.set_Justify = ASS_Style.prototype.set_Justify = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Style_set_Justify_1(self, arg0)
}
Object.defineProperty(ASS_Style.prototype, 'Justify', {
  get: ASS_Style.prototype.get_Justify,
  set: ASS_Style.prototype.set_Justify
})

function EventStopTimesResult () {
  throw 'cannot construct a EventStopTimesResult, no constructor in IDL'
}
EventStopTimesResult.prototype = Object.create(WrapperObject.prototype)
EventStopTimesResult.prototype.constructor = EventStopTimesResult
EventStopTimesResult.prototype.__class__ = EventStopTimesResult
EventStopTimesResult.__cache__ = {}
Module.EventStopTimesResult = EventStopTimesResult
EventStopTimesResult.prototype.get_eventFinish = EventStopTimesResult.prototype.get_eventFinish = function () {
  var self = this.ptr
  return _emscripten_bind_EventStopTimesResult_get_eventFinish_0(self)
}
EventStopTimesResult.prototype.set_eventFinish = EventStopTimesResult.prototype.set_eventFinish = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_EventStopTimesResult_set_eventFinish_1(self, arg0)
}
Object.defineProperty(EventStopTimesResult.prototype, 'eventFinish', {
  get: EventStopTimesResult.prototype.get_eventFinish,
  set: EventStopTimesResult.prototype.set_eventFinish
})
EventStopTimesResult.prototype.get_emptyFinish = EventStopTimesResult.prototype.get_emptyFinish = function () {
  var self = this.ptr
  return _emscripten_bind_EventStopTimesResult_get_emptyFinish_0(self)
}
EventStopTimesResult.prototype.set_emptyFinish = EventStopTimesResult.prototype.set_emptyFinish = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_EventStopTimesResult_set_emptyFinish_1(self, arg0)
}
Object.defineProperty(EventStopTimesResult.prototype, 'emptyFinish', {
  get: EventStopTimesResult.prototype.get_emptyFinish,
  set: EventStopTimesResult.prototype.set_emptyFinish
})
EventStopTimesResult.prototype.get_is_animated = EventStopTimesResult.prototype.get_is_animated = function () {
  var self = this.ptr
  return _emscripten_bind_EventStopTimesResult_get_is_animated_0(self)
}
EventStopTimesResult.prototype.set_is_animated = EventStopTimesResult.prototype.set_is_animated = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_EventStopTimesResult_set_is_animated_1(self, arg0)
}
Object.defineProperty(EventStopTimesResult.prototype, 'is_animated', {
  get: EventStopTimesResult.prototype.get_is_animated,
  set: EventStopTimesResult.prototype.set_is_animated
})

function ASS_Image () {
  throw 'cannot construct a ASS_Image, no constructor in IDL'
}
ASS_Image.prototype = Object.create(WrapperObject.prototype)
ASS_Image.prototype.constructor = ASS_Image
ASS_Image.prototype.__class__ = ASS_Image
ASS_Image.__cache__ = {}
Module.ASS_Image = ASS_Image
ASS_Image.prototype.get_w = ASS_Image.prototype.get_w = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Image_get_w_0(self)
}
ASS_Image.prototype.set_w = ASS_Image.prototype.set_w = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Image_set_w_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'w', {
  get: ASS_Image.prototype.get_w,
  set: ASS_Image.prototype.set_w
})
ASS_Image.prototype.get_h = ASS_Image.prototype.get_h = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Image_get_h_0(self)
}
ASS_Image.prototype.set_h = ASS_Image.prototype.set_h = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Image_set_h_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'h', {
  get: ASS_Image.prototype.get_h,
  set: ASS_Image.prototype.set_h
})
ASS_Image.prototype.get_stride = ASS_Image.prototype.get_stride = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Image_get_stride_0(self)
}
ASS_Image.prototype.set_stride = ASS_Image.prototype.set_stride = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Image_set_stride_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'stride', {
  get: ASS_Image.prototype.get_stride,
  set: ASS_Image.prototype.set_stride
})
ASS_Image.prototype.get_bitmap = ASS_Image.prototype.get_bitmap = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Image_get_bitmap_0(self)
}
ASS_Image.prototype.set_bitmap = ASS_Image.prototype.set_bitmap = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_ASS_Image_set_bitmap_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'bitmap', {
  get: ASS_Image.prototype.get_bitmap,
  set: ASS_Image.prototype.set_bitmap
})
ASS_Image.prototype.get_color = ASS_Image.prototype.get_color = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Image_get_color_0(self)
}
ASS_Image.prototype.set_color = ASS_Image.prototype.set_color = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Image_set_color_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'color', {
  get: ASS_Image.prototype.get_color,
  set: ASS_Image.prototype.set_color
})
ASS_Image.prototype.get_dst_x = ASS_Image.prototype.get_dst_x = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Image_get_dst_x_0(self)
}
ASS_Image.prototype.set_dst_x = ASS_Image.prototype.set_dst_x = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Image_set_dst_x_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'dst_x', {
  get: ASS_Image.prototype.get_dst_x,
  set: ASS_Image.prototype.set_dst_x
})
ASS_Image.prototype.get_dst_y = ASS_Image.prototype.get_dst_y = function () {
  var self = this.ptr
  return _emscripten_bind_ASS_Image_get_dst_y_0(self)
}
ASS_Image.prototype.set_dst_y = ASS_Image.prototype.set_dst_y = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Image_set_dst_y_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'dst_y', {
  get: ASS_Image.prototype.get_dst_y,
  set: ASS_Image.prototype.set_dst_y
})
ASS_Image.prototype.get_next = ASS_Image.prototype.get_next = function () {
  var self = this.ptr
  return wrapPointer(_emscripten_bind_ASS_Image_get_next_0(self), ASS_Image)
}
ASS_Image.prototype.set_next = ASS_Image.prototype.set_next = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_ASS_Image_set_next_1(self, arg0)
}
Object.defineProperty(ASS_Image.prototype, 'next', {
  get: ASS_Image.prototype.get_next,
  set: ASS_Image.prototype.set_next
})

function VoidPtr () {
  throw 'cannot construct a VoidPtr, no constructor in IDL'
}
VoidPtr.prototype = Object.create(WrapperObject.prototype)
VoidPtr.prototype.constructor = VoidPtr
VoidPtr.prototype.__class__ = VoidPtr
VoidPtr.__cache__ = {}
Module.VoidPtr = VoidPtr
VoidPtr.prototype.__destroy__ = VoidPtr.prototype.__destroy__ = function () {
  var self = this.ptr
  _emscripten_bind_VoidPtr___destroy___0(self)
}

function ASS_Library () {
  throw 'cannot construct a ASS_Library, no constructor in IDL'
}
ASS_Library.prototype = Object.create(WrapperObject.prototype)
ASS_Library.prototype.constructor = ASS_Library
ASS_Library.prototype.__class__ = ASS_Library
ASS_Library.__cache__ = {}
Module.ASS_Library = ASS_Library

function RenderBlendPart () {
  throw 'cannot construct a RenderBlendPart, no constructor in IDL'
}
RenderBlendPart.prototype = Object.create(WrapperObject.prototype)
RenderBlendPart.prototype.constructor = RenderBlendPart
RenderBlendPart.prototype.__class__ = RenderBlendPart
RenderBlendPart.__cache__ = {}
Module.RenderBlendPart = RenderBlendPart
RenderBlendPart.prototype.get_dest_x = RenderBlendPart.prototype.get_dest_x = function () {
  var self = this.ptr
  return _emscripten_bind_RenderBlendPart_get_dest_x_0(self)
}
RenderBlendPart.prototype.set_dest_x = RenderBlendPart.prototype.set_dest_x = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendPart_set_dest_x_1(self, arg0)
}
Object.defineProperty(RenderBlendPart.prototype, 'dest_x', {
  get: RenderBlendPart.prototype.get_dest_x,
  set: RenderBlendPart.prototype.set_dest_x
})
RenderBlendPart.prototype.get_dest_y = RenderBlendPart.prototype.get_dest_y = function () {
  var self = this.ptr
  return _emscripten_bind_RenderBlendPart_get_dest_y_0(self)
}
RenderBlendPart.prototype.set_dest_y = RenderBlendPart.prototype.set_dest_y = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendPart_set_dest_y_1(self, arg0)
}
Object.defineProperty(RenderBlendPart.prototype, 'dest_y', {
  get: RenderBlendPart.prototype.get_dest_y,
  set: RenderBlendPart.prototype.set_dest_y
})
RenderBlendPart.prototype.get_dest_width = RenderBlendPart.prototype.get_dest_width = function () {
  var self = this.ptr
  return _emscripten_bind_RenderBlendPart_get_dest_width_0(self)
}
RenderBlendPart.prototype.set_dest_width = RenderBlendPart.prototype.set_dest_width = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendPart_set_dest_width_1(self, arg0)
}
Object.defineProperty(RenderBlendPart.prototype, 'dest_width', {
  get: RenderBlendPart.prototype.get_dest_width,
  set: RenderBlendPart.prototype.set_dest_width
})
RenderBlendPart.prototype.get_dest_height = RenderBlendPart.prototype.get_dest_height = function () {
  var self = this.ptr
  return _emscripten_bind_RenderBlendPart_get_dest_height_0(self)
}
RenderBlendPart.prototype.set_dest_height = RenderBlendPart.prototype.set_dest_height = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendPart_set_dest_height_1(self, arg0)
}
Object.defineProperty(RenderBlendPart.prototype, 'dest_height', {
  get: RenderBlendPart.prototype.get_dest_height,
  set: RenderBlendPart.prototype.set_dest_height
})
RenderBlendPart.prototype.get_image = RenderBlendPart.prototype.get_image = function () {
  var self = this.ptr
  return _emscripten_bind_RenderBlendPart_get_image_0(self)
}
RenderBlendPart.prototype.set_image = RenderBlendPart.prototype.set_image = function (arg0) {
  var self = this.ptr
  ensureCache.prepare()
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  else arg0 = ensureString(arg0)
  _emscripten_bind_RenderBlendPart_set_image_1(self, arg0)
}
Object.defineProperty(RenderBlendPart.prototype, 'image', {
  get: RenderBlendPart.prototype.get_image,
  set: RenderBlendPart.prototype.set_image
})
RenderBlendPart.prototype.get_next = RenderBlendPart.prototype.get_next = function () {
  var self = this.ptr
  return wrapPointer(_emscripten_bind_RenderBlendPart_get_next_0(self), RenderBlendPart)
}
RenderBlendPart.prototype.set_next = RenderBlendPart.prototype.set_next = function (arg0) {
  var self = this.ptr
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr
  _emscripten_bind_RenderBlendPart_set_next_1(self, arg0)
}
Object.defineProperty(RenderBlendPart.prototype, 'next', {
  get: RenderBlendPart.prototype.get_next,
  set: RenderBlendPart.prototype.set_next
})

function libass () {
  this.ptr = _emscripten_bind_libass_libass_0()
  getCache(libass)[this.ptr] = this
}
libass.prototype = Object.create(WrapperObject.prototype)
libass.prototype.constructor = libass
libass.prototype.__class__ = libass
libass.__cache__ = {}
Module.libass = libass
libass.prototype.oct_library_version = libass.prototype.oct_library_version = function () {
  var self = this.ptr
  return _emscripten_bind_libass_oct_library_version_0(self)
}
libass.prototype.oct_library_init = libass.prototype.oct_library_init = function () {
  var self = this.ptr
  return wrapPointer(_emscripten_bind_libass_oct_library_init_0(self), ASS_Library)
}
libass.prototype.oct_library_done = libass.prototype.oct_library_done = function (priv) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  _emscripten_bind_libass_oct_library_done_1(self, priv)
}
libass.prototype.oct_set_fonts_dir = libass.prototype.oct_set_fonts_dir = function (priv, fonts_dir) {
  var self = this.ptr
  ensureCache.prepare()
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (fonts_dir && typeof fonts_dir === 'object') fonts_dir = fonts_dir.ptr
  else fonts_dir = ensureString(fonts_dir)
  _emscripten_bind_libass_oct_set_fonts_dir_2(self, priv, fonts_dir)
}
libass.prototype.oct_set_extract_fonts = libass.prototype.oct_set_extract_fonts = function (priv, extract) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (extract && typeof extract === 'object') extract = extract.ptr
  _emscripten_bind_libass_oct_set_extract_fonts_2(self, priv, extract)
}
libass.prototype.oct_set_style_overrides = libass.prototype.oct_set_style_overrides = function (priv, list) {
  var self = this.ptr
  ensureCache.prepare()
  if (priv && typeof priv === 'object') priv = priv.ptr
  _emscripten_bind_libass_oct_set_style_overrides_2(self, priv, list)
}
libass.prototype.oct_process_force_style = libass.prototype.oct_process_force_style = function (track) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  _emscripten_bind_libass_oct_process_force_style_1(self, track)
}
libass.prototype.oct_renderer_init = libass.prototype.oct_renderer_init = function (priv) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  return wrapPointer(_emscripten_bind_libass_oct_renderer_init_1(self, priv), ASS_Renderer)
}
libass.prototype.oct_renderer_done = libass.prototype.oct_renderer_done = function (priv) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  _emscripten_bind_libass_oct_renderer_done_1(self, priv)
}
libass.prototype.oct_set_frame_size = libass.prototype.oct_set_frame_size = function (priv, w, h) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (w && typeof w === 'object') w = w.ptr
  if (h && typeof h === 'object') h = h.ptr
  _emscripten_bind_libass_oct_set_frame_size_3(self, priv, w, h)
}
libass.prototype.oct_set_storage_size = libass.prototype.oct_set_storage_size = function (priv, w, h) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (w && typeof w === 'object') w = w.ptr
  if (h && typeof h === 'object') h = h.ptr
  _emscripten_bind_libass_oct_set_storage_size_3(self, priv, w, h)
}
libass.prototype.oct_set_shaper = libass.prototype.oct_set_shaper = function (priv, level) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (level && typeof level === 'object') level = level.ptr
  _emscripten_bind_libass_oct_set_shaper_2(self, priv, level)
}
libass.prototype.oct_set_margins = libass.prototype.oct_set_margins = function (priv, t, b, l, r) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (t && typeof t === 'object') t = t.ptr
  if (b && typeof b === 'object') b = b.ptr
  if (l && typeof l === 'object') l = l.ptr
  if (r && typeof r === 'object') r = r.ptr
  _emscripten_bind_libass_oct_set_margins_5(self, priv, t, b, l, r)
}
libass.prototype.oct_set_use_margins = libass.prototype.oct_set_use_margins = function (priv, use) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (use && typeof use === 'object') use = use.ptr
  _emscripten_bind_libass_oct_set_use_margins_2(self, priv, use)
}
libass.prototype.oct_set_pixel_aspect = libass.prototype.oct_set_pixel_aspect = function (priv, par) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (par && typeof par === 'object') par = par.ptr
  _emscripten_bind_libass_oct_set_pixel_aspect_2(self, priv, par)
}
libass.prototype.oct_set_aspect_ratio = libass.prototype.oct_set_aspect_ratio = function (priv, dar, sar) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (dar && typeof dar === 'object') dar = dar.ptr
  if (sar && typeof sar === 'object') sar = sar.ptr
  _emscripten_bind_libass_oct_set_aspect_ratio_3(self, priv, dar, sar)
}
libass.prototype.oct_set_font_scale = libass.prototype.oct_set_font_scale = function (priv, font_scale) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (font_scale && typeof font_scale === 'object') font_scale = font_scale.ptr
  _emscripten_bind_libass_oct_set_font_scale_2(self, priv, font_scale)
}
libass.prototype.oct_set_hinting = libass.prototype.oct_set_hinting = function (priv, ht) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (ht && typeof ht === 'object') ht = ht.ptr
  _emscripten_bind_libass_oct_set_hinting_2(self, priv, ht)
}
libass.prototype.oct_set_line_spacing = libass.prototype.oct_set_line_spacing = function (priv, line_spacing) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (line_spacing && typeof line_spacing === 'object') line_spacing = line_spacing.ptr
  _emscripten_bind_libass_oct_set_line_spacing_2(self, priv, line_spacing)
}
libass.prototype.oct_set_line_position = libass.prototype.oct_set_line_position = function (priv, line_position) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (line_position && typeof line_position === 'object') line_position = line_position.ptr
  _emscripten_bind_libass_oct_set_line_position_2(self, priv, line_position)
}
libass.prototype.oct_set_fonts = libass.prototype.oct_set_fonts = function (priv, default_font, default_family, dfp, config, update) {
  var self = this.ptr
  ensureCache.prepare()
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (default_font && typeof default_font === 'object') default_font = default_font.ptr
  else default_font = ensureString(default_font)
  if (default_family && typeof default_family === 'object') default_family = default_family.ptr
  else default_family = ensureString(default_family)
  if (dfp && typeof dfp === 'object') dfp = dfp.ptr
  if (config && typeof config === 'object') config = config.ptr
  else config = ensureString(config)
  if (update && typeof update === 'object') update = update.ptr
  _emscripten_bind_libass_oct_set_fonts_6(self, priv, default_font, default_family, dfp, config, update)
}
libass.prototype.oct_set_selective_style_override_enabled = libass.prototype.oct_set_selective_style_override_enabled = function (priv, bits) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (bits && typeof bits === 'object') bits = bits.ptr
  _emscripten_bind_libass_oct_set_selective_style_override_enabled_2(self, priv, bits)
}
libass.prototype.oct_set_selective_style_override = libass.prototype.oct_set_selective_style_override = function (priv, style) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (style && typeof style === 'object') style = style.ptr
  _emscripten_bind_libass_oct_set_selective_style_override_2(self, priv, style)
}
libass.prototype.oct_set_cache_limits = libass.prototype.oct_set_cache_limits = function (priv, glyph_max, bitmap_max_size) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (glyph_max && typeof glyph_max === 'object') glyph_max = glyph_max.ptr
  if (bitmap_max_size && typeof bitmap_max_size === 'object') bitmap_max_size = bitmap_max_size.ptr
  _emscripten_bind_libass_oct_set_cache_limits_3(self, priv, glyph_max, bitmap_max_size)
}
libass.prototype.oct_render_frame = libass.prototype.oct_render_frame = function (priv, track, now, detect_change) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  if (track && typeof track === 'object') track = track.ptr
  if (now && typeof now === 'object') now = now.ptr
  if (detect_change && typeof detect_change === 'object') detect_change = detect_change.ptr
  return wrapPointer(_emscripten_bind_libass_oct_render_frame_4(self, priv, track, now, detect_change), ASS_Image)
}
libass.prototype.oct_new_track = libass.prototype.oct_new_track = function (priv) {
  var self = this.ptr
  if (priv && typeof priv === 'object') priv = priv.ptr
  return wrapPointer(_emscripten_bind_libass_oct_new_track_1(self, priv), ASS_Track)
}
libass.prototype.oct_free_track = libass.prototype.oct_free_track = function (track) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  _emscripten_bind_libass_oct_free_track_1(self, track)
}
libass.prototype.oct_alloc_style = libass.prototype.oct_alloc_style = function (track) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  return _emscripten_bind_libass_oct_alloc_style_1(self, track)
}
libass.prototype.oct_alloc_event = libass.prototype.oct_alloc_event = function (track) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  return _emscripten_bind_libass_oct_alloc_event_1(self, track)
}
libass.prototype.oct_free_style = libass.prototype.oct_free_style = function (track, sid) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  if (sid && typeof sid === 'object') sid = sid.ptr
  _emscripten_bind_libass_oct_free_style_2(self, track, sid)
}
libass.prototype.oct_free_event = libass.prototype.oct_free_event = function (track, eid) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  if (eid && typeof eid === 'object') eid = eid.ptr
  _emscripten_bind_libass_oct_free_event_2(self, track, eid)
}
libass.prototype.oct_flush_events = libass.prototype.oct_flush_events = function (track) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  _emscripten_bind_libass_oct_flush_events_1(self, track)
}
libass.prototype.oct_read_file = libass.prototype.oct_read_file = function (library, fname, codepage) {
  var self = this.ptr
  ensureCache.prepare()
  if (library && typeof library === 'object') library = library.ptr
  if (fname && typeof fname === 'object') fname = fname.ptr
  else fname = ensureString(fname)
  if (codepage && typeof codepage === 'object') codepage = codepage.ptr
  else codepage = ensureString(codepage)
  return wrapPointer(_emscripten_bind_libass_oct_read_file_3(self, library, fname, codepage), ASS_Track)
}
libass.prototype.oct_add_font = libass.prototype.oct_add_font = function (library, name, data, data_size) {
  var self = this.ptr
  ensureCache.prepare()
  if (library && typeof library === 'object') library = library.ptr
  if (name && typeof name === 'object') name = name.ptr
  else name = ensureString(name)
  if (data && typeof data === 'object') data = data.ptr
  else data = ensureString(data)
  if (data_size && typeof data_size === 'object') data_size = data_size.ptr
  _emscripten_bind_libass_oct_add_font_4(self, library, name, data, data_size)
}
libass.prototype.oct_clear_fonts = libass.prototype.oct_clear_fonts = function (library) {
  var self = this.ptr
  if (library && typeof library === 'object') library = library.ptr
  _emscripten_bind_libass_oct_clear_fonts_1(self, library)
}
libass.prototype.oct_step_sub = libass.prototype.oct_step_sub = function (track, now, movement) {
  var self = this.ptr
  if (track && typeof track === 'object') track = track.ptr
  if (now && typeof now === 'object') now = now.ptr
  if (movement && typeof movement === 'object') movement = movement.ptr
  return _emscripten_bind_libass_oct_step_sub_3(self, track, now, movement)
};
(function () {
  function setupEnums () {
    Module.ASS_HINTING_NONE = _emscripten_enum_ASS_Hinting_ASS_HINTING_NONE()
    Module.ASS_HINTING_LIGHT = _emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT()
    Module.ASS_HINTING_NORMAL = _emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL()
    Module.ASS_HINTING_NATIVE = _emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE()
    Module.ASS_SHAPING_SIMPLE = _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE()
    Module.ASS_SHAPING_COMPLEX = _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX()
    Module.ASS_OVERRIDE_DEFAULT = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT()
    Module.ASS_OVERRIDE_BIT_STYLE = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE()
    Module.ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE()
    Module.ASS_OVERRIDE_BIT_FONT_SIZE = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE()
    Module.ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS()
    Module.ASS_OVERRIDE_BIT_FONT_NAME = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME()
    Module.ASS_OVERRIDE_BIT_COLORS = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS()
    Module.ASS_OVERRIDE_BIT_ATTRIBUTES = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES()
    Module.ASS_OVERRIDE_BIT_BORDER = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER()
    Module.ASS_OVERRIDE_BIT_ALIGNMENT = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT()
    Module.ASS_OVERRIDE_BIT_MARGINS = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS()
    Module.ASS_OVERRIDE_FULL_STYLE = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE()
    Module.ASS_OVERRIDE_BIT_JUSTIFY = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY()
  }
  if (runtimeInitialized) setupEnums()
  else addOnPreMain(setupEnums)
})()
/* globals Module, FS, SDL */
Module.FS = FS

self.delay = 0 // approximate delay (time of render + postMessage + drawImage), for example 1/60 or 0
self.lastCurrentTime = 0
self.rate = 1
self.rafId = null
self.nextIsRaf = false
self.lastCurrentTimeReceivedAt = Date.now()
self.targetFps = 23.976
self.libassMemoryLimit = 0 // in MiB
self.renderOnDemand = false // determines if only rendering on demand
self.dropAllAnimations = false // set to true to enable "lite mode" with all animations disabled for speed

self.width = 0
self.height = 0

self.fontMap_ = {}
self.fontId = 0

/**
 * Required as only Chromium decodes data URI from XHR
 * @param dataURI
 * @returns {Uint8Array}
 */
self.readDataUri = (dataURI) => {
  if (typeof dataURI !== 'string') throw new Error('Invalid argument: dataURI must be a string')
  dataURI = dataURI.split(',')
  const byteString = atob(dataURI[1])
  const byteStringLength = byteString.length
  const arrayBuffer = new ArrayBuffer(byteStringLength)
  const intArray = new Uint8Array(arrayBuffer)
  for (let i = 0; i < byteStringLength; i++) {
    intArray[i] = byteString.charCodeAt(i)
  }
  return intArray
}

self.decodeASSFontEncoding = (input) => {
  const output = new Uint8Array(input.length)
  const grouping = new Uint8Array(4)

  let offset = 0
  let arrayOffset = 0
  let writeOffset = 0
  let charCode
  while (offset < input.length) {
    charCode = input.charCodeAt(offset++)
    if (charCode >= 0x21 && charCode <= 0x60) { // TODO: optimise
      grouping[arrayOffset++] = charCode - 33
      if (arrayOffset === 4) {
        output[writeOffset++] = (grouping[0] << 2) | (grouping[1] >> 4)
        output[writeOffset++] = ((grouping[1] & 0xf) << 4) | (grouping[2] >> 2)
        output[writeOffset++] = ((grouping[2] & 0x3) << 6) | (grouping[3])
        arrayOffset = 0
      }
    }
  }

  // Handle ASS special padding
  if (arrayOffset > 0) {
    if (arrayOffset === 2) {
      output[writeOffset++] = ((grouping[0] << 6) | grouping[1]) >> 4
    } else if (arrayOffset === 3) { // TODO: optimise
      const ix = ((grouping[0] << 12) | (grouping[1] << 6) | grouping[2]) >> 2
      output[writeOffset++] = ix >> 8
      output[writeOffset++] = ix & 0xff
    }
  }

  return output.slice(0, writeOffset)
}

/**
 * Make the font accessible by libass by writing it to the virtual FS.
 * @param {!string} font the font name.
 */
self.writeFontToFS = (font) => {
  font = font.trim().toLowerCase()

  if (font.startsWith('@')) font = font.substr(1)

  if (self.fontMap_[font]) return

  self.fontMap_[font] = true

  if (self.availableFonts[font]) {
    const path = self.availableFonts[font]
    Module[(self.lazyFontLoading && path.indexOf('blob:') !== 0) ? 'FS_createLazyFile' : 'FS_createPreloadedFile']('/fonts', 'font' + (self.fontId++) + '-' + path.split('/').pop(), path, true, false)
  }
}

/**
 * Write all font's mentioned in the .ass file to the virtual FS.
 * @param {!string} content the file content.
 */
self.writeAvailableFontsToFS = (content) => {
  if (!self.availableFonts) return

  for (const selection of parseAss(content)) {
    for (const key of selection.body) {
      if (key === 'Style') self.writeFontToFS(key.value.Fontname)
    }
  }

  const regex = /\\fn([^\\}]*?)[\\}]/g
  let matches
  while ((matches = regex.exec(self.subContent)) !== null) self.writeFontToFS(matches[1])
}

self.getRenderMethod = () => {
  switch (self.renderMode) {
    case 'fast':
      return self.fastRender
    case 'blend':
      return self.blendRender
    case 'offscreen':
      return self.offscreenRender
    default:
      return self.render
  }
}

/**
 * Set the subtitle track.
 * @param {!string} content the content of the subtitle file.
 */
self.setTrack = (content) => {
  // Make sure that the fonts are loaded
  self.writeAvailableFontsToFS(content)

  // Write the subtitle file to the virtual FS.
  Module.FS.writeFile('/sub.ass', content)

  // Tell libass to render the new track
  self.octObj.createTrack('/sub.ass')
  self.ass_track = self.octObj.track
  if (!self.renderOnDemand) self.getRenderMethod()()
}

/**
 * Remove subtitle track.
 */
self.freeTrack = () => {
  self.octObj.removeTrack()
  if (!self.renderOnDemand) self.getRenderMethod()()
}

/**
 * Set the subtitle track.
 * @param {!string} url the URL of the subtitle file.
 */
self.setTrackByUrl = (url) => {
  const content = read_(url)
  self.setTrack(content)
}

self.resize = (width, height) => {
  self.width = width
  self.height = height
  self.octObj.resizeCanvas(width, height)
}

self.getCurrentTime = () => {
  const diff = (Date.now() - self.lastCurrentTimeReceivedAt) / 1000
  if (self._isPaused) return self.lastCurrentTime
  if (diff > 5) {
    console.error('Didn\'t received currentTime > 5 seconds. Assuming video was paused.')
    self.setIsPaused(true)
  }
  return self.lastCurrentTime + (diff * self.rate)
}
self.setCurrentTime = (currentTime) => {
  self.lastCurrentTime = currentTime
  self.lastCurrentTimeReceivedAt = Date.now()
  if (!self.rafId) {
    if (self.nextIsRaf) {
      if (!self.renderOnDemand) self.rafId = self.requestAnimationFrame(self.getRenderMethod())
    } else {
      if (!self.renderOnDemand) self.getRenderMethod()()

      // Give onmessage chance to receive all queued messages
      setTimeout(() => {
        self.nextIsRaf = false
      }, 20)
    }
  }
}

self._isPaused = true
self.getIsPaused = () => {
  return self._isPaused
}
self.setIsPaused = (isPaused) => {
  if (isPaused !== self._isPaused) {
    self._isPaused = isPaused
    if (isPaused) {
      if (self.rafId) {
        clearTimeout(self.rafId)
        self.rafId = null
      }
    } else {
      self.lastCurrentTimeReceivedAt = Date.now()
      if (!self.renderOnDemand) self.rafId = self.requestAnimationFrame(self.getRenderMethod())
    }
  }
}

self.blendRenderTiming = (timing, force) => {
  const startTime = performance.now()

  const renderResult = self.octObj.renderBlend(timing, force)
  const blendTime = renderResult.blend_time
  const canvases = []
  const buffers = []
  if (renderResult.ptr !== 0 && (renderResult.changed !== 0 || force)) {
    // make a copy, as we should free the memory so subsequent calls can utilize it
    for (let part = renderResult.part; part.ptr !== 0; part = part.next) {
      const result = new Uint8Array(HEAPU8.subarray(part.image, part.image + part.dest_width * part.dest_height * 4))
      canvases.push({ w: part.dest_width, h: part.dest_height, x: part.dest_x, y: part.dest_y, buffer: result.buffer })
      buffers.push(result.buffer)
    }
  }

  return {
    time: Date.now(),
    spentTime: performance.now() - startTime,
    blendTime: blendTime,
    canvases: canvases,
    buffers: buffers
  }
}

self.blendRender = (force) => {
  self.rafId = 0
  self.renderPending = false

  const rendered = self.blendRenderTiming(self.getCurrentTime() + self.delay, force)
  if (rendered.canvases.length > 0) {
    postMessage({
      target: 'canvas',
      op: 'renderCanvas',
      time: rendered.time,
      spentTime: rendered.spentTime,
      blendTime: rendered.blendTime,
      canvases: rendered.canvases
    }, rendered.buffers)
  }

  if (!self._isPaused) self.rafId = self.requestAnimationFrame(self.blendRender)
}

self.oneshotRender = (lastRenderedTime, renderNow, iteration) => {
  const eventStart = renderNow ? lastRenderedTime : self.octObj.findNextEventStart(lastRenderedTime)
  let eventFinish = -1.0
  let emptyFinish = -1.0
  let animated = false
  let rendered = {}
  if (eventStart >= 0) {
    const eventTimes = self.octObj.findEventStopTimes(eventStart)
    eventFinish = eventTimes.eventFinish
    emptyFinish = eventTimes.emptyFinish
    animated = eventTimes.is_animated

    rendered = self.blendRenderTiming(eventStart, true)
  }

  postMessage({
    target: 'canvas',
    op: 'oneshot-result',
    iteration: iteration,
    lastRenderedTime: lastRenderedTime,
    eventStart: eventStart,
    eventFinish: eventFinish,
    emptyFinish: emptyFinish,
    animated: animated,
    viewport: {
      width: self.width,
      height: self.height
    },
    spentTime: rendered.spentTime || 0,
    blendTime: rendered.blendTime || 0,
    canvases: rendered.canvases || []
  }, rendered.buffers || [])
}

self.render = (force) => {
  self.rafId = 0
  self.renderPending = false
  const startTime = performance.now()
  const renderResult = self.octObj.renderImage(self.getCurrentTime() + self.delay, self.changed)
  const changed = Module.getValue(self.changed, 'i32')
  if (changed !== 0 || force) {
    const newTime = performance.now()
    const libassTime = newTime - startTime
    const result = self.buildResult(renderResult)
    const decodeTime = performance.now() - newTime
    postMessage({
      target: 'canvas',
      op: 'renderCanvas',
      time: Date.now(),
      libassTime,
      decodeTime,
      canvases: result[0]
    }, result[1])
  }

  if (!self._isPaused) self.rafId = self.requestAnimationFrame(self.render)
}

self.fastRender = (force) => {
  self.rafId = 0
  self.renderPending = false
  const startTime = performance.now()
  const result = self.octObj.renderImage(self.getCurrentTime() + self.delay, self.changed)
  const changed = Module.getValue(self.changed, 'i32')
  if (Number(changed) !== 0 || force) {
    const newTime = performance.now()
    const libassTime = newTime - startTime
    const images = self.buildResultImage(result)
    const promises = []
    for (const item of images) {
      promises.push(createImageBitmap(item.image))
    }
    Promise.all(promises).then(bitmaps => {
      const decodeTime = performance.now() - newTime
      const imgs = []
      for (let i = 0; i < bitmaps.length; i++) {
        imgs.push({ x: images[i].x, y: images[i].y, bitmap: bitmaps[i] })
      }
      postMessage({
        target: 'canvas',
        op: 'renderFastCanvas',
        time: Date.now(),
        libassTime: libassTime,
        decodeTime: decodeTime,
        bitmaps: imgs
      }, bitmaps)
    })
  }
  if (!self._isPaused) self.rafId = self.requestAnimationFrame(self.fastRender)
}

self.offscreenRender = (force) => {
  self.rafId = 0
  self.renderPending = false
  const startTime = performance.now()
  const result = self.octObj.renderImage(self.getCurrentTime() + self.delay, self.changed)
  const changed = Module.getValue(self.changed, 'i32')
  if ((Number(changed) !== 0 || force) && self.offscreenCanvas) {
    const newTime = performance.now()
    const libassTime = newTime - startTime
    const images = self.buildResultImage(result)
    const promises = []
    for (const item of images) {
      promises.push(createImageBitmap(item.image))
    }
    Promise.all(promises).then(bitmaps => {
      const decodeTime = performance.now() - newTime
      const preDraw = performance.now()
      self.offscreenCanvasCtx.clearRect(0, 0, self.offscreenCanvas.width, self.offscreenCanvas.height)
      for (let i = 0; i < bitmaps.length; i++) {
        self.offscreenCanvasCtx.drawImage(
          bitmaps[i],
          images[i].x,
          images[i].y
        )
      }
      const drawTime = performance.now() - preDraw
      if (this.debug) console.log({ length: bitmaps.length, sum: libassTime + decodeTime + drawTime, libassTime, decodeTime, drawTime })
    })
  }
  if (!self._isPaused) self.rafId = self.requestAnimationFrame(self.offscreenRender)
}

self.buildResultImage = (ptr) => {
  const items = []
  let item
  while (Number(ptr.ptr) !== 0) {
    item = self.buildResultImageItem(ptr)
    if (item !== null) {
      items.push(item)
    }
    ptr = ptr.next
  }
  return items
}
self.buildResultImageItem = (ptr) => {
  const bitmap = ptr.bitmap
  const stride = ptr.stride
  const w = ptr.w
  const h = ptr.h
  const color = ptr.color
  if (w === 0 || h === 0) return null
  const a = (255 - (color & 255)) / 255
  if (a === 0) return null
  const c = ((color << 8) & 0xff0000) | ((color >> 8) & 0xff00) | ((color >> 24) & 0xff) // black magic
  const buf = new ArrayBuffer(w * h * 4)
  const buf8 = new Uint8ClampedArray(buf)
  const data = new Uint32Array(buf) // operate on a single position, instead of 4 positions at once
  let bitmapPosition = 0
  let resultPosition = 0
  for (let y = h; y--; bitmapPosition += stride) {
    const offset = bitmap + bitmapPosition
    for (let x = 0, z = w; z--; ++x, resultPosition++) {
      const k = Module.HEAPU8[offset + x]
      if (k !== 0) data[resultPosition] = ((a * k) << 24) | c // more black magic
    }
  }
  const image = new ImageData(buf8, w, h)
  const x = ptr.dst_x
  const y = ptr.dst_y
  return { image, x, y }
}

self.buildResult = (ptr) => {
  const items = []
  const transferable = []
  let item

  while (ptr.ptr !== 0) {
    item = self.buildResultItem(ptr)
    if (item !== null) {
      items.push(item)
      transferable.push(item.buffer)
    }
    ptr = ptr.next
  }

  return [items, transferable]
}

self.buildResultItem = (ptr) => {
  const bitmap = ptr.bitmap
  const stride = ptr.stride
  const w = ptr.w
  const h = ptr.h
  const color = ptr.color
  if (w === 0 || h === 0) return null
  const a = (255 - (color & 255)) / 255
  if (a === 0) return null
  const c = ((color << 8) & 0xff0000) | ((color >> 8) & 0xff00) | ((color >> 24) & 0xff) // black magic
  const buffer = new ArrayBuffer(w * h * 4)
  const data = new Uint32Array(buffer) // operate on a single position, instead of 4 positions at once
  let bitmapPosition = 0
  let resultPosition = 0
  for (let y = h; y--; bitmapPosition += stride) {
    const offset = bitmap + bitmapPosition
    for (let x = 0, z = w; z--; ++x, resultPosition++) {
      const k = Module.HEAPU8[offset + x]
      if (k !== 0) data[resultPosition] = ((a * k) << 24) | c // more black magic
    }
  }
  const x = ptr.dst_x
  const y = ptr.dst_y

  return { w, h, x, y, buffer }
}

if (typeof SDL !== 'undefined') {
  SDL.defaults.copyOnLock = false
  SDL.defaults.discardOnLock = false
  SDL.defaults.opaqueFrontBuffer = false
}

/**
 * Parse the content of an .ass file.
 * @param {!string} content the content of the file
 */
function parseAss (content) {
  let m, format, lastPart, parts, key, value, tmp, i, j, body
  const sections = []
  const lines = content.split(/[\r\n]+/g)
  for (i = 0; i < lines.length; i++) {
    m = lines[i].match(/^\[(.*)\]$/)
    if (m) {
      format = null
      sections.push({
        name: m[1],
        body: []
      })
    } else {
      if (/^\s*$/.test(lines[i])) continue
      if (sections.length === 0) continue
      body = sections[sections.length - 1].body
      if (lines[i][0] === ';') {
        body.push({
          type: 'comment',
          value: lines[i].substring(1)
        })
      } else {
        parts = lines[i].split(':')
        key = parts[0]
        value = parts.slice(1).join(':').trim()
        if (format || key === 'Format') {
          value = value.split(',')
          if (format && value.length > format.length) {
            lastPart = value.slice(format.length - 1).join(',')
            value = value.slice(0, format.length - 1)
            value.push(lastPart)
          }
          value = value.map(s => s.trim())
          if (format) {
            tmp = {}
            for (j = 0; j < value.length; j++) {
              tmp[format[j]] = value[j]
            }
            value = tmp
          }
        }
        if (key === 'Format') {
          format = value
        }
        body.push({
          key: key,
          value: value
        })
      }
    }
  }

  return sections
};

self.requestAnimationFrame = (() => {
  // similar to Browser.requestAnimationFrame
  let nextRAF = 0
  return func => {
    // try to keep target fps (30fps) between calls to here
    const now = Date.now()
    if (nextRAF === 0) {
      nextRAF = now + 1000 / self.targetFps
    } else {
      while (now + 2 >= nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
        nextRAF += 1000 / self.targetFps
      }
    }
    const delay = Math.max(nextRAF - now, 0)
    return setTimeout(func, delay)
    // return setTimeout(func, 1);
  }
})()

const screen = {
  width: 0,
  height: 0
}

Module.print = function Module_print (x) {
  // dump('OUT: ' + x + '\n');
  postMessage({ target: 'stdout', content: x })
}
Module.printErr = function Module_printErr (x) {
  // dump('ERR: ' + x + '\n');
  postMessage({ target: 'stderr', content: x })
}

// Frame throttling

let frameId = 0
let clientFrameId = 0
let commandBuffer = []

const postMainLoop = Module.postMainLoop
Module.postMainLoop = () => {
  if (postMainLoop) postMainLoop()
  // frame complete, send a frame id
  postMessage({ target: 'tick', id: frameId++ })
  commandBuffer = []
}

// Wait to start running until we receive some info from the client
// addRunDependency('gl-prefetch');
addRunDependency('worker-init')

// buffer messages until the program starts to run

let messageBuffer = null
let messageResenderTimeout = null

function messageResender () {
  if (calledMain) {
    assert(messageBuffer && messageBuffer.length > 0)
    messageResenderTimeout = null
    messageBuffer.forEach(message => {
      onmessage(message)
    })
    messageBuffer = null
  } else {
    messageResenderTimeout = setTimeout(messageResender, 50)
  }
}

function _applyKeys (input, output) {
  const vargs = Object.keys(input)

  for (const varg of vargs) {
    output[varg] = input[varg]
  }
}

function onMessageFromMainEmscriptenThread (message) {
  if (!calledMain && !message.data.preMain) {
    if (!messageBuffer) {
      messageBuffer = []
      messageResenderTimeout = setTimeout(messageResender, 50)
    }
    messageBuffer.push(message)
    return
  }
  if (calledMain && messageResenderTimeout) {
    clearTimeout(messageResenderTimeout)
    messageResender()
  }
  // console.log('worker got ' + JSON.stringify(message.data).substr(0, 150) + '\n');
  switch (message.data.target) {
    case 'canvas': {
      if (message.data.event) {
        Module.canvas.fireEvent(message.data.event)
      } else if (message.data.width) {
        if (Module.canvas && message.data.boundingClientRect) {
          Module.canvas.boundingClientRect = message.data.boundingClientRect
        }
        self.resize(message.data.width, message.data.height)
        if (!self.renderOnDemand) {
          self.getRenderMethod()()
        }
      } else throw new Error('ey?')
      break
    }
    case 'offscreenCanvas': {
      self.offscreenCanvas = message.data.canvas
      self.offscreenCanvasCtx = self.offscreenCanvas.getContext('2d')
      break
    }
    case 'video': {
      if (message.data.currentTime !== undefined) {
        self.setCurrentTime(message.data.currentTime)
      }
      if (message.data.isPaused !== undefined) {
        self.setIsPaused(message.data.isPaused)
      }
      if (message.data.rate) {
        self.rate = message.data.rate
      }
      break
    }
    case 'tock': {
      clientFrameId = message.data.id
      break
    }
    case 'worker-init': {
      // Module.canvas = document.createElement('canvas');
      screen.width = self.width = message.data.width
      screen.height = self.height = message.data.height
      self.subUrl = message.data.subUrl
      self.subContent = message.data.subContent
      self.fontFiles = message.data.fonts
      self.renderMode = message.data.renderMode
      self.availableFonts = message.data.availableFonts
      self.fallbackFont = message.data.fallbackFont
      self.debug = message.data.debug
      if (Module.canvas) {
        Module.canvas.width_ = message.data.width
        Module.canvas.height_ = message.data.height
        if (message.data.boundingClientRect) {
          Module.canvas.boundingClientRect = message.data.boundingClientRect
        }
      }
      self.targetFps = message.data.targetFps
      self.libassMemoryLimit = message.data.libassMemoryLimit
      self.libassGlyphLimit = message.data.libassGlyphLimit
      self.renderOnDemand = message.data.renderOnDemand || false
      self.dropAllAnimations = message.data.dropAllAnimations
      removeRunDependency('worker-init')
      postMessage({
        target: 'ready'
      })
      break
    }
    case 'oneshot-render':
      self.oneshotRender(
        message.data.lastRendered,
        message.data.renderNow || false,
        message.data.iteration
      )
      break
    case 'destroy':
      self.octObj.quitLibrary()
      break
    case 'free-track':
      self.freeTrack()
      break
    case 'set-track':
      self.setTrack(message.data.content)
      break
    case 'set-track-by-url':
      self.setTrackByUrl(message.data.url)
      break
    case 'create-event': {
      const event = message.data.event
      const vargs = Object.keys(event)
      const evntPtr = self.octObj.track.get_events(self.octObj.allocEvent())

      for (const varg of vargs) {
        evntPtr[varg] = event[varg]
      }
      break
    }
    case 'get-events': {
      const events = []
      for (let i = 0; i < self.octObj.getEventCount(); i++) {
        const evntPtr = self.octObj.track.get_events(i)
        const event = {
          Start: evntPtr.get_Start(),
          Duration: evntPtr.get_Duration(),
          ReadOrder: evntPtr.get_ReadOrder(),
          Layer: evntPtr.get_Layer(),
          Style: evntPtr.get_Style(),
          Name: evntPtr.get_Name(),
          MarginL: evntPtr.get_MarginL(),
          MarginR: evntPtr.get_MarginR(),
          MarginV: evntPtr.get_MarginV(),
          Effect: evntPtr.get_Effect(),
          Text: evntPtr.get_Text()
        }

        events.push(event)
      }
      postMessage({
        target: 'get-events',
        time: Date.now(),
        events: events
      })
      break
    }
    case 'set-event': {
      const event = message.data.event
      const evntPtr = self.octObj.track.get_events(message.data.index)
      _applyKeys(event, evntPtr)
      break
    }
    case 'remove-event':
      self.octObj.removeEvent(message.data.index)
      break
    case 'create-style': {
      const style = message.data.style
      const stylPtr = self.octObj.track.get_styles(self.octObj.allocStyle())
      _applyKeys(style, stylPtr)
      break
    }
    case 'get-styles': {
      const styles = []
      for (let i = 0; i < self.octObj.getStyleCount(); i++) {
        const stylPtr = self.octObj.track.get_styles(i)
        const style = {
          Name: stylPtr.get_Name(),
          FontName: stylPtr.get_FontName(),
          FontSize: stylPtr.get_FontSize(),
          PrimaryColour: stylPtr.get_PrimaryColour(),
          SecondaryColour: stylPtr.get_SecondaryColour(),
          OutlineColour: stylPtr.get_OutlineColour(),
          BackColour: stylPtr.get_BackColour(),
          Bold: stylPtr.get_Bold(),
          Italic: stylPtr.get_Italic(),
          Underline: stylPtr.get_Underline(),
          StrikeOut: stylPtr.get_StrikeOut(),
          ScaleX: stylPtr.get_ScaleX(),
          ScaleY: stylPtr.get_ScaleY(),
          Spacing: stylPtr.get_Spacing(),
          Angle: stylPtr.get_Angle(),
          BorderStyle: stylPtr.get_BorderStyle(),
          Outline: stylPtr.get_Outline(),
          Shadow: stylPtr.get_Shadow(),
          Alignment: stylPtr.get_Alignment(),
          MarginL: stylPtr.get_MarginL(),
          MarginR: stylPtr.get_MarginR(),
          MarginV: stylPtr.get_MarginV(),
          Encoding: stylPtr.get_Encoding(),
          treat_fontname_as_pattern: stylPtr.get_treat_fontname_as_pattern(),
          Blur: stylPtr.get_Blur(),
          Justify: stylPtr.get_Justify()
        }
        styles.push(style)
      }
      postMessage({
        target: 'get-styles',
        time: Date.now(),
        styles: styles
      })
      break
    }
    case 'set-style': {
      const style = message.data.style
      const stylPtr = self.octObj.track.get_styles(message.data.index)
      _applyKeys(style, stylPtr)
      break
    }
    case 'remove-style':
      self.octObj.removeStyle(message.data.index)
      break
    case 'runBenchmark': {
      self.runBenchmark()
      break
    }
    case 'custom': {
      if (Module.onCustomMessage) {
        Module.onCustomMessage(message)
      } else {
        console.error('Custom message received but worker Module.onCustomMessage not implemented.')
      }
      break
    }
    default:
      throw new Error('wha? ' + message.data.target)
  }
}

onmessage = onMessageFromMainEmscriptenThread

self.runBenchmark = (seconds, pos, async) => {
  let totalTime = 0
  let i = 0
  pos = pos || 0
  seconds = seconds || 60
  const count = seconds * self.targetFps
  const start = performance.now()
  let longestFrame = 0
  const run = () => {
    const t0 = performance.now()

    pos += 1 / self.targetFps
    self.setCurrentTime(pos)

    const t1 = performance.now()
    const diff = t1 - t0
    totalTime += diff
    if (diff > longestFrame) longestFrame = diff

    if (i < count) {
      i++
      if (async) {
        self.requestAnimationFrame(run)
        return false
      } else {
        return true
      }
    } else {
      console.log('Performance fps: ' + Math.round(1000 / (totalTime / count)) + '')
      console.log('Real fps: ' + Math.round(1000 / ((t1 - start) / count)) + '')
      console.log('Total time: ' + totalTime)
      console.log('Longest frame: ' + Math.ceil(longestFrame) + 'ms (' + Math.floor(1000 / longestFrame) + ' fps)')
      return false
    }
  }

  while (true) {
    if (!run()) {
      break
    }
  }
}