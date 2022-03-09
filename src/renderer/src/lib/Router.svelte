<script>
  import Home from './pages/home/Home.svelte'
  import Player from './pages/Player.svelte'
  import Settings from './pages/Settings.svelte'
  import Schedule from './pages/Schedule.svelte'
  export let page = 'home'
</script>

<div class="overflow-y-hidden content-wrapper">
  {#if page === 'player'}
    <Player />
  {:else if page === 'schedule'}
    <Schedule />
  {:else if page === 'settings'}
    <Settings />
  {:else}
    <Home />
  {/if}
</div>

<style>
  :global(.nav-hidden) > .content-wrapper {
    left: 0 !important;
    width: 100% !important;
  }
</style>
