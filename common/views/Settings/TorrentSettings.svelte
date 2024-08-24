<script context='module'>
  import * as comlink from 'comlink'
  import { settings as set } from '@/modules/settings.js'

  let worker = null

  /** @param {string[]} urls */
  export async function createWorker (urls) {
    if (worker) worker.terminate()

    worker = new Worker(new URL('@/modules/extensions/worker.js', import.meta.url), { type: 'module' })
    /** @type {comlink.Remote<import('@/modules/extensions/worker.js').loadExtensions>} */
    // @ts-expect-error NO clue why this errors
    const loadExtensions = await comlink.wrap(worker)

    const extensions = await loadExtensions(urls)

    const metadata = await extensions.metadata

    for (const { name } of metadata) {
      if (set.value.sources[name] == null) {
        set.value.sources[name] = true
      }
    }
    return extensions
  }

  /** @type {ReturnType<typeof createWorker>} */
  export let extensionsWorker = createWorker(set.value.extensions)
</script>

<script>
  import { click } from '@/modules/click.js'
  import { defaults } from '@/modules/util.js'
  import IPC from '@/modules/ipc.js'
  import SettingCard from './SettingCard.svelte'
  import { SUPPORTS } from '@/modules/support.js'
  import { Trash2 } from 'lucide-svelte'
  export let settings

  function handleFolder () {
    IPC.emit('dialog')
  }

  let extensionUrl = ''

  function addExtension () {
    if (!settings.extensions.includes(extensionUrl)) {
      settings.extensions.push(extensionUrl)
      extensionsWorker = createWorker(settings.extensions)
      settings.extensions = settings.extensions
    }
    extensionUrl = ''
  }

  function removeExtension (i) {
    settings.extensions.splice(i, 1)
    extensionsWorker = createWorker(settings.extensions)
    settings.extensions = settings.extensions
  }
</script>

