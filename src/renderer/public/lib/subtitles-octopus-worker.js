

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }
  Module.expectedDataFileDownloads++;
  (function() {
   var loadPackage = function(metadata) {
  
      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = 'dist/js/subtitles-octopus-worker.data';
      var REMOTE_PACKAGE_BASE = 'subtitles-octopus-worker.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
    
      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];
      var PACKAGE_UUID = metadata['package_uuid'];
    
      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };
    
        var fetchedCallback = null;
        var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

        if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
          if (fetchedCallback) {
            fetchedCallback(data);
            fetchedCallback = null;
          } else {
            fetched = data;
          }
        }, handleError);
      
    function runWithFS() {
  
      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
  Module['FS_createPath']("/", "assets", true, true);

          /** @constructor */
          function DataRequest(start, end, audio) {
            this.start = start;
            this.end = end;
            this.audio = audio;
          }
          DataRequest.prototype = {
            requests: {},
            open: function(mode, name) {
              this.name = name;
              this.requests[name] = this;
              Module['addRunDependency']('fp ' + this.name);
            },
            send: function() {},
            onload: function() {
              var byteArray = this.byteArray.subarray(this.start, this.end);
              this.finish(byteArray);
            },
            finish: function(byteArray) {
              var that = this;
      
          Module['FS_createPreloadedFile'](this.name, null, byteArray, true, true, function() {
            Module['removeRunDependency']('fp ' + that.name);
          }, function() {
            if (that.audio) {
              Module['removeRunDependency']('fp ' + that.name); // workaround for chromium bug 124926 (still no audio with this, but at least we don't hang)
            } else {
              err('Preloading file ' + that.name + ' failed');
            }
          }, false, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
  
              this.requests[this.name] = null;
            }
          };
      
              var files = metadata['files'];
              for (var i = 0; i < files.length; ++i) {
                new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
              }
      
        
      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        
          // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
    
            var files = metadata['files'];
            for (var i = 0; i < files.length; ++i) {
              DataRequest.prototype.requests[files[i].filename].onload();
            }
                Module['removeRunDependency']('datafile_dist/js/subtitles-octopus-worker.data');

      };
      Module['addRunDependency']('datafile_dist/js/subtitles-octopus-worker.data');
    
      if (!Module.preloadResults) Module.preloadResults = {};
    
        Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
        if (fetched) {
          processPackageData(fetched);
          fetched = null;
        } else {
          fetchedCallback = processPackageData;
        }
      
    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }
  
   }
   loadPackage({"files": [{"filename": "/assets/default.woff2", "start": 0, "end": 145972}, {"filename": "/assets/fonts.conf", "start": 145972, "end": 146775}], "remote_package_size": 146775, "package_uuid": "652eb40b-9ef3-40cb-97db-b51928eee134"});
  
  })();
  

    // All the pre-js content up to here must remain later on, we need to run
    // it.
    var necessaryPreJSTasks = Module['preRun'].slice();
  /* global Module */
/* eslint-env browser, worker */
const hasNativeConsole = typeof console !== 'undefined'

// implement console methods if they're missing
function makeCustomConsole () {
  const console = (function () {
    function postConsoleMessage (command, args) {
      postMessage({
        target: 'console',
        command,
        content: JSON.stringify(Array.prototype.slice.call(args))
      })
    }

    return {
      log: function () {
        postConsoleMessage('log', arguments)
      },
      debug: function () {
        postConsoleMessage('debug', arguments)
      },
      info: function () {
        postConsoleMessage('info', arguments)
      },
      warn: function () {
        postConsoleMessage('warn', arguments)
      },
      error: function () {
        postConsoleMessage('error', arguments)
      }
    }
  })()

  return console
}

/**
 * Test the subtitle file for Brotli compression.
 * @param {!string} url the URL of the subtitle file.
 * @returns {boolean} Brotli compression found or not.
 */
function isBrotliFile (url) {
  // Search for parameters
  let len = url.indexOf('?')

  if (len === -1) {
    len = url.length
  }

  return url.endsWith('.br', len)
}

Module = Module || {}

Module.preRun = Module.preRun || []

Module.preRun.push(function () {
  Module.FS_createPath('/', 'fonts', true, true)
  Module.FS_createPath('/', 'fontconfig', true, true)

  if (!self.subContent) {
    // We can use sync xhr cause we're inside Web Worker
    if (isBrotliFile(self.subUrl)) {
      self.subContent = Module.BrotliDecode(readBinary(self.subUrl))
    } else {
      self.subContent = read_(self.subUrl)
    }
  }

  if (self.availableFonts && self.availableFonts.length !== 0) {
    const sections = parseAss(self.subContent)
    for (let i = 0; i < sections.length; i++) {
      for (let j = 0; j < sections[i].body.length; j++) {
        if (sections[i].body[j].key === 'Style') {
          self.writeFontToFS(sections[i].body[j].value.Fontname)
        }
      }
    }

    const regex = /\\fn([^\\}]*?)[\\}]/g
    let matches
    while (matches = regex.exec(self.subContent)) {
      self.writeFontToFS(matches[1])
    }
  }

  if (self.subContent) {
    Module.FS.writeFile('/sub.ass', self.subContent)
  }

  self.subContent = null

  // Module["FS"].mount(Module["FS"].filesystems.IDBFS, {}, '/fonts');
  const fontFiles = self.fontFiles || []
  for (let i = 0; i < fontFiles.length; i++) {
    Module.FS_createPreloadedFile('/fonts', 'font' + i + '-' + fontFiles[i].split('/').pop(), fontFiles[i], true, true)
  }
})

Module.onRuntimeInitialized = function () {
  self.octObj = new Module.SubtitleOctopus()

  self.changed = Module._malloc(4)
  self.blendTime = Module._malloc(8)
  self.blendX = Module._malloc(4)
  self.blendY = Module._malloc(4)
  self.blendW = Module._malloc(4)
  self.blendH = Module._malloc(4)

  self.octObj.initLibrary(screen.width, screen.height)
  self.octObj.createTrack('/sub.ass')
  self.octObj.setDropAnimations(self.dropAllAnimations)
  self.ass_track = self.octObj.track
  self.ass_library = self.octObj.ass_library
  self.ass_renderer = self.octObj.ass_renderer

  if (self.libassMemoryLimit > 0 || self.libassGlyphLimit > 0) {
    self.octObj.setMemoryLimits(self.libassGlyphLimit, self.libassMemoryLimit)
  }
}

Module.print = function (text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ')
  console.log(text)
}
Module.printErr = function (text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ')
  console.error(text)
}

// Modified from https://github.com/kripken/emscripten/blob/6dc4ac5f9e4d8484e273e4dcc554f809738cedd6/src/proxyWorker.js
if (!hasNativeConsole) {
  // we can't call Module.printErr because that might be circular
  console = {
    log: function (x) {
      if (typeof dump === 'function') dump('log: ' + x + '\n')
    },
    debug: function (x) {
      if (typeof dump === 'function') dump('debug: ' + x + '\n')
    },
    info: function (x) {
      if (typeof dump === 'function') dump('info: ' + x + '\n')
    },
    warn: function (x) {
      if (typeof dump === 'function') dump('warn: ' + x + '\n')
    },
    error: function (x) {
      if (typeof dump === 'function') dump('error: ' + x + '\n')
    }
  }
}

/* Copyright 2017 Google Inc. All Rights Reserved.

   Distributed under MIT license.
   See file LICENSE for detail or copy at https://opensource.org/licenses/MIT
*/

/** @return {function(!Int8Array):!Int8Array} */
function BrotliDecodeClosure() {
  "use strict";

  /** @type {!Int8Array} */
  var DICTIONARY_DATA = new Int8Array(0);

  /**
   * @constructor
   * @param {!Int8Array} bytes
   * @struct
   */
  function InputStream(bytes) {
    /** @type {!Int8Array} */
    this.data = bytes;
    /** @type {!number} */
    this.offset = 0;
  }
  var MAX_HUFFMAN_TABLE_SIZE = Int32Array.from([256, 402, 436, 468, 500, 534, 566, 598, 630, 662, 694, 726, 758, 790, 822, 854, 886, 920, 952, 984, 1016, 1048, 1080]);
  var CODE_LENGTH_CODE_ORDER = Int32Array.from([1, 2, 3, 4, 0, 5, 17, 6, 16, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  var DISTANCE_SHORT_CODE_INDEX_OFFSET = Int32Array.from([0, 3, 2, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3]);
  var DISTANCE_SHORT_CODE_VALUE_OFFSET = Int32Array.from([0, 0, 0, 0, -1, 1, -2, 2, -3, 3, -1, 1, -2, 2, -3, 3]);
  var FIXED_TABLE = Int32Array.from([0x020000, 0x020004, 0x020003, 0x030002, 0x020000, 0x020004, 0x020003, 0x040001, 0x020000, 0x020004, 0x020003, 0x030002, 0x020000, 0x020004, 0x020003, 0x040005]);
  var DICTIONARY_OFFSETS_BY_LENGTH = Int32Array.from([0, 0, 0, 0, 0, 4096, 9216, 21504, 35840, 44032, 53248, 63488, 74752, 87040, 93696, 100864, 104704, 106752, 108928, 113536, 115968, 118528, 119872, 121280, 122016]);
  var DICTIONARY_SIZE_BITS_BY_LENGTH = Int32Array.from([0, 0, 0, 0, 10, 10, 11, 11, 10, 10, 10, 10, 10, 9, 9, 8, 7, 7, 8, 7, 7, 6, 6, 5, 5]);
  var BLOCK_LENGTH_OFFSET = Int32Array.from([1, 5, 9, 13, 17, 25, 33, 41, 49, 65, 81, 97, 113, 145, 177, 209, 241, 305, 369, 497, 753, 1265, 2289, 4337, 8433, 16625]);
  var BLOCK_LENGTH_N_BITS = Int32Array.from([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 24]);
  var INSERT_LENGTH_N_BITS = Int16Array.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0C, 0x0E, 0x18]);
  var COPY_LENGTH_N_BITS = Int16Array.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x18]);
  var CMD_LOOKUP = new Int16Array(2816);
  {
    unpackCommandLookupTable(CMD_LOOKUP);
  }
  /**
   * @param {number} i
   * @return {number}
   */
  function log2floor(i) {
    var /** number */ result = -1;
    var /** number */ step = 16;
    while (step > 0) {
      if ((i >>> step) != 0) {
        result += step;
        i = i >>> step;
      }
      step = step >> 1;
    }
    return result + i;
  }
  /**
   * @param {number} npostfix
   * @param {number} ndirect
   * @param {number} maxndistbits
   * @return {number}
   */
  function calculateDistanceAlphabetSize(npostfix, ndirect, maxndistbits) {
    return 16 + ndirect + 2 * (maxndistbits << npostfix);
  }
  /**
   * @param {number} maxDistance
   * @param {number} npostfix
   * @param {number} ndirect
   * @return {number}
   */
  function calculateDistanceAlphabetLimit(maxDistance, npostfix, ndirect) {
    if (maxDistance < ndirect + (2 << npostfix)) {
      throw "maxDistance is too small";
    }
    var /** number */ offset = ((maxDistance - ndirect) >> npostfix) + 4;
    var /** number */ ndistbits = log2floor(offset) - 1;
    var /** number */ group = ((ndistbits - 1) << 1) | ((offset >> ndistbits) & 1);
    return ((group - 1) << npostfix) + (1 << npostfix) + ndirect + 16;
  }
  /**
   * @param {!Int16Array} cmdLookup
   * @return {void}
   */
  function unpackCommandLookupTable(cmdLookup) {
    var /** !Int16Array */ insertLengthOffsets = new Int16Array(24);
    var /** !Int16Array */ copyLengthOffsets = new Int16Array(24);
    copyLengthOffsets[0] = 2;
    for (var /** number */ i = 0; i < 23; ++i) {
      insertLengthOffsets[i + 1] = (insertLengthOffsets[i] + (1 << INSERT_LENGTH_N_BITS[i]));
      copyLengthOffsets[i + 1] = (copyLengthOffsets[i] + (1 << COPY_LENGTH_N_BITS[i]));
    }
    for (var /** number */ cmdCode = 0; cmdCode < 704; ++cmdCode) {
      var /** number */ rangeIdx = cmdCode >>> 6;
      var /** number */ distanceContextOffset = -4;
      if (rangeIdx >= 2) {
        rangeIdx -= 2;
        distanceContextOffset = 0;
      }
      var /** number */ insertCode = (((0x29850 >>> (rangeIdx * 2)) & 0x3) << 3) | ((cmdCode >>> 3) & 7);
      var /** number */ copyCode = (((0x26244 >>> (rangeIdx * 2)) & 0x3) << 3) | (cmdCode & 7);
      var /** number */ copyLengthOffset = copyLengthOffsets[copyCode];
      var /** number */ distanceContext = distanceContextOffset + (copyLengthOffset > 4 ? 3 : copyLengthOffset - 2);
      var /** number */ index = cmdCode * 4;
      cmdLookup[index + 0] = (INSERT_LENGTH_N_BITS[insertCode] | (COPY_LENGTH_N_BITS[copyCode] << 8));
      cmdLookup[index + 1] = insertLengthOffsets[insertCode];
      cmdLookup[index + 2] = copyLengthOffsets[copyCode];
      cmdLookup[index + 3] = distanceContext;
    }
  }
  /**
   * @param {!State} s
   * @return {number}
   */
  function decodeWindowBits(s) {
    var /** number */ largeWindowEnabled = s.isLargeWindow;
    s.isLargeWindow = 0;
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    if (readFewBits(s, 1) == 0) {
      return 16;
    }
    var /** number */ n = readFewBits(s, 3);
    if (n != 0) {
      return 17 + n;
    }
    n = readFewBits(s, 3);
    if (n != 0) {
      if (n == 1) {
        if (largeWindowEnabled == 0) {
          return -1;
        }
        s.isLargeWindow = 1;
        if (readFewBits(s, 1) == 1) {
          return -1;
        }
        n = readFewBits(s, 6);
        if (n < 10 || n > 30) {
          return -1;
        }
        return n;
      } else {
        return 8 + n;
      }
    }
    return 17;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function enableEagerOutput(s) {
    if (s.runningState != 1) {
      throw "State MUST be freshly initialized";
    }
    s.isEager = 1;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function enableLargeWindow(s) {
    if (s.runningState != 1) {
      throw "State MUST be freshly initialized";
    }
    s.isLargeWindow = 1;
  }
  /**
   * @param {!State} s
   * @param {!InputStream} input
   * @return {void}
   */
  function initState(s, input) {
    if (s.runningState != 0) {
      throw "State MUST be uninitialized";
    }
    s.blockTrees = new Int32Array(3091);
    s.blockTrees[0] = 7;
    s.distRbIdx = 3;
    var /** number */ maxDistanceAlphabetLimit = calculateDistanceAlphabetLimit(0x7FFFFFFC, 3, 15 << 3);
    s.distExtraBits = new Int8Array(maxDistanceAlphabetLimit);
    s.distOffset = new Int32Array(maxDistanceAlphabetLimit);
    s.input = input;
    initBitReader(s);
    s.runningState = 1;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function close(s) {
    if (s.runningState == 0) {
      throw "State MUST be initialized";
    }
    if (s.runningState == 11) {
      return;
    }
    s.runningState = 11;
    if (s.input != null) {
      closeInput(s.input);
      s.input = null;
    }
  }
  /**
   * @param {!State} s
   * @return {number}
   */
  function decodeVarLenUnsignedByte(s) {
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    if (readFewBits(s, 1) != 0) {
      var /** number */ n = readFewBits(s, 3);
      if (n == 0) {
        return 1;
      } else {
        return readFewBits(s, n) + (1 << n);
      }
    }
    return 0;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function decodeMetaBlockLength(s) {
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    s.inputEnd = readFewBits(s, 1);
    s.metaBlockLength = 0;
    s.isUncompressed = 0;
    s.isMetadata = 0;
    if ((s.inputEnd != 0) && readFewBits(s, 1) != 0) {
      return;
    }
    var /** number */ sizeNibbles = readFewBits(s, 2) + 4;
    if (sizeNibbles == 7) {
      s.isMetadata = 1;
      if (readFewBits(s, 1) != 0) {
        throw "Corrupted reserved bit";
      }
      var /** number */ sizeBytes = readFewBits(s, 2);
      if (sizeBytes == 0) {
        return;
      }
      for (var /** number */ i = 0; i < sizeBytes; i++) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        var /** number */ bits = readFewBits(s, 8);
        if (bits == 0 && i + 1 == sizeBytes && sizeBytes > 1) {
          throw "Exuberant nibble";
        }
        s.metaBlockLength |= bits << (i * 8);
      }
    } else {
      for (var /** number */ i = 0; i < sizeNibbles; i++) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        var /** number */ bits = readFewBits(s, 4);
        if (bits == 0 && i + 1 == sizeNibbles && sizeNibbles > 4) {
          throw "Exuberant nibble";
        }
        s.metaBlockLength |= bits << (i * 4);
      }
    }
    s.metaBlockLength++;
    if (s.inputEnd == 0) {
      s.isUncompressed = readFewBits(s, 1);
    }
  }
  /**
   * @param {!Int32Array} tableGroup
   * @param {number} tableIdx
   * @param {!State} s
   * @return {number}
   */
  function readSymbol(tableGroup, tableIdx, s) {
    var /** number */ offset = tableGroup[tableIdx];
    var /** number */ val = (s.accumulator32 >>> s.bitOffset);
    offset += val & 0xFF;
    var /** number */ bits = tableGroup[offset] >> 16;
    var /** number */ sym = tableGroup[offset] & 0xFFFF;
    if (bits <= 8) {
      s.bitOffset += bits;
      return sym;
    }
    offset += sym;
    var /** number */ mask = (1 << bits) - 1;
    offset += (val & mask) >>> 8;
    s.bitOffset += ((tableGroup[offset] >> 16) + 8);
    return tableGroup[offset] & 0xFFFF;
  }
  /**
   * @param {!Int32Array} tableGroup
   * @param {number} tableIdx
   * @param {!State} s
   * @return {number}
   */
  function readBlockLength(tableGroup, tableIdx, s) {
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var /** number */ code = readSymbol(tableGroup, tableIdx, s);
    var /** number */ n = BLOCK_LENGTH_N_BITS[code];
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    return BLOCK_LENGTH_OFFSET[code] + ((n <= 16) ? readFewBits(s, n) : readManyBits(s, n));
  }
  /**
   * @param {!Int32Array} v
   * @param {number} index
   * @return {void}
   */
  function moveToFront(v, index) {
    var /** number */ value = v[index];
    for (; index > 0; index--) {
      v[index] = v[index - 1];
    }
    v[0] = value;
  }
  /**
   * @param {!Int8Array} v
   * @param {number} vLen
   * @return {void}
   */
  function inverseMoveToFrontTransform(v, vLen) {
    var /** !Int32Array */ mtf = new Int32Array(256);
    for (var /** number */ i = 0; i < 256; i++) {
      mtf[i] = i;
    }
    for (var /** number */ i = 0; i < vLen; i++) {
      var /** number */ index = v[i] & 0xFF;
      v[i] = mtf[index];
      if (index != 0) {
        moveToFront(mtf, index);
      }
    }
  }
  /**
   * @param {!Int32Array} codeLengthCodeLengths
   * @param {number} numSymbols
   * @param {!Int32Array} codeLengths
   * @param {!State} s
   * @return {void}
   */
  function readHuffmanCodeLengths(codeLengthCodeLengths, numSymbols, codeLengths, s) {
    var /** number */ symbol = 0;
    var /** number */ prevCodeLen = 8;
    var /** number */ repeat = 0;
    var /** number */ repeatCodeLen = 0;
    var /** number */ space = 32768;
    var /** !Int32Array */ table = new Int32Array(32 + 1);
    var /** number */ tableIdx = table.length - 1;
    buildHuffmanTable(table, tableIdx, 5, codeLengthCodeLengths, 18);
    while (symbol < numSymbols && space > 0) {
      if (s.halfOffset > 2030) {
        doReadMoreInput(s);
      }
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var /** number */ p = (s.accumulator32 >>> s.bitOffset) & 31;
      s.bitOffset += table[p] >> 16;
      var /** number */ codeLen = table[p] & 0xFFFF;
      if (codeLen < 16) {
        repeat = 0;
        codeLengths[symbol++] = codeLen;
        if (codeLen != 0) {
          prevCodeLen = codeLen;
          space -= 32768 >> codeLen;
        }
      } else {
        var /** number */ extraBits = codeLen - 14;
        var /** number */ newLen = 0;
        if (codeLen == 16) {
          newLen = prevCodeLen;
        }
        if (repeatCodeLen != newLen) {
          repeat = 0;
          repeatCodeLen = newLen;
        }
        var /** number */ oldRepeat = repeat;
        if (repeat > 0) {
          repeat -= 2;
          repeat <<= extraBits;
        }
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        repeat += readFewBits(s, extraBits) + 3;
        var /** number */ repeatDelta = repeat - oldRepeat;
        if (symbol + repeatDelta > numSymbols) {
          throw "symbol + repeatDelta > numSymbols";
        }
        for (var /** number */ i = 0; i < repeatDelta; i++) {
          codeLengths[symbol++] = repeatCodeLen;
        }
        if (repeatCodeLen != 0) {
          space -= repeatDelta << (15 - repeatCodeLen);
        }
      }
    }
    if (space != 0) {
      throw "Unused space";
    }
    codeLengths.fill(0, symbol, numSymbols);
  }
  /**
   * @param {!Int32Array} symbols
   * @param {number} length
   * @return {void}
   */
  function checkDupes(symbols, length) {
    for (var /** number */ i = 0; i < length - 1; ++i) {
      for (var /** number */ j = i + 1; j < length; ++j) {
        if (symbols[i] == symbols[j]) {
          throw "Duplicate simple Huffman code symbol";
        }
      }
    }
  }
  /**
   * @param {number} alphabetSizeMax
   * @param {number} alphabetSizeLimit
   * @param {!Int32Array} tableGroup
   * @param {number} tableIdx
   * @param {!State} s
   * @return {number}
   */
  function readSimpleHuffmanCode(alphabetSizeMax, alphabetSizeLimit, tableGroup, tableIdx, s) {
    var /** !Int32Array */ codeLengths = new Int32Array(alphabetSizeLimit);
    var /** !Int32Array */ symbols = new Int32Array(4);
    var /** number */ maxBits = 1 + log2floor(alphabetSizeMax - 1);
    var /** number */ numSymbols = readFewBits(s, 2) + 1;
    for (var /** number */ i = 0; i < numSymbols; i++) {
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var /** number */ symbol = readFewBits(s, maxBits);
      if (symbol >= alphabetSizeLimit) {
        throw "Can't readHuffmanCode";
      }
      symbols[i] = symbol;
    }
    checkDupes(symbols, numSymbols);
    var /** number */ histogramId = numSymbols;
    if (numSymbols == 4) {
      histogramId += readFewBits(s, 1);
    }
    switch(histogramId) {
      case 1:
        codeLengths[symbols[0]] = 1;
        break;
      case 2:
        codeLengths[symbols[0]] = 1;
        codeLengths[symbols[1]] = 1;
        break;
      case 3:
        codeLengths[symbols[0]] = 1;
        codeLengths[symbols[1]] = 2;
        codeLengths[symbols[2]] = 2;
        break;
      case 4:
        codeLengths[symbols[0]] = 2;
        codeLengths[symbols[1]] = 2;
        codeLengths[symbols[2]] = 2;
        codeLengths[symbols[3]] = 2;
        break;
      case 5:
        codeLengths[symbols[0]] = 1;
        codeLengths[symbols[1]] = 2;
        codeLengths[symbols[2]] = 3;
        codeLengths[symbols[3]] = 3;
        break;
      default:
        break;
    }
    return buildHuffmanTable(tableGroup, tableIdx, 8, codeLengths, alphabetSizeLimit);
  }
  /**
   * @param {number} alphabetSizeLimit
   * @param {number} skip
   * @param {!Int32Array} tableGroup
   * @param {number} tableIdx
   * @param {!State} s
   * @return {number}
   */
  function readComplexHuffmanCode(alphabetSizeLimit, skip, tableGroup, tableIdx, s) {
    var /** !Int32Array */ codeLengths = new Int32Array(alphabetSizeLimit);
    var /** !Int32Array */ codeLengthCodeLengths = new Int32Array(18);
    var /** number */ space = 32;
    var /** number */ numCodes = 0;
    for (var /** number */ i = skip; i < 18 && space > 0; i++) {
      var /** number */ codeLenIdx = CODE_LENGTH_CODE_ORDER[i];
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var /** number */ p = (s.accumulator32 >>> s.bitOffset) & 15;
      s.bitOffset += FIXED_TABLE[p] >> 16;
      var /** number */ v = FIXED_TABLE[p] & 0xFFFF;
      codeLengthCodeLengths[codeLenIdx] = v;
      if (v != 0) {
        space -= (32 >> v);
        numCodes++;
      }
    }
    if (space != 0 && numCodes != 1) {
      throw "Corrupted Huffman code histogram";
    }
    readHuffmanCodeLengths(codeLengthCodeLengths, alphabetSizeLimit, codeLengths, s);
    return buildHuffmanTable(tableGroup, tableIdx, 8, codeLengths, alphabetSizeLimit);
  }
  /**
   * @param {number} alphabetSizeMax
   * @param {number} alphabetSizeLimit
   * @param {!Int32Array} tableGroup
   * @param {number} tableIdx
   * @param {!State} s
   * @return {number}
   */
  function readHuffmanCode(alphabetSizeMax, alphabetSizeLimit, tableGroup, tableIdx, s) {
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var /** number */ simpleCodeOrSkip = readFewBits(s, 2);
    if (simpleCodeOrSkip == 1) {
      return readSimpleHuffmanCode(alphabetSizeMax, alphabetSizeLimit, tableGroup, tableIdx, s);
    } else {
      return readComplexHuffmanCode(alphabetSizeLimit, simpleCodeOrSkip, tableGroup, tableIdx, s);
    }
  }
  /**
   * @param {number} contextMapSize
   * @param {!Int8Array} contextMap
   * @param {!State} s
   * @return {number}
   */
  function decodeContextMap(contextMapSize, contextMap, s) {
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    var /** number */ numTrees = decodeVarLenUnsignedByte(s) + 1;
    if (numTrees == 1) {
      contextMap.fill(0, 0, contextMapSize);
      return numTrees;
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var /** number */ useRleForZeros = readFewBits(s, 1);
    var /** number */ maxRunLengthPrefix = 0;
    if (useRleForZeros != 0) {
      maxRunLengthPrefix = readFewBits(s, 4) + 1;
    }
    var /** number */ alphabetSize = numTrees + maxRunLengthPrefix;
    var /** number */ tableSize = MAX_HUFFMAN_TABLE_SIZE[(alphabetSize + 31) >> 5];
    var /** !Int32Array */ table = new Int32Array(tableSize + 1);
    var /** number */ tableIdx = table.length - 1;
    readHuffmanCode(alphabetSize, alphabetSize, table, tableIdx, s);
    for (var /** number */ i = 0; i < contextMapSize; ) {
      if (s.halfOffset > 2030) {
        doReadMoreInput(s);
      }
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var /** number */ code = readSymbol(table, tableIdx, s);
      if (code == 0) {
        contextMap[i] = 0;
        i++;
      } else if (code <= maxRunLengthPrefix) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        var /** number */ reps = (1 << code) + readFewBits(s, code);
        while (reps != 0) {
          if (i >= contextMapSize) {
            throw "Corrupted context map";
          }
          contextMap[i] = 0;
          i++;
          reps--;
        }
      } else {
        contextMap[i] = (code - maxRunLengthPrefix);
        i++;
      }
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    if (readFewBits(s, 1) == 1) {
      inverseMoveToFrontTransform(contextMap, contextMapSize);
    }
    return numTrees;
  }
  /**
   * @param {!State} s
   * @param {number} treeType
   * @param {number} numBlockTypes
   * @return {number}
   */
  function decodeBlockTypeAndLength(s, treeType, numBlockTypes) {
    var /** !Int32Array */ ringBuffers = s.rings;
    var /** number */ offset = 4 + treeType * 2;
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var /** number */ blockType = readSymbol(s.blockTrees, 2 * treeType, s);
    var /** number */ result = readBlockLength(s.blockTrees, 2 * treeType + 1, s);
    if (blockType == 1) {
      blockType = ringBuffers[offset + 1] + 1;
    } else if (blockType == 0) {
      blockType = ringBuffers[offset];
    } else {
      blockType -= 2;
    }
    if (blockType >= numBlockTypes) {
      blockType -= numBlockTypes;
    }
    ringBuffers[offset] = ringBuffers[offset + 1];
    ringBuffers[offset + 1] = blockType;
    return result;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function decodeLiteralBlockSwitch(s) {
    s.literalBlockLength = decodeBlockTypeAndLength(s, 0, s.numLiteralBlockTypes);
    var /** number */ literalBlockType = s.rings[5];
    s.contextMapSlice = literalBlockType << 6;
    s.literalTreeIdx = s.contextMap[s.contextMapSlice] & 0xFF;
    var /** number */ contextMode = s.contextModes[literalBlockType];
    s.contextLookupOffset1 = contextMode << 9;
    s.contextLookupOffset2 = s.contextLookupOffset1 + 256;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function decodeCommandBlockSwitch(s) {
    s.commandBlockLength = decodeBlockTypeAndLength(s, 1, s.numCommandBlockTypes);
    s.commandTreeIdx = s.rings[7];
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function decodeDistanceBlockSwitch(s) {
    s.distanceBlockLength = decodeBlockTypeAndLength(s, 2, s.numDistanceBlockTypes);
    s.distContextMapSlice = s.rings[9] << 2;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function maybeReallocateRingBuffer(s) {
    var /** number */ newSize = s.maxRingBufferSize;
    if (newSize > s.expectedTotalSize) {
      var /** number */ minimalNewSize = s.expectedTotalSize;
      while ((newSize >> 1) > minimalNewSize) {
        newSize >>= 1;
      }
      if ((s.inputEnd == 0) && newSize < 16384 && s.maxRingBufferSize >= 16384) {
        newSize = 16384;
      }
    }
    if (newSize <= s.ringBufferSize) {
      return;
    }
    var /** number */ ringBufferSizeWithSlack = newSize + 37;
    var /** !Int8Array */ newBuffer = new Int8Array(ringBufferSizeWithSlack);
    if (s.ringBuffer.length != 0) {
      newBuffer.set(s.ringBuffer.subarray(0, 0 + s.ringBufferSize), 0);
    }
    s.ringBuffer = newBuffer;
    s.ringBufferSize = newSize;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function readNextMetablockHeader(s) {
    if (s.inputEnd != 0) {
      s.nextRunningState = 10;
      s.runningState = 12;
      return;
    }
    s.literalTreeGroup = new Int32Array(0);
    s.commandTreeGroup = new Int32Array(0);
    s.distanceTreeGroup = new Int32Array(0);
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    decodeMetaBlockLength(s);
    if ((s.metaBlockLength == 0) && (s.isMetadata == 0)) {
      return;
    }
    if ((s.isUncompressed != 0) || (s.isMetadata != 0)) {
      jumpToByteBoundary(s);
      s.runningState = (s.isMetadata != 0) ? 5 : 6;
    } else {
      s.runningState = 3;
    }
    if (s.isMetadata != 0) {
      return;
    }
    s.expectedTotalSize += s.metaBlockLength;
    if (s.expectedTotalSize > 1 << 30) {
      s.expectedTotalSize = 1 << 30;
    }
    if (s.ringBufferSize < s.maxRingBufferSize) {
      maybeReallocateRingBuffer(s);
    }
  }
  /**
   * @param {!State} s
   * @param {number} treeType
   * @param {number} numBlockTypes
   * @return {number}
   */
  function readMetablockPartition(s, treeType, numBlockTypes) {
    var /** number */ offset = s.blockTrees[2 * treeType];
    if (numBlockTypes <= 1) {
      s.blockTrees[2 * treeType + 1] = offset;
      s.blockTrees[2 * treeType + 2] = offset;
      return 1 << 28;
    }
    var /** number */ blockTypeAlphabetSize = numBlockTypes + 2;
    offset += readHuffmanCode(blockTypeAlphabetSize, blockTypeAlphabetSize, s.blockTrees, 2 * treeType, s);
    s.blockTrees[2 * treeType + 1] = offset;
    var /** number */ blockLengthAlphabetSize = 26;
    offset += readHuffmanCode(blockLengthAlphabetSize, blockLengthAlphabetSize, s.blockTrees, 2 * treeType + 1, s);
    s.blockTrees[2 * treeType + 2] = offset;
    return readBlockLength(s.blockTrees, 2 * treeType + 1, s);
  }
  /**
   * @param {!State} s
   * @param {number} alphabetSizeLimit
   * @return {void}
   */
  function calculateDistanceLut(s, alphabetSizeLimit) {
    var /** !Int8Array */ distExtraBits = s.distExtraBits;
    var /** !Int32Array */ distOffset = s.distOffset;
    var /** number */ npostfix = s.distancePostfixBits;
    var /** number */ ndirect = s.numDirectDistanceCodes;
    var /** number */ postfix = 1 << npostfix;
    var /** number */ bits = 1;
    var /** number */ half = 0;
    var /** number */ i = 16;
    for (var /** number */ j = 0; j < ndirect; ++j) {
      distExtraBits[i] = 0;
      distOffset[i] = j + 1;
      ++i;
    }
    while (i < alphabetSizeLimit) {
      var /** number */ base = ndirect + ((((2 + half) << bits) - 4) << npostfix) + 1;
      for (var /** number */ j = 0; j < postfix; ++j) {
        distExtraBits[i] = bits;
        distOffset[i] = base + j;
        ++i;
      }
      bits = bits + half;
      half = half ^ 1;
    }
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function readMetablockHuffmanCodesAndContextMaps(s) {
    s.numLiteralBlockTypes = decodeVarLenUnsignedByte(s) + 1;
    s.literalBlockLength = readMetablockPartition(s, 0, s.numLiteralBlockTypes);
    s.numCommandBlockTypes = decodeVarLenUnsignedByte(s) + 1;
    s.commandBlockLength = readMetablockPartition(s, 1, s.numCommandBlockTypes);
    s.numDistanceBlockTypes = decodeVarLenUnsignedByte(s) + 1;
    s.distanceBlockLength = readMetablockPartition(s, 2, s.numDistanceBlockTypes);
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    s.distancePostfixBits = readFewBits(s, 2);
    s.numDirectDistanceCodes = readFewBits(s, 4) << s.distancePostfixBits;
    s.distancePostfixMask = (1 << s.distancePostfixBits) - 1;
    s.contextModes = new Int8Array(s.numLiteralBlockTypes);
    for (var /** number */ i = 0; i < s.numLiteralBlockTypes; ) {
      var /** number */ limit = min(i + 96, s.numLiteralBlockTypes);
      for (; i < limit; ++i) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        s.contextModes[i] = readFewBits(s, 2);
      }
      if (s.halfOffset > 2030) {
        doReadMoreInput(s);
      }
    }
    s.contextMap = new Int8Array(s.numLiteralBlockTypes << 6);
    var /** number */ numLiteralTrees = decodeContextMap(s.numLiteralBlockTypes << 6, s.contextMap, s);
    s.trivialLiteralContext = 1;
    for (var /** number */ j = 0; j < s.numLiteralBlockTypes << 6; j++) {
      if (s.contextMap[j] != j >> 6) {
        s.trivialLiteralContext = 0;
        break;
      }
    }
    s.distContextMap = new Int8Array(s.numDistanceBlockTypes << 2);
    var /** number */ numDistTrees = decodeContextMap(s.numDistanceBlockTypes << 2, s.distContextMap, s);
    s.literalTreeGroup = decodeHuffmanTreeGroup(256, 256, numLiteralTrees, s);
    s.commandTreeGroup = decodeHuffmanTreeGroup(704, 704, s.numCommandBlockTypes, s);
    var /** number */ distanceAlphabetSizeMax = calculateDistanceAlphabetSize(s.distancePostfixBits, s.numDirectDistanceCodes, 24);
    var /** number */ distanceAlphabetSizeLimit = distanceAlphabetSizeMax;
    if (s.isLargeWindow == 1) {
      distanceAlphabetSizeMax = calculateDistanceAlphabetSize(s.distancePostfixBits, s.numDirectDistanceCodes, 62);
      distanceAlphabetSizeLimit = calculateDistanceAlphabetLimit(0x7FFFFFFC, s.distancePostfixBits, s.numDirectDistanceCodes);
    }
    s.distanceTreeGroup = decodeHuffmanTreeGroup(distanceAlphabetSizeMax, distanceAlphabetSizeLimit, numDistTrees, s);
    calculateDistanceLut(s, distanceAlphabetSizeLimit);
    s.contextMapSlice = 0;
    s.distContextMapSlice = 0;
    s.contextLookupOffset1 = s.contextModes[0] * 512;
    s.contextLookupOffset2 = s.contextLookupOffset1 + 256;
    s.literalTreeIdx = 0;
    s.commandTreeIdx = 0;
    s.rings[4] = 1;
    s.rings[5] = 0;
    s.rings[6] = 1;
    s.rings[7] = 0;
    s.rings[8] = 1;
    s.rings[9] = 0;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function copyUncompressedData(s) {
    var /** !Int8Array */ ringBuffer = s.ringBuffer;
    if (s.metaBlockLength <= 0) {
      reload(s);
      s.runningState = 2;
      return;
    }
    var /** number */ chunkLength = min(s.ringBufferSize - s.pos, s.metaBlockLength);
    copyBytes(s, ringBuffer, s.pos, chunkLength);
    s.metaBlockLength -= chunkLength;
    s.pos += chunkLength;
    if (s.pos == s.ringBufferSize) {
      s.nextRunningState = 6;
      s.runningState = 12;
      return;
    }
    reload(s);
    s.runningState = 2;
  }
  /**
   * @param {!State} s
   * @return {number}
   */
  function writeRingBuffer(s) {
    var /** number */ toWrite = min(s.outputLength - s.outputUsed, s.ringBufferBytesReady - s.ringBufferBytesWritten);
    if (toWrite != 0) {
      s.output.set(s.ringBuffer.subarray(s.ringBufferBytesWritten, s.ringBufferBytesWritten + toWrite), s.outputOffset + s.outputUsed);
      s.outputUsed += toWrite;
      s.ringBufferBytesWritten += toWrite;
    }
    if (s.outputUsed < s.outputLength) {
      return 1;
    } else {
      return 0;
    }
  }
  /**
   * @param {number} alphabetSizeMax
   * @param {number} alphabetSizeLimit
   * @param {number} n
   * @param {!State} s
   * @return {!Int32Array}
   */
  function decodeHuffmanTreeGroup(alphabetSizeMax, alphabetSizeLimit, n, s) {
    var /** number */ maxTableSize = MAX_HUFFMAN_TABLE_SIZE[(alphabetSizeLimit + 31) >> 5];
    var /** !Int32Array */ group = new Int32Array(n + n * maxTableSize);
    var /** number */ next = n;
    for (var /** number */ i = 0; i < n; ++i) {
      group[i] = next;
      next += readHuffmanCode(alphabetSizeMax, alphabetSizeLimit, group, i, s);
    }
    return group;
  }
  /**
   * @param {!State} s
   * @return {number}
   */
  function calculateFence(s) {
    var /** number */ result = s.ringBufferSize;
    if (s.isEager != 0) {
      result = min(result, s.ringBufferBytesWritten + s.outputLength - s.outputUsed);
    }
    return result;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function decompress(s) {
    if (s.runningState == 0) {
      throw "Can't decompress until initialized";
    }
    if (s.runningState == 11) {
      throw "Can't decompress after close";
    }
    if (s.runningState == 1) {
      var /** number */ windowBits = decodeWindowBits(s);
      if (windowBits == -1) {
        throw "Invalid 'windowBits' code";
      }
      s.maxRingBufferSize = 1 << windowBits;
      s.maxBackwardDistance = s.maxRingBufferSize - 16;
      s.runningState = 2;
    }
    var /** number */ fence = calculateFence(s);
    var /** number */ ringBufferMask = s.ringBufferSize - 1;
    var /** !Int8Array */ ringBuffer = s.ringBuffer;
    while (s.runningState != 10) {
      switch(s.runningState) {
        case 2:
          if (s.metaBlockLength < 0) {
            throw "Invalid metablock length";
          }
          readNextMetablockHeader(s);
          fence = calculateFence(s);
          ringBufferMask = s.ringBufferSize - 1;
          ringBuffer = s.ringBuffer;
          continue;
        case 3:
          readMetablockHuffmanCodesAndContextMaps(s);
          s.runningState = 4;
        case 4:
          if (s.metaBlockLength <= 0) {
            s.runningState = 2;
            continue;
          }
          if (s.halfOffset > 2030) {
            doReadMoreInput(s);
          }
          if (s.commandBlockLength == 0) {
            decodeCommandBlockSwitch(s);
          }
          s.commandBlockLength--;
          if (s.bitOffset >= 16) {
            s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
            s.bitOffset -= 16;
          }
          var /** number */ cmdCode = readSymbol(s.commandTreeGroup, s.commandTreeIdx, s) << 2;
          var /** number */ insertAndCopyExtraBits = CMD_LOOKUP[cmdCode];
          var /** number */ insertLengthOffset = CMD_LOOKUP[cmdCode + 1];
          var /** number */ copyLengthOffset = CMD_LOOKUP[cmdCode + 2];
          s.distanceCode = CMD_LOOKUP[cmdCode + 3];
          if (s.bitOffset >= 16) {
            s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
            s.bitOffset -= 16;
          }
          var /** number */ extraBits = insertAndCopyExtraBits & 0xFF;
          s.insertLength = insertLengthOffset + ((extraBits <= 16) ? readFewBits(s, extraBits) : readManyBits(s, extraBits));
          if (s.bitOffset >= 16) {
            s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
            s.bitOffset -= 16;
          }
          var /** number */ extraBits = insertAndCopyExtraBits >> 8;
          s.copyLength = copyLengthOffset + ((extraBits <= 16) ? readFewBits(s, extraBits) : readManyBits(s, extraBits));
          s.j = 0;
          s.runningState = 7;
        case 7:
          if (s.trivialLiteralContext != 0) {
            while (s.j < s.insertLength) {
              if (s.halfOffset > 2030) {
                doReadMoreInput(s);
              }
              if (s.literalBlockLength == 0) {
                decodeLiteralBlockSwitch(s);
              }
              s.literalBlockLength--;
              if (s.bitOffset >= 16) {
                s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
                s.bitOffset -= 16;
              }
              ringBuffer[s.pos] = readSymbol(s.literalTreeGroup, s.literalTreeIdx, s);
              s.pos++;
              s.j++;
              if (s.pos >= fence) {
                s.nextRunningState = 7;
                s.runningState = 12;
                break;
              }
            }
          } else {
            var /** number */ prevByte1 = ringBuffer[(s.pos - 1) & ringBufferMask] & 0xFF;
            var /** number */ prevByte2 = ringBuffer[(s.pos - 2) & ringBufferMask] & 0xFF;
            while (s.j < s.insertLength) {
              if (s.halfOffset > 2030) {
                doReadMoreInput(s);
              }
              if (s.literalBlockLength == 0) {
                decodeLiteralBlockSwitch(s);
              }
              var /** number */ literalContext = LOOKUP[s.contextLookupOffset1 + prevByte1] | LOOKUP[s.contextLookupOffset2 + prevByte2];
              var /** number */ literalTreeIdx = s.contextMap[s.contextMapSlice + literalContext] & 0xFF;
              s.literalBlockLength--;
              prevByte2 = prevByte1;
              if (s.bitOffset >= 16) {
                s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
                s.bitOffset -= 16;
              }
              prevByte1 = readSymbol(s.literalTreeGroup, literalTreeIdx, s);
              ringBuffer[s.pos] = prevByte1;
              s.pos++;
              s.j++;
              if (s.pos >= fence) {
                s.nextRunningState = 7;
                s.runningState = 12;
                break;
              }
            }
          }
          if (s.runningState != 7) {
            continue;
          }
          s.metaBlockLength -= s.insertLength;
          if (s.metaBlockLength <= 0) {
            s.runningState = 4;
            continue;
          }
          var /** number */ distanceCode = s.distanceCode;
          if (distanceCode < 0) {
            s.distance = s.rings[s.distRbIdx];
          } else {
            if (s.halfOffset > 2030) {
              doReadMoreInput(s);
            }
            if (s.distanceBlockLength == 0) {
              decodeDistanceBlockSwitch(s);
            }
            s.distanceBlockLength--;
            if (s.bitOffset >= 16) {
              s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
              s.bitOffset -= 16;
            }
            var /** number */ distTreeIdx = s.distContextMap[s.distContextMapSlice + distanceCode] & 0xFF;
            distanceCode = readSymbol(s.distanceTreeGroup, distTreeIdx, s);
            if (distanceCode < 16) {
              var /** number */ index = (s.distRbIdx + DISTANCE_SHORT_CODE_INDEX_OFFSET[distanceCode]) & 0x3;
              s.distance = s.rings[index] + DISTANCE_SHORT_CODE_VALUE_OFFSET[distanceCode];
              if (s.distance < 0) {
                throw "Negative distance";
              }
            } else {
              var /** number */ extraBits = s.distExtraBits[distanceCode];
              var /** number */ bits;
              if (s.bitOffset + extraBits <= 32) {
                bits = readFewBits(s, extraBits);
              } else {
                if (s.bitOffset >= 16) {
                  s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
                  s.bitOffset -= 16;
                }
                bits = ((extraBits <= 16) ? readFewBits(s, extraBits) : readManyBits(s, extraBits));
              }
              s.distance = s.distOffset[distanceCode] + (bits << s.distancePostfixBits);
            }
          }
          if (s.maxDistance != s.maxBackwardDistance && s.pos < s.maxBackwardDistance) {
            s.maxDistance = s.pos;
          } else {
            s.maxDistance = s.maxBackwardDistance;
          }
          if (s.distance > s.maxDistance) {
            s.runningState = 9;
            continue;
          }
          if (distanceCode > 0) {
            s.distRbIdx = (s.distRbIdx + 1) & 0x3;
            s.rings[s.distRbIdx] = s.distance;
          }
          if (s.copyLength > s.metaBlockLength) {
            throw "Invalid backward reference";
          }
          s.j = 0;
          s.runningState = 8;
        case 8:
          var /** number */ src = (s.pos - s.distance) & ringBufferMask;
          var /** number */ dst = s.pos;
          var /** number */ copyLength = s.copyLength - s.j;
          var /** number */ srcEnd = src + copyLength;
          var /** number */ dstEnd = dst + copyLength;
          if ((srcEnd < ringBufferMask) && (dstEnd < ringBufferMask)) {
            if (copyLength < 12 || (srcEnd > dst && dstEnd > src)) {
              for (var /** number */ k = 0; k < copyLength; k += 4) {
                ringBuffer[dst++] = ringBuffer[src++];
                ringBuffer[dst++] = ringBuffer[src++];
                ringBuffer[dst++] = ringBuffer[src++];
                ringBuffer[dst++] = ringBuffer[src++];
              }
            } else {
              ringBuffer.copyWithin(dst, src, srcEnd);
            }
            s.j += copyLength;
            s.metaBlockLength -= copyLength;
            s.pos += copyLength;
          } else {
            for (; s.j < s.copyLength; ) {
              ringBuffer[s.pos] = ringBuffer[(s.pos - s.distance) & ringBufferMask];
              s.metaBlockLength--;
              s.pos++;
              s.j++;
              if (s.pos >= fence) {
                s.nextRunningState = 8;
                s.runningState = 12;
                break;
              }
            }
          }
          if (s.runningState == 8) {
            s.runningState = 4;
          }
          continue;
        case 9:
          if (s.distance > 0x7FFFFFFC) {
            throw "Invalid backward reference";
          }
          if (s.copyLength >= 4 && s.copyLength <= 24) {
            var /** number */ offset = DICTIONARY_OFFSETS_BY_LENGTH[s.copyLength];
            var /** number */ wordId = s.distance - s.maxDistance - 1;
            var /** number */ shift = DICTIONARY_SIZE_BITS_BY_LENGTH[s.copyLength];
            var /** number */ mask = (1 << shift) - 1;
            var /** number */ wordIdx = wordId & mask;
            var /** number */ transformIdx = wordId >>> shift;
            offset += wordIdx * s.copyLength;
            if (transformIdx < 121) {
              var /** number */ len = transformDictionaryWord(ringBuffer, s.pos, DICTIONARY_DATA, offset, s.copyLength, RFC_TRANSFORMS, transformIdx);
              s.pos += len;
              s.metaBlockLength -= len;
              if (s.pos >= fence) {
                s.nextRunningState = 4;
                s.runningState = 12;
                continue;
              }
            } else {
              throw "Invalid backward reference";
            }
          } else {
            throw "Invalid backward reference";
          }
          s.runningState = 4;
          continue;
        case 5:
          while (s.metaBlockLength > 0) {
            if (s.halfOffset > 2030) {
              doReadMoreInput(s);
            }
            if (s.bitOffset >= 16) {
              s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
              s.bitOffset -= 16;
            }
            readFewBits(s, 8);
            s.metaBlockLength--;
          }
          s.runningState = 2;
          continue;
        case 6:
          copyUncompressedData(s);
          continue;
        case 12:
          s.ringBufferBytesReady = min(s.pos, s.ringBufferSize);
          s.runningState = 13;
        case 13:
          if (writeRingBuffer(s) == 0) {
            return;
          }
          if (s.pos >= s.maxBackwardDistance) {
            s.maxDistance = s.maxBackwardDistance;
          }
          if (s.pos >= s.ringBufferSize) {
            if (s.pos > s.ringBufferSize) {
              ringBuffer.copyWithin(0, s.ringBufferSize, s.pos);
            }
            s.pos &= ringBufferMask;
            s.ringBufferBytesWritten = 0;
          }
          s.runningState = s.nextRunningState;
          continue;
        default:
          throw "Unexpected state " + s.runningState;
      }
    }
    if (s.runningState == 10) {
      if (s.metaBlockLength < 0) {
        throw "Invalid metablock length";
      }
      jumpToByteBoundary(s);
      checkHealth(s, 1);
    }
  }

  /**
   * @constructor
   * @param {number} numTransforms
   * @param {number} prefixSuffixLen
   * @param {number} prefixSuffixCount
   * @struct
   */
  function Transforms(numTransforms, prefixSuffixLen, prefixSuffixCount) {
    /** @type {!number} */
    this.numTransforms = 0;
    /** @type {!Int32Array} */
    this.triplets = new Int32Array(0);
    /** @type {!Int8Array} */
    this.prefixSuffixStorage = new Int8Array(0);
    /** @type {!Int32Array} */
    this.prefixSuffixHeads = new Int32Array(0);
    /** @type {!Int16Array} */
    this.params = new Int16Array(0);
    this.numTransforms = numTransforms;
    this.triplets = new Int32Array(numTransforms * 3);
    this.params = new Int16Array(numTransforms);
    this.prefixSuffixStorage = new Int8Array(prefixSuffixLen);
    this.prefixSuffixHeads = new Int32Array(prefixSuffixCount + 1);
  }

  var RFC_TRANSFORMS = new Transforms(121, 167, 50);
  /**
   * @param {!Int8Array} prefixSuffix
   * @param {!Int32Array} prefixSuffixHeads
   * @param {!Int32Array} transforms
   * @param {!string} prefixSuffixSrc
   * @param {!string} transformsSrc
   * @return {void}
   */
  function unpackTransforms(prefixSuffix, prefixSuffixHeads, transforms, prefixSuffixSrc, transformsSrc) {
    var /** number */ n = prefixSuffixSrc.length;
    var /** number */ index = 1;
    var /** number */ j = 0;
    for (var /** number */ i = 0; i < n; ++i) {
      var /** number */ c = prefixSuffixSrc.charCodeAt(i);
      if (c == 35) {
        prefixSuffixHeads[index++] = j;
      } else {
        prefixSuffix[j++] = c;
      }
    }
    for (var /** number */ i = 0; i < 363; ++i) {
      transforms[i] = transformsSrc.charCodeAt(i) - 32;
    }
  }
  {
    unpackTransforms(RFC_TRANSFORMS.prefixSuffixStorage, RFC_TRANSFORMS.prefixSuffixHeads, RFC_TRANSFORMS.triplets, "# #s #, #e #.# the #.com/#\u00C2\u00A0# of # and # in # to #\"#\">#\n#]# for # a # that #. # with #'# from # by #. The # on # as # is #ing #\n\t#:#ed #(# at #ly #=\"# of the #. This #,# not #er #al #='#ful #ive #less #est #ize #ous #", "     !! ! ,  *!  &!  \" !  ) *   * -  ! # !  #!*!  +  ,$ !  -  %  .  / #   0  1 .  \"   2  3!*   4%  ! # /   5  6  7  8 0  1 &   $   9 +   :  ;  < '  !=  >  ?! 4  @ 4  2  &   A *# (   B  C& ) %  ) !*# *-% A +! *.  D! %'  & E *6  F  G% ! *A *%  H! D  I!+!  J!+   K +- *4! A  L!*4  M  N +6  O!*% +.! K *G  P +%(  ! G *D +D  Q +# *K!*G!+D!+# +G +A +4!+% +K!+4!*D!+K!*K");
  }
  /**
   * @param {!Int8Array} dst
   * @param {number} dstOffset
   * @param {!Int8Array} src
   * @param {number} srcOffset
   * @param {number} len
   * @param {!Transforms} transforms
   * @param {number} transformIndex
   * @return {number}
   */
  function transformDictionaryWord(dst, dstOffset, src, srcOffset, len, transforms, transformIndex) {
    var /** number */ offset = dstOffset;
    var /** !Int32Array */ triplets = transforms.triplets;
    var /** !Int8Array */ prefixSuffixStorage = transforms.prefixSuffixStorage;
    var /** !Int32Array */ prefixSuffixHeads = transforms.prefixSuffixHeads;
    var /** number */ transformOffset = 3 * transformIndex;
    var /** number */ prefixIdx = triplets[transformOffset];
    var /** number */ transformType = triplets[transformOffset + 1];
    var /** number */ suffixIdx = triplets[transformOffset + 2];
    var /** number */ prefix = prefixSuffixHeads[prefixIdx];
    var /** number */ prefixEnd = prefixSuffixHeads[prefixIdx + 1];
    var /** number */ suffix = prefixSuffixHeads[suffixIdx];
    var /** number */ suffixEnd = prefixSuffixHeads[suffixIdx + 1];
    var /** number */ omitFirst = transformType - 11;
    var /** number */ omitLast = transformType - 0;
    if (omitFirst < 1 || omitFirst > 9) {
      omitFirst = 0;
    }
    if (omitLast < 1 || omitLast > 9) {
      omitLast = 0;
    }
    while (prefix != prefixEnd) {
      dst[offset++] = prefixSuffixStorage[prefix++];
    }
    if (omitFirst > len) {
      omitFirst = len;
    }
    srcOffset += omitFirst;
    len -= omitFirst;
    len -= omitLast;
    var /** number */ i = len;
    while (i > 0) {
      dst[offset++] = src[srcOffset++];
      i--;
    }
    if (transformType == 10 || transformType == 11) {
      var /** number */ uppercaseOffset = offset - len;
      if (transformType == 10) {
        len = 1;
      }
      while (len > 0) {
        var /** number */ c0 = dst[uppercaseOffset] & 0xFF;
        if (c0 < 0xC0) {
          if (c0 >= 97 && c0 <= 122) {
            dst[uppercaseOffset] ^= 32;
          }
          uppercaseOffset += 1;
          len -= 1;
        } else if (c0 < 0xE0) {
          dst[uppercaseOffset + 1] ^= 32;
          uppercaseOffset += 2;
          len -= 2;
        } else {
          dst[uppercaseOffset + 2] ^= 5;
          uppercaseOffset += 3;
          len -= 3;
        }
      }
    } else if (transformType == 21 || transformType == 22) {
      var /** number */ shiftOffset = offset - len;
      var /** number */ param = transforms.params[transformIndex];
      var /** number */ scalar = (param & 0x7FFF) + (0x1000000 - (param & 0x8000));
      while (len > 0) {
        var /** number */ step = 1;
        var /** number */ c0 = dst[shiftOffset] & 0xFF;
        if (c0 < 0x80) {
          scalar += c0;
          dst[shiftOffset] = (scalar & 0x7F);
        } else if (c0 < 0xC0) {
        } else if (c0 < 0xE0) {
          if (len >= 2) {
            var /** number */ c1 = dst[shiftOffset + 1];
            scalar += (c1 & 0x3F) | ((c0 & 0x1F) << 6);
            dst[shiftOffset] = (0xC0 | ((scalar >> 6) & 0x1F));
            dst[shiftOffset + 1] = ((c1 & 0xC0) | (scalar & 0x3F));
            step = 2;
          } else {
            step = len;
          }
        } else if (c0 < 0xF0) {
          if (len >= 3) {
            var /** number */ c1 = dst[shiftOffset + 1];
            var /** number */ c2 = dst[shiftOffset + 2];
            scalar += (c2 & 0x3F) | ((c1 & 0x3F) << 6) | ((c0 & 0x0F) << 12);
            dst[shiftOffset] = (0xE0 | ((scalar >> 12) & 0x0F));
            dst[shiftOffset + 1] = ((c1 & 0xC0) | ((scalar >> 6) & 0x3F));
            dst[shiftOffset + 2] = ((c2 & 0xC0) | (scalar & 0x3F));
            step = 3;
          } else {
            step = len;
          }
        } else if (c0 < 0xF8) {
          if (len >= 4) {
            var /** number */ c1 = dst[shiftOffset + 1];
            var /** number */ c2 = dst[shiftOffset + 2];
            var /** number */ c3 = dst[shiftOffset + 3];
            scalar += (c3 & 0x3F) | ((c2 & 0x3F) << 6) | ((c1 & 0x3F) << 12) | ((c0 & 0x07) << 18);
            dst[shiftOffset] = (0xF0 | ((scalar >> 18) & 0x07));
            dst[shiftOffset + 1] = ((c1 & 0xC0) | ((scalar >> 12) & 0x3F));
            dst[shiftOffset + 2] = ((c2 & 0xC0) | ((scalar >> 6) & 0x3F));
            dst[shiftOffset + 3] = ((c3 & 0xC0) | (scalar & 0x3F));
            step = 4;
          } else {
            step = len;
          }
        }
        shiftOffset += step;
        len -= step;
        if (transformType == 21) {
          len = 0;
        }
      }
    }
    while (suffix != suffixEnd) {
      dst[offset++] = prefixSuffixStorage[suffix++];
    }
    return offset - dstOffset;
  }

  /**
   * @param {number} key
   * @param {number} len
   * @return {number}
   */
  function getNextKey(key, len) {
    var /** number */ step = 1 << (len - 1);
    while ((key & step) != 0) {
      step >>= 1;
    }
    return (key & (step - 1)) + step;
  }
  /**
   * @param {!Int32Array} table
   * @param {number} offset
   * @param {number} step
   * @param {number} end
   * @param {number} item
   * @return {void}
   */
  function replicateValue(table, offset, step, end, item) {
    do {
      end -= step;
      table[offset + end] = item;
    } while (end > 0);
  }
  /**
   * @param {!Int32Array} count
   * @param {number} len
   * @param {number} rootBits
   * @return {number}
   */
  function nextTableBitSize(count, len, rootBits) {
    var /** number */ left = 1 << (len - rootBits);
    while (len < 15) {
      left -= count[len];
      if (left <= 0) {
        break;
      }
      len++;
      left <<= 1;
    }
    return len - rootBits;
  }
  /**
   * @param {!Int32Array} tableGroup
   * @param {number} tableIdx
   * @param {number} rootBits
   * @param {!Int32Array} codeLengths
   * @param {number} codeLengthsSize
   * @return {number}
   */
  function buildHuffmanTable(tableGroup, tableIdx, rootBits, codeLengths, codeLengthsSize) {
    var /** number */ tableOffset = tableGroup[tableIdx];
    var /** number */ key;
    var /** !Int32Array */ sorted = new Int32Array(codeLengthsSize);
    var /** !Int32Array */ count = new Int32Array(16);
    var /** !Int32Array */ offset = new Int32Array(16);
    var /** number */ symbol;
    for (symbol = 0; symbol < codeLengthsSize; symbol++) {
      count[codeLengths[symbol]]++;
    }
    offset[1] = 0;
    for (var /** number */ len = 1; len < 15; len++) {
      offset[len + 1] = offset[len] + count[len];
    }
    for (symbol = 0; symbol < codeLengthsSize; symbol++) {
      if (codeLengths[symbol] != 0) {
        sorted[offset[codeLengths[symbol]]++] = symbol;
      }
    }
    var /** number */ tableBits = rootBits;
    var /** number */ tableSize = 1 << tableBits;
    var /** number */ totalSize = tableSize;
    if (offset[15] == 1) {
      for (key = 0; key < totalSize; key++) {
        tableGroup[tableOffset + key] = sorted[0];
      }
      return totalSize;
    }
    key = 0;
    symbol = 0;
    for (var /** number */ len = 1, step = 2; len <= rootBits; len++, step <<= 1) {
      for (; count[len] > 0; count[len]--) {
        replicateValue(tableGroup, tableOffset + key, step, tableSize, len << 16 | sorted[symbol++]);
        key = getNextKey(key, len);
      }
    }
    var /** number */ mask = totalSize - 1;
    var /** number */ low = -1;
    var /** number */ currentOffset = tableOffset;
    for (var /** number */ len = rootBits + 1, step = 2; len <= 15; len++, step <<= 1) {
      for (; count[len] > 0; count[len]--) {
        if ((key & mask) != low) {
          currentOffset += tableSize;
          tableBits = nextTableBitSize(count, len, rootBits);
          tableSize = 1 << tableBits;
          totalSize += tableSize;
          low = key & mask;
          tableGroup[tableOffset + low] = (tableBits + rootBits) << 16 | (currentOffset - tableOffset - low);
        }
        replicateValue(tableGroup, currentOffset + (key >> rootBits), step, tableSize, (len - rootBits) << 16 | sorted[symbol++]);
        key = getNextKey(key, len);
      }
    }
    return totalSize;
  }

  /**
   * @param {!State} s
   * @return {void}
   */
  function doReadMoreInput(s) {
    if (s.endOfStreamReached != 0) {
      if (halfAvailable(s) >= -2) {
        return;
      }
      throw "No more input";
    }
    var /** number */ readOffset = s.halfOffset << 1;
    var /** number */ bytesInBuffer = 4096 - readOffset;
    s.byteBuffer.copyWithin(0, readOffset, 4096);
    s.halfOffset = 0;
    while (bytesInBuffer < 4096) {
      var /** number */ spaceLeft = 4096 - bytesInBuffer;
      var /** number */ len = readInput(s.input, s.byteBuffer, bytesInBuffer, spaceLeft);
      if (len <= 0) {
        s.endOfStreamReached = 1;
        s.tailBytes = bytesInBuffer;
        bytesInBuffer += 1;
        break;
      }
      bytesInBuffer += len;
    }
    bytesToNibbles(s, bytesInBuffer);
  }
  /**
   * @param {!State} s
   * @param {number} endOfStream
   * @return {void}
   */
  function checkHealth(s, endOfStream) {
    if (s.endOfStreamReached == 0) {
      return;
    }
    var /** number */ byteOffset = (s.halfOffset << 1) + ((s.bitOffset + 7) >> 3) - 4;
    if (byteOffset > s.tailBytes) {
      throw "Read after end";
    }
    if ((endOfStream != 0) && (byteOffset != s.tailBytes)) {
      throw "Unused bytes after end";
    }
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function assertAccumulatorHealthy(s) {
    if (s.bitOffset > 32) {
      throw "Accumulator underloaded: " + s.bitOffset;
    }
  }
  /**
   * @param {!State} s
   * @param {number} n
   * @return {number}
   */
  function readFewBits(s, n) {
    var /** number */ val = (s.accumulator32 >>> s.bitOffset) & ((1 << n) - 1);
    s.bitOffset += n;
    return val;
  }
  /**
   * @param {!State} s
   * @param {number} n
   * @return {number}
   */
  function readManyBits(s, n) {
    var /** number */ low = readFewBits(s, 16);
    s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
    s.bitOffset -= 16;
    return low | (readFewBits(s, n - 16) << 16);
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function initBitReader(s) {
    s.byteBuffer = new Int8Array(4160);
    s.accumulator32 = 0;
    s.shortBuffer = new Int16Array(2080);
    s.bitOffset = 32;
    s.halfOffset = 2048;
    s.endOfStreamReached = 0;
    prepare(s);
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function prepare(s) {
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    checkHealth(s, 0);
    s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
    s.bitOffset -= 16;
    s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
    s.bitOffset -= 16;
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function reload(s) {
    if (s.bitOffset == 32) {
      prepare(s);
    }
  }
  /**
   * @param {!State} s
   * @return {void}
   */
  function jumpToByteBoundary(s) {
    var /** number */ padding = (32 - s.bitOffset) & 7;
    if (padding != 0) {
      var /** number */ paddingBits = readFewBits(s, padding);
      if (paddingBits != 0) {
        throw "Corrupted padding bits";
      }
    }
  }
  /**
   * @param {!State} s
   * @return {number}
   */
  function halfAvailable(s) {
    var /** number */ limit = 2048;
    if (s.endOfStreamReached != 0) {
      limit = (s.tailBytes + 1) >> 1;
    }
    return limit - s.halfOffset;
  }
  /**
   * @param {!State} s
   * @param {!Int8Array} data
   * @param {number} offset
   * @param {number} length
   * @return {void}
   */
  function copyBytes(s, data, offset, length) {
    if ((s.bitOffset & 7) != 0) {
      throw "Unaligned copyBytes";
    }
    while ((s.bitOffset != 32) && (length != 0)) {
      data[offset++] = (s.accumulator32 >>> s.bitOffset);
      s.bitOffset += 8;
      length--;
    }
    if (length == 0) {
      return;
    }
    var /** number */ copyNibbles = min(halfAvailable(s), length >> 1);
    if (copyNibbles > 0) {
      var /** number */ readOffset = s.halfOffset << 1;
      var /** number */ delta = copyNibbles << 1;
      data.set(s.byteBuffer.subarray(readOffset, readOffset + delta), offset);
      offset += delta;
      length -= delta;
      s.halfOffset += copyNibbles;
    }
    if (length == 0) {
      return;
    }
    if (halfAvailable(s) > 0) {
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      while (length != 0) {
        data[offset++] = (s.accumulator32 >>> s.bitOffset);
        s.bitOffset += 8;
        length--;
      }
      checkHealth(s, 0);
      return;
    }
    while (length > 0) {
      var /** number */ len = readInput(s.input, data, offset, length);
      if (len == -1) {
        throw "Unexpected end of input";
      }
      offset += len;
      length -= len;
    }
  }
  /**
   * @param {!State} s
   * @param {number} byteLen
   * @return {void}
   */
  function bytesToNibbles(s, byteLen) {
    var /** !Int8Array */ byteBuffer = s.byteBuffer;
    var /** number */ halfLen = byteLen >> 1;
    var /** !Int16Array */ shortBuffer = s.shortBuffer;
    for (var /** number */ i = 0; i < halfLen; ++i) {
      shortBuffer[i] = ((byteBuffer[i * 2] & 0xFF) | ((byteBuffer[(i * 2) + 1] & 0xFF) << 8));
    }
  }

  var LOOKUP = new Int32Array(2048);
  /**
   * @param {!Int32Array} lookup
   * @param {!string} map
   * @param {!string} rle
   * @return {void}
   */
  function unpackLookupTable(lookup, map, rle) {
    for (var /** number */ i = 0; i < 256; ++i) {
      lookup[i] = i & 0x3F;
      lookup[512 + i] = i >> 2;
      lookup[1792 + i] = 2 + (i >> 6);
    }
    for (var /** number */ i = 0; i < 128; ++i) {
      lookup[1024 + i] = 4 * (map.charCodeAt(i) - 32);
    }
    for (var /** number */ i = 0; i < 64; ++i) {
      lookup[1152 + i] = i & 1;
      lookup[1216 + i] = 2 + (i & 1);
    }
    var /** number */ offset = 1280;
    for (var /** number */ k = 0; k < 19; ++k) {
      var /** number */ value = k & 3;
      var /** number */ rep = rle.charCodeAt(k) - 32;
      for (var /** number */ i = 0; i < rep; ++i) {
        lookup[offset++] = value;
      }
    }
    for (var /** number */ i = 0; i < 16; ++i) {
      lookup[1792 + i] = 1;
      lookup[2032 + i] = 6;
    }
    lookup[1792] = 0;
    lookup[2047] = 7;
    for (var /** number */ i = 0; i < 256; ++i) {
      lookup[1536 + i] = lookup[1792 + i] << 3;
    }
  }
  {
    unpackLookupTable(LOOKUP, "         !!  !                  \"#$##%#$&'##(#)#++++++++++((&*'##,---,---,-----,-----,-----&#'###.///.///./////./////./////&#'# ", "A/*  ':  & : $  \u0081 @");
  }

  /**
   * @constructor
   * @struct
   */
  function State() {
    /** @type {!Int8Array} */
    this.ringBuffer = new Int8Array(0);
    /** @type {!Int8Array} */
    this.contextModes = new Int8Array(0);
    /** @type {!Int8Array} */
    this.contextMap = new Int8Array(0);
    /** @type {!Int8Array} */
    this.distContextMap = new Int8Array(0);
    /** @type {!Int8Array} */
    this.distExtraBits = new Int8Array(0);
    /** @type {!Int8Array} */
    this.output = new Int8Array(0);
    /** @type {!Int8Array} */
    this.byteBuffer = new Int8Array(0);
    /** @type {!Int16Array} */
    this.shortBuffer = new Int16Array(0);
    /** @type {!Int32Array} */
    this.intBuffer = new Int32Array(0);
    /** @type {!Int32Array} */
    this.rings = new Int32Array(0);
    /** @type {!Int32Array} */
    this.blockTrees = new Int32Array(0);
    /** @type {!Int32Array} */
    this.literalTreeGroup = new Int32Array(0);
    /** @type {!Int32Array} */
    this.commandTreeGroup = new Int32Array(0);
    /** @type {!Int32Array} */
    this.distanceTreeGroup = new Int32Array(0);
    /** @type {!Int32Array} */
    this.distOffset = new Int32Array(0);
    /** @type {!number} */
    this.runningState = 0;
    /** @type {!number} */
    this.nextRunningState = 0;
    /** @type {!number} */
    this.accumulator32 = 0;
    /** @type {!number} */
    this.bitOffset = 0;
    /** @type {!number} */
    this.halfOffset = 0;
    /** @type {!number} */
    this.tailBytes = 0;
    /** @type {!number} */
    this.endOfStreamReached = 0;
    /** @type {!number} */
    this.metaBlockLength = 0;
    /** @type {!number} */
    this.inputEnd = 0;
    /** @type {!number} */
    this.isUncompressed = 0;
    /** @type {!number} */
    this.isMetadata = 0;
    /** @type {!number} */
    this.literalBlockLength = 0;
    /** @type {!number} */
    this.numLiteralBlockTypes = 0;
    /** @type {!number} */
    this.commandBlockLength = 0;
    /** @type {!number} */
    this.numCommandBlockTypes = 0;
    /** @type {!number} */
    this.distanceBlockLength = 0;
    /** @type {!number} */
    this.numDistanceBlockTypes = 0;
    /** @type {!number} */
    this.pos = 0;
    /** @type {!number} */
    this.maxDistance = 0;
    /** @type {!number} */
    this.distRbIdx = 0;
    /** @type {!number} */
    this.trivialLiteralContext = 0;
    /** @type {!number} */
    this.literalTreeIdx = 0;
    /** @type {!number} */
    this.commandTreeIdx = 0;
    /** @type {!number} */
    this.j = 0;
    /** @type {!number} */
    this.insertLength = 0;
    /** @type {!number} */
    this.contextMapSlice = 0;
    /** @type {!number} */
    this.distContextMapSlice = 0;
    /** @type {!number} */
    this.contextLookupOffset1 = 0;
    /** @type {!number} */
    this.contextLookupOffset2 = 0;
    /** @type {!number} */
    this.distanceCode = 0;
    /** @type {!number} */
    this.numDirectDistanceCodes = 0;
    /** @type {!number} */
    this.distancePostfixMask = 0;
    /** @type {!number} */
    this.distancePostfixBits = 0;
    /** @type {!number} */
    this.distance = 0;
    /** @type {!number} */
    this.copyLength = 0;
    /** @type {!number} */
    this.maxBackwardDistance = 0;
    /** @type {!number} */
    this.maxRingBufferSize = 0;
    /** @type {!number} */
    this.ringBufferSize = 0;
    /** @type {!number} */
    this.expectedTotalSize = 0;
    /** @type {!number} */
    this.outputOffset = 0;
    /** @type {!number} */
    this.outputLength = 0;
    /** @type {!number} */
    this.outputUsed = 0;
    /** @type {!number} */
    this.ringBufferBytesWritten = 0;
    /** @type {!number} */
    this.ringBufferBytesReady = 0;
    /** @type {!number} */
    this.isEager = 0;
    /** @type {!number} */
    this.isLargeWindow = 0;
    /** @type {!InputStream|null} */
    this.input = null;
    this.ringBuffer = new Int8Array(0);
    this.rings = new Int32Array(10);
    this.rings[0] = 16;
    this.rings[1] = 15;
    this.rings[2] = 11;
    this.rings[3] = 4;
  }

  /**
   * @param {!Int8Array} dictionary
   * @param {!string} data0
   * @param {!string} data1
   * @param {!string} skipFlip
   * @return {void}
   */
  function unpackDictionaryData(dictionary, data0, data1, skipFlip) {
    var /** !Int8Array */ dict = toUsAsciiBytes(data0 + data1);
    if (dict.length != dictionary.length) {
      throw "Corrupted brotli dictionary";
    }
    var /** number */ offset = 0;
    var /** number */ n = skipFlip.length;
    for (var /** number */ i = 0; i < n; i += 2) {
      var /** number */ skip = skipFlip.charCodeAt(i) - 36;
      var /** number */ flip = skipFlip.charCodeAt(i + 1) - 36;
      offset += skip;
      for (var /** number */ j = 0; j < flip; ++j) {
        dict[offset] |= 0x80;
        offset++;
      }
    }
    dictionary.set(dict);
  }
  {
    var /** !Int8Array */ dictionary = new Int8Array(122784);
    unpackDictionaryData(dictionary, "timedownlifeleftbackcodedatashowonlysitecityopenjustlikefreeworktextyearoverbodyloveformbookplaylivelinehelphomesidemorewordlongthemviewfindpagedaysfullheadtermeachareafromtruemarkableuponhighdatelandnewsevennextcasebothpostusedmadehandherewhatnameLinkblogsizebaseheldmakemainuser') +holdendswithNewsreadweresigntakehavegameseencallpathwellplusmenufilmpartjointhislistgoodneedwayswestjobsmindalsologorichuseslastteamarmyfoodkingwilleastwardbestfirePageknowaway.pngmovethanloadgiveselfnotemuchfeedmanyrockicononcelookhidediedHomerulehostajaxinfoclublawslesshalfsomesuchzone100%onescareTimeracebluefourweekfacehopegavehardlostwhenparkkeptpassshiproomHTMLplanTypedonesavekeepflaglinksoldfivetookratetownjumpthusdarkcardfilefearstaykillthatfallautoever.comtalkshopvotedeepmoderestturnbornbandfellroseurl(skinrolecomeactsagesmeetgold.jpgitemvaryfeltthensenddropViewcopy1.0\"</a>stopelseliestourpack.gifpastcss?graymean&gt;rideshotlatesaidroadvar feeljohnrickportfast'UA-dead</b>poorbilltypeU.S.woodmust2px;Inforankwidewantwalllead[0];paulwavesure$('#waitmassarmsgoesgainlangpaid!-- lockunitrootwalkfirmwifexml\"songtest20pxkindrowstoolfontmailsafestarmapscorerainflowbabyspansays4px;6px;artsfootrealwikiheatsteptriporg/lakeweaktoldFormcastfansbankveryrunsjulytask1px;goalgrewslowedgeid=\"sets5px;.js?40pxif (soonseatnonetubezerosentreedfactintogiftharm18pxcamehillboldzoomvoideasyringfillpeakinitcost3px;jacktagsbitsrolleditknewnear<!--growJSONdutyNamesaleyou lotspainjazzcoldeyesfishwww.risktabsprev10pxrise25pxBlueding300,ballfordearnwildbox.fairlackverspairjunetechif(!pickevil$(\"#warmlorddoespull,000ideadrawhugespotfundburnhrefcellkeystickhourlossfuel12pxsuitdealRSS\"agedgreyGET\"easeaimsgirlaids8px;navygridtips#999warsladycars); }php?helltallwhomzh:e*/\r\n 100hall.\n\nA7px;pushchat0px;crew*/</hash75pxflatrare && tellcampontolaidmissskiptentfinemalegetsplot400,\r\n\r\ncoolfeet.php<br>ericmostguidbelldeschairmathatom/img&#82luckcent000;tinygonehtmlselldrugFREEnodenick?id=losenullvastwindRSS wearrelybeensamedukenasacapewishgulfT23:hitsslotgatekickblurthey15px''););\">msiewinsbirdsortbetaseekT18:ordstreemall60pxfarmb\u0000\u0019sboys[0].');\"POSTbearkids);}}marytend(UK)quadzh:f-siz----prop');\rliftT19:viceandydebt>RSSpoolneckblowT16:doorevalT17:letsfailoralpollnovacolsgene b\u0000\u0014softrometillross<h3>pourfadepink<tr>mini)|!(minezh:hbarshear00);milk -->ironfreddiskwentsoilputs/js/holyT22:ISBNT20:adamsees<h2>json', 'contT21: RSSloopasiamoon</p>soulLINEfortcartT14:<h1>80px!--<9px;T04:mike:46ZniceinchYorkricezh:d'));puremageparatonebond:37Z_of_']);000,zh:gtankyardbowlbush:56ZJava30px\n|}\n%C3%:34ZjeffEXPIcashvisagolfsnowzh:iquer.csssickmeatmin.binddellhirepicsrent:36ZHTTP-201fotowolfEND xbox:54ZBODYdick;\n}\nexit:35Zvarsbeat'});diet999;anne}}</[i].LangkmB2wiretoysaddssealalex;\n\t}echonine.org005)tonyjewssandlegsroof000) 200winegeardogsbootgarycutstyletemption.xmlcockgang$('.50pxPh.Dmiscalanloandeskmileryanunixdisc);}\ndustclip).\n\n70px-200DVDs7]><tapedemoi++)wageeurophiloptsholeFAQsasin-26TlabspetsURL bulkcook;}\r\nHEAD[0])abbrjuan(198leshtwin</i>sonyguysfuckpipe|-\n!002)ndow[1];[];\nLog salt\r\n\t\tbangtrimbath){\r\n00px\n});ko:lfeesad>\rs:// [];tollplug(){\n{\r\n .js'200pdualboat.JPG);\n}quot);\n\n');\n\r\n}\r201420152016201720182019202020212022202320242025202620272028202920302031203220332034203520362037201320122011201020092008200720062005200420032002200120001999199819971996199519941993199219911990198919881987198619851984198319821981198019791978197719761975197419731972197119701969196819671966196519641963196219611960195919581957195619551954195319521951195010001024139400009999comomC!sesteestaperotodohacecadaaC1obiendC-aasC-vidacasootroforosolootracualdijosidograntipotemadebealgoquC)estonadatrespococasabajotodasinoaguapuesunosantediceluisellamayozonaamorpisoobraclicellodioshoracasiP7P0P=P0P>P<Q\u0000P0Q\u0000Q\u0003Q\u0002P0P=P5P?P>P>Q\u0002P8P7P=P>P4P>Q\u0002P>P6P5P>P=P8Q\u0005P\u001DP0P5P5P1Q\u000BP<Q\u000BP\u0012Q\u000BQ\u0001P>P2Q\u000BP2P>P\u001DP>P>P1P\u001FP>P;P8P=P8P P$P\u001DP5P\u001CQ\u000BQ\u0002Q\u000BP\u001EP=P8P<P4P0P\u0017P0P\u0014P0P\u001DQ\u0003P\u001EP1Q\u0002P5P\u0018P7P5P9P=Q\u0003P<P<P\"Q\u000BQ\u0003P6Y\u0001Y\nX#Y\u0006Y\u0005X'Y\u0005X9Y\u0003Y\u0004X#Y\u0008X1X/Y\nX'Y\u0001Y\tY\u0007Y\u0008Y\u0004Y\u0005Y\u0004Y\u0003X'Y\u0008Y\u0004Y\u0007X(X3X'Y\u0004X%Y\u0006Y\u0007Y\nX#Y\nY\u0002X/Y\u0007Y\u0004X+Y\u0005X(Y\u0007Y\u0004Y\u0008Y\u0004Y\nX(Y\u0004X'Y\nX(Y\u0003X4Y\nX'Y\u0005X#Y\u0005Y\u0006X*X(Y\nY\u0004Y\u0006X-X(Y\u0007Y\u0005Y\u0005X4Y\u0008X4firstvideolightworldmediawhitecloseblackrightsmallbooksplacemusicfieldorderpointvalueleveltableboardhousegroupworksyearsstatetodaywaterstartstyledeathpowerphonenighterrorinputabouttermstitletoolseventlocaltimeslargewordsgamesshortspacefocusclearmodelblockguideradiosharewomenagainmoneyimagenamesyounglineslatercolorgreenfront&amp;watchforcepricerulesbeginaftervisitissueareasbelowindextotalhourslabelprintpressbuiltlinksspeedstudytradefoundsenseundershownformsrangeaddedstillmovedtakenaboveflashfixedoftenotherviewschecklegalriveritemsquickshapehumanexistgoingmoviethirdbasicpeacestagewidthloginideaswrotepagesusersdrivestorebreaksouthvoicesitesmonthwherebuildwhichearthforumthreesportpartyClicklowerlivesclasslayerentrystoryusagesoundcourtyour birthpopuptypesapplyImagebeinguppernoteseveryshowsmeansextramatchtrackknownearlybegansuperpapernorthlearngivennamedendedTermspartsGroupbrandusingwomanfalsereadyaudiotakeswhile.com/livedcasesdailychildgreatjudgethoseunitsneverbroadcoastcoverapplefilescyclesceneplansclickwritequeenpieceemailframeolderphotolimitcachecivilscaleenterthemetheretouchboundroyalaskedwholesincestock namefaithheartemptyofferscopeownedmightalbumthinkbloodarraymajortrustcanonunioncountvalidstoneStyleLoginhappyoccurleft:freshquitefilmsgradeneedsurbanfightbasishoverauto;route.htmlmixedfinalYour slidetopicbrownalonedrawnsplitreachRightdatesmarchquotegoodsLinksdoubtasyncthumballowchiefyouthnovel10px;serveuntilhandsCheckSpacequeryjamesequaltwice0,000Startpanelsongsroundeightshiftworthpostsleadsweeksavoidthesemilesplanesmartalphaplantmarksratesplaysclaimsalestextsstarswrong</h3>thing.org/multiheardPowerstandtokensolid(thisbringshipsstafftriedcallsfullyfactsagentThis //-->adminegyptEvent15px;Emailtrue\"crossspentblogsbox\">notedleavechinasizesguest</h4>robotheavytrue,sevengrandcrimesignsawaredancephase><!--en_US&#39;200px_namelatinenjoyajax.ationsmithU.S. holdspeterindianav\">chainscorecomesdoingpriorShare1990sromanlistsjapanfallstrialowneragree</h2>abusealertopera\"-//WcardshillsteamsPhototruthclean.php?saintmetallouismeantproofbriefrow\">genretrucklooksValueFrame.net/-->\n<try {\nvar makescostsplainadultquesttrainlaborhelpscausemagicmotortheir250pxleaststepsCountcouldglasssidesfundshotelawardmouthmovesparisgivesdutchtexasfruitnull,||[];top\">\n<!--POST\"ocean<br/>floorspeakdepth sizebankscatchchart20px;aligndealswould50px;url=\"parksmouseMost ...</amongbrainbody none;basedcarrydraftreferpage_home.meterdelaydreamprovejoint</tr>drugs<!-- aprilidealallenexactforthcodeslogicView seemsblankports (200saved_linkgoalsgrantgreekhomesringsrated30px;whoseparse();\" Blocklinuxjonespixel');\">);if(-leftdavidhorseFocusraiseboxesTrackement</em>bar\">.src=toweralt=\"cablehenry24px;setupitalysharpminortastewantsthis.resetwheelgirls/css/100%;clubsstuffbiblevotes 1000korea});\r\nbandsqueue= {};80px;cking{\r\n\t\taheadclockirishlike ratiostatsForm\"yahoo)[0];Aboutfinds</h1>debugtasksURL =cells})();12px;primetellsturns0x600.jpg\"spainbeachtaxesmicroangel--></giftssteve-linkbody.});\n\tmount (199FAQ</rogerfrankClass28px;feeds<h1><scotttests22px;drink) || lewisshall#039; for lovedwaste00px;ja:c\u0002simon<fontreplymeetsuntercheaptightBrand) != dressclipsroomsonkeymobilmain.Name platefunnytreescom/\"1.jpgwmodeparamSTARTleft idden, 201);\n}\nform.viruschairtransworstPagesitionpatch<!--\no-cacfirmstours,000 asiani++){adobe')[0]id=10both;menu .2.mi.png\"kevincoachChildbruce2.jpgURL)+.jpg|suitesliceharry120\" sweettr>\r\nname=diegopage swiss-->\n\n#fff;\">Log.com\"treatsheet) && 14px;sleepntentfiledja:c\u0003id=\"cName\"worseshots-box-delta\n&lt;bears:48Z<data-rural</a> spendbakershops= \"\";php\">ction13px;brianhellosize=o=%2F joinmaybe<img img\">, fjsimg\" \")[0]MTopBType\"newlyDanskczechtrailknows</h5>faq\">zh-cn10);\n-1\");type=bluestrulydavis.js';>\r\n<!steel you h2>\r\nform jesus100% menu.\r\n\t\r\nwalesrisksumentddingb-likteachgif\" vegasdanskeestishqipsuomisobredesdeentretodospuedeaC1osestC!tienehastaotrospartedondenuevohacerformamismomejormundoaquC-dC-assC3loayudafechatodastantomenosdatosotrassitiomuchoahoralugarmayorestoshorastenerantesfotosestaspaC-snuevasaludforosmedioquienmesespoderchileserC!vecesdecirjosC)estarventagrupohechoellostengoamigocosasnivelgentemismaairesjuliotemashaciafavorjuniolibrepuntobuenoautorabrilbuenatextomarzosaberlistaluegocC3moenerojuegoperC:haberestoynuncamujervalorfueralibrogustaigualvotoscasosguC-apuedosomosavisousteddebennochebuscafaltaeurosseriedichocursoclavecasasleC3nplazolargoobrasvistaapoyojuntotratavistocrearcampohemoscincocargopisosordenhacenC!readiscopedrocercapuedapapelmenorC:tilclarojorgecalleponertardenadiemarcasigueellassiglocochemotosmadreclaserestoniC1oquedapasarbancohijosviajepabloC)stevienereinodejarfondocanalnorteletracausatomarmanoslunesautosvillavendopesartipostengamarcollevapadreunidovamoszonasambosbandamariaabusomuchasubirriojavivirgradochicaallC-jovendichaestantalessalirsuelopesosfinesllamabuscoC)stalleganegroplazahumorpagarjuntadobleislasbolsabaC1ohablaluchaC\u0001readicenjugarnotasvalleallC!cargadolorabajoestC)gustomentemariofirmacostofichaplatahogarartesleyesaquelmuseobasespocosmitadcielochicomiedoganarsantoetapadebesplayaredessietecortecoreadudasdeseoviejodeseaaguas&quot;domaincommonstatuseventsmastersystemactionbannerremovescrollupdateglobalmediumfilternumberchangeresultpublicscreenchoosenormaltravelissuessourcetargetspringmodulemobileswitchphotosborderregionitselfsocialactivecolumnrecordfollowtitle>eitherlengthfamilyfriendlayoutauthorcreatereviewsummerserverplayedplayerexpandpolicyformatdoublepointsseriespersonlivingdesignmonthsforcesuniqueweightpeopleenergynaturesearchfigurehavingcustomoffsetletterwindowsubmitrendergroupsuploadhealthmethodvideosschoolfutureshadowdebatevaluesObjectothersrightsleaguechromesimplenoticesharedendingseasonreportonlinesquarebuttonimagesenablemovinglatestwinterFranceperiodstrongrepeatLondondetailformeddemandsecurepassedtoggleplacesdevicestaticcitiesstreamyellowattackstreetflighthiddeninfo\">openedusefulvalleycausesleadersecretseconddamagesportsexceptratingsignedthingseffectfieldsstatesofficevisualeditorvolumeReportmuseummoviesparentaccessmostlymother\" id=\"marketgroundchancesurveybeforesymbolmomentspeechmotioninsidematterCenterobjectexistsmiddleEuropegrowthlegacymannerenoughcareeransweroriginportalclientselectrandomclosedtopicscomingfatheroptionsimplyraisedescapechosenchurchdefinereasoncorneroutputmemoryiframepolicemodelsNumberduringoffersstyleskilledlistedcalledsilvermargindeletebetterbrowselimitsGlobalsinglewidgetcenterbudgetnowrapcreditclaimsenginesafetychoicespirit-stylespreadmakingneededrussiapleaseextentScriptbrokenallowschargedividefactormember-basedtheoryconfigaroundworkedhelpedChurchimpactshouldalwayslogo\" bottomlist\">){var prefixorangeHeader.push(couplegardenbridgelaunchReviewtakingvisionlittledatingButtonbeautythemesforgotSearchanchoralmostloadedChangereturnstringreloadMobileincomesupplySourceordersviewed&nbsp;courseAbout island<html cookiename=\"amazonmodernadvicein</a>: The dialoghousesBEGIN MexicostartscentreheightaddingIslandassetsEmpireSchooleffortdirectnearlymanualSelect.\n\nOnejoinedmenu\">PhilipawardshandleimportOfficeregardskillsnationSportsdegreeweekly (e.g.behinddoctorloggedunited</b></beginsplantsassistartistissued300px|canadaagencyschemeremainBrazilsamplelogo\">beyond-scaleacceptservedmarineFootercamera</h1>\n_form\"leavesstress\" />\r\n.gif\" onloadloaderOxfordsistersurvivlistenfemaleDesignsize=\"appealtext\">levelsthankshigherforcedanimalanyoneAfricaagreedrecentPeople<br />wonderpricesturned|| {};main\">inlinesundaywrap\">failedcensusminutebeaconquotes150px|estateremoteemail\"linkedright;signalformal1.htmlsignupprincefloat:.png\" forum.AccesspaperssoundsextendHeightsliderUTF-8\"&amp; Before. WithstudioownersmanageprofitjQueryannualparamsboughtfamousgooglelongeri++) {israelsayingdecidehome\">headerensurebranchpiecesblock;statedtop\"><racingresize--&gt;pacitysexualbureau.jpg\" 10,000obtaintitlesamount, Inc.comedymenu\" lyricstoday.indeedcounty_logo.FamilylookedMarketlse ifPlayerturkey);var forestgivingerrorsDomain}else{insertBlog</footerlogin.fasteragents<body 10px 0pragmafridayjuniordollarplacedcoversplugin5,000 page\">boston.test(avatartested_countforumsschemaindex,filledsharesreaderalert(appearSubmitline\">body\">\n* TheThoughseeingjerseyNews</verifyexpertinjurywidth=CookieSTART across_imagethreadnativepocketbox\">\nSystem DavidcancertablesprovedApril reallydriveritem\">more\">boardscolorscampusfirst || [];media.guitarfinishwidth:showedOther .php\" assumelayerswilsonstoresreliefswedenCustomeasily your String\n\nWhiltaylorclear:resortfrenchthough\") + \"<body>buyingbrandsMembername\">oppingsector5px;\">vspacepostermajor coffeemartinmaturehappen</nav>kansaslink\">Images=falsewhile hspace0&amp; \n\nIn  powerPolski-colorjordanBottomStart -count2.htmlnews\">01.jpgOnline-rightmillerseniorISBN 00,000 guidesvalue)ectionrepair.xml\"  rights.html-blockregExp:hoverwithinvirginphones</tr>\rusing \n\tvar >');\n\t</td>\n</tr>\nbahasabrasilgalegomagyarpolskisrpskiX1X/Y\u0008d8-f\u0016\u0007g.\u0000d=\u0013g9\u0001i+\u0014d?!f\u0001/d8-e\u001B=f\u0008\u0011d;,d8\u0000d8*e\u0005,e\u000F8g.!g\u0010\u0006h.:e\u001D\u001Be\u000F/d;%f\u001C\re\n!f\u00176i\u00174d8*d::d:'e\u0013\u0001h\u0007*e71d<\u0001d8\u001Af\u001F%g\u001C\u000Be7%d=\u001Ch\u0001\u0014g3;f2!f\u001C\tg=\u0011g+\u0019f\t\u0000f\u001C\th/\u0004h.:d8-e?\u0003f\u0016\u0007g+ g\u0014(f\u00087i&\u0016i!5d=\u001Ch\u0000\u0005f\n\u0000f\u001C/i\u0017.i\"\u0018g\u001B8e\u00053d8\u000Bh==f\u0010\u001Cg4\"d=?g\u0014(h=/d;6e\u001C(g:?d8;i\"\u0018h5\u0004f\u0016\u0019h'\u0006i\"\u0011e\u001B\u001Ee$\rf3(e\u0006\u000Cg=\u0011g;\u001Cf\u00146h\u0017\u000Fe\u0006\u0005e.9f\u000E(h\r\u0010e8\u0002e\u001C:f6\u0008f\u0001/g):i\u00174e\u000F\u0011e8\u0003d;\u0000d9\u0008e%=e\u000F\u000Bg\u0014\u001Ff4;e\u001B>g\t\u0007e\u000F\u0011e1\u0015e&\u0002f\u001E\u001Cf\t\u000Bf\u001C:f\u00160i\u0017;f\u001C\u0000f\u00160f\u00169e<\u000Fe\u000C\u0017d:,f\u000F\u0010d>\u001Be\u00053d:\u000Ef\u001B4e$\u001Ah?\u0019d8*g3;g;\u001Fg\u001F%i\u0001\u0013f88f\u0008\u000Fe9?e\u0011\ne\u00056d;\u0016e\u000F\u0011h!(e.\te\u0005(g,,d8\u0000d<\u001Ae\u0011\u0018h?\u001Bh!\u000Cg\u00029e\u0007;g\t\u0008f\u001D\u0003g\u00145e-\u0010d8\u0016g\u0015\u000Ch.>h.!e\u0005\rh49f\u0015\u0019h\u00022e\n e\u0005%f4;e\n(d;\u0016d;,e\u0015\u0006e\u0013\u0001e\r\u001Ae.\"g\u000E0e\u001C(d8\nf57e&\u0002d=\u0015e72g;\u000Fg\u0015\u0019h(\u0000h/&g;\u0006g$>e\u000C:g\u0019;e=\u0015f\u001C,g+\u0019i\u001C\u0000h&\u0001d;7f <f\u0014/f\u000C\u0001e\u001B=i\u0019\u0005i\u0013>f\u000E%e\u001B=e.6e;:h.>f\u001C\u000Be\u000F\u000Bi\u0018\u0005h/;f3\u0015e>\u000Bd=\rg=.g;\u000Ff5\u000Ei\u0000\tf\u000B)h?\u0019f 7e=\u0013e\t\re\u0008\u0006g1;f\u000E\u0012h!\u000Ce\u001B d8:d:$f\u0018\u0013f\u001C\u0000e\u0010\u000Ei\u001F3d9\u0010d8\rh\u0003=i\u0000\u001Ah?\u0007h!\u000Cd8\u001Ag'\u0011f\n\u0000e\u000F/h\u0003=h.>e$\u0007e\u0010\u0008d=\u001Ce$'e.6g$>d<\u001Ag \u0014g)6d8\u0013d8\u001Ae\u0005(i\u0003(i!9g\u001B.h?\u0019i\u0007\u000Ch?\u0018f\u0018/e<\u0000e'\u000Bf\u0003\u0005e\u00065g\u00145h\u0004\u0011f\u0016\u0007d;6e\u0013\u0001g\t\u000Ce8.e\n)f\u0016\u0007e\u000C\u0016h5\u0004f:\u0010e$'e-&e-&d9 e\u001C0e\u001D\u0000f5\u000Fh'\u0008f\n\u0015h5\u0004e7%g(\u000Bh&\u0001f1\u0002f\u0000\u000Ed9\u0008f\u00176e\u0000\u0019e\n\u001Fh\u0003=d8;h&\u0001g\u001B.e\t\rh5\u0004h./e\u001F\u000Ee8\u0002f\u00169f3\u0015g\u00145e=1f\u000B\u001Bh\u0001\u0018e#0f\u0018\u000Ed;;d=\u0015e\u0001%e:7f\u00150f\r.g>\u000Ee\u001B=f1=h=&d;\u000Bg;\rd=\u0006f\u0018/d:$f5\u0001g\u0014\u001Fd:'f\t\u0000d;%g\u00145h/\u001Df\u0018>g$:d8\u0000d:\u001Be\r\u0015d=\rd::e\u0011\u0018e\u0008\u0006f\u001E\u0010e\u001C0e\u001B>f\u0017\u0005f88e7%e\u00057e-&g\u0014\u001Fg3;e\u0008\u0017g=\u0011e\u000F\u000Be8\u0016e-\u0010e/\u0006g \u0001i\"\u0011i\u0001\u0013f\u000E'e\u00086e\u001C0e\u000C:e\u001F:f\u001C,e\u0005(e\u001B=g=\u0011d8\ni\u0007\rh&\u0001g,,d:\u000Ce\u0016\u001Cf,\"h?\u001Be\u0005%e\u000F\u000Bf\u0003\u0005h?\u0019d:\u001Bh\u0000\u0003h/\u0015e\u000F\u0011g\u000E0e\u001F9h.-d;%d8\nf\u0014?e:\u001Cf\u0008\u0010d8:g\u000E/e\"\u0003i&\u0019f8/e\u0010\u000Cf\u00176e(1d9\u0010e\u000F\u0011i\u0000\u0001d8\u0000e.\u001Ae<\u0000e\u000F\u0011d=\u001Ce\u0013\u0001f \u0007e\u0007\u0006f,\"h?\u000Eh'#e\u00063e\u001C0f\u00169d8\u0000d8\u000Bd;%e\u000F\nh4#d;;f\u0008\u0016h\u0000\u0005e.\"f\u00087d;#h!(g'/e\u0008\u0006e%3d::f\u00150g \u0001i\u0014\u0000e\u0014.e\u0007:g\u000E0g&;g:?e:\u0014g\u0014(e\u0008\u0017h!(d8\re\u0010\u000Cg<\u0016h>\u0011g;\u001Fh.!f\u001F%h/\"d8\rh&\u0001f\u001C\te\u00053f\u001C:f\u001E\u0004e>\u0008e$\u001Af\u0012-f\u0014>g;\u0004g;\u0007f\u0014?g-\u0016g\u001B4f\u000E%h\u0003=e\n\u001Bf\u001D%f:\u0010f\u0019\u0002i\u0016\u0013g\u001C\u000Be\u00080g\u0003-i\u0017(e\u00053i\u0014.d8\u0013e\u000C:i\u001D\u001Ee88h\u000B1h/-g\u0019>e:&e8\u000Cf\u001C\u001Bg>\u000Ee%3f/\u0014h>\u0003g\u001F%h/\u0006h'\u0004e.\u001Ae;:h..i\u0003(i\u0017(f\u0004\u000Fh'\u0001g2>e=)f\u0017%f\u001C,f\u000F\u0010i+\u0018e\u000F\u0011h(\u0000f\u00169i\u001D\"e\u001F:i\u0007\u0011e$\u0004g\u0010\u0006f\u001D\u0003i\u0019\u0010e=1g\t\u0007i\u00136h!\u000Ch?\u0018f\u001C\te\u0008\u0006d:+g\t)e\u0013\u0001g;\u000Fh\u0010%f7;e\n d8\u0013e.6h?\u0019g'\rh/\u001Di\"\u0018h57f\u001D%d8\u001Ae\n!e\u0005,e\u0011\nh.0e=\u0015g.\u0000d;\u000Bh4(i\u0007\u000Fg\u00147d::e=1e\u0013\re<\u0015g\u0014(f\n%e\u0011\ni\u0003(e\u0008\u0006e?+i\u0000\u001Fe\u0012(h/\"f\u00176e0\u001Af3(f\u0004\u000Fg\u00143h/7e-&f !e:\u0014h/%e\u000E\u0006e\u000F2e\u000F*f\u0018/h?\u0014e\u001B\u001Eh4-d90e\u0010\rg'0d8:d:\u0006f\u0008\u0010e\n\u001Fh/4f\u0018\u000Ed>\u001Be:\u0014e-)e-\u0010d8\u0013i\"\u0018g(\u000Be:\u000Fd8\u0000h\u0008,f\u001C\u0003e\u0013!e\u000F*f\u001C\te\u00056e.\u0003d?\u001Df\n$h\u0000\u000Cd8\u0014d;\ne$)g*\u0017e\u000F#e\n(f\u0000\u0001g\n6f\u0000\u0001g\t9e\u0008+h.$d8:e?\u0005i!;f\u001B4f\u00160e0\u000Fh/4f\u0008\u0011e\u0000\u0011d=\u001Cd8:e*\u0012d=\u0013e\u000C\u0005f\u000B,i\u0002#d9\u0008d8\u0000f 7e\u001B=e\u0006\u0005f\u0018/e\u0010&f 9f\r.g\u00145h'\u0006e-&i\u0019\"e\u00057f\u001C\th?\u0007g(\u000Bg\u00141d:\u000Ed::f\t\re\u0007:f\u001D%d8\rh?\u0007f-#e\u001C(f\u0018\u000Ef\u0018\u001Ff\u0015\u0005d:\u000Be\u00053g3;f \u0007i\"\u0018e\u0015\u0006e\n!h>\u0013e\u0005%d8\u0000g\u001B4e\u001F:g!\u0000f\u0015\u0019e-&d:\u0006h'#e;:g-\u0011g;\u0013f\u001E\u001Ce\u0005(g\u0010\u0003i\u0000\u001Ag\u001F%h.!e\u0008\u0012e/9d:\u000Eh\t:f\u001C/g\u001B8e\u0006\u000Ce\u000F\u0011g\u0014\u001Fg\u001C\u001Fg\u001A\u0004e;:g+\u000Bg-\tg:'g1;e\u001E\u000Bg;\u000Fi*\u000Ce.\u001Eg\u000E0e\u00086d=\u001Cf\u001D%h\u0007*f \u0007g->d;%d8\u000Be\u000E\u001Fe\u0008\u001Bf\u0017 f3\u0015e\u00056d8-e\u0000\u000Bd::d8\u0000e\u0008\u0007f\u000C\u0007e\r\u0017e\u00053i\u0017-i\u001B\u0006e\u001B\"g,,d8\te\u00053f3(e\u001B f-$g\u0005'g\t\u0007f71e\u001C3e\u0015\u0006d8\u001Ae9?e7\u001Ef\u0017%f\u001C\u001Fi+\u0018g:'f\u001C\u0000h?\u0011g;<e\u0010\u0008h!(g$:d8\u0013h>\u0011h!\u000Cd8:d:$i\u0000\u001Ah/\u0004d;7h'\te>\u0017g2>e\r\u000Ee.6e:-e.\u000Cf\u0008\u0010f\u0004\u001Fh'\te.\th#\u0005e>\u0017e\u00080i\u0002.d;6e\u00086e:&i#\u001Fe\u0013\u0001h\u0019=g\u00046h=,h==f\n%d;7h.0h\u0000\u0005f\u00169f!\u0008h!\u000Cf\u0014?d::f0\u0011g\u0014(e\u0013\u0001d8\u001Ch%?f\u000F\u0010e\u0007:i\u0005\u0012e:\u0017g\u00046e\u0010\u000Ed;\u0018f,>g\u0003-g\u00029d;%e\t\re.\u000Ce\u0005(e\u000F\u0011e8\u0016h.>g=.i\"\u0006e/<e7%d8\u001Ae\u000C;i\u0019\"g\u001C\u000Bg\u001C\u000Bg;\u000Fe\u00058e\u000E\u001Fe\u001B e93e\u000F0e\u0010\u0004g'\re\"\u001Ee\n f\u001D\u0010f\u0016\u0019f\u00160e\"\u001Ed9\u000Be\u0010\u000Eh\u0001\u000Cd8\u001Af\u0015\u0008f\u001E\u001Cd;\ne94h.:f\u0016\u0007f\u0008\u0011e\u001B=e\u0011\nh/\tg\t\u0008d8;d?.f\u00149e\u000F\u0002d8\u000Ef\t\u0013e\r0e?+d9\u0010f\u001C:f\"0h'\u0002g\u00029e-\u0018e\u001C(g2>g%\u001Eh\u000E7e>\u0017e\u0008)g\u0014(g;'g;-d= d;,h?\u0019d9\u0008f(!e<\u000Fh/-h(\u0000h\u0003=e$\u001Fi\u001B\u0005h\u0019\u000Ef\u0013\rd=\u001Ci#\u000Ef <d8\u0000h57g'\u0011e-&d=\u0013h\u00022g\u001F-d?!f\u001D!d;6f2;g\u0016\u0017h?\u0010e\n(d:'d8\u001Ad<\u001Ah..e/<h\u0008*e\u0005\u0008g\u0014\u001Fh\u0001\u0014g\u001B\u001Fe\u000F/f\u0018/e\u0015\u000Fi!\u000Cg;\u0013f\u001E\u0004d=\u001Cg\u0014(h0\u0003f\u001F%h3\u0007f\u0016\u0019h\u0007*e\n(h4\u001Fh4#e\u0006\u001Cd8\u001Ah.?i\u0017.e.\u001Ef\u0016=f\u000E%e\u000F\u0017h.(h.:i\u0002#d8*e\u000F\ri&\u0008e\n e<:e%3f\u0000'h\u000C\u0003e\u001B4f\u001C\re\u000B\u0019d<\u0011i\u00172d;\nf\u0017%e.\"f\u001C\rh'\u0000g\u001C\u000Be\u000F\u0002e\n g\u001A\u0004h/\u001Dd8\u0000g\u00029d?\u001Dh/\u0001e\u001B>d9&f\u001C\tf\u0015\u0008f5\u000Bh/\u0015g';e\n(f\t\rh\u0003=e\u00063e.\u001Ah\u0002!g%(d8\rf\u0016-i\u001C\u0000f1\u0002d8\re>\u0017e\n\u001Ef3\u0015d9\u000Bi\u00174i\u0007\u0007g\u0014(h\u0010%i\u0014\u0000f\n\u0015h/\tg\u001B.f \u0007g\u00081f\u0003\u0005f\u0011\u0004e=1f\u001C\td:\u001Bh$\u0007h#=f\u0016\u0007e-&f\u001C:d<\u001Af\u00150e-\u0017h#\u0005d?.h4-g\t)e\u0006\u001Cf\u001D\u0011e\u0005(i\u001D\"g2>e\u0013\u0001e\u00056e.\u001Ed:\u000Bf\u0003\u0005f04e93f\u000F\u0010g$:d8\ne8\u0002h0\"h0\"f\u0019.i\u0000\u001Af\u0015\u0019e8\u0008d8\nd< g1;e\u0008+f-\u000Cf\u001B2f\u000B%f\u001C\te\u0008\u001Bf\u00160i\u0005\rd;6e\u000F*h&\u0001f\u00176d;#h3\u0007h(\nh>>e\u00080d::g\u0014\u001Fh.\"i\u0018\u0005h\u0000\u0001e8\u0008e1\u0015g$:e?\u0003g\u0010\u0006h44e-\u0010g62g+\u0019d8;i!\u000Ch\u0007*g\u00046g:'e\u0008+g.\u0000e\r\u0015f\u00149i\u001D)i\u0002#d:\u001Bf\u001D%h/4f\t\u0013e<\u0000d;#g \u0001e\u0008 i\u0019$h/\u0001e\u00088h\n\u0002g\u001B.i\u0007\rg\u00029f,!f\u00158e$\u001Ae0\u0011h'\u0004e\u0008\u0012h5\u0004i\u0007\u0011f\t>e\u00080d;%e\u0010\u000Ee$'e\u0005(d8;i!5f\u001C\u0000d=3e\u001B\u001Eg-\u0014e$)d8\u000Bd?\u001Di\u001A\u001Cg\u000E0d;#f#\u0000f\u001F%f\n\u0015g%(e0\u000Ff\u00176f2\u0012f\u001C\tf-#e88g\u0014\u001Ah\u00073d;#g\u0010\u0006g\u001B.e=\u0015e\u0005,e<\u0000e$\re\u00086i\u0007\u0011h\u001E\re98g&\u000Fg\t\u0008f\u001C,e=\"f\u0008\u0010e\u0007\u0006e$\u0007h!\u000Cf\u0003\u0005e\u001B\u001Ee\u00080f\u0000\u001Df\u00033f\u0000\u000Ef 7e\r\u000Fh..h.$h/\u0001f\u001C\u0000e%=d:'g\u0014\u001Ff\u000C\tg\u0005'f\u001C\rh#\u0005e9?d8\u001Ce\n(f<+i\u0007\u0007h4-f\u00160f\t\u000Bg;\u0004e\u001B>i\u001D\"f\u001D?e\u000F\u0002h\u0000\u0003f\u0014?f2;e.9f\u0018\u0013e$)e\u001C0e\n*e\n\u001Bd::d;,e\r\u0007g:'i\u0000\u001Fe:&d::g\t)h0\u0003f\u00154f5\u0001h!\u000Ci\u0000 f\u0008\u0010f\u0016\u0007e-\u0017i\u001F)e\u001B=h48f\u0018\u0013e<\u0000e1\u0015g\u001B8i\u0017\u001Ch!(g\u000E0e=1h'\u0006e&\u0002f-$g>\u000Ee.9e$'e0\u000Ff\n%i\u0001\u0013f\u001D!f,>e?\u0003f\u0003\u0005h.8e$\u001Af3\u0015h'\u0004e.6e1\u0005d9&e:\u0017h?\u001Ef\u000E%g+\u000Be\r3d8>f\n%f\n\u0000e7'e%%h?\u0010g\u0019;e\u0005%d;%f\u001D%g\u0010\u0006h.:d:\u000Bd;6h\u0007*g\u00141d8-e\r\u000Ee\n\u001Ee\u0005,e&\u0008e&\u0008g\u001C\u001Ff-#d8\ri\u0014\u0019e\u0005(f\u0016\u0007e\u0010\u0008e\u0010\u000Cd;7e\u0000<e\u0008+d::g\u001B\u0011g\u001D#e\u00057d=\u0013d8\u0016g:*e\u001B\"i\u0018\u001Fe\u0008\u001Bd8\u001Af\t?f\u000B\u0005e\"\u001Ei\u0015?f\u001C\td::d?\u001Df\u000C\u0001e\u0015\u0006e.6g;4d?.e\u000F0f9>e7&e\u000F3h\u0002!d;=g-\u0014f!\u0008e.\u001Ei\u0019\u0005g\u00145d?!g;\u000Fg\u0010\u0006g\u0014\u001Fe\u0011=e.#d< d;;e\n!f-#e<\u000Fg\t9h\t2d8\u000Bf\u001D%e\r\u000Fd<\u001Ae\u000F*h\u0003=e=\u0013g\u00046i\u0007\rf\u00160e\u0005'e.9f\u000C\u0007e/<h?\u0010h!\u000Cf\u0017%e?\u0017h3#e.6h6\u0005h?\u0007e\u001C\u001Fe\u001C0f5\u0019f1\u001Ff\u0014/d;\u0018f\u000E(e\u0007:g+\u0019i\u0015?f\u001D-e7\u001Ef\t'h!\u000Ce\u00086i\u0000 d9\u000Bd8\u0000f\u000E(e9?g\u000E0e\u001C:f\u000F\u000Fh?0e\u000F\u0018e\u000C\u0016d< g;\u001Ff-\u000Cf\t\u000Bd?\u001Di\u0019)h/>g(\u000Be\u000C;g\u0016\u0017g;\u000Fh?\u0007h?\u0007e\u000E;d9\u000Be\t\rf\u00146e\u0005%e94e:&f\u001D\u0002e?\u0017g>\u000Ed8=f\u001C\u0000i+\u0018g\u0019;i\u0019\u0006f\u001C*f\u001D%e\n e7%e\u0005\rh4#f\u0015\u0019g(\u000Bg\t\u0008e\u001D\u0017h:+d=\u0013i\u0007\re:\u0006e\u0007:e\u0014.f\u0008\u0010f\u001C,e=\"e<\u000Fe\u001C\u001Fh1\u0006e\u0007:e\u00039d8\u001Cf\u00169i\u0002.g.1e\r\u0017d:,f1\u0002h\u0001\u000Ce\u000F\u0016e>\u0017h\u0001\u000Cd=\rg\u001B8d?!i!5i\u001D\"e\u0008\u0006i\u0012\u001Fg=\u0011i!5g!.e.\u001Ae\u001B>d>\u000Bg=\u0011e\u001D\u0000g'/f\u001E\u0001i\u0014\u0019h//g\u001B.g\u001A\u0004e.\u001Dh4\u001Df\u001C:e\u00053i#\u000Ei\u0019)f\u000E\u0008f\u001D\u0003g\u0017\u0005f/\u0012e. g\t)i\u0019$d:\u0006h)\u0015h+\u0016g\u0016>g\u0017\u0005e\u000F\nf\u00176f1\u0002h4-g+\u0019g\u00029e\u0004?g+%f/\u000Fe$)d8-e$.h.$h/\u0006f/\u000Fd8*e$)f4%e-\u0017d=\u0013e\u000F0g\u0001#g;4f\n$f\u001C,i!5d8*f\u0000'e.\u0018f\u00169e88h'\u0001g\u001B8f\u001C:f\u0008\u0018g\u0015%e:\u0014e=\u0013e>\u000Be8\u0008f\u00169d>?f !e\u001B-h\u0002!e8\u0002f\u0008?e1\u000Bf \u000Fg\u001B.e\u0011\u0018e7%e/<h\u00074g*\u0001g\u00046i\u0001\u0013e\u00057f\u001C,g=\u0011g;\u0013e\u0010\u0008f!#f!\u0008e\n3e\n(e\u000F&e$\u0016g>\u000Ee\u0005\u0003e<\u0015h57f\u00149e\u000F\u0018g,,e\u001B\u001Bd<\u001Ah.!h**f\u0018\u000Ei\u001A\u0010g'\u0001e.\u001De.\u001Dh'\u0004h\u000C\u0003f6\u0008h49e\u00051e\u0010\u000Ce?\u0018h.0d=\u0013g3;e8&f\u001D%e\u0010\re-\u0017g\u0019<h!(e<\u0000f\u0014>e\n g\u001B\u001Fe\u000F\u0017e\u00080d:\u000Cf\t\u000Be$'i\u0007\u000Ff\u0008\u0010d::f\u00150i\u0007\u000Fe\u00051d:+e\u000C:e\u001F\u001Fe%3e-)e\u000E\u001Fe\u0008\u0019f\t\u0000e\u001C(g;\u0013f\u001D\u001Fi\u0000\u001Ad?!h6\u0005g:'i\u0005\rg=.e=\u0013f\u00176d<\u0018g'\u0000f\u0000'f\u0004\u001Ff\u0008?d:'i\u0001\nf\u00082e\u0007:e\u000F#f\u000F\u0010d:$e01d8\u001Ad?\u001De\u0001%g(\u000Be:&e\u000F\u0002f\u00150d:\u000Bd8\u001Af\u00154d8*e11d8\u001Cf\u0003\u0005f\u0004\u001Fg\t9f.\ne\u0008\u0006i!\u001Ef\u0010\u001Ce0\u000Be1\u001Ed:\u000Ei\u0017(f\u00087h4\"e\n!e#0i\u001F3e\u000F\ne\u00056h4\"g;\u000Fe\u001D\u001Af\u000C\u0001e92i\u0003(f\u0008\u0010g+\u000Be\u0008)g\u001B\nh\u0000\u0003h\u0019\u0011f\u0008\u0010i\u0003=e\u000C\u0005h#\u0005g\u0014(f\u00086f/\u0014h5\u001Bf\u0016\u0007f\u0018\u000Ef\u000B\u001Be\u0015\u0006e.\u000Cf\u00154g\u001C\u001Ff\u0018/g\u001C<g\u001D\u001Bd<\u0019d<4e(\u0001f\u001C\u001Bi\"\u0006e\u001F\u001Fe\r+g\u0014\u001Fd<\u0018f\u0003 h+\u0016e#\u0007e\u0005,e\u00051h\t/e%=e\u0005\u0005e\u0008\u0006g,&e\u0010\u0008i\u0019\u0004d;6g\t9g\u00029d8\re\u000F/h\u000B1f\u0016\u0007h5\u0004d:'f 9f\u001C,f\u0018\u000Ef\u0018>e/\u0006g\"<e\u0005,d<\u0017f0\u0011f\u0017\u000Ff\u001B4e\n d:+e\u000F\u0017e\u0010\u000Ce-&e\u0010/e\n(i\u0000\u0002e\u0010\u0008e\u000E\u001Ff\u001D%i\u0017.g-\u0014f\u001C,f\u0016\u0007g>\u000Ei#\u001Fg;?h\t2g(3e.\u001Ag;\u0008d:\u000Eg\u0014\u001Fg\t)d>\u001Bf1\u0002f\u0010\u001Cg\u000B\u0010e\n\u001Bi\u0007\u000Fd8%i\u0007\rf08h?\u001Ce\u0006\u0019g\u001C\u001Ff\u001C\ti\u0019\u0010g+\u001Ed:\te/9h1!h49g\u0014(d8\re%=g;\u001De/9e\r\u0001e\u0008\u0006d?\u0003h?\u001Bg\u00029h/\u0004e=1i\u001F3d<\u0018e\n?d8\re0\u0011f,#h5\u000Fe96d8\u0014f\u001C\tg\u00029f\u00169e\u0010\u0011e\u0005(f\u00160d?!g\u0014(h.>f\u0016=e=\"h1!h5\u0004f <g*\u0001g 4i\u001A\u000Fg\u001D\u0000i\u0007\re$'d:\u000Ef\u0018/f/\u0015d8\u001Af\u0019:h\u0003=e\u000C\u0016e7%e.\u000Cg>\u000Ee\u0015\u0006e\u001F\u000Eg;\u001Fd8\u0000e\u0007:g\t\u0008f\t\u0013i\u0000 g\u0014\"e\u0013\u0001f&\u0002e\u00065g\u0014(d:\u000Ed?\u001Dg\u0015\u0019e\u001B g4 d8-e\u001C\u000Be-\u0018e\u0002(h44e\u001B>f\u001C\u0000f\u0004\u001Bi\u0015?f\u001C\u001Fe\u000F#d;7g\u0010\u0006h4\"e\u001F:e\u001C0e.\tf\u000E\u0012f-&f1\ti\u0007\u000Ci\u001D\"e\u0008\u001Be;:e$)g):i&\u0016e\u0005\u0008e.\u000Ce\u0016\u0004i)1e\n(d8\u000Bi\u001D\"d8\re\u0006\rh/\u001Ad?!f\u0004\u000Fd9\ti\u00183e\u0005\th\u000B1e\u001B=f<\u0002d:.e\u0006\u001Bd:\u000Bg\u000E)e.6g>$d<\u0017e\u0006\u001Cf0\u0011e\r3e\u000F/e\u0010\rg(1e.6e\u00057e\n(g\u0014;f\u00033e\u00080f3(f\u0018\u000Ee0\u000Fe-&f\u0000'h\u0003=h\u0000\u0003g \u0014g!,d;6h'\u0002g\u001C\u000Bf8\u0005f%\u001Af\u0010\u001Eg,\u0011i&\u0016i \u0001i;\u0004i\u0007\u0011i\u0000\u0002g\u0014(f1\u001Fh\u000B\u000Fg\u001C\u001Fe.\u001Ed8;g.!i\u00186f.5h(;e\u0006\ng?;h/\u0011f\u001D\u0003e\u0008)e\u0001\u001Ae%=d<<d9\u000Ei\u0000\u001Ah./f\u0016=e7%g\u000B\u0000f\u0005\u000Bd9\u001Fh.8g\u000E/d?\u001De\u001F9e\u0005;f&\u0002e?5e$'e\u001E\u000Bf\u001C:g%(g\u0010\u0006h'#e\u000C?e\u0010\rcuandoenviarmadridbuscariniciotiempoporquecuentaestadopuedenjuegoscontraestC!nnombretienenperfilmaneraamigosciudadcentroaunquepuedesdentroprimerpreciosegC:nbuenosvolverpuntossemanahabC-aagostonuevosunidoscarlosequiponiC1osmuchosalgunacorreoimagenpartirarribamarC-ahombreempleoverdadcambiomuchasfueronpasadolC-neaparecenuevascursosestabaquierolibroscuantoaccesomiguelvarioscuatrotienesgruposserC!neuropamediosfrenteacercademC!sofertacochesmodeloitalialetrasalgC:ncompracualesexistecuerposiendoprensallegarviajesdineromurciapodrC!puestodiariopuebloquieremanuelpropiocrisisciertoseguromuertefuentecerrargrandeefectopartesmedidapropiaofrecetierrae-mailvariasformasfuturoobjetoseguirriesgonormasmismosC:nicocaminositiosrazC3ndebidopruebatoledotenC-ajesC:sesperococinaorigentiendacientocC!dizhablarserC-alatinafuerzaestiloguerraentrarC)xitolC3pezagendavC-deoevitarpaginametrosjavierpadresfC!cilcabezaC!reassalidaenvC-ojapC3nabusosbienestextosllevarpuedanfuertecomC:nclaseshumanotenidobilbaounidadestC!seditarcreadoP4P;Q\u000FQ\u0007Q\u0002P>P:P0P:P8P;P8Q\rQ\u0002P>P2Q\u0001P5P5P3P>P?Q\u0000P8Q\u0002P0P:P5Q\tP5Q\u0003P6P5P\u001AP0P:P1P5P7P1Q\u000BP;P>P=P8P\u0012Q\u0001P5P?P>P4P-Q\u0002P>Q\u0002P>P<Q\u0007P5P<P=P5Q\u0002P;P5Q\u0002Q\u0000P0P7P>P=P0P3P4P5P<P=P5P\u0014P;Q\u000FP\u001FQ\u0000P8P=P0Q\u0001P=P8Q\u0005Q\u0002P5P<P:Q\u0002P>P3P>P4P2P>Q\u0002Q\u0002P0P<P!P(P\u0010P<P0Q\u000FP'Q\u0002P>P2P0Q\u0001P2P0P<P5P<Q\u0003P\"P0P:P4P2P0P=P0P<Q\rQ\u0002P8Q\rQ\u0002Q\u0003P\u0012P0P<Q\u0002P5Q\u0005P?Q\u0000P>Q\u0002Q\u0003Q\u0002P=P0P4P4P=Q\u000FP\u0012P>Q\u0002Q\u0002Q\u0000P8P=P5P9P\u0012P0Q\u0001P=P8P<Q\u0001P0P<Q\u0002P>Q\u0002Q\u0000Q\u0003P1P\u001EP=P8P<P8Q\u0000P=P5P5P\u001EP\u001EP\u001EP;P8Q\u0006Q\rQ\u0002P0P\u001EP=P0P=P5P<P4P>P<P<P>P9P4P2P5P>P=P>Q\u0001Q\u0003P4`$\u0015`%\u0007`$9`%\u0008`$\u0015`%\u0000`$8`%\u0007`$\u0015`$>`$\u0015`%\u000B`$\u0014`$0`$*`$0`$(`%\u0007`$\u000F`$\u0015`$\u0015`$?`$-`%\u0000`$\u0007`$8`$\u0015`$0`$$`%\u000B`$9`%\u000B`$\u0006`$*`$9`%\u0000`$/`$9`$/`$>`$$`$\u0015`$%`$>jagran`$\u0006`$\u001C`$\u001C`%\u000B`$\u0005`$,`$&`%\u000B`$\u0017`$\u0008`$\u001C`$>`$\u0017`$\u000F`$9`$.`$\u0007`$(`$5`$9`$/`%\u0007`$%`%\u0007`$%`%\u0000`$\u0018`$0`$\u001C`$,`$&`%\u0000`$\u0015`$\u0008`$\u001C`%\u0000`$5`%\u0007`$(`$\u0008`$(`$\u000F`$9`$0`$\t`$8`$.`%\u0007`$\u0015`$.`$5`%\u000B`$2`%\u0007`$8`$,`$.`$\u0008`$&`%\u0007`$\u0013`$0`$\u0006`$.`$,`$8`$-`$0`$,`$(`$\u001A`$2`$.`$(`$\u0006`$\u0017`$8`%\u0000`$2`%\u0000X9Y\u0004Y\tX%Y\u0004Y\tY\u0007X0X'X\"X.X1X9X/X/X'Y\u0004Y\tY\u0007X0Y\u0007X5Y\u0008X1X:Y\nX1Y\u0003X'Y\u0006Y\u0008Y\u0004X'X(Y\nY\u0006X9X1X6X0Y\u0004Y\u0003Y\u0007Y\u0006X'Y\nY\u0008Y\u0005Y\u0002X'Y\u0004X9Y\u0004Y\nX'Y\u0006X'Y\u0004Y\u0003Y\u0006X-X*Y\tY\u0002X(Y\u0004Y\u0008X-X)X'X.X1Y\u0001Y\u0002X7X9X(X/X1Y\u0003Y\u0006X%X0X'Y\u0003Y\u0005X'X'X-X/X%Y\u0004X'Y\u0001Y\nY\u0007X(X9X6Y\u0003Y\nY\u0001X(X-X+Y\u0008Y\u0005Y\u0006Y\u0008Y\u0007Y\u0008X#Y\u0006X'X,X/X'Y\u0004Y\u0007X'X3Y\u0004Y\u0005X9Y\u0006X/Y\u0004Y\nX3X9X(X1X5Y\u0004Y\tY\u0005Y\u0006X0X(Y\u0007X'X#Y\u0006Y\u0007Y\u0005X+Y\u0004Y\u0003Y\u0006X*X'Y\u0004X'X-Y\nX+Y\u0005X5X1X4X1X-X-Y\u0008Y\u0004Y\u0008Y\u0001Y\nX'X0X'Y\u0004Y\u0003Y\u0004Y\u0005X1X)X'Y\u0006X*X'Y\u0004Y\u0001X#X(Y\u0008X.X'X5X#Y\u0006X*X'Y\u0006Y\u0007X'Y\u0004Y\nX9X6Y\u0008Y\u0008Y\u0002X/X'X(Y\u0006X.Y\nX1X(Y\u0006X*Y\u0004Y\u0003Y\u0005X4X'X!Y\u0008Y\u0007Y\nX'X(Y\u0008Y\u0002X5X5Y\u0008Y\u0005X'X1Y\u0002Y\u0005X#X-X/Y\u0006X-Y\u0006X9X/Y\u0005X1X#Y\nX'X-X)Y\u0003X*X(X/Y\u0008Y\u0006Y\nX,X(Y\u0005Y\u0006Y\u0007X*X-X*X,Y\u0007X)X3Y\u0006X)Y\nX*Y\u0005Y\u0003X1X)X:X2X)Y\u0006Y\u0001X3X(Y\nX*Y\u0004Y\u0004Y\u0007Y\u0004Y\u0006X'X*Y\u0004Y\u0003Y\u0002Y\u0004X(Y\u0004Y\u0005X'X9Y\u0006Y\u0007X#Y\u0008Y\u0004X4Y\nX!Y\u0006Y\u0008X1X#Y\u0005X'Y\u0001Y\nY\u0003X(Y\u0003Y\u0004X0X'X*X1X*X(X(X#Y\u0006Y\u0007Y\u0005X3X'Y\u0006Y\u0003X(Y\nX9Y\u0001Y\u0002X/X-X3Y\u0006Y\u0004Y\u0007Y\u0005X4X9X1X#Y\u0007Y\u0004X4Y\u0007X1Y\u0002X7X1X7Y\u0004X(profileservicedefaulthimselfdetailscontentsupportstartedmessagesuccessfashion<title>countryaccountcreatedstoriesresultsrunningprocesswritingobjectsvisiblewelcomearticleunknownnetworkcompanydynamicbrowserprivacyproblemServicerespectdisplayrequestreservewebsitehistoryfriendsoptionsworkingversionmillionchannelwindow.addressvisitedweathercorrectproductedirectforwardyou canremovedsubjectcontrolarchivecurrentreadinglibrarylimitedmanagerfurthersummarymachineminutesprivatecontextprogramsocietynumberswrittenenabledtriggersourcesloadingelementpartnerfinallyperfectmeaningsystemskeepingculture&quot;,journalprojectsurfaces&quot;expiresreviewsbalanceEnglishContentthroughPlease opinioncontactaverageprimaryvillageSpanishgallerydeclinemeetingmissionpopularqualitymeasuregeneralspeciessessionsectionwriterscounterinitialreportsfiguresmembersholdingdisputeearlierexpressdigitalpictureAnothermarriedtrafficleadingchangedcentralvictoryimages/reasonsstudiesfeaturelistingmust beschoolsVersionusuallyepisodeplayinggrowingobviousoverlaypresentactions</ul>\r\nwrapperalreadycertainrealitystorageanotherdesktopofferedpatternunusualDigitalcapitalWebsitefailureconnectreducedAndroiddecadesregular &amp; animalsreleaseAutomatgettingmethodsnothingPopularcaptionletterscapturesciencelicensechangesEngland=1&amp;History = new CentralupdatedSpecialNetworkrequirecommentwarningCollegetoolbarremainsbecauseelectedDeutschfinanceworkersquicklybetweenexactlysettingdiseaseSocietyweaponsexhibit&lt;!--Controlclassescoveredoutlineattacksdevices(windowpurposetitle=\"Mobile killingshowingItaliandroppedheavilyeffects-1']);\nconfirmCurrentadvancesharingopeningdrawingbillionorderedGermanyrelated</form>includewhetherdefinedSciencecatalogArticlebuttonslargestuniformjourneysidebarChicagoholidayGeneralpassage,&quot;animatefeelingarrivedpassingnaturalroughly.\n\nThe but notdensityBritainChineselack oftributeIreland\" data-factorsreceivethat isLibraryhusbandin factaffairsCharlesradicalbroughtfindinglanding:lang=\"return leadersplannedpremiumpackageAmericaEdition]&quot;Messageneed tovalue=\"complexlookingstationbelievesmaller-mobilerecordswant tokind ofFirefoxyou aresimilarstudiedmaximumheadingrapidlyclimatekingdomemergedamountsfoundedpioneerformuladynastyhow to SupportrevenueeconomyResultsbrothersoldierlargelycalling.&quot;AccountEdward segmentRobert effortsPacificlearnedup withheight:we haveAngelesnations_searchappliedacquiremassivegranted: falsetreatedbiggestbenefitdrivingStudiesminimumperhapsmorningsellingis usedreversevariant role=\"missingachievepromotestudentsomeoneextremerestorebottom:evolvedall thesitemapenglishway to  AugustsymbolsCompanymattersmusicalagainstserving})();\r\npaymenttroubleconceptcompareparentsplayersregionsmonitor ''The winningexploreadaptedGalleryproduceabilityenhancecareers). The collectSearch ancientexistedfooter handlerprintedconsoleEasternexportswindowsChannelillegalneutralsuggest_headersigning.html\">settledwesterncausing-webkitclaimedJusticechaptervictimsThomas mozillapromisepartieseditionoutside:false,hundredOlympic_buttonauthorsreachedchronicdemandssecondsprotectadoptedprepareneithergreatlygreateroverallimprovecommandspecialsearch.worshipfundingthoughthighestinsteadutilityquarterCulturetestingclearlyexposedBrowserliberal} catchProjectexamplehide();FloridaanswersallowedEmperordefenseseriousfreedomSeveral-buttonFurtherout of != nulltrainedDenmarkvoid(0)/all.jspreventRequestStephen\n\nWhen observe</h2>\r\nModern provide\" alt=\"borders.\n\nFor \n\nMany artistspoweredperformfictiontype ofmedicalticketsopposedCouncilwitnessjusticeGeorge Belgium...</a>twitternotablywaitingwarfare Other rankingphrasesmentionsurvivescholar</p>\r\n Countryignoredloss ofjust asGeorgiastrange<head><stopped1']);\r\nislandsnotableborder:list ofcarried100,000</h3>\n severalbecomesselect wedding00.htmlmonarchoff theteacherhighly biologylife ofor evenrise of&raquo;plusonehunting(thoughDouglasjoiningcirclesFor theAncientVietnamvehiclesuch ascrystalvalue =Windowsenjoyeda smallassumed<a id=\"foreign All rihow theDisplayretiredhoweverhidden;battlesseekingcabinetwas notlook atconductget theJanuaryhappensturninga:hoverOnline French lackingtypicalextractenemieseven ifgeneratdecidedare not/searchbeliefs-image:locatedstatic.login\">convertviolententeredfirst\">circuitFinlandchemistshe was10px;\">as suchdivided</span>will beline ofa greatmystery/index.fallingdue to railwaycollegemonsterdescentit withnuclearJewish protestBritishflowerspredictreformsbutton who waslectureinstantsuicidegenericperiodsmarketsSocial fishingcombinegraphicwinners<br /><by the NaturalPrivacycookiesoutcomeresolveSwedishbrieflyPersianso muchCenturydepictscolumnshousingscriptsnext tobearingmappingrevisedjQuery(-width:title\">tooltipSectiondesignsTurkishyounger.match(})();\n\nburningoperatedegreessource=Richardcloselyplasticentries</tr>\r\ncolor:#ul id=\"possessrollingphysicsfailingexecutecontestlink toDefault<br />\n: true,chartertourismclassicproceedexplain</h1>\r\nonline.?xml vehelpingdiamonduse theairlineend -->).attr(readershosting#ffffffrealizeVincentsignals src=\"/ProductdespitediversetellingPublic held inJoseph theatreaffects<style>a largedoesn'tlater, ElementfaviconcreatorHungaryAirportsee theso thatMichaelSystemsPrograms, and  width=e&quot;tradingleft\">\npersonsGolden Affairsgrammarformingdestroyidea ofcase ofoldest this is.src = cartoonregistrCommonsMuslimsWhat isin manymarkingrevealsIndeed,equally/show_aoutdoorescape(Austriageneticsystem,In the sittingHe alsoIslandsAcademy\n\t\t<!--Daniel bindingblock\">imposedutilizeAbraham(except{width:putting).html(|| [];\nDATA[ *kitchenmountedactual dialectmainly _blank'installexpertsif(typeIt also&copy; \">Termsborn inOptionseasterntalkingconcerngained ongoingjustifycriticsfactoryits ownassaultinvitedlastinghis ownhref=\"/\" rel=\"developconcertdiagramdollarsclusterphp?id=alcohol);})();using a><span>vesselsrevivalAddressamateurandroidallegedillnesswalkingcentersqualifymatchesunifiedextinctDefensedied in\n\t<!-- customslinkingLittle Book ofeveningmin.js?are thekontakttoday's.html\" target=wearingAll Rig;\n})();raising Also, crucialabout\">declare-->\n<scfirefoxas muchappliesindex, s, but type = \n\r\n<!--towardsRecordsPrivateForeignPremierchoicesVirtualreturnsCommentPoweredinline;povertychamberLiving volumesAnthonylogin\" RelatedEconomyreachescuttinggravitylife inChapter-shadowNotable</td>\r\n returnstadiumwidgetsvaryingtravelsheld bywho arework infacultyangularwho hadairporttown of\n\nSome 'click'chargeskeywordit willcity of(this);Andrew unique checkedor more300px; return;rsion=\"pluginswithin herselfStationFederalventurepublishsent totensionactresscome tofingersDuke ofpeople,exploitwhat isharmonya major\":\"httpin his menu\">\nmonthlyofficercouncilgainingeven inSummarydate ofloyaltyfitnessand wasemperorsupremeSecond hearingRussianlongestAlbertalateralset of small\">.appenddo withfederalbank ofbeneathDespiteCapitalgrounds), and percentit fromclosingcontainInsteadfifteenas well.yahoo.respondfighterobscurereflectorganic= Math.editingonline paddinga wholeonerroryear ofend of barrierwhen itheader home ofresumedrenamedstrong>heatingretainscloudfrway of March 1knowingin partBetweenlessonsclosestvirtuallinks\">crossedEND -->famous awardedLicenseHealth fairly wealthyminimalAfricancompetelabel\">singingfarmersBrasil)discussreplaceGregoryfont copursuedappearsmake uproundedboth ofblockedsaw theofficescoloursif(docuwhen heenforcepush(fuAugust UTF-8\">Fantasyin mostinjuredUsuallyfarmingclosureobject defenceuse of Medical<body>\nevidentbe usedkeyCodesixteenIslamic#000000entire widely active (typeofone cancolor =speakerextendsPhysicsterrain<tbody>funeralviewingmiddle cricketprophetshifteddoctorsRussell targetcompactalgebrasocial-bulk ofman and</td>\n he left).val()false);logicalbankinghome tonaming Arizonacredits);\n});\nfounderin turnCollinsbefore But thechargedTitle\">CaptainspelledgoddessTag -->Adding:but wasRecent patientback in=false&Lincolnwe knowCounterJudaismscript altered']);\n  has theunclearEvent',both innot all\n\n<!-- placinghard to centersort ofclientsstreetsBernardassertstend tofantasydown inharbourFreedomjewelry/about..searchlegendsis mademodern only ononly toimage\" linear painterand notrarely acronymdelivershorter00&amp;as manywidth=\"/* <![Ctitle =of the lowest picked escapeduses ofpeoples PublicMatthewtacticsdamagedway forlaws ofeasy to windowstrong  simple}catch(seventhinfoboxwent topaintedcitizenI don'tretreat. Some ww.\");\nbombingmailto:made in. Many carries||{};wiwork ofsynonymdefeatsfavoredopticalpageTraunless sendingleft\"><comScorAll thejQuery.touristClassicfalse\" Wilhelmsuburbsgenuinebishops.split(global followsbody ofnominalContactsecularleft tochiefly-hidden-banner</li>\n\n. When in bothdismissExplorealways via thespaC1olwelfareruling arrangecaptainhis sonrule ofhe tookitself,=0&amp;(calledsamplesto makecom/pagMartin Kennedyacceptsfull ofhandledBesides//--></able totargetsessencehim to its by common.mineralto takeways tos.org/ladvisedpenaltysimple:if theyLettersa shortHerbertstrikes groups.lengthflightsoverlapslowly lesser social </p>\n\t\tit intoranked rate oful>\r\n  attemptpair ofmake itKontaktAntoniohaving ratings activestreamstrapped\").css(hostilelead tolittle groups,Picture-->\r\n\r\n rows=\" objectinverse<footerCustomV><\\/scrsolvingChamberslaverywoundedwhereas!= 'undfor allpartly -right:Arabianbacked centuryunit ofmobile-Europe,is homerisk ofdesiredClintoncost ofage of become none ofp&quot;Middle ead')[0Criticsstudios>&copy;group\">assemblmaking pressedwidget.ps:\" ? rebuiltby someFormer editorsdelayedCanonichad thepushingclass=\"but arepartialBabylonbottom carrierCommandits useAs withcoursesa thirddenotesalso inHouston20px;\">accuseddouble goal ofFamous ).bind(priests Onlinein Julyst + \"gconsultdecimalhelpfulrevivedis veryr'+'iptlosing femalesis alsostringsdays ofarrivalfuture <objectforcingString(\" />\n\t\there isencoded.  The balloondone by/commonbgcolorlaw of Indianaavoidedbut the2px 3pxjquery.after apolicy.men andfooter-= true;for usescreen.Indian image =family,http:// &nbsp;driverseternalsame asnoticedviewers})();\n is moreseasonsformer the newis justconsent Searchwas thewhy theshippedbr><br>width: height=made ofcuisineis thata very Admiral fixed;normal MissionPress, ontariocharsettry to invaded=\"true\"spacingis mosta more totallyfall of});\r\n  immensetime inset outsatisfyto finddown tolot of Playersin Junequantumnot thetime todistantFinnishsrc = (single help ofGerman law andlabeledforestscookingspace\">header-well asStanleybridges/globalCroatia About [0];\n  it, andgroupedbeing a){throwhe madelighterethicalFFFFFF\"bottom\"like a employslive inas seenprintermost ofub-linkrejectsand useimage\">succeedfeedingNuclearinformato helpWomen'sNeitherMexicanprotein<table by manyhealthylawsuitdevised.push({sellerssimply Through.cookie Image(older\">us.js\"> Since universlarger open to!-- endlies in']);\r\n  marketwho is (\"DOMComanagedone fortypeof Kingdomprofitsproposeto showcenter;made itdressedwere inmixtureprecisearisingsrc = 'make a securedBaptistvoting \n\t\tvar March 2grew upClimate.removeskilledway the</head>face ofacting right\">to workreduceshas haderectedshow();action=book ofan area== \"htt<header\n<html>conformfacing cookie.rely onhosted .customhe wentbut forspread Family a meansout theforums.footage\">MobilClements\" id=\"as highintense--><!--female is seenimpliedset thea stateand hisfastestbesidesbutton_bounded\"><img Infoboxevents,a youngand areNative cheaperTimeoutand hasengineswon the(mostlyright: find a -bottomPrince area ofmore ofsearch_nature,legallyperiod,land ofor withinducedprovingmissilelocallyAgainstthe wayk&quot;px;\">\r\npushed abandonnumeralCertainIn thismore inor somename isand, incrownedISBN 0-createsOctobermay notcenter late inDefenceenactedwish tobroadlycoolingonload=it. TherecoverMembersheight assumes<html>\npeople.in one =windowfooter_a good reklamaothers,to this_cookiepanel\">London,definescrushedbaptismcoastalstatus title\" move tolost inbetter impliesrivalryservers SystemPerhapses and contendflowinglasted rise inGenesisview ofrising seem tobut in backinghe willgiven agiving cities.flow of Later all butHighwayonly bysign ofhe doesdiffersbattery&amp;lasinglesthreatsintegertake onrefusedcalled =US&ampSee thenativesby thissystem.head of:hover,lesbiansurnameand allcommon/header__paramsHarvard/pixel.removalso longrole ofjointlyskyscraUnicodebr />\r\nAtlantanucleusCounty,purely count\">easily build aonclicka givenpointerh&quot;events else {\nditionsnow the, with man whoorg/Webone andcavalryHe diedseattle00,000 {windowhave toif(windand itssolely m&quot;renewedDetroitamongsteither them inSenatorUs</a><King ofFrancis-produche usedart andhim andused byscoringat hometo haverelatesibilityfactionBuffalolink\"><what hefree toCity ofcome insectorscountedone daynervoussquare };if(goin whatimg\" alis onlysearch/tuesdaylooselySolomonsexual - <a hrmedium\"DO NOT France,with a war andsecond take a >\r\n\r\n\r\nmarket.highwaydone inctivity\"last\">obligedrise to\"undefimade to Early praisedin its for hisathleteJupiterYahoo! termed so manyreally s. The a woman?value=direct right\" bicycleacing=\"day andstatingRather,higher Office are nowtimes, when a pay foron this-link\">;borderaround annual the Newput the.com\" takin toa brief(in thegroups.; widthenzymessimple in late{returntherapya pointbanninginks\">\n();\" rea place\\u003Caabout atr>\r\n\t\tccount gives a<SCRIPTRailwaythemes/toolboxById(\"xhumans,watchesin some if (wicoming formats Under but hashanded made bythan infear ofdenoted/iframeleft involtagein eacha&quot;base ofIn manyundergoregimesaction </p>\r\n<ustomVa;&gt;</importsor thatmostly &amp;re size=\"</a></ha classpassiveHost = WhetherfertileVarious=[];(fucameras/></td>acts asIn some>\r\n\r\n<!organis <br />BeijingcatalC deutscheuropeueuskaragaeilgesvenskaespaC1amensajeusuariotrabajomC)xicopC!ginasiempresistemaoctubreduranteaC1adirempresamomentonuestroprimeratravC)sgraciasnuestraprocesoestadoscalidadpersonanC:meroacuerdomC:sicamiembroofertasalgunospaC-sesejemploderechoademC!sprivadoagregarenlacesposiblehotelessevillaprimeroC:ltimoeventosarchivoculturamujeresentradaanuncioembargomercadograndesestudiomejoresfebrerodiseC1oturismocC3digoportadaespaciofamiliaantoniopermiteguardaralgunaspreciosalguiensentidovisitastC-tuloconocersegundoconsejofranciaminutossegundatenemosefectosmC!lagasesiC3nrevistagranadacompraringresogarcC-aacciC3necuadorquienesinclusodeberC!materiahombresmuestrapodrC-amaC1anaC:ltimaestamosoficialtambienningC:nsaludospodemosmejorarpositionbusinesshomepagesecuritylanguagestandardcampaignfeaturescategoryexternalchildrenreservedresearchexchangefavoritetemplatemilitaryindustryservicesmaterialproductsz-index:commentssoftwarecompletecalendarplatformarticlesrequiredmovementquestionbuildingpoliticspossiblereligionphysicalfeedbackregisterpicturesdisabledprotocolaudiencesettingsactivityelementslearninganythingabstractprogressoverviewmagazineeconomictrainingpressurevarious <strong>propertyshoppingtogetheradvancedbehaviordownloadfeaturedfootballselectedLanguagedistanceremembertrackingpasswordmodifiedstudentsdirectlyfightingnortherndatabasefestivalbreakinglocationinternetdropdownpracticeevidencefunctionmarriageresponseproblemsnegativeprogramsanalysisreleasedbanner\">purchasepoliciesregionalcreativeargumentbookmarkreferrerchemicaldivisioncallbackseparateprojectsconflicthardwareinterestdeliverymountainobtained= false;for(var acceptedcapacitycomputeridentityaircraftemployedproposeddomesticincludesprovidedhospitalverticalcollapseapproachpartnerslogo\"><adaughterauthor\" culturalfamilies/images/assemblypowerfulteachingfinisheddistrictcriticalcgi-bin/purposesrequireselectionbecomingprovidesacademicexerciseactuallymedicineconstantaccidentMagazinedocumentstartingbottom\">observed: &quot;extendedpreviousSoftwarecustomerdecisionstrengthdetailedslightlyplanningtextareacurrencyeveryonestraighttransferpositiveproducedheritageshippingabsolutereceivedrelevantbutton\" violenceanywherebenefitslaunchedrecentlyalliancefollowedmultiplebulletinincludedoccurredinternal$(this).republic><tr><tdcongressrecordedultimatesolution<ul id=\"discoverHome</a>websitesnetworksalthoughentirelymemorialmessagescontinueactive\">somewhatvictoriaWestern  title=\"LocationcontractvisitorsDownloadwithout right\">\nmeasureswidth = variableinvolvedvirginianormallyhappenedaccountsstandingnationalRegisterpreparedcontrolsaccuratebirthdaystrategyofficialgraphicscriminalpossiblyconsumerPersonalspeakingvalidateachieved.jpg\" />machines</h2>\n  keywordsfriendlybrotherscombinedoriginalcomposedexpectedadequatepakistanfollow\" valuable</label>relativebringingincreasegovernorplugins/List of Header\">\" name=\" (&quot;graduate</head>\ncommercemalaysiadirectormaintain;height:schedulechangingback to catholicpatternscolor: #greatestsuppliesreliable</ul>\n\t\t<select citizensclothingwatching<li id=\"specificcarryingsentence<center>contrastthinkingcatch(e)southernMichael merchantcarouselpadding:interior.split(\"lizationOctober ){returnimproved--&gt;\n\ncoveragechairman.png\" />subjectsRichard whateverprobablyrecoverybaseballjudgmentconnect..css\" /> websitereporteddefault\"/></a>\r\nelectricscotlandcreationquantity. ISBN 0did not instance-search-\" lang=\"speakersComputercontainsarchivesministerreactiondiscountItalianocriteriastrongly: 'http:'script'coveringofferingappearedBritish identifyFacebooknumerousvehiclesconcernsAmericanhandlingdiv id=\"William provider_contentaccuracysection andersonflexibleCategorylawrence<script>layout=\"approved maximumheader\"></table>Serviceshamiltoncurrent canadianchannels/themes//articleoptionalportugalvalue=\"\"intervalwirelessentitledagenciesSearch\" measuredthousandspending&hellip;new Date\" size=\"pageNamemiddle\" \" /></a>hidden\">sequencepersonaloverflowopinionsillinoislinks\">\n\t<title>versionssaturdayterminalitempropengineersectionsdesignerproposal=\"false\"EspaC1olreleasessubmit\" er&quot;additionsymptomsorientedresourceright\"><pleasurestationshistory.leaving  border=contentscenter\">.\n\nSome directedsuitablebulgaria.show();designedGeneral conceptsExampleswilliamsOriginal\"><span>search\">operatorrequestsa &quot;allowingDocumentrevision. \n\nThe yourselfContact michiganEnglish columbiapriorityprintingdrinkingfacilityreturnedContent officersRussian generate-8859-1\"indicatefamiliar qualitymargin:0 contentviewportcontacts-title\">portable.length eligibleinvolvesatlanticonload=\"default.suppliedpaymentsglossary\n\nAfter guidance</td><tdencodingmiddle\">came to displaysscottishjonathanmajoritywidgets.clinicalthailandteachers<head>\n\taffectedsupportspointer;toString</small>oklahomawill be investor0\" alt=\"holidaysResourcelicensed (which . After considervisitingexplorerprimary search\" android\"quickly meetingsestimate;return ;color:# height=approval, &quot; checked.min.js\"magnetic></a></hforecast. While thursdaydvertise&eacute;hasClassevaluateorderingexistingpatients Online coloradoOptions\"campbell<!-- end</span><<br />\r\n_popups|sciences,&quot; quality Windows assignedheight: <b classle&quot; value=\" Companyexamples<iframe believespresentsmarshallpart of properly).\n\nThe taxonomymuch of </span>\n\" data-srtuguC*sscrollTo project<head>\r\nattorneyemphasissponsorsfancyboxworld's wildlifechecked=sessionsprogrammpx;font- Projectjournalsbelievedvacationthompsonlightingand the special border=0checking</tbody><button Completeclearfix\n<head>\narticle <sectionfindingsrole in popular  Octoberwebsite exposureused to  changesoperatedclickingenteringcommandsinformed numbers  </div>creatingonSubmitmarylandcollegesanalyticlistingscontact.loggedInadvisorysiblingscontent\"s&quot;)s. This packagescheckboxsuggestspregnanttomorrowspacing=icon.pngjapanesecodebasebutton\">gamblingsuch as , while </span> missourisportingtop:1px .</span>tensionswidth=\"2lazyloadnovemberused in height=\"cript\">\n&nbsp;</<tr><td height:2/productcountry include footer\" &lt;!-- title\"></jquery.</form>\n(g.\u0000d=\u0013)(g9\u0001i+\u0014)hrvatskiitalianoromC\"nD\u0003tC<rkC'eX'X1X/Y\u0008tambiC)nnoticiasmensajespersonasderechosnacionalserviciocontactousuariosprogramagobiernoempresasanunciosvalenciacolombiadespuC)sdeportesproyectoproductopC:bliconosotroshistoriapresentemillonesmediantepreguntaanteriorrecursosproblemasantiagonuestrosopiniC3nimprimirmientrasamC)ricavendedorsociedadrespectorealizarregistropalabrasinterC)sentoncesespecialmiembrosrealidadcC3rdobazaragozapC!ginassocialesbloqueargestiC3nalquilersistemascienciascompletoversiC3ncompletaestudiospC:blicaobjetivoalicantebuscadorcantidadentradasaccionesarchivossuperiormayorC-aalemaniafunciC3nC:ltimoshaciendoaquellosediciC3nfernandoambientefacebooknuestrasclientesprocesosbastantepresentareportarcongresopublicarcomerciocontratojC3venesdistritotC)cnicaconjuntoenergC-atrabajarasturiasrecienteutilizarboletC-nsalvadorcorrectatrabajosprimerosnegocioslibertaddetallespantallaprC3ximoalmerC-aanimalesquiC)nescorazC3nsecciC3nbuscandoopcionesexteriorconceptotodavC-agalerC-aescribirmedicinalicenciaconsultaaspectoscrC-ticadC3laresjusticiadeberC!nperC-odonecesitamantenerpequeC1orecibidatribunaltenerifecanciC3ncanariasdescargadiversosmallorcarequieretC)cnicodeberC-aviviendafinanzasadelantefuncionaconsejosdifC-cilciudadesantiguasavanzadatC)rminounidadessC!nchezcampaC1asoftonicrevistascontienesectoresmomentosfacultadcrC)ditodiversassupuestofactoressegundospequeC1aP3P>P4P0P5Q\u0001P;P8P5Q\u0001Q\u0002Q\u000CP1Q\u000BP;P>P1Q\u000BQ\u0002Q\u000CQ\rQ\u0002P>P<P\u0015Q\u0001P;P8Q\u0002P>P3P>P<P5P=Q\u000FP2Q\u0001P5Q\u0005Q\rQ\u0002P>P9P4P0P6P5P1Q\u000BP;P8P3P>P4Q\u0003P4P5P=Q\u000CQ\rQ\u0002P>Q\u0002P1Q\u000BP;P0Q\u0001P5P1Q\u000FP>P4P8P=Q\u0001P5P1P5P=P0P4P>Q\u0001P0P9Q\u0002Q\u0004P>Q\u0002P>P=P5P3P>Q\u0001P2P>P8Q\u0001P2P>P9P8P3Q\u0000Q\u000BQ\u0002P>P6P5P2Q\u0001P5P<Q\u0001P2P>Q\u000EP;P8Q\u0008Q\u000CQ\rQ\u0002P8Q\u0005P?P>P:P0P4P=P5P9P4P>P<P0P<P8Q\u0000P0P;P8P1P>Q\u0002P5P<Q\u0003Q\u0005P>Q\u0002Q\u000FP4P2Q\u0003Q\u0005Q\u0001P5Q\u0002P8P;Q\u000EP4P8P4P5P;P>P<P8Q\u0000P5Q\u0002P5P1Q\u000FQ\u0001P2P>P5P2P8P4P5Q\u0007P5P3P>Q\rQ\u0002P8P<Q\u0001Q\u0007P5Q\u0002Q\u0002P5P<Q\u000BQ\u0006P5P=Q\u000BQ\u0001Q\u0002P0P;P2P5P4Q\u000CQ\u0002P5P<P5P2P>P4Q\u000BQ\u0002P5P1P5P2Q\u000BQ\u0008P5P=P0P<P8Q\u0002P8P?P0Q\u0002P>P<Q\u0003P?Q\u0000P0P2P;P8Q\u0006P0P>P4P=P0P3P>P4Q\u000BP7P=P0Q\u000EP<P>P3Q\u0003P4Q\u0000Q\u0003P3P2Q\u0001P5P9P8P4P5Q\u0002P:P8P=P>P>P4P=P>P4P5P;P0P4P5P;P5Q\u0001Q\u0000P>P:P8Q\u000EP=Q\u000FP2P5Q\u0001Q\u000CP\u0015Q\u0001Q\u0002Q\u000CQ\u0000P0P7P0P=P0Q\u0008P8X'Y\u0004Y\u0004Y\u0007X'Y\u0004X*Y\nX,Y\u0005Y\nX9X.X'X5X)X'Y\u0004X0Y\nX9Y\u0004Y\nY\u0007X,X/Y\nX/X'Y\u0004X\"Y\u0006X'Y\u0004X1X/X*X-Y\u0003Y\u0005X5Y\u0001X-X)Y\u0003X'Y\u0006X*X'Y\u0004Y\u0004Y\nY\nY\u0003Y\u0008Y\u0006X4X(Y\u0003X)Y\u0001Y\nY\u0007X'X(Y\u0006X'X*X-Y\u0008X'X!X#Y\u0003X+X1X.Y\u0004X'Y\u0004X'Y\u0004X-X(X/Y\u0004Y\nY\u0004X/X1Y\u0008X3X'X6X:X7X*Y\u0003Y\u0008Y\u0006Y\u0007Y\u0006X'Y\u0003X3X'X-X)Y\u0006X'X/Y\nX'Y\u0004X7X(X9Y\u0004Y\nY\u0003X4Y\u0003X1X'Y\nY\u0005Y\u0003Y\u0006Y\u0005Y\u0006Y\u0007X'X4X1Y\u0003X)X1X&Y\nX3Y\u0006X4Y\nX7Y\u0005X'X0X'X'Y\u0004Y\u0001Y\u0006X4X(X'X(X*X9X(X1X1X-Y\u0005X)Y\u0003X'Y\u0001X)Y\nY\u0002Y\u0008Y\u0004Y\u0005X1Y\u0003X2Y\u0003Y\u0004Y\u0005X)X#X-Y\u0005X/Y\u0002Y\u0004X(Y\nY\nX9Y\u0006Y\nX5Y\u0008X1X)X7X1Y\nY\u0002X4X'X1Y\u0003X,Y\u0008X'Y\u0004X#X.X1Y\tY\u0005X9Y\u0006X'X'X(X-X+X9X1Y\u0008X6X(X4Y\u0003Y\u0004Y\u0005X3X,Y\u0004X(Y\u0006X'Y\u0006X.X'Y\u0004X/Y\u0003X*X'X(Y\u0003Y\u0004Y\nX)X(X/Y\u0008Y\u0006X#Y\nX6X'Y\nY\u0008X,X/Y\u0001X1Y\nY\u0002Y\u0003X*X(X*X#Y\u0001X6Y\u0004Y\u0005X7X(X.X'Y\u0003X+X1X(X'X1Y\u0003X'Y\u0001X6Y\u0004X'X-Y\u0004Y\tY\u0006Y\u0001X3Y\u0007X#Y\nX'Y\u0005X1X/Y\u0008X/X#Y\u0006Y\u0007X'X/Y\nY\u0006X'X'Y\u0004X'Y\u0006Y\u0005X9X1X6X*X9Y\u0004Y\u0005X/X'X.Y\u0004Y\u0005Y\u0005Y\u0003Y\u0006\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0000\u0002\u0000\u0002\u0000\u0002\u0000\u0002\u0000\u0004\u0000\u0004\u0000\u0004\u0000\u0004\u0000\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0007\u0006\u0005\u0004\u0003\u0002\u0001\u0000\u0008\t\n\u000B\u000C\r\u000E\u000F\u000F\u000E\r\u000C\u000B\n\t\u0008\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0017\u0016\u0015\u0014\u0013\u0012\u0011\u0010\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u001F\u001E\u001D\u001C\u001B\u001A\u0019\u0018\u007F\u007F\u007F\u007F\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u007F\u007F\u007F\u007F\u0001\u0000\u0000\u0000\u0002\u0000\u0000\u0000\u0002\u0000\u0000\u0000\u0001\u0000\u0000\u0000\u0001\u0000\u0000\u0000\u0003\u0000\u0000\u0000\u007F\u007F\u0000\u0001\u0000\u0000\u0000\u0001\u0000\u0000\u007F\u007F\u0000\u0001\u0000\u0000\u0000\u0008\u0000\u0008\u0000\u0008\u0000\u0008\u0000\u0000\u0000\u0001\u0000\u0002\u0000\u0003\u0000\u0004\u0000\u0005\u0000\u0006\u0000\u0007resourcescountriesquestionsequipmentcommunityavailablehighlightDTD/xhtmlmarketingknowledgesomethingcontainerdirectionsubscribeadvertisecharacter\" value=\"</select>Australia\" class=\"situationauthorityfollowingprimarilyoperationchallengedevelopedanonymousfunction functionscompaniesstructureagreement\" title=\"potentialeducationargumentssecondarycopyrightlanguagesexclusivecondition</form>\r\nstatementattentionBiography} else {\nsolutionswhen the Analyticstemplatesdangeroussatellitedocumentspublisherimportantprototypeinfluence&raquo;</effectivegenerallytransformbeautifultransportorganizedpublishedprominentuntil thethumbnailNational .focus();over the migrationannouncedfooter\">\nexceptionless thanexpensiveformationframeworkterritoryndicationcurrentlyclassNamecriticismtraditionelsewhereAlexanderappointedmaterialsbroadcastmentionedaffiliate</option>treatmentdifferent/default.Presidentonclick=\"biographyotherwisepermanentFranC'aisHollywoodexpansionstandards</style>\nreductionDecember preferredCambridgeopponentsBusiness confusion>\n<title>presentedexplaineddoes not worldwideinterfacepositionsnewspaper</table>\nmountainslike the essentialfinancialselectionaction=\"/abandonedEducationparseInt(stabilityunable to</title>\nrelationsNote thatefficientperformedtwo yearsSince thethereforewrapper\">alternateincreasedBattle ofperceivedtrying tonecessaryportrayedelectionsElizabeth</iframe>discoveryinsurances.length;legendaryGeographycandidatecorporatesometimesservices.inherited</strong>CommunityreligiouslocationsCommitteebuildingsthe worldno longerbeginningreferencecannot befrequencytypicallyinto the relative;recordingpresidentinitiallytechniquethe otherit can beexistenceunderlinethis timetelephoneitemscopepracticesadvantage);return For otherprovidingdemocracyboth the extensivesufferingsupportedcomputers functionpracticalsaid thatit may beEnglish</from the scheduleddownloads</label>\nsuspectedmargin: 0spiritual</head>\n\nmicrosoftgraduallydiscussedhe becameexecutivejquery.jshouseholdconfirmedpurchasedliterallydestroyedup to thevariationremainingit is notcenturiesJapanese among thecompletedalgorithminterestsrebellionundefinedencourageresizableinvolvingsensitiveuniversalprovision(althoughfeaturingconducted), which continued-header\">February numerous overflow:componentfragmentsexcellentcolspan=\"technicalnear the Advanced source ofexpressedHong Kong Facebookmultiple mechanismelevationoffensive</form>\n\tsponsoreddocument.or &quot;there arethose whomovementsprocessesdifficultsubmittedrecommendconvincedpromoting\" width=\".replace(classicalcoalitionhis firstdecisionsassistantindicatedevolution-wrapper\"enough toalong thedelivered-->\r\n<!--American protectedNovember </style><furnitureInternet  onblur=\"suspendedrecipientbased on Moreover,abolishedcollectedwere madeemotionalemergencynarrativeadvocatespx;bordercommitteddir=\"ltr\"employeesresearch. selectedsuccessorcustomersdisplayedSeptemberaddClass(Facebook suggestedand lateroperatingelaborateSometimesInstitutecertainlyinstalledfollowersJerusalemthey havecomputinggeneratedprovincesguaranteearbitraryrecognizewanted topx;width:theory ofbehaviourWhile theestimatedbegan to it becamemagnitudemust havemore thanDirectoryextensionsecretarynaturallyoccurringvariablesgiven theplatform.</label><failed tocompoundskinds of societiesalongside --&gt;\n\nsouthwestthe rightradiationmay have unescape(spoken in\" href=\"/programmeonly the come fromdirectoryburied ina similarthey were</font></Norwegianspecifiedproducingpassenger(new DatetemporaryfictionalAfter theequationsdownload.regularlydeveloperabove thelinked tophenomenaperiod oftooltip\">substanceautomaticaspect ofAmong theconnectedestimatesAir Forcesystem ofobjectiveimmediatemaking itpaintingsconqueredare stillproceduregrowth ofheaded byEuropean divisionsmoleculesfranchiseintentionattractedchildhoodalso useddedicatedsingaporedegree offather ofconflicts</a></p>\ncame fromwere usednote thatreceivingExecutiveeven moreaccess tocommanderPoliticalmusiciansdeliciousprisonersadvent ofUTF-8\" /><![CDATA[\">ContactSouthern bgcolor=\"series of. It was in Europepermittedvalidate.appearingofficialsseriously-languageinitiatedextendinglong-terminflationsuch thatgetCookiemarked by</button>implementbut it isincreasesdown the requiringdependent-->\n<!-- interviewWith the copies ofconsensuswas builtVenezuela(formerlythe statepersonnelstrategicfavour ofinventionWikipediacontinentvirtuallywhich wasprincipleComplete identicalshow thatprimitiveaway frommolecularpreciselydissolvedUnder theversion=\">&nbsp;</It is the This is will haveorganismssome timeFriedrichwas firstthe only fact thatform id=\"precedingTechnicalphysicistoccurs innavigatorsection\">span id=\"sought tobelow thesurviving}</style>his deathas in thecaused bypartiallyexisting using thewas givena list oflevels ofnotion ofOfficial dismissedscientistresemblesduplicateexplosiverecoveredall othergalleries{padding:people ofregion ofaddressesassociateimg alt=\"in modernshould bemethod ofreportingtimestampneeded tothe Greatregardingseemed toviewed asimpact onidea thatthe Worldheight ofexpandingThese arecurrent\">carefullymaintainscharge ofClassicaladdressedpredictedownership<div id=\"right\">\r\nresidenceleave thecontent\">are often  })();\r\nprobably Professor-button\" respondedsays thathad to beplaced inHungarianstatus ofserves asUniversalexecutionaggregatefor whichinfectionagreed tohowever, popular\">placed onconstructelectoralsymbol ofincludingreturn toarchitectChristianprevious living ineasier toprofessor\n&lt;!-- effect ofanalyticswas takenwhere thetook overbelief inAfrikaansas far aspreventedwork witha special<fieldsetChristmasRetrieved\n\nIn the back intonortheastmagazines><strong>committeegoverninggroups ofstored inestablisha generalits firsttheir ownpopulatedan objectCaribbeanallow thedistrictswisconsinlocation.; width: inhabitedSocialistJanuary 1</footer>similarlychoice ofthe same specific business The first.length; desire todeal withsince theuserAgentconceivedindex.phpas &quot;engage inrecently,few yearswere also\n<head>\n<edited byare knowncities inaccesskeycondemnedalso haveservices,family ofSchool ofconvertednature of languageministers</object>there is a popularsequencesadvocatedThey wereany otherlocation=enter themuch morereflectedwas namedoriginal a typicalwhen theyengineerscould notresidentswednesdaythe third productsJanuary 2what theya certainreactionsprocessorafter histhe last contained\"></div>\n</a></td>depend onsearch\">\npieces ofcompetingReferencetennesseewhich has version=</span> <</header>gives thehistorianvalue=\"\">padding:0view thattogether,the most was foundsubset ofattack onchildren,points ofpersonal position:allegedlyClevelandwas laterand afterare givenwas stillscrollingdesign ofmakes themuch lessAmericans.\n\nAfter , but theMuseum oflouisiana(from theminnesotaparticlesa processDominicanvolume ofreturningdefensive00px|righmade frommouseover\" style=\"states of(which iscontinuesFranciscobuilding without awith somewho woulda form ofa part ofbefore itknown as  Serviceslocation and oftenmeasuringand it ispaperbackvalues of\r\n<title>= window.determineer&quot; played byand early</center>from thisthe threepower andof &quot;innerHTML<a href=\"y:inline;Church ofthe eventvery highofficial -height: content=\"/cgi-bin/to createafrikaansesperantofranC'aislatvieE!ulietuviE3D\u000CeE!tinaD\reE!tina`9\u0004`8\u0017`8\"f\u0017%f\u001C,h*\u001Eg.\u0000d=\u0013e-\u0017g9\u0001i+\u0014e-\u0017m\u0015\u001Cj5-l\u00164d8:d;\u0000d9\u0008h.!g.\u0017f\u001C:g,\u0014h.0f\u001C,h(\u000Eh+\u0016e\r\u0000f\u001C\re\n!e\u0019(d:\u0012h\u0001\u0014g=\u0011f\u0008?e\u001C0d:'d?1d9\u0010i\u0003(e\u0007:g\t\u0008g$>f\u000E\u0012h!\u000Cf&\u001Ci\u0003(h\u0010=f <h?\u001Bd8\u0000f-%f\u0014/d;\u0018e.\u001Di*\u000Ch/\u0001g \u0001e'\u0014e\u0011\u0018d<\u001Af\u00150f\r.e:\u0013f6\u0008h49h\u0000\u0005e\n\u001Ee\u0005,e.$h.(h.:e\u000C:f71e\u001C3e8\u0002f\u0012-f\u0014>e\u0019(e\u000C\u0017d:,e8\u0002e$'e-&g\u0014\u001Fh6\nf\u001D%h6\ng.!g\u0010\u0006e\u0011\u0018d?!f\u0001/g=\u0011serviciosartC-culoargentinabarcelonacualquierpublicadoproductospolC-ticarespuestawikipediasiguientebC:squedacomunidadseguridadprincipalpreguntascontenidorespondervenezuelaproblemasdiciembrerelaciC3nnoviembresimilaresproyectosprogramasinstitutoactividadencuentraeconomC-aimC!genescontactardescargarnecesarioatenciC3ntelC)fonocomisiC3ncancionescapacidadencontraranC!lisisfavoritostC)rminosprovinciaetiquetaselementosfuncionesresultadocarC!cterpropiedadprincipionecesidadmunicipalcreaciC3ndescargaspresenciacomercialopinionesejercicioeditorialsalamancagonzC!lezdocumentopelC-cularecientesgeneralestarragonaprC!cticanovedadespropuestapacientestC)cnicasobjetivoscontactos`$.`%\u0007`$\u0002`$2`$?`$\u000F`$9`%\u0008`$\u0002`$\u0017`$/`$>`$8`$>`$%`$\u000F`$5`$\u0002`$0`$9`%\u0007`$\u0015`%\u000B`$\u0008`$\u0015`%\u0001`$\u001B`$0`$9`$>`$,`$>`$&`$\u0015`$9`$>`$8`$-`%\u0000`$9`%\u0001`$\u000F`$0`$9`%\u0000`$.`%\u0008`$\u0002`$&`$?`$(`$,`$>`$$diplodocs`$8`$.`$/`$0`%\u0002`$*`$(`$>`$.`$*`$$`$>`$+`$?`$0`$\u0014`$8`$$`$$`$0`$9`$2`%\u000B`$\u0017`$9`%\u0001`$\u0006`$,`$>`$0`$&`%\u0007`$6`$9`%\u0001`$\u0008`$\u0016`%\u0007`$2`$/`$&`$?`$\u0015`$>`$.`$5`%\u0007`$,`$$`%\u0000`$(`$,`%\u0000`$\u001A`$.`%\u000C`$$`$8`$>`$2`$2`%\u0007`$\u0016`$\u001C`%\t`$,`$.`$&`$&`$$`$%`$>`$(`$9`%\u0000`$6`$9`$0`$\u0005`$2`$\u0017`$\u0015`$-`%\u0000`$(`$\u0017`$0`$*`$>`$8`$0`$>`$$`$\u0015`$?`$\u000F`$\t`$8`%\u0007`$\u0017`$/`%\u0000`$9`%\u0002`$\u0001`$\u0006`$\u0017`%\u0007`$\u001F`%\u0000`$.`$\u0016`%\u000B`$\u001C`$\u0015`$>`$0`$\u0005`$-`%\u0000`$\u0017`$/`%\u0007`$$`%\u0001`$.`$5`%\u000B`$\u001F`$&`%\u0007`$\u0002`$\u0005`$\u0017`$0`$\u0010`$8`%\u0007`$.`%\u0007`$2`$2`$\u0017`$>`$9`$>`$2`$\n`$*`$0`$\u001A`$>`$0`$\u0010`$8`$>`$&`%\u0007`$0`$\u001C`$?`$8`$&`$?`$2`$,`$\u0002`$&`$,`$(`$>`$9`%\u0002`$\u0002`$2`$>`$\u0016`$\u001C`%\u0000`$$`$,`$\u001F`$(`$.`$?`$2`$\u0007`$8`%\u0007`$\u0006`$(`%\u0007`$(`$/`$>`$\u0015`%\u0001`$2`$2`%\t`$\u0017`$-`$>`$\u0017`$0`%\u0007`$2`$\u001C`$\u0017`$9`$0`$>`$.`$2`$\u0017`%\u0007`$*`%\u0007`$\u001C`$9`$>`$%`$\u0007`$8`%\u0000`$8`$9`%\u0000`$\u0015`$2`$>`$ `%\u0000`$\u0015`$9`$>`$\u0001`$&`%\u0002`$0`$$`$9`$$`$8`$>`$$`$/`$>`$&`$\u0006`$/`$>`$*`$>`$\u0015`$\u0015`%\u000C`$(`$6`$>`$.`$&`%\u0007`$\u0016`$/`$9`%\u0000`$0`$>`$/`$\u0016`%\u0001`$&`$2`$\u0017`%\u0000categoriesexperience</title>\r\nCopyright javascriptconditionseverything<p class=\"technologybackground<a class=\"management&copy; 201javaScriptcharactersbreadcrumbthemselveshorizontalgovernmentCaliforniaactivitiesdiscoveredNavigationtransitionconnectionnavigationappearance</title><mcheckbox\" techniquesprotectionapparentlyas well asunt', 'UA-resolutionoperationstelevisiontranslatedWashingtonnavigator. = window.impression&lt;br&gt;literaturepopulationbgcolor=\"#especially content=\"productionnewsletterpropertiesdefinitionleadershipTechnologyParliamentcomparisonul class=\".indexOf(\"conclusiondiscussioncomponentsbiologicalRevolution_containerunderstoodnoscript><permissioneach otheratmosphere onfocus=\"<form id=\"processingthis.valuegenerationConferencesubsequentwell-knownvariationsreputationphenomenondisciplinelogo.png\" (document,boundariesexpressionsettlementBackgroundout of theenterprise(\"https:\" unescape(\"password\" democratic<a href=\"/wrapper\">\nmembershiplinguisticpx;paddingphilosophyassistanceuniversityfacilitiesrecognizedpreferenceif (typeofmaintainedvocabularyhypothesis.submit();&amp;nbsp;annotationbehind theFoundationpublisher\"assumptionintroducedcorruptionscientistsexplicitlyinstead ofdimensions onClick=\"considereddepartmentoccupationsoon afterinvestmentpronouncedidentifiedexperimentManagementgeographic\" height=\"link rel=\".replace(/depressionconferencepunishmenteliminatedresistanceadaptationoppositionwell knownsupplementdeterminedh1 class=\"0px;marginmechanicalstatisticscelebratedGovernment\n\nDuring tdevelopersartificialequivalentoriginatedCommissionattachment<span id=\"there wereNederlandsbeyond theregisteredjournalistfrequentlyall of thelang=\"en\" </style>\r\nabsolute; supportingextremely mainstream</strong> popularityemployment</table>\r\n colspan=\"</form>\n  conversionabout the </p></div>integrated\" lang=\"enPortuguesesubstituteindividualimpossiblemultimediaalmost allpx solid #apart fromsubject toin Englishcriticizedexcept forguidelinesoriginallyremarkablethe secondh2 class=\"<a title=\"(includingparametersprohibited= \"http://dictionaryperceptionrevolutionfoundationpx;height:successfulsupportersmillenniumhis fatherthe &quot;no-repeat;commercialindustrialencouragedamount of unofficialefficiencyReferencescoordinatedisclaimerexpeditiondevelopingcalculatedsimplifiedlegitimatesubstring(0\" class=\"completelyillustratefive yearsinstrumentPublishing1\" class=\"psychologyconfidencenumber of absence offocused onjoined thestructurespreviously></iframe>once againbut ratherimmigrantsof course,a group ofLiteratureUnlike the</a>&nbsp;\nfunction it was theConventionautomobileProtestantaggressiveafter the Similarly,\" /></div>collection\r\nfunctionvisibilitythe use ofvolunteersattractionunder the threatened*<![CDATA[importancein generalthe latter</form>\n</.indexOf('i = 0; i <differencedevoted totraditionssearch forultimatelytournamentattributesso-called }\n</style>evaluationemphasizedaccessible</section>successionalong withMeanwhile,industries</a><br />has becomeaspects ofTelevisionsufficientbasketballboth sidescontinuingan article<img alt=\"adventureshis mothermanchesterprinciplesparticularcommentaryeffects ofdecided to\"><strong>publishersJournal ofdifficultyfacilitateacceptablestyle.css\"\tfunction innovation>Copyrightsituationswould havebusinessesDictionarystatementsoften usedpersistentin Januarycomprising</title>\n\tdiplomaticcontainingperformingextensionsmay not beconcept of onclick=\"It is alsofinancial making theLuxembourgadditionalare calledengaged in\"script\");but it waselectroniconsubmit=\"\n<!-- End electricalofficiallysuggestiontop of theunlike theAustralianOriginallyreferences\n</head>\r\nrecognisedinitializelimited toAlexandriaretirementAdventuresfour years\n\n&lt;!-- increasingdecorationh3 class=\"origins ofobligationregulationclassified(function(advantagesbeing the historians<base hrefrepeatedlywilling tocomparabledesignatednominationfunctionalinside therevelationend of thes for the authorizedrefused totake placeautonomouscompromisepolitical restauranttwo of theFebruary 2quality ofswfobject.understandnearly allwritten byinterviews\" width=\"1withdrawalfloat:leftis usuallycandidatesnewspapersmysteriousDepartmentbest knownparliamentsuppressedconvenientremembereddifferent systematichas led topropagandacontrolledinfluencesceremonialproclaimedProtectionli class=\"Scientificclass=\"no-trademarksmore than widespreadLiberationtook placeday of theas long asimprisonedAdditional\n<head>\n<mLaboratoryNovember 2exceptionsIndustrialvariety offloat: lefDuring theassessmenthave been deals withStatisticsoccurrence/ul></div>clearfix\">the publicmany yearswhich wereover time,synonymouscontent\">\npresumablyhis familyuserAgent.unexpectedincluding challengeda minorityundefined\"belongs totaken fromin Octoberposition: said to bereligious Federation rowspan=\"only a fewmeant thatled to the-->\r\n<div <fieldset>Archbishop class=\"nobeing usedapproachesprivilegesnoscript>\nresults inmay be theEaster eggmechanismsreasonablePopulationCollectionselected\">noscript>\r/index.phparrival of-jssdk'));managed toincompletecasualtiescompletionChristiansSeptember arithmeticproceduresmight haveProductionit appearsPhilosophyfriendshipleading togiving thetoward theguaranteeddocumentedcolor:#000video gamecommissionreflectingchange theassociatedsans-serifonkeypress; padding:He was theunderlyingtypically , and the srcElementsuccessivesince the should be networkingaccountinguse of thelower thanshows that</span>\n\t\tcomplaintscontinuousquantitiesastronomerhe did notdue to itsapplied toan averageefforts tothe futureattempt toTherefore,capabilityRepublicanwas formedElectronickilometerschallengespublishingthe formerindigenousdirectionssubsidiaryconspiracydetails ofand in theaffordablesubstancesreason forconventionitemtype=\"absolutelysupposedlyremained aattractivetravellingseparatelyfocuses onelementaryapplicablefound thatstylesheetmanuscriptstands for no-repeat(sometimesCommercialin Americaundertakenquarter ofan examplepersonallyindex.php?</button>\npercentagebest-knowncreating a\" dir=\"ltrLieutenant\n<div id=\"they wouldability ofmade up ofnoted thatclear thatargue thatto anotherchildren'spurpose offormulatedbased uponthe regionsubject ofpassengerspossession.\n\nIn the Before theafterwardscurrently across thescientificcommunity.capitalismin Germanyright-wingthe systemSociety ofpoliticiandirection:went on toremoval of New York apartmentsindicationduring theunless thehistoricalhad been adefinitiveingredientattendanceCenter forprominencereadyStatestrategiesbut in theas part ofconstituteclaim thatlaboratorycompatiblefailure of, such as began withusing the to providefeature offrom which/\" class=\"geologicalseveral ofdeliberateimportant holds thating&quot; valign=topthe Germanoutside ofnegotiatedhis careerseparationid=\"searchwas calledthe fourthrecreationother thanpreventionwhile the education,connectingaccuratelywere builtwas killedagreementsmuch more Due to thewidth: 100some otherKingdom ofthe entirefamous forto connectobjectivesthe Frenchpeople andfeatured\">is said tostructuralreferendummost oftena separate->\n<div id Official worldwide.aria-labelthe planetand it wasd\" value=\"looking atbeneficialare in themonitoringreportedlythe modernworking onallowed towhere the innovative</a></div>soundtracksearchFormtend to beinput id=\"opening ofrestrictedadopted byaddressingtheologianmethods ofvariant ofChristian very largeautomotiveby far therange frompursuit offollow thebrought toin Englandagree thataccused ofcomes frompreventingdiv style=his or hertremendousfreedom ofconcerning0 1em 1em;Basketball/style.cssan earliereven after/\" title=\".com/indextaking thepittsburghcontent\">\r<script>(fturned outhaving the</span>\r\n occasionalbecause itstarted tophysically></div>\n  created byCurrently, bgcolor=\"tabindex=\"disastrousAnalytics also has a><div id=\"</style>\n<called forsinger and.src = \"//violationsthis pointconstantlyis locatedrecordingsd from thenederlandsportuguC*sW\"W\u0011W(W\u0019W*Y\u0001X'X1X3[\u000CdesarrollocomentarioeducaciC3nseptiembreregistradodirecciC3nubicaciC3npublicidadrespuestasresultadosimportantereservadosartC-culosdiferentessiguientesrepC:blicasituaciC3nministerioprivacidaddirectorioformaciC3npoblaciC3npresidentecont", "enidosaccesoriostechnoratipersonalescategorC-aespecialesdisponibleactualidadreferenciavalladolidbibliotecarelacionescalendariopolC-ticasanterioresdocumentosnaturalezamaterialesdiferenciaeconC3micatransporterodrC-guezparticiparencuentrandiscusiC3nestructurafundaciC3nfrecuentespermanentetotalmenteP<P>P6P=P>P1Q\u0003P4P5Q\u0002P<P>P6P5Q\u0002P2Q\u0000P5P<Q\u000FQ\u0002P0P:P6P5Q\u0007Q\u0002P>P1Q\u000BP1P>P;P5P5P>Q\u0007P5P=Q\u000CQ\rQ\u0002P>P3P>P:P>P3P4P0P?P>Q\u0001P;P5P2Q\u0001P5P3P>Q\u0001P0P9Q\u0002P5Q\u0007P5Q\u0000P5P7P<P>P3Q\u0003Q\u0002Q\u0001P0P9Q\u0002P0P6P8P7P=P8P<P5P6P4Q\u0003P1Q\u0003P4Q\u0003Q\u0002P\u001FP>P8Q\u0001P:P7P4P5Q\u0001Q\u000CP2P8P4P5P>Q\u0001P2Q\u000FP7P8P=Q\u0003P6P=P>Q\u0001P2P>P5P9P;Q\u000EP4P5P9P?P>Q\u0000P=P>P<P=P>P3P>P4P5Q\u0002P5P9Q\u0001P2P>P8Q\u0005P?Q\u0000P0P2P0Q\u0002P0P:P>P9P<P5Q\u0001Q\u0002P>P8P<P5P5Q\u0002P6P8P7P=Q\u000CP>P4P=P>P9P;Q\u0003Q\u0007Q\u0008P5P?P5Q\u0000P5P4Q\u0007P0Q\u0001Q\u0002P8Q\u0007P0Q\u0001Q\u0002Q\u000CQ\u0000P0P1P>Q\u0002P=P>P2Q\u000BQ\u0005P?Q\u0000P0P2P>Q\u0001P>P1P>P9P?P>Q\u0002P>P<P<P5P=P5P5Q\u0007P8Q\u0001P;P5P=P>P2Q\u000BP5Q\u0003Q\u0001P;Q\u0003P3P>P:P>P;P>P=P0P7P0P4Q\u0002P0P:P>P5Q\u0002P>P3P4P0P?P>Q\u0007Q\u0002P8P\u001FP>Q\u0001P;P5Q\u0002P0P:P8P5P=P>P2Q\u000BP9Q\u0001Q\u0002P>P8Q\u0002Q\u0002P0P:P8Q\u0005Q\u0001Q\u0000P0P7Q\u0003P!P0P=P:Q\u0002Q\u0004P>Q\u0000Q\u0003P<P\u001AP>P3P4P0P:P=P8P3P8Q\u0001P;P>P2P0P=P0Q\u0008P5P9P=P0P9Q\u0002P8Q\u0001P2P>P8P<Q\u0001P2Q\u000FP7Q\u000CP;Q\u000EP1P>P9Q\u0007P0Q\u0001Q\u0002P>Q\u0001Q\u0000P5P4P8P\u001AQ\u0000P>P<P5P$P>Q\u0000Q\u0003P<Q\u0000Q\u000BP=P:P5Q\u0001Q\u0002P0P;P8P?P>P8Q\u0001P:Q\u0002Q\u000BQ\u0001Q\u000FQ\u0007P<P5Q\u0001Q\u000FQ\u0006Q\u0006P5P=Q\u0002Q\u0000Q\u0002Q\u0000Q\u0003P4P0Q\u0001P0P<Q\u000BQ\u0005Q\u0000Q\u000BP=P:P0P\u001DP>P2Q\u000BP9Q\u0007P0Q\u0001P>P2P<P5Q\u0001Q\u0002P0Q\u0004P8P;Q\u000CP<P<P0Q\u0000Q\u0002P0Q\u0001Q\u0002Q\u0000P0P=P<P5Q\u0001Q\u0002P5Q\u0002P5P:Q\u0001Q\u0002P=P0Q\u0008P8Q\u0005P<P8P=Q\u0003Q\u0002P8P<P5P=P8P8P<P5Q\u000EQ\u0002P=P>P<P5Q\u0000P3P>Q\u0000P>P4Q\u0001P0P<P>P<Q\rQ\u0002P>P<Q\u0003P:P>P=Q\u0006P5Q\u0001P2P>P5P<P:P0P:P>P9P\u0010Q\u0000Q\u0005P8P2Y\u0005Y\u0006X*X/Y\tX%X1X3X'Y\u0004X1X3X'Y\u0004X)X'Y\u0004X9X'Y\u0005Y\u0003X*X(Y\u0007X'X(X1X'Y\u0005X,X'Y\u0004Y\nY\u0008Y\u0005X'Y\u0004X5Y\u0008X1X,X/Y\nX/X)X'Y\u0004X9X6Y\u0008X%X6X'Y\u0001X)X'Y\u0004Y\u0002X3Y\u0005X'Y\u0004X9X'X(X*X-Y\u0005Y\nY\u0004Y\u0005Y\u0004Y\u0001X'X*Y\u0005Y\u0004X*Y\u0002Y\tX*X9X/Y\nY\u0004X'Y\u0004X4X9X1X#X.X(X'X1X*X7Y\u0008Y\nX1X9Y\u0004Y\nY\u0003Y\u0005X%X1Y\u0001X'Y\u0002X7Y\u0004X(X'X*X'Y\u0004Y\u0004X:X)X*X1X*Y\nX(X'Y\u0004Y\u0006X'X3X'Y\u0004X4Y\nX.Y\u0005Y\u0006X*X/Y\nX'Y\u0004X9X1X(X'Y\u0004Y\u0002X5X5X'Y\u0001Y\u0004X'Y\u0005X9Y\u0004Y\nY\u0007X'X*X-X/Y\nX+X'Y\u0004Y\u0004Y\u0007Y\u0005X'Y\u0004X9Y\u0005Y\u0004Y\u0005Y\u0003X*X(X)Y\nY\u0005Y\u0003Y\u0006Y\u0003X'Y\u0004X7Y\u0001Y\u0004Y\u0001Y\nX/Y\nY\u0008X%X/X'X1X)X*X'X1Y\nX.X'Y\u0004X5X-X)X*X3X,Y\nY\u0004X'Y\u0004Y\u0008Y\u0002X*X9Y\u0006X/Y\u0005X'Y\u0005X/Y\nY\u0006X)X*X5Y\u0005Y\nY\u0005X#X1X4Y\nY\u0001X'Y\u0004X0Y\nY\u0006X9X1X(Y\nX)X(Y\u0008X'X(X)X#Y\u0004X9X'X(X'Y\u0004X3Y\u0001X1Y\u0005X4X'Y\u0003Y\u0004X*X9X'Y\u0004Y\tX'Y\u0004X#Y\u0008Y\u0004X'Y\u0004X3Y\u0006X)X,X'Y\u0005X9X)X'Y\u0004X5X-Y\u0001X'Y\u0004X/Y\nY\u0006Y\u0003Y\u0004Y\u0005X'X*X'Y\u0004X.X'X5X'Y\u0004Y\u0005Y\u0004Y\u0001X#X9X6X'X!Y\u0003X*X'X(X)X'Y\u0004X.Y\nX1X1X3X'X&Y\u0004X'Y\u0004Y\u0002Y\u0004X(X'Y\u0004X#X/X(Y\u0005Y\u0002X'X7X9Y\u0005X1X'X3Y\u0004Y\u0005Y\u0006X7Y\u0002X)X'Y\u0004Y\u0003X*X(X'Y\u0004X1X,Y\u0004X'X4X*X1Y\u0003X'Y\u0004Y\u0002X/Y\u0005Y\nX9X7Y\nY\u0003sByTagName(.jpg\" alt=\"1px solid #.gif\" alt=\"transparentinformationapplication\" onclick=\"establishedadvertising.png\" alt=\"environmentperformanceappropriate&amp;mdash;immediately</strong></rather thantemperaturedevelopmentcompetitionplaceholdervisibility:copyright\">0\" height=\"even thoughreplacementdestinationCorporation<ul class=\"AssociationindividualsperspectivesetTimeout(url(http://mathematicsmargin-top:eventually description) no-repeatcollections.JPG|thumb|participate/head><bodyfloat:left;<li class=\"hundreds of\n\nHowever, compositionclear:both;cooperationwithin the label for=\"border-top:New Zealandrecommendedphotographyinteresting&lt;sup&gt;controversyNetherlandsalternativemaxlength=\"switzerlandDevelopmentessentially\n\nAlthough </textarea>thunderbirdrepresented&amp;ndash;speculationcommunitieslegislationelectronics\n\t<div id=\"illustratedengineeringterritoriesauthoritiesdistributed6\" height=\"sans-serif;capable of disappearedinteractivelooking forit would beAfghanistanwas createdMath.floor(surroundingcan also beobservationmaintenanceencountered<h2 class=\"more recentit has beeninvasion of).getTime()fundamentalDespite the\"><div id=\"inspirationexaminationpreparationexplanation<input id=\"</a></span>versions ofinstrumentsbefore the  = 'http://Descriptionrelatively .substring(each of theexperimentsinfluentialintegrationmany peopledue to the combinationdo not haveMiddle East<noscript><copyright\" perhaps theinstitutionin Decemberarrangementmost famouspersonalitycreation oflimitationsexclusivelysovereignty-content\">\n<td class=\"undergroundparallel todoctrine ofoccupied byterminologyRenaissancea number ofsupport forexplorationrecognitionpredecessor<img src=\"/<h1 class=\"publicationmay also bespecialized</fieldset>progressivemillions ofstates thatenforcementaround the one another.parentNodeagricultureAlternativeresearcherstowards theMost of themany other (especially<td width=\";width:100%independent<h3 class=\" onchange=\").addClass(interactionOne of the daughter ofaccessoriesbranches of\r\n<div id=\"the largestdeclarationregulationsInformationtranslationdocumentaryin order to\">\n<head>\n<\" height=\"1across the orientation);</script>implementedcan be seenthere was ademonstratecontainer\">connectionsthe Britishwas written!important;px; margin-followed byability to complicatedduring the immigrationalso called<h4 class=\"distinctionreplaced bygovernmentslocation ofin Novemberwhether the</p>\n</div>acquisitioncalled the persecutiondesignation{font-size:appeared ininvestigateexperiencedmost likelywidely useddiscussionspresence of (document.extensivelyIt has beenit does notcontrary toinhabitantsimprovementscholarshipconsumptioninstructionfor exampleone or morepx; paddingthe currenta series ofare usuallyrole in thepreviously derivativesevidence ofexperiencescolorschemestated thatcertificate</a></div>\n selected=\"high schoolresponse tocomfortableadoption ofthree yearsthe countryin Februaryso that thepeople who provided by<param nameaffected byin terms ofappointmentISO-8859-1\"was born inhistorical regarded asmeasurementis based on and other : function(significantcelebrationtransmitted/js/jquery.is known astheoretical tabindex=\"it could be<noscript>\nhaving been\r\n<head>\r\n< &quot;The compilationhe had beenproduced byphilosopherconstructedintended toamong othercompared toto say thatEngineeringa differentreferred todifferencesbelief thatphotographsidentifyingHistory of Republic ofnecessarilyprobabilitytechnicallyleaving thespectacularfraction ofelectricityhead of therestaurantspartnershipemphasis onmost recentshare with saying thatfilled withdesigned toit is often\"></iframe>as follows:merged withthrough thecommercial pointed outopportunityview of therequirementdivision ofprogramminghe receivedsetInterval\"></span></in New Yorkadditional compression\n\n<div id=\"incorporate;</script><attachEventbecame the \" target=\"_carried outSome of thescience andthe time ofContainer\">maintainingChristopherMuch of thewritings of\" height=\"2size of theversion of mixture of between theExamples ofeducationalcompetitive onsubmit=\"director ofdistinctive/DTD XHTML relating totendency toprovince ofwhich woulddespite thescientific legislature.innerHTML allegationsAgriculturewas used inapproach tointelligentyears later,sans-serifdeterminingPerformanceappearances, which is foundationsabbreviatedhigher thans from the individual composed ofsupposed toclaims thatattributionfont-size:1elements ofHistorical his brotherat the timeanniversarygoverned byrelated to ultimately innovationsit is stillcan only bedefinitionstoGMTStringA number ofimg class=\"Eventually,was changedoccurred inneighboringdistinguishwhen he wasintroducingterrestrialMany of theargues thatan Americanconquest ofwidespread were killedscreen and In order toexpected todescendantsare locatedlegislativegenerations backgroundmost peopleyears afterthere is nothe highestfrequently they do notargued thatshowed thatpredominanttheologicalby the timeconsideringshort-lived</span></a>can be usedvery littleone of the had alreadyinterpretedcommunicatefeatures ofgovernment,</noscript>entered the\" height=\"3Independentpopulationslarge-scale. Although used in thedestructionpossibilitystarting intwo or moreexpressionssubordinatelarger thanhistory and</option>\r\nContinentaleliminatingwill not bepractice ofin front ofsite of theensure thatto create amississippipotentiallyoutstandingbetter thanwhat is nowsituated inmeta name=\"TraditionalsuggestionsTranslationthe form ofatmosphericideologicalenterprisescalculatingeast of theremnants ofpluginspage/index.php?remained intransformedHe was alsowas alreadystatisticalin favor ofMinistry ofmovement offormulationis required<link rel=\"This is the <a href=\"/popularizedinvolved inare used toand severalmade by theseems to belikely thatPalestiniannamed afterit had beenmost commonto refer tobut this isconsecutivetemporarilyIn general,conventionstakes placesubdivisionterritorialoperationalpermanentlywas largelyoutbreak ofin the pastfollowing a xmlns:og=\"><a class=\"class=\"textConversion may be usedmanufactureafter beingclearfix\">\nquestion ofwas electedto become abecause of some peopleinspired bysuccessful a time whenmore commonamongst thean officialwidth:100%;technology,was adoptedto keep thesettlementslive birthsindex.html\"Connecticutassigned to&amp;times;account foralign=rightthe companyalways beenreturned toinvolvementBecause thethis period\" name=\"q\" confined toa result ofvalue=\"\" />is actuallyEnvironment\r\n</head>\r\nConversely,>\n<div id=\"0\" width=\"1is probablyhave becomecontrollingthe problemcitizens ofpoliticiansreached theas early as:none; over<table cellvalidity ofdirectly toonmousedownwhere it iswhen it wasmembers of relation toaccommodatealong with In the latethe Englishdelicious\">this is notthe presentif they areand finallya matter of\r\n\t</div>\r\n\r\n</script>faster thanmajority ofafter whichcomparativeto maintainimprove theawarded theer\" class=\"frameborderrestorationin the sameanalysis oftheir firstDuring the continentalsequence offunction(){font-size: work on the</script>\n<begins withjavascript:constituentwas foundedequilibriumassume thatis given byneeds to becoordinatesthe variousare part ofonly in thesections ofis a commontheories ofdiscoveriesassociationedge of thestrength ofposition inpresent-dayuniversallyto form thebut insteadcorporationattached tois commonlyreasons for &quot;the can be madewas able towhich meansbut did notonMouseOveras possibleoperated bycoming fromthe primaryaddition offor severaltransferreda period ofare able tohowever, itshould havemuch larger\n\t</script>adopted theproperty ofdirected byeffectivelywas broughtchildren ofProgramminglonger thanmanuscriptswar againstby means ofand most ofsimilar to proprietaryoriginatingprestigiousgrammaticalexperience.to make theIt was alsois found incompetitorsin the U.S.replace thebrought thecalculationfall of thethe generalpracticallyin honor ofreleased inresidentialand some ofking of thereaction to1st Earl ofculture andprincipally</title>\n  they can beback to thesome of hisexposure toare similarform of theaddFavoritecitizenshippart in thepeople within practiceto continue&amp;minus;approved by the first allowed theand for thefunctioningplaying thesolution toheight=\"0\" in his bookmore than afollows thecreated thepresence in&nbsp;</td>nationalistthe idea ofa characterwere forced class=\"btndays of thefeatured inshowing theinterest inin place ofturn of thethe head ofLord of thepoliticallyhas its ownEducationalapproval ofsome of theeach other,behavior ofand becauseand anotherappeared onrecorded inblack&quot;may includethe world'scan lead torefers to aborder=\"0\" government winning theresulted in while the Washington,the subjectcity in the></div>\r\n\t\treflect theto completebecame moreradioactiverejected bywithout anyhis father,which couldcopy of theto indicatea politicalaccounts ofconstitutesworked wither</a></li>of his lifeaccompaniedclientWidthprevent theLegislativedifferentlytogether inhas severalfor anothertext of thefounded thee with the is used forchanged theusually theplace wherewhereas the> <a href=\"\"><a href=\"themselves,although hethat can betraditionalrole of theas a resultremoveChilddesigned bywest of theSome peopleproduction,side of thenewslettersused by thedown to theaccepted bylive in theattempts tooutside thefrequenciesHowever, inprogrammersat least inapproximatealthough itwas part ofand variousGovernor ofthe articleturned into><a href=\"/the economyis the mostmost widelywould laterand perhapsrise to theoccurs whenunder whichconditions.the westerntheory thatis producedthe city ofin which heseen in thethe centralbuilding ofmany of hisarea of theis the onlymost of themany of thethe WesternThere is noextended toStatisticalcolspan=2 |short storypossible totopologicalcritical ofreported toa Christiandecision tois equal toproblems ofThis can bemerchandisefor most ofno evidenceeditions ofelements in&quot;. Thecom/images/which makesthe processremains theliterature,is a memberthe popularthe ancientproblems intime of thedefeated bybody of thea few yearsmuch of thethe work ofCalifornia,served as agovernment.concepts ofmovement in\t\t<div id=\"it\" value=\"language ofas they areproduced inis that theexplain thediv></div>\nHowever thelead to the\t<a href=\"/was grantedpeople havecontinuallywas seen asand relatedthe role ofproposed byof the besteach other.Constantinepeople fromdialects ofto revisionwas renameda source ofthe initiallaunched inprovide theto the westwhere thereand similarbetween twois also theEnglish andconditions,that it wasentitled tothemselves.quantity ofransparencythe same asto join thecountry andthis is theThis led toa statementcontrast tolastIndexOfthrough hisis designedthe term isis providedprotect theng</a></li>The currentthe site ofsubstantialexperience,in the Westthey shouldslovenD\rinacomentariosuniversidadcondicionesactividadesexperienciatecnologC-aproducciC3npuntuaciC3naplicaciC3ncontraseC1acategorC-asregistrarseprofesionaltratamientoregC-stratesecretarC-aprincipalesprotecciC3nimportantesimportanciaposibilidadinteresantecrecimientonecesidadessuscribirseasociaciC3ndisponiblesevaluaciC3nestudiantesresponsableresoluciC3nguadalajararegistradosoportunidadcomercialesfotografC-aautoridadesingenierC-atelevisiC3ncompetenciaoperacionesestablecidosimplementeactualmentenavegaciC3nconformidadline-height:font-family:\" : \"http://applicationslink\" href=\"specifically//<![CDATA[\nOrganizationdistribution0px; height:relationshipdevice-width<div class=\"<label for=\"registration</noscript>\n/index.html\"window.open( !important;application/independence//www.googleorganizationautocompleterequirementsconservative<form name=\"intellectualmargin-left:18th centuryan importantinstitutionsabbreviation<img class=\"organisationcivilization19th centuryarchitectureincorporated20th century-container\">most notably/></a></div>notification'undefined')Furthermore,believe thatinnerHTML = prior to thedramaticallyreferring tonegotiationsheadquartersSouth AfricaunsuccessfulPennsylvaniaAs a result,<html lang=\"&lt;/sup&gt;dealing withphiladelphiahistorically);</script>\npadding-top:experimentalgetAttributeinstructionstechnologiespart of the =function(){subscriptionl.dtd\">\r\n<htgeographicalConstitution', function(supported byagriculturalconstructionpublicationsfont-size: 1a variety of<div style=\"Encyclopediaiframe src=\"demonstratedaccomplisheduniversitiesDemographics);</script><dedicated toknowledge ofsatisfactionparticularly</div></div>English (US)appendChild(transmissions. However, intelligence\" tabindex=\"float:right;Commonwealthranging fromin which theat least onereproductionencyclopedia;font-size:1jurisdictionat that time\"><a class=\"In addition,description+conversationcontact withis generallyr\" content=\"representing&lt;math&gt;presentationoccasionally<img width=\"navigation\">compensationchampionshipmedia=\"all\" violation ofreference toreturn true;Strict//EN\" transactionsinterventionverificationInformation difficultiesChampionshipcapabilities<![endif]-->}\n</script>\nChristianityfor example,Professionalrestrictionssuggest thatwas released(such as theremoveClass(unemploymentthe Americanstructure of/index.html published inspan class=\"\"><a href=\"/introductionbelonging toclaimed thatconsequences<meta name=\"Guide to theoverwhelmingagainst the concentrated,\n.nontouch observations</a>\n</div>\nf (document.border: 1px {font-size:1treatment of0\" height=\"1modificationIndependencedivided intogreater thanachievementsestablishingJavaScript\" neverthelesssignificanceBroadcasting>&nbsp;</td>container\">\nsuch as the influence ofa particularsrc='http://navigation\" half of the substantial &nbsp;</div>advantage ofdiscovery offundamental metropolitanthe opposite\" xml:lang=\"deliberatelyalign=centerevolution ofpreservationimprovementsbeginning inJesus ChristPublicationsdisagreementtext-align:r, function()similaritiesbody></html>is currentlyalphabeticalis sometimestype=\"image/many of the flow:hidden;available indescribe theexistence ofall over thethe Internet\t<ul class=\"installationneighborhoodarmed forcesreducing thecontinues toNonetheless,temperatures\n\t\t<a href=\"close to theexamples of is about the(see below).\" id=\"searchprofessionalis availablethe official\t\t</script>\n\n\t\t<div id=\"accelerationthrough the Hall of Famedescriptionstranslationsinterference type='text/recent yearsin the worldvery popular{background:traditional some of the connected toexploitationemergence ofconstitutionA History ofsignificant manufacturedexpectations><noscript><can be foundbecause the has not beenneighbouringwithout the added to the\t<li class=\"instrumentalSoviet Unionacknowledgedwhich can bename for theattention toattempts to developmentsIn fact, the<li class=\"aimplicationssuitable formuch of the colonizationpresidentialcancelBubble Informationmost of the is describedrest of the more or lessin SeptemberIntelligencesrc=\"http://px; height: available tomanufacturerhuman rightslink href=\"/availabilityproportionaloutside the astronomicalhuman beingsname of the are found inare based onsmaller thana person whoexpansion ofarguing thatnow known asIn the earlyintermediatederived fromScandinavian</a></div>\r\nconsider thean estimatedthe National<div id=\"pagresulting incommissionedanalogous toare required/ul>\n</div>\nwas based onand became a&nbsp;&nbsp;t\" value=\"\" was capturedno more thanrespectivelycontinue to >\r\n<head>\r\n<were createdmore generalinformation used for theindependent the Imperialcomponent ofto the northinclude the Constructionside of the would not befor instanceinvention ofmore complexcollectivelybackground: text-align: its originalinto accountthis processan extensivehowever, thethey are notrejected thecriticism ofduring whichprobably thethis article(function(){It should bean agreementaccidentallydiffers fromArchitecturebetter knownarrangementsinfluence onattended theidentical tosouth of thepass throughxml\" title=\"weight:bold;creating thedisplay:nonereplaced the<img src=\"/ihttps://www.World War IItestimonialsfound in therequired to and that thebetween the was designedconsists of considerablypublished bythe languageConservationconsisted ofrefer to theback to the css\" media=\"People from available onproved to besuggestions\"was known asvarieties oflikely to becomprised ofsupport the hands of thecoupled withconnect and border:none;performancesbefore beinglater becamecalculationsoften calledresidents ofmeaning that><li class=\"evidence forexplanationsenvironments\"></a></div>which allowsIntroductiondeveloped bya wide rangeon behalf ofvalign=\"top\"principle ofat the time,</noscript>\rsaid to havein the firstwhile othershypotheticalphilosopherspower of thecontained inperformed byinability towere writtenspan style=\"input name=\"the questionintended forrejection ofimplies thatinvented thethe standardwas probablylink betweenprofessor ofinteractionschanging theIndian Ocean class=\"lastworking with'http://www.years beforeThis was therecreationalentering themeasurementsan extremelyvalue of thestart of the\n</script>\n\nan effort toincrease theto the southspacing=\"0\">sufficientlythe Europeanconverted toclearTimeoutdid not haveconsequentlyfor the nextextension ofeconomic andalthough theare producedand with theinsufficientgiven by thestating thatexpenditures</span></a>\nthought thaton the basiscellpadding=image of thereturning toinformation,separated byassassinateds\" content=\"authority ofnorthwestern</div>\n<div \"></div>\r\n  consultationcommunity ofthe nationalit should beparticipants align=\"leftthe greatestselection ofsupernaturaldependent onis mentionedallowing thewas inventedaccompanyinghis personalavailable atstudy of theon the otherexecution ofHuman Rightsterms of theassociationsresearch andsucceeded bydefeated theand from thebut they arecommander ofstate of theyears of agethe study of<ul class=\"splace in thewhere he was<li class=\"fthere are nowhich becamehe publishedexpressed into which thecommissionerfont-weight:territory ofextensions\">Roman Empireequal to theIn contrast,however, andis typicallyand his wife(also called><ul class=\"effectively evolved intoseem to havewhich is thethere was noan excellentall of thesedescribed byIn practice,broadcastingcharged withreflected insubjected tomilitary andto the pointeconomicallysetTargetingare actuallyvictory over();</script>continuouslyrequired forevolutionaryan effectivenorth of the, which was front of theor otherwisesome form ofhad not beengenerated byinformation.permitted toincludes thedevelopment,entered intothe previousconsistentlyare known asthe field ofthis type ofgiven to thethe title ofcontains theinstances ofin the northdue to theirare designedcorporationswas that theone of thesemore popularsucceeded insupport fromin differentdominated bydesigned forownership ofand possiblystandardizedresponseTextwas intendedreceived theassumed thatareas of theprimarily inthe basis ofin the senseaccounts fordestroyed byat least twowas declaredcould not beSecretary ofappear to bemargin-top:1/^\\s+|\\s+$/ge){throw e};the start oftwo separatelanguage andwho had beenoperation ofdeath of thereal numbers\t<link rel=\"provided thethe story ofcompetitionsenglish (UK)english (US)P\u001CP>P=P3P>P;P!Q\u0000P?Q\u0001P:P8Q\u0001Q\u0000P?Q\u0001P:P8Q\u0001Q\u0000P?Q\u0001P:P>Y\u0004X9X1X(Y\nX)f-#i+\u0014d8-f\u0016\u0007g.\u0000d=\u0013d8-f\u0016\u0007g9\u0001d=\u0013d8-f\u0016\u0007f\u001C\ti\u0019\u0010e\u0005,e\u000F8d::f0\u0011f\u0014?e:\u001Ci\u0018?i\u0007\u000Ce74e74g$>d<\u001Ad8;d9\tf\u0013\rd=\u001Cg3;g;\u001Ff\u0014?g-\u0016f3\u0015h'\u0004informaciC3nherramientaselectrC3nicodescripciC3nclasificadosconocimientopublicaciC3nrelacionadasinformC!ticarelacionadosdepartamentotrabajadoresdirectamenteayuntamientomercadoLibrecontC!ctenoshabitacionescumplimientorestaurantesdisposiciC3nconsecuenciaelectrC3nicaaplicacionesdesconectadoinstalaciC3nrealizaciC3nutilizaciC3nenciclopediaenfermedadesinstrumentosexperienciasinstituciC3nparticularessubcategoriaQ\u0002P>P;Q\u000CP:P>P P>Q\u0001Q\u0001P8P8Q\u0000P0P1P>Q\u0002Q\u000BP1P>P;Q\u000CQ\u0008P5P?Q\u0000P>Q\u0001Q\u0002P>P<P>P6P5Q\u0002P5P4Q\u0000Q\u0003P3P8Q\u0005Q\u0001P;Q\u0003Q\u0007P0P5Q\u0001P5P9Q\u0007P0Q\u0001P2Q\u0001P5P3P4P0P P>Q\u0001Q\u0001P8Q\u000FP\u001CP>Q\u0001P:P2P5P4Q\u0000Q\u0003P3P8P5P3P>Q\u0000P>P4P0P2P>P?Q\u0000P>Q\u0001P4P0P=P=Q\u000BQ\u0005P4P>P;P6P=Q\u000BP8P<P5P=P=P>P\u001CP>Q\u0001P:P2Q\u000BQ\u0000Q\u0003P1P;P5P9P\u001CP>Q\u0001P:P2P0Q\u0001Q\u0002Q\u0000P0P=Q\u000BP=P8Q\u0007P5P3P>Q\u0000P0P1P>Q\u0002P5P4P>P;P6P5P=Q\u0003Q\u0001P;Q\u0003P3P8Q\u0002P5P?P5Q\u0000Q\u000CP\u001EP4P=P0P:P>P?P>Q\u0002P>P<Q\u0003Q\u0000P0P1P>Q\u0002Q\u0003P0P?Q\u0000P5P;Q\u000FP2P>P>P1Q\tP5P>P4P=P>P3P>Q\u0001P2P>P5P3P>Q\u0001Q\u0002P0Q\u0002Q\u000CP8P4Q\u0000Q\u0003P3P>P9Q\u0004P>Q\u0000Q\u0003P<P5Q\u0005P>Q\u0000P>Q\u0008P>P?Q\u0000P>Q\u0002P8P2Q\u0001Q\u0001Q\u000BP;P:P0P:P0P6P4Q\u000BP9P2P;P0Q\u0001Q\u0002P8P3Q\u0000Q\u0003P?P?Q\u000BP2P<P5Q\u0001Q\u0002P5Q\u0000P0P1P>Q\u0002P0Q\u0001P:P0P7P0P;P?P5Q\u0000P2Q\u000BP9P4P5P;P0Q\u0002Q\u000CP4P5P=Q\u000CP3P8P?P5Q\u0000P8P>P4P1P8P7P=P5Q\u0001P>Q\u0001P=P>P2P5P<P>P<P5P=Q\u0002P:Q\u0003P?P8Q\u0002Q\u000CP4P>P;P6P=P0Q\u0000P0P<P:P0Q\u0005P=P0Q\u0007P0P;P>P P0P1P>Q\u0002P0P\"P>P;Q\u000CP:P>Q\u0001P>P2Q\u0001P5P<P2Q\u0002P>Q\u0000P>P9P=P0Q\u0007P0P;P0Q\u0001P?P8Q\u0001P>P:Q\u0001P;Q\u0003P6P1Q\u000BQ\u0001P8Q\u0001Q\u0002P5P<P?P5Q\u0007P0Q\u0002P8P=P>P2P>P3P>P?P>P<P>Q\tP8Q\u0001P0P9Q\u0002P>P2P?P>Q\u0007P5P<Q\u0003P?P>P<P>Q\tQ\u000CP4P>P;P6P=P>Q\u0001Q\u0001Q\u000BP;P:P8P1Q\u000BQ\u0001Q\u0002Q\u0000P>P4P0P=P=Q\u000BP5P<P=P>P3P8P5P?Q\u0000P>P5P:Q\u0002P!P5P9Q\u0007P0Q\u0001P<P>P4P5P;P8Q\u0002P0P:P>P3P>P>P=P;P0P9P=P3P>Q\u0000P>P4P5P2P5Q\u0000Q\u0001P8Q\u000FQ\u0001Q\u0002Q\u0000P0P=P5Q\u0004P8P;Q\u000CP<Q\u000BQ\u0003Q\u0000P>P2P=Q\u000FQ\u0000P0P7P=Q\u000BQ\u0005P8Q\u0001P:P0Q\u0002Q\u000CP=P5P4P5P;Q\u000EQ\u000FP=P2P0Q\u0000Q\u000FP<P5P=Q\u000CQ\u0008P5P<P=P>P3P8Q\u0005P4P0P=P=P>P9P7P=P0Q\u0007P8Q\u0002P=P5P;Q\u000CP7Q\u000FQ\u0004P>Q\u0000Q\u0003P<P0P\"P5P?P5Q\u0000Q\u000CP<P5Q\u0001Q\u000FQ\u0006P0P7P0Q\tP8Q\u0002Q\u000BP\u001BQ\u0003Q\u0007Q\u0008P8P5`$(`$9`%\u0000`$\u0002`$\u0015`$0`$(`%\u0007`$\u0005`$*`$(`%\u0007`$\u0015`$?`$/`$>`$\u0015`$0`%\u0007`$\u0002`$\u0005`$(`%\r`$/`$\u0015`%\r`$/`$>`$\u0017`$>`$\u0007`$!`$,`$>`$0`%\u0007`$\u0015`$?`$8`%\u0000`$&`$?`$/`$>`$*`$9`$2`%\u0007`$8`$?`$\u0002`$9`$-`$>`$0`$$`$\u0005`$*`$(`%\u0000`$5`$>`$2`%\u0007`$8`%\u0007`$5`$>`$\u0015`$0`$$`%\u0007`$.`%\u0007`$0`%\u0007`$9`%\u000B`$(`%\u0007`$8`$\u0015`$$`%\u0007`$,`$9`%\u0001`$$`$8`$>`$\u0007`$\u001F`$9`%\u000B`$\u0017`$>`$\u001C`$>`$(`%\u0007`$.`$?`$(`$\u001F`$\u0015`$0`$$`$>`$\u0015`$0`$(`$>`$\t`$(`$\u0015`%\u0007`$/`$9`$>`$\u0001`$8`$,`$8`%\u0007`$-`$>`$7`$>`$\u0006`$*`$\u0015`%\u0007`$2`$?`$/`%\u0007`$6`%\u0001`$0`%\u0002`$\u0007`$8`$\u0015`%\u0007`$\u0018`$\u0002`$\u001F`%\u0007`$.`%\u0007`$0`%\u0000`$8`$\u0015`$$`$>`$.`%\u0007`$0`$>`$2`%\u0007`$\u0015`$0`$\u0005`$'`$?`$\u0015`$\u0005`$*`$(`$>`$8`$.`$>`$\u001C`$.`%\u0001`$\u001D`%\u0007`$\u0015`$>`$0`$#`$9`%\u000B`$$`$>`$\u0015`$!`$<`%\u0000`$/`$9`$>`$\u0002`$9`%\u000B`$\u001F`$2`$6`$,`%\r`$&`$2`$?`$/`$>`$\u001C`%\u0000`$5`$(`$\u001C`$>`$$`$>`$\u0015`%\u0008`$8`%\u0007`$\u0006`$*`$\u0015`$>`$5`$>`$2`%\u0000`$&`%\u0007`$(`%\u0007`$*`%\u0002`$0`%\u0000`$*`$>`$(`%\u0000`$\t`$8`$\u0015`%\u0007`$9`%\u000B`$\u0017`%\u0000`$,`%\u0008`$ `$\u0015`$\u0006`$*`$\u0015`%\u0000`$5`$0`%\r`$7`$\u0017`$>`$\u0002`$5`$\u0006`$*`$\u0015`%\u000B`$\u001C`$?`$2`$>`$\u001C`$>`$(`$>`$8`$9`$.`$$`$9`$.`%\u0007`$\u0002`$\t`$(`$\u0015`%\u0000`$/`$>`$9`%\u0002`$&`$0`%\r`$\u001C`$8`%\u0002`$\u001A`%\u0000`$*`$8`$\u0002`$&`$8`$5`$>`$2`$9`%\u000B`$(`$>`$9`%\u000B`$$`%\u0000`$\u001C`%\u0008`$8`%\u0007`$5`$>`$*`$8`$\u001C`$(`$$`$>`$(`%\u0007`$$`$>`$\u001C`$>`$0`%\u0000`$\u0018`$>`$/`$2`$\u001C`$?`$2`%\u0007`$(`%\u0000`$\u001A`%\u0007`$\u001C`$>`$\u0002`$\u001A`$*`$$`%\r`$0`$\u0017`%\u0002`$\u0017`$2`$\u001C`$>`$$`%\u0007`$,`$>`$9`$0`$\u0006`$*`$(`%\u0007`$5`$>`$9`$(`$\u0007`$8`$\u0015`$>`$8`%\u0001`$,`$9`$0`$9`$(`%\u0007`$\u0007`$8`$8`%\u0007`$8`$9`$?`$$`$,`$!`$<`%\u0007`$\u0018`$\u001F`$(`$>`$$`$2`$>`$6`$*`$>`$\u0002`$\u001A`$6`%\r`$0`%\u0000`$,`$!`$<`%\u0000`$9`%\u000B`$$`%\u0007`$8`$>`$\u0008`$\u001F`$6`$>`$/`$&`$8`$\u0015`$$`%\u0000`$\u001C`$>`$$`%\u0000`$5`$>`$2`$>`$9`$\u001C`$>`$0`$*`$\u001F`$(`$>`$0`$\u0016`$(`%\u0007`$8`$!`$<`$\u0015`$.`$?`$2`$>`$\t`$8`$\u0015`%\u0000`$\u0015`%\u0007`$5`$2`$2`$\u0017`$$`$>`$\u0016`$>`$(`$>`$\u0005`$0`%\r`$%`$\u001C`$9`$>`$\u0002`$&`%\u0007`$\u0016`$>`$*`$9`$2`%\u0000`$(`$?`$/`$.`$,`$?`$(`$>`$,`%\u0008`$\u0002`$\u0015`$\u0015`$9`%\u0000`$\u0002`$\u0015`$9`$(`$>`$&`%\u0007`$$`$>`$9`$.`$2`%\u0007`$\u0015`$>`$+`%\u0000`$\u001C`$,`$\u0015`$?`$$`%\u0001`$0`$$`$.`$>`$\u0002`$\u0017`$5`$9`%\u0000`$\u0002`$0`%\u000B`$\u001C`$<`$.`$?`$2`%\u0000`$\u0006`$0`%\u000B`$*`$8`%\u0007`$(`$>`$/`$>`$&`$5`$2`%\u0007`$(`%\u0007`$\u0016`$>`$$`$>`$\u0015`$0`%\u0000`$,`$\t`$(`$\u0015`$>`$\u001C`$5`$>`$,`$*`%\u0002`$0`$>`$,`$!`$<`$>`$8`%\u000C`$&`$>`$6`%\u0007`$/`$0`$\u0015`$?`$/`%\u0007`$\u0015`$9`$>`$\u0002`$\u0005`$\u0015`$8`$0`$,`$(`$>`$\u000F`$5`$9`$>`$\u0002`$8`%\r`$%`$2`$.`$?`$2`%\u0007`$2`%\u0007`$\u0016`$\u0015`$5`$?`$7`$/`$\u0015`%\r`$0`$\u0002`$8`$.`%\u0002`$9`$%`$>`$(`$>X*X3X*X7Y\nX9Y\u0005X4X'X1Y\u0003X)X(Y\u0008X'X3X7X)X'Y\u0004X5Y\u0001X-X)Y\u0005Y\u0008X'X6Y\nX9X'Y\u0004X.X'X5X)X'Y\u0004Y\u0005X2Y\nX/X'Y\u0004X9X'Y\u0005X)X'Y\u0004Y\u0003X'X*X(X'Y\u0004X1X/Y\u0008X/X(X1Y\u0006X'Y\u0005X,X'Y\u0004X/Y\u0008Y\u0004X)X'Y\u0004X9X'Y\u0004Y\u0005X'Y\u0004Y\u0005Y\u0008Y\u0002X9X'Y\u0004X9X1X(Y\nX'Y\u0004X3X1Y\nX9X'Y\u0004X,Y\u0008X'Y\u0004X'Y\u0004X0Y\u0007X'X(X'Y\u0004X-Y\nX'X)X'Y\u0004X-Y\u0002Y\u0008Y\u0002X'Y\u0004Y\u0003X1Y\nY\u0005X'Y\u0004X9X1X'Y\u0002Y\u0005X-Y\u0001Y\u0008X8X)X'Y\u0004X+X'Y\u0006Y\nY\u0005X4X'Y\u0007X/X)X'Y\u0004Y\u0005X1X#X)X'Y\u0004Y\u0002X1X\"Y\u0006X'Y\u0004X4X(X'X(X'Y\u0004X-Y\u0008X'X1X'Y\u0004X,X/Y\nX/X'Y\u0004X#X3X1X)X'Y\u0004X9Y\u0004Y\u0008Y\u0005Y\u0005X,Y\u0005Y\u0008X9X)X'Y\u0004X1X-Y\u0005Y\u0006X'Y\u0004Y\u0006Y\u0002X'X7Y\u0001Y\u0004X3X7Y\nY\u0006X'Y\u0004Y\u0003Y\u0008Y\nX*X'Y\u0004X/Y\u0006Y\nX'X(X1Y\u0003X'X*Y\u0007X'Y\u0004X1Y\nX'X6X*X-Y\nX'X*Y\nX(X*Y\u0008Y\u0002Y\nX*X'Y\u0004X#Y\u0008Y\u0004Y\tX'Y\u0004X(X1Y\nX/X'Y\u0004Y\u0003Y\u0004X'Y\u0005X'Y\u0004X1X'X(X7X'Y\u0004X4X.X5Y\nX3Y\nX'X1X'X*X'Y\u0004X+X'Y\u0004X+X'Y\u0004X5Y\u0004X'X)X'Y\u0004X-X/Y\nX+X'Y\u0004X2Y\u0008X'X1X'Y\u0004X.Y\u0004Y\nX,X'Y\u0004X,Y\u0005Y\nX9X'Y\u0004X9X'Y\u0005Y\u0007X'Y\u0004X,Y\u0005X'Y\u0004X'Y\u0004X3X'X9X)Y\u0005X4X'Y\u0007X/Y\u0007X'Y\u0004X1X&Y\nX3X'Y\u0004X/X.Y\u0008Y\u0004X'Y\u0004Y\u0001Y\u0006Y\nX)X'Y\u0004Y\u0003X*X'X(X'Y\u0004X/Y\u0008X1Y\nX'Y\u0004X/X1Y\u0008X3X'X3X*X:X1Y\u0002X*X5X'Y\u0005Y\nY\u0005X'Y\u0004X(Y\u0006X'X*X'Y\u0004X9X8Y\nY\u0005entertainmentunderstanding = function().jpg\" width=\"configuration.png\" width=\"<body class=\"Math.random()contemporary United Statescircumstances.appendChild(organizations<span class=\"\"><img src=\"/distinguishedthousands of communicationclear\"></div>investigationfavicon.ico\" margin-right:based on the Massachusettstable border=internationalalso known aspronunciationbackground:#fpadding-left:For example, miscellaneous&lt;/math&gt;psychologicalin particularearch\" type=\"form method=\"as opposed toSupreme Courtoccasionally Additionally,North Americapx;backgroundopportunitiesEntertainment.toLowerCase(manufacturingprofessional combined withFor instance,consisting of\" maxlength=\"return false;consciousnessMediterraneanextraordinaryassassinationsubsequently button type=\"the number ofthe original comprehensiverefers to the</ul>\n</div>\nphilosophicallocation.hrefwas publishedSan Francisco(function(){\n<div id=\"mainsophisticatedmathematical /head>\r\n<bodysuggests thatdocumentationconcentrationrelationshipsmay have been(for example,This article in some casesparts of the definition ofGreat Britain cellpadding=equivalent toplaceholder=\"; font-size: justificationbelieved thatsuffered fromattempted to leader of thecript\" src=\"/(function() {are available\n\t<link rel=\" src='http://interested inconventional \" alt=\"\" /></are generallyhas also beenmost popular correspondingcredited withtyle=\"border:</a></span></.gif\" width=\"<iframe src=\"table class=\"inline-block;according to together withapproximatelyparliamentarymore and moredisplay:none;traditionallypredominantly&nbsp;|&nbsp;&nbsp;</span> cellspacing=<input name=\"or\" content=\"controversialproperty=\"og:/x-shockwave-demonstrationsurrounded byNevertheless,was the firstconsiderable Although the collaborationshould not beproportion of<span style=\"known as the shortly afterfor instance,described as /head>\n<body starting withincreasingly the fact thatdiscussion ofmiddle of thean individualdifficult to point of viewhomosexualityacceptance of</span></div>manufacturersorigin of thecommonly usedimportance ofdenominationsbackground: #length of thedeterminationa significant\" border=\"0\">revolutionaryprinciples ofis consideredwas developedIndo-Europeanvulnerable toproponents ofare sometimescloser to theNew York City name=\"searchattributed tocourse of themathematicianby the end ofat the end of\" border=\"0\" technological.removeClass(branch of theevidence that![endif]-->\r\nInstitute of into a singlerespectively.and thereforeproperties ofis located insome of whichThere is alsocontinued to appearance of &amp;ndash; describes theconsiderationauthor of theindependentlyequipped withdoes not have</a><a href=\"confused with<link href=\"/at the age ofappear in theThese includeregardless ofcould be used style=&quot;several timesrepresent thebody>\n</html>thought to bepopulation ofpossibilitiespercentage ofaccess to thean attempt toproduction ofjquery/jquerytwo differentbelong to theestablishmentreplacing thedescription\" determine theavailable forAccording to wide range of\t<div class=\"more commonlyorganisationsfunctionalitywas completed &amp;mdash; participationthe characteran additionalappears to befact that thean example ofsignificantlyonmouseover=\"because they async = true;problems withseems to havethe result of src=\"http://familiar withpossession offunction () {took place inand sometimessubstantially<span></span>is often usedin an attemptgreat deal ofEnvironmentalsuccessfully virtually all20th century,professionalsnecessary to determined bycompatibilitybecause it isDictionary ofmodificationsThe followingmay refer to:Consequently,Internationalalthough somethat would beworld's firstclassified asbottom of the(particularlyalign=\"left\" most commonlybasis for thefoundation ofcontributionspopularity ofcenter of theto reduce thejurisdictionsapproximation onmouseout=\"New Testamentcollection of</span></a></in the Unitedfilm director-strict.dtd\">has been usedreturn to thealthough thischange in theseveral otherbut there areunprecedentedis similar toespecially inweight: bold;is called thecomputationalindicate thatrestricted to\t<meta name=\"are typicallyconflict withHowever, the An example ofcompared withquantities ofrather than aconstellationnecessary forreported thatspecificationpolitical and&nbsp;&nbsp;<references tothe same yearGovernment ofgeneration ofhave not beenseveral yearscommitment to\t\t<ul class=\"visualization19th century,practitionersthat he wouldand continuedoccupation ofis defined ascentre of thethe amount of><div style=\"equivalent ofdifferentiatebrought aboutmargin-left: automaticallythought of asSome of these\n<div class=\"input class=\"replaced withis one of theeducation andinfluenced byreputation as\n<meta name=\"accommodation</div>\n</div>large part ofInstitute forthe so-called against the In this case,was appointedclaimed to beHowever, thisDepartment ofthe remainingeffect on theparticularly deal with the\n<div style=\"almost alwaysare currentlyexpression ofphilosophy offor more thancivilizationson the islandselectedIndexcan result in\" value=\"\" />the structure /></a></div>Many of thesecaused by theof the Unitedspan class=\"mcan be tracedis related tobecame one ofis frequentlyliving in thetheoreticallyFollowing theRevolutionarygovernment inis determinedthe politicalintroduced insufficient todescription\">short storiesseparation ofas to whetherknown for itswas initiallydisplay:blockis an examplethe principalconsists of arecognized as/body></html>a substantialreconstructedhead of stateresistance toundergraduateThere are twogravitationalare describedintentionallyserved as theclass=\"headeropposition tofundamentallydominated theand the otheralliance withwas forced torespectively,and politicalin support ofpeople in the20th century.and publishedloadChartbeatto understandmember statesenvironmentalfirst half ofcountries andarchitecturalbe consideredcharacterizedclearIntervalauthoritativeFederation ofwas succeededand there area consequencethe Presidentalso includedfree softwaresuccession ofdeveloped thewas destroyedaway from the;\n</script>\n<although theyfollowed by amore powerfulresulted in aUniversity ofHowever, manythe presidentHowever, someis thought tountil the endwas announcedare importantalso includes><input type=the center of DO NOT ALTERused to referthemes/?sort=that had beenthe basis forhas developedin the summercomparativelydescribed thesuch as thosethe resultingis impossiblevarious otherSouth Africanhave the sameeffectivenessin which case; text-align:structure and; background:regarding thesupported theis also knownstyle=\"marginincluding thebahasa Melayunorsk bokmC%lnorsk nynorskslovenE!D\rinainternacionalcalificaciC3ncomunicaciC3nconstrucciC3n\"><div class=\"disambiguationDomainName', 'administrationsimultaneouslytransportationInternational margin-bottom:responsibility<![endif]-->\n</><meta name=\"implementationinfrastructurerepresentationborder-bottom:</head>\n<body>=http%3A%2F%2F<form method=\"method=\"post\" /favicon.ico\" });\n</script>\n.setAttribute(Administration= new Array();<![endif]-->\r\ndisplay:block;Unfortunately,\">&nbsp;</div>/favicon.ico\">='stylesheet' identification, for example,<li><a href=\"/an alternativeas a result ofpt\"></script>\ntype=\"submit\" \n(function() {recommendationform action=\"/transformationreconstruction.style.display According to hidden\" name=\"along with thedocument.body.approximately Communicationspost\" action=\"meaning &quot;--<![endif]-->Prime Ministercharacteristic</a> <a class=the history of onmouseover=\"the governmenthref=\"https://was originallywas introducedclassificationrepresentativeare considered<![endif]-->\n\ndepends on theUniversity of in contrast to placeholder=\"in the case ofinternational constitutionalstyle=\"border-: function() {Because of the-strict.dtd\">\n<table class=\"accompanied byaccount of the<script src=\"/nature of the the people in in addition tos); js.id = id\" width=\"100%\"regarding the Roman Catholican independentfollowing the .gif\" width=\"1the following discriminationarchaeologicalprime minister.js\"></script>combination of marginwidth=\"createElement(w.attachEvent(</a></td></tr>src=\"https://aIn particular, align=\"left\" Czech RepublicUnited Kingdomcorrespondenceconcluded that.html\" title=\"(function () {comes from theapplication of<span class=\"sbelieved to beement('script'</a>\n</li>\n<livery different><span class=\"option value=\"(also known as\t<li><a href=\"><input name=\"separated fromreferred to as valign=\"top\">founder of theattempting to carbon dioxide\n\n<div class=\"class=\"search-/body>\n</html>opportunity tocommunications</head>\r\n<body style=\"width:Tia:?ng Via;\u0007tchanges in theborder-color:#0\" border=\"0\" </span></div><was discovered\" type=\"text\" );\n</script>\n\nDepartment of ecclesiasticalthere has beenresulting from</body></html>has never beenthe first timein response toautomatically </div>\n\n<div iwas consideredpercent of the\" /></a></div>collection of descended fromsection of theaccept-charsetto be confusedmember of the padding-right:translation ofinterpretation href='http://whether or notThere are alsothere are manya small numberother parts ofimpossible to  class=\"buttonlocated in the. However, theand eventuallyAt the end of because of itsrepresents the<form action=\" method=\"post\"it is possiblemore likely toan increase inhave also beencorresponds toannounced thatalign=\"right\">many countriesfor many yearsearliest knownbecause it waspt\"></script>\r valign=\"top\" inhabitants offollowing year\r\n<div class=\"million peoplecontroversial concerning theargue that thegovernment anda reference totransferred todescribing the style=\"color:although therebest known forsubmit\" name=\"multiplicationmore than one recognition ofCouncil of theedition of the  <meta name=\"Entertainment away from the ;margin-right:at the time ofinvestigationsconnected withand many otheralthough it isbeginning with <span class=\"descendants of<span class=\"i align=\"right\"</head>\n<body aspects of thehas since beenEuropean Unionreminiscent ofmore difficultVice Presidentcomposition ofpassed throughmore importantfont-size:11pxexplanation ofthe concept ofwritten in the\t<span class=\"is one of the resemblance toon the groundswhich containsincluding the defined by thepublication ofmeans that theoutside of thesupport of the<input class=\"<span class=\"t(Math.random()most prominentdescription ofConstantinoplewere published<div class=\"seappears in the1\" height=\"1\" most importantwhich includeswhich had beendestruction ofthe population\n\t<div class=\"possibility ofsometimes usedappear to havesuccess of theintended to bepresent in thestyle=\"clear:b\r\n</script>\r\n<was founded ininterview with_id\" content=\"capital of the\r\n<link rel=\"srelease of thepoint out thatxMLHttpRequestand subsequentsecond largestvery importantspecificationssurface of theapplied to theforeign policy_setDomainNameestablished inis believed toIn addition tomeaning of theis named afterto protect theis representedDeclaration ofmore efficientClassificationother forms ofhe returned to<span class=\"cperformance of(function() {\rif and only ifregions of theleading to therelations withUnited Nationsstyle=\"height:other than theype\" content=\"Association of\n</head>\n<bodylocated on theis referred to(including theconcentrationsthe individualamong the mostthan any other/>\n<link rel=\" return false;the purpose ofthe ability to;color:#fff}\n.\n<span class=\"the subject ofdefinitions of>\r\n<link rel=\"claim that thehave developed<table width=\"celebration ofFollowing the to distinguish<span class=\"btakes place inunder the namenoted that the><![endif]-->\nstyle=\"margin-instead of theintroduced thethe process ofincreasing thedifferences inestimated thatespecially the/div><div id=\"was eventuallythroughout histhe differencesomething thatspan></span></significantly ></script>\r\n\r\nenvironmental to prevent thehave been usedespecially forunderstand theis essentiallywere the firstis the largesthave been made\" src=\"http://interpreted assecond half ofcrolling=\"no\" is composed ofII, Holy Romanis expected tohave their owndefined as thetraditionally have differentare often usedto ensure thatagreement withcontaining theare frequentlyinformation onexample is theresulting in a</a></li></ul> class=\"footerand especiallytype=\"button\" </span></span>which included>\n<meta name=\"considered thecarried out byHowever, it isbecame part ofin relation topopular in thethe capital ofwas officiallywhich has beenthe History ofalternative todifferent fromto support thesuggested thatin the process  <div class=\"the foundationbecause of hisconcerned withthe universityopposed to thethe context of<span class=\"ptext\" name=\"q\"\t\t<div class=\"the scientificrepresented bymathematicianselected by thethat have been><div class=\"cdiv id=\"headerin particular,converted into);\n</script>\n<philosophical srpskohrvatskitia:?ng Via;\u0007tP Q\u0003Q\u0001Q\u0001P:P8P9Q\u0000Q\u0003Q\u0001Q\u0001P:P8P9investigaciC3nparticipaciC3nP:P>Q\u0002P>Q\u0000Q\u000BP5P>P1P;P0Q\u0001Q\u0002P8P:P>Q\u0002P>Q\u0000Q\u000BP9Q\u0007P5P;P>P2P5P:Q\u0001P8Q\u0001Q\u0002P5P<Q\u000BP\u001DP>P2P>Q\u0001Q\u0002P8P:P>Q\u0002P>Q\u0000Q\u000BQ\u0005P>P1P;P0Q\u0001Q\u0002Q\u000CP2Q\u0000P5P<P5P=P8P:P>Q\u0002P>Q\u0000P0Q\u000FQ\u0001P5P3P>P4P=Q\u000FQ\u0001P:P0Q\u0007P0Q\u0002Q\u000CP=P>P2P>Q\u0001Q\u0002P8P#P:Q\u0000P0P8P=Q\u000BP2P>P?Q\u0000P>Q\u0001Q\u000BP:P>Q\u0002P>Q\u0000P>P9Q\u0001P4P5P;P0Q\u0002Q\u000CP?P>P<P>Q\tQ\u000CQ\u000EQ\u0001Q\u0000P5P4Q\u0001Q\u0002P2P>P1Q\u0000P0P7P>P<Q\u0001Q\u0002P>Q\u0000P>P=Q\u000BQ\u0003Q\u0007P0Q\u0001Q\u0002P8P5Q\u0002P5Q\u0007P5P=P8P5P\u0013P;P0P2P=P0Q\u000FP8Q\u0001Q\u0002P>Q\u0000P8P8Q\u0001P8Q\u0001Q\u0002P5P<P0Q\u0000P5Q\u0008P5P=P8Q\u000FP!P:P0Q\u0007P0Q\u0002Q\u000CP?P>Q\rQ\u0002P>P<Q\u0003Q\u0001P;P5P4Q\u0003P5Q\u0002Q\u0001P:P0P7P0Q\u0002Q\u000CQ\u0002P>P2P0Q\u0000P>P2P:P>P=P5Q\u0007P=P>Q\u0000P5Q\u0008P5P=P8P5P:P>Q\u0002P>Q\u0000P>P5P>Q\u0000P3P0P=P>P2P:P>Q\u0002P>Q\u0000P>P<P P5P:P;P0P<P0X'Y\u0004Y\u0005Y\u0006X*X/Y\tY\u0005Y\u0006X*X/Y\nX'X*X'Y\u0004Y\u0005Y\u0008X6Y\u0008X9X'Y\u0004X(X1X'Y\u0005X,X'Y\u0004Y\u0005Y\u0008X'Y\u0002X9X'Y\u0004X1X3X'X&Y\u0004Y\u0005X4X'X1Y\u0003X'X*X'Y\u0004X#X9X6X'X!X'Y\u0004X1Y\nX'X6X)X'Y\u0004X*X5Y\u0005Y\nY\u0005X'Y\u0004X'X9X6X'X!X'Y\u0004Y\u0006X*X'X&X,X'Y\u0004X#Y\u0004X9X'X(X'Y\u0004X*X3X,Y\nY\u0004X'Y\u0004X#Y\u0002X3X'Y\u0005X'Y\u0004X6X:X7X'X*X'Y\u0004Y\u0001Y\nX/Y\nY\u0008X'Y\u0004X*X1X-Y\nX(X'Y\u0004X,X/Y\nX/X)X'Y\u0004X*X9Y\u0004Y\nY\u0005X'Y\u0004X#X.X(X'X1X'Y\u0004X'Y\u0001Y\u0004X'Y\u0005X'Y\u0004X#Y\u0001Y\u0004X'Y\u0005X'Y\u0004X*X'X1Y\nX.X'Y\u0004X*Y\u0002Y\u0006Y\nX)X'Y\u0004X'Y\u0004X9X'X(X'Y\u0004X.Y\u0008X'X7X1X'Y\u0004Y\u0005X,X*Y\u0005X9X'Y\u0004X/Y\nY\u0003Y\u0008X1X'Y\u0004X3Y\nX'X-X)X9X(X/X'Y\u0004Y\u0004Y\u0007X'Y\u0004X*X1X(Y\nX)X'Y\u0004X1Y\u0008X'X(X7X'Y\u0004X#X/X(Y\nX)X'Y\u0004X'X.X(X'X1X'Y\u0004Y\u0005X*X-X/X)X'Y\u0004X'X:X'Y\u0006Y\ncursor:pointer;</title>\n<meta \" href=\"http://\"><span class=\"members of the window.locationvertical-align:/a> | <a href=\"<!doctype html>media=\"screen\" <option value=\"favicon.ico\" />\n\t\t<div class=\"characteristics\" method=\"get\" /body>\n</html>\nshortcut icon\" document.write(padding-bottom:representativessubmit\" value=\"align=\"center\" throughout the science fiction\n  <div class=\"submit\" class=\"one of the most valign=\"top\"><was established);\r\n</script>\r\nreturn false;\">).style.displaybecause of the document.cookie<form action=\"/}body{margin:0;Encyclopedia ofversion of the .createElement(name\" content=\"</div>\n</div>\n\nadministrative </body>\n</html>history of the \"><input type=\"portion of the as part of the &nbsp;<a href=\"other countries\">\n<div class=\"</span></span><In other words,display: block;control of the introduction of/>\n<meta name=\"as well as the in recent years\r\n\t<div class=\"</div>\n\t</div>\ninspired by thethe end of the compatible withbecame known as style=\"margin:.js\"></script>< International there have beenGerman language style=\"color:#Communist Partyconsistent withborder=\"0\" cell marginheight=\"the majority of\" align=\"centerrelated to the many different Orthodox Churchsimilar to the />\n<link rel=\"swas one of the until his death})();\n</script>other languagescompared to theportions of thethe Netherlandsthe most commonbackground:url(argued that thescrolling=\"no\" included in theNorth American the name of theinterpretationsthe traditionaldevelopment of frequently useda collection ofvery similar tosurrounding theexample of thisalign=\"center\">would have beenimage_caption =attached to thesuggesting thatin the form of involved in theis derived fromnamed after theIntroduction torestrictions on style=\"width: can be used to the creation ofmost important information andresulted in thecollapse of theThis means thatelements of thewas replaced byanalysis of theinspiration forregarded as themost successfulknown as &quot;a comprehensiveHistory of the were consideredreturned to theare referred toUnsourced image>\n\t<div class=\"consists of thestopPropagationinterest in theavailability ofappears to haveelectromagneticenableServices(function of theIt is important</script></div>function(){var relative to theas a result of the position ofFor example, in method=\"post\" was followed by&amp;mdash; thethe applicationjs\"></script>\r\nul></div></div>after the deathwith respect tostyle=\"padding:is particularlydisplay:inline; type=\"submit\" is divided intod8-f\u0016\u0007 (g.\u0000d=\u0013)responsabilidadadministraciC3ninternacionalescorrespondiente`$\t`$*`$/`%\u000B`$\u0017`$*`%\u0002`$0`%\r`$5`$9`$.`$>`$0`%\u0007`$2`%\u000B`$\u0017`%\u000B`$\u0002`$\u001A`%\u0001`$(`$>`$5`$2`%\u0007`$\u0015`$?`$(`$8`$0`$\u0015`$>`$0`$*`%\u0001`$2`$?`$8`$\u0016`%\u000B`$\u001C`%\u0007`$\u0002`$\u001A`$>`$9`$?`$\u000F`$-`%\u0007`$\u001C`%\u0007`$\u0002`$6`$>`$.`$?`$2`$9`$.`$>`$0`%\u0000`$\u001C`$>`$\u0017`$0`$#`$,`$(`$>`$(`%\u0007`$\u0015`%\u0001`$.`$>`$0`$,`%\r`$2`%\t`$\u0017`$.`$>`$2`$?`$\u0015`$.`$9`$?`$2`$>`$*`%\u0003`$7`%\r`$ `$,`$\"`$<`$$`%\u0007`$-`$>`$\u001C`$*`$>`$\u0015`%\r`$2`$?`$\u0015`$\u001F`%\r`$0`%\u0007`$(`$\u0016`$?`$2`$>`$+`$&`%\u000C`$0`$>`$(`$.`$>`$.`$2`%\u0007`$.`$$`$&`$>`$(`$,`$>`$\u001C`$>`$0`$5`$?`$\u0015`$>`$8`$\u0015`%\r`$/`%\u000B`$\u0002`$\u001A`$>`$9`$$`%\u0007`$*`$9`%\u0001`$\u0001`$\u001A`$,`$$`$>`$/`$>`$8`$\u0002`$5`$>`$&`$&`%\u0007`$\u0016`$(`%\u0007`$*`$?`$\u001B`$2`%\u0007`$5`$?`$6`%\u0007`$7`$0`$>`$\u001C`%\r`$/`$\t`$$`%\r`$$`$0`$.`%\u0001`$\u0002`$,`$\u0008`$&`%\u000B`$(`%\u000B`$\u0002`$\t`$*`$\u0015`$0`$#`$*`$\"`$<`%\u0007`$\u0002`$8`%\r`$%`$?`$$`$+`$?`$2`%\r`$.`$.`%\u0001`$\u0016`%\r`$/`$\u0005`$\u001A`%\r`$\u001B`$>`$\u001B`%\u0002`$\u001F`$$`%\u0000`$8`$\u0002`$\u0017`%\u0000`$$`$\u001C`$>`$\u000F`$\u0017`$>`$5`$?`$-`$>`$\u0017`$\u0018`$#`%\r`$\u001F`%\u0007`$&`%\u0002`$8`$0`%\u0007`$&`$?`$(`%\u000B`$\u0002`$9`$$`%\r`$/`$>`$8`%\u0007`$\u0015`%\r`$8`$\u0017`$>`$\u0002`$'`%\u0000`$5`$?`$6`%\r`$5`$0`$>`$$`%\u0007`$\u0002`$&`%\u0008`$\u001F`%\r`$8`$(`$\u0015`%\r`$6`$>`$8`$>`$.`$(`%\u0007`$\u0005`$&`$>`$2`$$`$,`$?`$\u001C`$2`%\u0000`$*`%\u0001`$0`%\u0002`$7`$9`$?`$\u0002`$&`%\u0000`$.`$?`$$`%\r`$0`$\u0015`$5`$?`$$`$>`$0`%\u0001`$*`$/`%\u0007`$8`%\r`$%`$>`$(`$\u0015`$0`%\u000B`$!`$<`$.`%\u0001`$\u0015`%\r`$$`$/`%\u000B`$\u001C`$(`$>`$\u0015`%\u0003`$*`$/`$>`$*`%\u000B`$8`%\r`$\u001F`$\u0018`$0`%\u0007`$2`%\u0002`$\u0015`$>`$0`%\r`$/`$5`$?`$\u001A`$>`$0`$8`%\u0002`$\u001A`$(`$>`$.`%\u0002`$2`%\r`$/`$&`%\u0007`$\u0016`%\u0007`$\u0002`$9`$.`%\u0007`$6`$>`$8`%\r`$\u0015`%\u0002`$2`$.`%\u0008`$\u0002`$(`%\u0007`$$`%\u0008`$/`$>`$0`$\u001C`$?`$8`$\u0015`%\u0007rss+xml\" title=\"-type\" content=\"title\" content=\"at the same time.js\"></script>\n<\" method=\"post\" </span></a></li>vertical-align:t/jquery.min.js\">.click(function( style=\"padding-})();\n</script>\n</span><a href=\"<a href=\"http://); return false;text-decoration: scrolling=\"no\" border-collapse:associated with Bahasa IndonesiaEnglish language<text xml:space=.gif\" border=\"0\"</body>\n</html>\noverflow:hidden;img src=\"http://addEventListenerresponsible for s.js\"></script>\n/favicon.ico\" />operating system\" style=\"width:1target=\"_blank\">State Universitytext-align:left;\ndocument.write(, including the around the world);\r\n</script>\r\n<\" style=\"height:;overflow:hiddenmore informationan internationala member of the one of the firstcan be found in </div>\n\t\t</div>\ndisplay: none;\">\" />\n<link rel=\"\n  (function() {the 15th century.preventDefault(large number of Byzantine Empire.jpg|thumb|left|vast majority ofmajority of the  align=\"center\">University Pressdominated by theSecond World Wardistribution of style=\"position:the rest of the characterized by rel=\"nofollow\">derives from therather than the a combination ofstyle=\"width:100English-speakingcomputer scienceborder=\"0\" alt=\"the existence ofDemocratic Party\" style=\"margin-For this reason,.js\"></script>\n\tsByTagName(s)[0]js\"></script>\r\n<.js\"></script>\r\nlink rel=\"icon\" ' alt='' class='formation of theversions of the </a></div></div>/page>\n  <page>\n<div class=\"contbecame the firstbahasa Indonesiaenglish (simple)N\u0015N;N;N7N=N9N:N,Q\u0005Q\u0000P2P0Q\u0002Q\u0001P:P8P:P>P<P?P0P=P8P8Q\u000FP2P;Q\u000FP5Q\u0002Q\u0001Q\u000FP\u0014P>P1P0P2P8Q\u0002Q\u000CQ\u0007P5P;P>P2P5P:P0Q\u0000P0P7P2P8Q\u0002P8Q\u000FP\u0018P=Q\u0002P5Q\u0000P=P5Q\u0002P\u001EQ\u0002P2P5Q\u0002P8Q\u0002Q\u000CP=P0P?Q\u0000P8P<P5Q\u0000P8P=Q\u0002P5Q\u0000P=P5Q\u0002P:P>Q\u0002P>Q\u0000P>P3P>Q\u0001Q\u0002Q\u0000P0P=P8Q\u0006Q\u000BP:P0Q\u0007P5Q\u0001Q\u0002P2P5Q\u0003Q\u0001P;P>P2P8Q\u000FQ\u0005P?Q\u0000P>P1P;P5P<Q\u000BP?P>P;Q\u0003Q\u0007P8Q\u0002Q\u000CQ\u000FP2P;Q\u000FQ\u000EQ\u0002Q\u0001Q\u000FP=P0P8P1P>P;P5P5P:P>P<P?P0P=P8Q\u000FP2P=P8P<P0P=P8P5Q\u0001Q\u0000P5P4Q\u0001Q\u0002P2P0X'Y\u0004Y\u0005Y\u0008X'X6Y\nX9X'Y\u0004X1X&Y\nX3Y\nX)X'Y\u0004X'Y\u0006X*Y\u0002X'Y\u0004Y\u0005X4X'X1Y\u0003X'X*Y\u0003X'Y\u0004X3Y\nX'X1X'X*X'Y\u0004Y\u0005Y\u0003X*Y\u0008X(X)X'Y\u0004X3X9Y\u0008X/Y\nX)X'X-X5X'X&Y\nX'X*X'Y\u0004X9X'Y\u0004Y\u0005Y\nX)X'Y\u0004X5Y\u0008X*Y\nX'X*X'Y\u0004X'Y\u0006X*X1Y\u0006X*X'Y\u0004X*X5X'Y\u0005Y\nY\u0005X'Y\u0004X%X3Y\u0004X'Y\u0005Y\nX'Y\u0004Y\u0005X4X'X1Y\u0003X)X'Y\u0004Y\u0005X1X&Y\nX'X*robots\" content=\"<div id=\"footer\">the United States<img src=\"http://.jpg|right|thumb|.js\"></script>\r\n<location.protocolframeborder=\"0\" s\" />\n<meta name=\"</a></div></div><font-weight:bold;&quot; and &quot;depending on the margin:0;padding:\" rel=\"nofollow\" President of the twentieth centuryevision>\n  </pageInternet Explorera.async = true;\r\ninformation about<div id=\"header\">\" action=\"http://<a href=\"https://<div id=\"content\"</div>\r\n</div>\r\n<derived from the <img src='http://according to the \n</body>\n</html>\nstyle=\"font-size:script language=\"Arial, Helvetica,</a><span class=\"</script><script political partiestd></tr></table><href=\"http://www.interpretation ofrel=\"stylesheet\" document.write('<charset=\"utf-8\">\nbeginning of the revealed that thetelevision series\" rel=\"nofollow\"> target=\"_blank\">claiming that thehttp%3A%2F%2Fwww.manifestations ofPrime Minister ofinfluenced by theclass=\"clearfix\">/div>\r\n</div>\r\n\r\nthree-dimensionalChurch of Englandof North Carolinasquare kilometres.addEventListenerdistinct from thecommonly known asPhonetic Alphabetdeclared that thecontrolled by theBenjamin Franklinrole-playing gamethe University ofin Western Europepersonal computerProject Gutenbergregardless of thehas been proposedtogether with the></li><li class=\"in some countriesmin.js\"></script>of the populationofficial language<img src=\"images/identified by thenatural resourcesclassification ofcan be consideredquantum mechanicsNevertheless, themillion years ago</body>\r\n</html>\rN\u0015N;N;N7N=N9N:N,\ntake advantage ofand, according toattributed to theMicrosoft Windowsthe first centuryunder the controldiv class=\"headershortly after thenotable exceptiontens of thousandsseveral differentaround the world.reaching militaryisolated from theopposition to thethe Old TestamentAfrican Americansinserted into theseparate from themetropolitan areamakes it possibleacknowledged thatarguably the mosttype=\"text/css\">\nthe InternationalAccording to the pe=\"text/css\" />\ncoincide with thetwo-thirds of theDuring this time,during the periodannounced that hethe internationaland more recentlybelieved that theconsciousness andformerly known assurrounded by thefirst appeared inoccasionally usedposition:absolute;\" target=\"_blank\" position:relative;text-align:center;jax/libs/jquery/1.background-color:#type=\"application/anguage\" content=\"<meta http-equiv=\"Privacy Policy</a>e(\"%3Cscript src='\" target=\"_blank\">On the other hand,.jpg|thumb|right|2</div><div class=\"<div style=\"float:nineteenth century</body>\r\n</html>\r\n<img src=\"http://s;text-align:centerfont-weight: bold; According to the difference between\" frameborder=\"0\" \" style=\"position:link href=\"http://html4/loose.dtd\">\nduring this period</td></tr></table>closely related tofor the first time;font-weight:bold;input type=\"text\" <span style=\"font-onreadystatechange\t<div class=\"cleardocument.location. For example, the a wide variety of <!DOCTYPE html>\r\n<&nbsp;&nbsp;&nbsp;\"><a href=\"http://style=\"float:left;concerned with the=http%3A%2F%2Fwww.in popular culturetype=\"text/css\" />it is possible to Harvard Universitytylesheet\" href=\"/the main characterOxford University  name=\"keywords\" cstyle=\"text-align:the United Kingdomfederal government<div style=\"margin depending on the description of the<div class=\"header.min.js\"></script>destruction of theslightly differentin accordance withtelecommunicationsindicates that theshortly thereafterespecially in the European countriesHowever, there aresrc=\"http://staticsuggested that the\" src=\"http://www.a large number of Telecommunications\" rel=\"nofollow\" tHoly Roman Emperoralmost exclusively\" border=\"0\" alt=\"Secretary of Stateculminating in theCIA World Factbookthe most importantanniversary of thestyle=\"background-<li><em><a href=\"/the Atlantic Oceanstrictly speaking,shortly before thedifferent types ofthe Ottoman Empire><img src=\"http://An Introduction toconsequence of thedeparture from theConfederate Statesindigenous peoplesProceedings of theinformation on thetheories have beeninvolvement in thedivided into threeadjacent countriesis responsible fordissolution of thecollaboration withwidely regarded ashis contemporariesfounding member ofDominican Republicgenerally acceptedthe possibility ofare also availableunder constructionrestoration of thethe general publicis almost entirelypasses through thehas been suggestedcomputer and videoGermanic languages according to the different from theshortly afterwardshref=\"https://www.recent developmentBoard of Directors<div class=\"search| <a href=\"http://In particular, theMultiple footnotesor other substancethousands of yearstranslation of the</div>\r\n</div>\r\n\r\n<a href=\"index.phpwas established inmin.js\"></script>\nparticipate in thea strong influencestyle=\"margin-top:represented by thegraduated from theTraditionally, theElement(\"script\");However, since the/div>\n</div>\n<div left; margin-left:protection against0; vertical-align:Unfortunately, thetype=\"image/x-icon/div>\n<div class=\" class=\"clearfix\"><div class=\"footer\t\t</div>\n\t\t</div>\nthe motion pictureP\u0011Q\nP;P3P0Q\u0000Q\u0001P:P8P1Q\nP;P3P0Q\u0000Q\u0001P:P8P$P5P4P5Q\u0000P0Q\u0006P8P8P=P5Q\u0001P:P>P;Q\u000CP:P>Q\u0001P>P>P1Q\tP5P=P8P5Q\u0001P>P>P1Q\tP5P=P8Q\u000FP?Q\u0000P>P3Q\u0000P0P<P<Q\u000BP\u001EQ\u0002P?Q\u0000P0P2P8Q\u0002Q\u000CP1P5Q\u0001P?P;P0Q\u0002P=P>P<P0Q\u0002P5Q\u0000P8P0P;Q\u000BP?P>P7P2P>P;Q\u000FP5Q\u0002P?P>Q\u0001P;P5P4P=P8P5Q\u0000P0P7P;P8Q\u0007P=Q\u000BQ\u0005P?Q\u0000P>P4Q\u0003P:Q\u0006P8P8P?Q\u0000P>P3Q\u0000P0P<P<P0P?P>P;P=P>Q\u0001Q\u0002Q\u000CQ\u000EP=P0Q\u0005P>P4P8Q\u0002Q\u0001Q\u000FP8P7P1Q\u0000P0P=P=P>P5P=P0Q\u0001P5P;P5P=P8Q\u000FP8P7P<P5P=P5P=P8Q\u000FP:P0Q\u0002P5P3P>Q\u0000P8P8P\u0010P;P5P:Q\u0001P0P=P4Q\u0000`$&`%\r`$5`$>`$0`$>`$.`%\u0008`$(`%\u0001`$\u0005`$2`$*`%\r`$0`$&`$>`$(`$-`$>`$0`$$`%\u0000`$/`$\u0005`$(`%\u0001`$&`%\u0007`$6`$9`$?`$(`%\r`$&`%\u0000`$\u0007`$\u0002`$!`$?`$/`$>`$&`$?`$2`%\r`$2`%\u0000`$\u0005`$'`$?`$\u0015`$>`$0`$5`%\u0000`$!`$?`$/`%\u000B`$\u001A`$?`$\u001F`%\r`$ `%\u0007`$8`$.`$>`$\u001A`$>`$0`$\u001C`$\u0002`$\u0015`%\r`$6`$(`$&`%\u0001`$(`$?`$/`$>`$*`%\r`$0`$/`%\u000B`$\u0017`$\u0005`$(`%\u0001`$8`$>`$0`$\u0011`$(`$2`$>`$\u0007`$(`$*`$>`$0`%\r`$\u001F`%\u0000`$6`$0`%\r`$$`%\u000B`$\u0002`$2`%\u000B`$\u0015`$8`$-`$>`$+`$<`%\r`$2`%\u0008`$6`$6`$0`%\r`$$`%\u0007`$\u0002`$*`%\r`$0`$&`%\u0007`$6`$*`%\r`$2`%\u0007`$/`$0`$\u0015`%\u0007`$\u0002`$&`%\r`$0`$8`%\r`$%`$?`$$`$?`$\t`$$`%\r`$*`$>`$&`$\t`$(`%\r`$9`%\u0007`$\u0002`$\u001A`$?`$\u001F`%\r`$ `$>`$/`$>`$$`%\r`$0`$>`$\u001C`%\r`$/`$>`$&`$>`$*`%\u0001`$0`$>`$(`%\u0007`$\u001C`%\u000B`$!`$<`%\u0007`$\u0002`$\u0005`$(`%\u0001`$5`$>`$&`$6`%\r`$0`%\u0007`$#`%\u0000`$6`$?`$\u0015`%\r`$7`$>`$8`$0`$\u0015`$>`$0`%\u0000`$8`$\u0002`$\u0017`%\r`$0`$9`$*`$0`$?`$#`$>`$.`$,`%\r`$0`$>`$\u0002`$!`$,`$\u001A`%\r`$\u001A`%\u000B`$\u0002`$\t`$*`$2`$,`%\r`$'`$.`$\u0002`$$`%\r`$0`%\u0000`$8`$\u0002`$*`$0`%\r`$\u0015`$\t`$.`%\r`$.`%\u0000`$&`$.`$>`$'`%\r`$/`$.`$8`$9`$>`$/`$$`$>`$6`$,`%\r`$&`%\u000B`$\u0002`$.`%\u0000`$!`$?`$/`$>`$\u0006`$\u0008`$*`%\u0000`$\u000F`$2`$.`%\u000B`$,`$>`$\u0007`$2`$8`$\u0002`$\u0016`%\r`$/`$>`$\u0006`$*`$0`%\u0007`$6`$(`$\u0005`$(`%\u0001`$,`$\u0002`$'`$,`$>`$\u001C`$<`$>`$0`$(`$5`%\u0000`$(`$$`$.`$*`%\r`$0`$.`%\u0001`$\u0016`$*`%\r`$0`$6`%\r`$(`$*`$0`$?`$5`$>`$0`$(`%\u0001`$\u0015`$8`$>`$(`$8`$.`$0`%\r`$%`$(`$\u0006`$/`%\u000B`$\u001C`$?`$$`$8`%\u000B`$.`$5`$>`$0X'Y\u0004Y\u0005X4X'X1Y\u0003X'X*X'Y\u0004Y\u0005Y\u0006X*X/Y\nX'X*X'Y\u0004Y\u0003Y\u0005X(Y\nY\u0008X*X1X'Y\u0004Y\u0005X4X'Y\u0007X/X'X*X9X/X/X'Y\u0004X2Y\u0008X'X1X9X/X/X'Y\u0004X1X/Y\u0008X/X'Y\u0004X%X3Y\u0004X'Y\u0005Y\nX)X'Y\u0004Y\u0001Y\u0008X*Y\u0008X4Y\u0008X(X'Y\u0004Y\u0005X3X'X(Y\u0002X'X*X'Y\u0004Y\u0005X9Y\u0004Y\u0008Y\u0005X'X*X'Y\u0004Y\u0005X3Y\u0004X3Y\u0004X'X*X'Y\u0004X,X1X'Y\u0001Y\nY\u0003X3X'Y\u0004X'X3Y\u0004X'Y\u0005Y\nX)X'Y\u0004X'X*X5X'Y\u0004X'X*keywords\" content=\"w3.org/1999/xhtml\"><a target=\"_blank\" text/html; charset=\" target=\"_blank\"><table cellpadding=\"autocomplete=\"off\" text-align: center;to last version by background-color: #\" href=\"http://www./div></div><div id=<a href=\"#\" class=\"\"><img src=\"http://cript\" src=\"http://\n<script language=\"//EN\" \"http://www.wencodeURIComponent(\" href=\"javascript:<div class=\"contentdocument.write('<scposition: absolute;script src=\"http:// style=\"margin-top:.min.js\"></script>\n</div>\n<div class=\"w3.org/1999/xhtml\" \n\r\n</body>\r\n</html>distinction between/\" target=\"_blank\"><link href=\"http://encoding=\"utf-8\"?>\nw.addEventListener?action=\"http://www.icon\" href=\"http:// style=\"background:type=\"text/css\" />\nmeta property=\"og:t<input type=\"text\"  style=\"text-align:the development of tylesheet\" type=\"tehtml; charset=utf-8is considered to betable width=\"100%\" In addition to the contributed to the differences betweendevelopment of the It is important to </script>\n\n<script  style=\"font-size:1></span><span id=gbLibrary of Congress<img src=\"http://imEnglish translationAcademy of Sciencesdiv style=\"display:construction of the.getElementById(id)in conjunction withElement('script'); <meta property=\"og:P\u0011Q\nP;P3P0Q\u0000Q\u0001P:P8\n type=\"text\" name=\">Privacy Policy</a>administered by theenableSingleRequeststyle=&quot;margin:</div></div></div><><img src=\"http://i style=&quot;float:referred to as the total population ofin Washington, D.C. style=\"background-among other things,organization of theparticipated in thethe introduction ofidentified with thefictional character Oxford University misunderstanding ofThere are, however,stylesheet\" href=\"/Columbia Universityexpanded to includeusually referred toindicating that thehave suggested thataffiliated with thecorrelation betweennumber of different></td></tr></table>Republic of Ireland\n</script>\n<script under the influencecontribution to theOfficial website ofheadquarters of thecentered around theimplications of thehave been developedFederal Republic ofbecame increasinglycontinuation of theNote, however, thatsimilar to that of capabilities of theaccordance with theparticipants in thefurther developmentunder the directionis often consideredhis younger brother</td></tr></table><a http-equiv=\"X-UA-physical propertiesof British Columbiahas been criticized(with the exceptionquestions about thepassing through the0\" cellpadding=\"0\" thousands of peopleredirects here. Forhave children under%3E%3C/script%3E\"));<a href=\"http://www.<li><a href=\"http://site_name\" content=\"text-decoration:nonestyle=\"display: none<meta http-equiv=\"X-new Date().getTime() type=\"image/x-icon\"</span><span class=\"language=\"javascriptwindow.location.href<a href=\"javascript:-->\r\n<script type=\"t<a href='http://www.hortcut icon\" href=\"</div>\r\n<div class=\"<script src=\"http://\" rel=\"stylesheet\" t</div>\n<script type=/a> <a href=\"http:// allowTransparency=\"X-UA-Compatible\" conrelationship between\n</script>\r\n<script </a></li></ul></div>associated with the programming language</a><a href=\"http://</a></li><li class=\"form action=\"http://<div style=\"display:type=\"text\" name=\"q\"<table width=\"100%\" background-position:\" border=\"0\" width=\"rel=\"shortcut icon\" h6><ul><li><a href=\"  <meta http-equiv=\"css\" media=\"screen\" responsible for the \" type=\"application/\" style=\"background-html; charset=utf-8\" allowtransparency=\"stylesheet\" type=\"te\r\n<meta http-equiv=\"></span><span class=\"0\" cellspacing=\"0\">;\n</script>\n<script sometimes called thedoes not necessarilyFor more informationat the beginning of <!DOCTYPE html><htmlparticularly in the type=\"hidden\" name=\"javascript:void(0);\"effectiveness of the autocomplete=\"off\" generally considered><input type=\"text\" \"></script>\r\n<scriptthroughout the worldcommon misconceptionassociation with the</div>\n</div>\n<div cduring his lifetime,corresponding to thetype=\"image/x-icon\" an increasing numberdiplomatic relationsare often consideredmeta charset=\"utf-8\" <input type=\"text\" examples include the\"><img src=\"http://iparticipation in thethe establishment of\n</div>\n<div class=\"&amp;nbsp;&amp;nbsp;to determine whetherquite different frommarked the beginningdistance between thecontributions to theconflict between thewidely considered towas one of the firstwith varying degreeshave speculated that(document.getElementparticipating in theoriginally developedeta charset=\"utf-8\"> type=\"text/css\" />\ninterchangeably withmore closely relatedsocial and politicalthat would otherwiseperpendicular to thestyle type=\"text/csstype=\"submit\" name=\"families residing indeveloping countriescomputer programmingeconomic developmentdetermination of thefor more informationon several occasionsportuguC*s (Europeu)P#P:Q\u0000P0Q\u0017P=Q\u0001Q\u000CP:P0Q\u0003P:Q\u0000P0Q\u0017P=Q\u0001Q\u000CP:P0P P>Q\u0001Q\u0001P8P9Q\u0001P:P>P9P<P0Q\u0002P5Q\u0000P8P0P;P>P2P8P=Q\u0004P>Q\u0000P<P0Q\u0006P8P8Q\u0003P?Q\u0000P0P2P;P5P=P8Q\u000FP=P5P>P1Q\u0005P>P4P8P<P>P8P=Q\u0004P>Q\u0000P<P0Q\u0006P8Q\u000FP\u0018P=Q\u0004P>Q\u0000P<P0Q\u0006P8Q\u000FP P5Q\u0001P?Q\u0003P1P;P8P:P8P:P>P;P8Q\u0007P5Q\u0001Q\u0002P2P>P8P=Q\u0004P>Q\u0000P<P0Q\u0006P8Q\u000EQ\u0002P5Q\u0000Q\u0000P8Q\u0002P>Q\u0000P8P8P4P>Q\u0001Q\u0002P0Q\u0002P>Q\u0007P=P>X'Y\u0004Y\u0005X*Y\u0008X'X,X/Y\u0008Y\u0006X'Y\u0004X'X4X*X1X'Y\u0003X'X*X'Y\u0004X'Y\u0002X*X1X'X-X'X*html; charset=UTF-8\" setTimeout(function()display:inline-block;<input type=\"submit\" type = 'text/javascri<img src=\"http://www.\" \"http://www.w3.org/shortcut icon\" href=\"\" autocomplete=\"off\" </a></div><div class=</a></li>\n<li class=\"css\" type=\"text/css\" <form action=\"http://xt/css\" href=\"http://link rel=\"alternate\" \r\n<script type=\"text/ onclick=\"javascript:(new Date).getTime()}height=\"1\" width=\"1\" People's Republic of  <a href=\"http://www.text-decoration:underthe beginning of the </div>\n</div>\n</div>\nestablishment of the </div></div></div></d#viewport{min-height:\n<script src=\"http://option><option value=often referred to as /option>\n<option valu<!DOCTYPE html>\n<!--[International Airport>\n<a href=\"http://www</a><a href=\"http://w`8 `82`8)`82`9\u0004`8\u0017`8\"a\u0003%a\u0003\u0010a\u0003 a\u0003\u0017a\u0003#a\u0003\u001Aa\u0003\u0018f-#i+\u0014d8-f\u0016\u0007 (g9\u0001i+\u0014)`$(`$?`$0`%\r`$&`%\u0007`$6`$!`$>`$\t`$(`$2`%\u000B`$!`$\u0015`%\r`$7`%\u0007`$$`%\r`$0`$\u001C`$>`$(`$\u0015`$>`$0`%\u0000`$8`$\u0002`$,`$\u0002`$'`$?`$$`$8`%\r`$%`$>`$*`$(`$>`$8`%\r`$5`%\u0000`$\u0015`$>`$0`$8`$\u0002`$8`%\r`$\u0015`$0`$#`$8`$>`$.`$\u0017`%\r`$0`%\u0000`$\u001A`$?`$\u001F`%\r`$ `%\u000B`$\u0002`$5`$?`$\u001C`%\r`$\u001E`$>`$(`$\u0005`$.`%\u0007`$0`$?`$\u0015`$>`$5`$?`$-`$?`$(`%\r`$(`$\u0017`$>`$!`$?`$/`$>`$\u0001`$\u0015`%\r`$/`%\u000B`$\u0002`$\u0015`$?`$8`%\u0001`$0`$\u0015`%\r`$7`$>`$*`$9`%\u0001`$\u0001`$\u001A`$$`%\u0000`$*`%\r`$0`$,`$\u0002`$'`$(`$\u001F`$?`$*`%\r`$*`$#`%\u0000`$\u0015`%\r`$0`$?`$\u0015`%\u0007`$\u001F`$*`%\r`$0`$>`$0`$\u0002`$-`$*`%\r`$0`$>`$*`%\r`$$`$.`$>`$2`$?`$\u0015`%\u000B`$\u0002`$0`$+`$<`%\r`$$`$>`$0`$(`$?`$0`%\r`$.`$>`$#`$2`$?`$.`$?`$\u001F`%\u0007`$!description\" content=\"document.location.prot.getElementsByTagName(<!DOCTYPE html>\n<html <meta charset=\"utf-8\">:url\" content=\"http://.css\" rel=\"stylesheet\"style type=\"text/css\">type=\"text/css\" href=\"w3.org/1999/xhtml\" xmltype=\"text/javascript\" method=\"get\" action=\"link rel=\"stylesheet\"  = document.getElementtype=\"image/x-icon\" />cellpadding=\"0\" cellsp.css\" type=\"text/css\" </a></li><li><a href=\"\" width=\"1\" height=\"1\"\"><a href=\"http://www.style=\"display:none;\">alternate\" type=\"appli-//W3C//DTD XHTML 1.0 ellspacing=\"0\" cellpad type=\"hidden\" value=\"/a>&nbsp;<span role=\"s\n<input type=\"hidden\" language=\"JavaScript\"  document.getElementsBg=\"0\" cellspacing=\"0\" ype=\"text/css\" media=\"type='text/javascript'with the exception of ype=\"text/css\" rel=\"st height=\"1\" width=\"1\" ='+encodeURIComponent(<link rel=\"alternate\" \nbody, tr, input, textmeta name=\"robots\" conmethod=\"post\" action=\">\n<a href=\"http://www.css\" rel=\"stylesheet\" </div></div><div classlanguage=\"javascript\">aria-hidden=\"true\">B7<ript\" type=\"text/javasl=0;})();\n(function(){background-image: url(/a></li><li><a href=\"h\t\t<li><a href=\"http://ator\" aria-hidden=\"tru> <a href=\"http://www.language=\"javascript\" /option>\n<option value/div></div><div class=rator\" aria-hidden=\"tre=(new Date).getTime()portuguC*s (do Brasil)P>Q\u0000P3P0P=P8P7P0Q\u0006P8P8P2P>P7P<P>P6P=P>Q\u0001Q\u0002Q\u000CP>P1Q\u0000P0P7P>P2P0P=P8Q\u000FQ\u0000P5P3P8Q\u0001Q\u0002Q\u0000P0Q\u0006P8P8P2P>P7P<P>P6P=P>Q\u0001Q\u0002P8P>P1Q\u000FP7P0Q\u0002P5P;Q\u000CP=P0<!DOCTYPE html PUBLIC \"nt-Type\" content=\"text/<meta http-equiv=\"Conteransitional//EN\" \"http:<html xmlns=\"http://www-//W3C//DTD XHTML 1.0 TDTD/xhtml1-transitional//www.w3.org/TR/xhtml1/pe = 'text/javascript';<meta name=\"descriptionparentNode.insertBefore<input type=\"hidden\" najs\" type=\"text/javascri(document).ready(functiscript type=\"text/javasimage\" content=\"http://UA-Compatible\" content=tml; charset=utf-8\" />\nlink rel=\"shortcut icon<link rel=\"stylesheet\" </script>\n<script type== document.createElemen<a target=\"_blank\" href= document.getElementsBinput type=\"text\" name=a.type = 'text/javascrinput type=\"hidden\" namehtml; charset=utf-8\" />dtd\">\n<html xmlns=\"http-//W3C//DTD HTML 4.01 TentsByTagName('script')input type=\"hidden\" nam<script type=\"text/javas\" style=\"display:none;\">document.getElementById(=document.createElement(' type='text/javascript'input type=\"text\" name=\"d.getElementsByTagName(snical\" href=\"http://www.C//DTD HTML 4.01 Transit<style type=\"text/css\">\n\n<style type=\"text/css\">ional.dtd\">\n<html xmlns=http-equiv=\"Content-Typeding=\"0\" cellspacing=\"0\"html; charset=utf-8\" />\n style=\"display:none;\"><<li><a href=\"http://www. type='text/javascript'>P4P5Q\u000FQ\u0002P5P;Q\u000CP=P>Q\u0001Q\u0002P8Q\u0001P>P>Q\u0002P2P5Q\u0002Q\u0001Q\u0002P2P8P8P?Q\u0000P>P8P7P2P>P4Q\u0001Q\u0002P2P0P1P5P7P>P?P0Q\u0001P=P>Q\u0001Q\u0002P8`$*`%\u0001`$8`%\r`$$`$?`$\u0015`$>`$\u0015`$>`$\u0002`$\u0017`%\r`$0`%\u0007`$8`$\t`$(`%\r`$9`%\u000B`$\u0002`$(`%\u0007`$5`$?`$'`$>`$(`$8`$-`$>`$+`$?`$\u0015`%\r`$8`$?`$\u0002`$\u0017`$8`%\u0001`$0`$\u0015`%\r`$7`$?`$$`$\u0015`%\t`$*`%\u0000`$0`$>`$\u0007`$\u001F`$5`$?`$\u001C`%\r`$\u001E`$>`$*`$(`$\u0015`$>`$0`%\r`$0`$5`$>`$\u0008`$8`$\u0015`%\r`$0`$?`$/`$$`$>", "\u06F7%\u018C'T%\u0085'W%\u00D7%O%g%\u00A6&\u0193%\u01E5&>&*&'&^&\u0088\u0178\u0C3E&\u01AD&\u0192&)&^&%&'&\u0082&P&1&\u00B1&3&]&m&u&E&t&C&\u00CF&V&V&/&>&6&\u0F76\u177Co&p&@&E&M&P&x&@&F&e&\u00CC&7&:&(&D&0&C&)&.&F&-&1&(&L&F&1\u025E*\u03EA\u21F3&\u1372&K&;&)&E&H&P&0&?&9&V&\u0081&-&v&a&,&E&)&?&=&'&'&B&\u0D2E&\u0503&\u0316*&*8&%&%&&&%,)&\u009A&>&\u0086&7&]&F&2&>&J&6&n&2&%&?&\u008E&2&6&J&g&-&0&,&*&J&*&O&)&6&(&<&B&N&.&P&@&2&.&W&M&%\u053C\u0084(,(<&,&\u03DA&\u18C7&-&,(%&(&%&(\u013B0&X&D&\u0081&j&'&J&(&.&B&3&Z&R&h&3&E&E&<\u00C6-\u0360\u1EF3&%8?&@&,&Z&@&0&J&,&^&x&_&6&C&6&C\u072C\u2A25&f&-&-&-&-&,&J&2&8&z&8&C&Y&8&-&d&\u1E78\u00CC-&7&1&F&7&t&W&7&I&.&.&^&=\u0F9C\u19D3&8(>&/&/&\u077B')'\u1065')'%@/&0&%\u043E\u09C0*&*@&C\u053D\u05D4\u0274\u05EB4\u0DD7\u071A\u04D16\u0D84&/\u0178\u0303Z&*%\u0246\u03FF&\u0134&1\u00A8\u04B4\u0174");
    flipBuffer(dictionary);
    DICTIONARY_DATA = dictionary;
  }


  /**
   * @param {!number} a
   * @param {!number} b
   * @return {!number}
   */
  function min(a, b) {
    return a <= b ? a : b;
  }

  /**
   * @param {!InputStream|null} src
   * @param {!Int8Array} dst
   * @param {!number} offset
   * @param {!number} length
   * @return {!number}
   */
  function readInput(src, dst, offset, length) {
    if (src == null) return -1;
    var /** number */ end = min(src.offset + length, src.data.length);
    var /** number */ bytesRead = end - src.offset;
    dst.set(src.data.subarray(src.offset, end), offset);
    src.offset += bytesRead;
    return bytesRead;
  }

  /**
   * @param {!InputStream} src
   * @return {!number}
   */
  function closeInput(src) { return 0; }

  /**
   * @param {!Int8Array} buffer
   * @return {void}
   */
  function flipBuffer(buffer) { /* no-op */ }

  /**
   * @param {!string} src
   * @return {!Int8Array}
   */
  function toUsAsciiBytes(src) {
    var /** !number */ n = src.length;
    var /** !Int8Array */ result = new Int8Array(n);
    for (var /** !number */ i = 0; i < n; ++i) {
      result[i] = src.charCodeAt(i);
    }
    return result;
  }

  /**
   * @param {!Int8Array} bytes
   * @return {!Int8Array}
   */
  function decode(bytes) {
    var /** !State */ s = new State();
    initState(s, new InputStream(bytes));
    var /** !number */ totalOutput = 0;
    var /** !Array<!Int8Array> */ chunks = [];
    while (true) {
      var /** !Int8Array */ chunk = new Int8Array(16384);
      chunks.push(chunk);
      s.output = chunk;
      s.outputOffset = 0;
      s.outputLength = 16384;
      s.outputUsed = 0;
      decompress(s);
      totalOutput += s.outputUsed;
      if (s.outputUsed < 16384) break;
    }
    close(s);
    var /** !Int8Array */ result = new Int8Array(totalOutput);
    var /** !number */ offset = 0;
    for (var /** !number */ i = 0; i < chunks.length; ++i) {
      var /** !Int8Array */ chunk = chunks[i];
      var /** !number */ end = min(totalOutput, offset + 16384);
      var /** !number */ len = end - offset;
      if (len < 16384) {
        result.set(chunk.subarray(0, len), offset);
      } else {
        result.set(chunk, offset);
      }
      offset += len;
    }
    return result;
  }

  return decode;
}

/** @export */
var BrotliDecode = BrotliDecodeClosure();

Module["BrotliDecode"] = BrotliDecode;

    if (!Module['preRun']) throw 'Module.preRun should exist because file support used it; did a pre-js delete it?';
    necessaryPreJSTasks.forEach(function(task) {
      if (Module['preRun'].indexOf(task) < 0) throw 'All preRun tasks that exist before user pre-js code should remain after; did you replace Module or modify Module.preRun?';
    });
  

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function(status, toThrow) {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  var toLog = e;
  if (e && typeof e === 'object' && e.stack) {
    toLog = [e, e.stack];
  }
  err('exiting due to exception: ' + toLog);
}

if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process === 'object' && typeof require === 'function') || typeof window === 'object' || typeof importScripts === 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    var data;
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  readAsync = function readAsync(f, onload, onerror) {
    setTimeout(function() { onload(readBinary(f)); }, 0);
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit === 'function') {
    quit_ = function(status, toThrow) {
      logExceptionOnExit(toThrow);
      quit(status);
    };
  }

  if (typeof print !== 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console === 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr !== 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  if (!(typeof window === 'object' || typeof importScripts === 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {

// include: web_or_worker_shell_read.js


  read_ = function(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
  };

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = function(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = function(title) { document.title = title };
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];
if (!Object.getOwnPropertyDescriptor(Module, 'arguments')) {
  Object.defineProperty(Module, 'arguments', {
    configurable: true,
    get: function() {
      abort('Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (!Object.getOwnPropertyDescriptor(Module, 'thisProgram')) {
  Object.defineProperty(Module, 'thisProgram', {
    configurable: true,
    get: function() {
      abort('Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (Module['quit']) quit_ = Module['quit'];
if (!Object.getOwnPropertyDescriptor(Module, 'quit')) {
  Object.defineProperty(Module, 'quit', {
    configurable: true,
    get: function() {
      abort('Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] === 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] === 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] === 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] === 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] === 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] === 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] === 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] === 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] === 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');

if (!Object.getOwnPropertyDescriptor(Module, 'read')) {
  Object.defineProperty(Module, 'read', {
    configurable: true,
    get: function() {
      abort('Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (!Object.getOwnPropertyDescriptor(Module, 'readAsync')) {
  Object.defineProperty(Module, 'readAsync', {
    configurable: true,
    get: function() {
      abort('Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (!Object.getOwnPropertyDescriptor(Module, 'readBinary')) {
  Object.defineProperty(Module, 'readBinary', {
    configurable: true,
    get: function() {
      abort('Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (!Object.getOwnPropertyDescriptor(Module, 'setWindowTitle')) {
  Object.defineProperty(Module, 'setWindowTitle', {
    configurable: true,
    get: function() {
      abort('Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';


assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add 'node' to `-s ENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-s ENVIRONMENT` to enable.");




var STACK_ALIGN = 16;

function getPointerSize() {
  return 4;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return getPointerSize();
      } else if (type[0] === 'i') {
        var bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {

  // If the type reflection proposal is available, use the new
  // "WebAssembly.Function" constructor.
  // Otherwise, construct a minimal wasm module importing the JS function and
  // re-exporting it.
  if (typeof WebAssembly.Function === "function") {
    var typeNames = {
      'i': 'i32',
      'j': 'i64',
      'f': 'f32',
      'd': 'f64'
    };
    var type = {
      parameters: [],
      results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    'e': {
      'f': func
    }
  });
  var wrappedFunc = instance.exports['f'];
  return wrappedFunc;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

function updateTableMap(offset, count) {
  for (var i = offset; i < offset + count; i++) {
    var item = getWasmTableEntry(i);
    // Ignore null values.
    if (item) {
      functionsInTableMap.set(item, i);
    }
  }
}

// Add a function to the table.
// 'sig' parameter is required if the function being added is a JS function.
function addFunction(func, sig) {
  assert(typeof func !== 'undefined');

  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    updateTableMap(0, wasmTable.length);
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    setWasmTableEntry(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    assert(typeof sig !== 'undefined', 'Missing signature argument to addFunction: ' + func);
    var wrapped = convertJsFunctionToWasm(func, sig);
    setWasmTableEntry(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(getWasmTableEntry(index));
  freeTableIndexes.push(index);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
};

var getTempRet0 = function() {
  return tempRet0;
};



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
if (!Object.getOwnPropertyDescriptor(Module, 'wasmBinary')) {
  Object.defineProperty(Module, 'wasmBinary', {
    configurable: true,
    get: function() {
      abort('Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}
var noExitRuntime = Module['noExitRuntime'] || true;
if (!Object.getOwnPropertyDescriptor(Module, 'noExitRuntime')) {
  Object.defineProperty(Module, 'noExitRuntime', {
    configurable: true,
    get: function() {
      abort('Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32';
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32';
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return Number(HEAPF64[((ptr)>>3)]);
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== 'array', 'Return type should not be "array".');
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }

  ret = onDone(ret);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((Uint8Array|Array<number>), number)} */
function allocate(slab, allocator) {
  var ret;
  assert(typeof allocator === 'number', 'allocate no longer takes a type argument')
  assert(typeof slab !== 'number', 'allocate no longer takes a number as arg0')

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (slab.subarray || slab.slice) {
    HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte 0x' + u0.toString(16) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  ;
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 0x10FFFF) warnOnce('Invalid Unicode code point 0x' + u.toString(16) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === (str.charCodeAt(i) & 0xff));
    HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;
if (Module['TOTAL_STACK']) assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime')

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
if (!Object.getOwnPropertyDescriptor(Module, 'INITIAL_MEMORY')) {
  Object.defineProperty(Module, 'INITIAL_MEMORY', {
    configurable: true,
    get: function() {
      abort('Module.INITIAL_MEMORY has been replaced with plain INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

assert(INITIAL_MEMORY >= TOTAL_STACK, 'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it.
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -s IMPORTED_MEMORY to define wasmMemory externally');
assert(INITIAL_MEMORY == 16777216, 'Detected runtime INITIAL_MEMORY setting.  Use -s IMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // The stack grows downwards
  HEAP32[((max + 4)>>2)] = 0x2135467
  HEAP32[((max + 8)>>2)] = 0x89BACDFE
  // Also test the global address 0 for integrity.
  HEAP32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  var cookie1 = HEAPU32[((max + 4)>>2)];
  var cookie2 = HEAPU32[((max + 8)>>2)];
  if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' + cookie2.toString(16) + ' ' + cookie1.toString(16));
  }
  // Also test the global address 0 for integrity.
  if (HEAP32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js


// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -s SUPPORT_BIG_ENDIAN=1 to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;
var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  checkStackCookie();
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  
if (!Module["noFSInit"] && !FS.init.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  checkStackCookie();
  runtimeExited = true;
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    assert(!runtimeExited, 'native function `' + displayName + '` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

var wasmBinaryFile;
  wasmBinaryFile = 'subtitles-octopus-worker.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmMemory = Module['asm']['memory'];
    assert(wasmMemory, "memory not found in wasm exports");
    // This assertion doesn't hold when emscripten is run in --post-link
    // mode.
    // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
    //assert(wasmMemory.buffer.byteLength === 16777216);
    updateGlobalBufferAndViews(wasmMemory.buffer);

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(function (instance) {
      return instance;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      // Warn on some common problems.
      if (isFileURI(wasmBinaryFile)) {
        err('warning: Loading from a file URI (' + wasmBinaryFile + ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing');
      }
      abort(reason);
    });
  }

  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming === 'function' &&
        !isDataURI(wasmBinaryFile) &&
        // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
        !isFileURI(wasmBinaryFile) &&
        typeof fetch === 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);

        return result.then(
          receiveInstantiationResult,
          function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  instantiateAsync();
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};
function array_bounds_check_error(idx,size){ throw 'Array index ' + idx + ' out of bounds: [0,' + size + ')'; }





  function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
  
      if (!Browser.mainLoop.func) {
        err('emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.');
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (!Browser.mainLoop.running) {
        
        Browser.mainLoop.running = true;
      }
      if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now())|0;
          setTimeout(Browser.mainLoop.runner, timeUntilNextTick); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1 /*EM_TIMING_RAF*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      } else if (mode == 2 /*EM_TIMING_SETIMMEDIATE*/) {
        if (typeof setImmediate === 'undefined') {
          // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
          var setImmediates = [];
          var emscriptenMainLoopMessageId = 'setimmediate';
          var Browser_setImmediate_messageHandler = function(event) {
            // When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
            // so check for both cases.
            if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          }
          addEventListener("message", Browser_setImmediate_messageHandler, true);
          setImmediate = /** @type{function(function(): ?, ...?): number} */(function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            if (ENVIRONMENT_IS_WORKER) {
              if (Module['setImmediates'] === undefined) Module['setImmediates'] = [];
              Module['setImmediates'].push(func);
              postMessage({target: emscriptenMainLoopMessageId}); // In --proxy-to-worker, route the message via proxyClient.js
            } else postMessage(emscriptenMainLoopMessageId, "*"); // On the main thread, can just send the message to itself.
          })
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          setImmediate(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'immediate';
      }
      return 0;
    }
  
  var _emscripten_get_now;_emscripten_get_now = function() { return performance.now(); }
  ;
  
  function runtimeKeepalivePush() {
      runtimeKeepaliveCounter += 1;
    }
  
  function _exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      exit(status);
    }
  
  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    }
  function maybeExit() {
      if (!keepRuntimeAlive()) {
        try {
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    }
  function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
      assert(!Browser.mainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
  
      Browser.mainLoop.func = browserIterationFunc;
      Browser.mainLoop.arg = arg;
  
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
      function checkIsRunning() {
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
          
          maybeExit();
          return false;
        }
        return true;
      }
  
      // We create the loop runner here but it is not actually running until
      // _emscripten_set_main_loop_timing is called (which might happen a
      // later time).  This member signifies that the current runner has not
      // yet been started so that we can call runtimeKeepalivePush when it
      // gets it timing set for the first time.
      Browser.mainLoop.running = false;
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          out('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
  
          // catches pause/resume main loop from blocker execution
          if (!checkIsRunning()) return;
  
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (!checkIsRunning()) return;
  
        // Implement very basic swap interval control
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          Browser.mainLoop.scheduler();
          return;
        } else if (Browser.mainLoop.timingMode == 0/*EM_TIMING_SETTIMEOUT*/) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
  
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          warnOnce('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          Browser.mainLoop.method = ''; // just warn once per call to set main loop
        }
  
        Browser.mainLoop.runIter(browserIterationFunc);
  
        checkStackCookie();
  
        // catch pauses from the main loop itself
        if (!checkIsRunning()) return;
  
        // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
        // to queue the newest produced audio samples.
        // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
        //       do not need to be hardcoded into this function, but can be more generic.
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  
        Browser.mainLoop.scheduler();
      }
  
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 1000.0 / fps);
        else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)
  
        Browser.mainLoop.scheduler();
      }
  
      if (simulateInfiniteLoop) {
        throw 'unwind';
      }
    }
  
  function callUserCallback(func, synchronous) {
      if (runtimeExited || ABORT) {
        err('user callback triggered after runtime exited or application aborted.  Ignoring.');
        return;
      }
      // For synchronous calls, let any exceptions propagate, and don't let the runtime exit.
      if (synchronous) {
        func();
        return;
      }
      try {
        func();
      } catch (e) {
        handleException(e);
      }
    }
  
  function runtimeKeepalivePop() {
      assert(runtimeKeepaliveCounter > 0);
      runtimeKeepaliveCounter -= 1;
    }
  function safeSetTimeout(func, timeout) {
      
      return setTimeout(function() {
        
        callUserCallback(func);
      }, timeout);
    }
  var Browser = {mainLoop:{running:false,scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:function() {
          Browser.mainLoop.scheduler = null;
          // Incrementing this signals the previous main loop that it's now become old, and it must return.
          Browser.mainLoop.currentlyRunningMainloop++;
        },resume:function() {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          // do not set timing and call scheduler, we will do it on the next lines
          setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },updateStatus:function() {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function(func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          callUserCallback(func);
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullscreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function() {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          out("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? out("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          out("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            out('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              out('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === Module['canvas'] ||
                                document['mozPointerLockElement'] === Module['canvas'] ||
                                document['webkitPointerLockElement'] === Module['canvas'] ||
                                document['msPointerLockElement'] === Module['canvas'];
        }
        var canvas = Module['canvas'];
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
  
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
                Module['canvas'].requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function(canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false,
            majorVersion: 1,
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          // This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
          // actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
          // Browser.createContext() should not even be emitted.
          if (typeof GL !== 'undefined') {
            contextHandle = GL.createContext(canvas, contextAttributes);
            if (contextHandle) {
              ctx = GL.getContext(contextHandle).GLctx;
            }
          }
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function(canvas, useWebGL, setInModule) {},fullscreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullscreen:function(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
               document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.exitFullscreen = Browser.exitFullscreen;
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          } else {
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
  
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullscreen);
          if (Module['onFullscreen']) Module['onFullscreen'](Browser.isFullscreen);
        }
  
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullscreenChange, false);
          document.addEventListener('mozfullscreenchange', fullscreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
          document.addEventListener('MSFullscreenChange', fullscreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullscreen'] ? function() { canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null) ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
  
        canvasContainer.requestFullscreen();
      },requestFullScreen:function() {
        abort('Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)');
      },exitFullscreen:function() {
        // This is workaround for chrome. Trying to exit from fullscreen
        // not in fullscreen state will cause "TypeError: Document not active"
        // in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
        if (!Browser.isFullscreen) {
          return false;
        }
  
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['msExitFullscreen'] ||
                  document['webkitCancelFullScreen'] ||
            (function() {});
        CFS.apply(document, []);
        return true;
      },nextRAF:0,fakeRequestAnimationFrame:function(func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function(func) {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(func);
          return;
        }
        var RAF = Browser.fakeRequestAnimationFrame;
        RAF(func);
      },safeSetTimeout:function(func) {
        // Legacy function, this is used by the SDL2 port so we need to keep it
        // around at least until that is updated.
        return safeSetTimeout(func);
      },safeRequestAnimationFrame:function(func) {
        
        return Browser.requestAnimationFrame(function() {
          
          callUserCallback(func);
        });
      },getMimetype:function(name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function(func) {
        if (!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function(event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function(event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function(event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll':
            // 3 lines make up a step
            delta = event.detail / 3;
            break;
          case 'mousewheel':
            // 120 units make up a step
            delta = event.wheelDelta / 120;
            break;
          case 'wheel':
            delta = event.deltaY
            switch (event.deltaMode) {
              case 0:
                // DOM_DELTA_PIXEL: 100 pixels make up a step
                delta /= 100;
                break;
              case 1:
                // DOM_DELTA_LINE: 3 lines make up a step
                delta /= 3;
                break;
              case 2:
                // DOM_DELTA_PAGE: A page makes up 80 steps
                delta *= 80;
                break;
              default:
                throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
            }
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function(event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
  
          // check if SDL is available
          if (typeof SDL != "undefined") {
            Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
            // just add the mouse delta to the current absolut mouse position
            // FIXME: ideally this should be clamped against the canvas size and zero
            Browser.mouseX += Browser.mouseMovementX;
            Browser.mouseY += Browser.mouseMovementY;
          }
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
  
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            }
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },resizeListeners:[],updateResizeListeners:function() {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function(width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullscreenCanvasSize:function() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function(canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
             document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            getWasmTableEntry(func)();
          } else {
            getWasmTableEntry(func)(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
  function demangle(func) {
      warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  var wasmTableMirror = [];
  function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
      return func;
    }


  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  function setWasmTableEntry(idx, func) {
      wasmTable.set(idx, func);
      wasmTableMirror[idx] = func;
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function ___assert_fail(condition, filename, line, func) {
      abort('Assertion failed: ' + UTF8ToString(condition) + ', at: ' + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
    }

  var _emscripten_get_now_is_monotonic = true;;
  
  function setErrNo(value) {
      HEAP32[((___errno_location())>>2)] = value;
      return value;
    }
  function _clock_gettime(clk_id, tp) {
      // int clock_gettime(clockid_t clk_id, struct timespec *tp);
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now();
      } else {
        setErrNo(28);
        return -1;
      }
      HEAP32[((tp)>>2)] = (now/1000)|0; // seconds
      HEAP32[(((tp)+(4))>>2)] = ((now % 1000)*1000*1000)|0; // nanoseconds
      return 0;
    }
  function ___clock_gettime(a0,a1
  ) {
  return _clock_gettime(a0,a1);
  }

  var PATH = {splitPath:function(filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function(parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function(path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function(path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function(path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function(path) {
        return PATH.splitPath(path)[3];
      },join:function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function(l, r) {
        return PATH.normalize(l + '/' + r);
      }};
  
  function getRandomDevice() {
      if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
        // for modern web browsers
        var randomBuffer = new Uint8Array(1);
        return function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
      } else
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      return function() { abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };"); };
    }
  
  var PATH_FS = {resolve:function() {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function(from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY = {ttys:[],init:function () {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function(stream) {
          // flush any pending line data
          stream.tty.ops.flush(stream.tty);
        },flush:function(stream) {
          stream.tty.ops.flush(stream.tty);
        },read:function(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function(tty) {
          if (!tty.input.length) {
            var result = null;
            if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },flush:function(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },flush:function(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  function zeroMemory(address, size) {
      HEAPU8.fill(0, address, address + size);
    }
  
  function alignMemory(size, alignment) {
      assert(alignment, "alignment argument is required");
      return Math.ceil(size / alignment) * alignment;
    }
  function mmapAlloc(size) {
      size = alignMemory(size, 65536);
      var ptr = _memalign(65536, size);
      if (!ptr) return 0;
      zeroMemory(ptr, size);
      return ptr;
    }
  var MEMFS = {ops_table:null,mount:function(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
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
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },getFileDataAsTypedArray:function(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },resizeFileStorage:function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },node_ops:{getattr:function(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function(parent, name) {
          throw FS.genericErrors[44];
        },mknod:function(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },unlink:function(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },rmdir:function(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },readdir:function(node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        }},stream_ops:{read:function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function(stream, buffer, offset, length, position, canOwn) {
          // The data buffer should be a typed array view
          assert(!(buffer instanceof ArrayBuffer));
          // If the buffer is located in main memory (HEAP), and if
          // memory can grow, we can't hold on to references of the
          // memory buffer, as they may get invalidated. That means we
          // need to do copy its contents.
          if (buffer.buffer === HEAP8.buffer) {
            canOwn = false;
          }
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },llseek:function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },allocate:function(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function(stream, address, length, position, prot, flags) {
          if (address !== 0) {
            // We don't currently support location hints for the address of the mapping
            throw new FS.ErrnoError(28);
          }
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents.buffer === buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            HEAP8.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function(stream, buffer, offset, length, mmapFlags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (mmapFlags & 2) {
            // MAP_PRIVATE calls need not to be synced back to underlying fs
            return 0;
          }
  
          var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
      readAsync(url, function(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, function(event) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep) addRunDependency(dep);
    }
  
  var ERRNO_MESSAGES = {0:"Success",1:"Arg list too long",2:"Permission denied",3:"Address already in use",4:"Address not available",5:"Address family not supported by protocol family",6:"No more processes",7:"Socket already connected",8:"Bad file number",9:"Trying to read unreadable message",10:"Mount device busy",11:"Operation canceled",12:"No children",13:"Connection aborted",14:"Connection refused",15:"Connection reset by peer",16:"File locking deadlock error",17:"Destination address required",18:"Math arg out of domain of func",19:"Quota exceeded",20:"File exists",21:"Bad address",22:"File too large",23:"Host is unreachable",24:"Identifier removed",25:"Illegal byte sequence",26:"Connection already in progress",27:"Interrupted system call",28:"Invalid argument",29:"I/O error",30:"Socket is already connected",31:"Is a directory",32:"Too many symbolic links",33:"Too many open files",34:"Too many links",35:"Message too long",36:"Multihop attempted",37:"File or path name too long",38:"Network interface is not configured",39:"Connection reset by network",40:"Network is unreachable",41:"Too many open files in system",42:"No buffer space available",43:"No such device",44:"No such file or directory",45:"Exec format error",46:"No record locks available",47:"The link has been severed",48:"Not enough core",49:"No message of desired type",50:"Protocol not available",51:"No space left on device",52:"Function not implemented",53:"Socket is not connected",54:"Not a directory",55:"Directory not empty",56:"State not recoverable",57:"Socket operation on non-socket",59:"Not a typewriter",60:"No such device or address",61:"Value too large for defined data type",62:"Previous owner died",63:"Not super-user",64:"Broken pipe",65:"Protocol error",66:"Unknown protocol",67:"Protocol wrong type for socket",68:"Math result not representable",69:"Read only file system",70:"Illegal seek",71:"No such process",72:"Stale file handle",73:"Connection timed out",74:"Text file busy",75:"Cross-device link",100:"Device not a stream",101:"Bad font file fmt",102:"Invalid slot",103:"Invalid request code",104:"No anode",105:"Block device required",106:"Channel number out of range",107:"Level 3 halted",108:"Level 3 reset",109:"Link number out of range",110:"Protocol driver not attached",111:"No CSI structure available",112:"Level 2 halted",113:"Invalid exchange",114:"Invalid request descriptor",115:"Exchange full",116:"No data (for no delay io)",117:"Timer expired",118:"Out of streams resources",119:"Machine is not on the network",120:"Package not installed",121:"The object is remote",122:"Advertise error",123:"Srmount error",124:"Communication error on send",125:"Cross mount point (not really error)",126:"Given log. name not unique",127:"f.d. invalid for this operation",128:"Remote address changed",129:"Can   access a needed shared lib",130:"Accessing a corrupted shared lib",131:".lib section in a.out corrupted",132:"Attempting to link in too many libs",133:"Attempting to exec a shared library",135:"Streams pipe error",136:"Too many users",137:"Socket type not supported",138:"Not supported",139:"Protocol family not supported",140:"Can't send after socket shutdown",141:"Too many references",142:"Host is down",148:"No medium (in tape drive)",156:"Level 2 not synchronized"};
  
  var ERRNO_CODES = {};
  var FS = {root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:function(path, opts) {
        path = PATH_FS.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function(parentid, name) {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function(parent, name, mode, rdev) {
        assert(typeof parent === 'object')
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function(node) {
        FS.hashRemoveNode(node);
      },isRoot:function(node) {
        return node === node.parent;
      },isMountpoint:function(node) {
        return !!node.mounted;
      },isFile:function(mode) {
        return (mode & 61440) === 32768;
      },isDir:function(mode) {
        return (mode & 61440) === 16384;
      },isLink:function(mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function(mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function(mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function(mode) {
        return (mode & 61440) === 4096;
      },isSocket:function(mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:function(str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },mayLookup:function(dir) {
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },mayCreate:function(dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },mayOpen:function(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function(fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },getStream:function(fd) {
        return FS.streams[fd];
      },createStream:function(stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = /** @constructor */ function(){};
          FS.FSStream.prototype = {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          };
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function(fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function(stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function() {
          throw new FS.ErrnoError(70);
        }},major:function(dev) {
        return ((dev) >> 8);
      },minor:function(dev) {
        return ((dev) & 0xff);
      },makedev:function(ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function(dev) {
        return FS.devices[dev];
      },getMounts:function(mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function(populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function(type, opts, mountpoint) {
        if (typeof type === 'string') {
          // The filesystem was not included, and instead we have an error
          // message stored in the variable.
          throw type;
        }
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function(path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function(path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdirTree:function(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },mkdev:function(path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existant directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },unlink:function(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:function(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },lstat:function(path) {
        return FS.stat(path, true);
      },chmod:function(path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function(path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function(fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
      },chown:function(path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function(fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function(fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },utime:function(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function(path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          id: node.id,
          flags: flags,
          mode: node.mode,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          node_ops: node.node_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },close:function(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },isClosed:function(stream) {
        return stream.fd === null;
      },llseek:function(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:function(stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position !== 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function(stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position !== 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function(stream, offset, length) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function(stream, address, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
      },msync:function(stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:function(stream) {
        return 0;
      },ioctl:function(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function(path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function(path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },cwd:function() {
        return FS.currentPath;
      },chdir:function(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function() {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function(stream, buffer, offset, length, pos) { return length; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device = getRandomDevice();
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:function() {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: function() {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup: function(parent, name) {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(8);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: function() { return stream.path } }
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:function() {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function() {
        if (FS.ErrnoError) return;
        FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = /** @this{Object} */ function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
  
          // Try to get a maximally helpful stack trace. On Node.js, getting Error.stack
          // now ensures it shows what we want.
          if (this.stack) {
            // Define the stack property for Node.js 4, which otherwise errors on the next line.
            Object.defineProperty(this, "stack", { value: (new Error).stack, writable: true });
            this.stack = demangleAll(this.stack);
          }
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function() {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },init:function(input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function() {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        var fflush = Module['_fflush'];
        if (fflush) fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function(canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },findObject:function(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          return null;
        }
      },analyzePath:function(path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createPath:function(parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function(parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function(parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },forceLoadFile:function(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
      },createLazyFile:function(parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        /** @constructor */
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: /** @this {FSNode} */ function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          FS.forceLoadFile(node);
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init(); // XXX perhaps this method should move onto Browser?
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency(dep);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function() {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function() {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function(paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          out('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function(paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },absolutePath:function() {
        abort('FS.absolutePath has been removed; use PATH_FS.resolve instead');
      },createFolder:function() {
        abort('FS.createFolder has been removed; use FS.mkdir instead');
      },createLink:function() {
        abort('FS.createLink has been removed; use FS.symlink instead');
      },joinPath:function() {
        abort('FS.joinPath has been removed; use PATH.join instead');
      },mmapAlloc:function() {
        abort('FS.mmapAlloc has been replaced by the top level function mmapAlloc');
      },standardizePath:function() {
        abort('FS.standardizePath has been removed; use PATH.normalize instead');
      }};
  var SYSCALLS = {mappings:{},DEFAULT_POLLMASK:5,calculateAt:function(dirfd, path, allowEmpty) {
        if (path[0] === '/') {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = FS.getStream(dirfd);
          if (!dirstream) throw new FS.ErrnoError(8);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },doStat:function(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -54;
          }
          throw e;
        }
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = 0;
        HEAP32[(((buf)+(8))>>2)] = stat.ino;
        HEAP32[(((buf)+(12))>>2)] = stat.mode;
        HEAP32[(((buf)+(16))>>2)] = stat.nlink;
        HEAP32[(((buf)+(20))>>2)] = stat.uid;
        HEAP32[(((buf)+(24))>>2)] = stat.gid;
        HEAP32[(((buf)+(28))>>2)] = stat.rdev;
        HEAP32[(((buf)+(32))>>2)] = 0;
        (tempI64 = [stat.size>>>0,(tempDouble=stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(48))>>2)] = 4096;
        HEAP32[(((buf)+(52))>>2)] = stat.blocks;
        HEAP32[(((buf)+(56))>>2)] = (stat.atime.getTime() / 1000)|0;
        HEAP32[(((buf)+(60))>>2)] = 0;
        HEAP32[(((buf)+(64))>>2)] = (stat.mtime.getTime() / 1000)|0;
        HEAP32[(((buf)+(68))>>2)] = 0;
        HEAP32[(((buf)+(72))>>2)] = (stat.ctime.getTime() / 1000)|0;
        HEAP32[(((buf)+(76))>>2)] = 0;
        (tempI64 = [stat.ino>>>0,(tempDouble=stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(80))>>2)] = tempI64[0],HEAP32[(((buf)+(84))>>2)] = tempI64[1]);
        return 0;
      },doMsync:function(addr, stream, len, flags, offset) {
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },doMkdir:function(path, mode) {
        // remove a trailing slash, if one - /a/b/ has basename of '', but
        // we want to create b in the context of this function
        path = PATH.normalize(path);
        if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
        FS.mkdir(path, mode, 0);
        return 0;
      },doMknod:function(path, mode, dev) {
        // we don't want this in the JS API as it uses mknod to create all nodes.
        switch (mode & 61440) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default: return -28;
        }
        FS.mknod(path, mode, dev);
        return 0;
      },doReadlink:function(path, buf, bufsize) {
        if (bufsize <= 0) return -28;
        var ret = FS.readlink(path);
  
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf+len];
        stringToUTF8(ret, buf, bufsize+1);
        // readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
        // stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
        HEAP8[buf+len] = endChar;
  
        return len;
      },doAccess:function(path, amode) {
        if (amode & ~7) {
          // need a valid mode
          return -28;
        }
        var node;
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
        if (!node) {
          return -44;
        }
        var perms = '';
        if (amode & 4) perms += 'r';
        if (amode & 2) perms += 'w';
        if (amode & 1) perms += 'x';
        if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
          return -2;
        }
        return 0;
      },doDup:function(path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
      },doReadv:function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.read(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break; // nothing more to read
        }
        return ret;
      },doWritev:function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.write(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      },varargs:undefined,get:function() {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },getStreamFromFD:function(fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
      },get64:function(low, high) {
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      }};
  function ___syscall_access(path, amode) {try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doAccess(path, amode);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_chmod(path, mode) {try {
  
      path = SYSCALLS.getStr(path);
      FS.chmod(path, mode);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_fcntl64(fd, cmd, varargs) {SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -28;
          }
          var newStream;
          newStream = FS.open(stream.path, stream.flags, 0, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 12:
        /* case 12: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */ {
          
          var arg = SYSCALLS.get();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 13:
        case 14:
        /* case 13: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
        /* case 14: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
          
          
          return 0; // Pretend that the locking is successful.
        case 16:
        case 8:
          return -28; // These are for sockets. We don't have them fully implemented yet.
        case 9:
          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
          setErrNo(28);
          return -1;
        default: {
          return -28;
        }
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_fstat64(fd, buf) {try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      return SYSCALLS.doStat(FS.stat, stream.path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_statfs64(path, size, buf) {try {
  
      path = SYSCALLS.getStr(path);
      assert(size === 64);
      // NOTE: None of the constants here are true. We're just returning safe and
      //       sane values.
      HEAP32[(((buf)+(4))>>2)] = 4096;
      HEAP32[(((buf)+(40))>>2)] = 4096;
      HEAP32[(((buf)+(8))>>2)] = 1000000;
      HEAP32[(((buf)+(12))>>2)] = 500000;
      HEAP32[(((buf)+(16))>>2)] = 500000;
      HEAP32[(((buf)+(20))>>2)] = FS.nextInode;
      HEAP32[(((buf)+(24))>>2)] = 1000000;
      HEAP32[(((buf)+(28))>>2)] = 42;
      HEAP32[(((buf)+(44))>>2)] = 2;  // ST_NOSUID
      HEAP32[(((buf)+(36))>>2)] = 255;
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }
  function ___syscall_fstatfs64(fd, size, buf) {try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      return ___syscall_statfs64(0, size, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_getcwd(buf, size) {try {
  
      if (size === 0) return -28;
      var cwd = FS.cwd();
      var cwdLengthInBytes = lengthBytesUTF8(cwd);
      if (size < cwdLengthInBytes + 1) return -68;
      stringToUTF8(cwd, buf, size);
      return buf;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_getdents64(fd, dirp, count) {try {
  
      var stream = SYSCALLS.getStreamFromFD(fd)
      if (!stream.getdents) {
        stream.getdents = FS.readdir(stream.path);
      }
  
      var struct_size = 280;
      var pos = 0;
      var off = FS.llseek(stream, 0, 1);
  
      var idx = Math.floor(off / struct_size);
  
      while (idx < stream.getdents.length && pos + struct_size <= count) {
        var id;
        var type;
        var name = stream.getdents[idx];
        if (name === '.') {
          id = stream.id;
          type = 4; // DT_DIR
        }
        else if (name === '..') {
          id = FS.lookupPath(stream.path, { parent: true }).id;
          type = 4; // DT_DIR
        }
        else {
          var child = FS.lookupNode(stream, name);
          id = child.id;
          type = FS.isChrdev(child.mode) ? 2 :  // DT_CHR, character device.
                 FS.isDir(child.mode) ? 4 :     // DT_DIR, directory.
                 FS.isLink(child.mode) ? 10 :   // DT_LNK, symbolic link.
                 8;                             // DT_REG, regular file.
        }
        (tempI64 = [id>>>0,(tempDouble=id,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((dirp + pos)>>2)] = tempI64[0],HEAP32[(((dirp + pos)+(4))>>2)] = tempI64[1]);
        (tempI64 = [(idx + 1) * struct_size>>>0,(tempDouble=(idx + 1) * struct_size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((dirp + pos)+(8))>>2)] = tempI64[0],HEAP32[(((dirp + pos)+(12))>>2)] = tempI64[1]);
        HEAP16[(((dirp + pos)+(16))>>1)] = 280;
        HEAP8[(((dirp + pos)+(18))>>0)] = type;
        stringToUTF8(name, dirp + pos + 19, 256);
        pos += struct_size;
        idx += 1;
      }
      FS.llseek(stream, idx * struct_size, 0);
      return pos;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_ioctl(fd, op, varargs) {SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509:
        case 21505: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21510:
        case 21511:
        case 21512:
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = SYSCALLS.get();
          HEAP32[((argp)>>2)] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28; // not supported
        }
        case 21531: {
          var argp = SYSCALLS.get();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -59;
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -59;
          return 0;
        }
        default: abort('bad ioctl syscall ' + op);
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_lstat64(path, buf) {try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.lstat, path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_mkdir(path, mode) {try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doMkdir(path, mode);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_open(path, flags, varargs) {SYSCALLS.varargs = varargs;
  try {
  
      var pathname = SYSCALLS.getStr(path);
      var mode = varargs ? SYSCALLS.get() : 0;
      var stream = FS.open(pathname, flags, mode);
      return stream.fd;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_readlink(path, buf, bufsize) {try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doReadlink(path, buf, bufsize);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_rename(old_path, new_path) {try {
  
      old_path = SYSCALLS.getStr(old_path);
      new_path = SYSCALLS.getStr(new_path);
      FS.rename(old_path, new_path);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_rmdir(path) {try {
  
      path = SYSCALLS.getStr(path);
      FS.rmdir(path);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_stat64(path, buf) {try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.stat, path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_symlink(target, linkpath) {try {
  
      target = SYSCALLS.getStr(target);
      linkpath = SYSCALLS.getStr(linkpath);
      FS.symlink(target, linkpath);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall_unlink(path) {try {
  
      path = SYSCALLS.getStr(path);
      FS.unlink(path);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function __emscripten_throw_longjmp() { throw 'longjmp'; }

  function _abort() {
      abort('native code called abort()');
    }

  function _emscripten_get_heap_max() {
      // Handle the case of 4GB (which would wrap to 0 in the return value) by
      // returning up to 4GB - one wasm page.
      return 2147483648;
    }


  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function emscripten_realloc_buffer(size) {
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16); // .grow() takes a delta compared to the previous size
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1 /*success*/;
      } catch(e) {
        err('emscripten_realloc_buffer: Attempted to grow heap from ' + buffer.byteLength  + ' bytes to ' + size + ' bytes, but got error: ' + e);
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      // With pthreads, races can happen (another thread might increase the size in between), so return a failure, and let the caller retry.
      assert(requestedSize > oldSize);
  
      // Memory resize rules:
      // 1. Always increase heap size to at least the requested size, rounded up to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap geometrically: increase the heap size according to
      //                                         MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%),
      //                                         At most overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap linearly: increase the heap size by at least MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3. Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4. If we were unable to allocate as much memory, it may be due to over-eager decision to excessively reserve due to (3) above.
      //    Hence if an allocation fails, cut down on the amount of excess growth, in an attempt to succeed to perform a smaller allocation.
  
      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      // In CAN_ADDRESS_2GB mode, stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate full 4GB Wasm memories, the size will wrap
      // back to 0 bytes in Wasm side for any code that deals with heap sizes, which would require special casing all heap size related code to treat
      // 0 specially.
      var maxHeapSize = 2147483648;
      if (requestedSize > maxHeapSize) {
        err('Cannot enlarge memory, asked to go up to ' + requestedSize + ' bytes, but the limit is ' + maxHeapSize + ' bytes!');
        return false;
      }
  
      // Loop through potential heap size increases. If we attempt a too eager reservation that fails, cut down on the
      // attempted size and reserve a smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296 );
  
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
  
          return true;
        }
      }
      err('Failed to grow the heap from ' + oldSize + ' bytes to ' + newSize + ' bytes, not enough memory!');
      return false;
    }

  var ENV = {};
  
  function getExecutableName() {
      return thisProgram || './this.program';
    }
  function getEnvStrings() {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator === 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + '=' + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }
  function _environ_get(__environ, environ_buf) {
      var bufSize = 0;
      getEnvStrings().forEach(function(string, i) {
        var ptr = environ_buf + bufSize;
        HEAP32[(((__environ)+(i * 4))>>2)] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    }

  function _environ_sizes_get(penviron_count, penviron_buf_size) {
      var strings = getEnvStrings();
      HEAP32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      strings.forEach(function(string) {
        bufSize += string.length + 1;
      });
      HEAP32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    }


  function _fd_close(fd) {try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return e.errno;
  }
  }

  function _fd_read(fd, iov, iovcnt, pnum) {try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = SYSCALLS.doReadv(stream, iov, iovcnt);
      HEAP32[((pnum)>>2)] = num
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return e.errno;
  }
  }

  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {try {
  
      
      var stream = SYSCALLS.getStreamFromFD(fd);
      var HIGH_OFFSET = 0x100000000; // 2^32
      // use an unsigned operator on low and shift high by 32-bits
      var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
  
      var DOUBLE_LIMIT = 0x20000000000000; // 2^53
      // we also check for equality since DOUBLE_LIMIT + 1 == DOUBLE_LIMIT
      if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
        return -61;
      }
  
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble=stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return e.errno;
  }
  }

  function _fd_write(fd, iov, iovcnt, pnum) {try {
  
      ;
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = SYSCALLS.doWritev(stream, iov, iovcnt);
      HEAP32[((pnum)>>2)] = num
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return e.errno;
  }
  }

  function _getTempRet0() {
      return getTempRet0();
    }

  function _gettimeofday(ptr) {
      var now = Date.now();
      HEAP32[((ptr)>>2)] = (now/1000)|0; // seconds
      HEAP32[(((ptr)+(4))>>2)] = ((now % 1000)*1000)|0; // microseconds
      return 0;
    }

  function _setTempRet0(val) {
      setTempRet0(val);
    }

  function _time(ptr) {
      ;
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)] = ret;
      }
      return ret;
    }

Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas) { Browser.requestFullscreen(lockPointer, resizeCanvas) };
  Module["requestFullScreen"] = function Module_requestFullScreen() { Browser.requestFullScreen() };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
  Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) { return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes) };

  var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
    if (!parent) {
      parent = this;  // root node sets parent to itself
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
  };
  var readMode = 292/*292*/ | 73/*73*/;
  var writeMode = 146/*146*/;
  Object.defineProperties(FSNode.prototype, {
   read: {
    get: /** @this{FSNode} */function() {
     return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= readMode : this.mode &= ~readMode;
    }
   },
   write: {
    get: /** @this{FSNode} */function() {
     return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }
   },
   isFolder: {
    get: /** @this{FSNode} */function() {
     return FS.isDir(this.mode);
    }
   },
   isDevice: {
    get: /** @this{FSNode} */function() {
     return FS.isChrdev(this.mode);
    }
   }
  });
  FS.FSNode = FSNode;
  FS.staticInit();Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createPath"] = FS.createPath;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createDevice"] = FS.createDevice;Module["FS_unlink"] = FS.unlink;;
ERRNO_CODES = {
      'EPERM': 63,
      'ENOENT': 44,
      'ESRCH': 71,
      'EINTR': 27,
      'EIO': 29,
      'ENXIO': 60,
      'E2BIG': 1,
      'ENOEXEC': 45,
      'EBADF': 8,
      'ECHILD': 12,
      'EAGAIN': 6,
      'EWOULDBLOCK': 6,
      'ENOMEM': 48,
      'EACCES': 2,
      'EFAULT': 21,
      'ENOTBLK': 105,
      'EBUSY': 10,
      'EEXIST': 20,
      'EXDEV': 75,
      'ENODEV': 43,
      'ENOTDIR': 54,
      'EISDIR': 31,
      'EINVAL': 28,
      'ENFILE': 41,
      'EMFILE': 33,
      'ENOTTY': 59,
      'ETXTBSY': 74,
      'EFBIG': 22,
      'ENOSPC': 51,
      'ESPIPE': 70,
      'EROFS': 69,
      'EMLINK': 34,
      'EPIPE': 64,
      'EDOM': 18,
      'ERANGE': 68,
      'ENOMSG': 49,
      'EIDRM': 24,
      'ECHRNG': 106,
      'EL2NSYNC': 156,
      'EL3HLT': 107,
      'EL3RST': 108,
      'ELNRNG': 109,
      'EUNATCH': 110,
      'ENOCSI': 111,
      'EL2HLT': 112,
      'EDEADLK': 16,
      'ENOLCK': 46,
      'EBADE': 113,
      'EBADR': 114,
      'EXFULL': 115,
      'ENOANO': 104,
      'EBADRQC': 103,
      'EBADSLT': 102,
      'EDEADLOCK': 16,
      'EBFONT': 101,
      'ENOSTR': 100,
      'ENODATA': 116,
      'ETIME': 117,
      'ENOSR': 118,
      'ENONET': 119,
      'ENOPKG': 120,
      'EREMOTE': 121,
      'ENOLINK': 47,
      'EADV': 122,
      'ESRMNT': 123,
      'ECOMM': 124,
      'EPROTO': 65,
      'EMULTIHOP': 36,
      'EDOTDOT': 125,
      'EBADMSG': 9,
      'ENOTUNIQ': 126,
      'EBADFD': 127,
      'EREMCHG': 128,
      'ELIBACC': 129,
      'ELIBBAD': 130,
      'ELIBSCN': 131,
      'ELIBMAX': 132,
      'ELIBEXEC': 133,
      'ENOSYS': 52,
      'ENOTEMPTY': 55,
      'ENAMETOOLONG': 37,
      'ELOOP': 32,
      'EOPNOTSUPP': 138,
      'EPFNOSUPPORT': 139,
      'ECONNRESET': 15,
      'ENOBUFS': 42,
      'EAFNOSUPPORT': 5,
      'EPROTOTYPE': 67,
      'ENOTSOCK': 57,
      'ENOPROTOOPT': 50,
      'ESHUTDOWN': 140,
      'ECONNREFUSED': 14,
      'EADDRINUSE': 3,
      'ECONNABORTED': 13,
      'ENETUNREACH': 40,
      'ENETDOWN': 38,
      'ETIMEDOUT': 73,
      'EHOSTDOWN': 142,
      'EHOSTUNREACH': 23,
      'EINPROGRESS': 26,
      'EALREADY': 7,
      'EDESTADDRREQ': 17,
      'EMSGSIZE': 35,
      'EPROTONOSUPPORT': 66,
      'ESOCKTNOSUPPORT': 137,
      'EADDRNOTAVAIL': 4,
      'ENETRESET': 39,
      'EISCONN': 30,
      'ENOTCONN': 53,
      'ETOOMANYREFS': 141,
      'EUSERS': 136,
      'EDQUOT': 19,
      'ESTALE': 72,
      'ENOTSUP': 138,
      'ENOMEDIUM': 148,
      'EILSEQ': 25,
      'EOVERFLOW': 61,
      'ECANCELED': 11,
      'ENOTRECOVERABLE': 56,
      'EOWNERDEAD': 62,
      'ESTRPIPE': 135,
    };;
var ASSERTIONS = true;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


var asmLibraryArg = {
  "__assert_fail": ___assert_fail,
  "__clock_gettime": ___clock_gettime,
  "__syscall_access": ___syscall_access,
  "__syscall_chmod": ___syscall_chmod,
  "__syscall_fcntl64": ___syscall_fcntl64,
  "__syscall_fstat64": ___syscall_fstat64,
  "__syscall_fstatfs64": ___syscall_fstatfs64,
  "__syscall_getcwd": ___syscall_getcwd,
  "__syscall_getdents64": ___syscall_getdents64,
  "__syscall_ioctl": ___syscall_ioctl,
  "__syscall_lstat64": ___syscall_lstat64,
  "__syscall_mkdir": ___syscall_mkdir,
  "__syscall_open": ___syscall_open,
  "__syscall_readlink": ___syscall_readlink,
  "__syscall_rename": ___syscall_rename,
  "__syscall_rmdir": ___syscall_rmdir,
  "__syscall_stat64": ___syscall_stat64,
  "__syscall_symlink": ___syscall_symlink,
  "__syscall_unlink": ___syscall_unlink,
  "_emscripten_throw_longjmp": __emscripten_throw_longjmp,
  "abort": _abort,
  "array_bounds_check_error": array_bounds_check_error,
  "emscripten_get_heap_max": _emscripten_get_heap_max,
  "emscripten_get_now": _emscripten_get_now,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "environ_get": _environ_get,
  "environ_sizes_get": _environ_sizes_get,
  "exit": _exit,
  "fd_close": _fd_close,
  "fd_read": _fd_read,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write,
  "getTempRet0": _getTempRet0,
  "gettimeofday": _gettimeofday,
  "invoke_iii": invoke_iii,
  "invoke_iiii": invoke_iiii,
  "invoke_iiiii": invoke_iiiii,
  "invoke_v": invoke_v,
  "invoke_viiii": invoke_viiii,
  "setTempRet0": _setTempRet0,
  "time": _time
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");

/** @type {function(...*):?} */
var _main = Module["_main"] = createExportWrapper("main");

/** @type {function(...*):?} */
var _emscripten_bind_VoidPtr___destroy___0 = Module["_emscripten_bind_VoidPtr___destroy___0"] = createExportWrapper("emscripten_bind_VoidPtr___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_w_0 = Module["_emscripten_bind_ASS_Image_get_w_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_w_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_w_1 = Module["_emscripten_bind_ASS_Image_set_w_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_w_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_h_0 = Module["_emscripten_bind_ASS_Image_get_h_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_h_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_h_1 = Module["_emscripten_bind_ASS_Image_set_h_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_h_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_stride_0 = Module["_emscripten_bind_ASS_Image_get_stride_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_stride_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_stride_1 = Module["_emscripten_bind_ASS_Image_set_stride_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_stride_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_bitmap_0 = Module["_emscripten_bind_ASS_Image_get_bitmap_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_bitmap_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_bitmap_1 = Module["_emscripten_bind_ASS_Image_set_bitmap_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_bitmap_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_color_0 = Module["_emscripten_bind_ASS_Image_get_color_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_color_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_color_1 = Module["_emscripten_bind_ASS_Image_set_color_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_color_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_dst_x_0 = Module["_emscripten_bind_ASS_Image_get_dst_x_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_dst_x_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_dst_x_1 = Module["_emscripten_bind_ASS_Image_set_dst_x_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_dst_x_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_dst_y_0 = Module["_emscripten_bind_ASS_Image_get_dst_y_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_dst_y_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_dst_y_1 = Module["_emscripten_bind_ASS_Image_set_dst_y_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_dst_y_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_get_next_0 = Module["_emscripten_bind_ASS_Image_get_next_0"] = createExportWrapper("emscripten_bind_ASS_Image_get_next_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Image_set_next_1 = Module["_emscripten_bind_ASS_Image_set_next_1"] = createExportWrapper("emscripten_bind_ASS_Image_set_next_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Name_0 = Module["_emscripten_bind_ASS_Style_get_Name_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Name_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Name_1 = Module["_emscripten_bind_ASS_Style_set_Name_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Name_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_FontName_0 = Module["_emscripten_bind_ASS_Style_get_FontName_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_FontName_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_FontName_1 = Module["_emscripten_bind_ASS_Style_set_FontName_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_FontName_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_FontSize_0 = Module["_emscripten_bind_ASS_Style_get_FontSize_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_FontSize_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_FontSize_1 = Module["_emscripten_bind_ASS_Style_set_FontSize_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_FontSize_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_PrimaryColour_0 = Module["_emscripten_bind_ASS_Style_get_PrimaryColour_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_PrimaryColour_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_PrimaryColour_1 = Module["_emscripten_bind_ASS_Style_set_PrimaryColour_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_PrimaryColour_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_SecondaryColour_0 = Module["_emscripten_bind_ASS_Style_get_SecondaryColour_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_SecondaryColour_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_SecondaryColour_1 = Module["_emscripten_bind_ASS_Style_set_SecondaryColour_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_SecondaryColour_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_OutlineColour_0 = Module["_emscripten_bind_ASS_Style_get_OutlineColour_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_OutlineColour_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_OutlineColour_1 = Module["_emscripten_bind_ASS_Style_set_OutlineColour_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_OutlineColour_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_BackColour_0 = Module["_emscripten_bind_ASS_Style_get_BackColour_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_BackColour_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_BackColour_1 = Module["_emscripten_bind_ASS_Style_set_BackColour_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_BackColour_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Bold_0 = Module["_emscripten_bind_ASS_Style_get_Bold_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Bold_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Bold_1 = Module["_emscripten_bind_ASS_Style_set_Bold_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Bold_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Italic_0 = Module["_emscripten_bind_ASS_Style_get_Italic_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Italic_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Italic_1 = Module["_emscripten_bind_ASS_Style_set_Italic_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Italic_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Underline_0 = Module["_emscripten_bind_ASS_Style_get_Underline_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Underline_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Underline_1 = Module["_emscripten_bind_ASS_Style_set_Underline_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Underline_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_StrikeOut_0 = Module["_emscripten_bind_ASS_Style_get_StrikeOut_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_StrikeOut_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_StrikeOut_1 = Module["_emscripten_bind_ASS_Style_set_StrikeOut_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_StrikeOut_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_ScaleX_0 = Module["_emscripten_bind_ASS_Style_get_ScaleX_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_ScaleX_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_ScaleX_1 = Module["_emscripten_bind_ASS_Style_set_ScaleX_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_ScaleX_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_ScaleY_0 = Module["_emscripten_bind_ASS_Style_get_ScaleY_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_ScaleY_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_ScaleY_1 = Module["_emscripten_bind_ASS_Style_set_ScaleY_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_ScaleY_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Spacing_0 = Module["_emscripten_bind_ASS_Style_get_Spacing_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Spacing_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Spacing_1 = Module["_emscripten_bind_ASS_Style_set_Spacing_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Spacing_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Angle_0 = Module["_emscripten_bind_ASS_Style_get_Angle_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Angle_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Angle_1 = Module["_emscripten_bind_ASS_Style_set_Angle_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Angle_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_BorderStyle_0 = Module["_emscripten_bind_ASS_Style_get_BorderStyle_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_BorderStyle_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_BorderStyle_1 = Module["_emscripten_bind_ASS_Style_set_BorderStyle_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_BorderStyle_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Outline_0 = Module["_emscripten_bind_ASS_Style_get_Outline_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Outline_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Outline_1 = Module["_emscripten_bind_ASS_Style_set_Outline_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Outline_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Shadow_0 = Module["_emscripten_bind_ASS_Style_get_Shadow_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Shadow_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Shadow_1 = Module["_emscripten_bind_ASS_Style_set_Shadow_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Shadow_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Alignment_0 = Module["_emscripten_bind_ASS_Style_get_Alignment_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Alignment_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Alignment_1 = Module["_emscripten_bind_ASS_Style_set_Alignment_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Alignment_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_MarginL_0 = Module["_emscripten_bind_ASS_Style_get_MarginL_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_MarginL_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_MarginL_1 = Module["_emscripten_bind_ASS_Style_set_MarginL_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_MarginL_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_MarginR_0 = Module["_emscripten_bind_ASS_Style_get_MarginR_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_MarginR_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_MarginR_1 = Module["_emscripten_bind_ASS_Style_set_MarginR_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_MarginR_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_MarginV_0 = Module["_emscripten_bind_ASS_Style_get_MarginV_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_MarginV_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_MarginV_1 = Module["_emscripten_bind_ASS_Style_set_MarginV_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_MarginV_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Encoding_0 = Module["_emscripten_bind_ASS_Style_get_Encoding_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Encoding_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Encoding_1 = Module["_emscripten_bind_ASS_Style_set_Encoding_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Encoding_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0 = Module["_emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1 = Module["_emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Blur_0 = Module["_emscripten_bind_ASS_Style_get_Blur_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Blur_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Blur_1 = Module["_emscripten_bind_ASS_Style_set_Blur_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Blur_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_get_Justify_0 = Module["_emscripten_bind_ASS_Style_get_Justify_0"] = createExportWrapper("emscripten_bind_ASS_Style_get_Justify_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Style_set_Justify_1 = Module["_emscripten_bind_ASS_Style_set_Justify_1"] = createExportWrapper("emscripten_bind_ASS_Style_set_Justify_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_Start_0 = Module["_emscripten_bind_ASS_Event_get_Start_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_Start_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_Start_1 = Module["_emscripten_bind_ASS_Event_set_Start_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_Start_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_Duration_0 = Module["_emscripten_bind_ASS_Event_get_Duration_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_Duration_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_Duration_1 = Module["_emscripten_bind_ASS_Event_set_Duration_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_Duration_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_ReadOrder_0 = Module["_emscripten_bind_ASS_Event_get_ReadOrder_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_ReadOrder_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_ReadOrder_1 = Module["_emscripten_bind_ASS_Event_set_ReadOrder_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_ReadOrder_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_Layer_0 = Module["_emscripten_bind_ASS_Event_get_Layer_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_Layer_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_Layer_1 = Module["_emscripten_bind_ASS_Event_set_Layer_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_Layer_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_Style_0 = Module["_emscripten_bind_ASS_Event_get_Style_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_Style_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_Style_1 = Module["_emscripten_bind_ASS_Event_set_Style_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_Style_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_Name_0 = Module["_emscripten_bind_ASS_Event_get_Name_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_Name_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_Name_1 = Module["_emscripten_bind_ASS_Event_set_Name_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_Name_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_MarginL_0 = Module["_emscripten_bind_ASS_Event_get_MarginL_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_MarginL_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_MarginL_1 = Module["_emscripten_bind_ASS_Event_set_MarginL_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_MarginL_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_MarginR_0 = Module["_emscripten_bind_ASS_Event_get_MarginR_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_MarginR_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_MarginR_1 = Module["_emscripten_bind_ASS_Event_set_MarginR_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_MarginR_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_MarginV_0 = Module["_emscripten_bind_ASS_Event_get_MarginV_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_MarginV_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_MarginV_1 = Module["_emscripten_bind_ASS_Event_set_MarginV_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_MarginV_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_Effect_0 = Module["_emscripten_bind_ASS_Event_get_Effect_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_Effect_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_Effect_1 = Module["_emscripten_bind_ASS_Event_set_Effect_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_Effect_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_get_Text_0 = Module["_emscripten_bind_ASS_Event_get_Text_0"] = createExportWrapper("emscripten_bind_ASS_Event_get_Text_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Event_set_Text_1 = Module["_emscripten_bind_ASS_Event_set_Text_1"] = createExportWrapper("emscripten_bind_ASS_Event_set_Text_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_n_styles_0 = Module["_emscripten_bind_ASS_Track_get_n_styles_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_n_styles_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_n_styles_1 = Module["_emscripten_bind_ASS_Track_set_n_styles_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_n_styles_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_max_styles_0 = Module["_emscripten_bind_ASS_Track_get_max_styles_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_max_styles_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_max_styles_1 = Module["_emscripten_bind_ASS_Track_set_max_styles_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_max_styles_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_n_events_0 = Module["_emscripten_bind_ASS_Track_get_n_events_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_n_events_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_n_events_1 = Module["_emscripten_bind_ASS_Track_set_n_events_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_n_events_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_max_events_0 = Module["_emscripten_bind_ASS_Track_get_max_events_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_max_events_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_max_events_1 = Module["_emscripten_bind_ASS_Track_set_max_events_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_max_events_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_styles_1 = Module["_emscripten_bind_ASS_Track_get_styles_1"] = createExportWrapper("emscripten_bind_ASS_Track_get_styles_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_styles_2 = Module["_emscripten_bind_ASS_Track_set_styles_2"] = createExportWrapper("emscripten_bind_ASS_Track_set_styles_2");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_events_1 = Module["_emscripten_bind_ASS_Track_get_events_1"] = createExportWrapper("emscripten_bind_ASS_Track_get_events_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_events_2 = Module["_emscripten_bind_ASS_Track_set_events_2"] = createExportWrapper("emscripten_bind_ASS_Track_set_events_2");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_style_format_0 = Module["_emscripten_bind_ASS_Track_get_style_format_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_style_format_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_style_format_1 = Module["_emscripten_bind_ASS_Track_set_style_format_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_style_format_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_event_format_0 = Module["_emscripten_bind_ASS_Track_get_event_format_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_event_format_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_event_format_1 = Module["_emscripten_bind_ASS_Track_set_event_format_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_event_format_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_PlayResX_0 = Module["_emscripten_bind_ASS_Track_get_PlayResX_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_PlayResX_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_PlayResX_1 = Module["_emscripten_bind_ASS_Track_set_PlayResX_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_PlayResX_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_PlayResY_0 = Module["_emscripten_bind_ASS_Track_get_PlayResY_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_PlayResY_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_PlayResY_1 = Module["_emscripten_bind_ASS_Track_set_PlayResY_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_PlayResY_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_Timer_0 = Module["_emscripten_bind_ASS_Track_get_Timer_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_Timer_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_Timer_1 = Module["_emscripten_bind_ASS_Track_set_Timer_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_Timer_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_WrapStyle_0 = Module["_emscripten_bind_ASS_Track_get_WrapStyle_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_WrapStyle_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_WrapStyle_1 = Module["_emscripten_bind_ASS_Track_set_WrapStyle_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_WrapStyle_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0 = Module["_emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1 = Module["_emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_Kerning_0 = Module["_emscripten_bind_ASS_Track_get_Kerning_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_Kerning_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_Kerning_1 = Module["_emscripten_bind_ASS_Track_set_Kerning_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_Kerning_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_Language_0 = Module["_emscripten_bind_ASS_Track_get_Language_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_Language_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_Language_1 = Module["_emscripten_bind_ASS_Track_set_Language_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_Language_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_default_style_0 = Module["_emscripten_bind_ASS_Track_get_default_style_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_default_style_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_default_style_1 = Module["_emscripten_bind_ASS_Track_set_default_style_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_default_style_1");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_get_name_0 = Module["_emscripten_bind_ASS_Track_get_name_0"] = createExportWrapper("emscripten_bind_ASS_Track_get_name_0");

/** @type {function(...*):?} */
var _emscripten_bind_ASS_Track_set_name_1 = Module["_emscripten_bind_ASS_Track_set_name_1"] = createExportWrapper("emscripten_bind_ASS_Track_set_name_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_libass_0 = Module["_emscripten_bind_libass_libass_0"] = createExportWrapper("emscripten_bind_libass_libass_0");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_library_version_0 = Module["_emscripten_bind_libass_oct_library_version_0"] = createExportWrapper("emscripten_bind_libass_oct_library_version_0");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_library_init_0 = Module["_emscripten_bind_libass_oct_library_init_0"] = createExportWrapper("emscripten_bind_libass_oct_library_init_0");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_library_done_1 = Module["_emscripten_bind_libass_oct_library_done_1"] = createExportWrapper("emscripten_bind_libass_oct_library_done_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_fonts_dir_2 = Module["_emscripten_bind_libass_oct_set_fonts_dir_2"] = createExportWrapper("emscripten_bind_libass_oct_set_fonts_dir_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_extract_fonts_2 = Module["_emscripten_bind_libass_oct_set_extract_fonts_2"] = createExportWrapper("emscripten_bind_libass_oct_set_extract_fonts_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_style_overrides_2 = Module["_emscripten_bind_libass_oct_set_style_overrides_2"] = createExportWrapper("emscripten_bind_libass_oct_set_style_overrides_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_process_force_style_1 = Module["_emscripten_bind_libass_oct_process_force_style_1"] = createExportWrapper("emscripten_bind_libass_oct_process_force_style_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_renderer_init_1 = Module["_emscripten_bind_libass_oct_renderer_init_1"] = createExportWrapper("emscripten_bind_libass_oct_renderer_init_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_renderer_done_1 = Module["_emscripten_bind_libass_oct_renderer_done_1"] = createExportWrapper("emscripten_bind_libass_oct_renderer_done_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_frame_size_3 = Module["_emscripten_bind_libass_oct_set_frame_size_3"] = createExportWrapper("emscripten_bind_libass_oct_set_frame_size_3");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_storage_size_3 = Module["_emscripten_bind_libass_oct_set_storage_size_3"] = createExportWrapper("emscripten_bind_libass_oct_set_storage_size_3");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_shaper_2 = Module["_emscripten_bind_libass_oct_set_shaper_2"] = createExportWrapper("emscripten_bind_libass_oct_set_shaper_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_margins_5 = Module["_emscripten_bind_libass_oct_set_margins_5"] = createExportWrapper("emscripten_bind_libass_oct_set_margins_5");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_use_margins_2 = Module["_emscripten_bind_libass_oct_set_use_margins_2"] = createExportWrapper("emscripten_bind_libass_oct_set_use_margins_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_pixel_aspect_2 = Module["_emscripten_bind_libass_oct_set_pixel_aspect_2"] = createExportWrapper("emscripten_bind_libass_oct_set_pixel_aspect_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_aspect_ratio_3 = Module["_emscripten_bind_libass_oct_set_aspect_ratio_3"] = createExportWrapper("emscripten_bind_libass_oct_set_aspect_ratio_3");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_font_scale_2 = Module["_emscripten_bind_libass_oct_set_font_scale_2"] = createExportWrapper("emscripten_bind_libass_oct_set_font_scale_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_hinting_2 = Module["_emscripten_bind_libass_oct_set_hinting_2"] = createExportWrapper("emscripten_bind_libass_oct_set_hinting_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_line_spacing_2 = Module["_emscripten_bind_libass_oct_set_line_spacing_2"] = createExportWrapper("emscripten_bind_libass_oct_set_line_spacing_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_line_position_2 = Module["_emscripten_bind_libass_oct_set_line_position_2"] = createExportWrapper("emscripten_bind_libass_oct_set_line_position_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_fonts_6 = Module["_emscripten_bind_libass_oct_set_fonts_6"] = createExportWrapper("emscripten_bind_libass_oct_set_fonts_6");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_selective_style_override_enabled_2 = Module["_emscripten_bind_libass_oct_set_selective_style_override_enabled_2"] = createExportWrapper("emscripten_bind_libass_oct_set_selective_style_override_enabled_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_selective_style_override_2 = Module["_emscripten_bind_libass_oct_set_selective_style_override_2"] = createExportWrapper("emscripten_bind_libass_oct_set_selective_style_override_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_set_cache_limits_3 = Module["_emscripten_bind_libass_oct_set_cache_limits_3"] = createExportWrapper("emscripten_bind_libass_oct_set_cache_limits_3");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_render_frame_4 = Module["_emscripten_bind_libass_oct_render_frame_4"] = createExportWrapper("emscripten_bind_libass_oct_render_frame_4");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_new_track_1 = Module["_emscripten_bind_libass_oct_new_track_1"] = createExportWrapper("emscripten_bind_libass_oct_new_track_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_free_track_1 = Module["_emscripten_bind_libass_oct_free_track_1"] = createExportWrapper("emscripten_bind_libass_oct_free_track_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_alloc_style_1 = Module["_emscripten_bind_libass_oct_alloc_style_1"] = createExportWrapper("emscripten_bind_libass_oct_alloc_style_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_alloc_event_1 = Module["_emscripten_bind_libass_oct_alloc_event_1"] = createExportWrapper("emscripten_bind_libass_oct_alloc_event_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_free_style_2 = Module["_emscripten_bind_libass_oct_free_style_2"] = createExportWrapper("emscripten_bind_libass_oct_free_style_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_free_event_2 = Module["_emscripten_bind_libass_oct_free_event_2"] = createExportWrapper("emscripten_bind_libass_oct_free_event_2");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_flush_events_1 = Module["_emscripten_bind_libass_oct_flush_events_1"] = createExportWrapper("emscripten_bind_libass_oct_flush_events_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_read_file_3 = Module["_emscripten_bind_libass_oct_read_file_3"] = createExportWrapper("emscripten_bind_libass_oct_read_file_3");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_add_font_4 = Module["_emscripten_bind_libass_oct_add_font_4"] = createExportWrapper("emscripten_bind_libass_oct_add_font_4");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_clear_fonts_1 = Module["_emscripten_bind_libass_oct_clear_fonts_1"] = createExportWrapper("emscripten_bind_libass_oct_clear_fonts_1");

/** @type {function(...*):?} */
var _emscripten_bind_libass_oct_step_sub_3 = Module["_emscripten_bind_libass_oct_step_sub_3"] = createExportWrapper("emscripten_bind_libass_oct_step_sub_3");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_changed_0 = Module["_emscripten_bind_RenderResult_get_changed_0"] = createExportWrapper("emscripten_bind_RenderResult_get_changed_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_changed_1 = Module["_emscripten_bind_RenderResult_set_changed_1"] = createExportWrapper("emscripten_bind_RenderResult_set_changed_1");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_time_0 = Module["_emscripten_bind_RenderResult_get_time_0"] = createExportWrapper("emscripten_bind_RenderResult_get_time_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_time_1 = Module["_emscripten_bind_RenderResult_set_time_1"] = createExportWrapper("emscripten_bind_RenderResult_set_time_1");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_x_0 = Module["_emscripten_bind_RenderResult_get_x_0"] = createExportWrapper("emscripten_bind_RenderResult_get_x_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_x_1 = Module["_emscripten_bind_RenderResult_set_x_1"] = createExportWrapper("emscripten_bind_RenderResult_set_x_1");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_y_0 = Module["_emscripten_bind_RenderResult_get_y_0"] = createExportWrapper("emscripten_bind_RenderResult_get_y_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_y_1 = Module["_emscripten_bind_RenderResult_set_y_1"] = createExportWrapper("emscripten_bind_RenderResult_set_y_1");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_w_0 = Module["_emscripten_bind_RenderResult_get_w_0"] = createExportWrapper("emscripten_bind_RenderResult_get_w_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_w_1 = Module["_emscripten_bind_RenderResult_set_w_1"] = createExportWrapper("emscripten_bind_RenderResult_set_w_1");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_h_0 = Module["_emscripten_bind_RenderResult_get_h_0"] = createExportWrapper("emscripten_bind_RenderResult_get_h_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_h_1 = Module["_emscripten_bind_RenderResult_set_h_1"] = createExportWrapper("emscripten_bind_RenderResult_set_h_1");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_image_0 = Module["_emscripten_bind_RenderResult_get_image_0"] = createExportWrapper("emscripten_bind_RenderResult_get_image_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_image_1 = Module["_emscripten_bind_RenderResult_set_image_1"] = createExportWrapper("emscripten_bind_RenderResult_set_image_1");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_get_next_0 = Module["_emscripten_bind_RenderResult_get_next_0"] = createExportWrapper("emscripten_bind_RenderResult_get_next_0");

/** @type {function(...*):?} */
var _emscripten_bind_RenderResult_set_next_1 = Module["_emscripten_bind_RenderResult_set_next_1"] = createExportWrapper("emscripten_bind_RenderResult_set_next_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_SubtitleOctopus_0 = Module["_emscripten_bind_SubtitleOctopus_SubtitleOctopus_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_SubtitleOctopus_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_setLogLevel_1 = Module["_emscripten_bind_SubtitleOctopus_setLogLevel_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_setLogLevel_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_setDropAnimations_1 = Module["_emscripten_bind_SubtitleOctopus_setDropAnimations_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_setDropAnimations_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_initLibrary_2 = Module["_emscripten_bind_SubtitleOctopus_initLibrary_2"] = createExportWrapper("emscripten_bind_SubtitleOctopus_initLibrary_2");

/** @type {function(...*):?} */
var _free = Module["_free"] = createExportWrapper("free");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_createTrack_1 = Module["_emscripten_bind_SubtitleOctopus_createTrack_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_createTrack_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_createTrackMem_2 = Module["_emscripten_bind_SubtitleOctopus_createTrackMem_2"] = createExportWrapper("emscripten_bind_SubtitleOctopus_createTrackMem_2");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_removeTrack_0 = Module["_emscripten_bind_SubtitleOctopus_removeTrack_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_removeTrack_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_resizeCanvas_2 = Module["_emscripten_bind_SubtitleOctopus_resizeCanvas_2"] = createExportWrapper("emscripten_bind_SubtitleOctopus_resizeCanvas_2");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_renderImage_2 = Module["_emscripten_bind_SubtitleOctopus_renderImage_2"] = createExportWrapper("emscripten_bind_SubtitleOctopus_renderImage_2");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_quitLibrary_0 = Module["_emscripten_bind_SubtitleOctopus_quitLibrary_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_quitLibrary_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_reloadLibrary_0 = Module["_emscripten_bind_SubtitleOctopus_reloadLibrary_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_reloadLibrary_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_reloadFonts_0 = Module["_emscripten_bind_SubtitleOctopus_reloadFonts_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_reloadFonts_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_setMargin_4 = Module["_emscripten_bind_SubtitleOctopus_setMargin_4"] = createExportWrapper("emscripten_bind_SubtitleOctopus_setMargin_4");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_getEventCount_0 = Module["_emscripten_bind_SubtitleOctopus_getEventCount_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_getEventCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_allocEvent_0 = Module["_emscripten_bind_SubtitleOctopus_allocEvent_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_allocEvent_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_allocStyle_0 = Module["_emscripten_bind_SubtitleOctopus_allocStyle_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_allocStyle_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_removeEvent_1 = Module["_emscripten_bind_SubtitleOctopus_removeEvent_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_removeEvent_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_getStyleCount_0 = Module["_emscripten_bind_SubtitleOctopus_getStyleCount_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_getStyleCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_getStyleByName_1 = Module["_emscripten_bind_SubtitleOctopus_getStyleByName_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_getStyleByName_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_removeStyle_1 = Module["_emscripten_bind_SubtitleOctopus_removeStyle_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_removeStyle_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_removeAllEvents_0 = Module["_emscripten_bind_SubtitleOctopus_removeAllEvents_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_removeAllEvents_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_setMemoryLimits_2 = Module["_emscripten_bind_SubtitleOctopus_setMemoryLimits_2"] = createExportWrapper("emscripten_bind_SubtitleOctopus_setMemoryLimits_2");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_renderBlend_2 = Module["_emscripten_bind_SubtitleOctopus_renderBlend_2"] = createExportWrapper("emscripten_bind_SubtitleOctopus_renderBlend_2");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_get_track_0 = Module["_emscripten_bind_SubtitleOctopus_get_track_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_get_track_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_set_track_1 = Module["_emscripten_bind_SubtitleOctopus_set_track_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_set_track_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_get_ass_renderer_0 = Module["_emscripten_bind_SubtitleOctopus_get_ass_renderer_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_get_ass_renderer_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_set_ass_renderer_1 = Module["_emscripten_bind_SubtitleOctopus_set_ass_renderer_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_set_ass_renderer_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_get_ass_library_0 = Module["_emscripten_bind_SubtitleOctopus_get_ass_library_0"] = createExportWrapper("emscripten_bind_SubtitleOctopus_get_ass_library_0");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus_set_ass_library_1 = Module["_emscripten_bind_SubtitleOctopus_set_ass_library_1"] = createExportWrapper("emscripten_bind_SubtitleOctopus_set_ass_library_1");

/** @type {function(...*):?} */
var _emscripten_bind_SubtitleOctopus___destroy___0 = Module["_emscripten_bind_SubtitleOctopus___destroy___0"] = createExportWrapper("emscripten_bind_SubtitleOctopus___destroy___0");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NONE = Module["_emscripten_enum_ASS_Hinting_ASS_HINTING_NONE"] = createExportWrapper("emscripten_enum_ASS_Hinting_ASS_HINTING_NONE");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT = Module["_emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT"] = createExportWrapper("emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL = Module["_emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL"] = createExportWrapper("emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE = Module["_emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE"] = createExportWrapper("emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE = Module["_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE"] = createExportWrapper("emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX = Module["_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX"] = createExportWrapper("emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE");

/** @type {function(...*):?} */
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY = Module["_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY"] = createExportWrapper("emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY");

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = createExportWrapper("malloc");

/** @type {function(...*):?} */
var _saveSetjmp = Module["_saveSetjmp"] = createExportWrapper("saveSetjmp");

/** @type {function(...*):?} */
var _fflush = Module["_fflush"] = createExportWrapper("fflush");

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = createExportWrapper("stackSave");

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");

/** @type {function(...*):?} */
var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
  return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function() {
  return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
  return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _setThrew = Module["_setThrew"] = createExportWrapper("setThrew");

/** @type {function(...*):?} */
var _memalign = Module["_memalign"] = createExportWrapper("memalign");

/** @type {function(...*):?} */
var dynCall_jij = Module["dynCall_jij"] = createExportWrapper("dynCall_jij");

/** @type {function(...*):?} */
var dynCall_viiiiji = Module["dynCall_viiiiji"] = createExportWrapper("dynCall_viiiiji");

/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");


function invoke_viiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}

function invoke_v(index) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)();
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}




// === Auto-generated postamble setup entry stuff ===

if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString")) Module["intArrayFromString"] = function() { abort("'intArrayFromString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString")) Module["intArrayToString"] = function() { abort("'intArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
if (!Object.getOwnPropertyDescriptor(Module, "setValue")) Module["setValue"] = function() { abort("'setValue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["getValue"] = getValue;
if (!Object.getOwnPropertyDescriptor(Module, "allocate")) Module["allocate"] = function() { abort("'allocate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString")) Module["UTF8ArrayToString"] = function() { abort("'UTF8ArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString")) Module["UTF8ToString"] = function() { abort("'UTF8ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array")) Module["stringToUTF8Array"] = function() { abort("'stringToUTF8Array' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8")) Module["stringToUTF8"] = function() { abort("'stringToUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8")) Module["lengthBytesUTF8"] = function() { abort("'lengthBytesUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun")) Module["addOnPreRun"] = function() { abort("'addOnPreRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnInit")) Module["addOnInit"] = function() { abort("'addOnInit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain")) Module["addOnPreMain"] = function() { abort("'addOnPreMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnExit")) Module["addOnExit"] = function() { abort("'addOnExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun")) Module["addOnPostRun"] = function() { abort("'addOnPostRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeStringToMemory")) Module["writeStringToMemory"] = function() { abort("'writeStringToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory")) Module["writeArrayToMemory"] = function() { abort("'writeArrayToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory")) Module["writeAsciiToMemory"] = function() { abort("'writeAsciiToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["addRunDependency"] = addRunDependency;
Module["removeRunDependency"] = removeRunDependency;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder")) Module["FS_createFolder"] = function() { abort("'FS_createFolder' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink")) Module["FS_createLink"] = function() { abort("'FS_createLink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
if (!Object.getOwnPropertyDescriptor(Module, "getLEB")) Module["getLEB"] = function() { abort("'getLEB' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables")) Module["getFunctionTables"] = function() { abort("'getFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables")) Module["alignFunctionTables"] = function() { abort("'alignFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions")) Module["registerFunctions"] = function() { abort("'registerFunctions' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addFunction")) Module["addFunction"] = function() { abort("'addFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "removeFunction")) Module["removeFunction"] = function() { abort("'removeFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint")) Module["prettyPrint"] = function() { abort("'prettyPrint' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting")) Module["getCompilerSetting"] = function() { abort("'getCompilerSetting' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "print")) Module["print"] = function() { abort("'print' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "printErr")) Module["printErr"] = function() { abort("'printErr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0")) Module["getTempRet0"] = function() { abort("'getTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0")) Module["setTempRet0"] = function() { abort("'setTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callMain")) Module["callMain"] = function() { abort("'callMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "abort")) Module["abort"] = function() { abort("'abort' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "keepRuntimeAlive")) Module["keepRuntimeAlive"] = function() { abort("'keepRuntimeAlive' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "zeroMemory")) Module["zeroMemory"] = function() { abort("'zeroMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToNewUTF8")) Module["stringToNewUTF8"] = function() { abort("'stringToNewUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setFileTime")) Module["setFileTime"] = function() { abort("'setFileTime' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscripten_realloc_buffer")) Module["emscripten_realloc_buffer"] = function() { abort("'emscripten_realloc_buffer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ENV")) Module["ENV"] = function() { abort("'ENV' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "withStackSave")) Module["withStackSave"] = function() { abort("'withStackSave' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_CODES")) Module["ERRNO_CODES"] = function() { abort("'ERRNO_CODES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_MESSAGES")) Module["ERRNO_MESSAGES"] = function() { abort("'ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setErrNo")) Module["setErrNo"] = function() { abort("'setErrNo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetPton4")) Module["inetPton4"] = function() { abort("'inetPton4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetNtop4")) Module["inetNtop4"] = function() { abort("'inetNtop4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetPton6")) Module["inetPton6"] = function() { abort("'inetPton6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetNtop6")) Module["inetNtop6"] = function() { abort("'inetNtop6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readSockaddr")) Module["readSockaddr"] = function() { abort("'readSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeSockaddr")) Module["writeSockaddr"] = function() { abort("'writeSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "DNS")) Module["DNS"] = function() { abort("'DNS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getHostByName")) Module["getHostByName"] = function() { abort("'getHostByName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GAI_ERRNO_MESSAGES")) Module["GAI_ERRNO_MESSAGES"] = function() { abort("'GAI_ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Protocols")) Module["Protocols"] = function() { abort("'Protocols' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Sockets")) Module["Sockets"] = function() { abort("'Sockets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getRandomDevice")) Module["getRandomDevice"] = function() { abort("'getRandomDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "traverseStack")) Module["traverseStack"] = function() { abort("'traverseStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UNWIND_CACHE")) Module["UNWIND_CACHE"] = function() { abort("'UNWIND_CACHE' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgsArray")) Module["readAsmConstArgsArray"] = function() { abort("'readAsmConstArgsArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgs")) Module["readAsmConstArgs"] = function() { abort("'readAsmConstArgs' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "mainThreadEM_ASM")) Module["mainThreadEM_ASM"] = function() { abort("'mainThreadEM_ASM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_q")) Module["jstoi_q"] = function() { abort("'jstoi_q' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_s")) Module["jstoi_s"] = function() { abort("'jstoi_s' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getExecutableName")) Module["getExecutableName"] = function() { abort("'getExecutableName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "listenOnce")) Module["listenOnce"] = function() { abort("'listenOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "autoResumeAudioContext")) Module["autoResumeAudioContext"] = function() { abort("'autoResumeAudioContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCallLegacy")) Module["dynCallLegacy"] = function() { abort("'dynCallLegacy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getDynCaller")) Module["getDynCaller"] = function() { abort("'getDynCaller' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callRuntimeCallbacks")) Module["callRuntimeCallbacks"] = function() { abort("'callRuntimeCallbacks' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "wasmTableMirror")) Module["wasmTableMirror"] = function() { abort("'wasmTableMirror' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setWasmTableEntry")) Module["setWasmTableEntry"] = function() { abort("'setWasmTableEntry' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getWasmTableEntry")) Module["getWasmTableEntry"] = function() { abort("'getWasmTableEntry' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "handleException")) Module["handleException"] = function() { abort("'handleException' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepalivePush")) Module["runtimeKeepalivePush"] = function() { abort("'runtimeKeepalivePush' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepalivePop")) Module["runtimeKeepalivePop"] = function() { abort("'runtimeKeepalivePop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callUserCallback")) Module["callUserCallback"] = function() { abort("'callUserCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "maybeExit")) Module["maybeExit"] = function() { abort("'maybeExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "safeSetTimeout")) Module["safeSetTimeout"] = function() { abort("'safeSetTimeout' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "asmjsMangle")) Module["asmjsMangle"] = function() { abort("'asmjsMangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "asyncLoad")) Module["asyncLoad"] = function() { abort("'asyncLoad' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "alignMemory")) Module["alignMemory"] = function() { abort("'alignMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "mmapAlloc")) Module["mmapAlloc"] = function() { abort("'mmapAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "reallyNegative")) Module["reallyNegative"] = function() { abort("'reallyNegative' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "unSign")) Module["unSign"] = function() { abort("'unSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "reSign")) Module["reSign"] = function() { abort("'reSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "formatString")) Module["formatString"] = function() { abort("'formatString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PATH")) Module["PATH"] = function() { abort("'PATH' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PATH_FS")) Module["PATH_FS"] = function() { abort("'PATH_FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SYSCALLS")) Module["SYSCALLS"] = function() { abort("'SYSCALLS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "syscallMmap2")) Module["syscallMmap2"] = function() { abort("'syscallMmap2' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "syscallMunmap")) Module["syscallMunmap"] = function() { abort("'syscallMunmap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getSocketFromFD")) Module["getSocketFromFD"] = function() { abort("'getSocketFromFD' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getSocketAddress")) Module["getSocketAddress"] = function() { abort("'getSocketAddress' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "JSEvents")) Module["JSEvents"] = function() { abort("'JSEvents' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerKeyEventCallback")) Module["registerKeyEventCallback"] = function() { abort("'registerKeyEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "specialHTMLTargets")) Module["specialHTMLTargets"] = function() { abort("'specialHTMLTargets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "maybeCStringToJsString")) Module["maybeCStringToJsString"] = function() { abort("'maybeCStringToJsString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "findEventTarget")) Module["findEventTarget"] = function() { abort("'findEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "findCanvasEventTarget")) Module["findCanvasEventTarget"] = function() { abort("'findCanvasEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getBoundingClientRect")) Module["getBoundingClientRect"] = function() { abort("'getBoundingClientRect' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillMouseEventData")) Module["fillMouseEventData"] = function() { abort("'fillMouseEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerMouseEventCallback")) Module["registerMouseEventCallback"] = function() { abort("'registerMouseEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerWheelEventCallback")) Module["registerWheelEventCallback"] = function() { abort("'registerWheelEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerUiEventCallback")) Module["registerUiEventCallback"] = function() { abort("'registerUiEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerFocusEventCallback")) Module["registerFocusEventCallback"] = function() { abort("'registerFocusEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillDeviceOrientationEventData")) Module["fillDeviceOrientationEventData"] = function() { abort("'fillDeviceOrientationEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerDeviceOrientationEventCallback")) Module["registerDeviceOrientationEventCallback"] = function() { abort("'registerDeviceOrientationEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillDeviceMotionEventData")) Module["fillDeviceMotionEventData"] = function() { abort("'fillDeviceMotionEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerDeviceMotionEventCallback")) Module["registerDeviceMotionEventCallback"] = function() { abort("'registerDeviceMotionEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "screenOrientation")) Module["screenOrientation"] = function() { abort("'screenOrientation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillOrientationChangeEventData")) Module["fillOrientationChangeEventData"] = function() { abort("'fillOrientationChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerOrientationChangeEventCallback")) Module["registerOrientationChangeEventCallback"] = function() { abort("'registerOrientationChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillFullscreenChangeEventData")) Module["fillFullscreenChangeEventData"] = function() { abort("'fillFullscreenChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerFullscreenChangeEventCallback")) Module["registerFullscreenChangeEventCallback"] = function() { abort("'registerFullscreenChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerRestoreOldStyle")) Module["registerRestoreOldStyle"] = function() { abort("'registerRestoreOldStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "hideEverythingExceptGivenElement")) Module["hideEverythingExceptGivenElement"] = function() { abort("'hideEverythingExceptGivenElement' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "restoreHiddenElements")) Module["restoreHiddenElements"] = function() { abort("'restoreHiddenElements' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setLetterbox")) Module["setLetterbox"] = function() { abort("'setLetterbox' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "currentFullscreenStrategy")) Module["currentFullscreenStrategy"] = function() { abort("'currentFullscreenStrategy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "restoreOldWindowedStyle")) Module["restoreOldWindowedStyle"] = function() { abort("'restoreOldWindowedStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "softFullscreenResizeWebGLRenderTarget")) Module["softFullscreenResizeWebGLRenderTarget"] = function() { abort("'softFullscreenResizeWebGLRenderTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "doRequestFullscreen")) Module["doRequestFullscreen"] = function() { abort("'doRequestFullscreen' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillPointerlockChangeEventData")) Module["fillPointerlockChangeEventData"] = function() { abort("'fillPointerlockChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerPointerlockChangeEventCallback")) Module["registerPointerlockChangeEventCallback"] = function() { abort("'registerPointerlockChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerPointerlockErrorEventCallback")) Module["registerPointerlockErrorEventCallback"] = function() { abort("'registerPointerlockErrorEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "requestPointerLock")) Module["requestPointerLock"] = function() { abort("'requestPointerLock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillVisibilityChangeEventData")) Module["fillVisibilityChangeEventData"] = function() { abort("'fillVisibilityChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerVisibilityChangeEventCallback")) Module["registerVisibilityChangeEventCallback"] = function() { abort("'registerVisibilityChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerTouchEventCallback")) Module["registerTouchEventCallback"] = function() { abort("'registerTouchEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillGamepadEventData")) Module["fillGamepadEventData"] = function() { abort("'fillGamepadEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerGamepadEventCallback")) Module["registerGamepadEventCallback"] = function() { abort("'registerGamepadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerBeforeUnloadEventCallback")) Module["registerBeforeUnloadEventCallback"] = function() { abort("'registerBeforeUnloadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillBatteryEventData")) Module["fillBatteryEventData"] = function() { abort("'fillBatteryEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "battery")) Module["battery"] = function() { abort("'battery' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerBatteryEventCallback")) Module["registerBatteryEventCallback"] = function() { abort("'registerBatteryEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setCanvasElementSize")) Module["setCanvasElementSize"] = function() { abort("'setCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getCanvasElementSize")) Module["getCanvasElementSize"] = function() { abort("'getCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "demangle")) Module["demangle"] = function() { abort("'demangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "demangleAll")) Module["demangleAll"] = function() { abort("'demangleAll' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jsStackTrace")) Module["jsStackTrace"] = function() { abort("'jsStackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getEnvStrings")) Module["getEnvStrings"] = function() { abort("'getEnvStrings' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "checkWasiClock")) Module["checkWasiClock"] = function() { abort("'checkWasiClock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64")) Module["writeI53ToI64"] = function() { abort("'writeI53ToI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Clamped")) Module["writeI53ToI64Clamped"] = function() { abort("'writeI53ToI64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Signaling")) Module["writeI53ToI64Signaling"] = function() { abort("'writeI53ToI64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Clamped")) Module["writeI53ToU64Clamped"] = function() { abort("'writeI53ToU64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Signaling")) Module["writeI53ToU64Signaling"] = function() { abort("'writeI53ToU64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromI64")) Module["readI53FromI64"] = function() { abort("'readI53FromI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromU64")) Module["readI53FromU64"] = function() { abort("'readI53FromU64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "convertI32PairToI53")) Module["convertI32PairToI53"] = function() { abort("'convertI32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "convertU32PairToI53")) Module["convertU32PairToI53"] = function() { abort("'convertU32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setImmediateWrapped")) Module["setImmediateWrapped"] = function() { abort("'setImmediateWrapped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "clearImmediateWrapped")) Module["clearImmediateWrapped"] = function() { abort("'clearImmediateWrapped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "polyfillSetImmediate")) Module["polyfillSetImmediate"] = function() { abort("'polyfillSetImmediate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "uncaughtExceptionCount")) Module["uncaughtExceptionCount"] = function() { abort("'uncaughtExceptionCount' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exceptionLast")) Module["exceptionLast"] = function() { abort("'exceptionLast' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exceptionCaught")) Module["exceptionCaught"] = function() { abort("'exceptionCaught' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ExceptionInfo")) Module["ExceptionInfo"] = function() { abort("'ExceptionInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "CatchInfo")) Module["CatchInfo"] = function() { abort("'CatchInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exception_addRef")) Module["exception_addRef"] = function() { abort("'exception_addRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exception_decRef")) Module["exception_decRef"] = function() { abort("'exception_decRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Browser")) Module["Browser"] = function() { abort("'Browser' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "funcWrappers")) Module["funcWrappers"] = function() { abort("'funcWrappers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setMainLoop")) Module["setMainLoop"] = function() { abort("'setMainLoop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "wget")) Module["wget"] = function() { abort("'wget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "FS")) Module["FS"] = function() { abort("'FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "MEMFS")) Module["MEMFS"] = function() { abort("'MEMFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "TTY")) Module["TTY"] = function() { abort("'TTY' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PIPEFS")) Module["PIPEFS"] = function() { abort("'PIPEFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SOCKFS")) Module["SOCKFS"] = function() { abort("'SOCKFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "_setNetworkCallback")) Module["_setNetworkCallback"] = function() { abort("'_setNetworkCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "tempFixedLengthArray")) Module["tempFixedLengthArray"] = function() { abort("'tempFixedLengthArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "miniTempWebGLFloatBuffers")) Module["miniTempWebGLFloatBuffers"] = function() { abort("'miniTempWebGLFloatBuffers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "heapObjectForWebGLType")) Module["heapObjectForWebGLType"] = function() { abort("'heapObjectForWebGLType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "heapAccessShiftForWebGLHeap")) Module["heapAccessShiftForWebGLHeap"] = function() { abort("'heapAccessShiftForWebGLHeap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GL")) Module["GL"] = function() { abort("'GL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGet")) Module["emscriptenWebGLGet"] = function() { abort("'emscriptenWebGLGet' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "computeUnpackAlignedImageSize")) Module["computeUnpackAlignedImageSize"] = function() { abort("'computeUnpackAlignedImageSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetTexPixelData")) Module["emscriptenWebGLGetTexPixelData"] = function() { abort("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetUniform")) Module["emscriptenWebGLGetUniform"] = function() { abort("'emscriptenWebGLGetUniform' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "webglGetUniformLocation")) Module["webglGetUniformLocation"] = function() { abort("'webglGetUniformLocation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "webglPrepareUniformLocationsBeforeFirstUse")) Module["webglPrepareUniformLocationsBeforeFirstUse"] = function() { abort("'webglPrepareUniformLocationsBeforeFirstUse' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "webglGetLeftBracePos")) Module["webglGetLeftBracePos"] = function() { abort("'webglGetLeftBracePos' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetVertexAttrib")) Module["emscriptenWebGLGetVertexAttrib"] = function() { abort("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeGLArray")) Module["writeGLArray"] = function() { abort("'writeGLArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "AL")) Module["AL"] = function() { abort("'AL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_unicode")) Module["SDL_unicode"] = function() { abort("'SDL_unicode' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_ttfContext")) Module["SDL_ttfContext"] = function() { abort("'SDL_ttfContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_audio")) Module["SDL_audio"] = function() { abort("'SDL_audio' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL")) Module["SDL"] = function() { abort("'SDL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_gfx")) Module["SDL_gfx"] = function() { abort("'SDL_gfx' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLUT")) Module["GLUT"] = function() { abort("'GLUT' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "EGL")) Module["EGL"] = function() { abort("'EGL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLFW_Window")) Module["GLFW_Window"] = function() { abort("'GLFW_Window' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLFW")) Module["GLFW"] = function() { abort("'GLFW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLEW")) Module["GLEW"] = function() { abort("'GLEW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "IDBStore")) Module["IDBStore"] = function() { abort("'IDBStore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runAndAbortIfError")) Module["runAndAbortIfError"] = function() { abort("'runAndAbortIfError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "warnOnce")) Module["warnOnce"] = function() { abort("'warnOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackSave")) Module["stackSave"] = function() { abort("'stackSave' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackRestore")) Module["stackRestore"] = function() { abort("'stackRestore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc")) Module["stackAlloc"] = function() { abort("'stackAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString")) Module["AsciiToString"] = function() { abort("'AsciiToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii")) Module["stringToAscii"] = function() { abort("'stringToAscii' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString")) Module["UTF16ToString"] = function() { abort("'UTF16ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16")) Module["stringToUTF16"] = function() { abort("'stringToUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16")) Module["lengthBytesUTF16"] = function() { abort("'lengthBytesUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString")) Module["UTF32ToString"] = function() { abort("'UTF32ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32")) Module["stringToUTF32"] = function() { abort("'stringToUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32")) Module["lengthBytesUTF32"] = function() { abort("'lengthBytesUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8")) Module["allocateUTF8"] = function() { abort("'allocateUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8OnStack")) Module["allocateUTF8OnStack"] = function() { abort("'allocateUTF8OnStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["writeStackCookie"] = writeStackCookie;
Module["checkStackCookie"] = checkStackCookie;
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL")) Object.defineProperty(Module, "ALLOC_NORMAL", { configurable: true, get: function() { abort("'ALLOC_NORMAL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK")) Object.defineProperty(Module, "ALLOC_STACK", { configurable: true, get: function() { abort("'ALLOC_STACK' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") } });

var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  var entryFunction = Module['_main'];

  args = args || [];

  var argc = args.length+1;
  var argv = stackAlloc((argc + 1) * 4);
  HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram);
  for (var i = 1; i < argc; i++) {
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
  }
  HEAP32[(argv >> 2) + argc] = 0;

  try {

    var ret = entryFunction(argc, argv);

    // In PROXY_TO_PTHREAD builds, we should never exit the runtime below, as
    // execution is asynchronously handed off to a pthread.
    // if we're not running an evented main loop, it's time to exit
    exit(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  } finally {
    calledMain = true;

  }
}

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  _emscripten_stack_init();
  writeStackCookie();
}

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (shouldRunNow) callMain(args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}
Module['run'] = run;

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = function(x) {
    has = true;
  }
  try { // it doesn't matter if it fails
    var flush = Module['_fflush'];
    if (flush) flush(0);
    // also flush in the JS FS layer
    ['stdout', 'stderr'].forEach(function(name) {
      var info = FS.analyzePath('/dev/' + name);
      if (!info) return;
      var stream = info.object;
      var rdev = stream.rdev;
      var tty = TTY.ttys[rdev];
      if (tty && tty.output && tty.output.length) {
        has = true;
      }
    });
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
  }
}

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  EXITSTATUS = status;

  checkUnflushedContent();

  if (keepRuntimeAlive()) {
    // if exit() was called, we may warn the user if the runtime isn't actually being shut down
    if (!implicit) {
      var msg = 'program exited (with status: ' + status + '), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)';
      err(msg);
    }
  } else {
    exitRuntime();
  }

  procExit(status);
}

function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    if (Module['onExit']) Module['onExit'](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();






// Bindings utilities

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function WrapperObject() {
}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;

Module['NULL'] = wrapPointer(0);

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;

// Converts big (string or array) values into a C-style storage, in temporary space

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
var ensureCache = {
  buffer: 0,  // the main buffer of temporary storage
  size: 0,   // the size of buffer
  pos: 0,    // the next free offset in buffer
  temps: [], // extra allocations
  owned: [], // Owned allocations
  needed: 0, // the total size we need next time

  prepare: function() {
    if (ensureCache.needed) {
      // clear the temps
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module['_free'](ensureCache.temps[i]);
      }
      ensureCache.temps.length = 0;
      // prepare to allocate a bigger buffer
      Module['_free'](ensureCache.buffer);
      ensureCache.buffer = 0;
      ensureCache.size += ensureCache.needed;
      // clean up
      ensureCache.needed = 0;
    }
    if (!ensureCache.buffer) { // happens first time, or when we need to grow
      ensureCache.size += 128; // heuristic, avoid many small grow events
      ensureCache.buffer = Module['_malloc'](ensureCache.size);
      assert(ensureCache.buffer);
    }
    ensureCache.pos = 0;
  },
  alloc: function(array, view, owner) {
    assert(ensureCache.buffer);
    var bytes = view.BYTES_PER_ELEMENT;
    var len = array.length * bytes;
    len = (len + 7) & -8; // keep things aligned to 8 byte boundaries
    var ret;
    if (owner) {
      assert(len > 0); // null terminator, at least
      ensureCache.needed += len;
      ret = Module['_malloc'](len);
      ensureCache.owned.push(ret);
    } else {
      if (ensureCache.pos + len >= ensureCache.size) {
        // we failed to allocate in the buffer, ensureCache time around :(
        assert(len > 0); // null terminator, at least
        ensureCache.needed += len;
        ret = Module['_malloc'](len);
        ensureCache.temps.push(ret);
      } else {
        // we can allocate in the buffer
        ret = ensureCache.buffer + ensureCache.pos;
        ensureCache.pos += len;
      }
    }
    return ret;
  },
  copy: function(array, view, offset) {
    offset >>>= 0;
    var bytes = view.BYTES_PER_ELEMENT;
    switch (bytes) {
      case 2: offset >>>= 1; break;
      case 4: offset >>>= 2; break;
      case 8: offset >>>= 3; break;
    }
    for (var i = 0; i < array.length; i++) {
      view[offset + i] = array[i];
    }
  },
  clear: function(clearOwned) {
    for (var i = 0; i < ensureCache.temps.length; i++) {
      Module['_free'](ensureCache.temps[i]);
    }
    if (clearOwned) {
      for (var i = 0; i < ensureCache.owned.length; i++) {
        Module['_free'](ensureCache.owned[i]);
      }
    }
    ensureCache.temps.length = 0;
    Module['_free'](ensureCache.buffer);
    ensureCache.buffer = 0;
    ensureCache.size = 0;
    ensureCache.needed = 0;
  }
};

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureString(value, owner) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value);
    var offset = ensureCache.alloc(intArray, HEAP8, owner);
    ensureCache.copy(intArray, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt8(value, owner) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP8, owner);
    ensureCache.copy(value, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt16(value, owner) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP16, owner);
    ensureCache.copy(value, HEAP16, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt32(value, owner) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP32, owner);
    ensureCache.copy(value, HEAP32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat32(value, owner) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF32, owner);
    ensureCache.copy(value, HEAPF32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat64(value, owner) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF64, owner);
    ensureCache.copy(value, HEAPF64, offset);
    return offset;
  }
  return value;
}


// VoidPtr
/** @suppress {undefinedVars, duplicate} @this{Object} */function VoidPtr() { throw "cannot construct a VoidPtr, no constructor in IDL" }
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;

  VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
// ASS_Image
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_Image() { throw "cannot construct a ASS_Image, no constructor in IDL" }
ASS_Image.prototype = Object.create(WrapperObject.prototype);
ASS_Image.prototype.constructor = ASS_Image;
ASS_Image.prototype.__class__ = ASS_Image;
ASS_Image.__cache__ = {};
Module['ASS_Image'] = ASS_Image;

  ASS_Image.prototype['get_w'] = ASS_Image.prototype.get_w = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_w_0(self);
};
    ASS_Image.prototype['set_w'] = ASS_Image.prototype.set_w = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_w_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'w', { get: ASS_Image.prototype.get_w, set: ASS_Image.prototype.set_w });
  ASS_Image.prototype['get_h'] = ASS_Image.prototype.get_h = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_h_0(self);
};
    ASS_Image.prototype['set_h'] = ASS_Image.prototype.set_h = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_h_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'h', { get: ASS_Image.prototype.get_h, set: ASS_Image.prototype.set_h });
  ASS_Image.prototype['get_stride'] = ASS_Image.prototype.get_stride = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_stride_0(self);
};
    ASS_Image.prototype['set_stride'] = ASS_Image.prototype.set_stride = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_stride_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'stride', { get: ASS_Image.prototype.get_stride, set: ASS_Image.prototype.set_stride });
  ASS_Image.prototype['get_bitmap'] = ASS_Image.prototype.get_bitmap = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_bitmap_0(self);
};
    ASS_Image.prototype['set_bitmap'] = ASS_Image.prototype.set_bitmap = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, false);
  _emscripten_bind_ASS_Image_set_bitmap_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'bitmap', { get: ASS_Image.prototype.get_bitmap, set: ASS_Image.prototype.set_bitmap });
  ASS_Image.prototype['get_color'] = ASS_Image.prototype.get_color = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_color_0(self);
};
    ASS_Image.prototype['set_color'] = ASS_Image.prototype.set_color = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_color_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'color', { get: ASS_Image.prototype.get_color, set: ASS_Image.prototype.set_color });
  ASS_Image.prototype['get_dst_x'] = ASS_Image.prototype.get_dst_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_dst_x_0(self);
};
    ASS_Image.prototype['set_dst_x'] = ASS_Image.prototype.set_dst_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_dst_x_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'dst_x', { get: ASS_Image.prototype.get_dst_x, set: ASS_Image.prototype.set_dst_x });
  ASS_Image.prototype['get_dst_y'] = ASS_Image.prototype.get_dst_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_dst_y_0(self);
};
    ASS_Image.prototype['set_dst_y'] = ASS_Image.prototype.set_dst_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_dst_y_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'dst_y', { get: ASS_Image.prototype.get_dst_y, set: ASS_Image.prototype.set_dst_y });
  ASS_Image.prototype['get_next'] = ASS_Image.prototype.get_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_ASS_Image_get_next_0(self), ASS_Image);
};
    ASS_Image.prototype['set_next'] = ASS_Image.prototype.set_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_next_1(self, arg0);
};
    Object.defineProperty(ASS_Image.prototype, 'next', { get: ASS_Image.prototype.get_next, set: ASS_Image.prototype.set_next });
// ASS_Style
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_Style() { throw "cannot construct a ASS_Style, no constructor in IDL" }
ASS_Style.prototype = Object.create(WrapperObject.prototype);
ASS_Style.prototype.constructor = ASS_Style;
ASS_Style.prototype.__class__ = ASS_Style;
ASS_Style.__cache__ = {};
Module['ASS_Style'] = ASS_Style;

  ASS_Style.prototype['get_Name'] = ASS_Style.prototype.get_Name = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Style_get_Name_0(self));
};
    ASS_Style.prototype['set_Name'] = ASS_Style.prototype.set_Name = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Style_set_Name_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Name', { get: ASS_Style.prototype.get_Name, set: ASS_Style.prototype.set_Name });
  ASS_Style.prototype['get_FontName'] = ASS_Style.prototype.get_FontName = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Style_get_FontName_0(self));
};
    ASS_Style.prototype['set_FontName'] = ASS_Style.prototype.set_FontName = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Style_set_FontName_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'FontName', { get: ASS_Style.prototype.get_FontName, set: ASS_Style.prototype.set_FontName });
  ASS_Style.prototype['get_FontSize'] = ASS_Style.prototype.get_FontSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_FontSize_0(self);
};
    ASS_Style.prototype['set_FontSize'] = ASS_Style.prototype.set_FontSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_FontSize_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'FontSize', { get: ASS_Style.prototype.get_FontSize, set: ASS_Style.prototype.set_FontSize });
  ASS_Style.prototype['get_PrimaryColour'] = ASS_Style.prototype.get_PrimaryColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_PrimaryColour_0(self);
};
    ASS_Style.prototype['set_PrimaryColour'] = ASS_Style.prototype.set_PrimaryColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_PrimaryColour_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'PrimaryColour', { get: ASS_Style.prototype.get_PrimaryColour, set: ASS_Style.prototype.set_PrimaryColour });
  ASS_Style.prototype['get_SecondaryColour'] = ASS_Style.prototype.get_SecondaryColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_SecondaryColour_0(self);
};
    ASS_Style.prototype['set_SecondaryColour'] = ASS_Style.prototype.set_SecondaryColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_SecondaryColour_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'SecondaryColour', { get: ASS_Style.prototype.get_SecondaryColour, set: ASS_Style.prototype.set_SecondaryColour });
  ASS_Style.prototype['get_OutlineColour'] = ASS_Style.prototype.get_OutlineColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_OutlineColour_0(self);
};
    ASS_Style.prototype['set_OutlineColour'] = ASS_Style.prototype.set_OutlineColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_OutlineColour_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'OutlineColour', { get: ASS_Style.prototype.get_OutlineColour, set: ASS_Style.prototype.set_OutlineColour });
  ASS_Style.prototype['get_BackColour'] = ASS_Style.prototype.get_BackColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_BackColour_0(self);
};
    ASS_Style.prototype['set_BackColour'] = ASS_Style.prototype.set_BackColour = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_BackColour_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'BackColour', { get: ASS_Style.prototype.get_BackColour, set: ASS_Style.prototype.set_BackColour });
  ASS_Style.prototype['get_Bold'] = ASS_Style.prototype.get_Bold = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Bold_0(self);
};
    ASS_Style.prototype['set_Bold'] = ASS_Style.prototype.set_Bold = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Bold_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Bold', { get: ASS_Style.prototype.get_Bold, set: ASS_Style.prototype.set_Bold });
  ASS_Style.prototype['get_Italic'] = ASS_Style.prototype.get_Italic = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Italic_0(self);
};
    ASS_Style.prototype['set_Italic'] = ASS_Style.prototype.set_Italic = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Italic_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Italic', { get: ASS_Style.prototype.get_Italic, set: ASS_Style.prototype.set_Italic });
  ASS_Style.prototype['get_Underline'] = ASS_Style.prototype.get_Underline = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Underline_0(self);
};
    ASS_Style.prototype['set_Underline'] = ASS_Style.prototype.set_Underline = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Underline_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Underline', { get: ASS_Style.prototype.get_Underline, set: ASS_Style.prototype.set_Underline });
  ASS_Style.prototype['get_StrikeOut'] = ASS_Style.prototype.get_StrikeOut = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_StrikeOut_0(self);
};
    ASS_Style.prototype['set_StrikeOut'] = ASS_Style.prototype.set_StrikeOut = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_StrikeOut_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'StrikeOut', { get: ASS_Style.prototype.get_StrikeOut, set: ASS_Style.prototype.set_StrikeOut });
  ASS_Style.prototype['get_ScaleX'] = ASS_Style.prototype.get_ScaleX = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_ScaleX_0(self);
};
    ASS_Style.prototype['set_ScaleX'] = ASS_Style.prototype.set_ScaleX = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_ScaleX_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'ScaleX', { get: ASS_Style.prototype.get_ScaleX, set: ASS_Style.prototype.set_ScaleX });
  ASS_Style.prototype['get_ScaleY'] = ASS_Style.prototype.get_ScaleY = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_ScaleY_0(self);
};
    ASS_Style.prototype['set_ScaleY'] = ASS_Style.prototype.set_ScaleY = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_ScaleY_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'ScaleY', { get: ASS_Style.prototype.get_ScaleY, set: ASS_Style.prototype.set_ScaleY });
  ASS_Style.prototype['get_Spacing'] = ASS_Style.prototype.get_Spacing = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Spacing_0(self);
};
    ASS_Style.prototype['set_Spacing'] = ASS_Style.prototype.set_Spacing = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Spacing_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Spacing', { get: ASS_Style.prototype.get_Spacing, set: ASS_Style.prototype.set_Spacing });
  ASS_Style.prototype['get_Angle'] = ASS_Style.prototype.get_Angle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Angle_0(self);
};
    ASS_Style.prototype['set_Angle'] = ASS_Style.prototype.set_Angle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Angle_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Angle', { get: ASS_Style.prototype.get_Angle, set: ASS_Style.prototype.set_Angle });
  ASS_Style.prototype['get_BorderStyle'] = ASS_Style.prototype.get_BorderStyle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_BorderStyle_0(self);
};
    ASS_Style.prototype['set_BorderStyle'] = ASS_Style.prototype.set_BorderStyle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_BorderStyle_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'BorderStyle', { get: ASS_Style.prototype.get_BorderStyle, set: ASS_Style.prototype.set_BorderStyle });
  ASS_Style.prototype['get_Outline'] = ASS_Style.prototype.get_Outline = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Outline_0(self);
};
    ASS_Style.prototype['set_Outline'] = ASS_Style.prototype.set_Outline = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Outline_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Outline', { get: ASS_Style.prototype.get_Outline, set: ASS_Style.prototype.set_Outline });
  ASS_Style.prototype['get_Shadow'] = ASS_Style.prototype.get_Shadow = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Shadow_0(self);
};
    ASS_Style.prototype['set_Shadow'] = ASS_Style.prototype.set_Shadow = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Shadow_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Shadow', { get: ASS_Style.prototype.get_Shadow, set: ASS_Style.prototype.set_Shadow });
  ASS_Style.prototype['get_Alignment'] = ASS_Style.prototype.get_Alignment = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Alignment_0(self);
};
    ASS_Style.prototype['set_Alignment'] = ASS_Style.prototype.set_Alignment = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Alignment_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Alignment', { get: ASS_Style.prototype.get_Alignment, set: ASS_Style.prototype.set_Alignment });
  ASS_Style.prototype['get_MarginL'] = ASS_Style.prototype.get_MarginL = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_MarginL_0(self);
};
    ASS_Style.prototype['set_MarginL'] = ASS_Style.prototype.set_MarginL = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_MarginL_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'MarginL', { get: ASS_Style.prototype.get_MarginL, set: ASS_Style.prototype.set_MarginL });
  ASS_Style.prototype['get_MarginR'] = ASS_Style.prototype.get_MarginR = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_MarginR_0(self);
};
    ASS_Style.prototype['set_MarginR'] = ASS_Style.prototype.set_MarginR = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_MarginR_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'MarginR', { get: ASS_Style.prototype.get_MarginR, set: ASS_Style.prototype.set_MarginR });
  ASS_Style.prototype['get_MarginV'] = ASS_Style.prototype.get_MarginV = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_MarginV_0(self);
};
    ASS_Style.prototype['set_MarginV'] = ASS_Style.prototype.set_MarginV = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_MarginV_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'MarginV', { get: ASS_Style.prototype.get_MarginV, set: ASS_Style.prototype.set_MarginV });
  ASS_Style.prototype['get_Encoding'] = ASS_Style.prototype.get_Encoding = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Encoding_0(self);
};
    ASS_Style.prototype['set_Encoding'] = ASS_Style.prototype.set_Encoding = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Encoding_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Encoding', { get: ASS_Style.prototype.get_Encoding, set: ASS_Style.prototype.set_Encoding });
  ASS_Style.prototype['get_treat_fontname_as_pattern'] = ASS_Style.prototype.get_treat_fontname_as_pattern = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0(self);
};
    ASS_Style.prototype['set_treat_fontname_as_pattern'] = ASS_Style.prototype.set_treat_fontname_as_pattern = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'treat_fontname_as_pattern', { get: ASS_Style.prototype.get_treat_fontname_as_pattern, set: ASS_Style.prototype.set_treat_fontname_as_pattern });
  ASS_Style.prototype['get_Blur'] = ASS_Style.prototype.get_Blur = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Blur_0(self);
};
    ASS_Style.prototype['set_Blur'] = ASS_Style.prototype.set_Blur = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Blur_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Blur', { get: ASS_Style.prototype.get_Blur, set: ASS_Style.prototype.set_Blur });
  ASS_Style.prototype['get_Justify'] = ASS_Style.prototype.get_Justify = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Justify_0(self);
};
    ASS_Style.prototype['set_Justify'] = ASS_Style.prototype.set_Justify = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Justify_1(self, arg0);
};
    Object.defineProperty(ASS_Style.prototype, 'Justify', { get: ASS_Style.prototype.get_Justify, set: ASS_Style.prototype.set_Justify });
// ASS_Event
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_Event() { throw "cannot construct a ASS_Event, no constructor in IDL" }
ASS_Event.prototype = Object.create(WrapperObject.prototype);
ASS_Event.prototype.constructor = ASS_Event;
ASS_Event.prototype.__class__ = ASS_Event;
ASS_Event.__cache__ = {};
Module['ASS_Event'] = ASS_Event;

  ASS_Event.prototype['get_Start'] = ASS_Event.prototype.get_Start = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Start_0(self);
};
    ASS_Event.prototype['set_Start'] = ASS_Event.prototype.set_Start = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Start_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'Start', { get: ASS_Event.prototype.get_Start, set: ASS_Event.prototype.set_Start });
  ASS_Event.prototype['get_Duration'] = ASS_Event.prototype.get_Duration = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Duration_0(self);
};
    ASS_Event.prototype['set_Duration'] = ASS_Event.prototype.set_Duration = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Duration_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'Duration', { get: ASS_Event.prototype.get_Duration, set: ASS_Event.prototype.set_Duration });
  ASS_Event.prototype['get_ReadOrder'] = ASS_Event.prototype.get_ReadOrder = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_ReadOrder_0(self);
};
    ASS_Event.prototype['set_ReadOrder'] = ASS_Event.prototype.set_ReadOrder = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_ReadOrder_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'ReadOrder', { get: ASS_Event.prototype.get_ReadOrder, set: ASS_Event.prototype.set_ReadOrder });
  ASS_Event.prototype['get_Layer'] = ASS_Event.prototype.get_Layer = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Layer_0(self);
};
    ASS_Event.prototype['set_Layer'] = ASS_Event.prototype.set_Layer = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Layer_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'Layer', { get: ASS_Event.prototype.get_Layer, set: ASS_Event.prototype.set_Layer });
  ASS_Event.prototype['get_Style'] = ASS_Event.prototype.get_Style = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Style_0(self);
};
    ASS_Event.prototype['set_Style'] = ASS_Event.prototype.set_Style = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Style_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'Style', { get: ASS_Event.prototype.get_Style, set: ASS_Event.prototype.set_Style });
  ASS_Event.prototype['get_Name'] = ASS_Event.prototype.get_Name = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Name_0(self));
};
    ASS_Event.prototype['set_Name'] = ASS_Event.prototype.set_Name = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Event_set_Name_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'Name', { get: ASS_Event.prototype.get_Name, set: ASS_Event.prototype.set_Name });
  ASS_Event.prototype['get_MarginL'] = ASS_Event.prototype.get_MarginL = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_MarginL_0(self);
};
    ASS_Event.prototype['set_MarginL'] = ASS_Event.prototype.set_MarginL = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_MarginL_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'MarginL', { get: ASS_Event.prototype.get_MarginL, set: ASS_Event.prototype.set_MarginL });
  ASS_Event.prototype['get_MarginR'] = ASS_Event.prototype.get_MarginR = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_MarginR_0(self);
};
    ASS_Event.prototype['set_MarginR'] = ASS_Event.prototype.set_MarginR = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_MarginR_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'MarginR', { get: ASS_Event.prototype.get_MarginR, set: ASS_Event.prototype.set_MarginR });
  ASS_Event.prototype['get_MarginV'] = ASS_Event.prototype.get_MarginV = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_MarginV_0(self);
};
    ASS_Event.prototype['set_MarginV'] = ASS_Event.prototype.set_MarginV = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_MarginV_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'MarginV', { get: ASS_Event.prototype.get_MarginV, set: ASS_Event.prototype.set_MarginV });
  ASS_Event.prototype['get_Effect'] = ASS_Event.prototype.get_Effect = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Effect_0(self));
};
    ASS_Event.prototype['set_Effect'] = ASS_Event.prototype.set_Effect = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Event_set_Effect_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'Effect', { get: ASS_Event.prototype.get_Effect, set: ASS_Event.prototype.set_Effect });
  ASS_Event.prototype['get_Text'] = ASS_Event.prototype.get_Text = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Text_0(self));
};
    ASS_Event.prototype['set_Text'] = ASS_Event.prototype.set_Text = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Event_set_Text_1(self, arg0);
};
    Object.defineProperty(ASS_Event.prototype, 'Text', { get: ASS_Event.prototype.get_Text, set: ASS_Event.prototype.set_Text });
// ASS_Track
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_Track() { throw "cannot construct a ASS_Track, no constructor in IDL" }
ASS_Track.prototype = Object.create(WrapperObject.prototype);
ASS_Track.prototype.constructor = ASS_Track;
ASS_Track.prototype.__class__ = ASS_Track;
ASS_Track.__cache__ = {};
Module['ASS_Track'] = ASS_Track;

  ASS_Track.prototype['get_n_styles'] = ASS_Track.prototype.get_n_styles = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_n_styles_0(self);
};
    ASS_Track.prototype['set_n_styles'] = ASS_Track.prototype.set_n_styles = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_n_styles_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'n_styles', { get: ASS_Track.prototype.get_n_styles, set: ASS_Track.prototype.set_n_styles });
  ASS_Track.prototype['get_max_styles'] = ASS_Track.prototype.get_max_styles = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_max_styles_0(self);
};
    ASS_Track.prototype['set_max_styles'] = ASS_Track.prototype.set_max_styles = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_max_styles_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'max_styles', { get: ASS_Track.prototype.get_max_styles, set: ASS_Track.prototype.set_max_styles });
  ASS_Track.prototype['get_n_events'] = ASS_Track.prototype.get_n_events = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_n_events_0(self);
};
    ASS_Track.prototype['set_n_events'] = ASS_Track.prototype.set_n_events = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_n_events_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'n_events', { get: ASS_Track.prototype.get_n_events, set: ASS_Track.prototype.set_n_events });
  ASS_Track.prototype['get_max_events'] = ASS_Track.prototype.get_max_events = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_max_events_0(self);
};
    ASS_Track.prototype['set_max_events'] = ASS_Track.prototype.set_max_events = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_max_events_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'max_events', { get: ASS_Track.prototype.get_max_events, set: ASS_Track.prototype.set_max_events });
  ASS_Track.prototype['get_styles'] = ASS_Track.prototype.get_styles = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_ASS_Track_get_styles_1(self, arg0), ASS_Style);
};
    ASS_Track.prototype['set_styles'] = ASS_Track.prototype.set_styles = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_ASS_Track_set_styles_2(self, arg0, arg1);
};
    Object.defineProperty(ASS_Track.prototype, 'styles', { get: ASS_Track.prototype.get_styles, set: ASS_Track.prototype.set_styles });
  ASS_Track.prototype['get_events'] = ASS_Track.prototype.get_events = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_ASS_Track_get_events_1(self, arg0), ASS_Event);
};
    ASS_Track.prototype['set_events'] = ASS_Track.prototype.set_events = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_ASS_Track_set_events_2(self, arg0, arg1);
};
    Object.defineProperty(ASS_Track.prototype, 'events', { get: ASS_Track.prototype.get_events, set: ASS_Track.prototype.set_events });
  ASS_Track.prototype['get_style_format'] = ASS_Track.prototype.get_style_format = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_style_format_0(self));
};
    ASS_Track.prototype['set_style_format'] = ASS_Track.prototype.set_style_format = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_style_format_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'style_format', { get: ASS_Track.prototype.get_style_format, set: ASS_Track.prototype.set_style_format });
  ASS_Track.prototype['get_event_format'] = ASS_Track.prototype.get_event_format = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_event_format_0(self));
};
    ASS_Track.prototype['set_event_format'] = ASS_Track.prototype.set_event_format = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_event_format_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'event_format', { get: ASS_Track.prototype.get_event_format, set: ASS_Track.prototype.set_event_format });
  ASS_Track.prototype['get_PlayResX'] = ASS_Track.prototype.get_PlayResX = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_PlayResX_0(self);
};
    ASS_Track.prototype['set_PlayResX'] = ASS_Track.prototype.set_PlayResX = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_PlayResX_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'PlayResX', { get: ASS_Track.prototype.get_PlayResX, set: ASS_Track.prototype.set_PlayResX });
  ASS_Track.prototype['get_PlayResY'] = ASS_Track.prototype.get_PlayResY = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_PlayResY_0(self);
};
    ASS_Track.prototype['set_PlayResY'] = ASS_Track.prototype.set_PlayResY = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_PlayResY_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'PlayResY', { get: ASS_Track.prototype.get_PlayResY, set: ASS_Track.prototype.set_PlayResY });
  ASS_Track.prototype['get_Timer'] = ASS_Track.prototype.get_Timer = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_Timer_0(self);
};
    ASS_Track.prototype['set_Timer'] = ASS_Track.prototype.set_Timer = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_Timer_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'Timer', { get: ASS_Track.prototype.get_Timer, set: ASS_Track.prototype.set_Timer });
  ASS_Track.prototype['get_WrapStyle'] = ASS_Track.prototype.get_WrapStyle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_WrapStyle_0(self);
};
    ASS_Track.prototype['set_WrapStyle'] = ASS_Track.prototype.set_WrapStyle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_WrapStyle_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'WrapStyle', { get: ASS_Track.prototype.get_WrapStyle, set: ASS_Track.prototype.set_WrapStyle });
  ASS_Track.prototype['get_ScaledBorderAndShadow'] = ASS_Track.prototype.get_ScaledBorderAndShadow = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0(self);
};
    ASS_Track.prototype['set_ScaledBorderAndShadow'] = ASS_Track.prototype.set_ScaledBorderAndShadow = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'ScaledBorderAndShadow', { get: ASS_Track.prototype.get_ScaledBorderAndShadow, set: ASS_Track.prototype.set_ScaledBorderAndShadow });
  ASS_Track.prototype['get_Kerning'] = ASS_Track.prototype.get_Kerning = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_Kerning_0(self);
};
    ASS_Track.prototype['set_Kerning'] = ASS_Track.prototype.set_Kerning = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_Kerning_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'Kerning', { get: ASS_Track.prototype.get_Kerning, set: ASS_Track.prototype.set_Kerning });
  ASS_Track.prototype['get_Language'] = ASS_Track.prototype.get_Language = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_Language_0(self));
};
    ASS_Track.prototype['set_Language'] = ASS_Track.prototype.set_Language = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_Language_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'Language', { get: ASS_Track.prototype.get_Language, set: ASS_Track.prototype.set_Language });
  ASS_Track.prototype['get_default_style'] = ASS_Track.prototype.get_default_style = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_default_style_0(self);
};
    ASS_Track.prototype['set_default_style'] = ASS_Track.prototype.set_default_style = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_default_style_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'default_style', { get: ASS_Track.prototype.get_default_style, set: ASS_Track.prototype.set_default_style });
  ASS_Track.prototype['get_name'] = ASS_Track.prototype.get_name = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_name_0(self));
};
    ASS_Track.prototype['set_name'] = ASS_Track.prototype.set_name = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_name_1(self, arg0);
};
    Object.defineProperty(ASS_Track.prototype, 'name', { get: ASS_Track.prototype.get_name, set: ASS_Track.prototype.set_name });
// ASS_Library
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_Library() { throw "cannot construct a ASS_Library, no constructor in IDL" }
ASS_Library.prototype = Object.create(WrapperObject.prototype);
ASS_Library.prototype.constructor = ASS_Library;
ASS_Library.prototype.__class__ = ASS_Library;
ASS_Library.__cache__ = {};
Module['ASS_Library'] = ASS_Library;

// ASS_RenderPriv
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_RenderPriv() { throw "cannot construct a ASS_RenderPriv, no constructor in IDL" }
ASS_RenderPriv.prototype = Object.create(WrapperObject.prototype);
ASS_RenderPriv.prototype.constructor = ASS_RenderPriv;
ASS_RenderPriv.prototype.__class__ = ASS_RenderPriv;
ASS_RenderPriv.__cache__ = {};
Module['ASS_RenderPriv'] = ASS_RenderPriv;

// ASS_ParserPriv
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_ParserPriv() { throw "cannot construct a ASS_ParserPriv, no constructor in IDL" }
ASS_ParserPriv.prototype = Object.create(WrapperObject.prototype);
ASS_ParserPriv.prototype.constructor = ASS_ParserPriv;
ASS_ParserPriv.prototype.__class__ = ASS_ParserPriv;
ASS_ParserPriv.__cache__ = {};
Module['ASS_ParserPriv'] = ASS_ParserPriv;

// ASS_Renderer
/** @suppress {undefinedVars, duplicate} @this{Object} */function ASS_Renderer() { throw "cannot construct a ASS_Renderer, no constructor in IDL" }
ASS_Renderer.prototype = Object.create(WrapperObject.prototype);
ASS_Renderer.prototype.constructor = ASS_Renderer;
ASS_Renderer.prototype.__class__ = ASS_Renderer;
ASS_Renderer.__cache__ = {};
Module['ASS_Renderer'] = ASS_Renderer;

// libass
/** @suppress {undefinedVars, duplicate} @this{Object} */function libass() {
  this.ptr = _emscripten_bind_libass_libass_0();
  getCache(libass)[this.ptr] = this;
};;
libass.prototype = Object.create(WrapperObject.prototype);
libass.prototype.constructor = libass;
libass.prototype.__class__ = libass;
libass.__cache__ = {};
Module['libass'] = libass;

libass.prototype['oct_library_version'] = libass.prototype.oct_library_version = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_libass_oct_library_version_0(self);
};;

libass.prototype['oct_library_init'] = libass.prototype.oct_library_init = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_library_init_0(self), ASS_Library);
};;

libass.prototype['oct_library_done'] = libass.prototype.oct_library_done = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  _emscripten_bind_libass_oct_library_done_1(self, priv);
};;

libass.prototype['oct_set_fonts_dir'] = libass.prototype.oct_set_fonts_dir = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, fonts_dir) {
  var self = this.ptr;
  ensureCache.prepare();
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (fonts_dir && typeof fonts_dir === 'object') fonts_dir = fonts_dir.ptr;
  else fonts_dir = ensureString(fonts_dir, false);
  _emscripten_bind_libass_oct_set_fonts_dir_2(self, priv, fonts_dir);
};;

libass.prototype['oct_set_extract_fonts'] = libass.prototype.oct_set_extract_fonts = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, extract) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (extract && typeof extract === 'object') extract = extract.ptr;
  _emscripten_bind_libass_oct_set_extract_fonts_2(self, priv, extract);
};;

libass.prototype['oct_set_style_overrides'] = libass.prototype.oct_set_style_overrides = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, list) {
  var self = this.ptr;
  ensureCache.prepare();
  if (priv && typeof priv === 'object') priv = priv.ptr;
  _emscripten_bind_libass_oct_set_style_overrides_2(self, priv, list);
};;

libass.prototype['oct_process_force_style'] = libass.prototype.oct_process_force_style = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  _emscripten_bind_libass_oct_process_force_style_1(self, track);
};;

libass.prototype['oct_renderer_init'] = libass.prototype.oct_renderer_init = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_renderer_init_1(self, priv), ASS_Renderer);
};;

libass.prototype['oct_renderer_done'] = libass.prototype.oct_renderer_done = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  _emscripten_bind_libass_oct_renderer_done_1(self, priv);
};;

libass.prototype['oct_set_frame_size'] = libass.prototype.oct_set_frame_size = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, w, h) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (w && typeof w === 'object') w = w.ptr;
  if (h && typeof h === 'object') h = h.ptr;
  _emscripten_bind_libass_oct_set_frame_size_3(self, priv, w, h);
};;

libass.prototype['oct_set_storage_size'] = libass.prototype.oct_set_storage_size = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, w, h) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (w && typeof w === 'object') w = w.ptr;
  if (h && typeof h === 'object') h = h.ptr;
  _emscripten_bind_libass_oct_set_storage_size_3(self, priv, w, h);
};;

libass.prototype['oct_set_shaper'] = libass.prototype.oct_set_shaper = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, level) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  _emscripten_bind_libass_oct_set_shaper_2(self, priv, level);
};;

libass.prototype['oct_set_margins'] = libass.prototype.oct_set_margins = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, t, b, l, r) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (t && typeof t === 'object') t = t.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  if (l && typeof l === 'object') l = l.ptr;
  if (r && typeof r === 'object') r = r.ptr;
  _emscripten_bind_libass_oct_set_margins_5(self, priv, t, b, l, r);
};;

libass.prototype['oct_set_use_margins'] = libass.prototype.oct_set_use_margins = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, use) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (use && typeof use === 'object') use = use.ptr;
  _emscripten_bind_libass_oct_set_use_margins_2(self, priv, use);
};;

libass.prototype['oct_set_pixel_aspect'] = libass.prototype.oct_set_pixel_aspect = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, par) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (par && typeof par === 'object') par = par.ptr;
  _emscripten_bind_libass_oct_set_pixel_aspect_2(self, priv, par);
};;

libass.prototype['oct_set_aspect_ratio'] = libass.prototype.oct_set_aspect_ratio = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, dar, sar) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (dar && typeof dar === 'object') dar = dar.ptr;
  if (sar && typeof sar === 'object') sar = sar.ptr;
  _emscripten_bind_libass_oct_set_aspect_ratio_3(self, priv, dar, sar);
};;

libass.prototype['oct_set_font_scale'] = libass.prototype.oct_set_font_scale = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, font_scale) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (font_scale && typeof font_scale === 'object') font_scale = font_scale.ptr;
  _emscripten_bind_libass_oct_set_font_scale_2(self, priv, font_scale);
};;

libass.prototype['oct_set_hinting'] = libass.prototype.oct_set_hinting = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, ht) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (ht && typeof ht === 'object') ht = ht.ptr;
  _emscripten_bind_libass_oct_set_hinting_2(self, priv, ht);
};;

libass.prototype['oct_set_line_spacing'] = libass.prototype.oct_set_line_spacing = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, line_spacing) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (line_spacing && typeof line_spacing === 'object') line_spacing = line_spacing.ptr;
  _emscripten_bind_libass_oct_set_line_spacing_2(self, priv, line_spacing);
};;

libass.prototype['oct_set_line_position'] = libass.prototype.oct_set_line_position = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, line_position) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (line_position && typeof line_position === 'object') line_position = line_position.ptr;
  _emscripten_bind_libass_oct_set_line_position_2(self, priv, line_position);
};;

libass.prototype['oct_set_fonts'] = libass.prototype.oct_set_fonts = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, default_font, default_family, dfp, config, update) {
  var self = this.ptr;
  ensureCache.prepare();
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (default_font && typeof default_font === 'object') default_font = default_font.ptr;
  else default_font = ensureString(default_font, false);
  if (default_family && typeof default_family === 'object') default_family = default_family.ptr;
  else default_family = ensureString(default_family, false);
  if (dfp && typeof dfp === 'object') dfp = dfp.ptr;
  if (config && typeof config === 'object') config = config.ptr;
  else config = ensureString(config, false);
  if (update && typeof update === 'object') update = update.ptr;
  _emscripten_bind_libass_oct_set_fonts_6(self, priv, default_font, default_family, dfp, config, update);
};;

libass.prototype['oct_set_selective_style_override_enabled'] = libass.prototype.oct_set_selective_style_override_enabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, bits) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (bits && typeof bits === 'object') bits = bits.ptr;
  _emscripten_bind_libass_oct_set_selective_style_override_enabled_2(self, priv, bits);
};;

libass.prototype['oct_set_selective_style_override'] = libass.prototype.oct_set_selective_style_override = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, style) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (style && typeof style === 'object') style = style.ptr;
  _emscripten_bind_libass_oct_set_selective_style_override_2(self, priv, style);
};;

libass.prototype['oct_set_cache_limits'] = libass.prototype.oct_set_cache_limits = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, glyph_max, bitmap_max_size) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (glyph_max && typeof glyph_max === 'object') glyph_max = glyph_max.ptr;
  if (bitmap_max_size && typeof bitmap_max_size === 'object') bitmap_max_size = bitmap_max_size.ptr;
  _emscripten_bind_libass_oct_set_cache_limits_3(self, priv, glyph_max, bitmap_max_size);
};;

libass.prototype['oct_render_frame'] = libass.prototype.oct_render_frame = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv, track, now, detect_change) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (now && typeof now === 'object') now = now.ptr;
  if (detect_change && typeof detect_change === 'object') detect_change = detect_change.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_render_frame_4(self, priv, track, now, detect_change), ASS_Image);
};;

libass.prototype['oct_new_track'] = libass.prototype.oct_new_track = /** @suppress {undefinedVars, duplicate} @this{Object} */function(priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_new_track_1(self, priv), ASS_Track);
};;

libass.prototype['oct_free_track'] = libass.prototype.oct_free_track = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  _emscripten_bind_libass_oct_free_track_1(self, track);
};;

libass.prototype['oct_alloc_style'] = libass.prototype.oct_alloc_style = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  return _emscripten_bind_libass_oct_alloc_style_1(self, track);
};;

libass.prototype['oct_alloc_event'] = libass.prototype.oct_alloc_event = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  return _emscripten_bind_libass_oct_alloc_event_1(self, track);
};;

libass.prototype['oct_free_style'] = libass.prototype.oct_free_style = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track, sid) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (sid && typeof sid === 'object') sid = sid.ptr;
  _emscripten_bind_libass_oct_free_style_2(self, track, sid);
};;

libass.prototype['oct_free_event'] = libass.prototype.oct_free_event = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track, eid) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (eid && typeof eid === 'object') eid = eid.ptr;
  _emscripten_bind_libass_oct_free_event_2(self, track, eid);
};;

libass.prototype['oct_flush_events'] = libass.prototype.oct_flush_events = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  _emscripten_bind_libass_oct_flush_events_1(self, track);
};;

libass.prototype['oct_read_file'] = libass.prototype.oct_read_file = /** @suppress {undefinedVars, duplicate} @this{Object} */function(library, fname, codepage) {
  var self = this.ptr;
  ensureCache.prepare();
  if (library && typeof library === 'object') library = library.ptr;
  if (fname && typeof fname === 'object') fname = fname.ptr;
  else fname = ensureString(fname, false);
  if (codepage && typeof codepage === 'object') codepage = codepage.ptr;
  else codepage = ensureString(codepage, false);
  return wrapPointer(_emscripten_bind_libass_oct_read_file_3(self, library, fname, codepage), ASS_Track);
};;

libass.prototype['oct_add_font'] = libass.prototype.oct_add_font = /** @suppress {undefinedVars, duplicate} @this{Object} */function(library, name, data, data_size) {
  var self = this.ptr;
  ensureCache.prepare();
  if (library && typeof library === 'object') library = library.ptr;
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name, false);
  if (data && typeof data === 'object') data = data.ptr;
  else data = ensureString(data, false);
  if (data_size && typeof data_size === 'object') data_size = data_size.ptr;
  _emscripten_bind_libass_oct_add_font_4(self, library, name, data, data_size);
};;

libass.prototype['oct_clear_fonts'] = libass.prototype.oct_clear_fonts = /** @suppress {undefinedVars, duplicate} @this{Object} */function(library) {
  var self = this.ptr;
  if (library && typeof library === 'object') library = library.ptr;
  _emscripten_bind_libass_oct_clear_fonts_1(self, library);
};;

libass.prototype['oct_step_sub'] = libass.prototype.oct_step_sub = /** @suppress {undefinedVars, duplicate} @this{Object} */function(track, now, movement) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (now && typeof now === 'object') now = now.ptr;
  if (movement && typeof movement === 'object') movement = movement.ptr;
  return _emscripten_bind_libass_oct_step_sub_3(self, track, now, movement);
};;

// RenderResult
/** @suppress {undefinedVars, duplicate} @this{Object} */function RenderResult() { throw "cannot construct a RenderResult, no constructor in IDL" }
RenderResult.prototype = Object.create(WrapperObject.prototype);
RenderResult.prototype.constructor = RenderResult;
RenderResult.prototype.__class__ = RenderResult;
RenderResult.__cache__ = {};
Module['RenderResult'] = RenderResult;

  RenderResult.prototype['get_changed'] = RenderResult.prototype.get_changed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_RenderResult_get_changed_0(self);
};
    RenderResult.prototype['set_changed'] = RenderResult.prototype.set_changed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderResult_set_changed_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'changed', { get: RenderResult.prototype.get_changed, set: RenderResult.prototype.set_changed });
  RenderResult.prototype['get_time'] = RenderResult.prototype.get_time = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_RenderResult_get_time_0(self);
};
    RenderResult.prototype['set_time'] = RenderResult.prototype.set_time = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderResult_set_time_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'time', { get: RenderResult.prototype.get_time, set: RenderResult.prototype.set_time });
  RenderResult.prototype['get_x'] = RenderResult.prototype.get_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_RenderResult_get_x_0(self);
};
    RenderResult.prototype['set_x'] = RenderResult.prototype.set_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderResult_set_x_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'x', { get: RenderResult.prototype.get_x, set: RenderResult.prototype.set_x });
  RenderResult.prototype['get_y'] = RenderResult.prototype.get_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_RenderResult_get_y_0(self);
};
    RenderResult.prototype['set_y'] = RenderResult.prototype.set_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderResult_set_y_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'y', { get: RenderResult.prototype.get_y, set: RenderResult.prototype.set_y });
  RenderResult.prototype['get_w'] = RenderResult.prototype.get_w = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_RenderResult_get_w_0(self);
};
    RenderResult.prototype['set_w'] = RenderResult.prototype.set_w = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderResult_set_w_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'w', { get: RenderResult.prototype.get_w, set: RenderResult.prototype.set_w });
  RenderResult.prototype['get_h'] = RenderResult.prototype.get_h = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_RenderResult_get_h_0(self);
};
    RenderResult.prototype['set_h'] = RenderResult.prototype.set_h = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderResult_set_h_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'h', { get: RenderResult.prototype.get_h, set: RenderResult.prototype.set_h });
  RenderResult.prototype['get_image'] = RenderResult.prototype.get_image = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_RenderResult_get_image_0(self);
};
    RenderResult.prototype['set_image'] = RenderResult.prototype.set_image = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, false);
  _emscripten_bind_RenderResult_set_image_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'image', { get: RenderResult.prototype.get_image, set: RenderResult.prototype.set_image });
  RenderResult.prototype['get_next'] = RenderResult.prototype.get_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_RenderResult_get_next_0(self), RenderResult);
};
    RenderResult.prototype['set_next'] = RenderResult.prototype.set_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderResult_set_next_1(self, arg0);
};
    Object.defineProperty(RenderResult.prototype, 'next', { get: RenderResult.prototype.get_next, set: RenderResult.prototype.set_next });
// SubtitleOctopus
/** @suppress {undefinedVars, duplicate} @this{Object} */function SubtitleOctopus() {
  this.ptr = _emscripten_bind_SubtitleOctopus_SubtitleOctopus_0();
  getCache(SubtitleOctopus)[this.ptr] = this;
};;
SubtitleOctopus.prototype = Object.create(WrapperObject.prototype);
SubtitleOctopus.prototype.constructor = SubtitleOctopus;
SubtitleOctopus.prototype.__class__ = SubtitleOctopus;
SubtitleOctopus.__cache__ = {};
Module['SubtitleOctopus'] = SubtitleOctopus;

SubtitleOctopus.prototype['setLogLevel'] = SubtitleOctopus.prototype.setLogLevel = /** @suppress {undefinedVars, duplicate} @this{Object} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  _emscripten_bind_SubtitleOctopus_setLogLevel_1(self, level);
};;

SubtitleOctopus.prototype['setDropAnimations'] = SubtitleOctopus.prototype.setDropAnimations = /** @suppress {undefinedVars, duplicate} @this{Object} */function(value) {
  var self = this.ptr;
  if (value && typeof value === 'object') value = value.ptr;
  _emscripten_bind_SubtitleOctopus_setDropAnimations_1(self, value);
};;

SubtitleOctopus.prototype['initLibrary'] = SubtitleOctopus.prototype.initLibrary = /** @suppress {undefinedVars, duplicate} @this{Object} */function(frame_w, frame_h) {
  var self = this.ptr;
  if (frame_w && typeof frame_w === 'object') frame_w = frame_w.ptr;
  if (frame_h && typeof frame_h === 'object') frame_h = frame_h.ptr;
  _emscripten_bind_SubtitleOctopus_initLibrary_2(self, frame_w, frame_h);
};;

SubtitleOctopus.prototype['createTrack'] = SubtitleOctopus.prototype.createTrack = /** @suppress {undefinedVars, duplicate} @this{Object} */function(subfile) {
  var self = this.ptr;
  ensureCache.prepare();
  if (subfile && typeof subfile === 'object') subfile = subfile.ptr;
  else subfile = ensureString(subfile, false);
  _emscripten_bind_SubtitleOctopus_createTrack_1(self, subfile);
};;

SubtitleOctopus.prototype['createTrackMem'] = SubtitleOctopus.prototype.createTrackMem = /** @suppress {undefinedVars, duplicate} @this{Object} */function(buf, bufsize) {
  var self = this.ptr;
  ensureCache.prepare();
  if (buf && typeof buf === 'object') buf = buf.ptr;
  else buf = ensureString(buf, false);
  if (bufsize && typeof bufsize === 'object') bufsize = bufsize.ptr;
  _emscripten_bind_SubtitleOctopus_createTrackMem_2(self, buf, bufsize);
};;

SubtitleOctopus.prototype['removeTrack'] = SubtitleOctopus.prototype.removeTrack = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_removeTrack_0(self);
};;

SubtitleOctopus.prototype['resizeCanvas'] = SubtitleOctopus.prototype.resizeCanvas = /** @suppress {undefinedVars, duplicate} @this{Object} */function(frame_w, frame_h) {
  var self = this.ptr;
  if (frame_w && typeof frame_w === 'object') frame_w = frame_w.ptr;
  if (frame_h && typeof frame_h === 'object') frame_h = frame_h.ptr;
  _emscripten_bind_SubtitleOctopus_resizeCanvas_2(self, frame_w, frame_h);
};;

SubtitleOctopus.prototype['renderImage'] = SubtitleOctopus.prototype.renderImage = /** @suppress {undefinedVars, duplicate} @this{Object} */function(time, force) {
  var self = this.ptr;
  if (time && typeof time === 'object') time = time.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_renderImage_2(self, time, force), RenderResult);
};;

SubtitleOctopus.prototype['quitLibrary'] = SubtitleOctopus.prototype.quitLibrary = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_quitLibrary_0(self);
};;

SubtitleOctopus.prototype['reloadLibrary'] = SubtitleOctopus.prototype.reloadLibrary = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_reloadLibrary_0(self);
};;

SubtitleOctopus.prototype['reloadFonts'] = SubtitleOctopus.prototype.reloadFonts = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_reloadFonts_0(self);
};;

SubtitleOctopus.prototype['setMargin'] = SubtitleOctopus.prototype.setMargin = /** @suppress {undefinedVars, duplicate} @this{Object} */function(top, bottom, left, right) {
  var self = this.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (bottom && typeof bottom === 'object') bottom = bottom.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (right && typeof right === 'object') right = right.ptr;
  _emscripten_bind_SubtitleOctopus_setMargin_4(self, top, bottom, left, right);
};;

SubtitleOctopus.prototype['getEventCount'] = SubtitleOctopus.prototype.getEventCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_getEventCount_0(self);
};;

SubtitleOctopus.prototype['allocEvent'] = SubtitleOctopus.prototype.allocEvent = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_allocEvent_0(self);
};;

SubtitleOctopus.prototype['allocStyle'] = SubtitleOctopus.prototype.allocStyle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_allocStyle_0(self);
};;

SubtitleOctopus.prototype['removeEvent'] = SubtitleOctopus.prototype.removeEvent = /** @suppress {undefinedVars, duplicate} @this{Object} */function(eid) {
  var self = this.ptr;
  if (eid && typeof eid === 'object') eid = eid.ptr;
  _emscripten_bind_SubtitleOctopus_removeEvent_1(self, eid);
};;

SubtitleOctopus.prototype['getStyleCount'] = SubtitleOctopus.prototype.getStyleCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_getStyleCount_0(self);
};;

SubtitleOctopus.prototype['getStyleByName'] = SubtitleOctopus.prototype.getStyleByName = /** @suppress {undefinedVars, duplicate} @this{Object} */function(name) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name, false);
  return _emscripten_bind_SubtitleOctopus_getStyleByName_1(self, name);
};;

SubtitleOctopus.prototype['removeStyle'] = SubtitleOctopus.prototype.removeStyle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(eid) {
  var self = this.ptr;
  if (eid && typeof eid === 'object') eid = eid.ptr;
  _emscripten_bind_SubtitleOctopus_removeStyle_1(self, eid);
};;

SubtitleOctopus.prototype['removeAllEvents'] = SubtitleOctopus.prototype.removeAllEvents = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_removeAllEvents_0(self);
};;

SubtitleOctopus.prototype['setMemoryLimits'] = SubtitleOctopus.prototype.setMemoryLimits = /** @suppress {undefinedVars, duplicate} @this{Object} */function(glyph_limit, bitmap_cache_limit) {
  var self = this.ptr;
  if (glyph_limit && typeof glyph_limit === 'object') glyph_limit = glyph_limit.ptr;
  if (bitmap_cache_limit && typeof bitmap_cache_limit === 'object') bitmap_cache_limit = bitmap_cache_limit.ptr;
  _emscripten_bind_SubtitleOctopus_setMemoryLimits_2(self, glyph_limit, bitmap_cache_limit);
};;

SubtitleOctopus.prototype['renderBlend'] = SubtitleOctopus.prototype.renderBlend = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tm, force) {
  var self = this.ptr;
  if (tm && typeof tm === 'object') tm = tm.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_renderBlend_2(self, tm, force), RenderResult);
};;

  SubtitleOctopus.prototype['get_track'] = SubtitleOctopus.prototype.get_track = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_track_0(self), ASS_Track);
};
    SubtitleOctopus.prototype['set_track'] = SubtitleOctopus.prototype.set_track = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_SubtitleOctopus_set_track_1(self, arg0);
};
    Object.defineProperty(SubtitleOctopus.prototype, 'track', { get: SubtitleOctopus.prototype.get_track, set: SubtitleOctopus.prototype.set_track });
  SubtitleOctopus.prototype['get_ass_renderer'] = SubtitleOctopus.prototype.get_ass_renderer = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_ass_renderer_0(self), ASS_Renderer);
};
    SubtitleOctopus.prototype['set_ass_renderer'] = SubtitleOctopus.prototype.set_ass_renderer = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_SubtitleOctopus_set_ass_renderer_1(self, arg0);
};
    Object.defineProperty(SubtitleOctopus.prototype, 'ass_renderer', { get: SubtitleOctopus.prototype.get_ass_renderer, set: SubtitleOctopus.prototype.set_ass_renderer });
  SubtitleOctopus.prototype['get_ass_library'] = SubtitleOctopus.prototype.get_ass_library = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_ass_library_0(self), ASS_Library);
};
    SubtitleOctopus.prototype['set_ass_library'] = SubtitleOctopus.prototype.set_ass_library = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_SubtitleOctopus_set_ass_library_1(self, arg0);
};
    Object.defineProperty(SubtitleOctopus.prototype, 'ass_library', { get: SubtitleOctopus.prototype.get_ass_library, set: SubtitleOctopus.prototype.set_ass_library });
  SubtitleOctopus.prototype['__destroy__'] = SubtitleOctopus.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus___destroy___0(self);
};
(function() {
  function setupEnums() {
    

    // ASS_Hinting

    Module['ASS_HINTING_NONE'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_NONE();

    Module['ASS_HINTING_LIGHT'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT();

    Module['ASS_HINTING_NORMAL'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL();

    Module['ASS_HINTING_NATIVE'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE();

    

    // ASS_ShapingLevel

    Module['ASS_SHAPING_SIMPLE'] = _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE();

    Module['ASS_SHAPING_COMPLEX'] = _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX();

    

    // ASS_OverrideBits

    Module['ASS_OVERRIDE_DEFAULT'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT();

    Module['ASS_OVERRIDE_BIT_STYLE'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE();

    Module['ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE();

    Module['ASS_OVERRIDE_BIT_FONT_SIZE'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE();

    Module['ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS();

    Module['ASS_OVERRIDE_BIT_FONT_NAME'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME();

    Module['ASS_OVERRIDE_BIT_COLORS'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS();

    Module['ASS_OVERRIDE_BIT_ATTRIBUTES'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES();

    Module['ASS_OVERRIDE_BIT_BORDER'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER();

    Module['ASS_OVERRIDE_BIT_ALIGNMENT'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT();

    Module['ASS_OVERRIDE_BIT_MARGINS'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS();

    Module['ASS_OVERRIDE_FULL_STYLE'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE();

    Module['ASS_OVERRIDE_BIT_JUSTIFY'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY();

  }
  if (runtimeInitialized) setupEnums();
  else addOnInit(setupEnums);
})();

/* global Module, HEAPU8, FS, SDL */
/* eslint-env browser, worker */
Module.FS = FS

self.delay = 0 // approximate delay (time of render + postMessage + drawImage), for example 1/60 or 0
self.lastCurrentTime = 0
self.rate = 1
self.rafId = null
self.nextIsRaf = false
self.lastCurrentTimeReceivedAt = Date.now()
self.targetFps = 24
self.libassMemoryLimit = 0 // in MiB
self.dropAllAnimations = false

self.width = 0
self.height = 0

self.fontMap_ = {}
self.fontId = 0

/**
 * Make the font accessible by libass by writing it to the virtual FS.
 * @param {!string} font the font name.
 */
self.writeFontToFS = function (font) {
  font = font.trim().toLowerCase()

  if (font.startsWith('@')) {
    font = font.substring(1)
  }

  if (self.fontMap_[font]) return

  self.fontMap_[font] = true

  if (!self.availableFonts[font]) return
  const content = readBinary(self.availableFonts[font])

  Module.FS.writeFile('/fonts/font' + (self.fontId++) + '-' + self.availableFonts[font].split('/').pop(), content, {
    encoding: 'binary'
  })
}

/**
 * Write all font's mentioned in the .ass file to the virtual FS.
 * @param {!string} content the file content.
 */
self.writeAvailableFontsToFS = function (content) {
  if (!self.availableFonts) return

  const sections = parseAss(content)

  for (let i = 0; i < sections.length; i++) {
    for (let j = 0; j < sections[i].body.length; j++) {
      if (sections[i].body[j].key === 'Style') {
        self.writeFontToFS(sections[i].body[j].value.Fontname)
      }
    }
  }

  const regex = /\\fn([^\\}]*?)[\\}]/g
  let matches
  while (matches = regex.exec(self.subContent)) {
    self.writeFontToFS(matches[1])
  }
}
/**
 * Set the subtitle track.
 * @param {!string} content the content of the subtitle file.
 */
self.setTrack = function ({ content }) {
  // Make sure that the fonts are loaded
  self.writeAvailableFontsToFS(content)

  // Write the subtitle file to the virtual FS.
  Module.FS.writeFile('/sub.ass', content)

  // Tell libass to render the new track
  self.octObj.createTrack('/sub.ass')
  self.ass_track = self.octObj.track
  self.renderLoop()
}

/**
 * Remove subtitle track.
 */
self.freeTrack = function () {
  self.octObj.removeTrack()
  self.renderLoop()
}

/**
 * Set the subtitle track.
 * @param {!string} url the URL of the subtitle file.
 */
self.setTrackByUrl = function ({ url }) {
  let content = ''
  if (isBrotliFile(url)) {
    content = Module.BrotliDecode(readBinary(url))
  } else {
    content = read_(url)
  }
  self.setTrack({ content })
}

self.resize = (width, height) => {
  self.width = width
  self.height = height
  if (self.offscreenCanvas) {
    self.offscreenCanvas.width = width
    self.offscreenCanvas.height = height
  }
  self.octObj.resizeCanvas(width, height)
}

self.getCurrentTime = function () {
  const diff = (Date.now() - self.lastCurrentTimeReceivedAt) / 1000
  if (self._isPaused) {
    return self.lastCurrentTime
  } else {
    if (diff > 5) {
      console.error('Didn\'t received currentTime > 5 seconds. Assuming video was paused.')
      self.setIsPaused(true)
    }
    return self.lastCurrentTime + (diff * self.rate)
  }
}
self.setCurrentTime = function (currentTime) {
  self.lastCurrentTime = currentTime
  self.lastCurrentTimeReceivedAt = Date.now()
  if (!self.rafId) {
    if (self.nextIsRaf) {
      self.rafId = self.requestAnimationFrame(self.renderLoop)
    } else {
      self.renderLoop()

      // Give onmessage chance to receive all queued messages
      setTimeout(function () {
        self.nextIsRaf = false
      }, 20)
    }
  }
}

self._isPaused = true
self.getIsPaused = function () {
  return self._isPaused
}
self.setIsPaused = function (isPaused) {
  if (isPaused !== self._isPaused) {
    self._isPaused = isPaused
    if (isPaused) {
      if (self.rafId) {
        clearTimeout(self.rafId)
        self.rafId = null
      }
    } else {
      self.lastCurrentTimeReceivedAt = Date.now()
      self.rafId = self.requestAnimationFrame(self.renderLoop)
    }
  }
}

self.renderImageData = (time, force) => {
  const renderStartTime = Date.now()
  let result = null
  if (self.blendMode === 'wasm') {
    result = self.octObj.renderBlend(time, force)
    result.times = {
      renderTime: Date.now() - renderStartTime - result.time | 0,
      blendTime: result.time | 0
    }
  } else {
    result = self.octObj.renderImage(time, force)
    result.times = {
      renderTime: Date.now() - renderStartTime - result.time | 0,
      cppDecodeTime: result.time | 0
    }
  }
  return result
}

self.processRender = (result) => {
  const images = []
  let buffers = []
  const decodeStartTime = Date.now()
  // use callback to not rely on async/await
  if (self.asyncRender) {
    const promises = []
    for (let image = result; image.ptr !== 0; image = image.next) {
      if (image.image) {
        images.unshift({ w: image.w, h: image.h, x: image.x, y: image.y })
        promises.unshift(createImageBitmap(new ImageData(new Uint8ClampedArray(HEAPU8.subarray(image.image, image.image + image.w * image.h * 4)), image.w, image.h)))
      }
    }
    Promise.all(promises).then(bitmaps => {
      for (let i = 0; i < images.length; i++) {
        images[i].image = bitmaps[i]
      }
      buffers = bitmaps
      self.paintImages({ images, buffers, times: result.times, decodeStartTime })
    })
  } else {
    for (let image = result; image.ptr !== 0; image = image.next) {
      if (image.image) {
        images.unshift({ w: image.w, h: image.h, x: image.x, y: image.y })
        buffers.unshift(HEAPU8.buffer.slice(image.image, image.image + image.w * image.h * 4))
      }
    }
    self.paintImages({ images, buffers, times: result.times, decodeStartTime })
  }
}

self.render = (time, force) => {
  const result = self.renderImageData(time, force)
  if (result.changed !== 0 || force) {
    self.processRender(result)
  } else {
    postMessage({
      target: 'unbusy'
    })
  }
}

self.demand = data => {
  self.lastCurrentTime = data.time
  self.render(data.time)
}

self.renderLoop = (force) => {
  self.rafId = 0
  self.renderPending = false
  self.render(self.getCurrentTime() + self.delay, force)
  if (!self._isPaused) {
    self.rafId = self.requestAnimationFrame(self.renderLoop)
  }
}

self.paintImages = ({ images, buffers, decodeStartTime, times }) => {
  times.decodeTime = Date.now() - decodeStartTime
  if (self.offscreenCanvasCtx) {
    const drawStartTime = Date.now()
    self.offscreenCanvasCtx.clearRect(0, 0, self.offscreenCanvas.width, self.offscreenCanvas.height)
    for (const image of images) {
      if (image.image) {
        if (self.asyncRender) {
          self.offscreenCanvasCtx.drawImage(image.image, image.x, image.y)
          image.image.close()
        } else {
          self.bufferCanvas.width = image.w
          self.bufferCanvas.height = image.h
          self.bufferCtx.putImageData(new ImageData(new Uint8ClampedArray(HEAPU8.subarray(image.image, image.image + image.w * image.h * 4)), image.w, image.h), 0, 0)
          self.offscreenCanvasCtx.drawImage(self.bufferCanvas, image.x, image.y)
        }
      }
    }
    if (self.debug) {
      times.drawTime = Date.now() - drawStartTime
      let total = 0
      for (const key in times) total += times[key]
      console.log('Bitmaps: ' + images.length + ' Total: ' + Math.round(total) + 'ms', times)
    }
  } else {
    postMessage({
      target: 'render',
      async: self.asyncRender,
      images,
      times
    }, buffers)
  }
  postMessage({
    target: 'unbusy'
  })
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
          value = value.map(function (s) {
            return s.trim()
          })
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
          key,
          value
        })
      }
    }
  }

  return sections
};

self.requestAnimationFrame = (function () {
  // similar to Browser.requestAnimationFrame
  let nextRAF = 0
  return function (func) {
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

// eslint-disable-next-line
let screen = {
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
let commandBuffer = []

const postMainLoop = Module.postMainLoop
Module.postMainLoop = function () {
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
    messageBuffer.forEach(function (message) {
      onmessage(message)
    })
    messageBuffer = null
  } else {
    messageResenderTimeout = setTimeout(messageResender, 50)
  }
}

function _applyKeys (input, output) {
  const vargs = Object.keys(input)

  for (let i = 0; i < vargs.length; i++) {
    output[vargs[i]] = input[vargs[i]]
  }
}

self.init = data => {
  screen.width = self.width = data.width
  screen.height = self.height = data.height
  self.subUrl = data.subUrl
  self.subContent = data.subContent
  self.fontFiles = data.fonts
  self.blendMode = data.blendMode
  self.asyncRender = data.asyncRender
  self.dropAllAnimations = !!data.dropAllAnimations || self.dropAllAnimations
  // Force fallback if engine does not support 'lossy' mode.
  // We only use createImageBitmap in the worker and historic WebKit versions supported
  // the API in the normal but not the worker scope, so we can't check this earlier.
  if (self.asyncRender && typeof createImageBitmap === 'undefined') {
    self.asyncRender = false
    console.error("'createImageBitmap' needed for 'asyncRender' unsupported!")
  }

  self.availableFonts = data.availableFonts
  self.debug = data.debug
  if (!hasNativeConsole && self.debug) {
    console = makeCustomConsole()
    console.log('overridden console')
  }
  if (Module.canvas) {
    Module.canvas.width_ = data.width
    Module.canvas.height_ = data.height
    if (data.boundingClientRect) {
      Module.canvas.boundingClientRect = data.boundingClientRect
    }
  }
  self.targetFps = data.targetFps || self.targetFps
  self.libassMemoryLimit = data.libassMemoryLimit || self.libassMemoryLimit
  self.libassGlyphLimit = data.libassGlyphLimit || 0
  removeRunDependency('worker-init')
  postMessage({
    target: 'ready'
  })
}

self.canvas = data => {
  if (data.width == null) throw new Error('Invalid canvas size specified')
  if (Module.canvas && data.boundingClientRect) {
    Module.canvas.boundingClientRect = data.boundingClientRect
  }
  self.resize(data.width, data.height)
  self.renderLoop()
}

self.video = data => {
  if (data.currentTime != null) self.setCurrentTime(data.currentTime)
  if (data.isPaused != null) self.setIsPaused(data.isPaused)
  self.rate = data.rate || self.rate
}

self.offscreenCanvas = data => {
  self.offscreenCanvas = data.transferable[0]
  self.offscreenCanvasCtx = self.offscreenCanvas.getContext('2d')
  self.bufferCanvas = new OffscreenCanvas(self.height, self.width)
  self.bufferCtx = self.bufferCanvas.getContext('2d')
}

self.destroy = () => {
  self.octObj.quitLibrary()
}

self.createEvent = data => {
  _applyKeys(data.event, self.octObj.track.get_events(self.octObj.allocEvent()))
}

self.getEvents = () => {
  const events = []
  for (let i = 0; i < self.octObj.getEventCount(); i++) {
    const evntPtr = self.octObj.track.get_events(i)
    events.push({
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
    })
  }
  postMessage({
    target: 'getEvents',
    events
  })
}

self.setEvent = data => {
  _applyKeys(data.event, self.octObj.track.get_events(data.index))
}

self.removeEvent = data => {
  self.octObj.removeEvent(data.index)
}

self.createStyle = data => {
  _applyKeys(data.style, self.octObj.track.get_styles(self.octObj.allocStyle()))
}

self.getStyles = () => {
  const styles = []
  for (let i = 0; i < self.octObj.getStyleCount(); i++) {
    const stylPtr = self.octObj.track.get_styles(i)
    styles.push({
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
    })
  }
  postMessage({
    target: 'getStyles',
    time: Date.now(),
    styles
  })
}

self.setStyle = data => {
  _applyKeys(data.style, self.octObj.track.get_styles(data.index))
}

self.removeStyle = data => {
  self.octObj.removeStyle(data.index)
}

self.setimmediate = () => {
  if (Module.setImmediates) Module.setImmediates.shift()()
}

onmessage = message => {
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
  const data = message.data
  if (self[data.target]) {
    self[data.target](data)
  } else {
    throw new Error('Unknown event target ' + message.data.target)
  }
}

self.runBenchmark = function (seconds, pos, async) {
  let totalTime = 0
  let i = 0
  pos = pos || 0
  seconds = seconds || 60
  const count = seconds * self.targetFps
  const start = Date.now()
  let longestFrame = 0
  const run = function () {
    const t0 = Date.now()

    pos += 1 / self.targetFps
    self.setCurrentTime(pos)

    const t1 = Date.now()
    const diff = t1 - t0
    totalTime += diff
    if (diff > longestFrame) {
      longestFrame = diff
    }

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
