<script context='module'>
  import { writable } from 'simple-store-svelte'
  import Sections from '@/modules/sections.js'

  export const search = writable({})

  const items = writable([])
</script>

<script>
  import Search, { searchCleanup } from '../components/Search.svelte'
  import Card from '../components/cards/Card.svelte'
  import { hasNextPage } from '@/modules/sections.js'
  import smoothScroll from '@/modules/scroll.js'
  import { debounce } from '@/modules/util.js'

  let page = 0
  items.value = []
  hasNextPage.value = true

  let key = {}

  function loadSearchData () {
    const load = $search.load || Sections.createFallbackLoad()
    const nextData = load(++page, undefined, searchCleanup($search))
    $items = [...$items, ...nextData]
    return nextData[nextData.length - 1].data
  }
  const update = debounce(() => {
    page = 0
    items.value = []
    key = {}
    loadSearchData()
  }, 300)

  let canScroll = true

  async function loadTillFull (element) {
    canScroll = false
    while (hasNextPage.value && element.scrollHeight <= element.clientHeight) {
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
  if ($search.clearNext) $search = {}
  if ($search.disableSearch) $search.clearNext = true
</script>

<div class='h-full w-full overflow-y-scroll d-flex flex-wrap flex-row root overflow-x-hidden px-50 justify-content-center align-content-start' use:smoothScroll use:loadTillFull on:scroll={infiniteScroll}>
  <Search bind:search={$search} on:input={update} />
  {#key key}
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
