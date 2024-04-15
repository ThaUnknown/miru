<script context='module'>
  import { click } from '@/modules/click.js'
  import { writable } from 'simple-store-svelte'

  export const logout = writable(false)

  function confirm () {
    localStorage.removeItem('ALviewer')
    location.hash = ''
    location.reload()
  }
</script>

<script>
  let modal
  function close () {
    $logout = false
  }
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  $: $logout && modal?.focus()
</script>

<div class='modal z-40' class:show={$logout}>
  {#if $logout}
    <div class='modal-dialog' on:pointerup|self={close} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
      <div class='modal-content d-flex justify-content-center flex-column'>
        <button class='close pointer z-30 top-20 right-0 position-absolute' type='button' use:click={close}> &times; </button>
        <h5 class='modal-title'>Log Out</h5>
        <p>
          Are You Sure You Want To Sign Out?
        </p>
        <div class='text-right mt-20'>
          <button class='btn mr-5' type='button' on:click={close}>Cancel</button>
          <button class='btn btn-danger' type='button' on:click={confirm}>Sign Out</button>
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
</style>
