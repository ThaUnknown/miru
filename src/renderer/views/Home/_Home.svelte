<script context='module'>
  import { readable, writable } from 'simple-store-svelte'
  import { add } from '@/modules/torrent.js'
  import { alToken, set } from '../Settings.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { sleep } from '@/modules/util.js'
  import { resolveFileMedia } from '@/modules/anime.js'
  import { getRSSContent, getReleasesRSSurl } from '@/modules/rss.js'
  const noop = () => {}
  async function getVal (set) {
    const res = await fetch('https://gh.miru.workers.dev/')
    const amt = await res.text() / 100
    set(amt.toFixed(2))
  }
  const progress = readable(0, set => {
    getVal(set)
    return noop
  })
  const getSeason = d => seasons[Math.floor((d.getMonth() / 12) * 4) % 4]

  let hasNext = true
  function processMedia (res, length) {
    res.then(res => {
      hasNext = res?.data?.Page.pageInfo.hasNextPage
    })

    return Array.from({ length }, (_, i) => ({ type: 'full', data: fromPending(res, i) }))
  }
  async function fromPending (arr, i) {
    // return new Promise(r => r)
    const { data } = await arr
    return data.Page.media[i]
  }

  const search = writable({})
  let lastRSSDate = 0
  async function releasesCards (page, limit, force, val) {
    const doc = await getRSSContent(getReleasesRSSurl(val))
    if (doc) {
      const pubDate = doc.querySelector('pubDate').textContent
      if (force || lastRSSDate !== pubDate) {
        lastRSSDate = pubDate
        const index = (page - 1) * limit
        const items = [...doc.querySelectorAll('item')].slice(index, index + limit)
        hasNext = items.length === limit
        const media = await resolveFileMedia(items.map(item => item.querySelector('title').textContent))
        media.forEach((mediaInformation, index) => {
          mediaInformation.date = new Date(items[index].querySelector('pubDate').textContent)
          mediaInformation.onclick = () => {
            add(items[index].querySelector('link').textContent)
          }
        })
        media.hasNext = hasNext
        return media
      }
    }
  }
  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  function sanitiseObject (object) {
    const safe = {}
    for (const [key, value] of Object.entries(object)) {
      if (value) safe[key] = value
    }
    return safe
  }
  function customFilter (mediaList) {
    return mediaList?.filter(({ media }) => {
      let condition = true
      const { value } = search
      if (!media) return condition
      if (value.genre && !media.genres?.includes(value.genre)) condition = false
      if (value.season && media.season !== value.season) condition = false
      if (value.year && media.seasonYear !== value.year) condition = false
      if (value.format && media.format !== value.format) condition = false
      if (value.status && media.status !== value.status) condition = false
      if (value.search) {
        const titles = Object.values(media.title)
          .concat(media.synonyms)
          .filter(name => name != null)
          .map(title => title.toLowerCase())
        if (!titles.find(title => title.includes(value.search.toLowerCase()))) condition = false
      }
      return condition
    })
  }

  let lastDate = null
  let sections = {
    // continue: {
    //   title: 'Continue Watching',
    //   preview: () => sections.continue.load(1, 6),
    //   load: (page = 1, perPage = 50, initial = false) => {
    //     if (initial) search.value = { ...search.value, sort: 'UPDATED_TIME_DESC' }
    //     return alRequest({ method: 'UserLists', status_in: ['CURRENT', 'REPEATING'], page }).then(res => {
    //       hasNext = res?.data?.Page.pageInfo.hasNextPage
    //       return customFilter(
    //         res?.data?.Page.mediaList
    //           .filter(i => {
    //             return i.media.status !== 'RELEASING' || i.media.mediaListEntry?.progress < i.media.nextAiringEpisode?.episode - 1
    //           })
    //           .slice(0, perPage)
    //       )
    //     })
    //   },
    //   hide: !alToken
    // },
    // newSeasons: {
    //   title: 'Sequels You Missed',
    //   data: (async () => {
    //     if (!alToken) return
    //     const { data } = await alRequest({ method: 'NewSeasons' })
    //     const res = data.MediaListCollection.lists[0]
    //     return res?.entries?.flatMap(({ media }) => {
    //       return media.relations.edges.filter(edge => {
    //         return edge.relationType === 'SEQUEL' && !edge.node.mediaListEntry
    //       })
    //     }).map(({ node }) => node.id)
    //   })(),
    //   preview: () => sections.newSeasons.load(1, 6),
    //   load: async (page = 1, perPage = 50, initial = false) => {
    //     if (initial) search.value = { ...search.value, status: 'FINISHED' }
    //     const id = await sections.newSeasons.data
    //     const res = await alRequest({ method: 'SearchIDS', page, perPage, id, ...sanitiseObject(search.value), status: ['FINISHED', 'RELEASING'], onList: false })
    //     return processMedia(res)
    //   },
    //   hide: !alToken
    // },
    // planning: {
    //   title: 'Your List',
    //   preview: () => sections.planning.load(1, 6),
    //   load: (page = 1, perPage = 50, initial = false) => {
    //     if (initial) search.value = { ...search.value, sort: 'UPDATED_TIME_DESC' }
    //     return alRequest({ method: 'UserLists', page, perPage, status_in: 'PLANNING' }).then(res => {
    //       hasNext = res?.data?.Page.pageInfo.hasNextPage
    //       return customFilter(res?.data?.Page.mediaList)
    //     })
    //   },
    //   hide: !alToken
    // },
    seasonal: {
      title: 'Popular This Season',
      preview: function () {
        if (!this.previewData) this.previewData = this.load(1, 10)
        return this.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        const date = new Date()
        if (initial) {
          search.value = {
            ...search.value,
            season: getSeason(date),
            year: date.getFullYear(),
            sort: 'POPULARITY_DESC'
          }
        }
        return processMedia(alRequest({ method: 'Search', page, perPage, year: date.getFullYear(), season: getSeason(date), sort: 'POPULARITY_DESC', ...sanitiseObject(search.value) }), perPage)
      }
    },
    trending: {
      title: 'Trending Now',
      preview: function () {
        if (!this.previewData) this.previewData = this.load(1, 10)
        return this.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.value = { ...search.value, sort: 'TRENDING_DESC' }
        return processMedia(alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', ...sanitiseObject(search.value) }), perPage)
      }
    },
    popular: {
      title: 'All Time Popular',
      preview: function () {
        if (!this.previewData) this.previewData = this.load(1, 10)
        return this.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.value = { ...search.value, sort: 'POPULARITY_DESC' }
        return processMedia(alRequest({ method: 'Search', page, perPage, sort: 'POPULARITY_DESC', ...sanitiseObject(search.value) }), perPage)
      }
    },
    romance: {
      title: 'Romance',
      preview: () => {
        const self = sections.romance
        if (!self.previewData) self.previewData = self.load(1, 10)
        return self.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.value = { ...search.value, sort: 'TRENDING_DESC', genre: 'Romance' }
        return processMedia(alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Romance', ...sanitiseObject(search.value) }), perPage)
      }
    },
    action: {
      title: 'Action',
      preview: () => {
        const self = sections.action
        if (!self.previewData) self.previewData = self.load(1, 10)
        return self.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.value = { ...search.value, sort: 'TRENDING_DESC', genre: 'Action' }
        return processMedia(alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Action', ...sanitiseObject(search.value) }), perPage)
      }
    },
    adventure: {
      title: 'Adventure',
      preview: () => {
        const self = sections.adventure
        if (!self.previewData) self.previewData = self.load(1, 10)
        return self.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.value = { ...search.value, sort: 'TRENDING_DESC', genre: 'Adventure' }
        return processMedia(alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Adventure', ...sanitiseObject(search.value) }), perPage)
      }
    },
    fantasy: {
      title: 'Fantasy',
      preview: () => {
        const self = sections.fantasy
        if (!self.previewData) self.previewData = self.load(1, 10)
        return self.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.value = { ...search.value, sort: 'TRENDING_DESC', genre: 'Fantasy' }
        return processMedia(alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Fantasy', ...sanitiseObject(search.value) }), perPage)
      }
    },
    comedy: {
      title: 'Comedy',
      preview: () => {
        const self = sections.comedy
        if (!self.previewData) self.previewData = self.load(1, 10)
        return self.previewData
      },
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.value = { ...search.value, sort: 'TRENDING_DESC', genre: 'Comedy' }
        return processMedia(alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Comedy', ...sanitiseObject(search.value) }), perPage)
      }
    },
    schedule: {
      title: 'Schedule',
      hide: true,
      load: (page = 1, perPage = 50, initial = false) => {
        const date = new Date()
        if (initial) search.value = { ...search.value, sort: 'START_DATE_DESC', status: 'RELEASING' }
        if (perPage !== 6) date.setHours(0, 0, 0, 0)
        return alRequest({ method: 'AiringSchedule', page, from: parseInt(date.getTime() / 1000) }).then(res => {
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
      }
    },
    search: {
      title: 'Search',
      hide: true,
      load: (page = 1, perPage = 50) => {
        const opts = {
          method: 'Search',
          page,
          perPage,
          ...sanitiseObject(search.value)
        }
        return processMedia(alRequest(opts), perPage)
      }
    }
  }
  for (let i = set.rssFeeds.length - 1; i >= 0; --i) {
    const [title, val] = set.rssFeeds[i]
    const section = {
      title,
      load: async (page = 1, perPage = 20, initial = false, force = true) => {
        if (initial) search.value = { ...search.value, sort: 'START_DATE_DESC' }
        return customFilter(await releasesCards(page, Math.min(perPage, 13), force, val))
      },
      preview: async () => {
        const self = sections['releases-' + i]
        if (!self.previewData) {
          await sleep(i * 3000) // stagger lists by 3 seconds
          setInterval(async () => {
            const newData = await self.load(1, 6, false, false)
            if (newData) self.previewData = newData
          }, 15000)
          self.previewData = await self.load(1, 6, false, true)
        }
        return self.previewData
      }
    }
    sections = {
      ['releases-' + i]: section,
      ...sections
    }
  }
</script>

<script>
  import Search from './Search.svelte'
  import Section from './Section.svelte'
  import Gallery from './Gallery.svelte'

  let media = []
  export let current = null
  let page = 1

  let canScroll = true
  let container = null

  function infiniteScroll () {
    if (current && canScroll && hasNext && this.scrollTop + this.clientHeight > this.scrollHeight - 800) {
      infiniteScrollLoad()
    }
  }
  async function infiniteScrollLoad () {
    canScroll = false
    const res = sections[current].load(++page)
    media.push(res)
    media = media
    await res
    canScroll = hasNext
  }

  async function loadCurrent (initial = true) {
    page = 1
    canScroll = false
    const res = sections[current].load(1, 50, initial)
    media = [res]
    await res
    canScroll = hasNext
    if ((await res).length < 12 && hasNext) infiniteScrollLoad()
  }

  $: load(current)
  async function load (current) {
    if (sections[current]) {
      loadCurrent()
    } else {
      if (container) container.scrollTop = 0
      media = []
      canScroll = true
      lastDate = null
      $search = {
        search: null,
        genre: '',
        season: '',
        year: null,
        format: '',
        status: '',
        sort: ''
      }
    }
  }
</script>

<div class='h-full w-full overflow-y-scroll root overflow-x-hidden' on:scroll={infiniteScroll} bind:this={container}>
  <div class='d-flex flex-column h-full w-full'>
    <Search bind:media bind:search={$search} bind:current {loadCurrent} />
    {#if media.length}
      <Gallery {media} />
    {:else}
      {#each Object.entries(sections) as [key, opts] (key)}
        {#if !opts.hide}
          <Section opts={{ ...opts, onclick: () => (current = key) }} />
        {/if}
      {/each}
    {/if}
  </div>
</div>
