class ParsedSubtitle {
  constructor(subtitle, tracknumber) {
    this._trackN = tracknumber
    this._subtitle = subtitle
    this._time = subtitle.time
    this._duration = subtitle.duration
    this._text = subtitle.text
    this._cue = new VTTCue(subtitle.time / 1000, (subtitle.time + subtitle.duration) / 1000, subtitle.text)
  }

  get trackNumber() {
    return this._trackN
  }

  get raw() {
    return this._subtitle
  }

  get time() {
    return this._time
  }

  get duration() {
    return this._duration
  }

  get end() {
    return this._time + this._duration
  }

  get text() {
    return this._text
  }

  get vttcue() {
    return this._cue
  }

  get hashid() {
    if (this._hash !== undefined) {
      return this_hash
    }

    let result = 17
    
    result = 31 * Math.trunc(this._time)
    result = 31 * Math.trunc(this._duration)

    return this._hash = result
  }
}

class SubtitleHandler {
  constructor(parser) {
    this._parser = parser
    this._subs = []
  }

  add(sub) {
    if (!this._subs.some(item => item.hashid === sub)) {
      this._subs.add(sub)
    }
  }


}

function setSubsTrack(track) {
  if (track !== undefined) {
    track.mode = "showing"
    window._texttrack = track
  }
}

function getSubsTrack(callback) {
  if (window._texttrack !== undefined && typeof callback === "function") {
    callback(window._texttrack)
  }
}

parser.once('tracks', function (tracks) {
    console.log(tracks)
  })
  

  parser.on('subtitle', function (subtitle, trackNumber) {
    console.log('Track ' + trackNumber + ':', subtitle)

    const sub = new ParsedSubtitle(subtitle, trackNumber)

    getSubsTrack(track => {
      track.addCue(sub.vttcue)
    })
  })