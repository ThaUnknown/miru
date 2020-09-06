function parseSubtitles(stream) {
  parser = new MatroskaSubtitles()
  parser.once('tracks', function (tracks) {
    console.log(tracks)
  })
  parser.on('subtitle', function (subtitle, trackNumber) {
    console.log('Track ' + trackNumber + ':', subtitle)
  })
  console.log(stream)
  stream.pipe(parser)
}