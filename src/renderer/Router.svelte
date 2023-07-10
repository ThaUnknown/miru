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

<Miniplayer active={page !== 'player'} class='bg-dark-light z-10 {page === 'player' ? 'h-full' : ''}' minwidth='35rem' maxwidth='45rem' width='300px' padding='2rem'>
  <MediaHandler miniplayer={page !== 'player'} bind:page />
</Miniplayer>
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
