const torrentRx = /(magnet:){1}|(^[A-F\d]{8,40}$){1}|(.*\.torrent){1}/i,
    imageRx = /\.(jpeg|jpg|gif|png|webp)/
window.addEventListener("paste", async e => {
    let item = e.clipboardData.items[0];
    if (item && item.type.indexOf("image") === 0) {
        e.preventDefault();
        let blob = item.getAsFile();

        let reader = new FileReader();
        reader.onload = e => {
            traceAnime(e.target.result, "uri")
        };
        reader.readAsDataURL(blob);
    } else if (item && item.type === "text/plain") {
        item.getAsString(text => {
            if (torrentRx.exec(text)) {
                e.preventDefault();
                search.value = ""
                addTorrent(text);
            } else if (imageRx.exec(text)) {
                e.preventDefault();
                search.value = ""
                traceAnime(text)
            }
        })
    } else if (item && item.type === "text/html") {
        item.getAsString(text => {
            let domparser = new DOMParser(),
                doc = domparser.parseFromString(text, "text/html"),
                img = doc.querySelectorAll("img")[0]
            if (img) {
                e.preventDefault();
                search.value = ""
                traceAnime(img.src)
            }
        })
    }

})
function traceAnime(image, type) {
    halfmoon.initStickyAlert({
        content: `Looking Up Anime ${type == "uri" ? "" : `For <span class="text-break">${image}</span>`}`
    })
    let options,
        url = `https://trace.moe/api/search?url=${image}`
    if (type == "uri") {
        options = {
            method: "POST",
            body: JSON.stringify({ image: image }),
            headers: { "Content-Type": "application/json" },
        },
            url = "https://trace.moe/api/search"
    }
    fetch(url, options).then((res) => res.json())
        .then(async (result) => {
            if (result.docs[0].similarity >= 0.85) {
                console.log(result.docs[0].anilist_id)
                let res = await alRequest(result.docs[0].anilist_id, "SearchIDSingle")
                viewAnime(res.data.Media)
            } else {
                console.log("no." + result.docs[0].similarity)
            }
        });

}
function searchBox() {
    search.placeholder = search.value
    searchAnime(search.value)
    search.value = ""
    document.location.hash = "#browse"
}
navNew.onclick = () => { releasesRss() }
navTrending.onclick = () => { searchAnime() }
navNowPlaying.onclick = () => { viewAnime(playerData.nowPlaying[0]) }
navList.onclick = async () => {
    let browse = document.querySelector(".browse")
    browse.textContent = '';
    browse.appendChild(skeletonCard)
    let res = await alRequest(alID, "UserLists"),
        entries = res.data.MediaListCollection.lists[0].entries.concat(res.data.MediaListCollection.lists[1].entries),
        frag = document.createDocumentFragment()
    try {
        entries.forEach(media => {
            let template = cardCreator(media.media)
            template.onclick = () => {
                viewAnime(media.media)
            }
            frag.appendChild(template)
        })
    } catch (e) {
        console.error(e)
    }
    browse.textContent = '';
    browse.appendChild(frag)
}
async function alRequest(searchName, method) {
    let query,
        variables = {
            type: "ANIME",
            sort: "TRENDING_DESC",
            page: 1,
            perPage: 50
        },
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        },
        queryObjects = `
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
        `
    if (localStorage.getItem("ALtoken")) {
        options.headers['Authorization'] = localStorage.getItem("ALtoken")
    }
    if (method == "Trending") {
        search.placeholder = "Search"
        query = `
        query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
            Page (page: $page, perPage: $perPage) {
                media(type: $type, sort: $sort) {
                    ${queryObjects}
                }
            }
        }`
    } else if (method == "SearchReleasesSingle") {
        variables.search = searchName
        variables.perPage = 1
        variables.status = "RELEASING"
        query = `
        query ($page: Int, $sort: [MediaSort], $search: String, $type: MediaType, $status: MediaStatus) {
            Page (page: $page) {
                media (type: $type, search: $search, sort: $sort, status: $status) {
                    ${queryObjects}
                }
            }
        }`
    } else if (method == "SearchName") {
        variables.search = searchName
        variables.sort = "TRENDING_DESC"
        query = `
        query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $search: String) {
            Page (page: $page, perPage: $perPage) {
                media(type: $type, search: $search, sort: $sort) {
                    ${queryObjects}
                }
            }
        }`
    } else if (method == "SearchAnySingle") {
        variables.search = searchName
        variables.perPage = 1
        variables.sort = "TRENDING_DESC"
        query = `
        query ($page: Int, $sort: [MediaSort], $search: String, $type: MediaType) {
            Page (page: $page) {
                media (type: $type, search: $search, sort: $sort) {
                    ${queryObjects}
                }
            }
        }`
    } else if (method == "SearchIDSingle") {
        variables.id = searchName
        query = `
        query ($id: Int, $type: MediaType) { 
            Media (id: $id, type: $type){
                ${queryObjects}
            }
        }`
    } else if (method == "Viewer") {
        query = `
        query {
            Viewer {
                avatar {
                    medium
                },
                name,
                id
            }
        }
        `
    } else if (method == "UserLists") {
        variables.id = searchName
        query = `
        query ($id: Int, $type: MediaType){
            MediaListCollection (userId: $id, type: $type, forceSingleCompletedList: true, status_in: [CURRENT,PLANNING]) {
                lists {
                    entries {
                        media {
                            ${queryObjects}
                        }
                    }
                }
            }
        }
        `
    }
    options.body = JSON.stringify({
        query: query,
        variables: variables
    })

    let res = await fetch('https://graphql.anilist.co', options).catch((error) => console.error(error)),
        json = await res.json();
    return json
}
function alEntry() {
    if (playerData.nowPlaying && playerData.nowPlaying[0] && localStorage.getItem("ALtoken")) {
        let query = `
mutation ($id: Int, $status: MediaListStatus, $episode: Int) {
    SaveMediaListEntry (mediaId: $id, status: $status, progress: $episode) {
        id
        status
        progress
    }
}`,
            variables = {
                id: playerData.nowPlaying[0].id,
                status: "CURRENT",
                episode: parseInt(playerData.nowPlaying[1])
            },
            options = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("ALtoken"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            }
        fetch("https://graphql.anilist.co", options)
    }
}
let alResponse
async function searchAnime(a) {
    let frag = document.createDocumentFragment(),
        browse = document.querySelector(".browse")
    browse.textContent = '';
    browse.appendChild(skeletonCard)
    a ? alResponse = await alRequest(a, "SearchName") : alResponse = await alRequest(a, "Trending")
    try {
        alResponse.data.Page.media.forEach(media => {
            let template = cardCreator(media)
            template.onclick = () => {
                viewAnime(media)
            }
            frag.appendChild(template)
        })
    } catch (e) {
        console.error(e)
    }
    browse.textContent = '';
    browse.appendChild(frag)
}


