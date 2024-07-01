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
      if (search.hideMyAnime) {
        const res = anilistClient.userLists.value.then(res => {
          const ids = Array.from(new Set(res.data.MediaListCollection.lists.filter(({ status }) => search.hideStatus.includes(status)).flatMap(list => list.entries.map(({ media }) => media.id))));
          return anilistClient.search({ page, perPage, id_not: ids, ...SectionsManager.sanitiseObject(search) })
        })
        return SectionsManager.wrapResponse(res, perPage, type)
      } else {
        const res = anilistClient.search({ page, perPage, ...SectionsManager.sanitiseObject(search) })
        return SectionsManager.wrapResponse(res, perPage, type)
      }
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
  
  static isUserSort(variables) {
    return ['UPDATED_TIME_DESC', 'STARTED_ON_DESC', 'FINISHED_ON_DESC', 'PROGRESS_DESC', 'USER_SCORE_DESC'].includes(variables.sort);
  }

  static async getPaginatedMediaList(_page, perPage, variables, mediaList) {
    const ids = mediaList.filter(({ media }) => {
      if ((!variables.search || (media.title.userPreferred && media.title.userPreferred.toLowerCase().includes(variables.search.toLowerCase())) || (media.title.english && media.title.english.toLowerCase().includes(variables.search.toLowerCase())) || (media.title.romaji && media.title.romaji.toLowerCase().includes(variables.search.toLowerCase())) || (media.title.native && media.title.native.toLowerCase().includes(variables.search.toLowerCase()))) &&
        (!variables.genre || variables.genre.map(genre => genre.trim().toLowerCase()).every(genre => media.genres.map(genre => genre.trim().toLowerCase()).includes(genre))) &&
        (!variables.tag || variables.tag.map(tag => tag.trim().toLowerCase()).every(tag => media.tags.map(tag => tag.name.trim().toLowerCase()).includes(tag))) &&
        (!variables.season || variables.season === media.season) &&
        (!variables.year || variables.year === media.seasonYear) &&
        (!variables.format || variables.format === media.format) &&
        (!variables.status || variables.status === media.status) &&
        (!variables.continueWatching || (media.status === 'FINISHED' || media.mediaListEntry?.progress < media.nextAiringEpisode?.episode - 1))) {
        return true;
      }
    }).map(({ media }) => (this.isUserSort(variables) ? media : media.id));
    if (!ids.length) return {}
    if (this.isUserSort(variables)) {
      const startIndex = (perPage * (_page - 1));
      const endIndex = startIndex + perPage;
      const paginatedIds = ids.slice(startIndex, endIndex);
      const hasNextPage = ids.length > endIndex;
      return {
        data: {
          Page: {
            pageInfo: {
              hasNextPage: hasNextPage
            },
            media: paginatedIds
          }
        }
      }
    } else {
      return anilistClient.searchIDS({ _page, perPage, id: ids, ...SectionsManager.sanitiseObject(variables) })
    }
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
      title: 'Sequels You Missed', variables : { disableHide: true },
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
      title: 'Continue Watching', variables: { sort: 'UPDATED_TIME_DESC', userList: true, continueWatching: true, disableHide: true },
      load: (_page = 1, perPage = 50, variables = {}) => {
        const userLists = (!SectionsManager.isUserSort(variables) || variables.sort === 'UPDATED_TIME_DESC') ? anilistClient.userLists.value : anilistClient.getUserLists({ sort: variables.sort })
        const res = userLists.then(res => {
          const mediaList = res.data.MediaListCollection.lists.reduce((filtered, { status, entries }) => {
            return (status === 'CURRENT' || status === 'REPEATING') ? filtered.concat(entries) : filtered
          }, []);
          if (!mediaList) return {}
          return SectionsManager.getPaginatedMediaList(_page, perPage, variables, mediaList)
        });
        return SectionsManager.wrapResponse(res, perPage);
      },
      hide: !alToken
    },
    {
      title: 'Watching List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, disableHide: true },
      load: (_page = 1, perPage = 50, variables = {}) => {
        const userLists = (!SectionsManager.isUserSort(variables) || variables.sort === 'UPDATED_TIME_DESC') ? anilistClient.userLists.value : anilistClient.getUserLists({ sort: variables.sort })
        const res = userLists.then(res => {
          const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'CURRENT')?.entries
          if (!mediaList) return {}
          return SectionsManager.getPaginatedMediaList(_page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Completed List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, completedList: true, disableHide: true },
      load: (_page = 1, perPage = 50, variables = {}) => {
        const userLists = (!SectionsManager.isUserSort(variables) || variables.sort === 'UPDATED_TIME_DESC') ? anilistClient.userLists.value : anilistClient.getUserLists({ sort: variables.sort })
        const res = userLists.then(res => {
          const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'COMPLETED')?.entries
          if (!mediaList) return {}
          return SectionsManager.getPaginatedMediaList(_page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Planning List', variables : { sort: 'POPULARITY_DESC', userList: true, disableHide: true },
      load: (_page = 1, perPage = 50, variables = {}) => {
        const res = anilistClient.userLists.value.then(res => {
          const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'PLANNING')?.entries
          if (!mediaList) return {}
          return SectionsManager.getPaginatedMediaList(_page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Paused List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, disableHide: true },
      load: (_page = 1, perPage = 50, variables = {}) => {
        const userLists = (!SectionsManager.isUserSort(variables) || variables.sort === 'UPDATED_TIME_DESC') ? anilistClient.userLists.value : anilistClient.getUserLists({ sort: variables.sort })
        const res = userLists.then(res => {
          const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'PAUSED')?.entries
          if (!mediaList) return {}
          return SectionsManager.getPaginatedMediaList(_page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    {
      title: 'Dropped List', variables : { sort: 'UPDATED_TIME_DESC', userList: true, disableHide: true },
      load: (_page = 1, perPage = 50, variables = {}) => {
        const userLists = (!SectionsManager.isUserSort(variables) || variables.sort === 'UPDATED_TIME_DESC') ? anilistClient.userLists.value : anilistClient.getUserLists({ sort: variables.sort })
        const res = userLists.then(res => {
          const mediaList = res.data.MediaListCollection.lists.find(({ status }) => status === 'DROPPED')?.entries
          if (!mediaList) return {}
          return SectionsManager.getPaginatedMediaList(_page, perPage, variables, mediaList)
        })
        return SectionsManager.wrapResponse(res, perPage)
      },
      hide: !alToken
    },
    // common, non-user specific sections
    { title: 'Popular This Season', variables: { sort: 'POPULARITY_DESC', season: currentSeason, year: currentYear, hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Trending Now', variables: { sort: 'TRENDING_DESC', hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'All Time Popular', variables: { sort: 'POPULARITY_DESC', hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Romance', variables: { sort: 'TRENDING_DESC', genre: ['Romance'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Action', variables: { sort: 'TRENDING_DESC', genre: ['Action'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Adventure', variables: { sort: 'TRENDING_DESC', genre: ['Adventure'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Fantasy', variables: { sort: 'TRENDING_DESC', genre: ['Fantasy'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } },
    { title: 'Comedy', variables: { sort: 'TRENDING_DESC', genre: ['Comedy'], hideMyAnime: settings.value.hideMyAnime, hideStatus: ['COMPLETED', 'DROPPED'] } }
  ]
}