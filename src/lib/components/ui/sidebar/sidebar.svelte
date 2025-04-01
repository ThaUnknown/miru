<script lang='ts'>
  import { Menu, X } from 'lucide-svelte'

  import { Button } from '../button'

  import { isMobile } from '$lib/utils'

  let open = false // 152 x 140
</script>

{#if $isMobile}
  <div class='shrink-0 z-50 bg-black absolute right-4 bottom-4 w-14 h-[52px] flex rounded-md items-end justify-end overflow-clip transition-[width,height]' class:!w-[152px]={open} class:!h-[140px]={open}>
    <div class='p-2 grid grid-cols-3 gap-2 shrink-0'>
      <slot />
      <Button variant='ghost' class='px-2 w-full relative' on:click={() => { open = !open }}>
        {#if open}
          <X size={18} fill='currentColor' />
        {:else}
          <Menu size={18} fill='currentColor' />
        {/if}
      </Button>
    </div>
  </div>
{:else}
  <div class='w-14 p-2 flex flex-col z-10 shrink-0 bg-black gap-2'>
    <slot />
  </div>
{/if}
