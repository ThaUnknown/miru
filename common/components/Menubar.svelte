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
      parse: (e) => e,
      stringify: (e) => e
    }
  })

  function minimize () {
    window.ipcRenderer.send('minimize')
  }

  function maximize () {
    window.ipcRenderer.send('maximize')
  }

  function closeapp () {
    window.ipcRenderer.send('closeapp')
  }
</script>

<div class='w-full z-101 navbar bg-transparent border-0 p-0 d-flex'>
  <div class='d-flex h-full draggable align-items-center text-center'>
    {#if window.version?.platform !== 'darwin'}
      <img src='./logo_filled.png' class='position-absolute w-50 h-50 m-10 pointer d-md-block d-none p-5' alt='ico' use:click={close} />
    {/if}
  </div>
  <div id='window-controls'>
    <button class='button' id='max-button' on:click={minimize}><svg class='svg-controls' height='12' role='img' viewBox='0 0 12 12'width='12'><rect fill='currentColor' height='1' width='10' x='1' y='6' /></svg></button>
    <button class='button' id='restore-button' on:click={maximize}><svg class='svg-controls' height='12' role='img' viewBox='0 0 12 12'width='12'><rect fill='none' height='9' stroke='currentColor' width='9' x='1.5' y='1.5' /></svg></button>
    <button class='button' id='close-button' on:click={closeapp}><svg class='svg-controls' height='12' role='img' viewBox='0 0 12 12'width='12'><polygon fill='currentColor' fill-rule='evenodd' points='11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1' /></svg></button>
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
    --navbar-height: 32px !important;
  }
  .z-101 {
    z-index: 101 !important;
  }
  .draggable {
    -webkit-app-region: drag;
    color: var(--dm-text-muted-color);
    font-size: 11.2px;
    width: calc(env(titlebar-area-width, 100%) - 1px);
  }
  img {
    top: 0;
    -webkit-app-region: no-drag;
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
    left: unset !important;
  }
  @media (pointer: none), (pointer: coarse) {
    .navbar {
      display: none !important;
      height: 0;
    }
  }
  #window-controls {
    display: grid;
    grid-template-columns: repeat(3, 46px);
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
  }

  #window-controls {
    -webkit-app-region: no-drag;
  }

  #window-controls .button {
    grid-row: 1 / span 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 46px;
    height: 32px;
    background: transparent;
    border: none;
    color: #ffffff;
  }

  #window-controls .button {
    user-select: none;
  }

  #window-controls .button:hover {
    background: rgba(24, 24, 28, 0.2);
  }

  #window-controls .button:active {
    background: rgba(24, 24, 28, 0.4);
  }

  #close-button:hover {
    background: #e81123 !important;
  }

  #close-button:active {
    background: #f1707a !important;
  }
  .svg-controls {
    width: 12px;
    height: 12px;
  }
</style>
