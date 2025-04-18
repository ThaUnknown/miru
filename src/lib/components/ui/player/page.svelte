<script lang='ts'>

  import { resolveFilesPoorly } from './resolver'
  import Mediahandler from './mediahandler.svelte'

  import { server } from '$lib/modules/torrent'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  const act = server.active

  $: active = resolveFilesPoorly($act)

  $: isMiniplayer = $page.route.id !== '/app/player'

  function openPlayer () {
    goto('/app/player/')
  }
</script>

<div class='w-full {isMiniplayer ? 'z-[49] max-w-80 absolute bottom-4 left-4 md:left-[unset] md:right-4 rounded-lg overflow-clip' : 'h-full'}'>
  {#if active}
    {#await active}
      <div class='w-full flex justify-center items-center bg-black {isMiniplayer ? 'aspect-video' : 'h-full' } cursor-pointer' on:click={openPlayer}>
        <div class='border-[3px] rounded-[50%] w-10 h-10 drop-shadow-lg border-transparent border-t-white animate-spin' />
      </div>
    {:then mediaInfo}
      {#if mediaInfo}
        <Mediahandler {mediaInfo} />
      {:else}
        <div class='w-full flex justify-center items-center bg-black {isMiniplayer ? 'aspect-video' : 'h-full' } cursor-pointer' on:click={openPlayer} />
      {/if}
    {/await}
  {:else}
    <div class='w-full flex justify-center items-center bg-black {isMiniplayer ? 'aspect-video' : 'h-full' } cursor-pointer' on:click={openPlayer} />
  {/if}
</div>

<style>
  .text-webkit-center {
    text-align: -webkit-center;
  }
</style>
