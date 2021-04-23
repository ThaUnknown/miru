async function loadHomePage () {
  const homeLoadElements = [navSchedule, homeContinueMore, homeReleasesMore, homePlanningMore, homeTrendingMore, homeRomanceMore, homeActionMore]
  const homePreviewElements = [homeContinue, homeReleases, homePlanning, homeTrending, homeRomance, homeAction]
  const homeSearchElements = [searchText, searchGenre, searchYear, searchSeason, searchFormat, searchStatus, searchSort]
  const browseGallery = document.querySelector('.browse')
  const homeLoadFunctions = {
    continue: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      await alRequest({ method: 'UserLists', status_in: 'CURRENT', id: alID, page: page || 1 }).then(res => {
        galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: browseGallery, method: 'continue', page: page || 1 })
      })
    },
    releases: async function () {
      gallerySkeleton(browseGallery)
      await releasesRss().then(cards => {
        browseGallery.textContent = ''
        browseGallery.append(...cards)
        home.classList.remove('loading')
        home.onscroll = undefined
      })
    },
    planning: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      await alRequest({ method: 'UserLists', status_in: 'PLANNING', id: alID, page: page || 1 }).then(res => {
        galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: browseGallery, method: 'planning', page: page || 1 })
      })
    },
    trending: async function () {
      gallerySkeleton(browseGallery)
      clearSearch()
      searchSort.value = 'TRENDING_DESC'
      await homeLoadFunctions.search()
    },
    romance: async function () {
      gallerySkeleton(browseGallery)
      clearSearch()
      searchGenre.value = 'romance'
      searchSort.value = 'TRENDING_DESC'
      await homeLoadFunctions.search()
    },
    action: async function () {
      gallerySkeleton(browseGallery)
      clearSearch()
      searchGenre.value = 'action'
      searchSort.value = 'TRENDING_DESC'
      await homeLoadFunctions.search()
    },
    schedule: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      await alRequest({ method: 'AiringSchedule', page: page || 1 }).then(res => {
        galleryAppend({ media: res.data.Page.airingSchedules.filter(entry => entry.media.countryOfOrigin !== 'CN' && entry.media.isAdult === false), gallery: browseGallery, method: 'schedule', page: page || 1, schedule: true })
      })
    },
    search: async function (page) {
      const opts = {
        method: 'Search',
        page: page || 1
      }
      for (const element of homeSearchElements) {
        if (element.value) opts[element.dataset.option] = element.value
      }
      await alRequest(opts).then(res => {
        galleryAppend({ media: res.data.Page.media, gallery: browseGallery, method: 'search', page: page || 1 })
      })
    }
  }
  const homePreviewFunctions = {
    continue: function () {
      alRequest({ method: 'UserLists', status_in: 'CURRENT', id: alID, perPage: 5 }).then((res) => {
        galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homeContinue })
      })
    },
    releases: async function () { // this could be cleaner, but oh well
      await fetch(getRSSurl()).then(res => res.text().then(xmlTxt => {
        const doc = DOMPARSER(xmlTxt, 'text/xml')
        const pubDate = doc.querySelector('pubDate').textContent
        if (lastRSSDate !== pubDate) {
          if (lastRSSDate) {
            homeReleases.append(...gallerySkeletonFrag(5))
            resolveFileMedia({ fileName: doc.querySelector('item').querySelector('title').textContent, method: 'SearchName', isRelease: true }).then(mediaInformation => {
              if (settings.other1) {
                const notification = new Notification(mediaInformation.media.title.userPreferred, {
                  body: `Episode ${mediaInformation.episode} was just released!`,
                  icon: mediaInformation.media.coverImage.medium
                })
                notification.onclick = async () => {
                  window.parent.focus()
                  client.addTorrent(doc.querySelector('item').querySelector('link').textContent, { media: mediaInformation, episode: mediaInformation.episode })
                  store[relations[mediaInformation.parseObject.anime_title]] = await alRequest({ id: mediaInformation.media.id, method: 'SearchIDSingle' }).then(res => res.data.Media)
                }
              }
            })
          }
          lastRSSDate = pubDate
          releasesCards(doc.querySelectorAll('item'), 5).then(cards => {
            homeReleases.textContent = ''
            homeReleases.append(...cards)
          })
        }
      }))
      setTimeout(homePreviewFunctions.releases, 30000)
    },
    planning: function () {
      alRequest({ method: 'UserLists', status_in: 'PLANNING', id: alID, perPage: 5 }).then((res) => {
        galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homePlanning })
      })
    },
    trending: function () {
      alRequest({ method: 'Search', id: alID, perPage: 5, sort: 'TRENDING_DESC' }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: homeTrending })
      })
    },
    romance: function () {
      alRequest({ method: 'Search', genre: 'Romance', perPage: 5, sort: 'TRENDING_DESC' }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: homeRomance })
      })
    },
    action: function () {
      alRequest({ method: 'Search', genre: 'Action', perPage: 5, sort: 'TRENDING_DESC' }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: homeAction })
      })
    }
  }
  const gallerySkeletonFrag = function (limit) {
    const cards = []
    while (limit--) {
      cards.push(skeletonCard.cloneNode(true))
    }
    return cards
  }
  let loadTimeout
  let lastDate
  let lastRSSDate
  let canScroll = true

  function gallerySkeleton (gallery) {
    home.classList.add('loading')
    gallery.textContent = ''
    gallery.append(...gallerySkeletonFrag(10))
  }
  function galleryAppend (opts) {
    if (opts.page === 1) {
      home.classList.remove('loading')
    }
    if (opts.method) {
      canScroll = false
      home.onscroll = function () {
        if (this.scrollTop + this.clientHeight > this.scrollHeight - 800 && !loadTimeout && canScroll) {
          canScroll = false
          loadTimeout = setTimeout(function () { loadTimeout = undefined }, 1000)
          homeLoadFunctions[opts.method](opts.page + 1).then(() => { canScroll = true })
        }
      }
    }
    if (!opts.page || opts.page === 1) {
      opts.gallery.textContent = ''
    }
    const date = new Date()
    const cards = []
    opts.media.forEach(media => {
      if (opts.schedule) {
        if (media.timeUntilAiring && (!lastDate || (new Date(+date + media.timeUntilAiring * 1000).getDay() !== lastDate.getDay()))) {
          const div = document.createElement('div')
          lastDate = new Date(+date + media.timeUntilAiring * 1000)
          div.classList.add('day-row', 'font-size-24', 'font-weight-bold', 'h-50', 'd-flex', 'align-items-end')
          div.textContent = lastDate.toLocaleDateString('en-US', { weekday: 'long' })
          cards.push(div)
        }
        media = media.media
      }
      cards.push(cardCreator({ media: media, schedule: opts.schedule, onclick: () => viewAnime(media) }))
      store[media.id] = media
    })
    opts.gallery.append(...cards)
    canScroll = true
  }

  for (const item of homePreviewElements) {
    homePreviewFunctions[item.dataset.function]()
  }
  for (const item of homeLoadElements) {
    item.onclick = function () {
      home.scrollTop = 0
      home.classList.add('browsing')
      homeLoadFunctions[this.dataset.function]()
    }
  }
  function reloadHome () {
    home.classList.remove('browsing')
    lastRSSDate = undefined
    for (const item of homePreviewElements) {
      item.textContent = ''
      item.append(...gallerySkeletonFrag(5))
      homePreviewFunctions[item.dataset.function]()
    }
    document.querySelector('.browse').textContent = ''
  }
  navHome.onclick = reloadHome
  function clearSearch () {
    for (const element of homeSearchElements) {
      element.value = ''
    }
  }
  searchClear.onclick = () => {
    clearSearch()
    reloadHome()
    home.classList.remove('browsing')
  }
  let searchTimeout
  searchWrapper.oninput = e => {
    if (!searchTimeout) {
      home.classList.add('browsing')
      gallerySkeleton(browseGallery)
    } else {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      homeLoadFunctions.search()
      searchTimeout = undefined
    }, 500)
  }
}

