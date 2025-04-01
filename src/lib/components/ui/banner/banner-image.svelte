<script lang='ts' context='module'>
  import { writable } from 'simple-store-svelte'

  import { safeBanner, type Media } from '$lib/modules/anilist'
  import { cn } from '$lib/utils'

  export const bannerSrc = writable<Media | null>(null)

  export const hideBanner = writable(false)
</script>

<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'

  type $$Props = HTMLAttributes<HTMLImageElement>

  $: src = $bannerSrc && safeBanner($bannerSrc)
  let className: $$Props['class'] = ''
  export { className as class } // TODO: needs nice animations, should update to coverimage on mobile width
</script>

{#await src then src}
  <div class={cn('object-cover w-screen absolute top-0 left-0 h-full overflow-hidden pointer-events-none bg-black', className)}>
    {#if src}
      <div class='min-w-[100vw] w-screen h-[30rem] bg-url bg-center bg-cover opacity-100 transition-opacity duration-500 border-gradient-to-t' style:--bg='url({src})' class:!opacity-45={$hideBanner} />
    {/if}
  </div>
{/await}
