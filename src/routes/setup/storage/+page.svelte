<script lang='ts'>
  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import { SUPPORTS, settings } from '$lib/modules/settings'
  import native from '$lib/modules/native'
  import Footer from '../Footer.svelte'
  import Progress from '../Progress.svelte'

  async function selectDownloadFolder () {
    $settings.torrentPath = await native.selectDownload()
  }
</script>

<Progress />
<div class='space-y-3 lg:max-w-4xl pt-5 h-full overflow-y-auto'>
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

<Footer prev='' next='network' />
