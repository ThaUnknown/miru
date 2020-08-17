var client = new WebTorrent()
let lastTorrent;

function playTorrent(magnetlink, hasName) {

    if (lastTorrent) {
        client.remove(magnetlink)
    }
    lastTorrent = magnetlink
    console.log(magnetlink)
    client.add(magnetlink, function (torrent) {
        console.log('Client is downloading:', torrent.infoHash)
        var file = torrent.files.find(function (file) {
            return file.name.endsWith('.mp4'||'.mkv')
        })
        file.renderTo('video', {
            autoplay: true,
            controls: false
        });
    })
}
client.on('error', function (err) {
    console.error('ERROR: ' + err.message)
})
//'magnet:?xt=urn:btih:W4YM35DEUBTUS6BY2YEBHD5KVWQANCOE&tr=http://nyaa.tracker.wf:7777/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechersparadise.org:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://open.stealth.si:80/announce&tr=udp://p4p.arenabg.com:1337/announce&tr=udp://mgtracker.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://peerfect.org:6969/announce&tr=http://share.camoe.cn:8080/announce&tr=http://t.nyaatracker.com:80/announce&tr=https://open.kickasstracker.com:443/announce&ix=0'
//'magnet:?xt=urn:btih:OWRWEI2ABTSOUYBG6MMBRPC3LT22HMGV&tr=http://nyaa.tracker.wf:7777/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechersparadise.org:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://open.stealth.si:80/announce&tr=udp://p4p.arenabg.com:1337/announce&tr=udp://mgtracker.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://peerfect.org:6969/announce&tr=http://share.camoe.cn:8080/announce&tr=http://t.nyaatracker.com:80/announce&tr=https://open.kickasstracker.com:443/announce'