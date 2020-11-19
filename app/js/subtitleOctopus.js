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
            console.log("subtitle")
            if (playerData.headers) {
                if (!playerData.subtitles[trackNumber].has(subtitle)) {
                    playerData.subtitles[trackNumber].add(subtitle)
                    // if (playerData.selectedHeader == trackNumber){
                    renderSubs(trackNumber, subtitle)
                    // }
                }
            }
            // } else {
            //     if (!Object.values(playerData.tracks[trackNumber].cues).some(c => c.text == subtitle.text && c.startTime == subtitle.time / 1000 && c.endTime == (subtitle.time + subtitle.duration) / 1000)) {
            //         let cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
            //         playerData.tracks[trackNumber].addCue(cue)
            //     }
            // }
        })
        playerData.subtitleStream.on('file', file => {
            file.mimetype == ("application/x-truetype-font" || "application/font-woff") ? playerData.fonts.push(window.URL.createObjectURL(new Blob([file.data], { type: file.mimetype }))) : ""
        })
        stream.pipe(playerData.subtitleStream)
    }
}
function renderSubs(trackNumber, subtitle) {
    if (trackNumber) {
        var trackContent = playerData.headers[trackNumber].header.slice(0, -1)
        // playerData.subtitles[trackNumber].join("\n")
        console.log("1")
    } else {
        var trackContent = playerData.headers[3].header.slice(0, -1)
        console.log("2")
    }
    if (!playerData.octopusInstance) {
        console.log("3")
        let options = {
            video: video,
            subContent: trackContent,
            lossyRender: settings.subtitle2,
            fonts: playerData.fonts.length == 0 ? ["https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2"] : playerData.fonts,
            workerUrl: 'js/subtitles-octopus-worker.js'
        };
        playerData.octopusInstance = new SubtitlesOctopus(options);
        playerData.octopusInstance.getStyles()
    }
    console.log("4")
    // playerData.octopusInstance.setTrack(trackContent)
    let subObject = {
        Start: subtitle.time,
        Duration: subtitle.duration,
        ReadOrder: playerData.subtitles[trackNumber].size - 1,
        Layer: parseInt(subtitle.layer),
        Style: 1, //playerData.styles.findIndex(style => style.Name == subtitle.style) + 1 ||
        Name: subtitle.name || "",
        MarginL: parseInt(subtitle.marginL),
        MarginR: parseInt(subtitle.marginR),
        MarginV: parseInt(subtitle.marginV),
        Effect: subtitle.effect || "",
        Text: subtitle.text
    }
    console.log(subObject)
    playerData.octopusInstance.createEvent(subObject)
    playerData.octopusInstance.getEvents()

}