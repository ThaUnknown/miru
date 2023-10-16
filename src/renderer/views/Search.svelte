<script context='module'>
  import { writable } from 'simple-store-svelte'
  import Sections from '@/modules/sections.js'

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

  let page = 0
  items.value = []
  let container = null

  function loadSearchData () {
    const load = $search.load || Sections.createFallbackLoad()
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

<div class='h-full w-full overflow-y-scroll d-flex flex-wrap flex-row root overflow-x-hidden px-50 justify-content-center align-content-start' use:smoothScroll bind:this={container} on:scroll={infiniteScroll}>
  <Search bind:search={$search} on:input={update} />
  {#key $key}
    {#each $items as card}
      <Card {card} />
    {/each}
  {/key}
</div>

<style>
  .px-50 {
    padding-left: 5rem;
    padding-right: 5rem;
  }
</style>
