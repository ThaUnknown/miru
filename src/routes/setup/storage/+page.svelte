<script lang='ts'>
  import Footer, { type Checks } from '../Footer.svelte'
  import Progress from '../Progress.svelte'

  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import { SUPPORTS, settings } from '$lib/modules/settings'
  import native from '$lib/modules/native'
  import { fastPrettyBytes } from '$lib/utils'
  import { dragScroll } from '$lib/modules/navigate'

  async function selectDownloadFolder () {
    $settings.torrentPath = await native.selectDownload()
  }

  async function checkSpaceRequirements (_path: string): Checks['promise'] {
    const space = await native.checkAvailableSpace()
    if (space < 1e9) return { status: 'error', text: `${fastPrettyBytes(space)} available, 1GB is the recommended minimum.` }
    if (space < 5e9) return { status: 'warning', text: `${fastPrettyBytes(space)} available, 5GB is the recommended amount.` }
    return { status: 'success', text: `${fastPrettyBytes(space)} available.` }
  }
  let space: Checks
  $: space = { promise: checkSpaceRequirements($settings.torrentPath), title: 'Storage Space', pending: 'Checking available storage space...' }
</script>

<Progress />

<div class='space-y-3 lg:max-w-4xl pt-5 h-full overflow-y-auto' use:dragScroll>
  <SettingCard class='bg-transparent' let:id title='Torrent Download Location' description='Path to the folder used to store torrents. By default this is the TMP folder, which might lose data when your OS tries to reclaim storage.  {SUPPORTS.isAndroid ? 'RESTART IS REQUIRED. /sdcard/ is internal storage, not external SD Cards. /storage/AB12-34CD/ is external storage, not internal. Thank you Android!' : ''}'>
    <div class='flex'>
      {#if !SUPPORTS.isAndroid}
        <Input type='url' bind:value={$settings.torrentPath} readonly {id} placeholder='/tmp' class='sm:w-60 bg-background rounded-r-none pointer-events-none' />
      {:else}
        <Input type='text' bind:value={$settings.torrentPath} {id} placeholder='/tmp' class='sm:w-60 bg-background rounded-r-none' />
      {/if}
      <Button class='rounded-l-none font-bold' on:click={selectDownloadFolder} variant='secondary'>Select Folder</Button>
    </div>
  </SettingCard>
  <SettingCard class='bg-transparent' let:id title='Persist Files' description="Keeps torrents files instead of deleting them after a new torrent is played. This doesn't seed the files, only keeps them on your drive. This will quickly fill up your storage.">
    <Switch {id} bind:checked={$settings.torrentPersist} />
  </SettingCard>
</div>

<Footer checks={[space]} />
