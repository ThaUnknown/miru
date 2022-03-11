import { set } from '@/lib/pages/Settings.svelte'
import { DOMPARSER } from './util.js'
import { add } from './torrent.js'
import { episodeRx } from './anime.js'

const settings = set

export function getRSSContent (url) {
  return fetch(url).then(res => {
    if (res.ok) {
      return res.text().then(xmlTxt => {
        return DOMPARSER(xmlTxt, 'text/xml')
      })
    }
    throw Error(res.statusText)
  }).catch(error => {
    // halfmoon.initStickyAlert({
    //   content: 'Failed fetching RSS!<br>' + error,
    //   title: 'Search Failed',
    //   alertType: 'alert-danger',
    //   fillType: ''
    // })
    console.error(error)
  })
}

export async function nyaaRss (media, episode, isOffline) {
  const frag = document.createDocumentFragment()
  const titles = [...new Set(Object.values(media.title).concat(media.synonyms).filter(name => name != null))].join(')|(').replace(/&/g, '%26')
  const ep = (media.episodes !== 1 && ((media.status === 'FINISHED' && settings.torrent9) ? `"01-${media.episodes}"|"01~${media.episodes}"|"Batch"|"Complete"|"+${episode}+"|"+${episode}v"|"S01"` : `"+${episode}+"|"+${episode}v"`)) || ''
  const excl = ['DTS', 'AC3', 'HEVC', 'x265', 'H.265'].join('|')
  const quality = `${settings.torrent1}` || '"1080p"'
  const trusted = settings.torrent3 === true ? 2 : 0
  const url = new URL(`https://meow.miru.workers.dev/?page=rss&c=1_2&f=${trusted}&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`)

  const nodes = (await getRSSContent(url)).querySelectorAll('item *')
  if (!nodes.length) return frag
  const entries = []
  for (let index = Math.floor(nodes.length / 15); index--;) {
    const position = index * 15
    entries[index] = {
      title: nodes[position].textContent,
      hash: nodes[position + 1].textContent,
      seeders: nodes[position + 4].textContent,
      leechers: nodes[position + 5].textContent,
      downloads: nodes[position + 6].textContent,
      size: nodes[position + 10].textContent
    }
  }
  entries.sort((a, b) => b.seeders - a.seeders)
  const streamingEpisode = media?.streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(episode))[0]
  const fileMedia = {
    mediaTitle: media?.title.userPreferred,
    episodeNumber: Number(episode),
    episodeTitle: streamingEpisode ? episodeRx.exec(streamingEpisode.title)[2] : undefined,
    episodeThumbnail: streamingEpisode?.thumbnail,
    mediaCover: media?.coverImage.medium,
    name: 'Miru',
    media: media
  }
  if (settings.torrent2) {
    add(entries[0].hash)
    // { media: fileMedia, episode: episode }
  }
  entries.forEach((entry, index) => {
    const template = document.createElement('tr')
    template.innerHTML += `
<th>${(index + 1)}</th>
<td>${entry.title}</td>
<td>${entry.size}</td>
<td>${entry.seeders}</td>
<td>${entry.leechers}</td>
<td>${entry.downloads}</td>
<td class="pointer">Play</td>`
    template.onclick = () => {
      add(entry.hash)
      // { media: fileMedia, episode: episode }
    }
    frag.appendChild(template)
  })
  return frag
}

export function getRSSurl () {
  // TODO: settings shit
  return 'https://nyaa.si/?page=rss&c=0_0&f=0&u=subsplease&q="1080"'
  // if (Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0]) {
  //   return new URL(Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0].textContent + settings.torrent1)
  // } else {
  //   return new URL(settings.torrent4 + settings.torrent1) // add custom RSS
  // }
}
