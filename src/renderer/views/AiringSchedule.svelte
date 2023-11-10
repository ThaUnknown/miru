<script context='module'>
  import Sections from '@/modules/sections.js'
  import Search, { search } from './Search.svelte'
  import { alRequest } from '@/modules/anilist.js'

  const date = new Date()
  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  const getSeason = d => seasons[Math.floor((d.getMonth() / 12) * 4) % 4]

  const vars = { format: 'TV', season: getSeason(date), year: date.getFullYear() }

  async function fetchAllScheduleEntries (_variables) {
    const variables = { ..._variables }
    const results = { data: { Page: { media: [], pageInfo: { hasNextPage: false } } } }
    for (let page = 1, hasNextPage = true; hasNextPage && page < 5; ++page) {
      const res = await alRequest({ method: 'Search', page, perPage: 50, ...vars, ...Sections.sanitiseObject(variables) })
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
    load: (_, __, variables) => Sections.wrapResponse(fetchAllScheduleEntries(variables), 150)
  }
</script>

<Search />
