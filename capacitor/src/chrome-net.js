// @ts-nocheck
/*! chrome-net. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* global chrome */
'use strict'

/**
 * net
 * ===
 *
 * The net module provides you with an asynchronous network wrapper. It
 * contains methods for creating both servers and clients (called streams).
 * You can include this module with require('chrome-net')
 */

const EventEmitter = require('events')
const stream = require('stream')
const timers = require('timers')
const { Buffer } = require('buffer')

// Track open servers and sockets to route incoming sockets (via onAccept and onReceive)
// to the right handlers.
const servers = {}
const sockets = {}

// Thorough check for Chrome App since both Edge and Chrome implement dummy chrome object
if (typeof chrome?.sockets?.tcp === 'object') {
  chrome.sockets.tcp.onReceive.addListener(onReceive)
  chrome.sockets.tcp.onReceiveError.addListener(onReceiveError)
}

// function onAccept (info) {
//   if (info.socketId in servers) {
//     servers[info.socketId]._onAccept(info.clientSocketId)
//   } else {
//     console.error('Unknown server socket id: ' + info.socketId)
//   }
// }

// function onAcceptError (info) {
//   if (info.socketId in servers) {
//     servers[info.socketId]._onAcceptError(info.resultCode)
//   } else {
//     console.error('Unknown server socket id: ' + info.socketId)
//   }
// }

function onReceive (info) {
  if (info.socketId in sockets) {
    sockets[info.socketId]._onReceive(info.data)
  } else {
    console.error('Unknown socket id: ' + info.socketId)
  }
}

function onReceiveError (info) {
  if (info.socketId in sockets) {
    sockets[info.socketId]._onReceiveError(info.resultCode)
  } else {
    if (info.resultCode === -100) return // net::ERR_CONNECTION_CLOSED
    console.error('Unknown socket id: ' + info.socketId)
  }
}

/**
 * Creates a new TCP server. The connectionListener argument is automatically
 * set as a listener for the 'connection' event.
 *
 * @param  {Object} options
 * @param  {function} connectionListener
 * @return {Server}
 */
exports.createServer = function (options, connectionListener) {
  return new Server(options, connectionListener)
}

/**
 * net.connect(options, [connectionListener])
 * net.createConnection(options, [connectionListener])
 *
 * Constructs a new socket object and opens the socket to the given location.
 * When the socket is established, the 'connect' event will be emitted.
 *
 * For TCP sockets, options argument should be an object which specifies:
 *
 *   port: Port the client should connect to (Required).
 *   host: Host the client should connect to. Defaults to 'localhost'.
 *   localAddress: Local interface to bind to for network connections.
 *
 * ===============================================================
 *
 * net.connect(port, [host], [connectListener])
 * net.createConnection(port, [host], [connectListener])
 *
 * Creates a TCP connection to port on host. If host is omitted,
 * 'localhost' will be assumed. The connectListener parameter will be
 * added as an listener for the 'connect' event.
 *
 * @param {Object} options
 * @param {function} listener
 * @return {Socket}
 */
exports.connect = exports.createConnection = function (...args) {
  args = normalizeConnectArgs(args)
  const s = new Socket(args[0])
  return Socket.prototype.connect.apply(s, args)
}

/**
 * Class: net.Server
 * =================
 *
 * This class is used to create a TCP server.
 *
 * Event: 'listening'
 *   Emitted when the server has been bound after calling server.listen.
 *
 * Event: 'connection'
 *   - Socket object The connection object
 *   Emitted when a new connection is made. socket is an instance of net.Socket.
 *
 * Event: 'close'
 *   Emitted when the server closes. Note that if connections exist, this event
 *   is not emitted until all connections are ended.
 *
 * Event: 'error'
 *   - Error Object
 *   Emitted when an error occurs. The 'close' event will be called directly
 *   following this event. See example in discussion of server.listen.
 */
