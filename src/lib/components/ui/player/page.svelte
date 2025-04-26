<script lang='ts'>

  import Mediahandler from './mediahandler.svelte'
  import { resolveFilesPoorly } from './resolver'

  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { server } from '$lib/modules/torrent'

  const act = server.active

  $: active = resolveFilesPoorly($act)

  $: isMiniplayer = $page.route.id !== '/app/player'

  function openPlayer () {
    goto('/app/player/')
  }
</script>

<div class='w-full {isMiniplayer ? 'z-[49] max-w-80 absolute bottom-8 left-8 md:left-[unset] md:right-8 rounded-lg overflow-clip shadow shadow-neutral-800' : 'h-full'}'>
  {#if active}
    {#await active}
      <div class='w-full flex justify-center items-center bg-black {isMiniplayer ? 'aspect-video' : 'h-full' } cursor-pointer' on:click={openPlayer}>
        <div class='border-[3px] rounded-[50%] w-10 h-10 drop-shadow-lg border-transparent border-t-white animate-spin' />
      </div>
    {:then mediaInfo}
      {#if mediaInfo}
        <Mediahandler {mediaInfo} />
      {:else}
        <div class='w-full flex justify-center items-center bg-black {isMiniplayer ? 'aspect-video' : 'h-full' } cursor-pointer text-center text-muted' on:click={openPlayer}>
          There's nothing here,<br />how about playing something?
        </div>
      {/if}
    {/await}
  {:else}
    <div class='w-full flex justify-center items-center bg-black {isMiniplayer ? 'aspect-video' : 'h-full' } cursor-pointer text-center text-muted' on:click={openPlayer}>
      There's nothing here,<br />how about playing something?
    </div>
  {/if}
</div>

<style>
  .text-webkit-center {
    text-align: -webkit-center;
  }
</style>
