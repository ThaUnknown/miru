## **Won't this kill swarm health?**
Depends. On average no. The app is always seeding 1 torrent as long as it's open. Additionally the upload speed is forced to be x1.5 that of the download speed. Those 2 things combined will already make this app seed more than the average leecher which removes the torrent the moment it's downloaded.

## **Can I close the miniplayer?**
No. See above. The miniplayer provides feedback that something is happening in the background. Closing it would make the user feel like the app is lagging [because it's maxing out your internet in the background by torrenting] when nothing is happening.

## **Can I reduce the upload speed?**
No. See above. This app is also meant to seed the torrents the user downloads, if you want freeleech go to some private tracker.

## **Is this safe?**
I recommend you read the [guide about basics of piracy.](https://thewiki.moe/getting-started/torrenting/)

## **Will this replace streaming sites?**
Not really. The underlying source of video are still torrents, which aren't always seeded, so anime that's a few years old might not play back smoothly.

## **Can I log in with MAL?**
No. You can however migrate MAL to AL, see [this guide.](https://anilist.co/forum/thread/3393)

## **Why is anime X not playing?**
One of four reasons:
- the anime isn't seeded
- your download speed isn't fast enough
- your ISP blocks Nyaa, see [this tutorial](https://thewiki.moe/en/tutorials/unblock) for a fix
- the app couldn't find a matching torrent for the anime

## **I selected an episode to play, but Miru plays something else!**
Finding desired episodes can sometimes be difficult, if Miru auto-selects an episode incorrectly you can either disable auto-play torrents in settings to select torrents yourself during episode choosing, or manually find and paste in a .torrent file URL or a magnet URL into Miru to play a desired episode manually.

## **Will you make an android version?**
No. This app cannot be ported to android in any way.

## **Can I play my own torrents?**
Yes. For the home menu you can specify a different RSS feed to check when the app looks for new releases. Additionally you can just paste a torrent file/magnet link anywhere when using the app, and it will auto-detect what anime is playing.

## **Can I change what tracker torrents are found from?**
Not really. No other tracker has the kind of API/search functionality which is required, which Miru uses to the fullest extent to make sure it finds the torrents it's looking for without false-positives.

## **How is this different from sequential qBit?**
Unlike qBit's sequential, this will prioritise downloading torrent pieces directly needed for playback, which with the user seeking isn't always just sequential.

## **Why Electron?**
Electron has node.js integration, which can use TCP/UDP, that is the only reason. Browsers can't access TCP/UDP which means they can't access the global BT swarm.
> Can't you make this just use WebRTC?

Yes. A BitTorrent implementation which uses WebRTC exists, but it's not yet adopted by any clients, and libtorrent [the library which qBit and others use] is still working/just added support for WebRTC, which means there's no swarm. This will hopefully change in the future.

## **Miru crashed too many times.**
This is likely because Miru updated from a very old version to a very new one. Uninstall Miru, go to `%appdata%/miru` remove all files and re-install it. If this issue persists visit the Discord for help.
