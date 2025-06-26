<script lang='ts' context='module'>
  import { derived } from 'svelte/store'

  import { resolveFilesPoorly } from './resolver'

  import { server } from '$lib/modules/torrent'

  const active = derived(server.active, $active => resolveFilesPoorly($active))
</script>

<script lang='ts'>
  import Mediahandler from './mediahandler.svelte'

  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { isPlaying } from '$lib/modules/idle'
  import { cn } from '$lib/utils'

  $: isMiniplayer = $page.route.id !== '/app/player'

  function openPlayer () {
    goto('/app/player/')
  }

  let wrapper: HTMLDivElement

  let dragging = false

  let bottom = '0px'
  let right = '100%'

  function calculatePosition (e: PointerEvent) {
    if (!isMiniplayer) return
    dragging = true
    bottom = e.offsetY - initialY + 'px'
    right = e.offsetX - initialX + 'px'
  }

  function endHover () {
    if (!isMiniplayer) return
    dragging = false
  }

  let initialX = 0
  let initialY = 0

  function startDragging ({ offsetX, offsetY, pointerId }: PointerEvent) {
    if (!isMiniplayer) return
    initialX = offsetX
    initialY = offsetY

    if (pointerId) wrapper.setPointerCapture(pointerId)
  }
  function endDragging ({ pointerId, clientX, clientY }: PointerEvent) {
    if (!isMiniplayer) return
    if (!dragging) goto('/app/player/')
    const istop = window.innerHeight / 2 - clientY >= 0
    const isleft = window.innerWidth / 2 - clientX >= 0
    bottom = istop ? '-100vb' : '0px'
    right = isleft ? '-100vi' : '100%'
    dragging = false
    if (pointerId) wrapper.releasePointerCapture(pointerId)
  }
</script>

<div class={cn('w-full h-full', isMiniplayer && 'z-[49] absolute top-0 left-0 pointer-events-none cursor-grabbing')}
  bind:this={wrapper}
  on:pointerdown={startDragging}
  on:pointerup|self={endDragging}
  on:pointermove|self={calculatePosition}
  on:pointerleave|self={endHover}>
  <div class={cn(
    'pointer-events-auto w-full',
    isMiniplayer ? 'max-w-80 absolute bottom-0 right-0 rounded-lg overflow-clip miniplayer transition-transform duration-[500ms] ease-[cubic-bezier(0.3,1.5,0.8,1)]' : 'h-full w-full',
    dragging && isMiniplayer && 'dragging',
    !$isPlaying && 'paused hover:paused-show'
  )} style:--top={bottom} style:--left={right}>
    {#if $active}
      {#await $active}
        <div class='w-full flex flex-col gap-2 justify-center items-center bg-black {isMiniplayer ? 'aspect-video' : 'h-full' } text-center text-white' on:click={openPlayer}>
          <div class='border-[3px] rounded-[50%] w-10 h-10 drop-shadow-lg border-transparent border-t-white animate-spin' />
          Loading torrent metadata,<br />
          this might take a minute...
        </div>
      {:then mediaInfo}
        {#if mediaInfo}
          <Mediahandler {mediaInfo} />
        {/if}
      {/await}
    {/if}
  </div>
</div>

<style>
  .paused {
    --padding-right: calc(100% - 2rem);
    --padding-left: calc(-100vi + 2rem);
  }
  .miniplayer {
    transform: translate3d(
      clamp(
        calc(var(--padding-left, -100vi + 100% + 1rem)),
        var(--left),
        var(--padding-right, -1rem)
      ),
      clamp(
        calc(-100vb + 100% + 1rem),
        var(--top),
        -1rem
      ),
      0
    );
  }

  .dragging {
    transform: translate3d(
      clamp(
        calc(-100vi + 10%),
        calc(-100vi + 100% + var(--left)),
        90%
      ),
      clamp(
        calc(-100vb + 10%),
        calc(-100vb + 100% + var(--top)),
        90%
      ),
      0
    ) !important;
  }
</style>
