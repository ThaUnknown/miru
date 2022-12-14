<script context='module'>
  import { readable } from 'svelte/store'
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
</script>

<script>
  import Search from './Search.svelte'
  import Section from './Section.svelte'
  import Gallery from './Gallery.svelte'
  import { add } from '@/modules/torrent.js'
  import { alToken, set } from '../Settings.svelte'
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
      if (!media) return condition
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
  async function infiniteScroll () {
    if (current && canScroll && hasNext && this.scrollTop + this.clientHeight > this.scrollHeight - 800) {
      canScroll = false
      const res = sections[current].load(++page)
      media.push(res)
      media = media
      await res
      canScroll = hasNext
    }
  }

  async function loadCurrent (initial = true) {
    page = 1
    canScroll = false
    const res = sections[current].load(1, 50, initial)
    media = [res]
    await res
    canScroll = hasNext
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

  function processMedia (res) {
    hasNext = res?.data?.Page.pageInfo.hasNextPage
    return res?.data?.Page.media.map(media => {
      return { media }
    })
  }

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
  const getSeason = d => seasons[Math.floor((d.getMonth() / 12) * 4) % 4]
  let sections = {
    continue: {
      title: 'Continue Watching',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.sort = 'UPDATED_TIME_DESC'
        return alRequest({ method: 'UserLists', status_in: ['CURRENT', 'REPEATING'], page }).then(res => {
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
    planning: {
      title: 'Your List',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.sort = 'UPDATED_TIME_DESC'
        return alRequest({ method: 'UserLists', page, perPage, status_in: 'PLANNING' }).then(res => {
          hasNext = res?.data?.Page.pageInfo.hasNextPage
          return customFilter(res?.data?.Page.mediaList)
        })
      },
      hide: !alToken
    },
    trending: {
      title: 'Trending Now',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.sort = 'TRENDING_DESC'
        return alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    seasonal: {
      title: 'Popular This Season',
      load: (page = 1, perPage = 50, initial = false) => {
        const date = new Date()
        if (initial) {
          search.season = getSeason(date)
          search.year = date.getFullYear()
          search.sort = 'POPULARITY_DESC'
        }
        return alRequest({ method: 'Search', page, perPage, year: date.getFullYear(), season: getSeason(date), sort: 'POPULARITY_DESC', ...sanitiseObject(search) }).then(res =>
          processMedia(res)
        )
      }
    },
    popular: {
      title: 'All Time Popular',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) search.sort = 'POPULARITY_DESC'
        return alRequest({ method: 'Search', page, perPage, sort: 'POPULARITY_DESC', ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    romance: {
      title: 'Romance',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'Romance'
        }
        return alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Romance', ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    action: {
      title: 'Action',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'Action'
        }
        return alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Action', ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    adventure: {
      title: 'Adventure',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'Adventure'
        }
        return alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Adventure', ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    fantasy: {
      title: 'Fantasy',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'Fantasy'
        }
        return alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Fantasy', ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    comedy: {
      title: 'Comedy',
      load: (page = 1, perPage = 50, initial = false) => {
        if (initial) {
          search.sort = 'TRENDING_DESC'
          search.genre = 'Comedy'
        }
        return alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC', genre: 'Comedy', ...sanitiseObject(search) }).then(res => processMedia(res))
      }
    },
    schedule: {
      title: 'Schedule',
      hide: true,
      load: (page = 1, perPage = 50, initial = false) => {
        const date = new Date()
        if (initial) {
          search.sort = 'START_DATE_DESC'
          search.status = 'RELEASING'
        }
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
          ...sanitiseObject(search)
        }
        return alRequest(opts).then(res => processMedia(res))
      }
    }
  }
  for (let i = 0; i < set.rssFeeds.length; ++i) {
    const [title, val] = set.rssFeeds[i]
    sections = {
      ['releases-' + i]: {
        title,
        releases: true,
        load: async (page = 1, perPage = 20, initial = false, force = true) => {
          if (initial) search.sort = 'START_DATE_DESC'
          return customFilter(await releasesCards(page, Math.min(perPage, 13), force, val))
        }
      },
      ...sections
    }
  }
</script>

<div class='d-flex h-full flex-column overflow-y-scroll root' on:scroll={infiniteScroll} bind:this={container}>
  <div class='h-full py-10'>
    <Search bind:media bind:search bind:current {loadCurrent} />
    <div class='container'>
      {#if $progress < 30}
        We're ${30 - $progress} short of our monthly goal! That's only {Math.ceil((30 - $progress) / 5)} people donating $5.00!
      {:else}
        We've reached the donation goal for this month! \o/
      {/if}
      <div class='progress-group py-5'>
        <div class='progress'>
          <div class='progress-bar progress-bar-animated' role='progressbar' style='width: {$progress / 30 * 100}%;' />
        </div>
        <span class='progress-group-label'>${$progress} / $30.00</span>
      </div>
      <button class='btn btn-primary' type='button' on:click={() => { window.IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/') }}>Donate</button>
    </div>
    {#if media.length}
      <Gallery {media} />
    {:else}
      <div>
        {#each Object.entries(sections) as [key, opts] (key)}
          {#if !opts.hide}
            <Section opts={{ ...opts, onclick: () => (current = key) }} />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