const skeletonCard = skeletonCardTemplate.cloneNode(true).content
const bareCard = bareCardTemplate.cloneNode(true).content
const fullCard = fullCardTemplate.cloneNode(true).content
function cardCreator (opts) {
  if (opts.media) {
    const card = fullCard.cloneNode(true)
    const nodes = card.querySelectorAll('*')
    nodes[0].onclick = opts.onclick
    nodes[0].style = `--color:${opts.media.coverImage.color || '#1890ff'};`
    nodes[3].src = opts.media.coverImage.extraLarge || ''
    nodes[6].textContent = [opts.media.title.userPreferred, opts.episodeNumber].filter(s => s).join(' - ')
    if (opts.schedule && opts.media.nextAiringEpisode) nodes[7] = opts.media.nextAiringEpisode.episode + ' in ' + countdown(opts.media.nextAiringEpisode.timeUntilAiring)
    nodes[8].innerHTML = '<span>' + [
      opts.media.format === 'TV' ? 'TV Show' : opts.media.format?.toLowerCase().replace(/_/g, ' '),
      opts.media.episodes ? opts.media.episodes + ' Episodes' : opts.media.duration ? opts.media.duration + ' Minutes' : undefined,
      opts.media.status?.toLowerCase().replace(/_/g, ' '),
      [opts.media.season?.toLowerCase(), opts.media.seasonYear].filter(s => s).join(' ')
    ].filter(s => s).join('</span><span>') + '</span>'
    nodes[13].innerHTML = opts.media.description
    nodes[14].innerHTML = opts.media.genres.map(key => (`<span class="badge badge-pill badge-color text-dark mt-5 font-weight-bold">${key}</span> `)).join('')
    return card
  } else if (opts.parseObject) {
    const card = bareCard.cloneNode(true)
    card.querySelector('h5').textContent = [opts.parseObject.anime_title, opts.parseObject.episode_number].filter(s => s).join(' - ')
    card.firstElementChild.onclick = opts.onclick
    return card
  } else {
    return skeletonCard.cloneNode(true)
  }
}
