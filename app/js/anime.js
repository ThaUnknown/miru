/* eslint-env browser */
/* global searchText, navNowPlaying */
import { client } from './main.js'
import { searchParams, DOMPARSER, countdown } from './util.js'
import { alRequest } from './anilist.js'
import { nyaaRss } from './rss.js'
import { viewMedia } from './interface.js'
import halfmoon from 'halfmoon'
import anitomyscript from 'anitomyscript'
const torrentRx = /(^magnet:){1}|(^[A-F\d]{8,40}$){1}|(.*\.torrent$){1}/i
const imageRx = /\.(jpeg|jpg|gif|png|webp)/i
window.addEventListener('paste', async e => { // WAIT image lookup on paste, or add torrent on paste
  const item = e.clipboardData.items[0]
  if (item && item.type.indexOf('image') === 0) {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = e => {
      traceAnime(e.target.result, 'uri')
    }
    reader.readAsDataURL(item.getAsFile())
  } else if (item && item.type === 'text/plain') {
    item.getAsString(text => {
      if (torrentRx.exec(text)) {
        e.preventDefault()
        searchText.value = ''
        client.playTorrent(text)
      } else if (imageRx.exec(text)) {
        e.preventDefault()
        searchText.value = ''
        traceAnime(text)
      }
    })
  } else if (item && item.type === 'text/html') {
    item.getAsString(text => {
      const img = DOMPARSER(text, 'text/html').querySelectorAll('img')[0]
      if (img) {
        e.preventDefault()
        searchText.value = ''
        traceAnime(img.src)
      }
    })
  }
})
if (searchParams.get('link')) {
  traceAnime(searchParams.get('link'))
  window.location = '/app/#home'
}
function traceAnime (image, type) { // WAIT lookup logic
  halfmoon.initStickyAlert({
    content: `Looking up anime for image.<br><img class="w-200 rounded pt-5" src="${image}">`
  })
  let options
  let url = `https://trace.moe/api/search?url=${image}`
  if (type === 'uri') {
    options = {
      method: 'POST',
      body: JSON.stringify({ image: image }),
      headers: { 'Content-Type': 'application/json' }
    }
    url = 'https://trace.moe/api/search'
  }
  fetch(url, options).then(res => res.json()).then(async result => {
    if (result.docs[0].similarity >= 0.85) {
      const res = await alRequest({ method: 'SearchIDSingle', id: result.docs[0].anilist_id })
      viewMedia(res.data.Media)
    } else {
      halfmoon.initStickyAlert({
        content: 'Couldn\'t find anime for specified image! Try to remove black bars, or use a more detailed image.',
        title: 'Search Failed',
        alertType: 'alert-danger',
        fillType: ''
      })
    }
  })
}
// events
navNowPlaying.onclick = () => viewMedia(client.nowPlaying?.media)
// AL lookup logic

