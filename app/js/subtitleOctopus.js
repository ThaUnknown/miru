let tracks = [],
    headers,
    subtitles = [],
    subtitleStream,
    octopusInstance
const { SubtitleStream } = MatroskaSubtitles

function subStream(stream) {
    if (video.src.endsWith(".mkv")) {
        if (subtitleStream) {
            subtitleStream = new SubtitleStream(subtitleStream)
        } else {
            subtitleStream = new SubtitleStream()
            subtitleStream.once('tracks', pTracks => {
                pTracks.forEach(track => {
                    if (track.type == "ass") {
                        if (!headers) {
                            headers = []
                        }
                        headers[track.number] = track.header
                        subtitles[track.number] = []
                    } else {
                        tracks[track.number] = video.addTextTrack('captions', track.type, track.language);
                        let spacerCue = new VTTCue(0.1, 9999, "&nbsp;")
                        spacerCue.line = -1
                        tracks[track.number].addCue(spacerCue)
                    }
                })
                if (video.textTracks[0]) {
                    video.textTracks[0].mode = "showing"
                }
            })
        }
        subtitleStream.on('subtitle', function (subtitle, trackNumber) {
            let formatSub = "Dialogue: " + subtitle.layer + "," + new Date(subtitle.time).toISOString().slice(12, -1).slice(0,-1) + "," + new Date(subtitle.time + subtitle.duration).toISOString().slice(12, -1).slice(0,-1) + "," + subtitle.style + "," + subtitle.name + "," + subtitle.marginL + "," + subtitle.marginR + "," + subtitle.marginV + "," + subtitle.effect + "," + subtitle.text
            if (headers) {
                if (!subtitles[trackNumber].includes(formatSub)) {
                    subtitles[trackNumber].push(formatSub)
                    renderSubs(3)
                }
            } else {
                if (!Object.values(tracks[trackNumber].cues).some(c => c.text == subtitle.text && c.startTime == subtitle.time / 1000 && c.endTime == (subtitle.time + subtitle.duration) / 1000)) {
                    let cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
                    tracks[trackNumber].addCue(cue)
                }
            }
        })
        stream.pipe(subtitleStream)
    }
}
function renderSubs(trackNumber) {
    let trackContent = headers[trackNumber].slice(0,-1)+subtitles[trackNumber].join("\n")
    if (!octopusInstance) {
        let options = {
            video: video,
            subContent: trackContent,
            workerUrl: 'js/subtitles-octopus-worker.js'
        };
        octopusInstance = new SubtitlesOctopus(options);
    } else {
        octopusInstance.setTrack(trackContent)
    }
}