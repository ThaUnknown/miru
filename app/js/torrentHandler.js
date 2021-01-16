let client = new WebTorrent({ maxConns: settings.torrent6 })
window.onbeforeunload = () => { //cleanup shit before unloading to free RAM/drive
    cleanupVideo()
    cleanupTorrents()
    if (playerData.fonts) playerData.fonts.forEach(file => URL.revokeObjectURL(file))
    if (dl.href) URL.revokeObjectURL(dl.href)
}

const announceList = [
    ['wss://tracker.openwebtorrent.com']
    // ['wss://tracker.novage.com.ua/']
    // ['wss://tracker.btorrent.xyz'] // for now disabled cuz broken
    // ['wss://tracker.webtorrent.io'],
    // ['wss://tracker.fastcast.nz'],
    // ['wss://video.blender.org:443/tracker/socket'],
    // ['wss://tube.privacytools.io:443/tracker/socket'],
    // ['wss://tracker.sloppyta.co:443/announce'],
    // ['wss://tracker.lab.vvc.niif.hu:443/announce'],
    // ['wss://tracker.files.fm:7073/announce'],
    // ['wss://open.tube:443/tracker/socket'],
    // ['wss://hub.bugout.link:443/announce'],
    // ['wss://peertube.cpy.re:443/tracker/socket'], 
    // ['ws://tracker.sloppyta.co:80/announce'],
    // ['ws://tracker.lab.vvc.niif.hu:80/announce'],
    // ['ws://tracker.files.fm:7072/announce'],
    // ['ws://tracker.btsync.cf:6969/announce'],
    // ['ws://hub.bugout.link:80/announce']
],
    videoExtensions = [
        '.avi', '.mp4', '.m4v', '.webm', '.mov', '.mkv', '.mpg', '.mpeg', '.ogv', '.wmv', '.m2ts'
    ],
    scope = "/app/",
    sw = navigator.serviceWorker.register('sw.js', { scope }).then(e => {
        if (searchParams.get("file")) addTorrent(searchParams.get("file"), {}) // add a torrent if its in the link params
    }).catch(e => {
        if (String(e) == "InvalidStateError: Failed to register a ServiceWorker: The document is in an invalid state.") {
            location.reload() // weird workaround for a weird bug
        } else {
            throw e
        }
    })

// for debugging
function t(a) {
    switch (a) {
        case 1:
            addTorrent("https://webtorrent.io/torrents/sintel.torrent", {})
            break;
        case 2:
            addTorrent("https://webtorrent.io/torrents/tears-of-steel.torrent", {})
            break;
        case 3:
            addTorrent("magnet:?xt=urn:btih:CE9156EB497762F8B7577B71C0647A4B0C3423E1&dn=Inception+%282010%29+720p+-+mkv+-+1.0GB+-+YIFY&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce", {})
            break;
    }
}
// offline storage initial load
let offlineTorrents
async function loadOfflineStorage() {
    offlineTorrents = new Set([...await indexedDB.databases()].map(object => { return object.name }));
    [...offlineTorrents].forEach(torrentID => offlineDownload(torrentID, true)) // adds all offline store torrents to the client
}

// add torrent for offline download
function offlineDownload(torrentID, skipVerify) {
    let torrent = client.add(torrentID, {
        store: IdbChunkStore,
        skipVerify: skipVerify
    })
    torrent.on("metadata", async () => {
        offlineTorrents.add(torrent.infoHash)
        let regexParse = nameParseRegex.simple.exec(torrent.name),
            episode
        if (!regexParse[2]) {
            regexParse = nameParseRegex.fallback.exec(torrent.name)
            episode = regexParse[3]
        } else {
            episode = regexParse[4]
        }

        let media = await resolveName(regexParse[2], "SearchName"),
            template = cardCreator(media, regexParse[2], episode)
        template.onclick = async () => {
            addTorrent(torrent, { media: media, episode: episode })
            if (media) {
                let res = await alRequest(media.id, { id: media.id, method: "SearchIDSingle" })
                store[regexParse[2]] = res.data.Media // force updates entry data on play in case its outdated, needs to be made cleaner and somewhere else...
            }
        }
        document.querySelector(".downloads").appendChild(template)
    })
}