class Server extends EventEmitter {
  constructor (options, connectionListener) {
    super()

    if (typeof options === 'function') {
      connectionListener = options
      options = {}
      this.on('connection', connectionListener)
    } else if (options == null || typeof options === 'object') {
      options = options || {}

      if (typeof connectionListener === 'function') {
        this.on('connection', connectionListener)
      }
    } else {
      throw new TypeError('options must be an object')
    }

    this._connections = 0

    this.id = null // a number > 0
    this.connecting = false

    this.allowHalfOpen = options.allowHalfOpen || false
    this.pauseOnConnect = !!options.pauseOnConnect
    this._address = null

    this._host = null
    this._port = null
    this._backlog = null
  }

  get connections () {
    return this._connections
  }

  set connections (val) {
    this._connections = val
  }

  _usingSlaves = false

  /**
   * server.listen(port, [host], [backlog], [callback])
   *
   * Begin accepting connections on the specified port and host. If the host is
   * omitted, the server will accept connections directed to any IPv4 address
   * (INADDR_ANY). A port value of zero will assign a random port.
   *
   * Backlog is the maximum length of the queue of pending connections. The
   * actual length will be determined by your OS through sysctl settings such as
   * tcp_max_syn_backlog and somaxconn on linux. The default value of this
   * parameter is 511 (not 512).
   *
   * This function is asynchronous. When the server has been bound, 'listening'
   * event will be emitted. The last parameter callback will be added as an
   * listener for the 'listening' event.
   *
   * @return {Socket}
   */
  listen (/* variable arguments... */) {
    const lastArg = arguments[arguments.length - 1]
    if (typeof lastArg === 'function') {
      this.once('listening', lastArg)
    }

    let port = toNumber(arguments[0])

    let address

    // The third optional argument is the backlog size.
    // When the ip is omitted it can be the second argument.
    let backlog = toNumber(arguments[1]) || toNumber(arguments[2]) || undefined

    if (arguments[0] !== null && typeof arguments[0] === 'object') {
      const h = arguments[0]

      if (h._handle || h.handle) {
        throw new Error('handle is not supported in Chrome Apps.')
      }
      if (typeof h.fd === 'number' && h.fd >= 0) {
        throw new Error('fd is not supported in Chrome Apps.')
      }

      // The first argument is a configuration object
      if (h.backlog) {
        backlog = h.backlog
      }

      if (typeof h.port === 'number' || typeof h.port === 'string' ||
        (typeof h.port === 'undefined' && 'port' in h)) {
        // Undefined is interpreted as zero (random port) for consistency
        // with net.connect().
        address = h.host || null
        port = h.port
      } else if (h.path && isPipeName(h.path)) {
        throw new Error('Pipes are not supported in Chrome Apps.')
      } else {
        throw new Error('Invalid listen argument: ' + h)
      }
    } else if (isPipeName(arguments[0])) {
      // UNIX socket or Windows pipe.
      throw new Error('Pipes are not supported in Chrome Apps.')
    } else if (arguments[1] === undefined ||
      typeof arguments[1] === 'function' ||
      typeof arguments[1] === 'number') {
      // The first argument is the port, no IP given.
      address = null
    } else {
      // The first argument is the port, the second an IP.
      address = arguments[1]
    }

    // now do something with port, address, backlog
    if (this.id) {
      this.close()
    }

    // If port is invalid or undefined, bind to a random port.
    assertPort(port)
    this._port = port | 0

    this._host = address

    let isAny6 = !this._host
    if (isAny6) {
      this._host = '::'
    }

    this._backlog = typeof backlog === 'number' ? backlog : undefined

    this.connecting = true

    if (chrome.sockets?.tcpServer?.create) {
      chrome.sockets.tcpServer.create((createInfo) => {
        if (!this.connecting || this.id) {
          ignoreLastError()
          chrome.sockets.tcpServer.close(createInfo.socketId)
          return
        }
        if (chrome.runtime.lastError) {
          this.emit('error', new Error(chrome.runtime.lastError.message))
          return
        }
        const socketId = this.id = createInfo.socketId
        servers[this.id] = this
        const listen = () => chrome.sockets.tcpServer.listen(this.id, this._host,
          this._port, this._backlog,
          (result) => {
            // callback may be after close
            if (this.id !== socketId) {
              ignoreLastError()
              return
            }
            if (result !== 0 && isAny6) {
              ignoreLastError()
              this._host = '0.0.0.0' // try IPv4
              isAny6 = false
              return listen()
            }
            this._onListen(result)
          })
        listen()
      })
    } else {
      this._address = {}
      this.emit('listening')
    }

    return this
  }

