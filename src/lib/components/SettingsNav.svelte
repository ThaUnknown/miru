<script lang='ts'>
  import { cubicInOut } from 'svelte/easing'
  import { crossfade } from 'svelte/transition'

  import { Button } from './ui/button'

  import { cn } from '$lib/utils.js'
  import { page } from '$app/stores'

  let className: string | undefined | null = ''
  export let items: Array<{ href: string, title: string }>
  export { className as class }

  const [send, receive] = crossfade({
    duration: 150,
    easing: cubicInOut
  })

  const key = 'active-settings-tab'
</script>

<nav class={cn('flex flex-col md:flex-row space-x-0 md:space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)}>
  {#each items as { href, title }, i (i)}
    {@const isActive = $page.url.pathname === href}
    <Button {href} variant='ghost' data-sveltekit-noscroll class='relative font-semibold justify-start'>
      {#if isActive}
        <div class='bg-white absolute inset-0 rounded-md' in:send={{ key }} out:receive={{ key }} />
      {/if}
      <div class='relative text-white transition-colors duration-300' class:!text-black={isActive}>
        {title}
      </div>
    </Button>
  {/each}
</nav>
