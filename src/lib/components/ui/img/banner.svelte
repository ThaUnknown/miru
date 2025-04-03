<script lang='ts'>
  import { Load } from '.'

  import type { HTMLAttributes } from 'svelte/elements'

  import { banner, type Media } from '$lib/modules/anilist'

  export let media: Media

  type $$Props = HTMLAttributes<HTMLImageElement> & { media: Media }

  $: src = banner(media)
  $: isYoutube = src?.startsWith('https://i.ytimg.com/')
  let className: $$Props['class'] = ''
  export { className as class }

  // hq720 or maxresdefault is highest, but default so omitted
  const sizes = ['sddefault', 'hqdefault', 'mqdefault', 'default']
  let sizeAttempt = 0

  function verifyThumbnail (e: Event) {
    if (!isYoutube) return
    const img = e.target as HTMLImageElement
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      img.src = `https://i.ytimg.com/vi/${media.trailer?.id}/${sizes[sizeAttempt++]}.jpg`
    }
  }
</script>

{#if src}
  <Load {src} alt={media.title?.english} class={className} on:load={verifyThumbnail} />
{/if}
