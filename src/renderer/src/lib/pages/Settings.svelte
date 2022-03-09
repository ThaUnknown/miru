<script context="module">
  const searchParams = new URLSearchParams(location.href)
  if (searchParams.get('access_token')) {
    localStorage.setItem('ALtoken', searchParams.get('access_token'))
  }
  export const alToken = localStorage.getItem('ALtoken') || null
  export const settings = JSON.parse(localStorage.getItem('settings')) || {}
</script>

<script>
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
</script>

<Tabs>
  <div class="d-flex w-full h-full root">
    <div class="d-flex flex-column h-full w-300 bg-dark border-left">
      <div class="px-20 py-15 font-size-20 font-weight-semi-bold border-bottom">Settings</div>
      {#each Object.values(groups) as group}
        <TabLabel>
          <div class="px-20 py-15 d-flex">
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
        class="btn btn-danger mx-20 my-10"
        type="button"
        id="setRes"
        data-toggle="tooltip"
        data-placement="top"
        data-title="Restores All Settings Back To Their Recommended Defaults">
        Restore Defaults
      </button>
      <button class="btn btn-danger mx-20 mb-20" type="button" id="clearRelCache" data-toggle="tooltip" data-placement="top" data-title="Clears Anime Names Data Cache">
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
            data-placement="top"
            data-title="What RSS Feed To Fetch Releases From, Allows For Custom CORS Enabled Feeds">
            <div class="input-group-prepend">
              <span class="input-group-text w-100 justify-content-center">Feed</span>
            </div>
            <input id="torrent4" type="text" list="torrent4list" class="form-control form-control-lg" autocomplete="off" value="SubsPlease" />
            <datalist id="torrent4list">
              <option value="SubsPlease">https://nyaa.si/?page=rss&c=0_0&f=0&u=subsplease&q=</option>
              <option value="Erai-raws">https://nyaa.si/?page=rss&c=0_0&f=0&u=Erai-raws&q=</option>
            </datalist>
          </div>
          <div class="input-group mb-10 w-300 form-control-lg" data-toggle="tooltip" data-placement="top" data-title="What Quality To Find Torrents In">
            <div class="input-group-prepend">
              <span class="input-group-text w-100 justify-content-center">Quality</span>
            </div>
            <select class="form-control form-control-lg" id="torrent1">
              <option value="1080" selected>1080p</option>
              <option value="720">720p</option>
              <option value="480||540">SD</option>
            </select>
          </div>
          <break />
          <div class="custom-switch mb-10 pl-10 font-size-16 w-300" data-toggle="tooltip" data-placement="top" data-title="Sends A Notification When A New Episode Is Released">
            <input type="checkbox" id="other1" />
            <label for="other1">Release Notifications</label>
          </div>
          <div
            class="custom-swit`c`h mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="top"
            data-title="Skips The Torrent Selection Popup, Might Lead To Unwanted Videos Being
        Played">
            <input type="checkbox" id="torrent2" />
            <label for="torrent2">Auto-Play Torrents</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="top"
            data-title="Finds Only Trusted Torrents, Gives Less Results But Higher Quality And With More Seeders">
            <input type="checkbox" id="torrent3" checked />
            <label for="torrent3">Trusted Only</label>
          </div>
          <div
            class="custom-switch mb-10 pl-10 font-size-16 w-300"
            data-toggle="tooltip"
            data-placement="top"
            data-title="Tries To Find Batches For Finished Shows Instead Of Downloading 1 Episode At A Time">
            <input type="checkbox" id="torrent9" />
            <label for="torrent9">Batch Lookup</label>
          </div>
        </div>
      </Tab>
      <Tab>
        <div class="root">
          <div
            class="input-group w-300 mb-10 form-control-lg"
            data-toggle="tooltip"
            data-placement="top"
            data-title="Download/Upload Speed Limit For Torrents, Higher Values Increase CPU Usage">
            <div class="input-group-prepend">
              <span class="input-group-text w-150 justify-content-center">Max Speed</span>
            </div>
            <input id="torrent-speed" type="number" bind:value={settings.torrentSpeed} min="0" max="50" class="form-control text-right form-control-lg" />
            <div class="input-group-append">
              <span class="input-group-text">MB/s</span>
            </div>
          </div>
        </div>
      </Tab>
    </div>
  </div>
</Tabs>

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
