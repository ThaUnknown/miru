<script lang='ts'>
  import { Drawer as DrawerPrimitive } from 'vaul-svelte'

  import { cn } from '$lib/utils.js'

  type $$Props = DrawerPrimitive.OverlayProps

  export let el: $$Props['el']
  let className: $$Props['class'] = ''
  export { className as class }
</script>

<DrawerPrimitive.Overlay
  bind:el
  class={cn('custom-bg fixed inset-0 z-50 backdrop-blur-sm', className)}
  {...$$restProps}
>
  <slot />
</DrawerPrimitive.Overlay>
