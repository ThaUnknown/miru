<script context='module'>
  import SectionsManager from '@/modules/sections.js'
  import Search, { search } from './Search.svelte'
  import { anilistClient, currentSeason, currentYear } from '@/modules/anilist.js'

  const vars = { format: 'TV', season: currentSeason, year: currentYear }

  async function fetchAllScheduleEntries (_variables) {
    const variables = { ..._variables }
    const results = { data: { Page: { media: [], pageInfo: { hasNextPage: false } } } }
    const opts = { ...vars, ...SectionsManager.sanitiseObject(variables) }
    for (let page = 1, hasNextPage = true; hasNextPage && page < 5; ++page) {
      const res = await anilistClient.search({ ...opts, page, perPage: 50 })
      hasNextPage = res.data.Page.pageInfo.hasNextPage
      results.data.Page.media = results.data.Page.media.concat(res.data.Page.media)
    }

    const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
    const season = seasons.at(seasons.indexOf(vars.season) - 1)
    const year = vars.season === 'WINTER' ? vars.year - 1 : vars.year

    const res = await anilistClient.search({ format: 'TV', ...SectionsManager.sanitiseObject(variables), year, season, status: 'RELEASING', page: 1, perPage: 50 })
    results.data.Page.media = results.data.Page.media.concat(res.data.Page.media)

    // filter out entries without airing schedule and duplicates [only allow first occurence]
    results.data.Page.media = results.data.Page.media.filter((media, index, self) => media.airingSchedule?.nodes?.[0]?.airingAt && self.findIndex(m => m.id === media.id) === index)

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
