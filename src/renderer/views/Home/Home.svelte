<script context='module'>
  import Sections from '@/modules/sections.js'
  import { alToken, set } from '../Settings.svelte'
  import { alRequest, userLists } from '@/modules/anilist.js'
  import { RSSManager } from '@/modules/rss.js'

  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  const getSeason = d => seasons[Math.floor((d.getMonth() / 12) * 4) % 4]

  const date = new Date()

  const bannerData = alRequest({ method: 'Search', sort: 'POPULARITY_DESC', perPage: 1, onList: false, season: getSeason(date), year: date.getFullYear() })

  const manager = new Sections()

  for (const [title, url] of set.rssFeeds.reverse()) {
    manager.add([
      {
        title,
        load: (page = 1, perPage = 12) => RSSManager.getMediaForRSS(page, perPage, url),
        preview: RSSManager.getMediaForRSS(1, 6, url),
        variables: { disableSearch: true }
      }
    ])
  }
  if (alToken) {
    const sections = [
      {
        title: 'Continue Watching',
        load: (page = 1, perPage = 50, variables = {}) => {
          const res = userLists.value.then(res => {
            const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'CURRENT').entries
            const ids = mediaList.filter(({ media }) => {
              if (media.status === 'FINISHED') return true
              return media.mediaListEntry?.progress < media.nextAiringEpisode?.episode - 1
            }).map(({ media }) => media.id)
            return alRequest({ method: 'SearchIDS', page, perPage, id: ids, ...Sections.sanitiseObject(variables) })
          })
          return Sections.wrapResponse(res, perPage)
        }
      },
      {
        title: 'Sequels You Missed',
        load: (page = 1, perPage = 50, variables = {}) => {
          const res = userLists.value.then(res => {
            const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'COMPLETED').entries
            const ids = mediaList.flatMap(({ media }) => {
              return media.relations.edges.filter(edge => {
                return edge.relationType === 'SEQUEL'
              })
            }).map(({ node }) => node.id)
            return alRequest({ method: 'SearchIDS', page, perPage, id: ids, ...Sections.sanitiseObject(variables), status: ['FINISHED', 'RELEASING'], onList: false })
          })
          return Sections.wrapResponse(res, perPage)
        }
      },
      {
        title: 'Your List',
        load: (page = 1, perPage = 50, variables = {}) => {
          const res = userLists.value.then(res => {
            const ids = res.data.MediaListCollection.lists.find(({ status }) => status === 'PLANNING').entries.map(({ media }) => media.id)
            return alRequest({ method: 'SearchIDS', page, perPage, id: ids, ...Sections.sanitiseObject(variables) })
          })
          return Sections.wrapResponse(res, perPage)
        }
      }
    ]
    userLists.subscribe(() => {
      const titles = sections.map(({ title }) => title)
      for (const section of manager.sections) {
        if (titles.includes(section.title)) delete section.preview
      }
    })
    manager.add(sections)
  }
  manager.add([
    {
      title: 'Popular This Season',
      variables: { sort: 'POPULARITY_DESC', season: getSeason(date), year: date.getFullYear() }
    },
    {
      title: 'Trending Now', variables: { sort: 'TRENDING_DESC' }
    },
    {
      title: 'All Time Popular', variables: { sort: 'POPULARITY_DESC' }
    },
    {
      title: 'Romance', variables: { sort: 'TRENDING_DESC', genre: 'Romance' }
    },
    {
      title: 'Action', variables: { sort: 'TRENDING_DESC', genre: 'Action' }
    },
    {
      title: 'Adventure', variables: { sort: 'TRENDING_DESC', genre: 'Adventure' }
    },
    {
      title: 'Fantasy', variables: { sort: 'TRENDING_DESC', genre: 'Fantasy' }
    },
    {
      title: 'Comedy', variables: { sort: 'TRENDING_DESC', genre: 'Comedy' }
    }
  ])
</script>

<script>
  import Section from './Section.svelte'
  import Banner from '@/components/banner/Banner.svelte'
  import smoothScroll from '@/modules/scroll.js'
</script>

<div class='h-full w-full overflow-y-scroll root overflow-x-hidden' use:smoothScroll>
  <Banner data={bannerData} />
  <div class='d-flex flex-column h-full w-full'>
    {#each manager.sections as section, i (i)}
      <Section bind:opts={section} />
    {/each}
  </div>
</div>
