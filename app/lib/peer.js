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
    let { polite = true, trickle = true } = options

    let { port1, port2 } = new MessageChannel()
    let send = msg => port2.postMessage(JSON.stringify(msg))

    const pc = new RTCPeerConnection({
      iceServers: options?.iceServers || [{
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:global.stun.twilio.com:3478'
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
          await pc.setLocalDescription(await pc.createAnswer())
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
window.Peer = Peer
