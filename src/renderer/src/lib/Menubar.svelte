<script context='module'>
  import { writable } from 'svelte/store'
  export const title = writable('Miru')
</script>

<div class='w-full navbar border-0 bg-dark position-relative p-0'>
  <div class='menu-shadow shadow-lg position-absolute w-full h-full z-0' />
  <div class='w-full h-full bg-dark z-10 d-flex'>
    {#if window.version.platform !== 'darwin'}
      <div class='d-flex w-full draggable h-full align-items-center'>
        <img src='./logo.ico' alt='ico' />
        {$title}
      </div>
      <div class='controls d-flex h-full pointer'>
        <div class='d-flex align-items-center' on:click={() => window.IPC.emit('minimize')}>
          <svg viewBox='0 0 24 24'>
            <path d='M19 13H5v-2h14v2z' />
          </svg>
        </div>
        <div class='d-flex align-items-center' on:click={() => window.IPC.emit('maximize')}>
          <svg viewBox='0 0 24 24'>
            <path d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z' />
          </svg>
        </div>
        <div class='d-flex align-items-center close' on:click={() => window.IPC.emit('close')}>
          <svg viewBox='0 0 24 24'>
            <path d='M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z' />
          </svg>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .draggable {
    -webkit-app-region: drag;
    color: var(--dm-text-muted-color);
    font-size: 11.2px;
  }
  .menu-shadow {
    left: var(--sidebar-width);
    transition: left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  }
  img {
    margin: 0 8px;
    height: 16px;
    width: 16px;
  }
  .controls > div {
    width: 40px;
    transition: background 0.15s ease;
  }
  .controls > div:hover {
    background-color: #ffffff33;
    color: #fff;
  }
  .controls > .close:hover {
    background-color: #e81123 !important;
  }
  svg {
    width: 18px;
    height: 18px;
    width: 100%;
  }
  path {
    fill: currentColor;
  }
</style>
