const torrentRx = /(magnet:){1}|(^[A-F\d]{8,40}$){1}|(.*\.torrent){1}/i
const imageRx = /\.(jpeg|jpg|gif|png|webp)/
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
        client.addTorrent(text, {})
      } else if (imageRx.exec(text)) {
        e.preventDefault()
        searchText.value = ''
        traceAnime(text)
      }
    })
  } else if (item && item.type === 'text/html') {
    item.getAsString(text => {
      const img = new DOMParser().parseFromString(text, 'text/html').querySelectorAll('img')[0]
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
  fetch(url, options).then((res) => res.json())
    .then(async (result) => {
      if (result.docs[0].similarity >= 0.85) {
        const res = await alRequest({ method: 'SearchIDSingle', id: result.docs[0].anilist_id })
        viewAnime(res.data.Media)
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
navNowPlaying.onclick = () => { viewAnime(client.nowPlaying?.media) }
// AL lookup logic
async function alRequest (opts) {
  let query
  const variables = {
    type: 'ANIME',
    sort: opts.sort || 'TRENDING_DESC',
    page: opts.page || 1,
    perPage: opts.perPage || 30,
    status_in: opts.status_in || '[CURRENT,PLANNING]',
    chunk: opts.chunk || 1,
    perchunk: opts.perChunk || 30
  }
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: undefined
  }
  const queryObjects = `
  id
  title {
      romaji
      english
      native
      userPreferred
  }
  description(
      asHtml: true
  )
  season
  seasonYear
  format
  status
  episodes
  duration
  averageScore
  genres
  coverImage {
      extraLarge
      medium
      color
  }
  countryOfOrigin
  isAdult
  bannerImage
  synonyms
  nextAiringEpisode {
      timeUntilAiring
      episode
  }
  trailer {
      id
      site
  }
  streamingEpisodes {
      title
      thumbnail
  }
  relations {
      edges {
          relationType(version:2)
          node {
              id
              title {
                  userPreferred
              }
              coverImage {
                  medium
              }
              type
              status
              format
              episodes
          }
      }
  }`
  if (opts.status) variables.status = opts.status
  if (localStorage.getItem('ALtoken')) options.headers.Authorization = localStorage.getItem('ALtoken')
  if (opts.method === 'SearchName') { // look at me go, i'm doing the yandree dev
    variables.search = opts.name
    query = ` 
query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $search: String, $status: MediaStatus) {
    Page (page: $page, perPage: $perPage) {
        media(type: $type, search: $search, sort: $sort, status: $status) {
            ${queryObjects}
        }
    }
}`
  } else if (opts.method === 'SearchIDSingle') {
    variables.id = opts.id
    query = ` 
query ($id: Int, $type: MediaType) { 
    Media (id: $id, type: $type){
        ${queryObjects}
    }
}`
  } else if (opts.method === 'Viewer') {
    query = ` 
query {
    Viewer {
        avatar {
            medium
        }
        name
        id
    }
}`
  } else if (opts.method === 'UserLists') {
    variables.id = opts.id
    query = ` 
query ($page: Int, $perPage: Int, $id: Int, $type: MediaType, $status_in: [MediaListStatus]){
    Page (page: $page, perPage: $perPage) {
        mediaList (userId: $id, type: $type, status_in: $status_in) {
            media {
                ${queryObjects}
            }
        }
    }
}`
  } else if (opts.method === 'SearchIDStatus') {
    variables.id = alID
    variables.mediaId = opts.id
    query = ` 
query ($id: Int, $mediaId: Int){
    MediaList(userId: $id, mediaId: $mediaId) {
        status
        progress
        repeat
    }
}`
  } else if (opts.method === 'AiringSchedule') {
    const date = new Date()
    const diff = date.getDay() >= 1 ? date.getDay() - 1 : 6 - date.getDay()
    date.setDate(date.getDate() - diff)
    date.setHours(0, 0, 0, 0)
    variables.from = date.getTime() / 1000
    variables.to = (date.getTime() + 7 * 24 * 60 * 60 * 1000) / 1000
    query = ` 
query ($page: Int, $perPage: Int, $from: Int, $to: Int) {
    Page (page: $page, perPage: $perPage) {
        airingSchedules(airingAt_greater: $from, airingAt_lesser: $to) {
            episode
            timeUntilAiring
            airingAt
            media{
                ${queryObjects}
            }
        }
    }
}`
  } else if (opts.method === 'Search') {
    variables.genre = opts.genre
    variables.search = opts.search
    variables.year = opts.year
    variables.season = opts.season
    variables.format = opts.format
    variables.status = opts.status
    variables.sort = opts.sort || 'SEARCH_MATCH'
    query = ` 
query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $search: String, $status: MediaStatus, $season: MediaSeason, $year: Int, $genre: String, $format: MediaFormat) {
    Page (page: $page, perPage: $perPage) {
        media(type: $type, search: $search, sort: $sort, status: $status, season: $season, seasonYear: $year, genre: $genre, format: $format) {
            ${queryObjects}
        }
    }
}`
  }
  options.body = JSON.stringify({
    query: query.replace(/\s{2,}/g, ' '),
    variables: variables
  })

  const res = await fetch('https://graphql.anilist.co', options).catch((error) => console.error(error))
  const json = await res.json()
  console.log(json)
  return json
}
async function alEntry () {
  if (client.nowPlaying.media && localStorage.getItem('ALtoken')) {
    const res = await alRequest({ method: 'SearchIDStatus', id: client.nowPlaying.media.id })
    if ((res.errors && res.errors[0].status === 404) || res.data.MediaList.progress <= client.nowPlaying.episodeNumber) {
      const query = `
mutation ($id: Int, $status: MediaListStatus, $episode: Int, $repeat: Int) {
    SaveMediaListEntry (mediaId: $id, status: $status, progress: $episode, repeat: $repeat) {
        id
        status
        progress
        repeat
    }
}`
      const variables = {
        repeat: 0,
        id: client.nowPlaying.media.id,
        status: 'CURRENT',
        episode: client.nowPlaying.episodeNumber
      }
      if (client.nowPlaying.episodeNumber === client.nowPlaying.media.episodes) {
        variables.status = 'COMPLETED'
        if (res.data.MediaList.status === 'COMPLETED') {
          variables.repeat = res.data.MediaList.repeat + 1
        }
      }
      const options = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('ALtoken'),
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          query: query,
          variables: variables
        })
      }
      fetch('https://graphql.anilist.co', options).catch((error) => console.error(error))
    }
  }
}
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
const episodeRx = /Episode (\d+) - (.*)/
// this is fucked beyond belief, this is why you use frameworks
function viewAnime (media) {
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
function countdown (s) {
  const d = Math.floor(s / (3600 * 24))
  s -= d * 3600 * 24
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  const tmp = [];
  (d) && tmp.push(d + 'd');
  (d || h) && tmp.push(h + 'h');
  (d || h || m) && tmp.push(m + 'm')
  return tmp.join(' ')
}

const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())

async function nyaaSearch (media, episode) {
  if (parseInt(episode) < 10) {
    episode = `0${episode}`
  }

  const table = document.querySelector('tbody.results')
  const results = await nyaaRss(media, episode)

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

const exclusions = {
  edge: ['DTS'],
  chromium: ['DTS', 'AC3', 'HEVC', 'x265', 'H.265'],
  firefox: ['DTS', 'AC3', 'HEVC', 'x265', 'H.265', '.3gp', '.mkv']
}
if (!('audioTracks' in HTMLVideoElement.prototype)) {
  exclusions[userBrowser].push('mutli audio', 'dual audio')
}

async function nyaaRss (media, episode) {
  const frag = document.createDocumentFragment()
  const ep = (media.status === 'FINISHED' && settings.torrent9) ? `"01-${media.episodes}"|"01~${media.episodes}"|"Batch"|"Complete"|"+${episode}+"|"+${episode}v"` : `"+${episode}+"|"+${episode}v"`
  const url = new URL(`https://meowinjapanese.cf/?page=rss&c=1_2&f=${settings.torrent3 === true ? 2 : 0}&s=seeders&o=desc&q=(${[...new Set(Object.values(media.title).concat(media.synonyms).filter(name => name != null))].join(')|(')})${ep}"${settings.torrent1}"-(${exclusions[userBrowser].join('|')})`)
  res = await fetch(url)
  await res.text().then((xmlTxt) => {
    try {
      const doc = DOMPARSER(xmlTxt, 'text/xml')
      if (settings.torrent2 && doc.querySelectorAll('infoHash')[0]) {
        addTorrent(doc.querySelectorAll('infoHash')[0].innerHTML, { media: media, episode: episode })
        halfmoon.toggleModal('tsearch')
      }
      doc.querySelectorAll('item').forEach((item, index) => {
        const i = item.querySelector.bind(item)
        const template = document.createElement('tr')
        template.innerHTML += `
                <th>${(index + 1)}</th>
                <td>${i('title').innerHTML}</td>
                <td>${i('size').innerHTML}</td>
                <td>${i('seeders').innerHTML}</td>
                <td>${i('leechers').innerHTML}</td>
                <td>${i('downloads').innerHTML}</td>
                <td class="pointer">Play</td>`
        template.onclick = () => { client.addTorrent(i('infoHash').innerHTML, { media: media, episode: episode }) }
        frag.appendChild(template)
      })
    } catch (e) {
      console.error(e)
    }
  })
  return frag
}
// resolve anime name based on file name and store it

async function resolveFileMedia (opts) {
  // opts.fileName opts.method opts.isRelease

  const elems = await anitomyscript(opts.fileName)
  if (!relations[elems.anime_title]) {
    // resolve name and shit
    let method, res
    if (opts.isRelease) {
      method = { name: elems.anime_title, method: 'SearchName', perPage: 1, status: 'RELEASING', sort: 'TRENDING_DESC' }
      // maybe releases should include this and last season? idfk
    } else {
      method = { name: elems.anime_title, method: opts.method, perPage: 1, sort: 'SEARCH_MATCH' }
    }
    res = await alRequest(method)
    if (!res.data.Page.media[0]) {
      method.sort = 'SEARCH_MATCH'
      method.name = method.name.replace(' (TV)', '').replace(` (${new Date().getFullYear()})`, '').replace('-', '').replace('S2', '2') // this needs to be improved!!!
      method.status = undefined
      res = await alRequest(method)
    }
    if (res.data.Page.media[0]) {
      relations[elems.anime_title] = res.data.Page.media[0].id
      store[res.data.Page.media[0].id] = res.data.Page.media[0]
    }
  }
  if (!store[relations[elems.anime_title]] && relations[elems.anime_title]) {
    store[relations[elems.anime_title]] = (await alRequest({ method: 'SearchIDSingle', id: relations[elems.anime_title] })).data.Media
  }
  let episode; let media = store[relations[elems.anime_title]]
  // resolve episode, if movie, dont.
  if ((media?.format !== 'MOVIE' || (media.episodes || media.nextAiringEpisode.episode)) && elems.episode_number) {
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
          episode = `${elems.episode_number[0] - (opts.offset + tempMedia.episodes)} ~ ${elems.episode_number[elems.episode_number.length - 1] - (opts.offset + tempMedia.episodes)}`
        } else {
          episode = opts.episode - (opts.offset + tempMedia.episodes)
        }
        if (opts.increment) {
          const nextEdge = await alRequest({ method: 'SearchIDSingle', id: tempMedia.id })
          media = nextEdge.data.Media
        }
      } else {
        console.log('error in parsing!', opts.media, tempMedia)
        // something failed, most likely couldnt find an edge or processing failed, force episode number even if its invalid/out of bounds, better than nothing
        if (opts.episode.constructor === Array) {
          episode = `${Number(elems.episode_number[0])} ~ ${Number(elems.episode_number[elems.episode_number.length - 1])}`
        } else {
          episode = Number(opts.episode)
        }
      }
    }
    if (elems.episode_number.constructor === Array) {
      // is an episode range
      if (parseInt(elems.episode_number[0]) === 1) {
        // if it starts with #1 and overflows then it includes more than 1 season in a batch, cant fix this cleanly, name is parsed per file basis so this shouldnt be an issue
        episode = `${elems.episode_number[0]} ~ ${elems.episode_number[elems.episode_number.length - 1]}`
      } else {
        if ((media?.episodes || media?.nextAiringEpisode?.episode) && parseInt(elems.episode_number[elems.episode_number.length - 1]) > (media.episodes || media.nextAiringEpisode.episode)) {
          // if highest value is bigger than episode count or latest streamed episode +1 for safety, parseint to math.floor a number like 12.5 - specials - in 1 go
          await resolveSeason({ media: media, episode: elems.episode_number, offset: 0 })
        } else {
          // cant find ep count or range seems fine
          episode = `${Number(elems.episode_number[0])} ~ ${Number(elems.episode_number[elems.episode_number.length - 1])}`
        }
      }
    } else {
      if ((media?.episodes || media?.nextAiringEpisode?.episode) && parseInt(elems.episode_number) > (media.episodes || media.nextAiringEpisode.episode)) {
        // value bigger than episode count
        await resolveSeason({ media: media, episode: elems.episode_number, offset: 0 })
      } else {
        // cant find ep count or episode seems fine
        episode = Number(elems.episode_number)
      }
    }
  }
  const streamingEpisode = media?.streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(elems.episode_number))[0]
  return {
    mediaTitle: media?.title.userPreferred,
    episodeNumber: episode,
    episodeTitle: streamingEpisode ? episodeRx.exec(streamingEpisode.title)[2] : undefined,
    episodeThumbnail: streamingEpisode?.thumbnail,
    mediaCover: media?.coverImage.medium,
    name: 'Miru',
    parseObject: elems,
    media: media
  }
}

