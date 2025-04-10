<script lang='ts'>
  import { activityState, idleState, isPlaying, lockedState } from '$lib/modules/idle'
  import { settings } from '$lib/modules/settings'
  import { sleep } from '$lib/utils'

  let plate: HTMLDivElement
  export let root: HTMLDivElement

  let visibilityState: DocumentVisibilityState

  let isAnimating = false
  let isSpinning = false
  let isFlying = false
  let timeout: number

  // WE LOVE RACE CONDITIONS WOOOO YEAAH MY SANITY

  async function start () {
    if (isAnimating) return
    isAnimating = true
    isFlying = true
    await sleep(800)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!isFlying) return
    isSpinning = true
    isFlying = false
  }

  async function reset () {
    if (!isAnimating) return
    root.style.transform = getComputedStyle(root).transform
    plate.style.transform = getComputedStyle(plate).transform
    isSpinning = isFlying = false
    await sleep(10)
    root.style.transform = plate.style.transform = ''
    await sleep(790)
    isAnimating = isSpinning = isFlying = false
  }

  $: active = $lockedState === 'locked' || visibilityState === 'hidden' || ($idleState === 'active' && $activityState === 'active') || $isPlaying

  function checkIdleState (active: boolean, idleAnimation: 'fancy' | 'fast' | 'off') {
    clearTimeout(timeout)
    if (idleAnimation === 'off' || active) return reset()

    timeout = setTimeout(start, 20_000)
  }

  $: checkIdleState(active, $settings.idleAnimation)
</script>

<svelte:document bind:visibilityState />

<div class='preserve-3d absolute w-full h-full overflow-hidden flip backface-hidden backplate bg-black flex-col justify-center pointer-events-none hidden'
  bind:this={plate}
  class:!flex={isAnimating}
  class:backplate-fly={isFlying}
  class:backplate-spin={isSpinning}>
  {#each Array.from({ length: 5 }) as _, i (i)}
    <div class='flex flex-row w-full font-molot font-bold -rotate-12' style:padding-left='{(4 - i) * 600 - 1000}px'>
      {#each Array.from({ length: 3 }) as _, i (i)}
        <div class='animate-marquee mt-32 leading-[0.8]'>
          <div class='text-[24rem] bg-striped !bg-clip-text text-transparent tracking-wide' class:animate-marquee-bg={$settings.idleAnimation === 'fancy'}>
            HAYASE.06&nbsp;
          </div>
          <div class='flex pl-1'>
            <div class='bg-striped-muted rounded py-2 px-3 mt-1 mb-[2.5px] mr-2 ml-1 text-black flex items-center leading-[0.9]' class:animate-marquee-bg={$settings.idleAnimation === 'fancy'}>
              TORRENTING<br />MADE<br />SIMPLE
            </div>
            <div class='text-[5.44rem] bg-striped-muted !bg-clip-text text-transparent tracking-wider' class:animate-marquee-bg={$settings.idleAnimation === 'fancy'}>
              MAGNET://SIMPLICITY TOPS EVERYTHING
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .backplate {
    transition: transform 0.5s;
    transform: perspective(100vw) translate3d(0, 0, 0vw) rotateY(180deg) rotateX(0deg);
  }
</style>
