## **Won't this kill swarm health?**
Depends. On average no. The app is always seeding 1 torrent as long as it's open. Additionally the upload speed is forced to be x1.5 that of the download speed. Those 2 things combined will already make this app seed more than the average leecher which removes the torrent the moment it's downloaded.

## **Can I close the miniplayer?**
No. See above. The miniplayer provides feedback that something is happening in the background. Closing it would make the user feel like the app is lagging [because it's maxing out your internet in the background by torrenting] when nothing is happening.

## **Can I reduce the upload speed?**
No. See above. This app is also meant to seed the torrents the user downloads, if you want freeleech go to some private tracker.

## **Is this safe?**
I recommend you read the [guide about basics of piracy.](https://wiki.piracy.moe/guides/torrenting)

## **Will this replace streaming sites?**
Not really. The underlying source of video are still torrents, which aren't always seeded, so anime that's a few years old might not play back smoothly.

## **Why is anime X not playing?**
One of four reasons:
- the anime isn't seeded
- your download speed isn't fast enough
- your ISP blocks Nyaa, see [this tutorial](https://wiki.piracy.moe/en/tutorials/unblock) for a fix
- the app couldn't find a matching torrent for the anime
  - you can POTENTIALLY fix this by disabling `Trusted Only` in `RSS Settings`, but this might cause false-positives when finding torrents, so I'd also disable `Auto-play torrents`, and pick torrents manually.

## **Will you make an android version?**
No. This app cannot be ported to android in any way.

## **Can I play my own torrents?**
Yes. For the home menu you can specify a different RSS feed to check when the app looks for new releases. Additionally you can just paste a torrent file/magnet link anywhere when using the app, and it will auto-detect what anime is playing.

## **Can I change what tracker torrents are found from?**
Not really. No other tracker has the kind of API/search functionality that Nyaa does, which the app uses to the fullest extent to make sure it finds the torrents it's looking for without false-positives.

## **How is this different from sequential qBit?**
Unlike qBit's sequential, this will prioritise downloading torrent pieces directly needed for playback, which with the user seeking isn't always just sequential.

## **Why Electron?**
Electron has node.js integration, which can use TCP/UDP, that is the only reason. Browsers can't access TCP/UDP which means they can't access the global BT swarm.
> Can't you make this just use WebRTC?

Yes. A BitTorrent implementation which uses WebRTC exists, but it's not yet adopted by any clients, and libtorrent [the library which qBit and others use] is still working/just added support for WebRTC, which means there's no swarm. This will hopefully change in the future.

## **Where codec support?**
This uses the browser's built in video player, which uses a cut down version of FFMPEG, which lacks a support for a LOT of containers and codecs because of licensing. Since Electron is just Chromium IN THEORY it is possible to re-compile FFMPEG with support for more containers and codecs, but people seem to be going out of their way to make sure you can't find how to do that. PR pls?