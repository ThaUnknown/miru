<script>
  import { getContext } from 'svelte'
  const url = getContext('trailer')

  function close() {
    $url = null
  }
  function checkClose({ keyCode }) {
    if (keyCode == 27) close()
  }
</script>

<div class="modal" class:show={$url} on:keydown={checkClose}>
  {#if $url}
    <div class="modal-dialog" role="document">
      <div class="modal-content w-three-quarter h-full bg-transparent d-flex justify-content-center flex-column">
        <button class="d-flex justify-content-center align-items-center close pointer z-30 bg-dark shadow-lg border top-20 right-0" type="button" on:click={close}>
          <span>×</span>
        </button>
        <div class="trailer w-full position-relative">
          <iframe
            id="trailerVideo"
            src={'https://www.youtube.com/embed/' + $url}
            frameborder="0"
            title="trailer"
            allowfullscreen="allowfullscreen"
            class="w-full h-full position-absolute rounded top-0 left-0" />
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
    left: unset;
    right: 2.5rem !important;
  }
</style>
