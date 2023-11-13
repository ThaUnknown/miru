// @ts-nocheck
/*! chrome-dgram. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* global chrome */

/**
 * UDP / Datagram Sockets
 * ======================
 *
 * Datagram sockets are available through require('chrome-dgram').
 */
const EventEmitter = require('events')
const series = require('run-series')

const BIND_STATE_UNBOUND = 0
const BIND_STATE_BINDING = 1
const BIND_STATE_BOUND = 2

// Track open sockets to route incoming data (via onReceive) to the right handlers.
const sockets = {}

const noop = () => {}

// Thorough check for Chrome App since both Edge and Chrome implement dummy chrome object
if (typeof chrome?.sockets?.udp === 'object') {
  chrome.sockets.udp.onReceive.addListener(onReceive)
  chrome.sockets.udp.onReceiveError.addListener(onReceiveError)
}

function onReceive (info) {
  if (info.socketId in sockets) {
    sockets[info.socketId]._onReceive(info)
  } else {
    console.error('Unknown socket id: ' + info.socketId)
  }
}

function onReceiveError (info) {
  if (info.socketId in sockets) {
    sockets[info.socketId]._onReceiveError(info.resultCode)
  } else {
    console.error('Unknown socket id: ' + info.socketId)
  }
}

/**
 * dgram.createSocket(type, [callback])
 *
 * Creates a datagram Socket of the specified types. Valid types are `udp4`
 * and `udp6`.
 *
 * Takes an optional callback which is added as a listener for message events.
 *
 * Call socket.bind if you want to receive datagrams. socket.bind() will bind
 * to the "all interfaces" address on a random port (it does the right thing
 * for both udp4 and udp6 sockets). You can then retrieve the address and port
 * with socket.address().address and socket.address().port.
 *
 * @param  {string} type       Either 'udp4' or 'udp6'
 * @param  {function} listener Attached as a listener to message events.
 *                             Optional
 * @return {Socket}            Socket object
 */
exports.createSocket = function (type, listener) {
  return new Socket(type, listener)
}

/**
 * Class: dgram.Socket
 *
 * The dgram Socket class encapsulates the datagram functionality. It should
 * be created via `dgram.createSocket(type, [callback])`.
 *
 * Event: 'message'
 *   - msg Buffer object. The message
 *   - rinfo Object. Remote address information
 *   Emitted when a new datagram is available on a socket. msg is a Buffer and
 *   rinfo is an object with the sender's address information and the number
 *   of bytes in the datagram.
 *
 * Event: 'listening'
 *   Emitted when a socket starts listening for datagrams. This happens as soon
 *   as UDP sockets are created.
 *
 * Event: 'close'
 *   Emitted when a socket is closed with close(). No new message events will
 *   be emitted on this socket.
 *
 * Event: 'error'
 *   - exception Error object
 *   Emitted when an error occurs.
 */
class Socket extends EventEmitter {
  constructor (options, listener) {
    super()
    if (typeof options === 'string') options = { type: options }
    if (options.type !== 'udp4') throw new Error('Bad socket type specified. Valid types are: udp4')

    if (typeof listener === 'function') this.on('message', listener)

    this._destroyed = false
    this._bindState = BIND_STATE_UNBOUND
    this._bindTasks = []
  }

  /**
   * socket.bind(port, [address], [callback])
   *
   * For UDP sockets, listen for datagrams on a named port and optional address.
   * If address is not specified, the OS will try to listen on all addresses.
   * After binding is done, a "listening" event is emitted and the callback(if
   * specified) is called. Specifying both a "listening" event listener and
   * callback is not harmful but not very useful.
   *
   * A bound datagram socket keeps the node process running to receive
   * datagrams.
   *
   * If binding fails, an "error" event is generated. In rare case (e.g. binding
   * a closed socket), an Error may be thrown by this method.
   *
   * @param {number} port
   * @param {string} address Optional
   * @param {function} callback Function with no parameters, Optional. Callback
   *                            when binding is done.
   */
  bind (port, address, callback) {
    if (typeof address === 'function') {
      callback = address
      address = undefined
    }

    if (!address) address = '0.0.0.0'

    if (!port) port = 0

    if (this._bindState !== BIND_STATE_UNBOUND) throw new Error('Socket is already bound')

    this._bindState = BIND_STATE_BINDING

    if (typeof callback === 'function') this.once('listening', callback)

    chrome.sockets.udp.create(createInfo => {
      this.id = createInfo.socketId

      sockets[this.id] = this

      const bindFns = this._bindTasks.map(({ fn }) => fn)

      series(bindFns, err => {
        if (err) return this.emit('error', err)
        chrome.sockets.udp.bind(this.id, address, port, result => {
          if (result < 0) {
            this.emit('error', new Error('Socket ' + this.id + ' failed to bind. ' +
              chrome.runtime.lastError.message))
            return
          }
          chrome.sockets.udp.getInfo(this.id, socketInfo => {
            if (!socketInfo.localPort || !socketInfo.localAddress) {
              this.emit('error', new Error('Cannot get local port/address for Socket ' + this.id))
              return
            }

            this._port = socketInfo.localPort
            this._address = socketInfo.localAddress

            this._bindState = BIND_STATE_BOUND
            this.emit('listening')

            for (const t of this._bindTasks) {
              t.callback()
            }
          })
        })
      })
    })
  }

