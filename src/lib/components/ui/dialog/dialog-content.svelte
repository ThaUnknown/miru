<script lang='ts'>
  import { Dialog as DialogPrimitive } from 'bits-ui'
  import Cross2 from 'svelte-radix/Cross2.svelte'
  import * as Dialog from './index.js'
  import { cn, flyAndScale } from '$lib/utils.js'

  type $$Props = DialogPrimitive.ContentProps

  let className: $$Props['class'] = ''
  export let transition: $$Props['transition'] = flyAndScale
  export let transitionConfig: $$Props['transitionConfig'] = {
    duration: 200
  }
  export { className as class }
</script>

<Dialog.Portal>
  <Dialog.Overlay />
  <DialogPrimitive.Content
    {transition}
    {transitionConfig}
    class={cn(
      'bg-background absolute top-[50%] left-[50%] z-50 grid w-full translate-y-[-50%] translate-x-[-50%] p-6 shadow-2xl border-neutral-700/60 border-y-4 bg-clip-padding',
      className
    )}
    {...$$restProps}
  >
    <slot />
    <DialogPrimitive.Close
      class='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity select:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none'
    >
      <Cross2 class='h-4 w-4' />
      <span class='sr-only'>Close</span>
    </DialogPrimitive.Close>
  </DialogPrimitive.Content>
</Dialog.Portal>
