<script lang='ts'>
  import Lock from 'lucide-svelte/icons/lock'
  import Shield from 'lucide-svelte/icons/shield'
  import Wifi from 'lucide-svelte/icons/wifi'
  import WifiOff from 'lucide-svelte/icons/wifi-off'

  import { Badge } from '$lib/components/ui/badge'
  import * as Tooltip from '$lib/components/ui/tooltip'

  export let value: Array<'incoming' | 'outgoing' | 'utp' | 'encrypted'>

  const badgeVariants: Record<typeof value[number], string> = {
    incoming: 'text-green-500',
    outgoing: 'text-blue-500',
    utp: 'text-purple-500',
    encrypted: 'text-yellow-500'
  }
  const labels: Record<typeof value[number], string> = {
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    utp: 'uTP',
    encrypted: 'Encrypted'
  }
</script>

<div class='flex gap-x-2'>
  {#each value as flag (flag)}
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Badge variant='secondary' class='p-1 {badgeVariants[flag]}'>
          {#if flag === 'incoming'}
            <Wifi class='size-3' />
          {:else if flag === 'outgoing'}
            <WifiOff class='size-3' />
          {:else if flag === 'utp'}
            <Shield class='size-3' />
          {:else if flag === 'encrypted'}
            <Lock class='size-3' />
          {/if}
        </Badge>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p class='font-semibold'>{labels[flag]}</p>
      </Tooltip.Content>
    </Tooltip.Root>

  {/each}
</div>
