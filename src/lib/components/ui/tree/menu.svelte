<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'

  import { cn } from '$lib/utils'

  type $$Props = HTMLAttributes<HTMLDivElement>

  let className: $$Props['class'] = ''
  export { className as class }
</script>

<div class={cn('relative w-64 bg-black text-popover-foreground rounded-md z-50 border p-1 shadow-md focus:outline-none has-[>[data-open=true]]:bg-black/30', className)} {...$$restProps}>
  <slot />
</div>
