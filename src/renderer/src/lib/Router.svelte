<script>
  import Home from './pages/home/Home.svelte'
  import Player from './pages/Player.svelte'
  import Settings from './pages/Settings.svelte'
  import Schedule from './pages/Schedule.svelte'
  import { client } from '@/modules/torrent.js'
  export let page = 'home'
  let files = []
  client.on('torrent', torrent => {
    console.log('hash', torrent.infoHash)
    files = torrent.files
  })
</script>

<div class="overflow-y-hidden content-wrapper">
  <Player {files} miniplayer={page !=='player'} bind:page />
  {#if page === 'schedule'}
    <Schedule />
  {:else if page === 'settings'}
    <Settings />
  {:else if page === 'home'}
    <Home />
  {/if}
</div>

<style>
  .content-wrapper{
    will-change: width;
  }
  :global(.nav-hidden) > .content-wrapper {
    left: 0 !important;
    width: 100% !important;
  }
</style>
