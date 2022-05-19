<script context="module">
  import { writable, get } from 'svelte/store'
  import { alID } from '@/modules/anilist.js'
  import { add, client } from '@/modules/torrent.js'
  import Peer from '@/modules/Peer.js'
  import { generateRandomHexCode } from '@/modules/util.js'
  import { addToast } from '@/lib/Toasts.svelte'
  import 'browser-event-target-emitter'

  export const w2gEmitter = new EventTarget()

  const state = writable(null)

  const peers = writable({})

  let peersExternal = {}

  peers.subscribe(value => (peersExternal = value))

  const pending = writable(null)

  function invite () {
    pending.set(new Peer({ polite: false }))
  }

  pending.subscribe(peer => {
    if (peer) peer.ready.then(() => handlePeer(peer))
  })

  function setPlayerState (detail) {
    let emit = false
    for (const key of ['paused', 'time']) {
      emit = emit || detail[key] !== playerState[key]
      playerState[key] = detail[key]
    }
    return emit
  }

  w2gEmitter.on('player', ({ detail }) => {
    if (setPlayerState(detail)) emit('player', detail)
  })

  w2gEmitter.on('index', ({ detail }) => {
    if (playerState.index !== detail.index) {
      emit('index', detail)
      playerState.index = detail.index
    }
  })

  queueMicrotask(() => {
    client.on('magnet', ({ detail }) => {
      if (detail.hash !== playerState.hash) {
        playerState.hash = detail.hash
        playerState.index = 0
        emit('torrent', detail)
      }
    })
  })

  function emit (type, data) {
    for (const peer of Object.values(peersExternal)) {
      peer.channel.send(JSON.stringify({ type, ...data }))
    }
  }

  const playerState = {
    paused: null,
    time: null,
    hash: null,
    index: 0
  }

  function cancel () {
    pending.update(peer => {
      peer.pc.close()
    })
    if (get(state) === 'guest') state.set(null)
  }

  function cleanup () {
    if (get(state)) {
      addToast({
        text: 'The lobby you were previously in has disbanded.',
        title: 'Lobby Disbanded',
        type: 'danger'
      })
      state.set(null)
      pending.set(null)
      peers.update(peers => {
        for (const peer of Object.values(peers)) peer?.peer?.pc.close()
        return {}
      })
    }
  }

  function handlePeer (peer) {
    pending.set(null)
    if (get(state) === 'guest') peer.dc.onclose = cleanup
    // add event listeners and store in peers
    const protocolChannel = peer.pc.createDataChannel('w2gprotocol', { negotiated: true, id: 2 })
    protocolChannel.onopen = async () => {
      protocolChannel.onmessage = ({ data }) => handleMessage(JSON.parse(data), protocolChannel, peer)
      const user = (await alID)?.data?.Viewer || {}
      protocolChannel.send(
        JSON.stringify({
          type: 'init',
          id: user.id || generateRandomHexCode(16),
          user
        })
      )
    }
  }

  function handleMessage (data, channel, peer) {
    console.log(data)
    if (get(state) === 'host') emit(data.type, data)
    switch (data.type) {
      case 'init':
        peers.update(object => {
          object[data.id] = {
            peer,
            channel,
            user: data.user
          }
          return object
        })

        channel.onclose = () => {
          peers.update(object => {
            delete object[data.id]
            return object
          })
        }
        break
      case 'player': {
        if (setPlayerState(data)) w2gEmitter.emit('playerupdate', data)
        break
      }
      case 'torrent': {
        if (data.hash !== playerState.hash) {
          playerState.hash = data.hash
          add(data.magnet)
        }
        break
      }
      case 'index': {
        if (playerState.index !== data.index) {
          playerState.index = data.index
          w2gEmitter.emit('setindex', data.index)
        }
        break
      }
      default: {
        console.error('Invalid message type', data, channel)
      }
    }
  }

  function setState (newstate) {
    if (newstate === 'guest') {
      const peer = new Peer({ polite: true })
      pending.set(peer)
    }
    state.set(newstate)
  }
</script>

<script>
  import Lobby from './Lobby.svelte'
  import Connect from './Connect.svelte'
</script>

<div class="d-flex h-full align-items-center flex-column content">
  <div class="font-size-50 font-weight-bold pt-20 mt-20 root">Watch Together</div>
  {#if !$state}
    <div class="d-flex flex-row flex-wrap justify-content-center align-items-center h-full mb-20 pb-20 root">
      <div class="card d-flex flex-column align-items-center w-300 h-300 justify-content-end">
        <span class="font-size-80 material-icons d-flex align-items-center h-full">add</span>
        <button class="btn btn-primary btn-lg mt-10 btn-block" type="button" on:click={() => setState('host')}>Create Lobby</button>
      </div>
      <div class="card d-flex flex-column align-items-center w-300 h-300 justify-content-end">
        <span class="font-size-80 material-icons d-flex align-items-center h-full">group_add</span>
        <button class="btn btn-primary btn-lg mt-10 btn-block" type="button" on:click={() => setState('guest')}>Join Lobby</button>
      </div>
    </div>
  {:else if $pending}
    <Connect bind:state={$state} peer={$pending} {cancel} />
  {:else}
    <Lobby bind:state={$state} bind:peers={$peers} {invite} {cleanup} />
  {/if}
</div>

<style>
  .font-size-50 {
    font-size: 5rem;
  }
  .font-size-80 {
    font-size: 8rem;
  }
</style>
