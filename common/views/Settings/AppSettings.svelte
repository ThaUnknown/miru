<script context='module'>
  import { click } from '@/modules/click.js'
  import { toast } from 'svelte-sonner'
  import { resetSettings } from '@/modules/settings.js'
  import IPC from '@/modules/ipc.js'
  import { SUPPORTS } from '@/modules/support.js'
  import SettingCard from './SettingCard.svelte'

  async function importSettings () {
    try {
      const settings = JSON.parse(await navigator.clipboard.readText())
      localStorage.setItem('settings', JSON.stringify(settings))
      location.reload()
    } catch (error) {
      toast.error('Failed to import settings', {
        description: 'Failed to import settings from clipboard, make sure the copied data is valid JSON.',
        duration: 5000
      })
    }
  }
  function exportSettings () {
    navigator.clipboard.writeText(localStorage.getItem('settings'))
    toast('Copied to clipboard', {
      description: 'Copied settings to clipboard',
      duration: 5000
    })
  }
  function restoreSettigs () {
    resetSettings()
    location.reload()
  }
  function checkUpdate () {
    IPC.emit('update')
  }
  setInterval(checkUpdate, 1200000)

  IPC.on('log-contents', log => {
    navigator.clipboard.writeText(log)
    toast.success('Copied to clipboard', {
      description: 'Copied log contents to clipboard',
      duration: 5000
    })
  })
</script>

<script>
  import Debug from 'debug'
  import { persisted } from 'svelte-persisted-store'
  import { client } from '@/modules/torrent.js'
  import { onDestroy } from 'svelte'

  const debug = persisted('debug', '', {
    serializer: {
      parse: e => e,
      stringify: e => e
    }
  })

  export let version = ''
  export let settings

  function updateDebug (debug) {
    Debug.disable()
    if (debug) Debug.enable(debug)
    client.send('debug', debug)
  }

  $: updateDebug($debug)

  onDestroy(() => {
    IPC.off('device-info', writeAppInfo)
  })

  function writeAppInfo (info) {
    const deviceInfo = JSON.parse(info)
    deviceInfo.appInfo = {
      version,
      platform: window.version.platform,
      userAgent: navigator.userAgent,
      support: SUPPORTS,
      settings
    }
    navigator.clipboard.writeText(JSON.stringify(deviceInfo, null, 2))
    toast.success('Copied to clipboard', {
      description: 'Copied device info to clipboard',
      duration: 5000
    })
  }

  IPC.on('device-info', writeAppInfo)
</script>

<h4 class='mb-10 font-weight-bold'>Debug Settings</h4>
<SettingCard title='Logging Levels' description='Enable logging of specific parts of the app. These logs are saved to %appdata$/Miru/logs/main.log or ~/config/Miru/logs/main.log.'>
  <select class='form-control bg-dark w-300 mw-full' bind:value={$debug}>
    <option value='' selected>None</option>
    <option value='*'>All</option>
    <option value='torrent:*,webtorrent:*,simple-peer,bittorrent-protocol,bittorrent-dht,bittorrent-lsd,torrent-discovery,bittorrent-tracker:*,ut_metadata,nat-pmp,nat-api'>Torrent</option>
    <option value='ui:*'>Interface</option>
  </select>
</SettingCard>

<SettingCard title='App and Device Info' description='Copy app and device debug info and capabilities, such as GPU information, GPU capabilities, version information and settings to clipboard.'>
  <button type='button' use:click={() => IPC.emit('get-device-info')} class='btn btn-primary'>Copy To Clipboard</button>
</SettingCard>

{#if !SUPPORTS.isAndroid}
  <SettingCard title='Log Output' description='Copy debug logs to clipboard. Once you enable a logging level you can use this to quickly copy the created logs to clipboard instead of navigating to the log file in directories.'>
    <button type='button' use:click={() => IPC.emit('get-log-contents')} class='btn btn-primary'>Copy To Clipboard</button>
  </SettingCard>

  <SettingCard title='Open Torrent Devtools' description="Open devtools for the detached torrent process, this allows to inspect code execution and memory. DO NOT PASTE ANY CODE IN THERE, YOU'RE LIKELY BEING SCAMMED IF SOMEONE TELLS YOU TO!">
    <button type='button' use:click={() => IPC.emit('torrent-devtools')} class='btn btn-primary'>Open Devtools</button>
  </SettingCard>

  <SettingCard title='Open UI Devtools' description="Open devtools for the UI process, this allows to inspect media playback information, rendering performance and more. DO NOT PASTE ANY CODE IN THERE, YOU'RE LIKELY BEING SCAMMED IF SOMEONE TELLS YOU TO!">
    <button type='button' use:click={() => IPC.emit('ui-devtools')} class='btn btn-primary'>Open Devtools</button>
  </SettingCard>
{/if}

<h4 class='mb-10 font-weight-bold'>App Settings</h4>
<div class='d-inline-flex flex-column'>
  <button use:click={importSettings} class='btn btn-primary mt-10' type='button'>
    Import Settings From Clipboard
  </button>
  <button use:click={exportSettings} class='btn btn-primary mt-10' type='button'>
    Export Settings To Clipboard
  </button>
  {#if SUPPORTS.update}
    <button use:click={checkUpdate} class='btn btn-primary mt-10' type='button'>
      Check For Updates
    </button>
  {/if}
  <button
    use:click={restoreSettigs}
    class='btn btn-danger mt-10'
    type='button'
    data-toggle='tooltip'
    data-placement='top'
    data-title='Restores All Settings Back To Their Recommended Defaults'>
    Restore Default Settings
  </button>
</div>