  _onListen (result) {
    this.connecting = false

    if (result === 0) {
      const idBefore = this.id
      chrome.sockets.tcpServer.getInfo(this.id, (info) => {
        if (this.id !== idBefore) {
          ignoreLastError()
          return
        }
        if (chrome.runtime.lastError) {
          this._onListen(-2) // net::ERR_FAILED
          return
        }

        this._address = {
          port: info.localPort,
          family: info.localAddress &&
            info.localAddress.indexOf(':') !== -1
            ? 'IPv6'
            : 'IPv4',
          address: info.localAddress
        }
        this.emit('listening')
      })
    } else {
      this.emit('error', exceptionWithHostPort(result, 'listen', this._host, this._port))
      if (this.id) {
        chrome.sockets.tcpServer.close(this.id)
        delete servers[this.id]
        this.id = null
      }
    }
  }

  _onAccept (clientSocketId) {
    // Set the `maxConnections` property to reject connections when the server's
    // connection count gets high.
    if (this.maxConnections && this._connections >= this.maxConnections) {
      chrome.sockets.tcp.close(clientSocketId)
      console.warn('Rejected connection - hit `maxConnections` limit')
      return
    }

    this._connections += 1

    const acceptedSocket = new Socket({
      server: this,
      id: clientSocketId,
      allowHalfOpen: this.allowHalfOpen,
      pauseOnCreate: this.pauseOnConnect
    })
    acceptedSocket.on('connect', () => this.emit('connection', acceptedSocket))
  }

  _onAcceptError (resultCode) {
    this.emit('error', errnoException(resultCode, 'accept'))
    this.close()
  }

  /**
   * Stops the server from accepting new connections and keeps existing
   * connections. This function is asynchronous, the server is finally closed
   * when all connections are ended and the server emits a 'close' event.
   * Optionally, you can pass a callback to listen for the 'close' event.
   * @param  {function} callback
   */
  close (callback) {
    if (typeof callback === 'function') {
      if (!this.id) {
        this.once('close', () => callback(new Error('Not running')))
      } else {
        this.once('close', callback)
      }
    }

    if (this.id) {
      chrome.sockets.tcpServer.close(this.id)
      delete servers[this.id]
      this.id = null
    }
    this._address = null
    this.connecting = false

    this._emitCloseIfDrained()

    return this
  }

  _emitCloseIfDrained () {
    if (this.id || this.connecting || this._connections) {
      return
    }

    process.nextTick(emitCloseNT, this)
  }

  get listening () {
    return !!this._address
  }

  /**
   * Returns the bound address, the address family name and port of the socket
   * as reported by the operating system. Returns an object with three
   * properties, e.g. { port: 12346, family: 'IPv4', address: '127.0.0.1' }
   *
   * @return {Object} information
   */
  address () {
    return this._address
  }

  ref () {
    // No chrome.socket equivalent
    return this
  }

  unref () {
    // No chrome.socket equivalent
    return this
  }

  /**
   * Asynchronously get the number of concurrent connections on the server.
   * Works when sockets were sent to forks.
   *
   * Callback should take two arguments err and count.
   *
   * @param  {function} callback
   */
  getConnections (callback) {
    process.nextTick(callback, null, this._connections)
  }
}
exports.Server = Server

function emitCloseNT (self) {
  if (self.id || self.connecting || self._connections) {
    return
  }
  self.emit('close')
}

