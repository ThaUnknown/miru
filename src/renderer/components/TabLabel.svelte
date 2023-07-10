<script>
  import { getContext } from 'svelte'
  import { TABS } from './Tabs.svelte'
  import { click } from '@/modules/click.js'

  const tab = {}
  const { registerTab, selectTab, selectedTab } = getContext(TABS)

  registerTab(tab)
</script>

<div class={'pointer border-bottom ' + ($selectedTab === tab ? 'bg-dark-light' : '')} use:click={() => selectTab(tab)}>
  <slot />
</div>
