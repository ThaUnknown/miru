async function loadHomePage () {
  const homeLoadElements = [navSchedule, homeContinueMore, homeReleasesMore, homePlanningMore, homeTrendingMore, homeRomanceMore, homeActionMore]
  const homePreviewElements = [homeContinue, homeReleases, homePlanning, homeTrending, homeRomance, homeAction]
  const browseGallery = document.querySelector('.browse')
  const homeLoadFunctions = {
    continue: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      const res = await alRequest({ method: 'UserLists', status_in: 'CURRENT', id: alID, page: page || 1 })
      galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: browseGallery, method: 'continue', page: page || 1 })
    },
    releases: async function () {
      gallerySkeleton(browseGallery)
      const frag = await releasesRss()
      browseGallery.innerHTML = ''
      browse.classList.remove('loading')
      browseGallery.appendChild(frag)
      browseGallery.scrollTop = 0
      browse.onscroll = undefined
    },
    planning: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      alRequest({ method: 'UserLists', status_in: 'PLANNING', id: alID, page: page || 1 }).then((res) => {
        galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: browseGallery, method: 'planning', page: page || 1 })
      })
    },
    trending: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      alRequest({ method: 'Trending', id: alID, page: page || 1 }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: browseGallery, method: 'trending', page: page || 1 })
      })
    },
    romance: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      alRequest({ method: 'Genre', genre: 'Romance', page: page || 1 }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: browseGallery, method: 'romance', page: page || 1 })
      })
    },
    action: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      alRequest({ method: 'Genre', genre: 'Action', page: page || 1 }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: browseGallery, method: 'action', page: page || 1 })
      })
    },
    schedule: async function (page) {
      if (!page) gallerySkeleton(browseGallery)
      alRequest({ method: 'AiringSchedule', page: page || 1 }).then(res => {
        galleryAppend({ media: res.data.Page.airingSchedules.filter(entry => entry.media.countryOfOrigin !== 'CN' && entry.media.isAdult === false), gallery: browseGallery, method: 'schedule', page: page || 1, schedule: true })
      })
    }
  }
  const homePreviewFunctions = {
    continue: async function () {
      alRequest({ method: 'UserLists', status_in: 'CURRENT', id: alID, perPage: 5 }).then((res) => {
        galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homeContinue })
      })
    },
    releases: async function () { // this could be cleaner, but oh well
      await fetch(getRSSurl()).then(res => res.text().then(async xmlTxt => {
        const doc = DOMPARSER(xmlTxt, 'text/xml')
        const pubDate = doc.querySelector('pubDate').innerHTML
        if (lastRSSDate !== pubDate) {
          if (lastRSSDate) {
            homeReleases.innerHTML = ''
            homeReleases.appendChild(gallerySkeletonFrag(5))
            resolveFileMedia({ fileName: doc.querySelector('item').querySelector('title').innerHTML, method: 'SearchName', isRelease: true }).then(mediaInformation => {
              if (settings.other1) {
                const notification = new Notification(mediaInformation.media.title.userPreferred, {
                  body: `Episode ${mediaInformation.episode} was just released!`,
                  icon: mediaInformation.media.coverImage.medium
                })
                notification.onclick = async () => {
                  window.parent.focus()
                  client.addTorrent(doc.querySelector('item').querySelector('link').innerHTML, { media: mediaInformation, episode: mediaInformation.episode })
                  store[mediaInformation.parseObject.anime_title] = await alRequest({ id: mediaInformation.media.id, method: 'SearchIDSingle' }).then(res => res.data.Media)
                }
              }
            })
          }
          const frag = document.createDocumentFragment()
          lastRSSDate = pubDate
          await releasesCards(doc.querySelectorAll('item'), frag, 5)
          homeReleases.innerHTML = ''
          homeReleases.appendChild(frag)
        }
      }))
      setTimeout(homePreviewFunctions.releases, 30000)
    },
    planning: async function () {
      alRequest({ method: 'UserLists', status_in: 'PLANNING', id: alID, perPage: 5 }).then((res) => {
        galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homePlanning })
      })
    },
    trending: async function () {
      alRequest({ method: 'Trending', id: alID, perPage: 5 }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: homeTrending })
      })
    },
    romance: async function () {
      alRequest({ method: 'Genre', genre: 'Romance', perPage: 5 }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: homeRomance })
      })
    },
    action: async function () {
      alRequest({ method: 'Genre', genre: 'Action', perPage: 5 }).then((res) => {
        galleryAppend({ media: res.data.Page.media, gallery: homeAction })
      })
    }
  }
  const gallerySkeletonFrag = function (limit) {
    const frag = document.createDocumentFragment()
    for (let i = 0; i < limit; i++) {
      frag.appendChild(cardCreator({}))
    }
    return frag
  }
  let loadTimeout
  let lastDate
  let lastRSSDate
  let canScroll = true

  function gallerySkeleton (gallery) {
    browse.classList.add('loading')
    gallery.innerHTML = ''
    gallery.appendChild(gallerySkeletonFrag(10))
  }
  function galleryAppend (opts) {
    if (opts.page === 1) {
      opts.gallery.scrollTop = 0
      browse.classList.remove('loading')
    }
    if (opts.method) {
      canScroll = false
      browse.onscroll = function () {
        if (this.scrollTop + this.clientHeight > this.scrollHeight - 800 && !loadTimeout && canScroll) {
          canScroll = false
          loadTimeout = setTimeout(function () { loadTimeout = undefined }, 1000)
          homeLoadFunctions[opts.method](opts.page + 1).then(() => { canScroll = true })
        }
      }
    }
    if (!opts.page || opts.page === 1) {
      opts.gallery.innerHTML = ''
    }
    const frag = document.createDocumentFragment()
    const date = new Date()
    opts.media.forEach(media => {
      if (opts.schedule) {
        if (media.timeUntilAiring && (!lastDate || (new Date(+date + media.timeUntilAiring * 1000).getDay() !== lastDate.getDay()))) {
          const div = document.createElement('div')
          lastDate = new Date(+date + media.timeUntilAiring * 1000)
          div.classList.add('day-row', 'font-size-24', 'font-weight-bold', 'h-50', 'd-flex', 'align-items-end')
          div.innerHTML = lastDate.toLocaleDateString('en-US', { weekday: 'long' })
          frag.appendChild(div)
        }
        media = media.media
      }
      const template = cardCreator({ media: media, schedule: opts.schedule })
      template.onclick = () => viewAnime(media)
      frag.appendChild(template)
    })
    opts.gallery.appendChild(frag)
    canScroll = true
  }

  for (const item of homePreviewElements) {
    homePreviewFunctions[item.dataset.function]()
  }
  for (const item of homeLoadElements) {
    item.onclick = function () {
      homeLoadFunctions[this.dataset.function]()
    }
  }
  navHome.onclick = () => {
    lastRSSDate = undefined
    for (const item of homePreviewElements) {
      item.innerHTML = ''
      item.appendChild(gallerySkeletonFrag(5))
      homePreviewFunctions[item.dataset.function]()
    }
    document.querySelector('.browse').innerHTML = ''
  }
}
