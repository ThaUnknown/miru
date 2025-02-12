<script lang='ts'>
  import SettingsNav from '$lib/components/SettingsNav.svelte'
  import { Separator } from '$lib/components/ui/separator'

  const items = [
    {
      title: 'Player',
      href: '/settings/'
    },
    {
      title: 'Torrent',
      href: '/settings/torrent/'
    },
    {
      title: 'Interface',
      href: '/settings/interface/'
    },
    {
      title: 'Extensions',
      href: '/settings/extensions/'
    },
    {
      title: 'Accounts',
      href: '/settings/accounts/'
    },
    {
      title: 'App',
      href: '/settings/app/'
    },
    {
      title: 'Changelog',
      href: '/settings/changelog/'
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
  <div class='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 grow min-h-0'>
    <aside class='lg:grow lg:max-w-60'>
      <SettingsNav {items} />
    </aside>
    <div class='flex-1 overflow-y-scroll'>
      <slot />
    </div>
  </div>
</div>
