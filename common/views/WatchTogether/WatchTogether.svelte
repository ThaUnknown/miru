<script context='module'>
  import { writable } from 'simple-store-svelte'
  import { client } from '@/modules/torrent.js'
  import { toast } from 'svelte-sonner'
  import { page } from '@/App.svelte'
  import { click } from '@/modules/click.js'
  import { W2GSession } from '@/modules/w2g'
  import IPC from '@/modules/ipc.js'
  import 'browser-event-target-emitter'

  export const w2gEmitter = new EventTarget()

  const peers = writable({})

  export const state = writable(false)

  const session = new W2GSession()

  session.onPeerListUpdated = (p) => peers.update(() => p)
  session.onMediaIndexUpdated = (i) => w2gEmitter.emit('setindex', i)
  session.onPlayerStateUpdated = (state) => w2gEmitter.emit('playerupdate', state)

  w2gEmitter.on('player', ({ detail }) => session.localPlayerStateChanged(detail))
  w2gEmitter.on('index', ({ detail }) => session.localMediaIndexChanged(detail.index))
  client.on('magnet', ({ detail }) => session.localMagnetLink(detail))

  function cleanup () {
    state.set(false)
    peers.set({})
    session.dispose()
  }

  function joinLobby (code) {
    cleanup()
    state.set(session.createClient(code))

    if (!code) invite()
  }

  IPC.on('w2glink', (link) => {
    joinLobby(link)
    page.set('watchtogether')
  })

  function invite () {
    if (!session.initializated) return
    navigator.clipboard.writeText(session.inviteLink)
    toast('Copied to clipboard', {
      description: 'Copied invite URL to clipboard',
      duration: 5000
    })
  }
</script>

<script>
  import Lobby from './Lobby.svelte'

  let joinText

  const inviteRx = /([A-z0-9]{16})/i
  function checkInvite (invite) {
    if (!invite) return
    const match = invite?.match(inviteRx)?.[1]
    if (!match) return
    console.log(match)
    page.set('watchtogether')
    joinLobby(match)
    joinText = ''
  }

  $: checkInvite(joinText)
</script>

<div class='d-flex h-full align-items-center flex-column content'>
  <div class='font-size-50 font-weight-bold pt-20 mt-20 root'>
    Watch Together
  </div>
  {#if !$state}
    <div
      class='d-flex flex-row flex-wrap justify-content-center align-items-center h-full mb-20 pb-20 root'
    >
      <div
        class='card d-flex flex-column align-items-center w-300 h-300 justify-content-end'
      >
        <span
          class='font-size-80 material-symbols-outlined d-flex align-items-center h-full'
        >add</span
        >
        <button
          class='btn btn-primary btn-lg mt-10 btn-block'
          type='button'
          use:click={() => joinLobby()}>Create Lobby</button
        >
      </div>
      <div
        class='card d-flex flex-column align-items-center w-300 h-300 justify-content-end'
      >
        <span
          class='font-size-80 material-symbols-outlined d-flex align-items-center h-full'
        >group_add</span
        >
        <h2 class='font-weight-bold'>Join Lobby</h2>
        <input
          type='text'
          class='form-control h-50'
          autocomplete='off'
          bind:value={joinText}
          data-option='search'
          placeholder='Lobby code or link'
        />
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
