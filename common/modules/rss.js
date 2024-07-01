import { DOMPARSER } from '@/modules/util.js'
import { settings } from '@/modules/settings.js'
import { toast } from 'svelte-sonner'
import { add } from '@/modules/torrent.js'
import { getEpisodeMetadataForMedia } from './anime.js'
import AnimeResolver from '@/modules/animeresolver.js'
import { hasNextPage } from '@/modules/sections.js'
import IPC from '@/modules/ipc.js'

export const exclusions = ['DTS', '[EMBER]']
const isDev = location.hostname === 'localhost'

const video = document.createElement('video')

if (!isDev && !video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"')) {
  exclusions.push('HEVC', 'x265', 'H.265')
}
if (!isDev && !video.canPlayType('audio/mp4; codecs="ac-3"')) {
  exclusions.push('AC3', 'AC-3')
}
if (!('audioTracks' in HTMLVideoElement.prototype)) {
  exclusions.push('DUAL')
}
video.remove()

export function parseRSSNodes (nodes) {
  return nodes.map(item => {
    const pubDate = item.querySelector('pubDate')?.textContent

    return {
      title: item.querySelector('title')?.textContent || '?',
      link: item.querySelector('enclosure')?.attributes.url.value || item.querySelector('link')?.textContent || '?',
      seeders: item.querySelector('seeders')?.textContent ?? '?',
      leechers: item.querySelector('leechers')?.textContent ?? '?',
      downloads: item.querySelector('downloads')?.textContent ?? '?',
      size: item.querySelector('size')?.textContent ?? '?',
      date: pubDate && new Date(pubDate)
    }
  })
}

const rssmap = {
  SubsPlease: settings.value.toshoURL + 'rss2?qx=1&q="[SubsPlease] "',
  'Erai-raws [Multi-Sub]': settings.value.toshoURL + 'rss2?qx=1&q="[Erai-raws] "',
  'Yameii [Dubbed]': settings.value.toshoURL + 'rss2?qx=1&q="[Yameii] "',
  'Judas [Small Size]': settings.value.toshoURL + 'rss2?qx=1&q="[Judas] "'
}
export function getReleasesRSSurl (val) {
  const rss = rssmap[val] || val
  return rss && new URL(rssmap[val] ? `${rss}${settings.value.rssQuality ? `"${settings.value.rssQuality}"` : ''}` : rss)
}

export async function getRSSContent (url) {
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('Failed fetching RSS!\n' + res.statusText)
    }
    return DOMPARSER(await res.text(), 'text/xml')
  } catch (e) {
    throw new Error('Failed fetching RSS!\n' + e.message)
  }
}

class RSSMediaManager {
  constructor () {
    this.resultMap = {}
  }

  getMediaForRSS (page, perPage, url, ignoreErrors) {
    const res = this._getMediaForRSS(page, perPage, url)
    if (!ignoreErrors) {
      res.catch(e => {
        toast.error('Search Failed', {
          description: 'Failed fetching RSS!\n' + e.message
        })
        console.error('Failed to fetch rss', e)
      })
    }
    return Array.from({ length: perPage }, (_, i) => ({ type: 'episode', data: this.fromPending(res, i) }))
  }

  async fromPending (result, i) {
    const array = await result
    return array[i]
  }

  async getContentChanged (page, perPage, url) {
    const content = await getRSSContent(getReleasesRSSurl(url))

    if (!content) return false

    const pubDate = +(new Date(content.querySelector('pubDate').textContent)) * page * perPage
    if (this.resultMap[url]?.date === pubDate) return false
    return { content, pubDate }
  }

  async _getMediaForRSS (page, perPage, url) {
    const changed = await this.getContentChanged(page, perPage, url)
    if (!changed) return this.resultMap[url].result

    const index = (page - 1) * perPage
    const targetPage = [...changed.content.querySelectorAll('item')].slice(index, index + perPage)
    const items = parseRSSNodes(targetPage)
    hasNextPage.value = items.length === perPage
    const result = this.structureResolveResults(items)

    this.findNewReleasesAndNotify(result, this.resultMap[url]?.date)

    this.resultMap[url] = {
      date: changed.pubDate,
      result
    }
    return result
  }

  async findNewReleasesAndNotify (results, oldDate) {
    if (!oldDate) return

    const res = await Promise.all(await results)
    const newReleases = res.filter(({ date }) => date > oldDate)

    for (const { media, parseObject, episode } of newReleases) {
      const options = {
        title: media?.title.userPreferred || parseObject.anime_title,
        body: `Episode ${episode || 1} is out!`,
        icon: media?.coverImage.medium,
        data: { id: media?.id }
      }
      IPC.emit('notification', options)
    }
  }

  async structureResolveResults (items) {
    const results = await AnimeResolver.resolveFileAnime(items.map(item => item.title))
    return results.map(async (result, i) => {
      const res = {
        ...result,
        episodeData: undefined,
        date: undefined,
        onclick: undefined
      }
      if (res.media?.id) {
        try {
          res.episodeData = (await getEpisodeMetadataForMedia(res.media))?.[res.episode]
        } catch (e) {
          console.warn('failed fetching episode metadata', e)
        }
      }
      res.date = items[i].date
      res.onclick = () => add(items[i].link)
      return res
    })
  }
}

export const RSSManager = new RSSMediaManager()
