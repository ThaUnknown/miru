<script lang='ts'>
  import Bookmark from 'lucide-svelte/icons/bookmark'

  import type { Media } from '$lib/modules/anilist'

  import { Button, iconSizes, type Props } from '$lib/components/ui/button'
  import { list, authAggregator, lists } from '$lib/modules/auth'
  import { clickwrap, keywrap } from '$lib/modules/navigate'

  type $$Props = Props & { media: Media }

  let className: $$Props['class'] = ''
  export { className as class }
  export let media: Media

  export let size: NonNullable<$$Props['size']> = 'icon-sm'
  export let variant: NonNullable<$$Props['variant']> = 'ghost'

  async function toggleBookmark () {
    if (!list(media)) {
      await authAggregator.entry({ id: media.id, status: 'PLANNING', lists: lists(media)?.filter(({ enabled }) => enabled).map(({ name }) => name) })
    } else {
      await authAggregator.delete(media)
    }
    ++key
  }
  let key = 1
</script>

<Button {size} {variant} class={className} on:click={clickwrap(toggleBookmark)} on:keydown={keywrap(toggleBookmark)}>
  <Bookmark fill={key && list(media) ? 'currentColor' : 'transparent'} size={iconSizes[size]} />
</Button>
