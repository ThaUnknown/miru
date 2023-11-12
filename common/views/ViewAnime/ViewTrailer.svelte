<script>
  import { getContext } from 'svelte'
  import { click } from '@/modules/click.js'

  const url = getContext('trailer')

  let modal
  function close () {
    $url = null
  }
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  $: $url && modal?.focus()
</script>

<div class='modal z-40'>
  {#if $url}
    <div class='modal-dialog' on:pointerup|self={close} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
      <div class='modal-content w-three-quarter h-full bg-transparent d-flex justify-content-center flex-column'>
        <button class='close pointer z-30 top-20 right-0 position-absolute' type='button' use:click={close}> &times; </button>
        <div class='trailer w-full position-relative'>
          <iframe
            id='trailerVideo'
            src={'https://www.youtube.com/embed/' + $url}
            frameborder='0'
            title='trailer'
            allowfullscreen
            class='w-full h-full position-absolute rounded top-0 left-0' />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .trailer {
    padding-bottom: 56.25%;
  }
  .close {
    top: 4rem !important;
    left: unset !important;
    right: 2.5rem !important;
  }
</style>
