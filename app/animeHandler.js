var query,
    variables = {
        type: "ANIME",
        page: 1,
        perPage: 50
    },
    request;

var url = 'https://graphql.anilist.co',
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
    };

function search() {
    let search = document.querySelector("#search").value
    if (search == "") {
        alRequest()
    } else {
        alRequest(search)
    }
}

function alRequest(a) {
    if (a == undefined) {
        variables.sort = "TRENDING_DESC"
        delete variables.search
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
            }
            bannerImage
            synonyms
        }
    }
}
`
    } else {
        variables.search = a
        delete variables.sort
        query = `
    query ($page: Int, $perPage: Int, $search: String, $type: MediaType) {
        Page (page: $page, perPage: $perPage) {
        pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
        }
        media (type: $type, search: $search) {
            id
            title {
                romaji
                english
                native
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
            }
            bannerImage
            synonyms
        }
    }
}
`
    }
    options.body = JSON.stringify({
        query: query,
        variables: variables
    })
    fetch(url, options).then((handleResponse))
        .then(handleData)
        .catch((error) => console.error(error));

    function handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
}

function handleData(data) {
    request = data
    console.log(request);
    let frag = document.createDocumentFragment(),
        hasBegun = true
    try {
        data.data.Page.media.forEach((media, index) => {
            let template = document.createElement("div")
            template.classList.add("card", "m-0", "p-0")
            template.innerHTML = `

    <div class="row h-full">
        <div class="col-4">
            <img src="${media.coverImage.extraLarge}"
                class="cover-img w-full h-full">
        </div>
        <div class="col-8 h-full card-grid">
            <div class="px-15 py-10">
                <h5 class="m-0 text-capitalize font-weight-bold">${!!media.title.english ? media.title.english : media.title.romaji}</h5>
                <p class="text-muted m-0 text-capitalize details">
                ${(!!media.format ? (media.format == "TV" ? "<span>" + media.format + " Show" : "<span>" + media.format) : "") + "</span>"}
                ${!!media.episodes ? "<span>" + media.episodes + " Episodes</span>" : (!!media.duration ? "<span>" + media.duration + " Minutes</span>" : "")}
                ${!!media.status ? "<span>" + media.status.toLowerCase() + "</span>" : ""}
                ${"<span>" + (!!media.season ? media.season.toLowerCase() + " " : "") + (!!media.seasonYear ? media.seasonYear : "") + "</span>"}
                 </p>
            </div>
            <div class="overflow-y-scroll px-15 py-10 bg-very-dark card-desc">
                ${media.description}
            </div>
            <div class="px-15 pb-10 pt-5">
                ${media.genres.map(key => (`<span class="badge badge-pill badge-primary mt-5">${key}</span> `)).join('')}
            </div>
        </div>
    </div>

            `
            template.onclick = function () {
                viewAnime(request.data.Page.media[index])
            }
            frag.appendChild(template)
        })
    } catch (e) {
        console.error(e)
    }
    if (hasBegun) {
        document.querySelector(".gallery").textContent = '';
        hasBegun = false;
    }
    document.querySelector(".gallery").appendChild(frag)
}
let detailsfrag = document.createDocumentFragment(),
    details = {
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
    document.querySelector(".view .banner img").src = ""
    document.querySelector(".view .banner img").src = media.bannerImage
    document.querySelector(".view .contain-img").src = media.coverImage.extraLarge
    document.querySelector(".view .title").textContent = !!media.title.english ? media.title.english : media.title.romaji
    document.querySelector(".view .desc").innerHTML = !!media.description ? media.description : ""
    document.querySelector(".view .details").innerHTML = ""
    document.querySelector(".view #play").onclick = function () { nyaaSearch(media.title, document.querySelector(".view #ep").value, 0); halfmoon.toggleModal("view")}
    detailsCreator(media)
    document.querySelector(".view .details").appendChild(detailsfrag)
}
function detailsCreator(entry) {
    if (entry != undefined) {
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
const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser()),
    searchTitle = document.querySelector("#title"),
    searchEpisode = document.querySelector("#ep")


function nyaaSearch(titles, episode, index) {
    if (episode.length < 2) {
        episode = `0${episode}`
    }
    let frag = document.createDocumentFragment(),
        table = document.querySelector("tbody.tsearch"),
        title = Object.values(titles)[index],
        url = new URL(`https://nyaa.si/?page=rss&c=1_2&f=2&s=seeders&o=desc&q=${title}" ${episode} "`)
    table.textContent = "";
    console.log(`https://nyaa.si/?page=rss&c=1_2&f=2&s=seeders&o=desc&q=${title}" ${episode} "`)
    fetch(url).then((res) => {
        res.text().then((xmlTxt) => {
            try {
                let doc = DOMPARSER(xmlTxt, "text/xml")
                if (doc.querySelectorAll("item").length != 0) {
                    doc.querySelectorAll("item").forEach((item, index) => {
                        let i = item.querySelector.bind(item),
                            template = document.createElement("tr")
                        template.innerHTML = `
                                <th>${(index + 1)}</th>
                                <td>${i("title").textContent}</td>
                                <td>${i("size").textContent}</td>
                                <td>${i("seeders").textContent}</td>
                                <td>${i("leechers").textContent}</td>
                                <td>${i("downloads").textContent}</td>
                                <td onclick="addTorrent('${i('infoHash').textContent}')" class="pointer">Play</td>
                        `
                        frag.appendChild(template)
                    })
                    halfmoon.toggleModal("tsearch")
                } else {
                    if (index < 2) {
                        nyaaSearch(titles, episode, index + 1)
                    } else {
                        halfmoon.initStickyAlert({
                            content: `Couldn't find torrent for ${!!titles.english ? titles.english : titles.romaji}! Try using a direct magnet link.`,
                            title: "Search Failed",
                            alertType: "alert-danger",
                            fillType: ""
                        });
                    }
                }
            } catch (e) {
                console.error(e)
            }
            table.appendChild(frag)
        })
    }).catch(() => console.error("Error in fetching the RSS feed"))

}
function tsearchform() {
    tsearch(searchTitle.value, searchEpisode.value)
}


alRequest()
