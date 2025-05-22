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
  let showBackplate = false
  let timeout: number

  // WE LOVE RACE CONDITIONS WOOOO YEAAH MY SANITY

  async function start () {
    if (isAnimating) return
    isAnimating = true
    isFlying = true
    await sleep(800)
    if (!isFlying) return
    showBackplate = true
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
    await sleep(490)
    isAnimating = showBackplate = isSpinning = isFlying = false
  }

  $: active = $lockedState === 'locked' || visibilityState === 'hidden' || ($idleState === 'active' && $activityState === 'active') || $isPlaying

  function checkIdleState (active: boolean, idleAnimation: boolean) {
    clearTimeout(timeout)
    if (!idleAnimation || active) return reset()

    timeout = setTimeout(start, 120_000)
  }

  $: checkIdleState(active, $settings.idleAnimation)
</script>

<svelte:document bind:visibilityState />

<div class='preserve-3d absolute w-full h-full overflow-clip flip backface-hidden backplate bg-black flex-col justify-center pointer-events-none hidden'
  bind:this={plate}
  class:!flex={showBackplate}
  class:backplate-fly={isFlying}
  class:backplate-spin={isSpinning}>
  {#each Array.from({ length: 6 }) as _, i (i)}
    <div class='flex flex-row w-full font-molot font-bold leading-[0.8] ml-[--ml-offset] -rotate-12 text-white mt-64' style:--ml-offset='calc((-1 * {(i) * 600}px) - 10vw)'>
      {#each Array.from({ length: 4 }) as _, i (i)}
        <div>
          <div class='bg-striped'>
            <div class='text-[24rem] tracking-wide animate-marquee bg-black mix-blend-multiply'>
              HAYASE.06&nbsp;
            </div>
          </div>
          <div class='bg-striped-muted'>
            <div class='flex pl-1 animate-marquee bg-black mix-blend-multiply'>
              <div class='rounded py-2 px-3 mt-1 mb-[2.5px] mr-2 ml-1 text-black bg-white flex items-center leading-[0.9]'>
                TORRENTING<br />MADE<br />SIMPLE
              </div>
              <div class='text-[5.44rem] bg-striped-muted tracking-wider'>
                MAGNET://SIMPLICITY TOPS EVERYTHING
              </div>
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
