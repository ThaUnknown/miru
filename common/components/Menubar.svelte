<script>
  import { getContext } from 'svelte'
  import { click } from '@/modules/click.js'
  import IPC from '@/modules/ipc.js'

  export let page
  const view = getContext('view')
  function close () {
    $view = null
    page = 'home'
  }
</script>

<div class='w-full z-101 navbar bg-transparent border-0 p-0 d-flex'>
  <div class='d-flex h-full draggable align-items-center text-center'>
    {#if window.version.platform !== 'darwin'}
      <img src='./logo.ico' class='position-absolute w-50 h-50 m-10 pointer d-md-block d-none' alt='ico' use:click={close} />
    {/if}
  </div>
  <div class='h-full bg-dark flex-grow-1'>
    {#if window.version.platform === 'linux'}
      <div class='d-flex align-items-center close h-full' use:click={() => IPC.emit('close')}>
        <svg viewBox='0 0 24 24'>
          <path d='M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z' />
        </svg>
      </div>
    {/if}
  </div>
</div>

<style>
  .z-101 {
    z-index: 101 !important
  }
  .draggable {
    -webkit-app-region: drag;
    color: var(--dm-text-muted-color);
    font-size: 11.2px;
    width: calc(env(titlebar-area-width, 100%) - 1px);
  }
  img {
    top: 0;
    -webkit-app-region: no-drag
  }
  .close {
    width: 40px;
  }
  .close:hover {
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
  .navbar {
    left: unset !important
  }
  @media (pointer: none), (pointer: coarse) {
    .navbar {
      display: none;
    }
  }
</style>
