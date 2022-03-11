<script>
  import { getContext } from 'svelte'
  import { TABS } from './Tabs.svelte'

  const tab = {}
  const { registerTab, selectTab, selectedTab } = getContext(TABS)

  registerTab(tab)
</script>

<div class={'pointer border-bottom ' + ($selectedTab === tab ? 'bg-dark-light' : '')} on:click={() => selectTab(tab)}>
  <slot />
</div>
