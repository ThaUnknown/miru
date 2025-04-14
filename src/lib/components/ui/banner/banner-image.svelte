<script lang='ts' context='module'>
  import { writable } from 'simple-store-svelte'

  import type { Media } from '$lib/modules/anilist'

  import { cn } from '$lib/utils'

  export const bannerSrc = writable<Media | null>(null)

  export const hideBanner = writable(false)
</script>

<script lang='ts'>
  import { Banner } from '../img'

  import type { HTMLAttributes } from 'svelte/elements'

  type $$Props = HTMLAttributes<HTMLImageElement>

  let className: $$Props['class'] = ''
  export { className as class } // TODO: needs nice animations, should update to coverimage on mobile width
</script>

{#if $bannerSrc}
  <div class={cn('object-cover w-screen absolute top-0 left-0 h-full overflow-hidden pointer-events-none bg-black banner', className)}>
    {#key $bannerSrc}
      <Banner media={$bannerSrc} class='min-w-[100vw] w-screen h-[30rem] object-cover {$hideBanner ? 'opacity-35' : 'opacity-100'} transition-opacity duration-500 banner-gr relative' />
    {/key}
  </div>
{/if}

<style>
  :global(.banner-gr::after) {
    content: '';
    position: absolute;
    left: 0 ; bottom: 0;
    /* when clicking, translate fucks up the position, and video might leak down 1 or 2 pixels, stickig under the gradient, look bad */
    width: 100%; height: 100% ;
    background: linear-gradient(#0000, #0008, #000);
  }
</style>
