<script lang='ts'>
  import { Switch as SwitchPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils.js'

  type $$Props = SwitchPrimitive.Props & {
    hideState?: boolean
  }
  type $$Events = SwitchPrimitive.Events

  let className: $$Props['class']
  export let checked: $$Props['checked']
  export let hideState = false
  export { className as class }
</script>

<span class={cn(className, 'flex space-x-2')}>
  <SwitchPrimitive.Root
    bind:checked
    class={cn(
      'focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-input peer inline-flex h-[16px] w-[32px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...$$restProps}
    on:click
    on:keydown
  >
    <SwitchPrimitive.Thumb
      class={cn(
        'bg-background pointer-events-none block h-3 w-3 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
  {#if !hideState}
    <span class='leading-4 text-xs w-4'>
      {checked ? 'On' : 'Off'}
    </span>
  {/if}
</span>
