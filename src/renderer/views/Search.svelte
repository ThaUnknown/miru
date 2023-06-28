<script context='module'>
  import { writable } from 'simple-store-svelte'
  import Sections from '@/modules/sections.js'

  export const search = writable({})

  let items = []
</script>

<script>
  import Search, { searchCleanup } from '../components/Search.svelte'
  import Card from '../components/cards/Card.svelte'
  import smoothScroll from '@/modules/scroll.js'

  const fallbackLoad = Sections.createFallbackLoad()

  const load = $search.load || fallbackLoad
  items = load(1, 50, searchCleanup($search))
</script>

<Search bind:search={$search} />

<div class='h-full w-full overflow-y-scroll d-flex flex-wrap flex-row root overflow-x-hidden px-20 justify-content-center' use:smoothScroll>
  {#each items as card}
    <Card {card} />
  {/each}
</div>
