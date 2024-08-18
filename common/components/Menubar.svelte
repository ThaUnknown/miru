<script>
  import { persisted } from 'svelte-persisted-store'
  import { getContext } from 'svelte'
  import { click } from '@/modules/click.js'
  import IPC from '@/modules/ipc.js'

  export let page
  const view = getContext('view')
  function close () {
    $view = null
    page = 'home'
  }

  const debug = persisted('debug', '', {
    serializer: {
      parse: e => e,
      stringify: e => e
    }
  })
</script>

<div class='w-full z-101 navbar bg-transparent border-0 p-0 d-flex'>
  <div class='d-flex h-full draggable align-items-center text-center'>
    {#if window.version?.platform !== 'darwin'}
      <img src='./logo_filled.png' class='position-absolute w-50 h-50 m-10 pointer d-md-block d-none p-5' alt='ico' use:click={close} />
    {/if}
  </div>
  <div class='h-full bg-dark flex-grow-1'>
    {#if window.version?.platform === 'linux'}
      <div class='d-flex align-items-center close h-full' use:click={() => IPC.emit('close')}>
        <svg viewBox='0 0 24 24'>
          <path d='M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z' />
        </svg>
      </div>
    {/if}
  </div>
</div>
{#if $debug}
  <div class='ribbon right z-101 text-center position-fixed font-size-16 font-weight-bold'>Debug Mode!</div>
{/if}

<style>
  .ribbon {
    background: #f63220;
    box-shadow: 0 0 0 999px #f63220;
    clip-path: inset(0 -100%);
    pointer-events: none;
    min-width: 120px;
    inset: 0 auto auto 0;
    transform-origin: 100% 0;
    transform: translate(-29.3%) rotate(-45deg);
  }
  .navbar {
    --navbar-height: 28px !important;
  }
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
      display: none !important;
      height: 0;
    }
  }
</style>
