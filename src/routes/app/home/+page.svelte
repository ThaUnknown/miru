<script lang='ts' context='module'>
  import { derived, type Readable } from 'svelte/store'

  import type { Search } from '$lib/modules/anilist/queries'
  import type { VariablesOf } from 'gql.tada'
  // import type { Readable } from 'simple-store-svelte'

  import { client, currentSeason, currentYear } from '$lib/modules/anilist'
  import { authAggregator } from '$lib/modules/auth'

  interface Section {
    title: string
    variables: VariablesOf<typeof Search>
  }

  const sections: Section[] = [
    { title: 'Popular This Season', variables: { sort: ['POPULARITY_DESC'], season: currentSeason, seasonYear: currentYear } },
    { title: 'Trending Now', variables: { sort: ['TRENDING_DESC'] } },
    { title: 'All Time Popular', variables: { sort: ['POPULARITY_DESC'] } },
    { title: 'Romance', variables: { sort: ['TRENDING_DESC'], genre: ['Romance'] } },
    { title: 'Action', variables: { sort: ['TRENDING_DESC'], genre: ['Action'] } },
    { title: 'Adventure', variables: { sort: ['TRENDING_DESC'], genre: ['Adventure'] } },
    { title: 'Fantasy', variables: { sort: ['TRENDING_DESC'], genre: ['Fantasy'] } }
  ]

  const sectionsQueries = sections.map(({ title, variables }) => {
    const query = client.search(variables, true)
    query.subscribe(() => undefined) // this is hacky as shit, but prevents query from re-running
    return { title, query, variables }
  })

  interface SectionQuery {
    title: string
    query: ReturnType<typeof client.search>
    variables: VariablesOf<typeof Search>
  }

  const sectionQueries = derived<[
    Readable<number[] | null>, Readable<number[] | null>, Readable<number[] | null>], SectionQuery[]
  >([authAggregator.continueIDs, authAggregator.sequelIDs, authAggregator.planningIDs], ([continueIDs, sequelIDs, planningIDs], set) => {
    const sections = [...sectionsQueries]
    const unsub: Array<() => void> = []

    if (planningIDs) {
      const planningQuery = client.search({ ids: planningIDs }, true)
      unsub.push(planningQuery.subscribe(() => undefined))
      sections.unshift({ title: 'Your List', query: planningQuery, variables: { ids: planningIDs } })
    }
    if (sequelIDs) {
      const sequelsQuery = client.search({ ids: sequelIDs, status: ['FINISHED', 'RELEASING'], onList: false }, true)
      unsub.push(sequelsQuery.subscribe(() => undefined))
      sections.unshift({ title: 'Sequels You Missed', query: sequelsQuery, variables: { ids: sequelIDs, status: ['FINISHED', 'RELEASING'], onList: false } })
    }
    if (continueIDs) {
      const contiueQuery = derived(client.search({ ids: continueIDs.slice(0, 50), sort: ['UPDATED_AT_DESC'] }, false), value => {
        value.data?.Page?.media?.sort((a, b) => continueIDs.indexOf(a?.id ?? 0) - continueIDs.indexOf(b?.id ?? 0))
        return value
      }) as ReturnType<typeof client.search>
      unsub.push(contiueQuery.subscribe(() => undefined))
      sections.unshift({ title: 'Continue Watching', query: contiueQuery, variables: { ids: continueIDs, sort: ['UPDATED_AT_DESC'] } })
    }

    set(sections)

    return () => unsub.forEach(fn => fn())
  })
  sectionQueries.subscribe(() => undefined)
</script>

<script lang='ts'>
  import { onDestroy } from 'svelte'

  import { goto } from '$app/navigation'
  import { Banner, hideBanner } from '$lib/components/ui/banner'
  import { QueryCard } from '$lib/components/ui/cards'
  import { click, dragScroll } from '$lib/modules/navigate'

  function handleScroll (e: Event) {
    const target = e.target as HTMLDivElement
    hideBanner.value = target.scrollTop > 150
  }

  hideBanner.value = false

  function search (variables: VariablesOf<typeof Search>) {
    goto('/app/search', { state: { search: variables } })
  }

  onDestroy(() => {
    for (const { query } of $sectionQueries) {
      // eslint-disable-next-line svelte/require-store-reactive-access
      if ('pause' in query) query.pause()
    }
  })
</script>

<div class='grow h-full min-w-0 -ml-14 pl-14 overflow-y-scroll' use:dragScroll on:scroll={handleScroll}>
  <Banner />
  {#each $sectionQueries as { title, query, variables }, i (i)}
    <div class='flex px-4 pt-5 items-end cursor-pointer text-muted-foreground select:text-foreground'>
      <div class='font-semibold text-lg leading-none' use:click={() => search(variables)}>{title}</div>
      <div class='ml-auto text-xs' use:click={() => search(variables)}>View More</div>
    </div>
    <div class='flex overflow-x-scroll select:-ml-14 select:pl-14 -mt-40 pt-40 -mb-5 pb-5 relative group pointer-events-none' use:dragScroll>
      <QueryCard {query} />
    </div>
  {/each}
</div>
