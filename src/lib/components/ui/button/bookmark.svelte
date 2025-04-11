<script lang='ts'>
  import { Bookmark } from 'lucide-svelte'

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

  function toggleBookmark () {
    if (!media.mediaListEntry?.status) {
      authAggregator.entry({ id: media.id, status: 'PLANNING', lists: lists(media)?.filter(({ enabled }) => enabled).map(({ name }) => name) })
    } else {
      authAggregator.delete(media.mediaListEntry.id)
    }
  }
</script>

<Button {size} {variant} class={className} on:click={clickwrap(toggleBookmark)} on:keydown={keywrap(toggleBookmark)}>
  <Bookmark fill={list(media) ? 'currentColor' : 'transparent'} size={iconSizes[size]} />
</Button>
