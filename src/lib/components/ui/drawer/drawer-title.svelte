<script lang='ts'>
  import { Drawer as DrawerPrimitive } from 'vaul-svelte'

  import { cn } from '$lib/utils.js'

  type $$Props = DrawerPrimitive.TitleProps

  export let el: $$Props['el']
  let className: $$Props['class'] = ''
  export { className as class }
</script>

<DrawerPrimitive.Title
  bind:el
  class={cn('text-lg font-semibold leading-none tracking-tight', className)}
  {...$$restProps}
>
  <slot />
</DrawerPrimitive.Title>
