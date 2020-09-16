let tracks = [],
  parser

function parseSubs(range, stream) {
  if (video.src.endsWith(".mkv")) {
    parser = new MatroskaSubtitles({ prevInstance: parser, offset: range.start })
    parser.once('tracks', function (pTracks) {
      tracks = []
      video.textTracks = {}
      pTracks.forEach(track => {
        tracks[track.number] = video.addTextTrack('captions', track.type, track.language || track.number)
      })
      if (video.textTracks[0]) {
        video.textTracks[0].mode = "showing"
      }
    })
    parser.once('cues', function () {
      console.log('seeking ready')
    })
    parser.on('subtitle', function (subtitle, trackNumber) {
      subConvt(subtitle, trackNumber)
    })
    stream.pipe(parser)
  }
}
const re_newline = /\\N/g, // replace \N with newline
  re_softbreak = /\\n/g,   // There's no equivalent function in WebVTT.
  re_hardspace = /\\h/g,    // Replace with &nbsp;
  re_style = /\{([^}]+)\}/; // replace style
function subConvt(result, trackNumber) {
  let cue = new VTTCue(result.time / 1000, (result.time + result.duration) / 1000, ""),
    text = result.text;
  if (tracks[trackNumber].label == "ass") {
    // Support for special characters in WebVTT.
    // For obvious reasons, the ampersand one *must* be first.
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let style, tagsToClose = []; // Places to stash style info.
    // Subtitles may contain any number of override tags, so we'll loop through
    // to find them all.
    while ((style = text.match(re_style))) {
      let tagsToOpen = [], replaceString = '';
      if (style[1] && style[1].split) { // Stop throwing errors on empty tags.
        style = style[1].split("\\"); // Get an array of override commands.
        for (let j = 1; j < style.length; j++) {
          // Extract the current tag name.
          let tagCommand = style[j].match(/[a-zA-Z]+/)[0];
          // Give special reckognition to one-letter tags.
          let oneLetter = (tagCommand.length == 1) ? tagCommand : "";
          // "New" position commands. It is assumed that bottom center position is the default.
          if (tagCommand === "an") {
            let posNum = Number(style[j].substring(2, 3));
            if (Math.floor((posNum - 1) / 3) == 1) {
              cue.line = 0.5;
            } else if (Math.floor((posNum - 1) / 3) == 2) {
              cue.line = 0;
              cue.text = "&nbsp;\r\n"
            }
            if (posNum % 3 == 1) {
              cue.align = "start";
            } else if (posNum % 3 == 0) {
              cue.align = "end";
            }
            // Legacy position commands.
          } else if (oneLetter === "a" && !Number.isNaN(Number(style[j].substring(1, 2)))) {
            let posNum = Number(style[j].substring(1, 2));
            if (posNum > 8) {
              cue.line = 0.5;
            } else if (posNum > 4) {
              cue.line = 0;
              cue.text = "&nbsp;\r\n"
            }
            if ((posNum - 1) % 4 == 0) {
              cue.align = "start";
            } else if ((posNum - 1) % 4 == 2) {
              cue.align = "end";
            }
            // Map simple text decoration commands to equivalent WebVTT text tags.
            // NOTE: Strikethrough (the 's' tag) is not supported in WebVTT.
          } else if (['b', 'i', 'u', 's'].includes(oneLetter)) {
            if (Number(style[j].substring(1, 2)) === 0
              // The more elaborate 'b-tag', which we will treat as an on-off selector.
              || (style[j].match(/b\d{3}/)
                && Number(style[j].match(/b(\d{3})/)[1]) < 500)
            ) {
              // Closing a tag.
              if (tagsToClose.includes(oneLetter)) {
                // Nothing needs to be done if this tag isn't already open.
                // HTML tags must be nested, so we must ensure that any tag nested inside
                // the tag being closed are also closed, and then opened again once the
                // current tag is closed.
                while (tagsToClose.length > 0) {
                  let nowClosing = tagsToClose.pop();
                  replaceString += '</' + nowClosing + '>';
                  if (nowClosing !== oneLetter) {
                    tagsToOpen.push(nowClosing);
                  } else {
                    // There's no need to close the tags that the current tag
                    // is nested within.
                    break;
                  }
                }
              }
            } else {
              // Opening a tag.
              if (!tagsToClose.includes(oneLetter)) {
                // Nothing needs to be done if the tag is already open.
                // If no, place the tag on the bottom of the stack of tags being opened.
                tagsToOpen.splice(0, 0, oneLetter);
              }
            }
          } else if (oneLetter === 'r') {
            // Resetting override tags, by closing all open tags.
            // TODO: The 'r' tag can also be used to switch to a different named style,
            // however, named styles haven't been implemented.
            while (tagsToClose.length > 0) {
              replaceString += '</' + tagsToClose.pop() + '>';
            }
          }
          // Insert open-tags for tags in the to-open list.
          while (tagsToOpen.length > 0) {
            let nowOpening = tagsToOpen.pop();
            replaceString += '<' + nowOpening + '>';
            tagsToClose.push(nowOpening);
          }
        }
      }
      text = text.replace(re_style, replaceString); // Replace override tag.
    }
    text = text.replace(re_newline, "\r\n").replace(re_softbreak, " ").replace(
      re_hardspace, "&nbsp;");
    let content = "<v " + result.style + ">" + text
    while (tagsToClose.length > 0) {
      content += '</' + tagsToClose.pop() + '>';
    }
    cue.text += `${content}\r\n&nbsp;`
  } else {
    cue.text = `${text}\r\n&nbsp;`
  }
  if (!Object.values(tracks[trackNumber].cues).some(c => c.text == cue.text)) {
    tracks[trackNumber].addCue(cue)
  }
}