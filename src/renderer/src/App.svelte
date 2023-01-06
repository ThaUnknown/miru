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
  import Sidebar from './lib/Sidebar.svelte'
  import Router from './lib/Router.svelte'
  import ViewAnime from './lib/ViewAnime/ViewAnime.svelte'
  import ViewTrailer from './lib/ViewAnime/ViewTrailer.svelte'
  import RSSView from './lib/RSSView.svelte'
  import Menubar from './lib/Menubar.svelte'
  import Toasts from './lib/Toasts.svelte'
  import 'quartermoon/css/quartermoon-variables.css'
  import NyaaBlock from './lib/NyaaBlock.svelte'
  import { wrapEnter } from '@/modules/util.js'

  setContext('view', view)

  const sidebar = writable(true)
  setContext('sidebar', sidebar)

  setContext('gallery', writable(null))

  setContext('trailer', writable(null))
</script>

<Toasts />
<ViewAnime />
<ViewTrailer />
<RSSView />
<div class='page-wrapper with-navbar with-sidebar with-transitions' data-sidebar-type='overlayed-sm-and-down' data-sidebar-hidden={$sidebar || null}>
  <div class='sticky-alerts' />
  <div class='sidebar-overlay'
    on:click={() => ($sidebar = !$sidebar)} on:keydown={wrapEnter(() => ($sidebar = !$sidebar))}
    tabindex='0'
    role='button' />
  <NyaaBlock />
  <Menubar />
  <Sidebar bind:page={$page} />
  <Router bind:page={$page} />
</div>

<style>
  :root {
    --navbar-height: 28px;
    --accent-color: #e5204c;
    --dm-link-text-color: var(--dm-muted-text-color) !important;
    --dm-link-text-color-hover: var(--dm-text-color) !important;
    --base-html-font-size: 50%;
    --base-html-font-size-1600: 50%;
    --base-html-font-size-1920: 62.5%;
    --tooltip-width: 17rem;
    --card-border-width: 0;
    --sidebar-border-width: 0;
    --input-border-width: 0;
  }
  :global(.pointer) {
    cursor: pointer;
  }
  :global(body) {
    scroll-behavior: smooth;
    overscroll-behavior: none;
    user-select: none;
  }
  :global(img) {
    -webkit-user-drag: none;
  }
  /* sidebar patches */
  .page-wrapper.with-sidebar[data-sidebar-hidden] {
    --sidebar-width: var(--sidebar-minimised);
  }
  :global(::-webkit-inner-spin-button) {
    opacity: 1;
    margin-left: 0.4rem;
    margin-right: -0.5rem;
    filter: invert(0.84);
    padding-top: 2rem;
  }
  :global(*:focus-visible){
    outline: none;
    box-shadow: var(--dm-button-primary-box-shadow-focus) !important;
  }

  :global(.root) {
    animation: 0.3s ease 0s 1 root-load-in;
  }
  @keyframes root-load-in {
    from {
      bottom: -1.2rem;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      transform: scale(1);
    }
  }

  @media (max-width: 768px) {
    .page-wrapper.with-sidebar[data-sidebar-type~='overlayed-sm-and-down'] > :global(.content-wrapper) {
      left: var(--sidebar-minimised);
      width: calc(100% - var(--sidebar-minimised));
    }
  }

  .page-wrapper.with-sidebar[data-sidebar-hidden] > :global(.content-wrapper) {
    left: var(--sidebar-width);
    width: calc(100% - var(--sidebar-width));
  }
  .page-wrapper.with-sidebar[data-sidebar-hidden] > :global(.sidebar) {
    left: 0;
  }

  .page-wrapper.with-sidebar[data-sidebar-hidden] :global(.text) {
    opacity: 0;
  }
</style>