// these really shouldnt be global
const detailsfrag = document.createDocumentFragment()
const details = {
  averageScore: 'Average Score',
  // duration: "Episode Duration",
  // episodes: "Episodes",
  // format: "Format",
  genres: 'Genres',
  // season: "Season",
  // seasonYear: "Year",
  status: 'Status',
  english: 'English',
  romaji: 'Romaji',
  native: 'Native',
  synonyms: 'Synonyms'
}
export const episodeRx = /Episode (\d+) - (.*)/
// this is fucked beyond belief, this is why you use frameworks
/* global view, viewImg, viewTitle, viewDesc, viewDetails, viewSeason, viewMediaInfo, viewPlay, viewTrailer, viewRelationsGallery, viewSynonym, viewSynonymText, viewEpisodesWrapper, episodes, trailerVideo, trailerClose */
export function viewAnime (media) {
  halfmoon.showModal('view')
  view.setAttribute('style', `background-image: url(${media.bannerImage}) !important`)
  viewImg.src = media.coverImage.extraLarge
  viewTitle.innerHTML = media.title.userPreferred
  viewDesc.innerHTML = media.description || ''

  viewDetails.innerHTML = ''
  detailsCreator(media)
  viewDetails.appendChild(detailsfrag)
  if (media.nextAiringEpisode) {
    const temp = document.createElement('p')
    temp.innerHTML = `<span class="font-weight-bold">Airing</span><br><span class="text-muted"> Episode ${media.nextAiringEpisode.episode}: ${countdown(media.nextAiringEpisode.timeUntilAiring)}</span>`
    viewDetails.prepend(temp)
  }
  viewSeason.innerHTML = `${(media.season ? media.season.toLowerCase() + ' ' : '') + (media.seasonYear ? media.seasonYear : '')}`
  viewMediaInfo.innerHTML = `${media.format ? '<span>' + media.format + '</span>' : ''}${media.episodes ? '<span>' + media.episodes + ' Episodes</span>' : ''}${media.duration ? '<span>' + media.duration + ' Minutes</span>' : ''}`
  viewPlay.onclick = () => { nyaaSearch(media, 1); halfmoon.toggleModal('view') }
  if (media.trailer) {
    viewTrailer.removeAttribute('disabled', '')
    viewTrailer.onclick = () =>
      trailerPopup(media.trailer)
  } else {
    viewTrailer.setAttribute('disabled', '')
  }
  if (media.status === 'NOT_YET_RELEASED') {
    viewPlay.setAttribute('disabled', '')
  } else {
    viewPlay.removeAttribute('disabled', '')
  }
  if (media.relations.edges.length) {
    viewRelationsGallery.classList.remove('d-none')
    viewRelationsGallery.innerHTML = ''
    const frag = document.createDocumentFragment()
    media.relations.edges.forEach(edge => {
      const template = document.createElement('div')
      template.classList.add('card', 'm-0', 'p-0')
      template.innerHTML = `
            <div class="row h-full">
            <div class="col-4">
                <img loading="lazy" src="${edge.node.coverImage.medium}"
                    class="cover-img w-full h-full">
            </div>
            <div class="col-8 h-full card-grid">
                <div class="px-15 py-10">
                    <p class="m-0 text-capitalize font-weight-bold font-size-14">
                        ${edge.node.title.userPreferred}
                    </p>
                    <p class="m-0 text-capitalize font-size-12">
                        ${edge.relationType.toLowerCase()}
                    </p>
                </div>
                <span>
                </span>
                <div class="px-15 pb-10 pt-5 details text-capitalize font-size-12">
                    <span>${edge.node.type.toLowerCase()}</span><span>${edge.node.status.toLowerCase()}</span>
                </div>
            </div>
        </div>`
      template.onclick = async () => {
        halfmoon.hideModal('view')
        const res = await alRequest({ method: 'SearchIDSingle', id: edge.node.id })
        viewAnime(res.data.Media)
      }
      frag.appendChild(template)
    })
    viewRelationsGallery.appendChild(frag)
  } else {
    viewRelationsGallery.classList.add('d-none')
  }
  viewSynonym.onclick = () => {
    relations[viewSynonymText.value] = media.id
    viewSynonymText.value = ''
    localStorage.setItem('relations', JSON.stringify(relations))
  }
  episodes.innerHTML = ''
  if (media.streamingEpisodes.length) {
    viewEpisodesWrapper.classList.add('remove')
    const frag = document.createDocumentFragment()
    media.streamingEpisodes.forEach(episode => {
      const temp = document.createElement('div')
      temp.classList.add('position-relative', 'w-250', 'rounded', 'mr-10', 'overflow-hidden', 'pointer')
      temp.innerHTML = `
            <img loading="lazy" src="${episode.thumbnail}" class="w-full h-full">
            <div class="position-absolute ep-title w-full p-10 text-truncate bottom-0">${episode.title}</div>`
      temp.onclick = () => { nyaaSearch(media, episodeRx.exec(episode.title)[1]); halfmoon.toggleModal('view') }
      frag.appendChild(temp)
    })
    episodes.appendChild(frag)
  } else {
    viewEpisodesWrapper.classList.add('hidden')
  }
}
trailerClose.onclick = () => {
  trailerVideo.src = ''
}
function trailerPopup (trailer) {
  trailerVideo.src = ''
  halfmoon.toggleModal('trailer')
  switch (trailer.site) { // should support the other possible sites too, but i cant find any examples
    case 'youtube':
      trailerVideo.src = 'https://www.youtube.com/embed/' + trailer.id
      break
  }
}
// details list factory
function detailsCreator (entry) {
  if (entry) {
    Object.entries(entry).forEach(value => {
      const template = document.createElement('p')
      if (typeof value[1] === 'object') {
        if (Array.isArray(value[1])) {
          if (details[value[0]] && value[1].length > 0) {
            template.innerHTML = `<span class="font-weight-bold">${details[value[0]]}</span><br><span class="text-muted">${value[1].map(key => (key)).join(', ')}</span>`
            detailsfrag.appendChild(template)
          }
        } else {
          detailsCreator(value[1])
        }
      } else {
        if (details[value[0]]) {
          template.innerHTML = `<span class="font-weight-bold">${details[value[0]]}</span><br><span class="text-muted">${value[1].toString()}</span>`
          detailsfrag.appendChild(template)
        }
      }
    })
  }
}

