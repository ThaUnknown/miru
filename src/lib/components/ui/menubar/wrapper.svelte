<script lang='ts'>
  import { highEntropyValues } from '$lib/utils'
</script>

{#if highEntropyValues}
  {#await highEntropyValues then { platform }}
    <slot {platform} />
  {:catch e}
    <slot platform='' />
  {/await}
{:else}
  <slot platform='' />
{/if}
