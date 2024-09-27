<script>
  import { getContext } from 'svelte'
  import { rss } from '@/views/TorrentSearch/TorrentModal.svelte'
  import { media } from '@/views/Player/MediaHandler.svelte'
  import { profileView } from './Profiles.svelte'
  import { settings } from '@/modules/settings.js'
  import { toast } from 'svelte-sonner'
  import Helper from '@/modules/helper.js'
  import IPC from '@/modules/ipc.js'
  import SidebarLink from './SidebarLink.svelte'
  import { Clock, Download, Heart, Home, ListVideo, LogIn, Settings, Users } from 'lucide-svelte'
  import { MagnifyingGlass } from 'svelte-radix'

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
    <SidebarLink click={() => { $profileView = !$profileView }} icon='login' text={Helper.getUser() ? 'Profiles' : 'Login'} css='mt-auto' {page} overlay={$profileView && 'profile'} image={Helper.getUserAvatar()}>
      <LogIn size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' />
    </SidebarLink>
    <SidebarLink click={() => { page = 'home'; if ($view) $view = null }} _page='home' text='Home' {page} overlay={($view || $profileView || $rss) && 'active'} let:active>
      <Home size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3' : '2'} />
    </SidebarLink>
    <SidebarLink click={() => { page = 'search'; if ($view) $view = null }} _page='search' text='Search' {page} overlay={($view || $profileView || $rss) && 'active'} let:active>
      <MagnifyingGlass size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' stroke-width={active ? '1' : '0'} stroke='currentColor' />
    </SidebarLink>
    <SidebarLink click={() => { page = 'schedule' }} _page='schedule' icon='schedule' text='Schedule' {page} overlay={($view || $profileView || $rss) && 'active'} let:active>
      <Clock size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3' : '2'} />
    </SidebarLink>
    {#if $media?.media}
      {@const currentMedia = $view}
      {@const active = $view && !$profileView && 'active'}
      <SidebarLink click={() => { $view = (currentMedia?.id === $media.media.id && active ? null : $media.media); }} icon='queue_music' text='Now Playing' {page} overlay={active} nowPlaying={$view === $media.media} let:active>
        <ListVideo size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3' : '2'} />
      </SidebarLink>
    {/if}
    <SidebarLink click={() => { page = 'watchtogether' }} _page='watchtogether' icon='groups' text='Watch Together' {page} overlay={($view || $profileView || $rss) && 'active'} let:active>
      <Users size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3' : '2'} />
    </SidebarLink>
    <SidebarLink click={() => { IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/') }} icon='favorite' text='Support This App' css='mt-auto' {page} let:active>
      <Heart size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded donate' strokeWidth={active ? '3' : '2'} fill='currentColor' />
    </SidebarLink>
    {#if updateState === 'downloading'}
      <SidebarLink click={() => { toast('Update is downloading...') }} icon='download' text='Update Downloading...' {page} let:active>
        <Download size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3' : '2'} />
      </SidebarLink>
    {:else if updateState === 'ready'}
      <SidebarLink click={() => { IPC.emit('quit-and-install') }} icon='download' text='Update Ready!' {page} let:active>
        <Download size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded update' strokeWidth={active ? '3' : '2'} />
      </SidebarLink>
    {/if}
    <SidebarLink click={() => { page = 'settings' }} _page='settings' icon='settings' text='Settings' {page} overlay={($view || $profileView || $rss) && 'active'} let:active>
      <Settings size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3' : '2'} />
    </SidebarLink>
  </div>
</div>

<style>
  .sidebar .animate :global(.donate) {
    animation: glow 1s ease-in-out infinite alternate;
  }
  .sidebar :global(.donate):hover {
    color: #fa68b6 !important;
  }
  .sidebar :global(.donate) {
    font-variation-settings: 'FILL' 1;
    color: #fa68b6;
    text-shadow: 0 0 1rem #fa68b6;
  }
  :global(.update) {
    color: #47cb6a;
    font-variation-settings: 'FILL' 1;
  }
  @keyframes glow {
    from {
      filter: drop-shadow(0 0 1rem #fa68b6);
    }
    to {
      filter: drop-shadow(0 0 0.5rem #fa68b6);
    }
  }
  .sidebar-menu {
    padding-top: 10rem;
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