const store = {}
const relations = JSON.parse(localStorage.getItem('relations')) || {}

function getRSSurl () {
  if (Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0]) {
    // add my own cors proxy for erai
    return settings.torrent4 === 'Erai-raws' ? new URL(Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0].innerHTML + settings.torrent1 + '-magnet') : new URL(Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0].innerHTML + settings.torrent1)
  } else {
    return settings.torrent4 + settings.torrent1 // add custom RSS
  }
}
async function releasesCards (items, limit) {
  const mediaItems = []
  const cards = []
  for (let l = 0; l < (limit || items.length); l++) {
    const i = items[l].querySelector.bind(items[l])
    mediaItems.push(resolveFileMedia({ fileName: i('title').innerHTML, method: 'SearchName', isRelease: true }))
  }
  await Promise.all(mediaItems).then(results => {
    results.forEach((mediaInformation, index) => {
      const o = items[index].querySelector.bind(items[index])
      mediaInformation.onclick = () => client.addTorrent(o('link').innerHTML, { media: mediaInformation, episode: mediaInformation.episode })
      cards.push(cardCreator(mediaInformation))
    })
  })
  localStorage.setItem('relations', JSON.stringify(relations))
  return cards
}
async function releasesRss (limit) {
  let cards
  await fetch(getRSSurl()).then(res => res.text().then(async xmlTxt => {
    try {
      const doc = DOMPARSER(xmlTxt, 'text/xml')
      const items = doc.querySelectorAll('item')
      cards = await releasesCards(items, limit)
    } catch (e) {
      console.error(e)
    }
  }))
  return cards
}
let alID // login icon
async function loadAnime () {
  if (localStorage.getItem('ALtoken')) {
    alRequest({ method: 'Viewer' }).then(result => {
      oauth.removeAttribute('href')
      oauth.setAttribute('data-title', `${result.data.Viewer.name}\nClick To Logout`)
      oauth.innerHTML = `<img src="${result.data.Viewer.avatar.medium}" class="m-0">`
      oauth.onclick = () => {
        localStorage.removeItem('ALtoken')
        location.reload()
      }
      alID = result.data.Viewer.id
      loadHomePage()
    })
  } else {
    loadHomePage()
    home.classList.add('noauth')
  }
}
loadAnime()
