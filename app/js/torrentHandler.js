const client = new WebTorrent(),
    announceList = [
        ['wss://tracker.openwebtorrent.com'],
        ['wss://tracker.btorrent.xyz'],
        ['wss://tracker.webtorrent.io'],
        ['wss://tracker.fastcast.nz'],
        ['wss://video.blender.org:443/tracker/socket'],
        ['wss://tube.privacytools.io:443/tracker/socket'],
        ['wss://tracker.sloppyta.co:443/announce'],
        ['wss://tracker.lab.vvc.niif.hu:443/announce'],
        ['wss://tracker.files.fm:7073/announce'],
        ['wss://open.tube:443/tracker/socket'],
        ['wss://hub.bugout.link:443/announce'],
        ['wss://peertube.cpy.re:443/tracker/socket'],
        ['ws://tracker.sloppyta.co:80/announce'],
        ['ws://tracker.lab.vvc.niif.hu:80/announce'],
        ['ws://tracker.files.fm:7072/announce'],
        ['ws://tracker.btsync.cf:6969/announce'],
        ['ws://hub.bugout.link:80/announce']
    ],
    videoExtensions = [
        '.avi', '.mp4', '.m4v', '.webm', '.mov', '.mkv', '.mpg', '.mpeg', '.ogv', '.webm', '.wmv', '.m2ts'
    ],
    scope = '/app/',
    sw = navigator.serviceWorker.register('sw.js', { scope })
//for debugging
function t(a) {
    switch (a) {
        case 1:
            addTorrent("https://webtorrent.io/torrents/sintel.torrent")
            break;
        case 2:
            addTorrent("https://webtorrent.io/torrents/tears-of-steel.torrent")
            break;
        case 3:
            addTorrent("magnet:?xt=urn:btih:CE9156EB497762F8B7577B71C0647A4B0C3423E1&dn=Inception+%282010%29+720p+-+mkv+-+1.0GB+-+YIFY&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce")
            break;
    }
}
WEBTORRENT_ANNOUNCE = announceList
    .map(function (arr) {
        return arr[0]
    })
    .filter(function (url) {
        return url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0
    })
let nowPlaying,
    maxTorrents = 1
async function addTorrent(magnet) {
    if (client.torrents.length >= maxTorrents) {
        client.remove(client.torrents[0].infoHash)
    }
    halfmoon.hideModal("tsearch")
    document.location.href = "#player"
    resetVideo()
    selected ? selPlaying(selected) : ""
    await sw
    client.add(magnet, async function (torrent) {
        function onProgress() {
            peers.textContent = torrent.numPeers
            downSpeed.textContent = prettyBytes(torrent.downloadSpeed) + '/s'
            upSpeed.textContent = prettyBytes(torrent.uploadSpeed) + '/s'
        }
        torrent.on('download', onProgress)
        torrent.on('upload', onProgress)
        // torrent.on('warning', console.log) // too spammy for now
        // torrent.on('error', console.log)
        torrent.on('noPeers', function () {
            halfmoon.initStickyAlert({
                content: `Couldn't find peers for <span class="text-break">${torrent.infoHash}</span>! Try a torrent with more seeders.`,
                title: "Search Failed",
                alertType: "alert-danger",
                fillType: ""
            });
        })
        let videoFile = torrent.files[0]
        torrent.files.forEach(file => {
            if (file.length > videoFile.length) {
                videoFile = file
            }
        })
        torrent.on('done', function () {
            setInterval(onProgress, 5000)
            halfmoon.initStickyAlert({
                content: `<span class="text-break">${torrent.infoHash}</span> has finished downloading. Now seeding.`,
                title: "Download Complete",
                alertType: "alert-success",
                fillType: ""
            });
            finishThumbnails(videoFile);
            downloadFile(videoFile)
        })
        subtitleStream = undefined
        video.src = `${scope}webtorrent/${torrent.infoHash}/${encodeURI(videoFile.path)}`
    })

}


function serveFile(file, req) {
    const res = {
        status: 200,
        headers: {
            'Content-Type': file._getMimeType() ? file._getMimeType() : 'video/webm',
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
    parseSubs(stream)

    return [res, req.method === 'GET' && subtitleStream || stream]
}

// kind of a fetch event from service worker but for the main thread.
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
})

function prettyBytes(num) {
    var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    unit = units[exponent]
    return (neg ? '-' : '') + num + ' ' + unit
}