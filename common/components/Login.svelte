<script context='module'>
  import { click } from '@/modules/click.js'
  import { writable } from 'simple-store-svelte'
  import { platformMap } from '@/views/Settings/Settings.svelte'
  import { clientID } from '@/modules/myanimelist.js'
  import { toast } from 'svelte-sonner'
  import IPC from '@/modules/ipc.js'

  export const login = writable(false)

  function confirmAnilist () {
    IPC.emit('open', 'https://anilist.co/api/v2/oauth/authorize?client_id=4254&response_type=token') // Change redirect_url to miru://auth
    supportNotify()
  }

  function confirmMAL () {
    const state = generateRandomString(10)
    const challenge = generateRandomString(50)
    sessionStorage.setItem(state, challenge)
    IPC.emit('open', `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientID}&state=${state}&code_challenge=${challenge}&code_challenge_method=plain`) // Change redirect_url to miru://malauth
    supportNotify()
  }

  function supportNotify() {
    if (platformMap[window.version.platform] === 'Linux') {
        toast('Support Notification', {
        description: "If your linux distribution doesn't support custom protocol handlers, you can simply paste the full URL into the app.",
        duration: 300000
      })
    }
  }

  function generateRandomString(length) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }
</script>

<script>
  let modal
  function close () {
    $login = false
  }
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  $: $login && modal?.focus()
</script>

<div class='modal z-101' class:show={$login}>
  {#if $login}
    <div class='modal-dialog' on:pointerup|self={close} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
      <div class='modal-content d-flex justify-content-center flex-column'>
        <button class='close pointer z-30 top-20 right-0 position-absolute' type='button' use:click={close}> &times; </button>
        <h5 class='modal-title'>Log In</h5>
        <div class='modal-buttons d-flex flex-column align-items-center'>
          <div class='modal-button mb-10 d-flex justify-content-center flex-row'>
            <img src='./anilist_logo.png' class='al-logo position-absolute rounded pointer-events-none' alt='logo' />
            <button class='btn anilist w-150' type='button' on:click={confirmAnilist}></button>
          </div>
          <div class='modal-button d-flex justify-content-center flex-row'>
            <img src='./myanimelist_logo.png' class='mal-logo position-absolute rounded pointer-events-none' alt='logo' />
            <button class='btn myanimelist w-150' type='button' on:click={confirmMAL}></button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .close {
    top: 4rem !important;
    left: unset !important;
    right: 2.5rem !important;
  }

  .mal-logo {
    height: 2rem;
    margin-top: 0.8rem;
  }
  .al-logo {
    height: 1.6rem;
    margin-top: 0.82rem;
  }

  .anilist {
    background-color: #283342 !important;
  }
  .myanimelist {
    background-color: #2C51A2 !important;
  }
  .anilist:hover {
    background-color: #46536c !important;
  }
  .myanimelist:hover {
    background-color: #2861d6 !important;
  }
</style>
