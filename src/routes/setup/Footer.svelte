<script lang='ts' context='module'>
  export interface Checks {
    promise: Promise<{
      status: 'warning' | 'success' | 'error'
      text: string
    }>
    title: string
    pending: string
  }
</script>

<script lang='ts'>
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Check, X } from 'lucide-svelte'
  export let prev = ''
  export let next = ''

  export const checks: Checks[] = [
    { promise: Promise.resolve({ status: 'success', text: '250GB Available' }), title: 'Storage Space', pending: 'Checking available storage space...' },
    { promise: Promise.resolve({ status: 'warning', text: '5GB Available' }), title: 'Storage Space', pending: 'Checking available storage space...' },
    { promise: Promise.resolve({ status: 'error', text: '1GB Available' }), title: 'Storage Space', pending: 'Checking available storage space...' },
    { promise: new Promise(_ => _), title: 'Storage Space', pending: 'Checking available storage space...' }
  ]
</script>

<div class='px-6 mt-auto w-full lg:max-w-4xl'>
  <div class='border-x border-t w-full rounded-t-lg bg-neutral-950 p-4 gap-3 flex flex-col'>
    {#each checks as { promise, title, pending } (promise)}
      <div class='flex items-center leading-none text-sm'>
        {#await promise}
          <div class='w-4 h-4 relative animate-spin mr-2.5'>
            <div class='w-4 h-4 border-2 rounded-[50%] border-neutral-700 border-b-border' />
          </div>
          {title} -&nbsp;<span class='text-muted-foreground text-xs'>{pending}</span>
        {:then { status, text }}
          <Badge variant={status} class='w-4 h-4 rounded-[50%] p-[3px] justify-center items-center mr-2.5'>
            {#if status === 'success'}
              <Check strokeWidth='4px' />
            {:else if status === 'warning'}
              <svg xmlns='http://www.w3.org/2000/svg' width='2' height='7' viewBox='0 0 2 7' fill='none'>
                <path d='M1 6V3.5' stroke='black' stroke-width='1.5' stroke-linecap='round' />
                <path d='M1.00098 1H1.00848' stroke='black' stroke-width='1.5' stroke-linecap='round' />
              </svg>
            {:else}
              <X strokeWidth='4px' />
            {/if}
          </Badge>
          {title} -&nbsp;<span class='text-muted-foreground text-xs'>{text}</span>
        {/await}
      </div>
    {/each}

  </div>
</div>
<div class='flex flex-row items-center justify-between w-full bg-neutral-950 border-t border-border py-4 px-8'>
  <Button variant='secondary' class='w-24' href='../{prev}'>Prev</Button>
  <Button class='font-semibold w-24' href='../{next}'>Next</Button>
</div>
