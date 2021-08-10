/* globals video, player, pageWrapper, subtitle1list */

import WebTorrentPlayer from 'webtorrent-player'
import { searchParams } from './util.js'
import { resolveFileMedia, nyaaSearch } from './anime.js'
import { alEntry } from './anilist.js'
import { settings } from './settings.js'
import { cardCreator, initMenu } from './interface.js'
import halfmoon from 'halfmoon'

const playerControls = {}
for (const item of document.getElementsByClassName('ctrl')) {
  if (!playerControls[item.dataset.name]) {
    playerControls[item.dataset.name] = item
  } else {
    playerControls[item.dataset.name] = [playerControls[item.dataset.name], item]
  }
}
export const client = new WebTorrentPlayer({
  WebTorrentOpts: {
    maxConns: 127,
    downloadLimit: settings.torrent7 * 1048576,
    uploadLimit: settings.torrent7 * 1572864,
    tracker: {
      announce: settings.torrent10.split('\n')
    }
  },
  controls: playerControls,
  video: video,
  player: player,
  destroyStore: true,
  playerWrapper: pageWrapper,
  burnIn: settings.subtitle3,
  seekTime: Number(settings.player3),
  immerseTime: Number(settings.player2),
  visibilityLossPause: settings.player10,
  autoNext: settings.player6,
  streamedDownload: settings.torrent8,
  generateThumbnails: settings.player5,
  defaultSSAStyles: Object.values(subtitle1list.options).filter(item => item.value === settings.subtitle1)[0].textContent,
  resolveFileMedia: resolveFileMedia
})
client.on('download-done', ({ file }) => {
  halfmoon.initStickyAlert({
    content: `<span class="text-break">${file.name}</span> has finished downloading. Now seeding.`,
    title: 'Download Complete',
    alertType: 'alert-success',
    fillType: ''
  })
})
client.on('watched', ({ filemedia }) => {
  if (filemedia?.media?.episodes || filemedia?.media?.nextAiringEpisode?.episode) {
    if (settings.other2 && (filemedia.media.episodes || filemedia.media.nextAiringEpisode?.episode > filemedia.episodeNumber)) {
      alEntry(filemedia)
    }
    //   halfmoon.initStickyAlert({
    //     content: `Do You Want To Mark <br><b>${filemedia.mediaTitle}</b><br>Episode ${filemedia.episodeNumber} As Completed?<br>
    //             <button class="btn btn-sm btn-square btn-success mt-5" onclick="alEntry()" data-dismiss="alert" type="button" aria-label="Close">✓</button>
    //             <button class="btn btn-sm btn-square mt-5" data-dismiss="alert" type="button" aria-label="Close"><span aria-hidden="true">X</span></button>`,
    //     title: 'Episode Complete',
    //     timeShown: 180000
    //   })
    // }
  }
})
client.on('playlist', () => {
  window.location.hash = '#playlist'
})
client.on('next', ({ filemedia }) => {
  if (filemedia.media) {
    nyaaSearch(filemedia.media, parseInt(filemedia.episodeNumber) + 1)
  } else {
    halfmoon.initStickyAlert({
      content: 'Couldn\'t find anime name! Try specifying a torrent manually.',
      title: 'Search Failed',
      alertType: 'alert-danger',
      fillType: ''
    })
  }
})
client.on('prev', ({ filemedia }) => {
  if (filemedia.media) {
    nyaaSearch(filemedia.media, filemedia.episodeNumber - 1)
  } else {
    halfmoon.initStickyAlert({
      content: 'Couldn\'t find anime name! Try specifying a torrent manually.',
      title: 'Search Failed',
      alertType: 'alert-danger',
      fillType: ''
    })
  }
})
client.on('offline-torrent', torrent => {
  resolveFileMedia({ fileName: torrent.name, method: 'SearchName' }).then(mediaInformation => {
    mediaInformation.onclick = () => client.playTorrent(torrent, { media: mediaInformation, episode: mediaInformation.episode })
    const template = cardCreator(mediaInformation)
    document.querySelector('.downloads').appendChild(template)
  })
})
client.on('video-files', async ({ files, torrent }) => {
  document.querySelector('.playlist').textContent = ''
  const cards = []
  for (const file of files) {
    const mediaInformation = await resolveFileMedia({ fileName: file.name, method: 'SearchName' })
    mediaInformation.onclick = () => {
      client.buildVideo(torrent, {
        media: mediaInformation,
        episode: mediaInformation.parseObject.episode,
        file: file
      })
    }
    cards.push(cardCreator(mediaInformation))
  }
  document.querySelector('.playlist').append(...cards)
})
client.on('no-files', torrent => {
  halfmoon.initStickyAlert({
    content: `Couldn't find video file for <span class="text-break">${torrent.infoHash}</span>!`,
    title: 'Search Failed',
    alertType: 'alert-danger',
    fillType: ''
  })
})
client.on('no peers', torrent => {
  if (torrent.progress !== 1) {
    halfmoon.initStickyAlert({
      content: `Couldn't find peers for <span class="text-break">${torrent.infoHash}</span>! Try a torrent with more seeders.`,
      title: 'Search Failed',
      alertType: 'alert-danger',
      fillType: ''
    })
  }
})
client.nowPlaying = { name: 'Miru' }

window.client = client

window.onbeforeunload = () => { return '' }

if (searchParams.get('file')) client.playTorrent(searchParams.get('file'))

queueMicrotask(initMenu)
