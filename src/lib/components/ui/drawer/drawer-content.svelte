<script lang='ts'>
  import { Drawer as DrawerPrimitive } from 'vaul-svelte'

  import DrawerOverlay from './drawer-overlay.svelte'

  import { cn } from '$lib/utils.js'

  type $$Props = DrawerPrimitive.ContentProps

  let className: $$Props['class'] = undefined
  export { className as class }
</script>

<DrawerPrimitive.Portal>
  <DrawerOverlay />
  <DrawerPrimitive.Content
    class={cn(
      'bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col border-b border-b-background shadow-2xl border-t-neutral-700/60 border-t-4 bg-clip-padding',
      className
    )}
    {...$$restProps}>
    <slot />
  </DrawerPrimitive.Content>
</DrawerPrimitive.Portal>
