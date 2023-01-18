<script context='module'>
  import { addToast } from './Toasts.svelte'
  export let alToken = localStorage.getItem('ALtoken') || null
  const defaults = {
    playerAutoplay: true,
    playerPause: true,
    playerAutocomplete: true,
    rssQuality: '1080',
    rssFeeds: [['New Releases', 'SubsPlease']],
    rssAutoplay: true,
    torrentSpeed: 10,
    torrentPersist: false,
    torrentDHT: false,
    torrentPeX: false,
    missingFont: true,
    maxConns: 20
  }
  localStorage.removeItem('relations') // TODO: remove
  export const set = { ...defaults, ...(JSON.parse(localStorage.getItem('settings')) || {}) }
  if (!set.rssFeeds) { // TODO: remove ;-;
    if (set.rssFeed) {
      set.rssFeeds = [['New Releases', set.rssFeed]]
    } else {
      set.rssFeeds = [['New Releases', 'SubsPlease']]
    }
  }
  window.addEventListener('paste', ({ clipboardData }) => {
    if (clipboardData.items?.[0]) {
      if (clipboardData.items[0].type === 'text/plain' && clipboardData.items[0].kind === 'string') {
        clipboardData.items[0].getAsString(text => {
          let token = text.split('access_token=')?.[1]?.split('&token_type')?.[0]
          if (token) {
            if (token.endsWith('/')) token = token.slice(0, -1)
            handleToken(token)
          }
        })
      }
    }
  })
  window.IPC.on('altoken', handleToken)
  function handleToken (data) {
    localStorage.setItem('ALtoken', data)
    alToken = data
    location.reload()
  }
  export const platformMap = {
    aix: 'Aix',
    darwin: 'MacOS',
    freebsd: 'Linux',
    linux: 'Linux',
    openbsd: 'Linux',
    sunos: 'SunOS',
    win32: 'Windows'
  }
  let version = '1.0.0'
  window.IPC.on('version', data => (version = data))
  window.IPC.emit('version')

  let wasUpdated = false
  window.IPC.on('update', () => {
    if (!wasUpdated) {
      wasUpdated = true
      addToast({
        title: 'Auto Updater',
        text: 'A new version of Miru is available. Downloading!'
      })
    }
  })
  function checkUpdate () {
    window.IPC.emit('update')
  }
  setInterval(checkUpdate, 1200000)
</script>

<script>
  import { Tabs, TabLabel, Tab } from './Tabination.js'
  import FontSelect from './FontSelect.svelte'
  import { onDestroy } from 'svelte'

  onDestroy(() => {
    window.IPC.off('path')
  })

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
  function saveSettings () {
    localStorage.setItem('settings', JSON.stringify(settings))
  }
  function restoreSettings () {
    localStorage.removeItem('settings')
    settings = { ...defaults }
  }
  function handleFolder () {
    window.IPC.emit('dialog')
  }
  window.IPC.on('path', data => {
    settings.torrentPath = data
  })
  async function changeFont ({ detail }) {
    try {
      const blob = await detail.blob()
      const data = await blob.arrayBuffer()
      settings.font = {
        name: detail.fullName,
        value: detail.postscriptName,
        data: [...new Uint8Array(data)]
      }
    } catch (error) {
      console.warn(error)
      addToast({
        text: /* html */`${error.message}<br>Try using a different font.`,
        title: 'File Error',
        type: 'secondary',
        duration: 8000
      })
    }
  }
</script>

