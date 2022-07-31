<script>
import { getContext } from 'svelte'
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

<div class='modal' class:show={$url} on:keydown={checkClose} tabindex='-1' bind:this={modal}>
  {#if $url}
    <div class='modal-dialog' role='document' on:click|self={close}>
      <div class='modal-content w-three-quarter h-full bg-transparent d-flex justify-content-center flex-column'>
        <button class='close pointer z-30 bg-dark shadow-lg top-20 right-0' type='button' on:click={close}>
          ×
        </button>
        <div class='trailer w-full position-relative'>
          <iframe
            id='trailerVideo'
            src={'https://www.youtube.com/embed/' + $url}
            frameborder='0'
            title='trailer'
            allowfullscreen='allowfullscreen'
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
    top: 1rem !important;
    left: unset !important;
    right: 2.5rem !important;
  }
</style>
