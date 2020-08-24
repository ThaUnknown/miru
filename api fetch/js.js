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
                large
            }
            bannerImage
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
                large
            }
            bannerImage
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
            template.classList.add("card", "bg-dark")
            template.innerHTML = `
                        <div class="row no-gutters h-100">
                            <div class="col-4 h-100">
                                <img src="${media.coverImage.large}" class="cover-img">
                                <div class="card-img-overlay d-flex align-content-end flex-wrap p-0">
                                    <div class="bg-tp-dark d-flex flex-grow-1 px-3 py-2">
                                        ${!!media.title.english ? media.title.english : media.title.romaji}
                                    </div>
                                </div>
                            </div>
                            <div class="col-8 h-100 card-grid">
                                <div class="card-header px-3 pb-1">
                                    <h5 class="m-0 text-capitalize">${(!!media.season ? media.season.toLowerCase() + " " : "") + (!!media.seasonYear ? media.seasonYear : "")}</h5>
                                    <p class="card-text text-muted mb-0 text-capitalize"><small>${((!!media.format ? (media.format == "TV" ? media.format + " Show" : media.format) + " • " : "") + (!!media.episodes ? media.episodes + " Episodes • " : (!!media.duration ? media.duration + " Minutes • " : "")) + (!!media.status ? media.status.toLowerCase() : ""))}</small></p>
                                </div>
                                <div class="card-body ovf-y-scroll px-3 py-2">
                                    <p class="card-text mb-0">${media.description}</p>
                                </div>
                                <div class="card-footer px-3 py-2">
                                    ${media.genres.map(key => (`<span class="badge badge-pill badge-primary">${key}</span> `)).join('')}
                                </div>
                            </div>
                        </div>
            `
            template.onclick = function () {
                viewAnime(index)
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
function hideAnime() {
    document.querySelector(".view").setAttribute("hidden", "")
}

function viewAnime(a) {
    let media = request.data.Page.media[a]
    let details = ["title.english", "title.romaji", "status", "season", "seasonYear", "episodes", "duration", "format", "averageScore"]
    document.querySelector(".view").removeAttribute("hidden")
    document.querySelector(".view .banner img").src = media.bannerImage
    document.querySelector(".view .contain-img").src = media.coverImage.large
    document.querySelector(".view .contain-img").src = media.coverImage.large
    document.querySelector(".view .title").textContent = !!media.title.english ? media.title.english : media.title.romaji
    document.querySelector(".view .desc").innerHTML = !!media.description ? media.description : ""
    tsearch(a, 1)
}
const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())


function tsearch(a, b) {
    let name = request.data.Page.media[a].title.romaji,
        table = document.querySelector("tbody.tsearch")
    if (b < 10) {
        b = `0${b}`
    }
    let url = new URL(`https://nyaa.si/?page=rss&c=1_2&f=2&s=seeders&o=desc&q=${name}" ${b} "`)
    let frag = document.createDocumentFragment(),
        hasBegun = true
    fetch(url).then((res) => {
        res.text().then((xmlTxt) => {
            try {
                let doc = DOMPARSER(xmlTxt, "text/xml")
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
                                    <td onclick="addTorrent('${i('infoHash').textContent}')">Play</td>
                            `
                    frag.appendChild(template)
                })
            } catch (e) {
                console.error(e)
            }
            if (hasBegun) {
                table.textContent = "";
                hasBegun = false;
            }
            table.appendChild(frag)
        })
    }).catch(() => console.error("Error in fetching the RSS feed"))
}


alRequest()
