<script>
  import { getContext } from 'svelte'
  import { scale } from 'svelte/transition'
  import { quartOut } from 'svelte/easing'

  const show = getContext('video-modal')

  /**
   * @type {HTMLDivElement}
   */
  let modal
  function close () {
    $show = false
  }
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  $: $show && modal?.focus()
</script>

{#if $show}
  <div class='modal z-40' class:show={$show}>
    <div class='modal-dialog' on:pointerup|self={close} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal} transition:scale={{ duration: 500, opacity: 0.5, start: 0.9, easing: quartOut }}>
      <div class='modal-content w-three-quarter h-full bg-transparent d-flex justify-content-center flex-column'>
        <button class='close pointer z-30 top-20 right-0 position-absolute' type='button' on:click={close}> &times; </button>
        <!-- eslint-disable-next-line svelte/valid-compile -->
        <video src='https://raw.githubusercontent.com/ThaUnknown/miru/master/docs/showcase.mp4' controls class='border rounded overflow-hidden' />
      </div>
    </div>
  </div>
{/if}

<style>
  .close {
    top: 4rem !important;
    left: unset !important;
    right: 4rem !important;
  }
  .modal {
    top: 0 !important
  }
</style>
