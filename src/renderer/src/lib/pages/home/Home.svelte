<script>
  import Search from './Search.svelte'
  import Section from './Section.svelte'
  import Gallery from './Gallery.svelte'
  import { add } from '@/modules/torrent.js'
  import { alToken } from '../Settings.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { resolveFileMedia, relations } from '@/modules/anime.js'
  import { getRSSContent, getRSSurl } from '@/lib/RSSView.svelte'

  let media = null
  let search = {}
  export let current = null
  let page = 1

  let canScroll = true
  let hasNext = true
  async function infiniteScroll() {
    if (current && canScroll && hasNext && this.scrollTop + this.clientHeight > this.scrollHeight - 800) {
      canScroll = false
      const res = await sections[current].load(++page)
      media = media.then(old => {
        return old.concat(res)
      })
      canScroll = hasNext
    }
  }

  $: load(current)
  function load(current) {
    if (sections[current]) {
      page = 1
      media = sections[current].load(1)
    } else {
      media = null
      canScroll = true
      lastDate = null
    }
  }

  let lastDate = null

  function processMedia(res) {
    hasNext = res.data.Page.pageInfo.hasNextPage
    return res.data.Page.media.map(media => {
      return { media }
    })
  }

  let lastRSSDate = 0
  async function releasesCards(limit, force) {
    const doc = await getRSSContent(getRSSurl())
    if (doc) {
      const pubDate = doc.querySelector('pubDate').textContent
      if (force || lastRSSDate !== pubDate) {
        lastRSSDate = pubDate
        const items = doc.querySelectorAll('item')
        const media = await resolveFileMedia({ fileName: [...items].map(item => item.querySelector('title').textContent).slice(0, limit), isRelease: true })
        media.forEach((mediaInformation, index) => {
          mediaInformation.onclick = () => {
            add(items[index].querySelector('link').textContent)
          }
        })
        localStorage.setItem('relations', JSON.stringify(relations))
        return media
      }
    }
  }
  const sections = {
    continue: {
      title: 'Continue Watching',
      load: (page = 1, perPage = 50) => {
        return alRequest({ method: 'UserLists', status_in: 'CURRENT', page }).then(res => {
          hasNext = res.data.Page.pageInfo.hasNextPage
          return res.data.Page.mediaList
            .filter(i => {
              return i.media.status !== 'RELEASING' || i.media.mediaListEntry?.progress < i.media.nextAiringEpisode?.episode - 1
            })
            .slice(0, perPage)
        })
      },
      hide: !alToken
    },
    releases: {
      title: 'New Releases',
      releases: true,
      load: (force, perPage = 50) => {
        hasNext = false
        return releasesCards(perPage, force)
      }
    },
    planning: {
      title: 'Your List',
      load: (page = 1, perPage = 50) => {
        return alRequest({ method: 'UserLists', page, perPage, status_in: 'PLANNING' }).then(res => {
          hasNext = res.data.Page.pageInfo.hasNextPage
          return res.data.Page.mediaList
        })
      },
      hide: !alToken
    },
    trending: {
      title: 'Trending Now',
      load: (page = 1, perPage = 50) => {
        return alRequest({ method: 'Search', page, perPage, sort: 'TRENDING_DESC' }).then(res => processMedia(res))
      }
    },
    romance: {
      title: 'Romance',
      load: (page = 1, perPage = 50) => {
        return alRequest({ method: 'Search', page, perPage, genre: 'Romance', sort: 'TRENDING_DESC' }).then(res => processMedia(res))
      }
    },
    action: {
      title: 'Action',
      load: (page = 1, perPage = 50) => {
        return alRequest({ method: 'Search', page, perPage, genre: 'Action', sort: 'TRENDING_DESC' }).then(res => processMedia(res))
      }
    },
    schedule: {
      title: 'Schedule',
      hide: true,
      load: (page = 1) => {
        return alRequest({ method: 'AiringSchedule', page }).then(res => {
          const entries = res.data.Page.airingSchedules.filter(entry => entry.media.countryOfOrigin !== 'CN' && !entry.media.isAdult)
          const media = []
          hasNext = res.data.Page.pageInfo.hasNextPage
          let date = new Date()
          for (const entry of entries) {
            if (entry.timeUntilAiring && (!lastDate || new Date(+date + entry.timeUntilAiring * 1000).getDay() !== lastDate.getDay())) {
              lastDate = new Date(+date + entry.timeUntilAiring * 1000)
              media.push(lastDate.toLocaleDateString('en-US', { weekday: 'long' }))
            }
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
          perPage
        }
        for (const [key, value] of Object.entries(search)) {
          if (value) opts[key] = value
        }
        return alRequest(opts).then(res => processMedia(res))
      }
    }
  }
</script>

<div class="d-flex h-full flex-column overflow-y-scroll root" on:scroll={infiniteScroll}>
  <div class="h-full py-10">
    <Search bind:media bind:search bind:current />
    {#if media}
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

<style>
  .root {
    animation: 0.3s ease 0s 1 load-in;
  }
  @keyframes load-in {
    from {
      bottom: -1.2rem;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      transform: scale(1);
    }
  }
</style>