/**
 * Class: net.Socket
 * =================
 *
 * This object is an abstraction of a TCP or UNIX socket. net.Socket instances
 * implement a duplex Stream interface. They can be created by the user and
 * used as a client (with connect()) or they can be created by Node and passed
 * to the user through the 'connection' event of a server.
 *
 * Construct a new socket object.
 *
 * options is an object with the following defaults:
 *
 *   { fd: null // NO CHROME EQUIVALENT
 *     type: null
 *     allowHalfOpen: false // NO CHROME EQUIVALENT
 *   }
 *
 * `type` can only be 'tcp4' (for now).
 *
 * Event: 'connect'
 *   Emitted when a socket connection is successfully established. See
 *   connect().
 *
 * Event: 'data'
 *   - Buffer object
 *   Emitted when data is received. The argument data will be a Buffer or
 *   String. Encoding of data is set by socket.setEncoding(). (See the Readable
 *   Stream section for more information.)
 *
 *   Note that the data will be lost if there is no listener when a Socket
 *   emits a 'data' event.
 *
 * Event: 'end'
 *   Emitted when the other end of the socket sends a FIN packet.
 *
 *   By default (allowHalfOpen == false) the socket will destroy its file
 *   descriptor once it has written out its pending write queue. However,
 *   by setting allowHalfOpen == true the socket will not automatically
 *   end() its side allowing the user to write arbitrary amounts of data,
 *   with the caveat that the user is required to end() their side now.
 *
 * Event: 'timeout'
 *   Emitted if the socket times out from inactivity. This is only to notify
 *   that the socket has been idle. The user must manually close the connection.
 *
 *   See also: socket.setTimeout()
 *
 * Event: 'drain'
 *   Emitted when the write buffer becomes empty. Can be used to throttle
 *   uploads.
 *
 *   See also: the return values of socket.write()
 *
 * Event: 'error'
 *   - Error object
 *   Emitted when an error occurs. The 'close' event will be called directly
 *   following this event.
 *
 * Event: 'close'
 *   - had_error Boolean true if the socket had a transmission error
 *   Emitted once the socket is fully closed. The argument had_error is a
 *   boolean which says if the socket was closed due to a transmission error.
 */
class Socket extends stream.Duplex {
  constructor (options) {
    if (typeof options === 'number') {
      options = { fd: options } // Legacy interface.
    } else if (options === undefined) {
      options = {}
    }

    if (options.handle) {
      throw new Error('handle is not supported in Chrome Apps.')
    } else if (options.fd !== undefined) {
      throw new Error('fd is not supported in Chrome Apps.')
    }

    options.decodeStrings = true
    options.objectMode = false
    super(options)

    this.destroyed = false
    this._hadError = false // Used by _http_client.js
    this.id = null // a number > 0
    this._parent = null
    this._host = null
    this._port = null
    this._pendingData = null

    this.ondata = null
    this.onend = null

    this._init()
    this._reset()

    // default to *not* allowing half open sockets
    // Note: this is not possible in Chrome Apps, see https://crbug.com/124952
    this.allowHalfOpen = options.allowHalfOpen || false

    // shut down the socket when we're finished with it.
    this.on('finish', this.destroy)

    if (options.server) {
      this.server = this._server = options.server
      this.id = options.id
      sockets[this.id] = this

      if (options.pauseOnCreate) {
        // stop the handle from reading and pause the stream
        // (Already paused in Chrome version)
        this._readableState.flowing = false
      }

      // For incoming sockets (from server), it's already connected.
      this.connecting = true
      this.writable = true
      this._onConnect()
    }
  }

  // called when creating new Socket, or when re-using a closed Socket
  _init () {
    // The amount of received bytes.
    this.bytesRead = 0

    this._bytesDispatched = 0

    // Reserve properties
    this.server = null
    this._server = null
  }

  // called when creating new Socket, or when closing a Socket
  _reset () {
    this.remoteAddress = this.remotePort =
      this.localAddress = this.localPort = null
    this.remoteFamily = 'IPv4'
    this.readable = this.writable = false
    this.connecting = false
  }

