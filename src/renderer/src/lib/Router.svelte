<script>
import { getContext } from 'svelte'
import Home from './Home/Home.svelte'
import MediaHandler from './Player/MediaHandler.svelte'
import Settings from './Settings.svelte'
import WatchTogether from './WatchTogether/WatchTogether.svelte'
import Miniplayer from 'svelte-miniplayer'
export let page = 'home'
const current = getContext('gallery')
</script>

<div class='overflow-hidden content-wrapper'>
  <Miniplayer active={page !== 'player'} class='bg-dark z-10 {page === 'player' ? 'h-full' : ''}' minwidth='35rem' maxwidth='45rem' width='300px' padding='2rem'>
    <MediaHandler miniplayer={page !== 'player'} bind:page />
  </Miniplayer>
  {#if page === 'settings'}
    <Settings />
  {:else if page === 'home'}
    <Home bind:current={$current} />
  {:else if page === 'watchtogether'}
    <WatchTogether />
  {/if}
</div>

<style>
  .content-wrapper {
    will-change: width;
    top: 0 !important;
  }
  :global(.nav-hidden) > .content-wrapper {
    left: 0 !important;
    width: 100% !important;
  }
</style>
