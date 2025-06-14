<script lang='ts'>
  import { version } from '$app/environment'
  import SettingsNav from '$lib/components/SettingsNav.svelte'
  import { Separator } from '$lib/components/ui/separator'
  import native from '$lib/modules/native'
  import { dragScroll } from '$lib/modules/navigate'
  import { highEntropyValues } from '$lib/utils'

  const items = [
    {
      title: 'Player',
      href: '/app/settings/'
    },
    {
      title: 'Client',
      href: '/app/settings/client/'
    },
    {
      title: 'Interface',
      href: '/app/settings/interface/'
    },
    {
      title: 'Extensions',
      href: '/app/settings/extensions/'
    },
    {
      title: 'Accounts',
      href: '/app/settings/accounts/'
    },
    {
      title: 'App',
      href: '/app/settings/app/'
    },
    {
      title: 'Changelog',
      href: '/app/settings/changelog/'
    }
  ]
</script>

<div class='space-y-6 p-10 pb-0 w-full h-full flex flex-col'>
  <div class='space-y-0.5'>
    <h2 class='text-2xl font-bold'>Settings</h2>
    <p class='text-muted-foreground'>
      Manage your app settings, preferences and accounts.
    </p>
  </div>
  <Separator class='my-6' />
  <div class='flex flex-col lg:flex-row gap-x-12 grow min-h-0'>
    <aside class='lg:grow lg:max-w-60 flex flex-col'>
      <SettingsNav {items} />
      <div class='mt-auto text-xs text-muted-foreground px-4 sm:px-2 py-5 flex flex-row lg:flex-col font-light gap-0.5 gap-x-4 flex-wrap'>
        <div>Interface v{version}</div>
        <div>Native {#await native.version() then version}{version}{/await}</div>
        {#if highEntropyValues}
          {#await highEntropyValues then { architecture, platform, platformVersion }}
            <div>{platform} {platformVersion} {architecture}</div>
          {:catch e}
            <div>Could not obtain device version</div>
          {/await}
        {:else}
          <div>Could not obtain device version</div>
        {/if}
      </div>
    </aside>
    <div class='flex-1 overflow-y-scroll pb-40' use:dragScroll>
      <slot />
    </div>
  </div>
</div>