export async function nyaaSearch (media, episode, isOffline) {
  if (parseInt(episode) < 10) {
    episode = `0${episode}`
  }

  const table = document.querySelector('tbody.results')
  const results = await nyaaRss(media, episode, isOffline)

  if (results.children.length === 0) {
    halfmoon.initStickyAlert({
      content: `Couldn't find torrent for ${media.title.userPreferred} Episode ${parseInt(episode)}! Try specifying a torrent manually.`,
      title: 'Search Failed',
      alertType: 'alert-danger',
      fillType: ''
    })
  } else {
    table.innerHTML = ''
    table.appendChild(results)
    halfmoon.toggleModal('tsearch')
  }
}

// resolve anime name based on file name and store it

export async function resolveFileMedia (opts) {
  // opts.fileName opts.isRelease

  async function resolveTitle (title) {
    if (!(title in relations)) {
      // resolve name and shit
      let method, res
      if (opts.isRelease) {
        method = { name: title, method: 'SearchName', perPage: 1, status: ['RELEASING'], sort: 'SEARCH_MATCH' }
        // maybe releases should include this and last season? idfk
      } else {
        method = { name: title, method: 'SearchName', perPage: 1, status: ['RELEASING', 'FINISHED'], sort: 'SEARCH_MATCH' }
      }
      res = await alRequest(method)
      if (!res.data.Page.media[0]) {
        const index = method.name.search(/S\d/)
        method.name = ((index !== -1 && method.name.slice(0, index) + method.name.slice(index + 1, method.name.length)) || method.name).replace('(TV)', '').replace(/ (19[5-9]\d|20[0-6]\d)/, '').replace('-', '')
        method.status = ['RELEASING', 'FINISHED']
        res = await alRequest(method)
      }
      if (res.data.Page.media[0]) {
        relations[title] = res.data.Page.media[0].id
      } else {
        relations[title] = null
      }
    }
  }
  const parsePromises = opts.fileName.constructor === Array
    ? opts.fileName.map(name => anitomyscript(name))
    : [anitomyscript(opts.fileName)]
  const parseObjs = await Promise.all(parsePromises)
  await Promise.all([...new Set(parseObjs.map(obj => obj.anime_title))].map(title => resolveTitle(title)))
  const assoc = {}
  for (const media of (await alRequest({ method: 'SearchIDS', id: [...new Set(parseObjs.map(obj => relations[obj.anime_title]))], perPage: 50 })).data.Page.media) assoc[media.id] = media
  const fileMedias = []
  for (const praseObj of parseObjs) {
    let episode
    let media = assoc[relations[praseObj.anime_title]]
    async function resolveSeason (opts) {
      // opts.media, opts.episode, opts.increment, opts.offset
      let epMin, epMax
      if (opts.episode.constructor === Array) { // support batch episode ranges
        epMin = Number(opts.episode[0])
        epMax = Number(opts.episode[opts.episode.length - 1])
      } else {
        epMin = epMax = Number(opts.episode)
      }
      let tempMedia, increment
      if (opts.media.relations.edges.some(edge => edge.relationType === 'PREQUEL' && (edge.node.format === 'TV' || 'TV_SHORT')) && !opts.increment) {
        // media has prequel and we dont want to move up in the tree
        tempMedia = opts.media.relations.edges.filter(edge => edge.relationType === 'PREQUEL' && (edge.node.format === 'TV' || 'TV_SHORT'))[0].node
      } else if (opts.media.relations.edges.some(edge => edge.relationType === 'SEQUEL' && (edge.node.format === 'TV' || 'TV_SHORT'))) {
        // media doesnt have prequel, or we want to move up in the tree
        tempMedia = opts.media.relations.edges.filter(edge => edge.relationType === 'SEQUEL' && (edge.node.format === 'TV' || 'TV_SHORT'))[0].node
        increment = true
      }
      if (tempMedia?.episodes && epMax - (opts.offset + tempMedia.episodes) > (media.nextAiringEpisode?.episode || media.episodes)) {
        // episode is still out of bounds
        const nextEdge = await alRequest({ method: 'SearchIDSingle', id: tempMedia.id })
        await resolveSeason({ media: nextEdge.data.Media, episode: opts.episode, offset: opts.offset + nextEdge.data.Media.episodes, increment: increment })
      } else if (tempMedia?.episodes && epMax - (opts.offset + tempMedia.episodes) <= (media.nextAiringEpisode?.episode || media.episodes) && epMin - (opts.offset + tempMedia.episodes) > 0) {
        // episode is in range, seems good! overwriting media to count up "seasons"
        if (opts.episode.constructor === Array) {
          episode = `${praseObj.episode_number[0] - (opts.offset + tempMedia.episodes)} ~ ${praseObj.episode_number[praseObj.episode_number.length - 1] - (opts.offset + tempMedia.episodes)}`
        } else {
          episode = opts.episode - (opts.offset + tempMedia.episodes)
        }
        if (opts.increment || increment) {
          const nextEdge = await alRequest({ method: 'SearchIDSingle', id: tempMedia.id })
          media = nextEdge.data.Media
        }
      } else {
        console.log('error in parsing!', opts.media, tempMedia)
        // something failed, most likely couldnt find an edge or processing failed, force episode number even if its invalid/out of bounds, better than nothing
        if (opts.episode.constructor === Array) {
          episode = `${Number(praseObj.episode_number[0])} ~ ${Number(praseObj.episode_number[praseObj.episode_number.length - 1])}`
        } else {
          episode = Number(opts.episode)
        }
      }
    }

    // resolve episode, if movie, dont.
    if ((media?.format !== 'MOVIE' || (media.episodes || media.nextAiringEpisode.episode)) && praseObj.episode_number) {
      if (praseObj.episode_number.constructor === Array) {
      // is an episode range
        if (parseInt(praseObj.episode_number[0]) === 1) {
        // if it starts with #1 and overflows then it includes more than 1 season in a batch, cant fix this cleanly, name is parsed per file basis so this shouldnt be an issue
          episode = `${praseObj.episode_number[0]} ~ ${praseObj.episode_number[praseObj.episode_number.length - 1]}`
        } else {
          if ((media?.episodes || media?.nextAiringEpisode?.episode) && parseInt(praseObj.episode_number[praseObj.episode_number.length - 1]) > (media.episodes || media.nextAiringEpisode.episode)) {
          // if highest value is bigger than episode count or latest streamed episode +1 for safety, parseint to math.floor a number like 12.5 - specials - in 1 go
            await resolveSeason({ media: media, episode: praseObj.episode_number, offset: 0 })
          } else {
          // cant find ep count or range seems fine
            episode = `${Number(praseObj.episode_number[0])} ~ ${Number(praseObj.episode_number[praseObj.episode_number.length - 1])}`
          }
        }
      } else {
        if ((media?.episodes || media?.nextAiringEpisode?.episode) && parseInt(praseObj.episode_number) > (media.episodes || media.nextAiringEpisode.episode)) {
        // value bigger than episode count
          await resolveSeason({ media: media, episode: praseObj.episode_number, offset: 0 })
        } else {
        // cant find ep count or episode seems fine
          episode = Number(praseObj.episode_number)
        }
      }
    }
    const streamingEpisode = media?.streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(praseObj.episode_number))[0]
    fileMedias.push({
      mediaTitle: media?.title.userPreferred,
      episodeNumber: episode,
      episodeTitle: streamingEpisode && episodeRx.exec(streamingEpisode.title)[2],
      episodeThumbnail: streamingEpisode?.thumbnail,
      mediaCover: media?.coverImage.medium,
      name: 'Miru',
      parseObject: praseObj,
      media: media
    })
  }
  return fileMedias.length === 1 ? fileMedias[0] : fileMedias
}

export const relations = JSON.parse(localStorage.getItem('relations')) || {}