<Tabs>
  <div class='d-flex w-full h-full'>
    <div class='d-flex flex-column h-full w-300 bg-dark'>
      <div class='px-20 py-15 font-size-20 font-weight-semi-bold border-bottom root'>Settings</div>
      {#each Object.values(groups) as group}
        <TabLabel>
          <div class='px-20 py-15 d-flex root'>
            <span class='material-icons font-size-24 pr-10'>{group.icon}</span>
            <div>
              <div class='font-weight-bold font-size-16'>{group.name}</div>
              <div class='font-size-12'>{group.desc}</div>
            </div>
          </div>
        </TabLabel>
      {/each}
      <button
        on:click={() => window.IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/')}
        class='btn btn-primary mx-20 mt-auto'
        type='button'
        data-toggle='tooltip'
        data-placement='top'
        data-title='Opens The Donate Site'>
        Donate
      </button>
      <button
        on:click={checkUpdate}
        class='btn btn-primary mx-20 mt-10'
        type='button'
        data-toggle='tooltip'
        data-placement='top'
        data-title='Checks For Available Updates And Notifies The User'>
        Check For Updates
      </button>
      <button
        on:click={restoreSettings}
        class='btn btn-danger mx-20 mt-10'
        type='button'
        data-toggle='tooltip'
        data-placement='top'
        data-title='Restores All Settings Back To Their Recommended Defaults'>
        Restore Defaults
      </button>
      <p class='text-muted px-20 py-10 m-0'>Restart may be required for some settings to take effect.</p>
      <p class='text-muted px-20 pb-10 m-0'>If you don't know what shit does, use default settings.</p>
      <p class='text-muted px-20 m-0 mb-20'>v{version} {platformMap[window.version.platform]} {window.version.arch}</p>
    </div>
    <div class='h-full p-20 m-20'>
      <Tab>
        <div class='root'>
          <div class='col p-10 d-flex flex-column justify-content-end'>
            <div class='pb-10 font-size-24 font-weight-semi-bold d-flex'>
              <div class='material-icons mr-10 font-size-30'>font_download</div>
              Default Subtitle Font
            </div>
            <FontSelect class='form-control bg-dark shadow-lg w-300' on:change={changeFont} value={settings.font?.value} />
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title="Automatically Finds Fonts That Are Missing From A Video's Subtitles">
            <input type='checkbox' id='player-missingFont' bind:checked={settings.missingFont} />
            <label for='player-missingFont'>Find Missing Fonts</label>
          </div>
          <div class='col p-10 d-flex flex-column justify-content-end'>
            <div class='font-size-24 font-weight-semi-bold d-flex'>
              <div class='material-icons mr-10 font-size-30'>play_arrow</div>
              Playback Settings
            </div>
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Automatically Starts Playing Next Episode When A Video Ends'>
            <input type='checkbox' id='player-autoplay' bind:checked={settings.playerAutoplay} />
            <label for='player-autoplay'>Autoplay Next Episode</label>
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Pauses/Resumes Video Playback When Tabbing In/Out Of The App'>
            <input type='checkbox' id='player-pause' bind:checked={settings.playerPause} />
            <label for='player-pause'>Pause When Tabbing Out</label>
          </div>
          <div class='col p-10 d-flex flex-column justify-content-end'>
            <div class='font-size-24 font-weight-semi-bold d-flex'>
              <div class='material-icons mr-10 font-size-30'>list</div>
              Anilist Settings
            </div>
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Automatically Marks Episodes As Complete On AniList When You Finish Watching Them, Requires AniList Login'>
            <input type='checkbox' id='player-autocomplete' bind:checked={settings.playerAutocomplete} />
            <label for='player-autocomplete'>Autocomplete Episodes</label>
          </div>
        </div>
      </Tab>
      <Tab>
        <div class='root'>
          {#each settings.rssFeeds as _, i}
            <div
              class='input-group mb-10 w-700 form-control-lg'
              data-toggle='tooltip'
              data-placement='bottom'
              data-title='What RSS Feed To Fetch Releases From, Allows For Custom CORS Enabled Feeds'>
              <div class='input-group-prepend'>
                <span class='input-group-text w-100 justify-content-center'>Feed</span>
              </div>
              <input type='text' class='form-control form-control-lg w-150 flex-reset' placeholder='New Releases' autocomplete='off' bind:value={settings.rssFeeds[i][0]} />
              <input id='rss-feed-{i}' type='text' list='rss-feed-list-{i}' class='w-400 form-control form-control-lg' placeholder='https://nyaa.si/?page=rss&c=0_0&f=0&q=' autocomplete='off' bind:value={settings.rssFeeds[i][1]} />
              <datalist id='rss-feed-list-{i}'>
                <option value='SubsPlease'>https://nyaa.si/?page=rss&c=0_0&f=0&u=subsplease&q=</option>
                <option value='NC-Raws'>https://nyaa.si/?page=rss&c=0_0&f=0&u=BraveSail&q=</option>
                <option value='Erai-raws [Multi-Sub]'>https://nyaa.si/?page=rss&c=0_0&f=0&u=Erai-raws&q=</option>
              </datalist>
              <div class='input-group-append'>
                <button type='button' on:click={() => { settings.rssFeeds.splice(i, 1); settings.rssFeeds = settings.rssFeeds }} class='btn btn-danger btn-lg input-group-append'>Remove</button>
              </div>
            </div>
          {/each}
          <div class='input-group input-group-lg form-control-lg mb-10 w-500'>
            <button type='button' on:click={() => { settings.rssFeeds[settings.rssFeeds.length] = ['New Releases', null] }} class='btn btn-lg btn-primary mb-10'>Add Feed</button>
          </div>
          <div class='input-group mb-10 w-300 form-control-lg' data-toggle='tooltip' data-placement='top' data-title='What Quality To Find Torrents In'>
            <div class='input-group-prepend'>
              <span class='input-group-text w-100 justify-content-center'>Quality</span>
            </div>
            <select class='form-control form-control-lg' bind:value={settings.rssQuality}>
              <option value='1080' selected>1080p</option>
              <option value='720'>720p</option>
              <option value='480||540'>SD</option>
              <option value="">None</option>
            </select>
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Skips The Torrent Selection Popup, Might Lead To Unwanted Videos Being
              Played'>
            <input type='checkbox' id='rss-autoplay' bind:checked={settings.rssAutoplay} />
            <label for='rss-autoplay'>Auto-Play Torrents</label>
          </div>
        </div>
      </Tab>
      <Tab>
        <div class='root'>
          <div
            class='input-group input-group-lg form-control-lg mb-10 w-500'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Path To Folder Which To Use To Store Torrent Files'>
            <div class='input-group-prepend'>
              <button type='button' on:click={handleFolder} class='btn btn-primary input-group-append'>Select Folder</button>
            </div>
            <input type='text' class='form-control' bind:value={settings.torrentPath} placeholder='Folder Path' />
          </div>
          <div
            class='input-group w-300 form-control-lg mb-10'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Download/Upload Speed Limit For Torrents, Higher Values Increase CPU Usage'>
            <div class='input-group-prepend'>
              <span class='input-group-text w-150 justify-content-center'>Max Speed</span>
            </div>
            <input type='number' bind:value={settings.torrentSpeed} min='0' max='50' class='form-control text-right form-control-lg' />
            <div class='input-group-append'>
              <span class='input-group-text'>MB/s</span>
            </div>
          </div>
          <div
            class='input-group w-300 form-control-lg mb-10'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Max Amount Of Connections Per Torrent'>
            <div class='input-group-prepend'>
              <span class='input-group-text w-200 justify-content-center'>Max Connections</span>
            </div>
            <input type='number' bind:value={settings.maxConns} min='1' max='512' class='form-control text-right form-control-lg' />
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title="Doesn't Delete Files Of Old Torrents When A New Torrent Is Played">
            <input type='checkbox' id='torrent-persist' bind:checked={settings.torrentPersist} />
            <label for='torrent-persist'>Persist Files</label>
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Disables Distributed Hash Tables For Use In Private Trackers To Improve Piracy'>
            <input type='checkbox' id='torrent-dht' bind:checked={settings.torrentDHT} />
            <label for='torrent-dht'>Disable DHT</label>
          </div>
          <div
            class='custom-switch mb-10 pl-10 font-size-16 w-300'
            data-toggle='tooltip'
            data-placement='bottom'
            data-title='Disables Peer Exchange For Use In Private Trackers To Improve Piracy'>
            <input type='checkbox' id='torrent-pex' bind:checked={settings.torrentPeX} />
            <label for='torrent-pex'>Disable PeX</label>
          </div>
        </div>
      </Tab>
    </div>
  </div>
</Tabs>

<style>
  select.form-control:invalid {
    color: var(--dm-input-placeholder-text-color);
  }
</style>
