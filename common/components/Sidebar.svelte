<script>
  import { getContext } from 'svelte'
  import { media } from '@/views/Player/MediaHandler.svelte'
  import { settings } from '@/modules/settings.js'
  import { toast } from 'svelte-sonner'
  import { profileView } from './Profiles.svelte'
  import Helper from '@/modules/helper.js'
  import IPC from '@/modules/ipc.js'
  import SidebarLink from './SidebarLink.svelte'

  let updateState = ''

  IPC.on('update-available', () => {
    updateState = 'downloading'
  })
  IPC.on('update-downloaded', () => {
    updateState = 'ready'
  })

  const view = getContext('view')

  export let page
</script>

<div class='sidebar z-30 d-md-block' class:animated={$settings.expandingSidebar}>
  <div class='sidebar-overlay pointer-events-none h-full position-absolute' />
  <div class='sidebar-menu h-full d-flex flex-column justify-content-center align-items-center m-0 pb-5' class:animate={page !== 'player'}>
    <SidebarLink click={() => { $profileView = true }} icon='login' text={Helper.getUser() ? 'Profiles' : 'Login'} css='mt-auto' {page} image={Helper.getUserAvatar()} />
    <SidebarLink click={() => { page = 'home'; if ($view) $view = null }} _page='home' icon='home' text='Home' {page} />
    <SidebarLink click={() => { page = 'search'; if ($view) $view = null }} _page='search' icon='search' text='Search' {page} />
    <SidebarLink click={() => { page = 'schedule' }} _page='schedule' icon='schedule' text='Schedule' {page} />
    {#if $media?.media}
      <SidebarLink click={() => { $view = $media.media }} icon='queue_music' text='Now Playing' {page} />
    {/if}
    <SidebarLink click={() => { page = 'watchtogether' }} _page='watchtogether' icon='groups' text='Watch Together' {page} />
    <SidebarLink click={() => { IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/') }} icon='favorite' text='Support This App' css='mt-auto donate' {page} />
    {#if updateState === 'downloading'}
      <SidebarLink click={() => { toast('Update is downloading...') }} icon='download' text='Update Downloading...' {page} />
    {:else if updateState === 'ready'}
      <SidebarLink click={() => { IPC.emit('quit-and-install') }} css='update' icon='download' text='Update Ready!' {page} />
    {/if}
    <SidebarLink click={() => { page = 'settings' }} _page='settings' icon='settings' text='Settings' {page} />
  </div>
</div>

<style>
  @keyframes glow {
    from {
      text-shadow: 0 0 2rem #fa68b6;
    }
    to {
      text-shadow: 0 0 1rem #fa68b6;
    }
  }
  .animate .donate .material-symbols-outlined {
    animation: glow 1s ease-in-out infinite alternate;
  }
  .donate:hover .material-symbols-outlined {
    background: #fff;
    color: #fa68b6 !important;
  }
  .donate .material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
    color: #fa68b6;
    text-shadow: 0 0 1rem #fa68b6;
  }
  .update .material-symbols-outlined {
    color: #47cb6a;
    font-variation-settings: 'FILL' 1;
  }
  .sidebar-menu {
    padding-top: 10rem;
  }
  .text {
    opacity: 1;
    transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar-link > span {
    color: #fff;
    border-radius: 0.3rem;
  }

  .material-symbols-outlined {
    color: #fff;
    transition: background .8s cubic-bezier(0.25, 0.8, 0.25, 1), color .8s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .sidebar-link:hover > span > *:nth-child(1) {
    background: #fff;
    color: var(--dark-color);
  }

  .sidebar-link {
    width: 100%;
    font-size: 1.4rem;
    padding: 0.75rem 1.5rem;
    height: 5.5rem;
  }

  .material-symbols-outlined {
    font-size: 2.2rem;
    min-width: 4rem;
    width: 4rem;
    height: 4rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar-link img {
    font-size: 2.2rem;
    width: 3rem;
    height: 3rem;
    margin: 0.5rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  img {
    margin-right: var(--sidebar-brand-image-margin-right);
  }

  .sidebar {
    transition: width .8s cubic-bezier(0.25, 0.8, 0.25, 1), left .8s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    background: none !important;
    overflow-y: unset;
    overflow-x: visible;
    left: unset;
  }
  .sidebar.animated:hover {
    width: 22rem
  }
  .sidebar.animated {
    z-index: 60 !important;
  }
  .sidebar-overlay {
    width: var(--sidebar-width);
    transition: width .8s cubic-bezier(0.25, 0.8, 0.25, 1), left .8s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    background: var(--sidebar-gradient);
    backdrop-filter: blur(2px);
    z-index: -1;
  }
  .sidebar.animated:hover .sidebar-overlay {
    width: 63rem
  }
</style>
