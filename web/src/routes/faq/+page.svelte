<div class='container font-size-18 pb-20'>
  <h1 class='text-white font-weight-bold'>Frequently Asked Questions</h1>

  <h3 class='text-white font-weight-bold'>Won't this kill swarm health?</h3>
  <p>Depends. On average no. The app is always seeding 1 torrent as long as it's open. Additionally the upload speed is forced to be x1.5 that of the download speed. Those 2 things combined will already make this app seed more than the average leecher which removes the torrent the moment it's downloaded.</p>

  <h3 class='text-white font-weight-bold'>Can I close the miniplayer?</h3>
  <p>No. See above. The miniplayer provides feedback that something is happening in the background. Closing it would make the user feel like the app is lagging [because it's maxing out your internet in the background by torrenting] when nothing is happening.</p>

  <h3 class='text-white font-weight-bold'>Can I reduce the upload speed?</h3>
  <p>No. See above. This app is also meant to seed the torrents the user downloads, if you want freeleech go to some private tracker.</p>

  <h3 class='text-white font-weight-bold'>Is this safe?</h3>
  <p>I recommend you read the <a href='https://thewiki.moe/getting-started/torrenting/' target='_blank'>guide about basics of piracy</a>.</p>

  <h3 class='text-white font-weight-bold'>Will this replace streaming sites?</h3>
  <p>Not really. The underlying source of video are still torrents, which aren't always seeded, so anime that's a few years old might not play back smoothly.</p>

  <h3 class='text-white font-weight-bold'>Can I log in with MAL?</h3>
  <p>No. You can however migrate MAL to AL, <a href='https://anilist.co/forum/thread/3393' target='_blank'>see this guide</a>.</p>

  <h3 class='text-white font-weight-bold'>Why is anime X not playing?</h3>
  <p>One of four reasons:</p>
  <ul>
    <li>the anime isn't seeded</li>
    <li>your download speed isn't fast enough</li>
    <li>your ISP blocks Torrenting, see <a href='https://thewiki.moe/en/tutorials/unblock' target='_blank'>this tutorial</a> for a potential fix, or simply use a VPN</li>
    <li>the app couldn't find a matching torrent for the anime</li>
  </ul>

  <h3 class='text-white font-weight-bold'>I selected an episode to play, but Miru plays something else!</h3>
  <p>Finding desired episodes can sometimes be difficult, if Miru auto-selects an episode incorrectly you can either disable auto-play torrents in settings to select torrents yourself during episode choosing, or manually find and paste in a .torrent file URL or a magnet URL into Miru to play a desired episode manually.</p>

  <h3 class='text-white font-weight-bold'>Can I play my own torrents?</h3>
  <p>Yes. For the home menu you can specify a different RSS feed to check when the app looks for new releases. Additionally you can just paste/drag-drop a torrent file/magnet link anywhere when using the app, and it will try it's best to auto-detect what anime is playing.</p>

  <h3 class='text-white font-weight-bold'>Can I change what tracker torrents are found from?</h3>
  <p>Not really. No other tracker has the kind of API/search functionality which is required, which Miru uses to the fullest extent to make sure it finds the torrents it's looking for without false-positives.</p>

  <h3 class='text-white font-weight-bold'>How is this different from sequential qBit?</h3>
  <p>Unlike qBit's sequential, this will prioritise downloading torrent pieces directly needed for playback, which with the user seeking isn't always just sequential.</p>

  <h3 class='text-white font-weight-bold'>Why Electron?</h3>
  <p>Electron has node.js integration, which can use TCP/UDP, that is the only reason. Browsers can't access TCP/UDP which means they can't access the global BT swarm.</p>
  <p>&gt; Can't you make this just use WebRTC?</p>
  <p>Yes. A BitTorrent implementation which uses WebRTC exists, but it's not yet adopted by any clients, and libtorrent [the library which qBit and others use] is still working/just added support for WebRTC, which means there's no swarm. This will hopefully change in the future.</p>

  <h3 class='text-white font-weight-bold'>Miru crashed too many times.</h3>
  <p>This is likely because Miru updated from a very old version to a very new one. Uninstall Miru, go to <kbd>%appdata%/miru</kbd> remove all files and re-install it. If this issue persists visit the Discord for help.</p>
</div>

<style>
  .container {
    padding-top: 10rem;
  }
  a {
    --dm-link-text-color: #1890ff !important;
    --dm-link-text-color-hover: #45a3fb !important;
  }
</style>
