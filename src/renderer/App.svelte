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
</script>

<script>
  import Sidebar from './components/Sidebar.svelte'
  import Router from './Router.svelte'
  import ViewAnime from './views/ViewAnime/ViewAnime.svelte'
  import ViewTrailer from './views/ViewAnime/ViewTrailer.svelte'
  import RSSView from './views/RSSView.svelte'
  import Menubar from './components/Menubar.svelte'
  import Toasts from './components/Toasts.svelte'
  import CatBlock from './views/CatBlock.svelte'

  setContext('view', view)

  setContext('trailer', writable(null))
</script>

<div id='player' />
<Toasts />
<div class='page-wrapper with-sidebar with-transitions bg-dark' data-sidebar-type='overlayed-all'>
  <div class='sticky-alerts' />
  <CatBlock />
  <Menubar bind:page={$page} />
  <ViewAnime />
  <ViewTrailer />
  <RSSView />
  <Sidebar bind:page={$page} />
  <div class='overflow-hidden content-wrapper h-full z-10'>
    <Router bind:page={$page} />
  </div>
</div>

<style>
  .content-wrapper {
    will-change: width;
    top: 0 !important;
  }

  .page-wrapper > .content-wrapper {
    left: var(--sidebar-minimised) !important;
    width: calc(100% - var(--sidebar-minimised)) !important;
  }
</style>
