<script lang='ts'>
  import { Button as ButtonPrimitive } from 'bits-ui'

  import { type Props, buttonVariants } from './index.js'

  import { cn } from '$lib/utils.js'

  type $$Props = Props & { duration?: number, autoStart?: boolean, onclick: () => void, animating?: boolean }

  export let duration = 5000 // timeout duration in ms
  export let autoStart = false
  export let variant: Props['variant'] = 'default'
  export let size: NonNullable<$$Props['size']> = 'xs'
  export let onclick: () => void

  let className: $$Props['class'] = ''
  export { className as class }

  export let animating = false

  function startAnimation () {
    animating = true
  }

  function stopAnimation () {
    animating = false
  }

  if (autoStart) startAnimation()

  function handleAnimationEnd () {
    animating = false
    onclick()
  }
</script>

<ButtonPrimitive.Root
  class={cn(
    buttonVariants({ variant, size, className }),
    'relative overflow-hidden'
  )}
  type='button'
  on:click={stopAnimation}
  on:click={onclick}>
  <slot />
  <div
    class='absolute inset-0 bg-current opacity-20 pointer-events-none'
    class:animate-progress={animating}
    style='animation-duration: {duration}ms;'
    on:animationend={handleAnimationEnd} />
</ButtonPrimitive.Root>

<style>
  @keyframes progressBar {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
  .animate-progress {
    animation: progressBar linear forwards;
  }
</style>
