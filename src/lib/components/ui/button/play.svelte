<script lang='ts'>
  import { Play } from 'lucide-svelte'
  import { Button, iconSizes, type Props } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'
  import { list, progress } from '$lib/modules/auth'
  import type { Media } from '$lib/modules/anilist'
  import { clickwrap, keywrap } from '$lib/modules/navigate'
  import { searchStore } from '$lib/components/SearchModal.svelte'

  type $$Props = Props & { media: Media }

  let className: $$Props['class'] = ''
  export { className as class }
  export let media: Media
  export let size: NonNullable<$$Props['size']> = 'xs'
  function play () {
    const episode = progress(media) ?? 1
    // TODO: set rewatch state
    searchStore.set({ media, episode })
  }
</script>

<Button class={cn(className, 'font-bold flex items-center justify-center')} {size} on:click={clickwrap(play)} on:keydown={keywrap(play)}>
  <Play fill='currentColor' class='mr-2' size={iconSizes[size]} />
  {@const status = list(media)}
  {#if status === 'COMPLETED'}
    Rewatch Now
  {:else if status === 'CURRENT' || status === 'REPEATING' || status === 'PAUSED'}
    Continue
  {:else}
    Watch Now
  {/if}
</Button>
