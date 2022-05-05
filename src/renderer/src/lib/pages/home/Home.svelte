<script>
  import Search from './Search.svelte'
  import Section from './Section.svelte'
  import Gallery from './Gallery.svelte'
  import { add } from '@/modules/torrent.js'
  import { alToken } from '../Settings.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { resolveFileMedia } from '@/modules/anime.js'
  import { getRSSContent, getReleasesRSSurl } from '@/lib/RSSView.svelte'

  let media = []
  let search = {}
  export let current = null
  let page = 1

  let canScroll = true
  let hasNext = true
  let container = null

  function sanitiseObject(object) {
    const safe = {}
    for (const [key, value] of Object.entries(object)) {
      if (value) safe[key] = value
    }
    return safe
  }
  function customFilter(mediaList) {
    return mediaList?.filter(({ media }) => {
      let condition = true
      if (search.genre && !media.genres?.includes(search.genre)) condition = false
      if (search.season && media.season !== search.season) condition = false
      if (search.year && media.seasonYear !== search.year) condition = false
      if (search.format && media.format !== search.format) condition = false
      if (search.status && media.status !== search.status) condition = false
      if (search.search) {
        const titles = Object.values(media.title)
          .concat(media.synonyms)
          .filter(name => name != null)
          .map(title => title.toLowerCase())
        if (!titles.find(title => title.includes(search.search.toLowerCase()))) condition = false
      }
      return condition
    })
  }
  async function infiniteScroll() {
    if (current && canScroll && hasNext && this.scrollTop + this.clientHeight > this.scrollHeight - 800) {
      canScroll = false
      const res = sections[current].load(++page)
      media.push(res)
      media = media
      await res
      canScroll = hasNext
    }
  }

  $: load(current)
  async function load(current) {
    if (sections[current]) {
      page = 1
      canScroll = false
      const res = sections[current].load(1)
      media = [res]
      await res
      canScroll = hasNext
    } else {
      if (container) container.scrollTop = 0
      media = []
      canScroll = true
      lastDate = null
      search = {
        format: '',
        genre: '',
        season: '',
        sort: '',
        status: ''
      }
    }
  }

  let lastDate = null

  function processMedia(res) {
    hasNext = res?.data?.Page.pageInfo.hasNextPage
    return res?.data?.Page.media.map(media => {
      return { media }
    })
  }

  let lastRSSDate = 0
  async function releasesCards(page, limit, force) {
    const doc = await getRSSContent(getReleasesRSSurl())
    if (doc) {
      const pubDate = doc.querySelector('pubDate').textContent
      if (force || lastRSSDate !== pubDate) {
        lastRSSDate = pubDate
        const index = (page - 1) * limit
        const items = [...doc.querySelectorAll('item')].slice(index, index + limit)
        hasNext = items.length === limit
        const media = await resolveFileMedia({ fileName: items.map(item => item.querySelector('title').textContent), isRelease: true })
        media.forEach((mediaInformation, index) => {
          mediaInformation.onclick = () => {
            add(items[index].querySelector('link').textContent)
          }
        })
        return media
      }
    }
  }
  const seasons = ['SUMMER', 'FALL', 'WINTER', 'SPRING']
  const getSeason = d => seasons[Math.floor((d.getMonth() / 12) * 4) % 4]
  const sections = {
    continue: {
      title: 'Continue Watching',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) search.sort = 'UPDATED_TIME_DESC'
        return alRequest({ method: 'UserLists', status_in: 'CURRENT', page }).then(res => {
          hasNext = res?.data?.Page.pageInfo.hasNextPage
          return customFilter(
            res?.data?.Page.mediaList
              .filter(i => {
                return i.media.status !== 'RELEASING' || i.media.mediaListEntry?.progress < i.media.nextAiringEpisode?.episode - 1
              })
              .slice(0, perPage)
          )
        })
      },
      hide: !alToken
    },
    releases: {
      title: 'New Releases',
      releases: true,
      load: async (page = 1, perPage = 20, force = true) => {
        if (perPage !== 5) search.sort = 'START_DATE_DESC'
        return customFilter(await releasesCards(page, perPage, force))
      }
    },
    planning: {
      title: 'Your List',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) search.sort = 'UPDATED_TIME_DESC'
        return alRequest({ method: 'UserLists', page, perPage, status_in: 'PLANNING' }).then(res => {
          hasNext = res?.data?.Page.pageInfo.hasNextPage
          return customFilter(res?.data?.Page.mediaList)
        })
      },
      hide: !alToken
    },
    trending: {
      title: 'Trending Now',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) search.sort = 'TRENDING_DESC'
        return alRequest({ method: 'Search', page, perPage, ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    romance: {
      title: 'Romance',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'romance'
        }
        return alRequest({ method: 'Search', page, perPage, ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    action: {
      title: 'Action',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'action'
        }
        return alRequest({ method: 'Search', page, perPage, ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    adventure: {
      title: 'Adventure',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'adventure'
        }
        return alRequest({ method: 'Search', page, perPage, ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    fantasy: {
      title: 'Fantasy',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'fantasy'
        }
        return alRequest({ method: 'Search', page, perPage, ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    comedy: {
      title: 'Comedy',
      load: (page = 1, perPage = 50) => {
        if (perPage !== 5) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'comedy'
        }
        return alRequest({ method: 'Search', page, perPage, ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    schedule: {
      title: 'Schedule',
      hide: true,
      load: (page = 1) => {
        search.sort = 'START_DATE_DESC'
        search.status = 'RELEASING'
        const date = new Date()
        search.season = getSeason(date)
        search.year = date.getFullYear()
        return alRequest({ method: 'AiringSchedule', page }).then(res => {
          const entries = res?.data?.Page.airingSchedules.filter(entry => entry.media.countryOfOrigin !== 'CN' && !entry.media.isAdult) || []
          const media = []
          hasNext = res?.data?.Page.pageInfo.hasNextPage
          let date = new Date()
          for (const entry of entries) {
            if (entry.timeUntilAiring && (!lastDate || new Date(+date + entry.timeUntilAiring * 1000).getDay() !== lastDate.getDay())) {
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
          ...sanitiseObject(search)
        }
        return alRequest(opts).then(res => processMedia(res))
      }
    }
  }
</script>

<div class="d-flex h-full flex-column overflow-y-scroll root" on:scroll={infiniteScroll} bind:this={container}>
  <div class="h-full py-10">
    <Search bind:media bind:search bind:current />
    {#if media.length}
      <Gallery {media} />
    {:else}
      <div>
        {#each Object.entries(sections) as [key, opts] (opts.title)}
          {#if !opts.hide}
            <Section opts={{ ...opts, onclick: () => (current = key) }} />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
