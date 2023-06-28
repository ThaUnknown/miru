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
  import 'quartermoon/css/quartermoon-variables.css'
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
    --sidebar-minimised: 7rem;
    --sidebar-width: 7rem;
    --dark-color-base-hue: 220deg !important;
    --dark-color-base-saturation: 10% !important;
    --dark-color-hsl: var(--dark-color-base-hue), var(--dark-color-base-saturation), 10% !important;
    --dark-color-light: #25292F !important;
    --dm-shadow: 0px 4px 7px rgba(0, 0, 0, 0.25);
    --dm-input-border-color: none;
    --gray-color-light: hsl(var(--gray-color-light-hsl));
    --gray-color-light-hsl: var(--gray-color-base-hue), 10%, 28%;
    --gray-color-base-hue: 216;
    --secondary-color: #fff;
    --secondary-color-light: #ddd;
  }
  :global(.material-symbols-outlined) {
    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 64;
  }
  :global(.filled) {
    font-variation-settings: 'FILL' 1;
  }
  :global(.pointer) {
    cursor: pointer;
  }
  :global(.h-10) {
    height: 1rem !important;
  }
  :global(body) {
    scroll-behavior: smooth;
    overscroll-behavior: none;
    user-select: none;
    font-family: 'Nunito'
  }
  :global(.font-weight-very-bold){
    font-weight: 900;
  }
  :global(.bg-black){
    background: #000;
  }
  :global(img) {
    -webkit-user-drag: none;
  }
  :global(.select-all) {
    user-select: all;
  }
  :global(img[src='']) {
    display: none;
  }
  :global(::-webkit-inner-spin-button) {
    display: none;
  }
  :global(*:focus-visible){
    outline: none;
    box-shadow: var(--dm-button-primary-box-shadow-focus) !important;
  }

  :global(.modal:focus-visible){
    box-shadow: none !important;
  }

  :global(.root) {
    animation: 0.3s ease 0s 1 root-load-in;
  }
  .content-wrapper {
    will-change: width;
    top: 0 !important;
  }
  :global(.nav-hidden) > .content-wrapper {
    left: 0 !important;
    width: 100% !important;
  }
  @keyframes -global-root-load-in {
    from {
      bottom: -1.2rem;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      transform: scale(1);
    }
  }

  @keyframes -global-load {
    from {
      left: -15rem;
    }

    to {
      left: 100%;
    }
  }
  @keyframes -global-load-in {
    from {
      bottom: -1.2rem;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      transform: scale(1);
    }
  }

  :global(.skeloader) {
    position: relative;
    overflow: hidden;
  }

  :global(.skeloader::before) {
    will-change: left;
    content: '';
    position: absolute;
    height: 100%;
    width: 15rem;
    background: linear-gradient(to right, transparent 0%, #17191c 50%, transparent 100%);
    animation: load 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-wrapper > .content-wrapper {
    left: var(--sidebar-minimised);
    width: calc(100% - var(--sidebar-minimised));
  }
</style>
