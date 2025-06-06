<script lang='ts'>
  import Heart from 'lucide-svelte/icons/heart'

  import type { Media } from '$lib/modules/anilist'

  import { Button, iconSizes, type Props } from '$lib/components/ui/button'
  import { authAggregator, fav } from '$lib/modules/auth'
  import { clickwrap, keywrap } from '$lib/modules/navigate'

  type $$Props = Props & { media: Media }

  let className: $$Props['class'] = ''
  export { className as class }
  export let media: Media
  export let size: NonNullable<$$Props['size']> = 'icon-sm'
  export let variant: NonNullable<$$Props['variant']> = 'ghost'

  let key = 1

  async function toggleFav () {
    await authAggregator.toggleFav(media.id)
    ++key
  }
</script>

<Button {size} {variant} class={className} on:click={clickwrap(toggleFav)} on:keydown={keywrap(toggleFav)} on:click={() => ++key}>
  <Heart fill={key && fav(media) ? 'currentColor' : 'transparent'} size={iconSizes[size]} />
</Button>
