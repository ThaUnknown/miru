<script lang='ts'>
  import { Avatar as AvatarPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils.js'

  type $$Props = AvatarPrimitive.ImageProps

  let className: $$Props['class']
  export let src: $$Props['src']
  export let alt: $$Props['alt']
  export { className as class }
</script>

<AvatarPrimitive.Image
  {src}
  {alt}
  class={cn('aspect-square h-full w-full', className)}
  {...$$restProps}
/>
