<script>
  import Sidebar from './lib/Sidebar.svelte'
  import Router from './lib/Router.svelte'
  // import anitomyscript from 'anitomyscript'
  // const WebTorrent = require('webtorrent')
  // const wt = new WebTorrent()
  // console.log(wt)
  // anitomyscript('[GJM] Irozuku Sekai no Ashita kara - 08 [F0C587E8].mkv').then(console.log)
  let page = 'home'
</script>

<div class="page-wrapper with-sidebar" data-sidebar-type="full-height overlayed-sm-and-down" data-sidebar-hidden="hidden">
  <div class="sticky-alerts" />
  <div class="sidebar-overlay" onclick="halfmoon.toggleSidebar()" />
  <Sidebar bind:page />
  <Router bind:page />
</div>

<style>
  :root {
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
  /* sidebar patches */
  .page-wrapper.with-sidebar[data-sidebar-hidden] {
    --sidebar-width: var(--sidebar-minimised);
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
