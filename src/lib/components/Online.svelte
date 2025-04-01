<script lang='ts'>
  import { CloudOff } from 'lucide-svelte'

  import online from '$lib/modules/online.ts'

  let hideFirst = false
  $: if (!$online && !hideFirst) {
    hideFirst = true
  }
</script>

{#if $online && hideFirst}
  <div class='bg-green-600 text-white justify-center items-center flex flex-row online overflow-hidden relative z-40 px-4'>
    Back online
  </div>
{:else if !$online}
  <div class='bg-neutral-950 text-white justify-center items-center flex flex-row top-0 offline overflow-hidden relative z-40 px-4'>
    <CloudOff size={16} class='me-2' />
    Offline
  </div>
{/if}

<style>
  .online {
    animation: hide 300ms forwards 2s;
  }
  @keyframes hide {
    from {
      height: 24px;
    }
    to {
      height: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
  }
  .offline {
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    animation: show 300ms forwards 2s;
  }
  @keyframes show {
    from {
      height: 0;
    }
    to {
      height: 24px;
      padding-top: 2px;
      padding-bottom: 2px;
    }
  }
</style>
