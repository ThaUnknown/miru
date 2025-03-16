<script lang='ts'>
  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { SingleCombo } from '$lib/components/ui/combobox'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'

  import native from '$lib/modules/native'
  import { settings, SUPPORTS } from '$lib/modules/settings'

  const resolutions = {
    1080: '1080p',
    720: '720p',
    480: '480p',
    '': 'Any'
  }

  async function selectDownloadFolder () {
    $settings.torrentPath = await native.selectDownload()
  }
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  <div class='font-weight-bold text-xl font-bold'>Lookup Settings</div>
  <SettingCard title='Torrent Quality' description="What quality to use when trying to find torrents. None might rarely find less results than specific qualities. This doesn't exclude other qualities from being found like 4K or weird DVD resolutions.">
    <SingleCombo bind:value={$settings.searchQuality} items={resolutions} class='w-32 shrink-0 border-input border' />
  </SettingCard>
  <SettingCard let:id title='Auto-Select Torrents' description='Automatically selects torrents based on quality and amount of seeders. Disable this to have more precise control over played torrents.'>
    <Switch {id} bind:checked={$settings.searchAutoSelect} />
  </SettingCard>
  {#if !SUPPORTS.isAndroid}
    <SettingCard let:id title='Use DNS Over HTTPS' description='Enables DNS Over HTTPS, useful if your ISP blocks certain domains.'>
      <Switch {id} bind:checked={$settings.enableDoH} />
    </SettingCard>
    <SettingCard let:id title='DNS Over HTTPS URL' description='What URL to use for querying DNS Over HTTPS.'>
      <Input type='url' bind:value={$settings.doHURL} {id} class='w-80 shrink-0 bg-background' />
    </SettingCard>
  {/if}

  <div class='font-weight-bold text-xl font-bold'>Client Settings</div>
  <SettingCard let:id title='Torrent Download Location' description='Path to the folder used to store torrents. By default this is the TMP folder, which might lose data when your OS tries to reclaim storage.  {SUPPORTS.isAndroid ? 'RESTART IS REQUIRED. /sdcard/ is internal storage, not external SD Cards. /storage/AB12-34CD/ is external storage, not internal. Thank you Android!' : ''}'>
    <div class='flex'>
      {#if !SUPPORTS.isAndroid}
        <Input type='url' bind:value={$settings.torrentPath} readonly {id} placeholder='/tmp' class='sm:w-60 bg-background rounded-r-none pointer-events-none' />
      {:else}
        <Input type='text' bind:value={$settings.torrentPath} {id} placeholder='/tmp' class='sm:w-60 bg-background rounded-r-none' />
      {/if}
      <Button class='rounded-l-none font-bold' on:click={selectDownloadFolder} variant='secondary'>Select Folder</Button>
    </div>
  </SettingCard>
  <SettingCard let:id title='Persist Files' description="Keeps torrents files instead of deleting them after a new torrent is played. This doesn't seed the files, only keeps them on your drive. This will quickly fill up your storage.">
    <Switch {id} bind:checked={$settings.torrentPersist} />
  </SettingCard>
  <SettingCard let:id title='Streamed Download' description="Only downloads the single file that's currently being watched, instead of downloading an entire batch of episodes. Saves bandwidth and reduces strain on the peer swarm.">
    <Switch {id} bind:checked={$settings.torrentStreamedDownload} />
  </SettingCard>
  <SettingCard let:id title='Transfer Speed Limit' description='Download/Upload speed limit for torrents, higher values increase CPU usage, and values higher than your storage write speeds will quickly fill up RAM.'>
    <div class='flex items-center relative scale-parent border border-input rounded-md'>
      <Input type='number' inputmode='numeric' pattern='[0-9]*.?[0-9]*' min='1' max='50' step='0.1' bind:value={$settings.torrentSpeed} {id} class='w-32 shrink-0 bg-background pr-12 border-0 no-scale' />
      <div class='shrink-0 absolute right-3 z-10 pointer-events-none text-sm leading-5'>MB/s</div>
    </div>
  </SettingCard>
  <SettingCard let:id title='Max Number of Connections' description='Number of peers per torrent. Higher values will increase download speeds but might quickly fill up available ports if your ISP limits the maximum allowed number of open connections.'>
    <Input type='number' inputmode='numeric' pattern='[0-9]*' min='1' max='512' bind:value={$settings.maxConns} {id} class='w-32 shrink-0 bg-background' />
  </SettingCard>
  <SettingCard let:id title='Torrent Port' description='Port used for Torrent connections. 0 is automatic.'>
    <Input type='number' inputmode='numeric' pattern='[0-9]*' min='0' max='65536' bind:value={$settings.torrentPort} {id} class='w-32 shrink-0 bg-background' />
  </SettingCard>
  <SettingCard let:id title='DHT Port' description='Port used for DHT connections. 0 is automatic.'>
    <Input type='number' inputmode='numeric' pattern='[0-9]*' min='0' max='65536' bind:value={$settings.dhtPort} {id} class='w-32 shrink-0 bg-background' />
  </SettingCard>
  <SettingCard let:id title='Disable DHT' description='Disables Distributed Hash Tables for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.'>
    <Switch {id} bind:checked={$settings.torrentDHT} />
  </SettingCard>
  <SettingCard let:id title='Disable PeX' description='Disables Peer Exchange for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.'>
    <Switch {id} bind:checked={$settings.torrentPeX} />
  </SettingCard>
</div>
