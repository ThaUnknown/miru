<script lang='ts'>
  import { onMount, tick } from 'svelte'

  import { resolveFilesPoorly } from './resolver'
  import Mediahandler from './mediahandler.svelte'

  import { Player } from '$lib/components/ui/player'
  import { hideBanner } from '$lib/components/ui/banner'
  import { server } from '$lib/modules/torrent'

  onMount(async () => {
    await tick()
    hideBanner.value = true
  })

  const act = server.active

  $: active = resolveFilesPoorly($act)
</script>

<div class='w-full h-full'>
  {#if active}
    {#await active}
      <Player />
    {:then mediaInfo}
      {#if mediaInfo}
        <Mediahandler {mediaInfo} />
      {:else}
        <Player />
      {/if}
    {/await}
  {:else}
    <Player />
  {/if}
</div>

<style>
  .text-webkit-center {
    text-align: -webkit-center;
  }
</style>
