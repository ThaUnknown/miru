<script context='module'>
  import { EventEmitter } from 'events'
  import { writable } from 'simple-store-svelte'
  import { client } from '@/modules/torrent.js'
  import { toast } from 'svelte-sonner'
  import { page } from '@/App.svelte'
  import IPC from '@/modules/ipc.js'
  import 'browser-event-target-emitter'
  import Debug from 'debug'

  const debug = Debug('ui:w2g')

  export const w2gEmitter = new EventEmitter()

  /** @type {import('simple-store-svelte').Writable<W2GClient | null>} */
  export const state = writable(null)

  function joinLobby (code) {
    debug('Joining lobby with code: ' + code)
    if (state.value) state.value.destroy()
    const w2g = new W2GClient(code)
    state.value = w2g
    w2g.on('index', i => w2gEmitter.emit('setindex', i))
    w2g.on('player', state => w2gEmitter.emit('playerupdate', { time: state.time, paused: state.paused }))

    if (!code) invite()
  }
  client.on('magnet', ({ detail }) => state.value?.magnetLink(detail))

  w2gEmitter.on('player', data => state.value?.playerStateChanged(data))
  w2gEmitter.on('index', index => state.value?.mediaIndexChanged(index))

  IPC.on('w2glink', (link) => {
    joinLobby(link)
    page.set('watchtogether')
  })

  function invite () {
    navigator.clipboard.writeText(state.value.inviteLink)
    toast.success('Copied to clipboard', {
      description: 'Copied invite URL to clipboard',
      duration: 5000
    })
  }
</script>

<script>
  import Lobby from './Lobby.svelte'
  import { Plus, UserPlus } from 'lucide-svelte'
  import { W2GClient } from './w2g.js'
  import { click } from '@/modules/click.js'

  let joinText

  const inviteRx = /([A-z0-9]{16})/i
  function checkInvite (invite) {
    if (!invite) return
    const match = invite?.match(inviteRx)?.[1]
    if (!match) return
    page.set('watchtogether')
    joinLobby(match)
    joinText = ''
  }

  $: checkInvite(joinText)
</script>

<div class='d-flex h-full align-items-center flex-column px-md-20'>
  {#if !$state}
    <div class='font-size-50 font-weight-bold pt-20 mt-20 root'>Watch Together</div>
    <div class='d-flex flex-row flex-wrap justify-content-center align-items-center h-full mb-20 pb-20 root position-relative w-full'>
      <div class='card d-flex flex-column align-items-center w-300 h-300 justify-content-end'>
        <Plus size='6rem' class='d-flex align-items-center h-full' />
        <button class='btn btn-primary btn-lg mt-10 btn-block' type='button' use:click={() => joinLobby()}>Create Lobby</button>
      </div>
      <div class='card d-flex flex-column align-items-center w-300 h-300 justify-content-end'>
        <UserPlus size='6rem' class='d-flex align-items-center h-full' />
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
    <Lobby {state} {invite} />
  {/if}
</div>

<style>
  .font-size-50 {
    font-size: 5rem;
  }
</style>
