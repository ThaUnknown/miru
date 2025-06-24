<script lang='ts'>
  import Download from 'lucide-svelte/icons/download'
  import Upload from 'lucide-svelte/icons/upload'

  import { fastPrettyBits } from '$lib/utils'

  export let value: number
  export let type: 'upload' | 'download'
</script>

<div class='flex gap-x-2 items-center'>
  {#if type === 'download'}
    <Download class='size-3 text-green-500 mr-0.5' />
  {:else}
    <Upload class='size-3 text-blue-500 mr-0.5' />
  {/if}
  {fastPrettyBits(value * 8) + '/s'}
</div>
