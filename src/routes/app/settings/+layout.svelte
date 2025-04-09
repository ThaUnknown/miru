<script lang='ts'>
  import SettingsNav from '$lib/components/SettingsNav.svelte'
  import { Separator } from '$lib/components/ui/separator'
  import { dragScroll } from '$lib/modules/navigate'

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
  <div class='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 grow min-h-0'>
    <aside class='lg:grow lg:max-w-60'>
      <SettingsNav {items} />
    </aside>
    <div class='flex-1 overflow-y-scroll' use:dragScroll>
      <slot />
    </div>
  </div>
</div>
