const WebTorrent = require('webtorrent')
export const client = new WebTorrent()
window.client = client
// save loaded torrent for persistence

export function add (torrentID) {
  if (torrentID) {
    if (client.torrents.length) client.remove(client.torrents[0].infoHash)
    client.add(torrentID, {
      path: 'E:\\videos\\testing\\',
      // destroyStoreOnDestroy: true,
      announce: [
        'wss://tracker.openwebtorrent.com',
        'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
        'wss://peertube.cpy.re:443/tracker/socket'
      ]
    })
  }
}

client.on('torrent', torrent => {
  console.log('ready', torrent.name)
  const string = JSON.stringify(Array.from(torrent.torrentFile))
  localStorage.setItem('torrent', string)
})

// load last used torrent
if (localStorage.getItem('torrent')) {
  const buffer = Buffer.from(JSON.parse(localStorage.getItem('torrent')))
  add(buffer)
}
