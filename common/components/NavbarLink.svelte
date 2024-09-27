<script>
  import { click } from '@/modules/click.js'

  let _click = () => {}
  export { _click as click }
  export let page
  export let _page = ''
  export let css = ''
  export let icon = ''
  export let nowPlaying = false
  export let overlay = ''
</script>

<div
  class='navbar-link navbar-link-with-icon pointer overflow-hidden {css}'
  use:click={() => { if (!icon.includes("favorite")) { window.dispatchEvent(new Event('overlay-check')) }  _click() } }>

  <span class='rounded d-flex'>
    <slot active={(page === _page && overlay !== 'active') || (overlay === 'active' && nowPlaying)}>{icon}</slot>
  </span>
</div>

<style>

  .navbar-link > span {
    color: #fff;
    border-radius: 0.3rem;
  }

  .navbar-link > span {
    color: #fff;
    transition: background .8s cubic-bezier(0.25, 0.8, 0.25, 1), color .8s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .navbar-link:active > span {
    background: #fff;
    color: var(--dark-color);
  }
  .navbar-link {
    font-size: 1.4rem;
    padding: 0.75rem;
    height: 5.5rem;
  }
</style>
