<script lang='ts'>
  import { Drawer as DrawerPrimitive } from 'vaul-svelte'

  type $$Props = DrawerPrimitive.Props
  export let shouldScaleBackground: $$Props['shouldScaleBackground'] = true
  export let open: $$Props['open'] = false
  export let activeSnapPoint: $$Props['activeSnapPoint'] = null
</script>

<DrawerPrimitive.NestedRoot {shouldScaleBackground} bind:open bind:activeSnapPoint {...$$restProps}>
  <slot />
</DrawerPrimitive.NestedRoot>
