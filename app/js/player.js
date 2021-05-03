const announceList = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.sloppyta.co:443/announce',
  'wss://hub.bugout.link:443/announce'
]
const playerControls = {}
for (const item of document.getElementsByClassName('ctrl')) {
  if (!playerControls[item.dataset.name]) {
    playerControls[item.dataset.name] = item
  } else {
    playerControls[item.dataset.name] = [playerControls[item.dataset.name], item]
  }
}
const client = new TorrentPlayer({
  WebTorrentOpts: {
    maxConns: settings.torrent6,
    downloadLimit: settings.torrent7 * 1048576,
    uploadLimit: settings.torrent7 * 1572864,
    tracker: {
      announce: announceList
    }
  },
  controls: playerControls,
  video: video,
  player: player,
  playerWrapper: pageWrapper,
  burnIn: settings.subtitle3,
  seekTime: Number(settings.player3),
  immerseTime: Number(settings.player2),
  visibilityLossPause: settings.player10,
  autoNext: settings.player6,
  streamedDownload: settings.torrent8,
  generateThumbnails: settings.player5,
  defaultSSAStyles: Object.values(subtitle1list.options).filter(item => item.value === settings.subtitle1)[0].textContent,
  resolveFileMedia: resolveFileMedia,
  onDownloadDone: (name) => {
    halfmoon.initStickyAlert({
      content: `<span class="text-break">${name}</span> has finished downloading. Now seeding.`,
      title: 'Download Complete',
      alertType: 'alert-success',
      fillType: ''
    })
  },
  onWatched: () => {
    if (client.nowPlaying?.media?.episodes || client.nowPlaying?.media?.nextAiringEpisode?.episode) {
      if (settings.other2 && (client.nowPlaying.media?.episodes || client.nowPlaying.media?.nextAiringEpisode?.episode > client.nowPlaying.episodeNumber)) {
        alEntry()
      } else {
        halfmoon.initStickyAlert({
          content: `Do You Want To Mark <br><b>${client.nowPlaying.mediaTitle}</b><br>Episode ${client.nowPlaying.episodeNumber} As Completed?<br>
                <button class="btn btn-sm btn-square btn-success mt-5" onclick="alEntry()" data-dismiss="alert" type="button" aria-label="Close">✓</button>
                <button class="btn btn-sm btn-square mt-5" data-dismiss="alert" type="button" aria-label="Close"><span aria-hidden="true">X</span></button>`,
          title: 'Episode Complete',
          timeShown: 180000
        })
      }
    }
  },
  onPlaylist: () => {
    window.location.hash = '#playlist'
  },
  onNext: () => {
    if (client.nowPlaying.media) {
      nyaaSearch(client.nowPlaying.media, client.nowPlaying.episodeNumber + 1)
    } else {
      halfmoon.initStickyAlert({
        content: 'Couldn\'t find anime name! Try specifying a torrent manually.',
        title: 'Search Failed',
        alertType: 'alert-danger',
        fillType: ''
      })
    }
  },
  onPrev: () => {
    if (client.nowPlaying.media) {
      nyaaSearch(client.nowPlaying.media, client.nowPlaying.episodeNumber - 1)
    } else {
      halfmoon.initStickyAlert({
        content: 'Couldn\'t find anime name! Try specifying a torrent manually.',
        title: 'Search Failed',
        alertType: 'alert-danger',
        fillType: ''
      })
    }
  },
  onOfflineTorrent: torrent => {
    resolveFileMedia({ fileName: torrent.name, method: 'SearchName' }).then(mediaInformation => {
      mediaInformation.onclick = () => client.addTorrent(torrent, { media: mediaInformation, episode: mediaInformation.episode })
      const template = cardCreator(mediaInformation)
      document.querySelector('.downloads').appendChild(template)
    })
  },
  onVideoFiles: async videoFiles => {
    document.querySelector('.playlist').textContent = ''
    const cards = []
    for (const file of videoFiles) {
      const mediaInformation = await resolveFileMedia({ fileName: file.name, method: 'SearchName' })
      mediaInformation.onclick = () => {
        client.cleanupVideo()
        client.buildVideo(torrent, {
          media: mediaInformation,
          episode: mediaInformation.parseObject.episode,
          file: file
        })
      }
      cards.push(cardCreator(mediaInformation))
    }
    document.querySelector('.playlist').append(...cards)
  },
  onWarn: (warn, torrent) => {
    switch (warn) {
      case 'no file':
        halfmoon.initStickyAlert({
          content: `Couldn't find video file for <span class="text-break">${torrent.infoHash}</span>!`,
          title: 'Search Failed',
          alertType: 'alert-danger',
          fillType: ''
        })
        break
      case 'no peers':
        if (torrent.progress !== 1) {
          halfmoon.initStickyAlert({
            content: `Couldn't find peers for <span class="text-break">${torrent.infoHash}</span>! Try a torrent with more seeders.`,
            title: 'Search Failed',
            alertType: 'alert-danger',
            fillType: ''
          })
        }
    }
  }
})

window.onbeforeunload = function () {
  return ''
}
if (searchParams.get('file')) client.addTorrent(searchParams.get('file'))

function t (a) {
  switch (a) {
    case 1:
      client.addTorrent('https://webtorrent.io/torrents/sintel.torrent')
      break
    case 2:
      client.addTorrent('https://webtorrent.io/torrents/tears-of-steel.torrent')
      break
    case 3:
      client.addTorrent('magnet:?xt=urn:btih:CE9156EB497762F8B7577B71C0647A4B0C3423E1&dn=Inception+%282010%29+720p+-+mkv+-+1.0GB+-+YIFY')
      break
  }
}
