<script>
  import Home from './views/Home/Home.svelte'
  import MediaHandler from './views/Player/MediaHandler.svelte'
  import Settings from './views/Settings.svelte'
  import WatchTogether from './views/WatchTogether/WatchTogether.svelte'
  import Miniplayer from 'svelte-miniplayer'
  import Search from './views/Search.svelte'
  import AiringSchedule from './views/AiringSchedule.svelte'

  export let page = 'home'
</script>

<div class='wrapper h-full position-absolute overflow-hidden pointer-events-none'>
  <Miniplayer active={page !== 'player'} class='bg-dark-light z-10 pointer-events-auto {page === 'player' ? 'h-full' : ''}' minwidth='35rem' maxwidth='60rem' width='300px' padding='2rem'>
    <MediaHandler miniplayer={page !== 'player'} bind:page />
  </Miniplayer>
</div>
{#if page === 'settings'}
  <Settings />
{:else if page === 'home'}
  <Home />
{:else if page === 'search'}
  <Search />
{:else if page === 'schedule'}
  <AiringSchedule />
{:else if page === 'watchtogether'}
  <WatchTogether />
{/if}

<style>
  .wrapper {
    width: calc(100% - var(--sidebar-minimised));
  }
  :global(:fullscreen) .wrapper {
    width: 100%;
  }
</style>