  /**
   * Internal function to receive new messages and emit `message` events.
   */
  _onReceive (info) {
    const buf = Buffer.from(new Uint8Array(info.data))
    const rinfo = {
      address: info.remoteAddress,
      family: 'IPv4',
      port: info.remotePort,
      size: buf.length
    }
    this.emit('message', buf, rinfo)
  }

  _onReceiveError (resultCode) {
    this.emit('error', new Error('Socket ' + this.id + ' receive error ' + resultCode))
  }

  /**
   * socket.send(buf, offset, length, port, address, [callback])
   *
   * For UDP sockets, the destination port and IP address must be
   * specified. A string may be supplied for the address parameter, and it will
   * be resolved with DNS. An optional callback may be specified to detect any
   * DNS errors and when buf may be re-used. Note that DNS lookups will delay
   * the time that a send takes place, at least until the next tick. The only
   * way to know for sure that a send has taken place is to use the callback.
   *
   * If the socket has not been previously bound with a call to bind, it's
   * assigned a random port number and bound to the "all interfaces" address
   * (0.0.0.0 for udp4 sockets, ::0 for udp6 sockets).
   *
   * @param {Buffer|Arrayish|string} buf Message to be sent
   * @param {number} offset Offset in the buffer where the message starts. Optional.
   * @param {number} length Number of bytes in the message. Optional.
   * @param {number} port destination port
   * @param {string} address destination IP
   * @param {function} callback Callback when message is done being delivered.
   *                            Optional.
   *
   * Valid combinations:
   *   send(buffer, offset, length, port, address, callback)
   *   send(buffer, offset, length, port, address)
   *   send(buffer, offset, length, port)
   *   send(bufferOrList, port, address, callback)
   *   send(bufferOrList, port, address)
   *   send(bufferOrList, port)
   *
   */
  send (buffer, offset, length, port, address, callback = noop) {
    let list
    const cb = callback || noop

    if (address || (port && typeof port !== 'function')) {
      buffer = this.sliceBuffer(buffer, offset, length)
    } else {
      callback = port
      port = offset
      address = length
    }

    if (!Array.isArray(buffer)) {
      if (typeof buffer === 'string') {
        list = [Buffer.from(buffer)]
      } else if (!(buffer instanceof Uint8Array)) {
        throw new TypeError('First argument must be a buffer or a string')
      } else {
        list = [Buffer.from(buffer)]
      }
    } else if (!(list = this.fixBufferList(buffer))) {
      throw new TypeError('Buffer list arguments must be buffers or strings')
    }

    port = port >>> 0
    if (port === 0 || port > 65535) {
      throw new RangeError('Port should be > 0 and < 65536')
    }

    if (this._bindState === BIND_STATE_UNBOUND) this.bind(0)

    // If the socket hasn't been bound yet, push the outbound packet onto the
    // send queue and send after binding is complete.
    if (this._bindState !== BIND_STATE_BOUND) {
      // If the send queue hasn't been initialized yet, do it, and install an
      // event handler that flishes the send queue after binding is done.
      if (!this._sendQueue) {
        this._sendQueue = []
        this.once('listening', () => {
          // Flush the send queue.
          for (let i = 0; i < this._sendQueue.length; i++) {
            this.send.apply(this, this._sendQueue[i])
          }
          this._sendQueue = undefined
        })
      }
      this._sendQueue.push([buffer, offset, length, port, address, callback])
      return
    }

    const ab = Buffer.concat(list).buffer

    chrome.sockets.udp.send(this.id, ab, address, port, sendInfo => {
      if (sendInfo.resultCode < 0) {
        const err = new Error('Socket ' + this.id + ' send error ' + sendInfo.resultCode)
        cb(err)
        this.emit('error', err)
      } else {
        cb(null)
      }
    })
  }

  sliceBuffer (buffer, offset, length) {
    buffer = Buffer.from(buffer)

    offset = offset >>> 0
    length = length >>> 0

    // assuming buffer is browser implementation (`buffer` package on npm)
    let buf = buffer.buffer
    if (buffer.byteOffset || buffer.byteLength !== buf.byteLength) {
      buf = buf.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    }
    if (offset || length !== buffer.length) {
      buf = buf.slice(offset, length)
    }

    return Buffer.from(buf)
  }

