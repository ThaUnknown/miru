import { anilistClient, currentSeason, currentYear } from '@/modules/anilist.js'
import { writable } from 'simple-store-svelte'
import { settings, alToken } from '@/modules/settings.js'
import { RSSManager } from '@/modules/rss.js'

export const hasNextPage = writable(true)

export default class SectionsManager {
  constructor (data = []) {
    this.sections = []
    for (const section of data) this.add(section)
  }

  /**
   * @param {object} data
   */
  add (data) {
    if (!data) return
    const { title, variables = {}, type, load = SectionsManager.createFallbackLoad(variables, type), preview = writable() } = data
    const section = { ...data, load, title, preview, variables }
    this.sections.push(section)
    return section
  }

  static createFallbackLoad (variables, type) {
    return (page = 1, perPage = 50, search = variables) => {
      const options = { page, perPage, ...SectionsManager.sanitiseObject(search) }
      const res = anilistClient.search(options)
      return SectionsManager.wrapResponse(res, perPage, type)
    }
  }

  static wrapResponse (res, length, type) {
    res.then(res => {
      hasNextPage.value = res?.data?.Page.pageInfo.hasNextPage
    })
    return Array.from({ length }, (_, i) => ({ type, data: SectionsManager.fromPending(res, i) }))
  }

  static sanitiseObject (object = {}) {
    const safe = {}
    for (const [key, value] of Object.entries(object)) {
      if (value) safe[key] = value
    }
    return safe
  }

  static async fromPending (arr, i) {
    const { data } = await arr
    return data?.Page.media[i]
  }
}

// list of all possible home screen sections
export let sections = []

settings.subscribe(() => {
  for (const section of sections) clearInterval(section.interval)
  sections = createSections()
})

function createSections () {
  return [
  // RSS feeds
    ...settings.value.rssFeedsNew.map(([title, url]) => {
      const section = {
        title,
        load: (page = 1, perPage = 12) => RSSManager.getMediaForRSS(page, perPage, url),
        preview: writable(RSSManager.getMediaForRSS(1, 12, url)),
        variables: { disableSearch: true },
        isRSS: true
      }

      // update every 30 seconds
      section.interval = setInterval(async () => {
        if (await RSSManager.getContentChanged(1, 12, url)) {
          section.preview.value = RSSManager.getMediaForRSS(1, 12, url, true)
        }
      }, 30000)

      return section
    }),
    // user specific sections
    {
      title: 'Continue Watching',
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(async res => {
          const mediaList = res.data.MediaListCollection.lists.reduce((filtered, { status, entries }) => {
            return (status === 'CURRENT' || status === 'REPEATING') ? filtered.concat(entries) : filtered
          }, [])
          const ids = mediaList.filter(({ media }) => {
            if (media.status === 'FINISHED') return true
            return media.mediaListEntry?.progress < media.nextAiringEpisode?.episode - 1
          }).map(({ media }) => media.id)
          if (!ids.length) return {}
          // if custom search is used, respect it, otherwise sort by last updated
          if (Object.values(variables).length !== 0) {
            return anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) })
          }

          const index = (page - 1) * perPage
          const idsRes = await anilistClient.searchIDS({ page, perPage, id: ids.slice(index, index + perPage), ...SectionsManager.sanitiseObject(variables) })
          idsRes.data.Page.media.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
          return idsRes
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Sequels You Missed',
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(res => {
          const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'COMPLETED')?.entries
          if (!mediaList) return {}
          const ids = mediaList.flatMap(({ media }) => {
            return media.relations.edges.filter(edge => edge.relationType === 'SEQUEL')
          }).map(({ node }) => node.id)
          if (!ids.length) return {}
          return anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables), status: ['FINISHED', 'RELEASING'], onList: false })
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Your List',
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(res => {
          const ids = res.data.MediaListCollection.lists.find(({ status }) => status === 'PLANNING')?.entries.map(({ media }) => media.id)
          if (!ids) return {}
          return anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) })
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Completed List',
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(res => {
          const ids = res.data.MediaListCollection.lists.find(({ status }) => status === 'COMPLETED')?.entries.map(({ media }) => media.id)
          if (!ids) return {}
          return anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) })
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Paused List',
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(res => {
          const ids = res.data.MediaListCollection.lists.find(({ status }) => status === 'PAUSED')?.entries.map(({ media }) => media.id)
          if (!ids) return {}
          return anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) })
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Dropped List',
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(res => {
          const ids = res.data.MediaListCollection.lists.find(({ status }) => status === 'DROPPED')?.entries.map(({ media }) => media.id)
          if (!ids) return {}
          return anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) })
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Currently Watching List',
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(res => {
          const ids = res.data.MediaListCollection.lists.find(({ status }) => status === 'CURRENT')?.entries.map(({ media }) => media.id)
          if (!ids) return {}
          return anilistClient.searchIDS({ page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) })
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    // common, non-user specific sections
    { title: 'Popular This Season', variables: { sort: 'POPULARITY_DESC', season: currentSeason, year: currentYear } },
    { title: 'Trending Now', variables: { sort: 'TRENDING_DESC' } },
    { title: 'All Time Popular', variables: { sort: 'POPULARITY_DESC' } },
    { title: 'Romance', variables: { sort: 'TRENDING_DESC', genre: 'Romance' } },
    { title: 'Action', variables: { sort: 'TRENDING_DESC', genre: 'Action' } },
    { title: 'Adventure', variables: { sort: 'TRENDING_DESC', genre: 'Adventure' } },
    { title: 'Fantasy', variables: { sort: 'TRENDING_DESC', genre: 'Fantasy' } }
  ]
}
