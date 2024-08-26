<script>
  import { getContext } from 'svelte'
  import { anilistClient } from '@/modules/anilist.js'
  import { media } from '../views/Player/MediaHandler.svelte'
  import { platformMap } from '@/views/Settings/Settings.svelte'
  import { settings } from '@/modules/settings.js'
  import { toast } from 'svelte-sonner'
  import { logout } from './Logout.svelte'
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

  function handleAlLogin () {
    if (anilistClient.userID?.viewer?.data?.Viewer) {
      $logout = true
    } else {
      IPC.emit('open', 'https://anilist.co/api/v2/oauth/authorize?client_id=4254&response_type=token') // Change redirect_url to miru://auth
      if (platformMap[window.version.platform] === 'Linux') {
        toast('Support Notification', {
          description: "If your linux distribution doesn't support custom protocol handlers, you can simply paste the full URL into the app.",
          duration: 300000
        })
      }
    }
  }
</script>

<div class='sidebar z-30 d-md-block' class:animated={$settings.expandingSidebar}>
  <div class='sidebar-overlay pointer-events-none h-full position-absolute' />
  <div class='sidebar-menu h-full d-flex flex-column justify-content-center align-items-center m-0 pb-5' class:animate={page !== 'player'}>
    <SidebarLink click={handleAlLogin} icon='login' text={anilistClient.userID?.viewer?.data?.Viewer ? 'Logout' : 'Login With AniList'} css='mt-auto' {page} image={anilistClient.userID?.viewer?.data?.Viewer?.avatar.medium}>
      <LogIn size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' />
    </SidebarLink>
    <SidebarLink click={() => { page = 'home' }} _page='home' text='Home' {page} let:active>
      <Home size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3.5' : '2'} />
    </SidebarLink>
    <SidebarLink click={() => { page = 'search' }} _page='search' text='Search' {page} let:active>
      <MagnifyingGlass size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' stroke-width={active ? '2' : '0'} stroke='currentColor' />
    </SidebarLink>
    <SidebarLink click={() => { page = 'schedule' }} _page='schedule' icon='schedule' text='Schedule' {page} let:active>
      <Clock size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3.5' : '2'} />
    </SidebarLink>
    {#if $media?.media}
      <SidebarLink click={() => { $view = $media.media }} icon='queue_music' text='Now Playing' {page} let:active>
        <ListVideo size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3.5' : '2'} />
      </SidebarLink>
    {/if}
    <SidebarLink click={() => { page = 'watchtogether' }} _page='watchtogether' icon='groups' text='Watch Together' {page} let:active>
      <Users size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3.5' : '2'} />
    </SidebarLink>
    <SidebarLink click={() => { IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/') }} icon='favorite' text='Support This App' css='mt-auto' {page} let:active>
      <Heart size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded donate' strokeWidth={active ? '3.5' : '2'} fill='currentColor' />
    </SidebarLink>
    {#if updateState === 'downloading'}
      <SidebarLink click={() => { toast('Update is downloading...') }} icon='download' text='Update Downloading...' {page} let:active>
        <Download size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3.5' : '2'} />
      </SidebarLink>
    {:else if updateState === 'ready'}
      <SidebarLink click={() => { IPC.emit('quit-and-install') }} icon='download' text='Update Ready!' {page} let:active>
        <Download size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded update' strokeWidth={active ? '3.5' : '2'} />
      </SidebarLink>
    {/if}
    <SidebarLink click={() => { page = 'settings' }} _page='settings' icon='settings' text='Settings' {page} let:active>
      <Settings size='2rem' class='flex-shrink-0 p-5 w-30 h-30 m-5 rounded' strokeWidth={active ? '3.5' : '2'} />
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
