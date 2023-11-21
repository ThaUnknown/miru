<script context='module'>
  import { toast } from 'svelte-sonner'
  import { click } from '@/modules/click.js'
  import { settings } from '@/modules/settings.js'
  import IPC from '@/modules/ipc.js'

  if (settings.value.enableDoH) IPC.emit('doh', settings.value.doHURL)
  export const platformMap = {
    aix: 'Aix',
    darwin: 'MacOS',
    android: 'Android',
    ios: 'iOS',
    freebsd: 'Linux',
    linux: 'Linux',
    openbsd: 'Linux',
    sunos: 'SunOS',
    win32: 'Windows'
  }
  let version = '1.0.0'
  IPC.on('version', data => (version = data))
  IPC.emit('version')

  let wasUpdated = false
  IPC.on('update-available', () => {
    if (!wasUpdated) {
      wasUpdated = true
      toast('Auto Updater', {
        description: 'A new version of Miru is available. Downloading!'
      })
    }
  })
  IPC.on('update-downloaded', () => {
    toast.success('Auto Updater', {
      description: 'A new version of Miru has downloaded. You can restart to update!'
    })
  })

  const changeLog = (async () => {
    const res = await fetch('https://api.github.com/repos/ThaUnknown/miru/releases')
    const json = await res.json()
    return json.map(({ body, tag_name: version }) => ({ body, version }))
  })()
  IPC.emit('discord_status', settings.value.showDetailsInRPC)
</script>

<script>
  import { Tabs, TabLabel, Tab } from '@/components/Tabination.js'
  import { onDestroy } from 'svelte'
  import PlayerSettings from './PlayerSettings.svelte'
  import TorrentSettings from './TorrentSettings.svelte'
  import InterfaceSettings from './InterfaceSettings.svelte'
  import AppSettings from './AppSettings.svelte'
  import smoothScroll from '@/modules/scroll.js'

  onDestroy(() => {
    IPC.off('path')
  })

  const groups = {
    player: {
      name: 'Player',
      icon: 'play_arrow'
    },
    torrent: {
      name: 'Torrent',
      icon: 'rss_feed'
    },
    interface: {
      name: 'Interface',
      icon: 'settings'
    },
    app: {
      name: 'App',
      icon: 'info'
    },
    changelog: {
      name: 'Changelog',
      icon: 'description'
    }
  }
  $: IPC.emit('discord_status', $settings.showDetailsInRPC)
  IPC.on('path', data => {
    $settings.torrentPath = data
  })
</script>

<Tabs>
  <div class='d-flex w-full h-full position-relative settings root flex-md-row flex-column overflow-y-auto overflow-y-md-hidden' use:smoothScroll>
    <div class='d-flex flex-column flex-row h-full w-md-300 bg-dark position-relative px-20 px-md-0 flex-basis-0-md-custom'>
      <div class='px-20 py-15 font-size-24 font-weight-semi-bold'>Settings</div>
      {#each Object.values(groups) as group}
        <TabLabel>
          <div class='px-20 py-10 d-flex'>
            <span class='material-symbols-outlined font-size-24 pr-10 d-inline-flex justify-content-center align-items-center'>{group.icon}</span>
            <div class='font-size-16'>{group.name}</div>
          </div>
        </TabLabel>
      {/each}
      <div class='pointer my-5 rounded' tabindex='0' role='button' use:click={() => IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/')}>
        <div class='px-20 py-10 d-flex'>
          <span class='material-symbols-outlined font-size-24 pr-10 d-inline-flex justify-content-center align-items-center'>favorite</span>
          <div class='font-weight-bold font-size-16'>Donate</div>
        </div>
      </div>
      <p class='text-muted px-20 py-10 m-0 mt-md-auto'>Restart may be required for some settings to take effect.</p>
      <p class='text-muted px-20 pb-10 m-0'>If you don't know what settings do what, use defaults.</p>
      <p class='text-muted px-20 m-0 mb-md-20'>v{version} {platformMap[window.version.platform] || 'dev'} {window.version.arch || 'dev'}</p>
    </div>
    <Tab>
      <div class='root h-full w-full overflow-y-md-auto p-20' use:smoothScroll>
        <PlayerSettings bind:settings={$settings} />
        <!-- spacing element to make space for miniplayer on mobile -->
        <div class='h-250 d-md-none' />
      </div>
    </Tab>
    <Tab>
      <div class='root h-full w-full overflow-y-md-auto p-20' use:smoothScroll>
        <TorrentSettings bind:settings={$settings} />
        <div class='h-250 d-md-none' />
      </div>
    </Tab>
    <Tab>
      <div class='root h-full w-full overflow-y-md-auto p-20' use:smoothScroll>
        <InterfaceSettings bind:settings={$settings} />
        <div class='h-250 d-md-none' />
      </div>
    </Tab>
    <Tab>
      <div class='root h-full w-full overflow-y-md-auto p-20' use:smoothScroll>
        <AppSettings />
        <div class='h-250 d-md-none' />
      </div>
    </Tab>
    <Tab>
      <div class='root my-20 px-20 pre-wrap overflow-y-md-auto w-full' use:smoothScroll>
        {#await changeLog}
          <h1 class='font-weight-bold'>Loading changelog...</h1>
        {:then changes}
          {#each changes as { body, version }}
            <h1 class='font-weight-bold mt-20'>{version}</h1>{body}
          {/each}
        {:catch error}
          <h1 class='font-weight-bold mt-20'>Failed to load changelog.</h1>
        {/await}
        <div class='h-250 d-md-none' />
      </div>
    </Tab>
  </div>
</Tabs>

<style>
  .settings :global(select.form-control:invalid) {
    color: var(--dm-input-placeholder-text-color);
  }

  .flex-basis-0-md-custom {
    flex-basis: 0%;
  }

  @media (min-width: 769px) {
    .flex-basis-0-md-custom  {
      flex-basis: auto;
    }
  }
</style>