  fixBufferList (list) {
    const newlist = new Array(list.length)

    for (let i = 0, l = list.length; i < l; i++) {
      const buf = list[i]
      if (typeof buf === 'string') {
        newlist[i] = Buffer.from(buf)
      } else if (!(buf instanceof Uint8Array)) {
        return null
      } else {
        newlist[i] = Buffer.from(buf)
      }
    }

    return newlist
  }

  /**
   * Close the underlying socket and stop listening for data on it.
   */
  close () {
    if (this._destroyed) return

    delete sockets[this.id]
    chrome.sockets.udp.close(this.id)
    this._destroyed = true

    this.emit('close')
  }

  /**
   * Returns an object containing the address information for a socket. For UDP
   * sockets, this object will contain address, family and port.
   *
   * @return {Object} information
   */
  address () {
    return {
      address: this._address,
      port: this._port,
      family: 'IPv4'
    }
  }

  setBroadcast (flag) {
    // No chrome.sockets equivalent
  }

  setTTL (ttl) {
    // No chrome.sockets equivalent
  }

  // NOTE: Multicast code is untested. Pull requests accepted for bug fixes and to
  // add tests!
  /**
   * Sets the IP_MULTICAST_TTL socket option. TTL stands for "Time to Live," but
   * in this context it specifies the number of IP hops that a packet is allowed
   * to go through, specifically for multicast traffic. Each router or gateway
   * that forwards a packet decrements the TTL. If the TTL is decremented to 0
   * by a router, it will not be forwarded.
   *
   * The argument to setMulticastTTL() is a number of hops between 0 and 255.
   * The default on most systems is 1.
   *
   * NOTE: The Chrome version of this function is async, whereas the node
   * version is sync. Keep this in mind.
   *
   * @param {number} ttl
   * @param {function} callback CHROME-SPECIFIC: Called when the configuration
   *                            operation is done.
   */
  setMulticastTTL (ttl, callback = noop) {
    const setMulticastTTL = callback => {
      chrome.sockets.udp.setMulticastTimeToLive(this.id, ttl, callback)
    }
    if (this._bindState === BIND_STATE_BOUND) {
      setMulticastTTL(callback)
    } else {
      this._bindTasks.push({
        fn: setMulticastTTL,
        callback
      })
    }
  }

  /**
   * Sets or clears the IP_MULTICAST_LOOP socket option. When this option is
   * set, multicast packets will also be received on the local interface.
   *
   * NOTE: The Chrome version of this function is async, whereas the node
   * version is sync. Keep this in mind.
   *
   * @param {boolean} flag
   * @param {function} callback CHROME-SPECIFIC: Called when the configuration
   *                            operation is done.
   */
  setMulticastLoopback (flag, callback = noop) {
    const setMulticastLoopback = callback => {
      chrome.sockets.udp.setMulticastLoopbackMode(this.id, flag, callback)
    }
    if (this._bindState === BIND_STATE_BOUND) {
      setMulticastLoopback(callback)
    } else {
      this._bindTasks.push({
        fn: setMulticastLoopback,
        callback
      })
    }
  }

  /**
   * Tells the kernel to join a multicast group with IP_ADD_MEMBERSHIP socket
   * option.
   *
   * If multicastInterface is not specified, the OS will try to add membership
   * to all valid interfaces.
   *
   * NOTE: The Chrome version of this function is async, whereas the node
   * version is sync. Keep this in mind.
   *
   * @param {string} multicastAddress
   * @param {string} [multicastInterface] Optional
   * @param {function} callback CHROME-SPECIFIC: Called when the configuration
   *                            operation is done.
   */
  addMembership (multicastAddress, multicastInterface, callback = noop) {
    chrome.sockets.udp.joinGroup(this.id, multicastAddress, callback)
  }

  /**
   * Opposite of addMembership - tells the kernel to leave a multicast group
   * with IP_DROP_MEMBERSHIP socket option. This is automatically called by the
   * kernel when the socket is closed or process terminates, so most apps will
   * never need to call this.
   *
   * NOTE: The Chrome version of this function is async, whereas the node
   * version is sync. Keep this in mind.
   *
   * If multicastInterface is not specified, the OS will try to drop membership
   * to all valid interfaces.
   *
   * @param  {[type]} multicastAddress
   * @param  {[type]} multicastInterface Optional
   * @param {function} callback CHROME-SPECIFIC: Called when the configuration
   *                            operation is done.
   */
  dropMembership (multicastAddress, multicastInterface, callback = noop) {
    chrome.sockets.udp.leaveGroup(this.id, multicastAddress, callback)
  }

  unref () {
    // No chrome.sockets equivalent
  }

  ref () {
    // No chrome.sockets equivalent
  }
}

exports.Socket = Socket
