const { SubtitleStream } = MatroskaSubtitles
const { SubtitleParser } = MatroskaSubtitles

function subStream(stream) {
    if (video.src.endsWith(".mkv") || video.src.endsWith(".webm")) {
        if (playerData.subtitleStream) {
            playerData.subtitleStream = new SubtitleStream(playerData.subtitleStream)
        } else {
            playerData.subtitleStream = new SubtitleStream()
            playerData.subtitleStream.once('tracks', pTracks => {
                pTracks.forEach(track => {
                    if (track.type == "ass") {
                        if (!playerData.headers) {
                            playerData.headers = []
                        }
                        playerData.headers[track.number] = track
                        playerData.subtitles[track.number] = new Set()
                        playerData.selectedHeader = 3
                    } else {
                        playerData.tracks[track.number] = video.addTextTrack('captions', track.type, track.language);
                        let spacerCue = new VTTCue(0.1, 9999, "&nbsp;")
                        spacerCue.line = -1
                        playerData.tracks[track.number].addCue(spacerCue)
                    }
                })
                if (video.textTracks[0]) {
                    video.textTracks[0].mode = "showing"
                }
            })
        }
        playerData.subtitleStream.on('subtitle', (subtitle, trackNumber) => {
            if (!playerData.parsed) {
                if (playerData.headers) {
                    let formatSub = "Dialogue: " + subtitle.layer + "," + new Date(subtitle.time).toISOString().slice(12, -1).slice(0, -1) + "," + new Date(subtitle.time + subtitle.duration).toISOString().slice(12, -1).slice(0, -1) + "," + subtitle.style + "," + subtitle.name + "," + subtitle.marginL + "," + subtitle.marginR + "," + subtitle.marginV + "," + subtitle.effect + "," + subtitle.text
                    if (!playerData.subtitles[trackNumber].has(formatSub)) {
                        playerData.subtitles[trackNumber].add(formatSub)
                        if (playerData.selectedHeader == trackNumber)
                            renderSubs.call(null, trackNumber)
                    }
                } else {
                    if (!Object.values(playerData.tracks[trackNumber].cues).some(c => c.text == subtitle.text && c.startTime == subtitle.time / 1000 && c.endTime == (subtitle.time + subtitle.duration) / 1000)) {
                        let cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
                        playerData.tracks[trackNumber].addCue(cue)
                    }
                }
            }
        })
        playerData.subtitleStream.on('file', file => {
            file.mimetype == ("application/x-truetype-font" || "application/font-woff") ? playerData.fonts.push(window.URL.createObjectURL(new Blob([file.data], { type: file.mimetype }))) : ""
        })
        stream.pipe(playerData.subtitleStream)
    }
}
function renderSubs(trackNumber) {
    if (!playerData.octopusInstance) {
        let options = {
            video: video,
            subContent: trackNumber ? playerData.headers[trackNumber].header.slice(0, -1) + Array.from(playerData.subtitles[trackNumber]).join("\n") : playerData.headers[3].header.slice(0, -1),
            lossyRender: settings.subtitle2,
            fonts: playerData.fonts.length == 0 ? ["https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2"] : playerData.fonts,
            workerUrl: 'js/subtitles-octopus-worker.js'
        };
        playerData.octopusInstance = new SubtitlesOctopus(options);
    } else {
        pushSub(trackNumber)
    }
}

let octopusTimeout
function pushSub(trackNumber) {
    if (!octopusTimeout) {
        octopusTimeout = setTimeout(() => {
            octopusTimeout = undefined
            playerData.octopusInstance.setTrack(trackNumber ? playerData.headers[trackNumber].header.slice(0, -1) + Array.from(playerData.subtitles[trackNumber]).join("\n") : playerData.headers[3].header.slice(0, -1))
        }, 1000)
    }
}
function postDownload(file) {
    if (playerData.subtitleStream) {
        let parser = new SubtitleParser(),
            subtitles = []
        parser.once('tracks', pTracks => {
            pTracks.forEach(track => {
                subtitles[track.number] = new Set()
            })
        })
        parser.on('subtitle', (subtitle, trackNumber) => {
            if (playerData.headers) {
                subtitles[trackNumber].add("Dialogue: " + subtitle.layer + "," + new Date(subtitle.time).toISOString().slice(12, -1).slice(0, -1) + "," + new Date(subtitle.time + subtitle.duration).toISOString().slice(12, -1).slice(0, -1) + "," + subtitle.style + "," + subtitle.name + "," + subtitle.marginL + "," + subtitle.marginR + "," + subtitle.marginV + "," + subtitle.effect + "," + subtitle.text)
            } else if (!Object.values(playerData.tracks[trackNumber].cues).some(c => c.text == subtitle.text && c.startTime == subtitle.time / 1000 && c.endTime == (subtitle.time + subtitle.duration) / 1000)) {
                let cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
                playerData.tracks[trackNumber].addCue(cue)
            }
        })
        parser.on('finish', () => {
            playerData.subtitles = subtitles
            playerData.parsed = 1
            renderSubs.call(null, playerData.selectedHeader)
            if (settings.player9) {
                file.getBlobURL((err, url) => {
                    setTimeout(() => {
                        let time = video.currentTime,
                            playState = !video.paused
                        video.src = url
                        video.currentTime = time
                        playState ? video.play() : ""
                    }, 5000);
                })
            }
        });
        file.createReadStream().pipe(parser)
    }
}