<script context='module'>
import { writable } from 'svelte/store'
import { alID } from '@/modules/anilist.js'
import { add, client } from '@/modules/torrent.js'
import { generateRandomHexCode } from '@/modules/util.js'
import { addToast } from '@/lib/Toasts.svelte'
import { page } from '@/App.svelte'
import 'browser-event-target-emitter'

import P2PCF from 'p2pcf'

export const w2gEmitter = new EventTarget()

const decode = TextDecoder.prototype.decode.bind(new TextDecoder('utf-8'))
const encode = TextEncoder.prototype.encode.bind(new TextEncoder())

const peers = writable({})

export const state = writable(false)

let p2pcf = null

function joinLobby (code = generateRandomHexCode(16)) {
  p2pcf = new P2PCF(generateRandomHexCode(16), code)
  p2pcf.on('peerconnect', async peer => {
    console.log(peer.id)
    console.log('connect')
    const user = (await alID)?.data?.Viewer || {}
    peer.send(
      JSON.stringify({
        type: 'init',
        id: user.id || generateRandomHexCode(16),
        user
      })
    )
  })
  p2pcf.on('peerclose', peer => {
    peers.update(object => {
      console.log(peer.id)
      console.log('close', object[peer.id])
      delete object[peer.id]
      return object
    })
  })
  p2pcf.on('msg', (peer, data) => {
    data = typeof data === 'string' ? JSON.parse(data) : JSON.parse(decode(data))
    console.log(data)
    switch (data.type) {
      case 'init':
        console.log('init', data.user)
        peers.update(object => {
          object[peer.id] = {
            peer,
            user: data.user
          }
          return object
        })
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
        console.error('Invalid message type', data)
      }
    }
  })
  p2pcf.start()
  state.set(code)
  console.log(p2pcf)
}

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

client.on('magnet', ({ detail }) => {
  if (detail.hash !== playerState.hash) {
    playerState.hash = detail.hash
    playerState.index = 0
    emit('torrent', detail)
  }
})

function emit (type, data) {
  p2pcf?.broadcast(encode(JSON.stringify({ type, ...data })))
}

const playerState = {
  paused: null,
  time: null,
  hash: null,
  index: 0
}

function checkInvite (invite) {
  if (invite) {
    const match = invite.match(inviteRx)
    if (match) {
      page.set('watchtogether')
      joinLobby(match[1])
    }
  }
}

const inviteRx = /([A-z0-9]{16})/i
window.IPC.on('w2glink', checkInvite)

function cleanup () {
  state.set(false)
  peers.set({})
  p2pcf.destroy()
  p2pcf = null
}

function invite () {
  if (p2pcf) {
    navigator.clipboard.writeText(`<miru://w2g/${p2pcf.roomId}>`)
    addToast({
      title: 'Copied to clipboard',
      text: 'Copied invite URL to clipboard',
      type: 'primary',
      duration: '5000'
    })
  }
}
</script>

<script>
import Lobby from './Lobby.svelte'

let joinText

$: checkInvite(joinText)
</script>

<div class='d-flex h-full align-items-center flex-column content'>
  <div class='font-size-50 font-weight-bold pt-20 mt-20 root'>Watch Together</div>
  {#if !$state}
    <div class='d-flex flex-row flex-wrap justify-content-center align-items-center h-full mb-20 pb-20 root'>
      <div class='card d-flex flex-column align-items-center w-300 h-300 justify-content-end'>
        <span class='font-size-80 material-icons d-flex align-items-center h-full'>add</span>
        <button class='btn btn-primary btn-lg mt-10 btn-block' type='button' on:click={() => joinLobby()}>Create Lobby</button>
      </div>
      <div class='card d-flex flex-column align-items-center w-300 h-300 justify-content-end'>
        <span class='font-size-80 material-icons d-flex align-items-center h-full'>group_add</span>
        <h2 class='font-weight-bold'>Join Lobby</h2>
        <input
          type='text'
          class='form-control h-50'
          autocomplete='off'
          bind:value={joinText}
          data-option='search'
          placeholder='Lobby code or link' />
      </div>
    </div>
  {:else}
    <Lobby peers={$peers} {cleanup} {invite} />
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
