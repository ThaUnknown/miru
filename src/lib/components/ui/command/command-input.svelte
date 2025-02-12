<script lang='ts'>
  import { Command as CommandPrimitive } from 'cmdk-sv'
  import MagnifyingGlass from 'svelte-radix/MagnifyingGlass.svelte'
  import { cn } from '$lib/utils.js'

  type $$Props = CommandPrimitive.InputProps

  let className: $$Props['class'] = ''
  export { className as class }
  export let value = ''
</script>

<div class='flex items-center border-b relative' data-cmdk-input-wrapper="">
  <MagnifyingGlass class='mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-3' />
  <CommandPrimitive.Input
    class={cn(
      'placeholder:text-muted-foreground flex h-10 w-full rounded-sm bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 pl-9 pr-3 overflow-hidden ![border-image:none]',
      className
    )}
    {...$$restProps}
    bind:value
  />
</div>
