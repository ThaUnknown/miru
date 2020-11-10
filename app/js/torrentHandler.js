let client = new WebTorrent({ maxConns: settings.torrent6 })
window.onbeforeunload = () => {
    client.torrents[0] ? client.torrents[0].store.destroy() : ""
    client.torrents[0] ? client.torrents[0].destroy() : ""
    client.destroy()
    resetVideo()
    if (playerData.fonts) {
        playerData.fonts.forEach(file => {
            URL.revokeObjectURL(file)
        })
    }
    if (dl.href) {
        URL.revokeObjectURL(dl.href)
    }
}

const announceList = [
    ['wss://tracker.openwebtorrent.com'],
    ['wss://tracker.btorrent.xyz']
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
    scope = window.location.pathname,
    sw = navigator.serviceWorker.register('sw.js', { scope }).then(e => {
        if (searchParams.get("m")) {
            addTorrent(searchParams.get("m"))
        }
    }).catch(e => {
        if (String(e) == "InvalidStateError: Failed to register a ServiceWorker: The document is in an invalid state.") {
            location.reload()
        } else {
            throw e
        }
    })
const torrentRx = /(magnet:)?([A-F\d]{8,40})?(.*\.torrent)?/i;
window.addEventListener("paste", async (e) => {
    let content = await navigator.clipboard.readText(),
        regexParse = torrentRx.exec(content)
    if (regexParse[1] || regexParse[2] || regexParse[3]) {
        e.preventDefault();
        addTorrent(content);
    }
})
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
let maxTorrents = 1,
    videoFiles
async function addTorrent(magnet, media, episode) {
    if (client.torrents.length >= maxTorrents) {
        client.torrents[0].store ? client.torrents[0].store.destroy() : ""
        client.torrents[0].destroy()
    }
    halfmoon.hideModal("tsearch")
    document.location.hash = "#player"
    let store
    cleanupVideo()
    await sw
    settings.torrent5 ? store = { store: IdbkvChunkStore } : store = {}
    client.add(magnet, store, function (torrent) {
        torrent.files.forEach(file => file.deselect());
        torrent.deselect(0, torrent.pieces.length - 1, false);
        torrent.on('noPeers', () => {
            if (client.torrents[0].progress != 1) {
                halfmoon.initStickyAlert({
                    content: `Couldn't find peers for <span class="text-break">${torrent.infoHash}</span>! Try a torrent with more seeders.`,
                    title: "Search Failed",
                    alertType: "alert-danger",
                    fillType: ""
                });
            }
        })
        videoFiles = torrent.files.filter(file => videoExtensions.some(ext => file.name.endsWith(ext)))
        if (videoFiles.length) {
            videoFiles.sort((a, b) => {
                return parseInt(nameParseRegex.fallback.exec(a.name)[3]) - parseInt(nameParseRegex.fallback.exec(b.name)[3])
            })
            if (videoFiles.length > 1) {
                bpl.removeAttribute("disabled")
            } else {
                bpl.setAttribute("disabled", "")
            }
            // torrent.on('done', () => {
            //     halfmoon.initStickyAlert({
            //         content: `<span class="text-break">${torrent.infoHash}</span> has finished downloading. Now seeding.`,
            //         title: "Download Complete",
            //         alertType: "alert-success",
            //         fillType: ""
            //     });
            //     if (settings.player8 && !settings.torrent5) {
            //         videoFiles[0].getBlobURL((err, url) => {
            //             finishThumbnails(url);
            //             downloadFile(url, videoFiles[0].name)
            //         })
            //         postDownload(videoFiles[0])
            //     }
            // })
            if (media && episode) {
                buildVideo(videoFiles[0], [media, episode])
            }
            else {
                buildVideo(videoFiles[0])
            }
        } else {
            halfmoon.initStickyAlert({
                content: `Couldn't find video file for <span class="text-break">${torrent.infoHash}</span>!`,
                title: "Search Failed",
                alertType: "alert-danger",
                fillType: ""
            });
            client.torrents[0].store ? client.torrents[0].store.destroy() : ""
            client.torrents[0].destroy()
        }

    })

}
function postDownload(file) {
    if (playerData.subtitleStream) {
        let parser = new SubtitleParser(),
            subtitles = []
        parser.once('tracks', pTracks => {
            pTracks.forEach(track => {
                subtitles[track.number] = []
            })
        })
        parser.on('subtitle', (subtitle, trackNumber) => {
            if (playerData.headers) {
                subtitles[trackNumber].push("Dialogue: " + subtitle.layer + "," + new Date(subtitle.time).toISOString().slice(12, -1).slice(0, -1) + "," + new Date(subtitle.time + subtitle.duration).toISOString().slice(12, -1).slice(0, -1) + "," + subtitle.style + "," + subtitle.name + "," + subtitle.marginL + "," + subtitle.marginR + "," + subtitle.marginV + "," + subtitle.effect + "," + subtitle.text)
            } else if (!Object.values(playerData.tracks[trackNumber].cues).some(c => c.text == subtitle.text && c.startTime == subtitle.time / 1000 && c.endTime == (subtitle.time + subtitle.duration) / 1000)) {
                let cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
                playerData.tracks[trackNumber].addCue(cue)
            }
        })
        parser.on('finish', () => {
            playerData.subtitles = subtitles
            renderSubs.call(null, playerData.selectedHeader)
        });
        file.createReadStream().pipe(parser)
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
    subStream(stream)

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