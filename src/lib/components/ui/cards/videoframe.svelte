<script lang='ts'>
  import Volume2 from 'lucide-svelte/icons/volume-2'
  import VolumeX from 'lucide-svelte/icons/volume-x'
  import { createEventDispatcher } from 'svelte'

  import { click } from '$lib/modules/navigate'

  export let src: string

  const dispatch = createEventDispatcher<{hide: boolean}>()

  let hide = true

  let muted = true
  function toggleMute () {
    muted = !muted
  }

  function load () {
    hide = false
    dispatch('hide', false)
  }
</script>

<div class='h-full w-full overflow-clip absolute top-0 rounded-t'>
  <div class='absolute z-10 top-0 right-0 p-3' class:hide use:click={toggleMute}>
    {#if muted}
      <VolumeX size='1rem' fill='currentColor' class='pointer-events-none' />
    {:else}
      <Volume2 size='1rem' fill='currentColor' class='pointer-events-none' />
    {/if}
  </div>
  <video
    class='w-full border-0 absolute left-0 h-[calc(100%+200px)] top-1/2 transform-gpu -translate-y-1/2 pointer-events-none'
    class:hide
    autoplay
    bind:muted
    loop
    volume={0.2}
    on:loadeddata={load}
    {src}
  />
</div>
<div class='h-full w-full overflow-clip absolute top-0 rounded-t blur-2xl saturate-200 -z-10 pointer-events-none'>
  <video
    class='w-full border-0 absolute left-0 h-[calc(100%+200px)] top-1/2 transform-gpu -translate-y-1/2'
    class:hide
    muted
    autoplay
    loop
    {src}
  />
</div>

<style>
  .absolute {
    transition: opacity 0.3s;
  }
  .absolute.hide {
    opacity: 0;
  }
</style>
