<script>
  import Search from './Search.svelte'
  import Section from './Section.svelte'
  import Gallery from './Gallery.svelte'
  import { alToken } from '../Settings.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { resolveFileMedia, relations } from '@/modules/anime.js'
  import { getRSSContent, getRSSurl } from '@/modules/rss.js'

  let media = null
  let search

  function processMedia(res) {
    return res.data.Page.media.map(media => {
      return { media }
    })
  }
  setInterval(async () => {
    const media = await releasesCards(5)
    if (media) sections[1].cards = media
  }, 30000)

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
          mediaInformation.onclick = () => client.playTorrent(items[index].querySelector('link').textContent, { media: mediaInformation, episode: mediaInformation.episode })
        })
        localStorage.setItem('relations', JSON.stringify(relations))
        return media
      }
    }
  }
  // TODO: add AL account detection for hiding
  const sections = [
    {
      title: 'Continue Watching',
      click: () => {
        media = alRequest({ method: 'UserLists', status_in: 'CURRENT' }).then(res => {
          return res.data.Page.mediaList.filter(i => {
            return i.media.status !== 'RELEASING' || i.media.mediaListEntry?.progress < i.media.nextAiringEpisode?.episode - 1
          })
        })
      },
      cards: alRequest({ method: 'UserLists', status_in: 'CURRENT' }).then(res => {
        return res.data.Page.mediaList.filter(i => {
          return i.media.status !== 'RELEASING' || i.media.mediaListEntry?.progress < i.media.nextAiringEpisode?.episode - 1
        }).slice(0, 5)
      }),
      hide: !alToken
    },
    {
      title: 'New Releases',
      click: () => {
        media = releasesCards(200, true)
      },
      cards: releasesCards(5)
    },
    {
      title: 'Your List',
      click: () => {
        media = alRequest({ method: 'UserLists', status_in: 'PLANNING' }).then(res => res.data.Page.mediaList)
      },
      cards: alRequest({ method: 'UserLists', status_in: 'PLANNING', perPage: 5 }).then(res => res.data.Page.mediaList),
      hide: !alToken
    },
    {
      title: 'Trending Now',
      click: () => {
        search.sort = 'TRENDING_DESC'
      },
      cards: alRequest({ method: 'Search', perPage: 5, sort: 'TRENDING_DESC' }).then(res => processMedia(res))
    },
    {
      title: 'Romance',
      click: () => {
        search.sort = 'TRENDING_DESC'
        search.genre = 'romance'
      },
      cards: alRequest({ method: 'Search', perPage: 5, genre: 'Romance', sort: 'TRENDING_DESC' }).then(res => processMedia(res))
    },
    {
      title: 'Action',
      click: () => {
        search.sort = 'TRENDING_DESC'
        search.genre = 'action'
      },
      cards: alRequest({ method: 'Search', perPage: 5, genre: 'Action', sort: 'TRENDING_DESC' }).then(res => processMedia(res))
    }
  ]
</script>

<div class="d-flex h-full flex-column overflow-y-scroll root">
  <div class="h-full py-10">
    <Search bind:media bind:search />
    {#if media}
      <Gallery {media} />
    {:else}
      <div>
        {#each sections as opts (opts.title)}
          {#if !opts.hide}
            <Section {opts} />
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
