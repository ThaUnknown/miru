<script context="module">
  const searchParams = new URLSearchParams(location.href)
  if (searchParams.get('access_token')) {
    localStorage.setItem('ALtoken', searchParams.get('access_token'))
  }
  export const alToken = localStorage.getItem('ALtoken') || null
  const defaults = {
    playerAutoplay: true,
    playerPause: true,
    playerAutocomplete: true,
    rssQuality: '1080',
    rssFeed: 'SubsPlease',
    rssAutoplay: true,
    rssTrusted: true,
    rssBatch: false,
    torrentSpeed: 10,
    torrentPersist: false,
    torrentDHT: false,
    torrentPeX: false
  }
  export let set = JSON.parse(localStorage.getItem('settings')) || { ...defaults }
  function removeRelations() {
    localStorage.removeItem('relations')
  }
</script>

<script>
  const { dialog } = require('@electron/remote')
  import { Tabs, TabLabel, Tab } from '../Tabination.js'

  const groups = {
    player: {
      name: 'Player',
      icon: 'play_arrow',
      desc: 'Player configuration, playback behavior, and other.'
    },
    rss: {
      name: 'RSS',
      icon: 'rss_feed',
      desc: 'RSS configuration, URLs, quality, and options.'
    },
    torrent: {
      name: 'Torrent',
      icon: 'hub',
      desc: 'Torrent client settings, and preferences.'
    }
  }
  let settings = set
  $: saveSettings(settings)
  function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings))
  }
  function restoreSettings() {
    localStorage.removeItem('settings')
    settings = { ...defaults }
  }
  async function handleFolder() {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (filePaths.length) {
      let path = filePaths[0]
      if (!(path.endsWith('\\') || path.endsWith('/'))) {
        if (path.indexOf('\\') !== -1) {
          path += '\\'
        } else if (path.indexOf('/') !== -1) {
          path += '/'
        }
      }
      settings.torrentPath = path
    }
  }
</script>