let detailsfrag = document.createDocumentFragment()
let details = {
    averageScore: "Average Score",
    // duration: "Episode Duration",
    // episodes: "Episodes",
    // format: "Format",
    genres: "Genres",
    // season: "Season",
    // seasonYear: "Year",
    status: "Status",
    english: "English",
    romaji: "Romaji",
    native: "Native",
    synonyms: "Synonyms"
}
const episodeRx = /Episode (\d+) - (.*)/;
function viewAnime(media) {
    halfmoon.showModal("view")
    view.setAttribute("style", `background-image: url(${media.bannerImage}) !important`)
    viewImg.src = media.coverImage.extraLarge
    viewTitle.textContent = media.title.userPreferred
    viewDesc.innerHTML = media.description || ""

    viewDetails.innerHTML = ""
    detailsCreator(media)
    viewDetails.appendChild(detailsfrag)
    if (media.nextAiringEpisode) {
        let temp = document.createElement("p")
        temp.innerHTML = `<span class="font-weight-bold">Airing</span><br><span class="text-muted"> Episode ${media.nextAiringEpisode.episode}: ${toTS(media.nextAiringEpisode.timeUntilAiring)}</span>`
        viewDetails.prepend(temp)
    }
    viewSeason.innerHTML = `${(media.season ? media.season.toLowerCase() + " " : "") + (media.seasonYear ? media.seasonYear : "")}`
    viewMediaInfo.innerHTML = `${media.format ? "<span>" + media.format + "</span>" : ""}${media.episodes ? "<span>" + media.episodes + " Episodes</span>" : ""}${media.duration ? "<span>" + media.duration + " Minutes</span>" : ""}`
    viewPlay.onclick = () => { nyaaSearch(media, 1); halfmoon.toggleModal("view") }
    if (media.trailer) {
        viewTrailer.removeAttribute("disabled", "")
        viewTrailer.onclick = () =>
            trailerPopup(media.trailer)
    } else {
        viewTrailer.setAttribute("disabled", "")
    }
    if (media.status == "NOT_YET_RELEASED") {
        viewPlay.setAttribute("disabled", "")
    } else {
        viewPlay.removeAttribute("disabled", "")
    }
    viewEpisodes.onclick = () => {
        viewEpisodesWrapper.classList.toggle("hidden")
    }
    viewSynonym.onclick = () => {
        store[viewSynonymText.value] = media
        viewSynonymText.value = ""
        localStorage.setItem("store", JSON.stringify(store))
    }
    episodes.innerHTML = ""
    if (media.streamingEpisodes.length) {
        viewEpisodesWrapper.classList.add("hidden")
        viewEpisodes.removeAttribute("disabled", "")
        let frag = document.createDocumentFragment()
        media.streamingEpisodes.forEach(episode => {
            let temp = document.createElement("div")
            temp.classList.add("position-relative", "w-250", "rounded", "mr-10", "overflow-hidden", "pointer")
            temp.innerHTML = `
            <img src="${episode.thumbnail}" class="w-full h-full">
            <div class="position-absolute ep-title w-full p-10 text-truncate bottom-0">${episode.title}</div>`
            temp.onclick = () => { nyaaSearch(media, episodeRx.exec(episode.title)[1]); halfmoon.toggleModal("view") }
            frag.appendChild(temp)
        })
        episodes.appendChild(frag)
    } else {
        viewEpisodesWrapper.classList.add("hidden")
        viewEpisodes.setAttribute("disabled", "")
    }
}
function trailerPopup(trailer) {
    trailerVideo.src = ""
    halfmoon.toggleModal("trailer")
    switch (trailer.site) { // should support the other possible sites too, but i cant find any examples
        case "youtube":
            trailerVideo.src = "https://www.youtube.com/embed/" + trailer.id
            break;
    }

}
function detailsCreator(entry) {
    if (entry) {
        Object.entries(entry).forEach(value => {
            let template = document.createElement("p")
            if (typeof value[1] == 'object') {
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
function cardCreator(media, name, episode) {
    let template = document.createElement("div")
    template.classList.add("card", "m-0", "p-0")
    if (media) {
        template.innerHTML = `
    <div class="row h-full" style="--color:${media.coverImage.color || "#1890ff"};">
        <div class="col-4">
            <img src="${media.coverImage.extraLarge || ""}"
                class="cover-img w-full h-full">
        </div>
        <div class="col-8 h-full card-grid">
            <div class="px-15 py-10">
                <h5 class="m-0 text-capitalize font-weight-bold">${media.title.userPreferred}${episode ? " - " + episode : ""}</h5>
                <p class="text-muted m-0 text-capitalize details">
                ${(media.format ? (media.format == "TV" ? "<span>" + media.format + " Show" : "<span>" + media.format.toLowerCase().replace(/_/g, " ")) : "") + "</span>"}
                ${media.episodes ? "<span>" + media.episodes + " Episodes</span>" : media.duration ? "<span>" + media.duration + " Minutes</span>" : ""}
                ${media.status ? "<span>" + media.status.toLowerCase().replace(/_/g, " ") + "</span>" : ""}
                ${media.season || media.seasonYear ? "<span>" + (!!media.season ? media.season.toLowerCase() + " " : "") + (media.seasonYear || "") + "</span>" : ""}
                </p>
            </div>
            <div class="overflow-y-scroll px-15 py-10 bg-very-dark card-desc">
                ${media.description}
            </div>
            <div class="px-15 pb-10 pt-5">
                ${media.genres.map(key => (`<span class="badge badge-pill badge-color text-dark mt-5 font-weight-bold">${key}</span> `)).join('')}
            </div>
        </div>
    </div>
    `
    } else {
        template.innerHTML = `
        <div class="row h-full">
            <div class="col-4 w-full bg-very-dark skeloader">
            </div>
            <div class="col-8 h-full card-grid skeloader">
                <div class="px-15 py-10">
                    <h5 class="m-0 text-capitalize font-weight-bold">${name ? name + " - " + episode : ""}</h5>
                </div>
            </div>
        </div>
        `
    }
    return template
}
let skeletonCard = cardCreator()

const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())

async function nyaaSearch(media, episode) {
    if (parseInt(episode) < 10) {
        episode = `0${episode}`
    }
    if (media.status == "FINISHED") {

    }

    let table = document.querySelector("tbody.results")
    let results = await nyaaRss(media, episode)

    if (results.children.length == 0) {
        halfmoon.initStickyAlert({
            content: `Couldn't find torrent for ${media.title.userPreferred} Episode ${parseInt(episode)}! Try specifying a torrent manually.`,
            title: "Search Failed",
            alertType: "alert-danger",
            fillType: ""
        })
    } else {
        table.textContent = ""
        table.appendChild(results)
        halfmoon.toggleModal("tsearch")
    }
}

async function nyaaRss(media, episode) {
    let frag = document.createDocumentFragment(),
        ep = (media.status == "FINISHED" && settings.torrent9) ? `"01-${media.episodes}"|"01~${media.episodes}"|"batch"|"Batch"|"complete"|"Complete"|"+01+"|"+01v"` : `"+${episode}+"|"+${episode}v"`,
        url = new URL(`https://miru.kirdow.com/request/?url=https://nyaa.si/?page=rss$c=1_2$f=${settings.torrent3 == true ? 2 : 0}$s=seeders$o=desc$q=(${[...new Set(Object.values(media.title).concat(media.synonyms).filter(name => name != null))].join(")|(")})${ep}"${settings.torrent1}"`)
    // console.log(`"${[...new Set(Object.values(media.title).concat(media.synonyms).filter(name => name != null))].join("\"|\"")}"${ep}"${settings.torrent1}"`)
    res = await fetch(url)
    await res.text().then((xmlTxt) => {
        try {
            let doc = DOMPARSER(xmlTxt, "text/xml")
            if (settings.torrent2 && doc.querySelectorAll("infoHash")[0]) {
                addTorrent(doc.querySelectorAll("infoHash")[0].textContent, media, episode)
                halfmoon.toggleModal("tsearch")
            }
            doc.querySelectorAll("item").forEach((item, index) => {
                let i = item.querySelector.bind(item)
                let template = document.createElement("tr")
                template.innerHTML += `
                <th>${(index + 1)}</th>
                <td>${i("title").textContent}</td>
                <td>${i("size").textContent}</td>
                <td>${i("seeders").textContent}</td>
                <td>${i("leechers").textContent}</td>
                <td>${i("downloads").textContent}</td>
                <td class="pointer">Play</td>`
                template.onclick = () => { addTorrent(i('infoHash').textContent, media, episode) }
                frag.appendChild(template)
            })

        } catch (e) {
            console.error(e)
        }
    })
    return frag
}
async function resolveName(name, method) {
    if (!store.hasOwnProperty(name) && !alResponse.data.Page.media.some(media => (Object.values(media.title).concat(media.synonyms).filter(name => name != null).includes(name) && ((store[name] = media) && true)))) {
        let res = await alRequest(name, method)
        if (!res.data.Page.media[0]) {
            res = await alRequest(name.replace(" (TV)", "").replace(` (${new Date().getFullYear()})`, ""), method)
        }
        if (settings.torrent7 && !res.data.Page.media[0] && method == "SearchReleasesSingle") {
            res = await alRequest(name, "SearchAnySingle")
        }
        store[name] = res.data.Page.media[0]
    }
    return store[name]
}

const nameParseRegex = {
    simple: /(\[.[^\]]*\]\ ?|\(.[^\)]*\)\ ?)?(.+?(?=\ \-\ \d{2,}|\ \–\ \d{2,}))?(\ \-\ |\ \–\ )?(\d{2,})?(.*)?/i,
    fallback: /((?:\[[^\]]*\])*)?\s*((?:[^\d\[\.](?!S\d))*)?\s*((?:S\d+[^\w\[]*E?)?[\d\-]*)\s*(.*)?/i
}
let store = JSON.parse(localStorage.getItem("store")) || {},
    lastResult

async function releasesRss() {
    let frag = document.createDocumentFragment(),
        releases = document.querySelector(".releases"),
        url
    if (Object.values(torrent4list.options).filter(item => item.value == settings.torrent4)[0]) {
        url = settings.torrent4 == "Erai-raws" ? new URL(Object.values(torrent4list.options).filter(item => item.value == settings.torrent4)[0].innerText + settings.torrent1 + "-magnet") : new URL(Object.values(torrent4list.options).filter(item => item.value == settings.torrent4)[0].innerText + settings.torrent1)
    } else {
        url = settings.torrent4 + settings.torrent1
    }
    let res = await fetch(url)
    await res.text().then(async (xmlTxt) => {
        try {
            let doc = DOMPARSER(xmlTxt, "text/xml")
            if (lastResult != doc) {
                releases.textContent = '';
                releases.appendChild(skeletonCard)
                lastResult = doc
                let items = doc.querySelectorAll("item")
                for (let item of items) {
                    let i = item.querySelector.bind(item),
                        regexParse = nameParseRegex.simple.exec(i("title").textContent),
                        episode
                    if (!regexParse[2]) {
                        regexParse = nameParseRegex.fallback.exec(i("title").textContent)
                        episode = regexParse[3]
                    } else {
                        episode = regexParse[4]
                    }

                    let media = await resolveName(regexParse[2], "SearchReleasesSingle"),
                        template = cardCreator(media, regexParse[2], episode)
                    template.onclick = () => {
                        addTorrent(i('link').textContent, media, episode)
                    }
                    frag.appendChild(template)
                }
                releases.textContent = '';
                releases.appendChild(frag)
            }
        } catch (e) {
            console.error(e)
        }
    })

    localStorage.setItem("store", JSON.stringify(store))
}
clearRelCache.onclick = () => {
    localStorage.removeItem("store")
    store = {}
}
setInterval(() => {
    if (document.location.hash == "#releases") {
        releasesRss()
    }
}, 30000);
async function loadAnime() {
    await searchAnime()
    releasesRss()
}
loadAnime()

let alID
if (localStorage.getItem("ALtoken")) {
    alRequest(undefined, "Viewer").then(result => {
        oauth.removeAttribute("href")
        oauth.setAttribute("data-title", `${result.data.Viewer.name}\nClick To Logout`)
        oauth.innerHTML = `<img src="${result.data.Viewer.avatar.medium}" class="m-0">`
        oauth.onclick = () => {
            localStorage.removeItem("ALtoken");
            location.reload()
        }
        alID = result.data.Viewer.id
    })
}
