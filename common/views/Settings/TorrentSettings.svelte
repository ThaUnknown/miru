<script>
  import { click } from '@/modules/click.js'
  import { defaults } from '@/modules/util.js'
  import IPC from '@/modules/ipc.js'
  import SettingCard from './SettingCard.svelte'
  import { SUPPORTS } from '@/modules/support.js'
  export let settings

  function handleFolder () {
    IPC.emit('dialog')
  }
</script>

<h4 class='mb-10 font-weight-bold'>Lookup Settings</h4>
<SettingCard title='Torrent Quality' description="What quality to use when trying to find torrents. None might rarely find less results than specific qualities. This doesn't exclude other qualities from being found like 4K or weird DVD resolutions.">
  <select class='form-control bg-dark w-300 mw-full' bind:value={settings.rssQuality}>
    <option value='1080' selected>1080p</option>
    <option value='720'>720p</option>
    <option value='540'>540p</option>
    <option value='480'>480p</option>
    <option value="">None</option>
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
<SettingCard title='Torrent API URL' description='URL of the API used to query data for torrents. Useful for proxies if your ISP blocks some domains. Needs to be CORS enabled.'>
  <input type='url' class='form-control bg-dark w-300 mw-full' bind:value={settings.toshoURL} placeholder={defaults.toshoURL} />
</SettingCard>

<h4 class='mb-10 font-weight-bold'>Client Settings</h4>
{#if SUPPORTS.torrentPath}
  <SettingCard title='Torrent Download Location' description='Path to the folder used to store torrents. By default this is the TMP folder, which might loose data when your OS tries to reclaim storage.'>
    <div
      class='input-group w-300 mw-full'>
      <div class='input-group-prepend'>
        <button type='button' use:click={handleFolder} class='btn btn-primary input-group-append'>Select Folder</button>
      </div>
      <input type='url' class='form-control bg-dark' bind:value={settings.torrentPath} placeholder='/tmp' />
    </div>
  </SettingCard>
{/if}
{#if SUPPORTS.torrentPersist}
  <SettingCard title='Persist Files' description="Keeps torrents files instead of deleting them after a new torrent is played. This doesn't seed the files, only keeps them on your drive. This will quickly fill up your storage.">
    <div class='custom-switch'>
      <input type='checkbox' id='torrent-persist' bind:checked={settings.torrentPersist} />
      <label for='torrent-persist'>{settings.torrentPersist ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
{/if}
<SettingCard title='Transfer Speed Limit' description='Download/Upload speed limit for torrents, higher values increase CPU usage, and values higher than your storage write speeds will quickly fill up RAM.'>
  <div class='input-group w-100 mw-full'>
    <input type='number' bind:value={settings.torrentSpeed} min='0' max='50' class='form-control text-right bg-dark' />
    <div class='input-group-append'>
      <span class='input-group-text bg-dark'>MB/s</span>
    </div>
  </div>
</SettingCard>
<SettingCard title='Max Number of Connections' description='Numer of peers per torrent. Higher values will increase download speeds but might quickly fill up available ports if your ISP limits the maximum allowed number of open connections.'>
  <input type='number' bind:value={settings.maxConns} min='1' max='512' class='form-control text-right bg-dark w-100 mw-full' />
</SettingCard>
{#if SUPPORTS.torrentPort}
  <SettingCard title='Torrent Port' description='Port used for Torrent connections. 0 is automatic.'>
    <input type='number' bind:value={settings.torrentPort} min='0' max='65536' class='form-control text-right bg-dark w-150 mw-full' />
  </SettingCard>
{/if}
{#if SUPPORTS.dht}
  <SettingCard title='DHT Port' description='Port used for DHT connections. 0 is automatic.'>
    <input type='number' bind:value={settings.dhtPort} min='0' max='65536' class='form-control text-right bg-dark w-150 mw-full' />
  </SettingCard>
  <SettingCard title='Disable DHT' description='Disables Distributed Hash Tables for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.'>
    <div class='custom-switch'>
      <input type='checkbox' id='torrent-dht' bind:checked={settings.torrentDHT} />
      <label for='torrent-dht'>{settings.torrentDHT ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
{/if}
<SettingCard title='Disable PeX' description='Disables Peer Exchange for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.'>
  <div class='custom-switch'>
    <input type='checkbox' id='torrent-pex' bind:checked={settings.torrentPeX} />
    <label for='torrent-pex'>{settings.torrentPeX ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
