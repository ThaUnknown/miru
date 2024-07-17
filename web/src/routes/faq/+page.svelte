<div class='container font-size-18 pb-20'>
  <div class='content'>
    <div class='h-vh-half row px-20 px-sm-0 d-flex justify-content-center flex-column'>
      <h1 class='font-weight-bold text-white title'>Frequently Asked Questions</h1>
      <div class='font-size-18 text-muted'>Most commonly asked questions about Miru and its usage.</div>
    </div>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>What extensions are there? How to make extensions?</h3>
    <p>You can find all information regarding extensions on the <a href='../extensions/' target='_blank'>extensions</a> page.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Can I close the miniplayer?</h3>
    <p>No. See above. The miniplayer provides feedback that something is happening in the background. Closing it would make the user feel like the app is lagging [because it's maxing out your internet in the background by torrenting] when nothing is happening.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Can I reduce the upload speed?</h3>
    <p>No. See above. This app is also meant to seed the torrents the user downloads, if you want freeleech go to some private tracker.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Does Miru stream the video or does it store it?</h3>
    <p>Miru only stores 1 torrent on your drive, unless <kbd>Persist Files</kbd> is enabled in settings. It doesn't stream the content as it also needs to seed the data it downloads to keep the swarm alive. It's important to note that it stores 1 torrent, not 1 video. A single torrent can sometimes consist of many video files, and as such take up a lot of space.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>I have an existing media library, can Miru import it?</h3>
    <p>No. Miru does not scan libraries like Plex or Jellyfin. You can however specify Miru's <kbd>Torrent Download Location</kbd> in settings, and if you pick torrents which are already in the selected folder, Miru will use them without re-download them. Make sure that <kbd>Persis Files</kbd> is enabled, or Miru will delete content that was already watched.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Is this safe?</h3>
    <p>It's recommended that you read the <a href='https://thewiki.moe/getting-started/torrenting/' target='_blank'>guide about basics of torrenting</a>.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Will this replace streaming sites?</h3>
    <p>Not really. The underlying source of video are still torrents, which aren't always seeded, so anime that's a few years old might not play back smoothly.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Can I log in with MAL?</h3>
    <p>No. You can however migrate MAL to AL, <a href='https://anilist.co/forum/thread/3393' target='_blank'>see this guide</a>.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Why is anime X not playing?</h3>
    <p>One of four reasons:</p>
    <ul>
      <li>the anime isn't seeded</li>
      <li>your download speed isn't fast enough</li>
      <li>your ISP blocks Torrenting, see <a href='https://thewiki.moe/tutorials/unblock/' target='_blank'>this tutorial</a> for a potential fix, or simply use a VPN</li>
      <li>the app couldn't find a matching torrent for the anime</li>
    </ul>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>I selected an episode to play, but Miru plays something else!</h3>
    <p>Finding desired episodes can sometimes be difficult, if Miru auto-selects an episode incorrectly you can either disable auto-play torrents in settings to select torrents yourself during episode choosing, or manually find and paste in a .torrent file URL or a magnet URL into Miru to play a desired episode manually.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Can I play my own torrents?</h3>
    <p>Yes. For the home menu you can specify a different RSS feed to check when the app looks for new releases. Additionally you can just paste/drag-drop a torrent file/magnet link anywhere when using the app, and it will try it's best to auto-detect what anime is playing.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Can I change what tracker torrents are found from?</h3>
    <p>Yes. If you find other community made extensions, you can import them in the app settings, however there is no curated list of community made extensions.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>How is this different from sequential qBit?</h3>
    <p>Unlike qBit's sequential, this will prioritise downloading torrent pieces directly needed for playback, which with the user seeking isn't always just sequential.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Won't this kill swarm health?</h3>
    <p>Depends. On average no. The app is always seeding 1 torrent as long as it's open. Additionally the upload speed is forced to be x1.5 that of the download speed. Those 2 things combined will already make this app seed more than the average leecher which removes the torrent the moment it's downloaded.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Why is it a native app, not a website?</h3>
    <p>The BitTorrent protocol requires TCP/UDP to function, that is the only reason. Browsers can't access TCP/UDP which means they can't access the global BitTorrent swarm.</p>
    <h5 class='text-white font-weight-bold'>&gt; Can't you make this just use WebRTC?</h5>
    <p>Yes. A BitTorrent implementation which uses WebRTC exists, but it's not yet adopted by any clients, and libtorrent [the library which qBit and others use] is still working on/just added support for WebRTC, which means there's no global swarm. This will hopefully change in the future.</p>
    <hr class='my-20' />
    <h3 class='text-white font-weight-bold'>Miru crashed too many times.</h3>
    <p>This is likely because Miru updated from a very old version to a very new one. Uninstall Miru, go to <kbd>%appdata%/miru</kbd> remove all files and re-install it. If this issue persists visit the Discord for help.</p>
  </div>
</div>

<style>
  a {
    --dm-link-text-color: #1890ff !important;
    --dm-link-text-color-hover: #45a3fb !important;
  }
  h3 {
    margin-top: 0;
    padding-top: 0.75em;
  }
  p {
    margin-bottom: 0;
    padding-bottom: 1em;
  }
  .title {
    font-size: 5rem
  }
</style>
