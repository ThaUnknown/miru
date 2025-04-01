<script lang='ts'>
  import { Dialog as SheetPrimitive } from 'bits-ui'
  import { fade } from 'svelte/transition'

  import { cn } from '$lib/utils.js'

  type $$Props = SheetPrimitive.OverlayProps

  let className: $$Props['class']
  export { className as class }
  export let transition: $$Props['transition'] = fade
  export let transitionConfig: $$Props['transitionConfig'] = {
    duration: 150
  }
</script>

<SheetPrimitive.Overlay
  {transition}
  {transitionConfig}
  class={cn('custom-bg absolute inset-0 z-50 backdrop-blur-sm', className)}
  {...$$restProps}
/>
