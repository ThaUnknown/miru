import { anilistClient, currentSeason, currentYear } from '@/modules/anilist.js'
import { malDubs } from "@/modules/animedubs.js"
import { writable } from 'simple-store-svelte'
import { settings } from '@/modules/settings.js'
import { RSSManager } from '@/modules/rss.js'
import Helper from '@/modules/helper.js'

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
      const hideSubs = search.hideSubs ? { idMal: malDubs.dubLists.value.dubbed } : {}
      const res = (search.hideMyAnime && Helper.isAuthorized()) ? Helper.userLists(search).then(res => {
        // anilist queries do not support mix and match, you have to use the same id includes as excludes, id_not_in cannot be used with idMal_in.
        const hideMyAnime = Helper.isAniAuth() ? { [Object.keys(hideSubs).length > 0 ? 'idMal_not' : 'id_not']: Array.from(new Set(res.data.MediaListCollection.lists.filter(({ status }) => search.hideStatus.includes(status)).flatMap(list => list.entries.map(({ media }) => (Object.keys(hideSubs).length > 0 ? media.idMal : media.id))))) }
              : {idMal_not: res.data.MediaList.filter(({ node }) => search.hideStatus.includes(Helper.statusMap(node.my_list_status.status))).map(({ node }) => node.id)}
        return anilistClient.search({ page, perPage, ...hideSubs, ...hideMyAnime, ...SectionsManager.sanitiseObject(search) })
      }) : anilistClient.search({ page, perPage, ...hideSubs, ...SectionsManager.sanitiseObject(search) })
      return SectionsManager.wrapResponse(res, perPage, type)
    }
  }

  static wrapResponse (res, length, type) {
    res.then(res => {
      hasNextPage.value = res?.data?.Page.pageInfo.hasNextPage
    })
    return Array.from({ length }, (_, i) => ({ type, data: SectionsManager.fromPending(res, i) }))
  }

  static async fromPending (arr, i) {
    const { data } = await arr
    return data?.Page.media[i]
  }

  static sanitiseObject = Helper.sanitiseObject
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
      title: 'Sequels You Missed', variables : { sort: 'POPULARITY_DESC', userList: true, disableHide: true },
      load: (page = 1, perPage = 50, variables = {}) => {
        if (Helper.isMalAuth()) return {} // not going to bother handling this, see below.
        const res = Helper.userLists(variables).then(res => {
          const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'COMPLETED')?.entries
          const excludeIds = res.data.MediaListCollection.lists.reduce((filtered, { status, entries }) => { return (['CURRENT', 'REPEATING', 'COMPLETED', 'DROPPED', 'PAUSED'].includes(status)) ? filtered.concat(entries) : filtered}, []).map(({ media }) => media.id) || []
          if (!mediaList) return {}
          const ids = mediaList.flatMap(({ media }) => {
            return media.relations.edges.filter(edge => edge.relationType === 'SEQUEL')
          }).map(({ node }) => node.id)
          if (!ids.length) return {}
          return anilistClient.searchIDS({ page, perPage, id: ids, id_not: excludeIds, ...SectionsManager.sanitiseObject(variables), status: ['FINISHED', 'RELEASING'] })
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !Helper.isAuthorized() || Helper.isMalAuth() // disable this section when authenticated with MyAnimeList. API for userLists fail to return relations and likely will never be fixed on their end.
    },
    {
      title: 'Continue Watching', variables: { sort: 'UPDATED_TIME_DESC', userList: true, continueWatching: true, disableHide: true },
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = Helper.userLists(variables).then(res => {
          const mediaList = Helper.isAniAuth() ? res.data.MediaListCollection.lists.reduce((filtered, { status, entries }) => {
            return (status === 'CURRENT' || status === 'REPEATING') ? filtered.concat(entries) : filtered
          }, []) : res.data.MediaList.filter(({ node }) => (node.my_list_status.status === Helper.statusMap('CURRENT') || node.my_list_status.is_rewatching))
          if (!mediaList) return {}
          return Helper.getPaginatedMediaList(page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !Helper.isAuthorized()
    },
    {
      title: 'Watching List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, disableHide: true },
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = Helper.userLists(variables).then(res => {
          const mediaList = Helper.isAniAuth()
            ? res.data.MediaListCollection.lists.find(({ status }) => status === 'CURRENT')?.entries
            : res.data.MediaList.filter(({ node }) => node.my_list_status.status === Helper.statusMap('CURRENT'))
          if (!mediaList) return {}
          return Helper.getPaginatedMediaList(page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !Helper.isAuthorized()
    },
    {
      title: 'Completed List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, completedList: true, disableHide: true },
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = Helper.userLists(variables).then(res => {
          const mediaList = Helper.isAniAuth()
            ? res.data.MediaListCollection.lists.find(({ status }) => status === 'COMPLETED')?.entries
            : res.data.MediaList.filter(({ node }) => node.my_list_status.status === Helper.statusMap('COMPLETED'))
          if (!mediaList) return {}
          return Helper.getPaginatedMediaList(page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !Helper.isAuthorized()
    },
    {
      title: 'Planning List', variables : { test: 'Planning', sort: 'POPULARITY_DESC', userList: true, disableHide: true },
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = Helper.userLists(variables).then(res => {
          const mediaList = Helper.isAniAuth()
            ? res.data.MediaListCollection.lists.find(({ status }) => status === 'PLANNING')?.entries
            : res.data.MediaList.filter(({ node }) => node.my_list_status.status === Helper.statusMap('PLANNING'))
          if (!mediaList) return {}
          return Helper.getPaginatedMediaList(page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !Helper.isAuthorized()
    },
    {
      title: 'Paused List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, disableHide: true },
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = Helper.userLists(variables).then(res => {
          const mediaList = Helper.isAniAuth()
            ? res.data.MediaListCollection.lists.find(({ status }) => status === 'PAUSED')?.entries
            : res.data.MediaList.filter(({ node }) => node.my_list_status.status === Helper.statusMap('PAUSED'))
          if (!mediaList) return {}
          return Helper.getPaginatedMediaList(page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !Helper.isAuthorized()
    },
    {
      title: 'Dropped List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, disableHide: true },
      load: (page = 1, perPage = 50, variables = {}) => {
        const res = Helper.userLists(variables).then(res => {
          const mediaList = Helper.isAniAuth()
            ? res.data.MediaListCollection.lists.find(({ status }) => status === 'DROPPED')?.entries
            : res.data.MediaList.filter(({ node }) => node.my_list_status.status === Helper.statusMap('DROPPED'))
          if (!mediaList) return {}
          return Helper.getPaginatedMediaList(page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !Helper.isAuthorized()
    },
    // common, non-user specific sections
    { title: 'Popular This Season', variables: { sort: 'POPULARITY_DESC', season: currentSeason, year: currentYear, hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Trending Now', variables: { sort: 'TRENDING_DESC', hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'All Time Popular', variables: { sort: 'POPULARITY_DESC', hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Romance', variables: { sort: 'TRENDING_DESC', genre: ['Romance'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Action', variables: { sort: 'TRENDING_DESC', genre: ['Action'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Adventure', variables: { sort: 'TRENDING_DESC', genre: ['Adventure'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Fantasy', variables: { sort: 'TRENDING_DESC', genre: ['Fantasy'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } }
  ]
}