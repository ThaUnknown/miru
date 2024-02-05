<script context='module'>
  import SectionsManager from '@/modules/sections.js'
  import Search, { search } from './Search.svelte'
  import { anilistClient, currentSeason, currentYear } from '@/modules/anilist.js'

  const vars = { format: 'TV', season: currentSeason, year: currentYear }

  async function fetchAllScheduleEntries (_variables) {
    const variables = { ..._variables }
    const results = { data: { Page: { media: [], pageInfo: { hasNextPage: false } } } }
    for (let page = 1, hasNextPage = true; hasNextPage && page < 5; ++page) {
      const res = await anilistClient.search({ page, perPage: 50, ...vars, ...SectionsManager.sanitiseObject(variables) })
      hasNextPage = res.data.Page.pageInfo.hasNextPage
      results.data.Page.media = results.data.Page.media.concat(res.data.Page.media)
    }
    results.data.Page.media.sort((a, b) => a.airingSchedule?.nodes?.[0]?.airingAt - b.airingSchedule?.nodes?.[0]?.airingAt)

    return results
  }
</script>

<script>
  $search = {
    ...vars,
    load: (_, __, variables) => SectionsManager.wrapResponse(fetchAllScheduleEntries(variables), 150)
  }
</script>

<Search />
