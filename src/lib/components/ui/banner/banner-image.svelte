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
    {#key $bannerSrc.id}
      <Banner media={$bannerSrc} class='min-w-[100vw] w-screen h-[23rem] object-cover {$hideBanner ? 'opacity-10' : 'opacity-100'} transition-opacity duration-500 banner-gr relative' />
    {/key}
  </div>
{/if}

<style>
  :global(div.banner-gr::after) {
    content: '';
    position: absolute;
    left: 0 ; bottom: 0;
    width: 100%;
    height: 300px;
    background: linear-gradient(1turn, rgb(3, 3, 3) 8.98%, rgba(0, 0, 0, 0) 100%);
  }
  .banner::after {
    content: '';
    position: absolute;
    left: 0 ; top: 0;
    width: 100%; height: 23rem;
    z-index: 0;
    background: rgba(0, 0, 0, .4);
  }
</style>
