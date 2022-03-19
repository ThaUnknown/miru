<script context="module">
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  export let page = writable('home')
</script>

<script>
  import Sidebar from './lib/Sidebar.svelte'
  import Router from './lib/Router.svelte'
  import ViewAnime from './lib/ViewAnime.svelte'
  import RSSView from './lib/RSSView.svelte'
  import Menubar from './lib/Menubar.svelte'
  import Toasts from './lib/Toasts.svelte'

  let view = writable(null)
  setContext('view', view)

  let sidebar = writable(true)
  setContext('sidebar', sidebar)

  let gallery = writable(null)
  setContext('gallery', gallery)

</script>

<Toasts />
<ViewAnime />
<RSSView />
<div class="page-wrapper with-navbar with-sidebar with-transitions" data-sidebar-type="overlayed-sm-and-down" data-sidebar-hidden={$sidebar || null}>
  <div class="sticky-alerts" />
  <!-- svelte-ignore missing-declaration -->
  <div class="sidebar-overlay" on:click={() => ($sidebar = !$sidebar)} />
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
    --base-html-font-size-1600: 62.5%;
    --base-html-font-size-1920: 70%;
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
