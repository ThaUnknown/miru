<script context='module'>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { alRequest } from '@/modules/anilist.js'

  export const page = writable('home')
  export const view = writable(null)
  export async function handleAnime (anime) {
    view.set(null)
    view.set((await alRequest({ method: 'SearchIDSingle', id: anime })).data.Media)
  }
  window.IPC.on('open-anime', handleAnime)
  window.IPC.on('schedule', () => {
    page.set('schedule')
  })
</script>

<script>
  import Sidebar from './components/Sidebar.svelte'
  import Router from './Router.svelte'
  import ViewAnime from './views/ViewAnime/ViewAnime.svelte'
  import RSSView from './views/RSSView.svelte'
  import Menubar from './components/Menubar.svelte'
  import IspBlock from './views/IspBlock.svelte'
  import { Toaster } from 'svelte-sonner'
  import Logout from './components/Logout.svelte'

  setContext('view', view)
</script>

<div class='page-wrapper with-sidebar with-transitions bg-dark' data-sidebar-type='overlayed-all'>
  <IspBlock />
  <Menubar bind:page={$page} />
  <ViewAnime />
  <Logout />
  <Sidebar bind:page={$page} />
  <div class='overflow-hidden content-wrapper h-full z-10'>
    <Toaster visibleToasts={3} position='top-right' theme='dark' richColors duration={10000} />
    <RSSView />
    <Router bind:page={$page} />
  </div>
</div>

<style>
  .content-wrapper {
    will-change: width;
    top: 0 !important;
  }

  .page-wrapper > .content-wrapper {
    margin-left: var(--sidebar-minimised) !important;
    position: unset !important;
    width: calc(100% - var(--sidebar-minimised)) !important;
    transition: none !important;
  }
</style>
