/* eslint-env browser */
function waitToCompleteIceGathering (pc, state = pc.iceGatheringState) {
  return state !== 'complete' && new Promise(resolve => {
    pc.addEventListener('icegatheringstatechange', () => (pc.iceGatheringState === 'complete') && resolve())
  })
}
/**
 * @typedef {AddEventListenerOptions} Test~options
 * @property {AbortSignal} signal - funkis?
 */

export default class Peer {
  /**
   * @param {{
   *   polite: boolean,
   *   trickle: boolean,
   *   iceServers: RTCIceServer[]
   *   signal: AbortSignal
   * }} [options]
   */
  constructor (options = {}) {
    let { polite = true, trickle = true, quality = {} } = options

    let { port1, port2 } = new MessageChannel()
    let send = msg => port2.postMessage(JSON.stringify(msg))

    const pc = new RTCPeerConnection({
      iceServers: options?.iceServers || [{
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:global.stun.twilio.com:3478',
          'stun:stun.nextcloud.com:443'
        ]
      }]
    })

    const ctrl = new AbortController()

    /** @type {any} dummy alias for AbortSignal to make TS happy */
    const signal = { signal: ctrl.signal }

    pc.addEventListener('iceconnectionstatechange', () => {
      if (
        pc.iceConnectionState === 'disconnected' ||
        pc.iceConnectionState === 'failed'
      ) {
        ctrl.abort()
      }
    }, signal)

    const dc = pc.createDataChannel('both', { negotiated: true, id: 0 })

    this.pc = pc
    this.dc = dc
    this.signal = ctrl.signal
    this.polite = polite
    this.signalingPort = port1

    this.ready = new Promise(resolve => {
      dc.addEventListener('open', () => {
        // At this point we start to trickle over datachannel instead
        // we also close the message channel as we do not need it anymore
        trickle = true
        send = (msg) => dc.send(JSON.stringify(msg))
        port1.close()
        port2.close()
        this.ready = port2 = port1 = port2.onmessage = null
        resolve()
      }, { once: true, ...signal })
    })

    pc.addEventListener('icecandidate', ({ candidate }) => {
      trickle && send({ candidate })
    }, { ...signal })

    // The rest is the polite peer negotiation logic, copied from this blog

    let makingOffer = false; let ignoreOffer = false

    pc.addEventListener('negotiationneeded', async () => {
      makingOffer = true
      const offer = await pc.createOffer()
      if (pc.signalingState !== 'stable') return
      offer.sdp = setQuality(offer.sdp, quality)
      await pc.setLocalDescription(offer)
      makingOffer = false
      if (trickle) {
        send({ description: pc.localDescription })
      } else {
        await waitToCompleteIceGathering(pc)
        const description = pc.localDescription.toJSON()
        description.sdp = description.sdp.replace(/a=ice-options:trickle\s\n/g, '')
        send({ description })
      }
    }, { ...signal })

    async function onmessage ({ data }) {
      const { description, candidate } = typeof data === 'string' ? JSON.parse(data) : data

      if (description) {
        const offerCollision = description.type === 'offer' &&
          (makingOffer || pc.signalingState !== 'stable')

        ignoreOffer = !this.polite && offerCollision
        if (ignoreOffer) {
          return
        }

        if (offerCollision) {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' }),
            pc.setRemoteDescription(description)
          ])
        } else {
          try {
            (description.type === 'answer' && pc.signalingState === 'stable') ||
              await pc.setRemoteDescription(description)
          } catch (err) { }
        }
        if (description.type === 'offer') {
          const answ = await pc.createAnswer()
          answ.sdp = setQuality(answ.sdp, quality)
          await pc.setLocalDescription(answ)
          // Edge didn't set the state to 'new' after calling the above :[
          if (!trickle) await waitToCompleteIceGathering(pc, 'new')
          send({ description: pc.localDescription })
        }
      } else if (candidate) {
        await pc.addIceCandidate(candidate)
      }
    }

    port2.onmessage = onmessage.bind(this)
    dc.addEventListener('message', onmessage.bind(this), { ...signal })
  }
}

// I cannot describe the sheer anger and hatred I bear towards whoever came up with SDP
function setQuality (sdp, opts = {}) {
  if (!sdp || (!opts.video && !opts.audio)) return sdp
  let newSDP = sdp
  if (opts.video) { // bitrate, codecs[]
    const videoData = sdp.matchAll(/^m=video.*SAVPF (.*)$/gm).next().value
    if (videoData && videoData[1]) {
      const RTPIndex = videoData[1]
      const RTPMaps = {}
      let last = null
      for (const [match, id, type] of [...sdp.matchAll(/^a=rtpmap:(\d{1,3}) (.*)\/90000$/gm)]) {
        if (type === 'rtx') {
          RTPMaps[last].push(id)
        } else {
          if (!RTPMaps[type]) RTPMaps[type] = []
          RTPMaps[type].push(id)
          last = type
          if (opts.video.bitrate) {
            const fmtp = `a=fmtp:${id} x-google-min-bitrate=${opts.video.bitrate}; x-google-max-bitrate=${opts.video.bitrate}\n`
            newSDP = newSDP.replace(match, fmtp + match)
          }
        }
      }
      const newIndex = Object.entries(RTPMaps).sort((a, b) => {
        const indexA = opts.video.codecs.indexOf(a[0])
        const indexB = opts.video.codecs.indexOf(b[0])
        return (indexA === -1 ? opts.video.codecs.length : indexA) - (indexB === -1 ? opts.video.codecs.length : indexB)
      }).map(value => {
        return value[1].join(' ')
      }).join(' ')
      newSDP = newSDP.replace(RTPIndex, newIndex)
    }
  }
  if (opts.audio) {
    const audioData = sdp.matchAll(/^a=rtpmap:(\d{1,3}) opus\/48000\/2$/gm).next().value
    if (audioData && audioData[0]) {
      const regex = new RegExp(`^a=fmtp:${audioData[1]}.*$`, 'gm')
      const FMTPData = sdp.match(regex)
      if (FMTPData && FMTPData[0]) {
        let newFMTPData = FMTPData[0].slice(0, FMTPData[0].indexOf(' ') + 1)
        newFMTPData += 'stereo=' + (opts.audio.stereo != null ? opts.audio.stereo : '1')
        newFMTPData += ';sprop-stereo=' + (opts.audio['sprop-stereo'] != null ? opts.audio['sprop-stereo'] : '1')

        if (opts.audio.maxaveragebitrate != null) newFMTPData += '; maxaveragebitrate=' + (opts.audio.maxaveragebitrate || 128 * 1024 * 8)

        if (opts.audio.maxplaybackrate != null) newFMTPData += '; maxplaybackrate=' + (opts.audio.maxplaybackrate || 128 * 1024 * 8)

        if (opts.audio.cbr != null) newFMTPData += '; cbr=' + opts.audio.cbr

        if (opts.audio.useinbandfec != null) newFMTPData += '; useinbandfec=' + opts.audio.useinbandfec

        if (opts.audio.usedtx != null) newFMTPData += '; usedtx=' + opts.audio.usedtx

        if (opts.audio.maxptime != null) newFMTPData += ';maxptime:' + opts.audio.maxptime
        if (opts.audio.minptime != null) newFMTPData += '; minptime:' + opts.audio.minptime
        newSDP = newSDP.replace(FMTPData[0], newFMTPData)
      }
    }
  }
  return newSDP
}
