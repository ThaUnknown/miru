<script lang='ts'>
  import { Command as CommandPrimitive } from 'cmdk-sv'

  import { cn } from '$lib/utils.js'

  type $$Props = CommandPrimitive.CommandProps

  export let value: $$Props['value'] = ''

  let className: $$Props['class'] = ''
  export { className as class }
</script>

<CommandPrimitive.Root
  class={cn(
    'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md max-h-[clamp(0px,20rem,60lvh)]',
    className
  )}
  bind:value
  {...$$restProps}
>
  <slot />
</CommandPrimitive.Root>
