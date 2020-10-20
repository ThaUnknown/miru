const { SubtitleStream } = MatroskaSubtitles

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
                        if (!playerData.octopusInstance) {
                            let dummyEvent = "Comment: 0,0:00:00.00,0:00:00.01,Default,,0000,0000,0000,,."
                            let options = {
                                video: video,
                                subContent: track.header.slice(0, -1) + dummyEvent,
                                fonts: ["https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2"],
                                workerUrl: 'js/subtitles-octopus-worker.js'
                                // lossyRender: 'true'
                            };
                            playerData.octopusInstance = new SubtitlesOctopus(options);
                            playerData.octopusInstance.getStyles()
                        }
                        playerData.headers[track.number] = track.header
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
        playerData.subtitleStream.on('subtitle', function (subtitle, trackNumber) {
            if (playerData.headers) {
                let formatSub = {
                    Start: subtitle.time,
                    Duration: subtitle.duration,
                    ReadOrder: playerData.subtitles.length,
                    Layer: parseInt(subtitle.layer),
                    Style: playerData.styles.findIndex(style => style.Name ==  subtitle.style)+1 || 1,
                    Name: subtitle.name || " ",
                    MarginL: parseInt(subtitle.marginL),
                    MarginR: parseInt(subtitle.marginR),
                    MarginV: parseInt(subtitle.marginV),
                    Effect: subtitle.effect || " ",
                    Text: subtitle.text
                }
                if (!playerData.subtitles.includes(formatSub, 0)) {
                    console.log(formatSub)
                    console.log("pushing")
                    playerData.octopusInstance.getEvents()
                    playerData.subtitles.push(formatSub)
                    playerData.octopusInstance.createEvent(formatSub)
                    // setHeader.call(null, 3)
                } else {
                    console.log("no")
                }
            } else {
                if (!Object.values(playerData.tracks[trackNumber].cues).some(c => c.text == subtitle.text && c.startTime == subtitle.time / 1000 && c.endTime == (subtitle.time + subtitle.duration) / 1000)) {
                    let cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
                    playerData.tracks[trackNumber].addCue(cue)
                }
            }
        })
        stream.pipe(playerData.subtitleStream)
    }
}
function setHeader(trackNumber) {
    let trackContent = playerData.headers[trackNumber].slice(0, -1)
    playerData.octopusInstance.setTrack(trackContent)
}