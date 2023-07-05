<script context='module'>
  import { writable } from 'simple-store-svelte'
  import Sections from '@/modules/sections.js'

  export const search = writable({})

  const items = writable([])
</script>

<script>
  import Search, { searchCleanup } from '../components/Search.svelte'
  import Card from '../components/cards/Card.svelte'
  import smoothScroll from '@/modules/scroll.js'
  import { debounce } from '@/modules/util.js'

  function loadSearchData (search) {
    const load = search.load || Sections.createFallbackLoad()
    $items = load(1, undefined, searchCleanup(search))
  }
  loadSearchData($search)
  const update = debounce(loadSearchData, 150)

// TODO: infinite scrolling
</script>

<div class='h-full w-full overflow-y-scroll d-flex flex-wrap flex-row root overflow-x-hidden px-50 justify-content-center align-content-start' use:smoothScroll>
  <Search bind:search={$search} on:input={() => update($search)} />
  {#each $items as card}
    <Card {card} />
  {/each}
</div>

<style>
  .px-50 {
    padding-left: 5rem;
    padding-right: 5rem;
  }
</style>
