<script lang='ts'>
  import Volume from 'lucide-svelte/icons/volume'
  import Volume1 from 'lucide-svelte/icons/volume-1'
  import Volume2 from 'lucide-svelte/icons/volume-2'
  import VolumeOff from 'lucide-svelte/icons/volume-off'
  import VolumeX from 'lucide-svelte/icons/volume-x'

  import { Button } from '$lib/components/ui/button'
  import { keywrap } from '$lib/modules/navigate'

  function clamp (value: number) {
    return Math.min(Math.max(value, 0), 1)
  }

  export let volume: number
  export let muted: boolean
  let seekbar: HTMLDivElement

  let seeking = false

  function calculatePositionProgress ({ pageX, currentTarget }: PointerEvent) {
    const target = currentTarget as HTMLDivElement
    const float = clamp((pageX - target.getBoundingClientRect().left) / target.clientWidth)
    if (seeking) {
      volume = float
    }
  }

  function startSeeking (e: PointerEvent) {
    seeking = true
    calculatePositionProgress(e)

    if (e.pointerId) seekbar.setPointerCapture(e.pointerId)
  }
  function endSeeking ({ pointerId }: PointerEvent) {
    seeking = false
    if (pointerId) seekbar.releasePointerCapture(pointerId)
  }

  function mute () {
    muted = !muted
  }
</script>

<div class='h-full w-full hidden sm:flex flex-row gap-2 group/volume'>
  <Button class='p-3 w-12 h-12' variant='ghost' on:click={mute} on:keydown={keywrap(mute)} id='player-volume-button' data-right='#player-options-button' data-up='#player-seekbar'>
    {#if muted}
      <VolumeOff size='24px' fill='currentColor' />
    {:else if volume === 0}
      <VolumeX size='24px' fill='currentColor' />
    {:else if volume < 0.2}
      <Volume size='24px' fill='currentColor' />
    {:else if volume < 0.7}
      <Volume1 size='24px' fill='currentColor' />
    {:else}
      <Volume2 size='24px' fill='currentColor' />
    {/if}
  </Button>
  <div class='h-full w-24 flex items-center overflow-clip cursor-pointer'
    bind:this={seekbar}
    on:pointerdown={startSeeking}
    on:pointerup={endSeeking}
    on:pointermove={calculatePositionProgress}>
    <div class='w-full h-0.5 overflow-clip rounded-[2px] relative transform-gpu transition-transform -translate-x-full group-select/volume:translate-x-0'>
      <div class='w-full bg-[rgba(217,217,217,0.4)] h-full' />
      <div class='w-full bg-white h-full absolute top-0 left-0 transform-gpu' style:--tw-translate-x='{volume * 100 - 100}%' />
    </div>
  </div>
</div>