<Tabs>
  <div class="d-flex w-full h-full">
    <div class="d-flex flex-column h-full w-300 bg-dark">
      <div class="px-20 py-15 font-size-20 font-weight-semi-bold border-bottom root">Settings</div>
      {#each Object.values(groups) as group}
        <TabLabel>
          <div class="px-20 py-15 d-flex root">
            <span class="material-icons font-size-24 pr-10">{group.icon}</span>
            <div>
              <div class="font-weight-bold font-size-16">{group.name}</div>
              <div class="font-size-12">{group.desc}</div>
            </div>
          </div>
        </TabLabel>
      {/each}
      <p class="text-muted px-20 py-10 m-0 mt-auto">Restart may be required for some settings to take effect.</p>
      <p class="text-muted px-20 m-0">If you don't know what shit does, use default settings.</p>
      <button
        on:click={restoreSettings}
        class="btn btn-danger mx-20 my-10"
        type="button"
        id="setRes"
        data-toggle="tooltip"
        data-placement="top"
        data-title="Restores All Settings Back To Their Recommended Defaults">
        Restore Defaults
      </button>
      <button
        class="btn btn-danger mx-20 mb-20"
        type="button"
        id="clearRelCache"
        data-toggle="tooltip"
        data-placement="top"
        data-title="Clears Anime Names Data Cache"
        on:click={removeRelations}>
        Clear Name Cache
      </button>
    </div>
    <div class="h-full p-20 m-20">
      <Tab>
        <div class="root">
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Automatically Starts Playing Next Episode When A Video Ends">
            <input type="checkbox" id="player-autoplay" bind:checked={settings.playerAutoplay} />
            <label for="player-autoplay">Autoplay Next Episode</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Pauses/Resumes Video Playback When Tabbing In/Out Of The App">
            <input type="checkbox" id="player-pause" bind:checked={settings.playerPause} />
            <label for="player-pause">Pause When Tabbing Out</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Automatically Marks Episodes As Complete On AniList When You Finish Watching Them, Requires AniList Login">
            <input type="checkbox" id="player-autocomplete" bind:checked={settings.playerAutocomplete} />
            <label for="player-autocomplete">Autocomplete Episodes</label>
          </div>
        </div>
      </Tab>
      <Tab>
        <div class="root">
          <div
            class="input-group mb-10 w-600 form-control-lg"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="What RSS Feed To Fetch Releases From, Allows For Custom CORS Enabled Feeds">
            <div class="input-group-prepend">
              <span class="input-group-text w-100 justify-content-center">Feed</span>
            </div>
            <input id="rss-feed" type="text" list="rss-feed-list" class="form-control form-control-lg" autocomplete="off" bind:value={settings.rssFeed} />
            <datalist id="rss-feed-list">
              <option value="SubsPlease">https://nyaa.si/?page=rss&c=0_0&f=0&u=subsplease&q=</option>
              <option value="Erai-raws">https://nyaa.si/?page=rss&c=0_0&f=0&u=Erai-raws&q=</option>
            </datalist>
          </div>
          <div class="input-group mb-10 w-300 form-control-lg" data-toggle="tooltip" data-placement="top" data-title="What Quality To Find Torrents In">
            <div class="input-group-prepend">
              <span class="input-group-text w-100 justify-content-center">Quality</span>
            </div>
            <select class="form-control form-control-lg" bind:value={settings.rssQuality}>
              <option value="1080" selected>1080p</option>
              <option value="720">720p</option>
              <option value="480||540">SD</option>
              <option value="">None</option>
            </select>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Skips The Torrent Selection Popup, Might Lead To Unwanted Videos Being
        Played">
            <input type="checkbox" id="rss-autoplay" bind:checked={settings.rssAutoplay} />
            <label for="rss-autoplay">Auto-Play Torrents</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Finds Only Trusted Torrents, Gives Less Results But Higher Quality And With More Seeders">
            <input type="checkbox" id="rss-trusted" bind:checked={settings.rssTrusted} />
            <label for="rss-trusted">Trusted Only</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Tries To Find Batches For Finished Shows Instead Of Downloading 1 Episode At A Time">
            <input type="checkbox" id="rss-batch" bind:checked={settings.rssBatch} />
            <label for="rss-batch">Batch Lookup</label>
          </div>
        </div>
      </Tab>
      <Tab>
        <div class="root">
          <div
            class="input-group input-group-lg form-control-lg mb-10 w-500"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Path To Folder Which To Use To Store Torrent Files">
            <div class="input-group-prepend">
              <button type="button" on:click={handleFolder} class="btn btn-primary input-group-append">Select Folder</button>
            </div>
            <input type="text" class="form-control" bind:value={settings.torrentPath} placeholder="Folder Path" />
          </div>
          <div
            class="input-group w-300 form-control-lg mb-10"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Download/Upload Speed Limit For Torrents, Higher Values Increase CPU Usage">
            <div class="input-group-prepend">
              <span class="input-group-text w-150 justify-content-center">Max Speed</span>
            </div>
            <input type="number" bind:value={settings.torrentSpeed} min="0" max="50" class="form-control text-right form-control-lg" />
            <div class="input-group-append">
              <span class="input-group-text">MB/s</span>
            </div>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Doesn't Delete Files Of Old Torrents When A New Torrent Is Played">
            <input type="checkbox" id="rss-batch" bind:checked={settings.torrentPersist} />
            <label for="rss-batch">Persist Files</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Disables Distributed Hash Tables For Use In Private Trackers To Improve Piracy">
            <input type="checkbox" id="rss-batch" bind:checked={settings.torrentDHT} />
            <label for="rss-batch">Disable DHT</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="bottom"
            data-title="Disables Peer Exchange For Use In Private Trackers To Improve Piracy">
            <input type="checkbox" id="rss-batch" bind:checked={settings.torrentPeX} />
            <label for="rss-batch">Disable PeX</label>
          </div>
        </div>
      </Tab>
    </div>
  </div></Tabs>

<style>
  .root {
    animation: 0.3s ease 0s 1 load-in;
  }
  @keyframes load-in {
    from {
      bottom: -1.2rem;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      transform: scale(1);
    }
  }
</style>
