async function loadHomePage(reload) {
    let homeLoadElements = [homeContinueMore, homeReleasesMore, homePlanningMore, homeTrendingMore, homeRomanceMore, homeActionMore],
        homePreviewElements = [homeContinue, homeReleases, homePlanning, homeTrending, homeRomance, homeAction],
        browseGallery = document.querySelector(".browse"),
        homeLoadFunctions = {
            continue: async function (page) {
                if (!page) gallerySkeleton(browseGallery)
                let res = await alRequest({ method: "UserLists", status_in: "CURRENT", id: alID, page: page || 1 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: browseGallery, method: "continue", page: page || 1 })
            },
            releases: async function () {
                gallerySkeleton(browseGallery)
                let frag = await releasesRss()
                browseGallery.innerHTML = ''
                browse.classList.remove("loading")
                browseGallery.appendChild(frag)
                browseGallery.scrollTop = 0
                browseGallery.onscroll = undefined
            },
            planning: async function (page) {
                if (!page) gallerySkeleton(browseGallery)
                let res = await alRequest({ method: "UserLists", status_in: "PLANNING", id: alID, page: page || 1 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: browseGallery, method: "planning", page: page || 1 })
            },
            trending: async function (page) {
                if (!page) gallerySkeleton(browseGallery)
                let res = await alRequest({ method: "Trending", id: alID, page: page || 1 })
                galleryAppend({ media: res.data.Page.media, gallery: browseGallery, method: "trending", page: page || 1 })
            },
            romance: async function (page) {
                if (!page) gallerySkeleton(browseGallery)
                let res = await alRequest({ method: "Genre", genre: "Romance", page: page || 1 })
                galleryAppend({ media: res.data.Page.media, gallery: browseGallery, method: "romance", page: page || 1 })
            },
            action: async function (page) {
                if (!page) gallerySkeleton(browseGallery)
                let res = await alRequest({ method: "Genre", genre: "Action", page: page || 1 })
                galleryAppend({ media: res.data.Page.media, gallery: browseGallery, method: "action", page: page || 1 })
            }
        },
        homePreviewFunctions = {
            continue: async function () {
                let res = await alRequest({ method: "UserLists", status_in: "CURRENT", id: alID, perPage: 4 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homeContinue })
            },
            releases: async function () {
                let frag = await releasesRss(4)
                homeReleases.innerHTML = ''
                homeReleases.appendChild(frag)
            },
            planning: async function () {
                let res = await alRequest({ method: "UserLists", status_in: "PLANNING", id: alID, perPage: 4 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homePlanning })
            },
            trending: async function () {
                let res = await alRequest({ method: "Trending", id: alID, perPage: 4 })
                galleryAppend({ media: res.data.Page.media, gallery: homeTrending })
            },
            romance: async function () {
                let res = await alRequest({ method: "Genre", genre: "Romance", perPage: 4 })
                galleryAppend({ media: res.data.Page.media, gallery: homeRomance })
            },
            action: async function () {
                let res = await alRequest({ method: "Genre", genre: "Action", perPage: 4 })
                galleryAppend({ media: res.data.Page.media, gallery: homeAction })
            }
        },
        loadTimeout,
        gallerySkeletonFrag = function (limit) {
            let frag = document.createDocumentFragment()
            for (let i = 0; i < limit; i++) {
                frag.appendChild(cardCreator())
            }
            return frag
        }

    function gallerySkeleton(gallery) {
        browse.classList.add("loading")
        gallery.innerHTML = ''
        gallery.appendChild(gallerySkeletonFrag(10))
    }
    function galleryAppend(opts) {
        function appendFrag(media) {
            let frag = document.createDocumentFragment()
            media.forEach(media => {
                let template = cardCreator(media)
                template.onclick = () => viewAnime(media)
                frag.appendChild(template)
            })
            opts.gallery.appendChild(frag)
        }
        if (opts.method) opts.gallery.onscroll = function () {
            if (this.scrollTop + this.clientHeight > this.scrollHeight - 800 && !loadTimeout) {
                loadTimeout = setTimeout(function () { loadTimeout = undefined }, 1000)
                homeLoadFunctions[opts.method](opts.page + 1)
            }
        }

        if (!opts.page || opts.page == 1) {
            opts.gallery.innerHTML = '';
        }
        appendFrag(opts.media)
        if (opts.page == 1) {
            opts.gallery.scrollTop = 0
            browse.classList.remove("loading")
        }
    }

    if (reload) for (let item of homePreviewElements) {
        item.innerHTML = ''
        item.appendChild(gallerySkeletonFrag(4))
    }
    for (let item of homePreviewElements) {
        homePreviewFunctions[item.dataset.function]()
    }
    for (let item of homeLoadElements) {
        item.onclick = function () {
            homeLoadFunctions[this.dataset.function]()
        }
    }   
}
navHome.onclick = () => {
    loadHomePage(true)
    document.querySelector(".browse").innerHTML = ''
}