loadOfflineStorage()

// cleanup torrent and store
function cleanupTorrents() {
    client.torrents.filter(torrent => {
        return !offlineTorrents.has(torrent.infoHash) // creates an array of all non-offline store torrents and removes them
    }).forEach(torrent => {
        torrent.destroy({ destroyStore: true })
    })
}

// manually add trackers
WEBTORRENT_ANNOUNCE = announceList.map(arr => arr[0]).filter(url => url.indexOf('wss://') === 0)

let videoFiles
async function playTorrent(torrent, opts) {
    torrent.on('noPeers', () => {
        if (torrent.progress != 1) {
            halfmoon.initStickyAlert({
                content: `Couldn't find peers for <span class="text-break">${torrent.infoHash}</span>! Try a torrent with more seeders.`,
                title: "Search Failed",
                alertType: "alert-danger",
                fillType: ""
            });
        }
    })
    await sw
    videoFiles = torrent.files.filter(file => videoExtensions.some(ext => file.name.endsWith(ext)))
    if (videoFiles) {
        buildVideo(torrent, opts)
    } else {
        halfmoon.initStickyAlert({
            content: `Couldn't find video file for <span class="text-break">${torrent.infoHash}</span>!`,
            title: "Search Failed",
            alertType: "alert-danger",
            fillType: ""
        });
        cleanupTorrents()
    }
}

function addTorrent(torrentID, opts) {
    halfmoon.hideModal("tsearch")
    document.location.hash = "#player"
    cleanupVideo()
    cleanupTorrents()
    if (client.get(torrentID)) {
        playTorrent(client.get(torrentID), opts)
    } else {
        client.add(torrentID, settings.torrent5 ? { store: IdbChunkStore } : {}, function (torrent) {
            playTorrent(torrent, opts)
        })
    }
}

function serveFile(file, req) {
    const res = {
        status: 200,
        headers: {
            'Content-Type': file._getMimeType() || 'video/webm',
            // Support range-requests
            'Accept-Ranges': 'bytes'
        }
    }

    // `rangeParser` returns an array of ranges, or an error code (number) if
    // there was an error parsing the range.
    let range = rangeParser(file.length, req.headers.get('range') || '')

    if (Array.isArray(range)) {
        res.status = 206 // indicates that range-request was understood

        // no support for multi-range request, just use the first range
        range = range[0]

        res.headers['Content-Range'] = `bytes ${range.start}-${range.end}/${file.length}`
        res.headers['Content-Length'] = `${range.end - range.start + 1}`
    } else {
        range = null
        res.headers['Content-Length'] = file.length
    }


    res.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    res.headers['Expires'] = '0'
    res.body = req.method === 'HEAD' ? '' : 'stream'
    // parser is really a passthrough mkv stream now
    let stream = file.createReadStream(range)
    if ((file.name.endsWith(".mkv") || file.name.endsWith(".webm")) && !playerData.parsed) subStream(stream)

    return [res, req.method === 'GET' && playerData.subtitleStream || stream]
}

// kind of a fetch event from service worker but for the main thread.
let lastport
navigator.serviceWorker.addEventListener('message', evt => {
    const request = new Request(evt.data.url, {
        headers: evt.data.headers,
        method: evt.data.method
    })

    const [port] = evt.ports
    const respondWith = msg => port.postMessage(msg)
    const pathname = request.url.split(evt.data.scope + 'webtorrent/')[1]
    let [infoHash, ...filePath] = pathname.split('/')
    filePath = decodeURI(filePath.join('/'))

    if (!infoHash || !filePath) return

    const torrent = client.get(infoHash)
    const file = torrent.files.find(file => file.path === filePath)

    const [response, stream] = serveFile(file, request)
    const asyncIterator = stream && stream[Symbol.asyncIterator]()
    respondWith(response)
    async function pull() {
        respondWith((await asyncIterator.next()).value)
    }

    port.onmessage = pull

    // hack: stop hiding the old stream somewhere in memory land
    if (lastport) lastport.onmessage = null
    lastport = port
})

function prettyBytes(num) {
    let exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    unit = units[exponent]
    return (neg ? '-' : '') + num + ' ' + unit
}