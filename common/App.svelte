<script context='module'>
  import { setContext } from 'svelte'
  import { writable } from 'simple-store-svelte'
  import { anilistClient } from '@/modules/anilist.js'
  import IPC from '@/modules/ipc.js'
  import { rss } from './views/TorrentSearch/TorrentModal.svelte'

  export const page = writable('home')
  export const view = writable(null)
  export async function handleAnime (anime) {
    view.set(null)
    view.set((await anilistClient.searchIDSingle({ id: anime })).data.Media)
  }
  IPC.on('open-anime', handleAnime)
  IPC.on('schedule', () => {
    page.set('schedule')
  })

  let ignoreNext = false
  function addPage (value, type) {
    if (ignoreNext) {
      ignoreNext = false
      return
    }
    history.pushState({ type, value }, '', location.origin + location.pathname + '?id=' + Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER).toString())
  }
  page.subscribe((value) => {
    addPage(value, 'page')
  })
  view.subscribe((value) => {
    addPage(value, 'view')
  })

  addPage('home', 'page')

  window.addEventListener('popstate', e => {
    const { state } = e
    if (!state) return
    ignoreNext = true
    view.set(null)
    rss.set(null)
    if (document.fullscreenElement) document.exitFullscreen()
    if (state.type === 'page') {
      page.set(state.value)
    } else {
      view.set(state.value)
    }
  })
</script>

<script>
  import Sidebar from './components/Sidebar.svelte'
  import Router from './Router.svelte'
  import ViewAnime from './views/ViewAnime/ViewAnime.svelte'
  import TorrentModal from './views/TorrentSearch/TorrentModal.svelte'
  import Menubar from './components/Menubar.svelte'
  import { Toaster } from 'svelte-sonner'
  import Logout from './components/Logout.svelte'
  import Navbar from './components/Navbar.svelte'

  setContext('view', view)
</script>

<div class='page-wrapper with-transitions bg-dark position-relative' data-sidebar-type='overlayed-all'>
  <Menubar bind:page={$page} />
  <ViewAnime />
  <Logout />
  <Sidebar bind:page={$page} />
  <Toaster visibleToasts={6} position='top-right' theme='dark' richColors duration={10000} closeButton />
  <div class='overflow-hidden content-wrapper h-full z-10'>
    <TorrentModal />
    <Router bind:page={$page} />
  </div>
  <Navbar bind:page={$page} />
</div>

<style>
  .content-wrapper {
    will-change: width;
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
