async function loadHomePage() {
    let homeLoadElements = [homeContinueMore, homeReleasesMore, homePlanningMore, homeTrendingMore],
        homePreviewElements = [homeContinue, homeReleases, homePlanning, homeTrending],
        homeLoadFunctions = {
            continue: async function () {
                let res = await alRequest({ method: "UserLists", status_in: "CURRENT", id: alID })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: document.querySelector(".browse") })
            },
            releases: async function () {

            },
            planning: async function () {
                let res = await alRequest({ method: "UserLists", status_in: "PLANNING", id: alID })
                galleryAppend({ media: res.data.Page.mediaList.map(i => i.media), gallery: document.querySelector(".browse") })
            },
            trending: async function () {
                let res = await alRequest({ method: "Trending", id: alID })
                galleryAppend({ media: res.data.Page.media, gallery: document.querySelector(".browse") })
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
        }

    function galleryAppend(opts) {
        //TODO: add skeleton loading
        let frag = document.createDocumentFragment()
        opts.media.forEach(media => {
            let template = cardCreator(media)
            template.onclick = () => viewAnime(media)
            frag.appendChild(template)
        })
        opts.gallery.textContent = '';
        opts.gallery.appendChild(frag)
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