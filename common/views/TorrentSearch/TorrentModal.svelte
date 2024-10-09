<script context='module'>
  import { findInCurrent } from '../Player/MediaHandler.svelte'
  import { writable } from 'simple-store-svelte'

  export const rss = writable(null)

  export function playAnime (media, episode = 1, force) {
    episode = Number(episode)
    episode = isNaN(episode) ? 1 : episode
    if (!force && findInCurrent({ media, episode })) {
      window.dispatchEvent(new Event('overlay-check'))
      return
    }
    rss.set({ media, episode })
  }
</script>

<script>
  import TorrentMenu from './TorrentMenu.svelte'

  export let overlay

  function close () {
    overlay = 'none'
    $rss = null
  }
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }

  let modal

  $: search = $rss

  $: {
    if (search) {
      overlay = 'torrent'
      modal?.focus()
    }
  }

  window.addEventListener('overlay-check', () => {
    if (search) {
      close()
    }
  })
</script>

<div class='modal z-50' class:show={search} id='viewAnime'>
  {#if search}
    <div class='modal-dialog d-flex align-items-center px-md-15 pt-md-20' on:pointerup|self={close} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
      <div class='modal-content m-0 mw-full h-full rounded overflow-hidden bg-very-dark d-flex flex-column overflow-y-scroll pt-0 px-0'>
        <TorrentMenu {search} {close} />
      </div>
    </div>
  {/if}
</div>

<style>
  .modal-content {
    width: 115rem;
  }
</style>
