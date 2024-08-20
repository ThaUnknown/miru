<script context='module'>
  import { writable } from 'simple-store-svelte'
  import SectionsManager from '@/modules/sections.js'

  export const search = writable({})

  const items = writable([])
  export const key = writable({})
</script>

<script>
  import Search, { searchCleanup } from '../components/Search.svelte'
  import Card from '../components/cards/Card.svelte'
  import { hasNextPage } from '@/modules/sections.js'
  import smoothScroll from '@/modules/scroll.js'
  import { debounce } from '@/modules/util.js'
  import { onDestroy, onMount } from 'svelte'
  import ErrorCard from '@/components/cards/ErrorCard.svelte'

  let page = 0
  items.value = []
  let container = null

  function loadSearchData () {
    const load = $search.load || SectionsManager.createFallbackLoad()
    const nextData = load(++page, undefined, searchCleanup($search))
    $items = [...$items, ...nextData]
    return nextData[nextData.length - 1].data
  }
  const update = debounce(() => {
    $key = {}
  }, 300)

  $: loadTillFull($key)

  let canScroll = true

  async function loadTillFull (_key) {
    if (!container) return
    const cachedKey = $key
    canScroll = false
    page = 0
    items.value = []
    hasNextPage.value = true
    await loadSearchData()
    // eslint-disable-next-line no-unmodified-loop-condition
    while (hasNextPage.value && container && cachedKey === $key && container.scrollHeight <= container.clientHeight) {
      canScroll = false
      await loadSearchData()
    }
    canScroll = true
  }

  async function infiniteScroll () {
    if (canScroll && $hasNextPage && this.scrollTop + this.clientHeight > this.scrollHeight - 800) {
      canScroll = false
      await loadSearchData()
      canScroll = true
    }
  }
  onDestroy(() => {
    if ($search.clearNext || $search.disableSearch) $search = {}
  })
  onMount(loadTillFull)
</script>

<div class='bg-dark h-full w-full overflow-y-scroll d-flex flex-wrap flex-row root overflow-x-hidden justify-content-center align-content-start' use:smoothScroll bind:this={container} on:scroll={infiniteScroll}>
  <Search bind:search={$search} on:input={update} />
  <div class='w-full d-grid d-md-flex flex-wrap flex-row px-md-50 justify-content-center align-content-start'>
    {#key $key}
      {#each $items as card}
        <Card {card} />
      {/each}
      {#if $items?.length}
        <ErrorCard promise={$items[0].data} />
      {/if}
    {/key}
  </div>
</div>

<style>
  .d-grid:has(.item.small-card) {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)) !important
  }
  .d-grid:has(.card.full-card) {
    grid-template-columns: repeat(auto-fill, minmax(52rem, 1fr)) !important
  }
  .d-grid {
    grid-template-columns: repeat(auto-fill, minmax(36rem, 1fr))
  }
  @media (min-width: 769px) {
    .d-grid :global(.item.small-card) {
      width: 19rem !important;
    }
  }
</style>
