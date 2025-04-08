<script lang='ts'>
  import { onMount, tick } from 'svelte'

  import { resolveFilesPoorly } from './resolver'
  import Mediahandler from './mediahandler.svelte'

  import { hideBanner } from '$lib/components/ui/banner'
  import { server } from '$lib/modules/torrent'
  import { page } from '$app/stores'

  onMount(async () => {
    await tick()
    hideBanner.value = true
  })

  const act = server.active

  $: active = resolveFilesPoorly($act)

  $: isMiniplayer = $page.route.id !== '/app/player'
</script>

<div class='w-full {isMiniplayer ? 'z-[100] max-w-80  absolute bottom-4 right-4 rounded-lg overflow-clip' : 'h-full'}'>
  {#if active}
    {#await active}
      <div class='w-full flex justify-center items-center bg-black aspect-video'>
        <div class='border-[3px] rounded-[50%] w-10 h-10 drop-shadow-lg border-transparent border-t-white animate-spin' />
      </div>
    {:then mediaInfo}
      {#if mediaInfo}
        <Mediahandler {mediaInfo} />
      {:else}
        <div class='w-full flex justify-center items-center bg-black aspect-video'>
          <div class='border-[3px] rounded-[50%] w-10 h-10 drop-shadow-lg border-transparent border-t-white animate-spin' />
        </div>
      {/if}
    {/await}
  {:else}
    <div class='w-full flex justify-center items-center bg-black aspect-video'>
      <div class='border-[3px] rounded-[50%] w-10 h-10 drop-shadow-lg border-transparent border-t-white animate-spin' />
    </div>
  {/if}
</div>

<style>
  .text-webkit-center {
    text-align: -webkit-center;
  }
</style>
