parser.once('tracks', function (tracks) {
    console.log(tracks)
  })
  

  parser.on('subtitle', function (subtitle, trackNumber) {
    console.log('Track ' + trackNumber + ':', subtitle)
  })