async function loadHomePage() {
    let homeLoadElements = [homeContinueMore, homeReleasesMore, homePlanningMore, homeTrendingMore],
        homePreviewElements = [homeContinue, homeReleases, homePlanning, homeTrending],
        homeLoadFunctions = {
            continue: async function (page) {
                let res = await alRequest({ method: "UserLists", status_in: "CURRENT", id: alID, page: page || 1 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: document.querySelector(".browse"), method: "continue", page: page || 1 })
            },
            releases: async function () {

            },
            planning: async function (page) {
                let res = await alRequest({ method: "UserLists", status_in: "PLANNING", id: alID, page: page || 1 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: document.querySelector(".browse"), method: "planning", page: page || 1 })
            },
            trending: async function (page) {
                let res = await alRequest({ method: "Trending", id: alID, page: page || 1 })
                galleryAppend({ media: res.data.Page.media, gallery: document.querySelector(".browse"), method: "trending", page: page || 1 })
            }
        },
        homePreviewFunctions = {
            continue: async function () {
                let res = await alRequest({ method: "UserLists", status_in: "CURRENT", id: alID, perPage: 4 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homeContinue })
            },
            releases: async function () {

            },
            planning: async function () {
                let res = await alRequest({ method: "UserLists", status_in: "PLANNING", id: alID, perPage: 4 })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: homePlanning })
            },
            trending: async function () {
                let res = await alRequest({ method: "Trending", id: alID, perPage: 4 })
                galleryAppend({ media: res.data.Page.media, gallery: homeTrending })
            }
        },
        loadTimeout

    function galleryAppend(opts) {
        //TODO: add skeleton loading
        function appendFrag(media) {
            let frag = document.createDocumentFragment()
            media.forEach(media => {
                let template = cardCreator(media)
                template.onclick = () => viewAnime(media)
                frag.appendChild(template)
            })
            opts.gallery.appendChild(frag)
        }
        if (opts.method) opts.gallery.addEventListener("scroll", function () {
            if (this.scrollTop + this.clientHeight > this.scrollHeight - 800 && !loadTimeout) {
                loadTimeout = setTimeout(function () { loadTimeout = undefined }, 1000)
                homeLoadFunctions[opts.method](opts.page + 1)
            }
        })
        if (!opts.page || opts.page == 1) opts.gallery.textContent = '';
        appendFrag(opts.media)
    }

    for (let item of homePreviewElements) {
        homePreviewFunctions[item.dataset.function]()
    }
    for (let item of homeLoadElements) {
        item.addEventListener("click", function () {
            homeLoadFunctions[this.dataset.function]()
        })
    }
}