  /**
   * socket.connect(port, [host], [connectListener])
   * socket.connect(options, [connectListener])
   *
   * Opens the connection for a given socket. If port and host are given, then
   * the socket will be opened as a TCP socket, if host is omitted, localhost
   * will be assumed. If a path is given, the socket will be opened as a unix
   * socket to that path.
   *
   * Normally this method is not needed, as net.createConnection opens the
   * socket. Use this only if you are implementing a custom Socket.
   *
   * This function is asynchronous. When the 'connect' event is emitted the
   * socket is established. If there is a problem connecting, the 'connect'
   * event will not be emitted, the 'error' event will be emitted with the
   * exception.
   *
   * The connectListener parameter will be added as an listener for the
   * 'connect' event.
   *
   * @param  {Object} options
   * @param  {function} cb
   * @return {Socket}   this socket (for chaining)
   */
  connect () {
    const argsLen = arguments.length
    let args = new Array(argsLen)
    for (let i = 0; i < argsLen; i++) args[i] = arguments[i]
    args = normalizeConnectArgs(args)
    const options = args[0]
    const cb = args[1]

    if (options.path) {
      throw new Error('Pipes are not supported in Chrome Apps.')
    }

    if (this.id) {
      // already connected, destroy and connect again
      this.destroy()
    }

    if (this.destroyed) {
      this._readableState.reading = false
      this._readableState.ended = false
      this._readableState.endEmitted = false
      this._writableState.ended = false
      this._writableState.ending = false
      this._writableState.finished = false
      this._writableState.errorEmitted = false
      this._writableState.length = 0
      this.destroyed = false
    }

    this.connecting = true
    this.writable = true

    this._host = options.host || 'localhost'
    this._port = options.port

    if (typeof this._port !== 'undefined') {
      if (typeof this._port !== 'number' && typeof this._port !== 'string') {
        throw new TypeError('"port" option should be a number or string: ' + this._port)
      }
      if (!isLegalPort(this._port)) {
        throw new RangeError('"port" option should be >= 0 and < 65536: ' + this._port)
      }
    }
    this._port |= 0

    this._init()

    this._unrefTimer()

    if (typeof cb === 'function') {
      this.once('connect', cb)
    }

    chrome.sockets.tcp.create((createInfo) => {
      if (!this.connecting || this.id) {
        ignoreLastError()
        chrome.sockets.tcp.close(createInfo.socketId)
        return
      }
      if (chrome.runtime.lastError) {
        this.destroy(new Error(chrome.runtime.lastError.message))
        return
      }

      this.id = createInfo.socketId
      sockets[this.id] = this

      chrome.sockets.tcp.setPaused(this.id, true)

      chrome.sockets.tcp.connect(this.id, this._host, this._port, (result) => {
        // callback may come after call to destroy
        if (this.id !== createInfo.socketId) {
          ignoreLastError()
          return
        }
        if (result !== 0) {
          this.destroy(exceptionWithHostPort(result, 'connect', this._host, this._port))
          return
        }

        this._unrefTimer()
        this._onConnect()
      })
    })

    return this
  }

  _onConnect () {
    const idBefore = this.id
    chrome.sockets.tcp.getInfo(this.id, (result) => {
      if (this.id !== idBefore) {
        ignoreLastError()
        return
      }
      if (chrome.runtime.lastError) {
        this.destroy(new Error(chrome.runtime.lastError.message))
        return
      }

      this.remoteAddress = result.peerAddress
      this.remoteFamily = result.peerAddress &&
        result.peerAddress.indexOf(':') !== -1
        ? 'IPv6'
        : 'IPv4'
      this.remotePort = result.peerPort
      this.localAddress = result.localAddress
      this.localPort = result.localPort

      this.connecting = false
      this.readable = true

      this.emit('connect')
      // start the first read, or get an immediate EOF.
      // this doesn't actually consume any bytes, because len=0
      if (!this.isPaused()) this.read(0)
    })
  }

  /**
   * The number of characters currently buffered to be written.
   * @type {number}
   */
  get bufferSize () {
    if (this.id) {
      let bytes = this._writableState.length
      if (this._pendingData) bytes += this._pendingData.length
      return bytes
    }
  }

  end (data, encoding) {
    stream.Duplex.prototype.end.call(this, data, encoding)
    this.writable = false
  }