<h4 class='mb-10 font-weight-bold'>Extension Settings</h4>
<SettingCard title='Extensions' description='List of URLs to load sources from. While the extensions are sandboxed and should be safe from attacks, it is not recommended to add unknown or untrusted extensions.'>
  <div>
    <div class='input-group w-400 mw-full'>
      <input placeholder='Enter extension URL or NPM name' type='url' class='form-control w-400 bg-dark mw-full' bind:value={extensionUrl} />
      <div class='input-group-append'>
        <button class='btn btn-primary' type='button' use:click={addExtension}>Add</button>
      </div>
    </div>
    <div class='w-full d-flex flex-column pt-10'>
      {#each settings.extensions as extension, i}
        <div class='btn-group mt-5 w-400 mw-full'>
          <div class='input-group-prepend overflow-hidden w-full'>
            <span class='input-group-text bg-dark w-full'>{extension}</span>
          </div>
          <button type='button' use:click={() => removeExtension(i)} class='btn btn-danger btn-square input-group-append px-5 d-flex align-items-center'><Trash2 size='1.8rem' /></button>
        </div>
      {/each}
    </div>
  </div>
</SettingCard>
<SettingCard title='Sources' description='List of sources to discover torrents from.'>
  <div class='w-400 mw-full'>
    <div class='w-full d-flex flex-column mb-10'>
      {#key settings.extensions}
        {#await extensionsWorker then worker}
          {#await worker.metadata then metadata}
            {#each metadata as { accuracy, name, description }}
              <div class='card m-0 p-15 mt-10'>
                <div class='mr-10 mb-5 mb-md-0'>
                  <div class='font-size-16 font-weight-semi-bold mb-5'>{name}</div>
                  <div class='text-muted pre-wrap'>{description}</div>
                </div>
                <div class='d-flex justify-content-between align-items-end'>
                  <div>Accuracy: {accuracy}</div>
                  <div class='custom-switch mt-10'>
                    <input type='checkbox' id={`extension-${name}`} bind:checked={settings.sources[name]} />
                    <label for={`extension-${name}`}>{settings.sources[name] ? 'On' : 'Off'}</label>
                  </div>
                </div>
              </div>
            {/each}
          {/await}
        {/await}
      {/key}
    </div>
  </div>
</SettingCard>

<h4 class='mb-10 font-weight-bold'>Lookup Settings</h4>
<SettingCard title='Torrent API URL' description='URL of the API used to query data for torrents. Useful for proxies if your ISP blocks some domains. Needs to be CORS enabled.'>
  <input type='url' class='form-control bg-dark w-300 mw-full' bind:value={settings.toshoURL} placeholder={defaults.toshoURL} />
</SettingCard>
<SettingCard title='Torrent Quality' description="What quality to use when trying to find torrents. None might rarely find less results than specific qualities. This doesn't exclude other qualities from being found like 4K or weird DVD resolutions.">
  <select class='form-control bg-dark w-300 mw-full' bind:value={settings.rssQuality}>
    <option value='1080' selected>1080p</option>
    <option value='720'>720p</option>
    <option value='540'>540p</option>
    <option value='480'>480p</option>
    <option value="">Any</option>
  </select>
</SettingCard>
<SettingCard title='Auto-Select Torrents' description='Automatically selects torrents based on quality and amount of seeders. Disable this to have more precise control over played torrents.'>
  <div class='custom-switch'>
    <input type='checkbox' id='rss-autoplay' bind:checked={settings.rssAutoplay} />
    <label for='rss-autoplay'>{settings.rssAutoplay ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
{#if SUPPORTS.doh}
  <SettingCard title='Use DNS Over HTTPS' description='Enables DNS Over HTTPS, useful if your ISP blocks certain domains.'>
    <div class='custom-switch'>
      <input type='checkbox' id='rss-dohtoggle' bind:checked={settings.enableDoH} />
      <label for='rss-dohtoggle'>{settings.enableDoH ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
  <SettingCard title='DNS Over HTTPS URL' description='What URL to use for querying DNS Over HTTPS.'>
    <input type='url' class='form-control bg-dark w-300 mw-full' bind:value={settings.doHURL} placeholder={defaults.doHURL} />
  </SettingCard>
{/if}

<h4 class='mb-10 font-weight-bold'>Client Settings</h4>
<SettingCard title='Torrent Download Location' description='Path to the folder used to store torrents. By default this is the TMP folder, which might lose data when your OS tries to reclaim storage.  {SUPPORTS.isAndroid ? 'RESTART IS REQUIRED. /sdcard/ is internal storage, not external SD Cards. /storage/AB12-34CD/ is external storage, not internal. Thank you Android!' : ''}'>
  <div
    class='input-group w-300 mw-full'>
    <div class='input-group-prepend'>
      <button type='button' use:click={handleFolder} class='btn btn-primary input-group-append'>Select Folder</button>
    </div>
    {#if !SUPPORTS.isAndroid}
      <input type='url' class='form-control bg-dark' readonly bind:value={settings.torrentPathNew} placeholder='/tmp' />
    {:else}
      <input type='text' class='form-control bg-dark' bind:value={settings.torrentPathNew} placeholder='/tmp' />
    {/if}
  </div>
</SettingCard>
<SettingCard title='Persist Files' description="Keeps torrents files instead of deleting them after a new torrent is played. This doesn't seed the files, only keeps them on your drive. This will quickly fill up your storage.">
  <div class='custom-switch'>
    <input type='checkbox' id='torrent-persist' bind:checked={settings.torrentPersist} />
    <label for='torrent-persist'>{settings.torrentPersist ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='Streamed Download' description="Only downloads the single file that's currently being watched, instead of downloading an entire batch of episodes. Saves bandwidth and reduces strain on the peer swarm.">
  <div class='custom-switch'>
    <input type='checkbox' id='torrent-streamed-download' bind:checked={settings.torrentStreamedDownload} />
    <label for='torrent-streamed-download'>{settings.torrentStreamedDownload ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='Transfer Speed Limit' description='Download/Upload speed limit for torrents, higher values increase CPU usage, and values higher than your storage write speeds will quickly fill up RAM.'>
  <div class='input-group w-100 mw-full'>
    <input type='number' inputmode='numeric' pattern={'[0-9]*.?[0-9]*'} bind:value={settings.torrentSpeed} min='0' max='50' step='0.1' class='form-control text-right bg-dark' />
    <div class='input-group-append'>
      <span class='input-group-text bg-dark'>MB/s</span>
    </div>
  </div>
</SettingCard>
<SettingCard title='Max Number of Connections' description='Number of peers per torrent. Higher values will increase download speeds but might quickly fill up available ports if your ISP limits the maximum allowed number of open connections.'>
  <input type='number' inputmode='numeric' pattern='[0-9]*' bind:value={settings.maxConns} min='1' max='512' class='form-control text-right bg-dark w-100 mw-full' />
</SettingCard>
<SettingCard title='Torrent Port' description='Port used for Torrent connections. 0 is automatic.'>
  <input type='number' inputmode='numeric' pattern='[0-9]*' bind:value={settings.torrentPort} min='0' max='65536' class='form-control text-right bg-dark w-150 mw-full' />
</SettingCard>
<SettingCard title='DHT Port' description='Port used for DHT connections. 0 is automatic.'>
  <input type='number' inputmode='numeric' pattern='[0-9]*' bind:value={settings.dhtPort} min='0' max='65536' class='form-control text-right bg-dark w-150 mw-full' />
</SettingCard>
<SettingCard title='Disable DHT' description='Disables Distributed Hash Tables for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.'>
  <div class='custom-switch'>
    <input type='checkbox' id='torrent-dht' bind:checked={settings.torrentDHT} />
    <label for='torrent-dht'>{settings.torrentDHT ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='Disable PeX' description='Disables Peer Exchange for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.'>
  <div class='custom-switch'>
    <input type='checkbox' id='torrent-pex' bind:checked={settings.torrentPeX} />
    <label for='torrent-pex'>{settings.torrentPeX ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
