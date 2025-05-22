<script lang='ts'>
  import type { HTMLImgAttributes } from 'svelte/elements'

  import { cn } from '$lib/utils'

  type $$Props = HTMLImgAttributes & { color?: string | null | undefined }

  export let src: $$Props['src'] = ''
  export let alt: $$Props['alt'] = ''
  let className: $$Props['class'] = ''
  export { className as class }

  export let color: string | null | undefined = 'transparent'

  let loaded = false

  async function test (e: Event & { currentTarget: EventTarget & Element }) {
    const target = e.currentTarget as HTMLImageElement
    await target.decode()
    loaded = true
  }

</script>

<div style:background={color ?? '#1890ff'} class={className}>
  <img {src} {alt} on:load on:load={test} class={cn(className, 'transition-opacity opacity-0 duration-300 ease-out')} class:!opacity-100={loaded} decoding='async' loading='lazy' style:background={color ?? '#1890ff'} />
</div>
