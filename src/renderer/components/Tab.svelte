<script>
  import { getContext } from 'svelte'
  import { TABS } from './Tabs.svelte'

  const panel = {}
  const { registerPanel, selectedPanel } = getContext(TABS)

  registerPanel(panel)
</script>

{#if $selectedPanel === panel}
  <slot />
{/if}

<style>
  slot {
    margin-bottom: 10px;
    padding: 40px;
    border: 1px solid #dee2e6;
    border-radius: 0 0 .5rem .5rem;
    border-top: 0;
  }
</style>
