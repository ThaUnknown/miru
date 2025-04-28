<script lang='ts'>
  import { persisted } from 'svelte-persisted-store'
  import { toast } from 'svelte-sonner'

  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { SingleCombo } from '$lib/components/ui/combobox'
  import { Switch } from '$lib/components/ui/switch'
  import native from '$lib/modules/native'
  import { settings, SUPPORTS } from '$lib/modules/settings'

  const debugOpts = {
    '': 'None',
    '*': 'All',
    'torrent:*,webtorrent:*,simple-peer,bittorrent-protocol,bittorrent-dht,bittorrent-lsd,torrent-discovery,bittorrent-tracker:*,ut_metadata,nat-pmp,nat-api': 'Torrent',
    'ui:*': 'Interface'
  }
  const debug = persisted('debug', '')

  async function copyLogs () {
    const logs = await native.getLogs()
    navigator.clipboard.writeText(logs)
    toast.success('Copied to clipboard', {
      description: 'Copied log contents to clipboard',
      duration: 5000
    })
  }

  async function copyDevice () {
    const device = await native.getDeviceInfo() // TODO: app version and platform
    device.appInfo = {
      userAgent: navigator.userAgent,
      support: SUPPORTS,
      settings
    }
    navigator.clipboard.writeText(JSON.stringify(device, null, 2))
    toast.success('Copied to clipboard', {
      description: 'Copied device info to clipboard',
      duration: 5000
    })
  }

  async function importSettings () {
    try {
      const imported = JSON.parse(await navigator.clipboard.readText())
      $settings = imported
      native.restart()
    } catch (err) {
      toast.error('Failed to import settings', {
        description: 'Failed to import settings from clipboard, make sure the copied data is valid JSON.',
        duration: 5000
      })
    }
  }
  function exportSettings () {
    navigator.clipboard.writeText(JSON.stringify($settings))
    toast('Copied to clipboard', {
      description: 'Copied settings to clipboard',
      duration: 5000
    })
  }
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  <div class='font-weight-bold text-xl font-bold'>Debug Settings</div>
  <SettingCard title='Logging Levels' description='Enable logging of specific parts of the app. These logs are saved to %appdata$/Miru/logs/main.log or ~/config/Miru/logs/main.log.'>
    <SingleCombo bind:value={$debug} items={debugOpts} class='w-32 shrink-0 border-input border' />
  </SettingCard>

  <SettingCard title='App and Device Info' description='Copy app and device debug info and capabilities, such as GPU information, GPU capabilities, version information and settings to clipboard.'>
    <Button on:click={copyDevice} class='btn btn-primary'>Copy To Clipboard</Button>
  </SettingCard>

  {#if !SUPPORTS.isAndroid}
    <SettingCard title='Log Output' description='Copy debug logs to clipboard. Once you enable a logging level you can use this to quickly copy the created logs to clipboard instead of navigating to the log file in directories.'>
      <Button on:click={copyLogs} class='btn btn-primary'>Copy To Clipboard</Button>
    </SettingCard>

    <SettingCard title='Open UI Devtools' description="Open devtools for the UI process, this allows to inspect media playback information, rendering performance and more. DO NOT PASTE ANY CODE IN THERE, YOU'RE LIKELY BEING SCAMMED IF SOMEONE TELLS YOU TO!">
      <Button on:click={native.openUIDevtools} class='btn btn-primary'>Open Devtools</Button>
    </SettingCard>
  {/if}

  <div class='font-weight-bold text-xl font-bold'>App Settings</div>
  {#if !SUPPORTS.isAndroid}
    <SettingCard let:id title='Hide App To Tray' description='Makes the app hide to tray instead of closing when you close the window. This is useful if you want to keep the torrent client open in the background to seed/leech.'>
      <Switch {id} bind:checked={$settings.hideToTray} />
    </SettingCard>
  {/if}
  <div class='d-inline-flex flex-column'>
    <Button on:click={importSettings}>
      Import Settings From Clipboard
    </Button>
    <Button on:click={exportSettings}>
      Export Settings To Clipboard
    </Button>
    {#if !SUPPORTS.isAndroid}
      <Button on:click={native.checkUpdate}>
        Check For Updates
      </Button>
    {/if}
    <Button
      on:click={() => { settings.reset(); native.restart() }}
      variant='destructive'>
      Restore Default Settings
    </Button>
  </div>
</div>
