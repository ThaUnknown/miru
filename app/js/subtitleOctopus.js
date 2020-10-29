const { SubtitleStream } = MatroskaSubtitles
const { SubtitleParser } = MatroskaSubtitles

function subStream(stream) {
    if (video.src.endsWith(".mkv")) {
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
                        playerData.subtitles[track.number] = []
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
            if (playerData.headers) {
                let formatSub = "Dialogue: " + subtitle.layer + "," + new Date(subtitle.time).toISOString().slice(12, -1).slice(0, -1) + "," + new Date(subtitle.time + subtitle.duration).toISOString().slice(12, -1).slice(0, -1) + "," + subtitle.style + "," + subtitle.name + "," + subtitle.marginL + "," + subtitle.marginR + "," + subtitle.marginV + "," + subtitle.effect + "," + subtitle.text
                if (!playerData.subtitles[trackNumber].includes(formatSub)) {
                    playerData.subtitles[trackNumber].push(formatSub)
                    if (playerData.selectedHeader == trackNumber)
                        renderSubs.call(null, trackNumber)
                }
            } else {
                if (!Object.values(playerData.tracks[trackNumber].cues).some(c => c.text == subtitle.text && c.startTime == subtitle.time / 1000 && c.endTime == (subtitle.time + subtitle.duration) / 1000)) {
                    let cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
                    playerData.tracks[trackNumber].addCue(cue)
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
    if (trackNumber) {
        var trackContent = playerData.headers[trackNumber].header.slice(0, -1) + playerData.subtitles[trackNumber].join("\n")
    } else {
        var trackContent = playerData.headers[3].header.slice(0, -1)
    }
    if (!playerData.octopusInstance) {
        let options = {
            video: video,
            subContent: trackContent,
            lossyRender: settings.subtitle2,
            fonts: playerData.fonts.length == 0 ? ["https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2"] : playerData.fonts,
            workerUrl: 'js/subtitles-octopus-worker.js'
        };
        playerData.octopusInstance = new SubtitlesOctopus(options);
    } else {
        playerData.octopusInstance.setTrack(trackContent)
    }
}