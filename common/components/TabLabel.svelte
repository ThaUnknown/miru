<script>
  import { getContext } from 'svelte'
  import { TABS } from './Tabs.svelte'
  import { click } from '@/modules/click.js'

  const tab = {}
  const { registerTab, selectTab, selectedTab } = getContext(TABS)

  registerTab(tab)
</script>

<div class={'pointer my-5 rounded ' + ($selectedTab === tab ? 'bg-dark-light font-weight-bold' : '')} use:click={() => selectTab(tab)}>
  <slot />
</div>

<style>
  div {
    transition: background .2s ease-in-out;
  }
</style>
