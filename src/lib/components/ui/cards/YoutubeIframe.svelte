<script lang='ts'>
  import { click } from '$lib/modules/navigate'
  import { VolumeX, Volume2 } from 'lucide-svelte'
  import { createEventDispatcher, onDestroy } from 'svelte'

  export let id: string

  const dispatch = createEventDispatcher<{hide: boolean}>()

  function ytMessage (e: MessageEvent) {
    if (e.origin !== 'https://www.youtube-nocookie.com') return
    clearInterval(timeout)
    const json = JSON.parse(e.data as string) as { event: string, info: {videoData: {isPlayable: boolean}, playerState?: number} }
    if (json.event === 'onReady') ytCall('setVolume', '[30]')

    if (json.event === 'initialDelivery' && !json.info.videoData.isPlayable) {
      dispatch('hide', true)
    }

    if (json.event === 'infoDelivery' && json.info.playerState === 1) {
      hide = false
      dispatch('hide', false)
    }
  }

  let muted = true
  function toggleMute () {
    if (muted) {
      ytCall('unMute')
    } else {
      ytCall('mute')
    }
    muted = !muted
  }

  let hide = true

  let frame: HTMLIFrameElement
  function ytCall (action: string, arg: string | null = null) {
    frame.contentWindow?.postMessage('{"event":"command", "func":"' + action + '", "args":' + arg + '}', '*')
  }

  let timeout: ReturnType<typeof setInterval>

  function initFrame () {
    timeout = setInterval(() => {
      frame.contentWindow?.postMessage('{"event":"listening","id":1,"channel":"widget"}', '*')
    }, 100)
    frame.contentWindow?.postMessage('{"event":"listening","id":1,"channel":"widget"}', '*')
  }

  onDestroy(() => {
    clearInterval(timeout)
  })
</script>

<svelte:window on:message={ytMessage} />

<!-- indivious is nice because its faster, but not reliable -->
<!-- <video src={`https://inv.tux.pizza/latest_version?id=${media.trailer.id}&itag=18`}
    class='w-full h-full position-absolute left-0'
    class:d-none={hide}
    playsinline
    preload='none'
    loop
    use:volume
    bind:muted
    on:loadeddata={() => { hide = false }}
    autoplay /> -->

<div class='h-full w-full overflow-clip absolute top-0 rounded-t'>
  <div class='absolute z-10 top-0 right-0 p-3' class:hide use:click={toggleMute}>
    {#if muted}
      <VolumeX size='1rem' fill='currentColor' class='pointer-events-none' />
    {:else}
      <Volume2 size='1rem' fill='currentColor' class='pointer-events-none' />
    {/if}
  </div>
  <iframe
    class='w-full border-0 absolute left-0 h-[calc(100%+100px)] top-1/2 transform-gpu -translate-y-1/2 pointer-events-none'
    class:hide
    title='trailer'
    allow='autoplay'
    allowfullscreen
    bind:this={frame}
    on:load={initFrame}
    src='https://www.youtube-nocookie.com/embed/{id}?enablejsapi=1&autoplay=1&controls=0&mute=1&disablekb=1&loop=1&playlist={id}&cc_lang_pref=ja'
  />
</div>
<div class='h-full w-full overflow-clip absolute top-0 rounded-t blur-2xl saturate-200 -z-10 pointer-events-none'>
  <iframe
    class='w-full border-0 absolute left-0 h-[calc(100%+100px)] top-1/2 transform-gpu -translate-y-1/2'
    class:hide
    title='trailer'
    allow='autoplay'
    allowfullscreen
    src='https://www.youtube-nocookie.com/embed/{id}?autoplay=1&controls=0&mute=1&disablekb=1&loop=1&playlist={id}&cc_lang_pref=ja'
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
