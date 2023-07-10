<script>
  import smoothScroll from '@/modules/scroll.js'

  const date = new Date()
  if (initial) search.value = { ...search.value, sort: 'START_DATE_DESC', status: 'RELEASING' }
  if (perPage !== 6) date.setHours(0, 0, 0, 0)
  const data = alRequest({ method: 'AiringSchedule', page, from: parseInt(date.getTime() / 1000) }).then(res => {
    const entries = customFilter(res?.data?.Page.airingSchedules.filter(entry => entry.media.countryOfOrigin !== 'CN' && !entry.media.isAdult) || []).slice(0, perPage)
    const media = []
    hasNext = res?.data?.Page.pageInfo.hasNextPage
    const date = new Date()
    for (const entry of entries) {
      if (entry.timeUntilAiring && perPage !== 6 && (!lastDate || new Date(+date + entry.timeUntilAiring * 1000).getDay() !== lastDate.getDay())) {
        lastDate = new Date(+date + entry.timeUntilAiring * 1000)
        media.push(lastDate.toLocaleDateString('en-US', { weekday: 'long' }))
      }
      entry.schedule = true
      media.push(entry)
    }
    return media
  })

  let canScroll
  async function loadTillFull (element) {
    canScroll = false
    while (hasNextPage && element.scrollHeight <= element.clientHeight) {
      await loadSearchData()
    }
    canScroll = true
  }

  async function infiniteScroll () {
    if (canScroll && hasNextPage && this.scrollTop + this.clientHeight > this.scrollHeight - 800) {
      canScroll = false
      await loadSearchData()
      canScroll = true
    }
  }
</script>

<div class='h-full w-full overflow-y-scroll d-flex flex-wrap flex-row root overflow-x-hidden px-50 justify-content-center align-content-start' use:smoothScroll use:loadTillFull on:scroll={infiniteScroll}>
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
