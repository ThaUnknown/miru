<script context='module'>
  import { setContext } from 'svelte'
  import { writable } from 'simple-store-svelte'
  import { anilistClient } from '@/modules/anilist.js'
  import IPC from '@/modules/ipc.js'

  export const page = writable('home')
  export const overlay = writable('none')
  export const view = writable(null)
  export async function handleAnime (anime) {
    view.set(null)
    view.set((await anilistClient.searchIDSingle({ id: anime })).data.Media)
  }
  IPC.on('open-anime', handleAnime)
  IPC.on('schedule', () => {
    page.set('schedule')
  })
</script>

<script>
  import Sidebar from './components/Sidebar.svelte'
  import Router from './Router.svelte'
  import ViewAnime from './views/ViewAnime/ViewAnime.svelte'
  import TorrentModal from './views/TorrentSearch/TorrentModal.svelte'
  import Menubar from './components/Menubar.svelte'
  import { Toaster } from 'svelte-sonner'
  import Login from './components/Login.svelte'
  import Logout from './components/Logout.svelte'
  import Navbar from './components/Navbar.svelte'

  setContext('view', view)
</script>

<div class='page-wrapper with-transitions bg-dark position-relative' data-sidebar-type='overlayed-all'>
  <Menubar bind:page={$page} />
  <Login />
  <Logout />
  <Sidebar bind:page={$page} />
  <div class='overflow-hidden content-wrapper h-full'>
    <Toaster visibleToasts={6} position='top-right' theme='dark' richColors duration={10000} closeButton />
    <ViewAnime bind:overlay={$overlay} />
    <TorrentModal bind:overlay={$overlay} />
    <Router bind:page={$page} bind:overlay={$overlay} />
  </div>
  <Navbar bind:page={$page} />
</div>

<style>
  .content-wrapper {
    will-change: width;
    white-space: pre-line;
    top: 0 !important;
  }

  .page-wrapper > .content-wrapper {
    margin-left: var(--sidebar-minimised) !important;
    width: calc(100% - var(--sidebar-minimised)) !important;
    transition: none !important;
  }
  .page-wrapper {
    height: calc(100% - var(--navbar-height)) !important;
  }
  @media (min-width: 769px) {
    .page-wrapper  {
      padding-left: max(var(--safe-area-left), env(safe-area-inset-left, 0)) !important;
    }
  }
</style>
