<script lang='ts'>
  import { Separator as SeparatorPrimitive } from 'bits-ui'

  import { cn } from '$lib/utils.js'

  type $$Props = SeparatorPrimitive.Props

  let className: $$Props['class'] = ''
  export let orientation: $$Props['orientation'] = 'horizontal'
  export let decorative: $$Props['decorative']
  export { className as class }
</script>

<SeparatorPrimitive.Root
  class={cn(
    'bg-border shrink-0',
    orientation === 'horizontal' ? 'h-[1px] w-full' : 'min-h-full w-[1px]',
    className
  )}
  {orientation}
  {decorative}
  {...$$restProps}
/>