  _write (chunk, encoding, callback) {
    if (!callback) callback = () => { }

    if (this.connecting) {
      this._pendingData = chunk
      this.once('connect', () => this._write(chunk, encoding, callback))
      return
    }
    this._pendingData = null

    if (!this.id) {
      callback(new Error('This socket is closed'))
      return
    }

    // assuming buffer is browser implementation (`buffer` package on npm)
    let buffer = chunk.buffer
    if (chunk.byteLength !== buffer.byteLength) {
      buffer = buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)
    }

    const idBefore = this.id
    chrome.sockets.tcp.send(this.id, buffer, (sendInfo) => {
      if (this.id !== idBefore) {
        ignoreLastError()
        return
      }

      if (sendInfo.resultCode < 0) {
        this._destroy(exceptionWithHostPort(sendInfo.resultCode, 'write', this.remoteAddress, this.remotePort), callback)
      } else {
        this._unrefTimer()
        callback(null)
      }
    })

    this._bytesDispatched += chunk.length
  }

  _read (bufferSize) {
    if (this.connecting || !this.id) {
      this.once('connect', () => this._read(bufferSize))
      return
    }

    chrome.sockets.tcp.setPaused(this.id, false)

    const idBefore = this.id
    chrome.sockets.tcp.getInfo(this.id, (result) => {
      if (this.id !== idBefore) {
        ignoreLastError()
        return
      }
      if (chrome.runtime.lastError || !result.connected) {
        this._onReceiveError(-15) // workaround for https://crbug.com/518161
      }
    })
  }

  _onReceive (data) {
    const buffer = Buffer.from(data)
    const offset = this.bytesRead

    this.bytesRead += buffer.length
    this._unrefTimer()

    if (this.ondata) {
      console.error('socket.ondata = func is non-standard, use socket.on(\'data\', func)')
      this.ondata(buffer, offset, this.bytesRead)
    }
    if (!this.push(buffer)) { // if returns false, then apply backpressure
      chrome.sockets.tcp.setPaused(this.id, true)
    }
  }

  _onReceiveError (resultCode) {
    if (resultCode === -100) { // net::ERR_CONNECTION_CLOSED
      if (this.onend) {
        console.error('socket.onend = func is non-standard, use socket.on(\'end\', func)')
        this.once('end', this.onend)
      }
      this.push(null)
      this.destroy()
    } else if (resultCode < 0) {
      this.destroy(errnoException(resultCode, 'read'))
    }
  }

  /**
   * The amount of bytes sent.
   * @return {number}
   */
  get bytesWritten () {
    if (this.id) return this._bytesDispatched + this.bufferSize
  }

  destroy (exception) {
    this._destroy(exception)
  }

  _destroy (exception, cb) {
    const fireErrorCallbacks = () => {
      if (cb) cb(exception)
      if (exception && !this._writableState.errorEmitted) {
        process.nextTick(emitErrorNT, this, exception)
        this._writableState.errorEmitted = true
      }
    }

    if (this.destroyed) {
      // already destroyed, fire error callbacks
      fireErrorCallbacks()
      return
    }

    if (this._server) {
      this._server._connections -= 1
      if (this._server._emitCloseIfDrained) this._server._emitCloseIfDrained()
    }

    this._reset()

    for (let s = this; s !== null; s = s._parent) timers.unenroll(s) // eslint-disable-line n/no-deprecated-api

    this.destroyed = true

    // If _destroy() has been called before chrome.sockets.tcp.create()
    // callback, we don't have an id. Therefore we don't need to close
    // or disconnect
    if (this.id) {
      delete sockets[this.id]
      chrome.sockets.tcp.close(this.id, () => {
        if (this.destroyed) {
          this.emit('close', !!exception)
        }
      })
      this.id = null
    }

    fireErrorCallbacks()
  }

  destroySoon () {
    if (this.writable) this.end()

    if (this._writableState.finished) this.destroy()
  }

  /**
   * Sets the socket to timeout after timeout milliseconds of inactivity on the socket.
   * By default net.Socket do not have a timeout. When an idle timeout is triggered the
   * socket will receive a 'timeout' event but the connection will not be severed. The
   * user must manually end() or destroy() the socket.
   *
   * If timeout is 0, then the existing idle timeout is disabled.
   *
   * The optional callback parameter will be added as a one time listener for the 'timeout' event.
   *
   * @param {number}   timeout
   * @param {function} callback
   */
  setTimeout (timeout, callback) {
    if (timeout === 0) {
      timers.unenroll(this) // eslint-disable-line n/no-deprecated-api
      if (callback) {
        this.removeListener('timeout', callback)
      }
    } else {
      timers.enroll(this, timeout) // eslint-disable-line n/no-deprecated-api
      timers._unrefActive(this)
      if (callback) {
        this.once('timeout', callback)
      }
    }

    return this
  }

  _onTimeout () {
    this.emit('timeout')
  }

  _unrefTimer () {
    for (let s = this; s !== null; s = s._parent) {
      timers._unrefActive(s)
    }
  }

  /**
   * Disables the Nagle algorithm. By default TCP connections use the Nagle
   * algorithm, they buffer data before sending it off. Setting true for noDelay
   * will immediately fire off data each time socket.write() is called. noDelay
   * defaults to true.
   *
   * NOTE: The Chrome version of this function is async, whereas the node
   * version is sync. Keep this in mind.
   *
   * @param {boolean} [noDelay] Optional
   * @param {function} callback CHROME-SPECIFIC: Called when the configuration
   *                            operation is done.
   */
  setNoDelay (noDelay, callback) {
    if (!this.id) {
      this.once('connect', () => this.setNoDelay(noDelay, callback))
      return this
    }

    // backwards compatibility: assume true when `noDelay` is omitted
    noDelay = noDelay === undefined ? true : !!noDelay
    chrome.sockets.tcp.setNoDelay(this.id, noDelay, chromeCallbackWrap(callback))

    return this
  }

  /**
   * Enable/disable keep-alive functionality, and optionally set the initial
   * delay before the first keepalive probe is sent on an idle socket. enable
   * defaults to false.
   *
   * Set initialDelay (in milliseconds) to set the delay between the last data
   * packet received and the first keepalive probe. Setting 0 for initialDelay
   * will leave the value unchanged from the default (or previous) setting.
   * Defaults to 0.
   *
   * NOTE: The Chrome version of this function is async, whereas the node
   * version is sync. Keep this in mind.
   *
   * @param {boolean} [enable] Optional
   * @param {number} [initialDelay]
   * @param {function} callback CHROME-SPECIFIC: Called when the configuration
   *                            operation is done.
   */
  setKeepAlive (enable, initialDelay, callback) {
    if (!this.id) {
      this.once('connect', () => this.setKeepAlive(enable, initialDelay, callback))
      return this
    }

    chrome.sockets.tcp.setKeepAlive(this.id, !!enable, ~~(initialDelay / 1000),
      chromeCallbackWrap(callback))

    return this
  }

  /**
   * Returns the bound address, the address family name and port of the socket
   * as reported by the operating system. Returns an object with three
   * properties, e.g. { port: 12346, family: 'IPv4', address: '127.0.0.1' }
   *
   * @return {Object} information
   */
  address () {
    return {
      address: this.localAddress,
      port: this.localPort,
      family: this.localAddress &&
        this.localAddress.indexOf(':') !== -1
        ? 'IPv6'
        : 'IPv4'
    }
  }

  get _connecting () {
    return this.connecting
  }

  get readyState () {
    if (this.connecting) {
      return 'opening'
    } else if (this.readable && this.writable) {
      return 'open'
    } else {
      return 'closed'
    }
  }

  ref () {
    // No chrome.socket equivalent
    return this
  }

  unref () {
    // No chrome.socket equivalent
    return this
  }
}
exports.Socket = Socket

