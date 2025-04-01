<script lang='ts'>
  import { Heart } from 'lucide-svelte'

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

  const hasAuth = authAggregator.hasAuth
</script>

<Button {size} {variant} class={className} disabled={!$hasAuth} on:click={clickwrap(() => authAggregator.toggleFav(media.id))} on:keydown={keywrap(() => authAggregator.toggleFav(media.id))}>
  <Heart fill={fav(media) ? 'currentColor' : 'transparent'} size={iconSizes[size]} />
</Button>
