const searchRx = /(magnet:)?([A-F\d]{8,40})?(.*\.torrent)?/i;
function searchBox() {
    let regexParse = searchRx.exec(search.value)
    if (regexParse[1] || regexParse[2] || regexParse[4]) {
        addTorrent(search.value)
    } else {
        searchAnime(search.value)
    }
}
async function alRequest(a, b) {
    let query,
        variables = {
            type: "ANIME",
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
        }
    if (localStorage.getItem("ALtoken")) {
        options.headers['Authorization'] = localStorage.getItem("ALtoken")
    }
    if (!a) {
        variables.sort = "TRENDING_DESC"
        variables.perPage = 50
        query = `
        query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
            Page (page: $page, perPage: $perPage) {
                pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }
                media(type: $type, sort: $sort) {
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
                }
            }
        }
        `
    } else {
        variables.search = a
        variables.perPage = b
        variables.status = "RELEASING"
        query = `
        query ($page: Int, $sort: [MediaSort], $search: String, $type: MediaType, $status: MediaStatus) {
            Page (page: $page) {
                media (type: $type, search: $search, sort: $sort, status: $status) {
                    id
                    title {
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
                    genres
                    coverImage {
                        extraLarge
                        medium
                        color
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
    if (store[playerData.nowPlaying[0]]) {
        let query = `
mutation ($id: Int, $status: MediaListStatus, $episode: Int) {
    SaveMediaListEntry (mediaId: $id, status: $status, progress: $episode) {
        id
        status
        progress
    }
}`,
            variables = {
                id: parseInt(store[playerData.nowPlaying[0]].id),
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
    alResponse = await alRequest(a)
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
    duration: "Episode Duration",
    episodes: "Episodes",
    format: "Format",
    genres: "Genres",
    season: "Season",
    seasonYear: "Year",
    status: "Status",
    english: "English",
    romaji: "Romaji",
    native: "Native",
    synonyms: "Synonyms"
}

function viewAnime(media) {
    halfmoon.toggleModal("view")
    if (media.bannerImage != null) {
        document.querySelector(".view .banner img").src = media.bannerImage
        document.querySelector(".view .cover-wrapper").classList.add("mt-nc")
    } else {
        document.querySelector(".view .banner img").src = ""
        document.querySelector(".view .cover-wrapper").classList.remove("mt-nc")
    }
    document.querySelector(".view .contain-img").src = media.coverImage.extraLarge
    document.querySelector(".view .title").textContent = media.title.userPreferred
    document.querySelector(".view .desc").innerHTML = media.description || ""
    document.querySelector(".view .details").innerHTML = ""
    play.onclick = () => { nyaaSearch(media, ep.value); halfmoon.toggleModal("view") }
    detailsCreator(media)
    ep.value = 1
    ep.max = media.episodes || 999
    document.querySelector(".view .details").appendChild(detailsfrag)
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
function cardCreator(media, regexParse) {
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
                <h5 class="m-0 text-capitalize font-weight-bold">${media.title.userPreferred}${regexParse ? " - " + regexParse[4] : ""}</h5>
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
                    <h5 class="m-0 text-capitalize font-weight-bold">${regexParse ? regexParse[2] + " - " + regexParse[4] : ""}</h5>
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

    let titles = Object.values(media.title).concat(media.synonyms).filter(name => name != null)
    let table = document.querySelector("tbody.results")
    let results = document.createDocumentFragment()

    for (let title of titles) {
        if (results.children.length == 0) {
            title = title.replace(/ /g, "+")
            let url = new URL(`https://miru.kirdow.com/request/?url=https://nyaa.si/?page=rss$c=1_2$f=${settings.torrent3 == true ? 2 : 0}$s=seeders$o=desc$q=${title}"+${episode}+"+${settings.torrent1}`)
            results = await nyaaRss(url)
        }
    }

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
        playerData.selected = [media, parseInt(episode)]
    }
}

async function nyaaRss(url) {
    let frag = document.createDocumentFragment()
    res = await fetch(url)
    await res.text().then((xmlTxt) => {
        try {
            let doc = DOMPARSER(xmlTxt, "text/xml")
            if (settings.torrent2 && doc.querySelectorAll("infoHash")[0]) {
                addTorrent(doc.querySelectorAll("infoHash")[0].textContent)
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
                <td onclick="addTorrent('${i('infoHash').textContent}')" class="pointer">Play</td>`
                frag.appendChild(template)
            })

        } catch (e) {
            console.error(e)
        }
    })
    return frag
}


const regex = /((?:\[[^\]]*\])*)?\s*((?:[^\d\[\.](?!S\d))*)?\s*((?:S\d+[^\w\[]*E?)?[\d\-]*)\s*(.*)?/i,
    eregex = /(\[.*\]\ ?)?(.+?(?=\ \–\ \d))?(\ \–\ )?(\d+)?/i,
    plsregex = /(\[.[^\]]*\]\ ?)?(.+?(?=\ \-\ \d))?(\ \-\ )?(\d+)?(.*)?/i
let store = {},
    lastResult

async function hsRss() {
    if (document.location.href.endsWith("#releases")) {
        let frag = document.createDocumentFragment(),
            releases = document.querySelector(".releases"),
            url = settings.torrent4 == "https://miru.kirdow.com/request/?url=https://www.erai-raws.info/rss-" ? settings.torrent4 + settings.torrent1 + "-magnet" : settings.torrent4 + settings.torrent1
        res = await fetch(url)
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
                            regexParse = plsregex.exec(i("title").textContent)
                        if (!store.hasOwnProperty(regexParse[2]) && !alResponse.data.Page.media.some(media => (Object.values(media.title).concat(media.synonyms).filter(name => name != null).includes(regexParse[2]) && ((store[regexParse[2]] = media) && true)))) {
                            //shit not found, lookup
                            let res = await alRequest(regexParse[2], 1)
                            if (!res.data.Page.media[0]) {
                                res = await alRequest(regexParse[2].replace(" (TV)", "").replace(` (${new Date().getFullYear()})`, ""), 1)
                            }
                            store[regexParse[2]] = res.data.Page.media[0]
                        }
                        let media = store[regexParse[2]],
                            template = cardCreator(media, regexParse)
                        template.onclick = () => {
                            playerData.selected = [regexParse[2], regexParse[4]]
                            addTorrent(i('link').textContent)
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
    }
}
refRel.onclick = () => {
    hsRss()
}
setInterval(() => {
    hsRss()
}, 30000);
async function loadAnime() {
    await searchAnime()
    hsRss()
}
loadAnime()