//
// EXPORTED HELPERS
//

// Source: https://developers.google.com/web/fundamentals/input/form/provide-real-time-validation#use-these-attributes-to-validate-input
const IPv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const IPv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

exports.isIPv4 = IPv4Regex.test.bind(IPv4Regex)
exports.isIPv6 = IPv6Regex.test.bind(IPv6Regex)

exports.isIP = function (ip) {
  return exports.isIPv4(ip) ? 4 : exports.isIPv6(ip) ? 6 : 0
}

//
// HELPERS
//

/**
 * Returns an array [options] or [options, cb]
 * It is the same as the argument of Socket.prototype.connect().
 */
function normalizeConnectArgs (args) {
  let options = {}

  if (args[0] !== null && typeof args[0] === 'object') {
    // connect(options, [cb])
    options = args[0]
  } else if (isPipeName(args[0])) {
    // connect(path, [cb])
    throw new Error('Pipes are not supported in Chrome Apps.')
  } else {
    // connect(port, [host], [cb])
    options.port = args[0]
    if (typeof args[1] === 'string') {
      options.host = args[1]
    }
  }

  const cb = args[args.length - 1]
  return typeof cb === 'function' ? [options, cb] : [options]
}

function toNumber (x) {
  return (x = Number(x)) >= 0 ? x : false
}

