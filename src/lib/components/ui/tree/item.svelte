<script lang='ts'>
  import { ChevronRight } from 'svelte-radix'

  import { getMenuContext, getLevelContext } from './context.ts'

  const { state, setActive, setInactive } = getMenuContext()
  const levelStore = getLevelContext()

  export let id: string = crypto.randomUUID()

  export let active = false
  $: level = $levelStore
  $: isActive = $state[level] === id
  $: showSubmenu = isActive

  $: activeSibling = $state[level]

  $: hasSub = $$slots.trigger

  function handleClick () {
    if (hasSub) {
      isActive ? setInactive(level) : setActive(id, level)
    } else {
      setInactive(level)
    }
  }
</script>

<div class='relative'>
  <button class='w-full hover:bg-accent hover:text-accent-foreground flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none pl-8 cursor-pointer'
    on:click={handleClick}
    on:click
    class:bg-accent={isActive || active} class:text-accent-foreground={isActive || active}
    class:opacity-30={activeSibling}
    data-open={isActive}>
    {#if hasSub}
      <slot name='trigger' />
      <ChevronRight class='ml-auto h-4 w-4' />
    {:else}
      <slot />
    {/if}

  </button>

  {#if showSubmenu && hasSub}
    <slot />
  {/if}
</div>