function isPipeName (s) {
  return typeof s === 'string' && toNumber(s) === false
}

// Check that the port number is not NaN when coerced to a number,
// is an integer and that it falls within the legal range of port numbers.
function isLegalPort (port) {
  if ((typeof port !== 'number' && typeof port !== 'string') ||
      (typeof port === 'string' && port.trim().length === 0)) {
    return false
  }
  return +port === (+port >>> 0) && port <= 0xFFFF
}

function assertPort (port) {
  if (typeof port !== 'undefined' && !isLegalPort(port)) {
    throw new RangeError('"port" argument must be >= 0 and < 65536')
  }
}

// Call the getter function to prevent "Unchecked runtime.lastError" errors
function ignoreLastError () {
  void chrome.runtime.lastError // eslint-disable-line no-void
}

function chromeCallbackWrap (callback) {
  return () => {
    let error
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message)
      error = new Error(chrome.runtime.lastError.message)
    }
    if (callback) callback(error)
  }
}

function emitErrorNT (self, err) {
  self.emit('error', err)
}

// Full list of possible error codes: https://code.google.com/p/chrome-browser/source/browse/trunk/src/net/base/net_error_list.h
// TODO: Try to reproduce errors in both node & Chrome Apps and extend this list
//       (what conditions lead to EPIPE?)
const errorChromeToUv = {
  '-10': 'EACCES',
  '-22': 'EACCES',
  '-138': 'EACCES',
  '-147': 'EADDRINUSE',
  '-108': 'EADDRNOTAVAIL',
  '-103': 'ECONNABORTED',
  '-102': 'ECONNREFUSED',
  '-101': 'ECONNRESET',
  '-16': 'EEXIST',
  '-8': 'EFBIG',
  '-109': 'EHOSTUNREACH',
  '-4': 'EINVAL',
  '-23': 'EISCONN',
  '-6': 'ENOENT',
  '-13': 'ENOMEM',
  '-106': 'ENONET',
  '-18': 'ENOSPC',
  '-11': 'ENOSYS',
  '-15': 'ENOTCONN',
  '-105': 'ENOTFOUND',
  '-118': 'ETIMEDOUT',
  '-100': 'EOF'
}
function errnoException (err, syscall, details) {
  const uvCode = errorChromeToUv[err] || 'UNKNOWN'
  let message = syscall + ' ' + err + ' ' + details
  if (chrome.runtime.lastError) {
    message += ' ' + chrome.runtime.lastError.message
  }
  message += ' (mapped uv code: ' + uvCode + ')'
  const e = new Error(message)
  e.code = e.errno = uvCode
  // TODO: expose chrome error code; what property name?
  e.syscall = syscall
  return e
}

function exceptionWithHostPort (err, syscall, address, port, additional) {
  let details
  if (port && port > 0) {
    details = address + ':' + port
  } else {
    details = address
  }

  if (additional) {
    details += ' - Local (' + additional + ')'
  }
  const ex = errnoException(err, syscall, details)
  ex.address = address
  if (port) {
    ex.port = port
  }
  return ex
}
