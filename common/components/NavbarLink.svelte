<script>
  import { click } from '@/modules/click.js'

  let _click = () => {}
  export { _click as click }
  export let image = ''
  export let page
  export let _page = ''
  export let css = ''
  export let icon = ''
</script>

<div
  class='navbar-link navbar-link-with-icon pointer overflow-hidden {css}'
  use:click={_click}>
  {#if image}
    <span class='material-symbols-outlined rounded' class:filled={page === _page}>
      <img src={image} class='h-30 rounded' alt='logo' />
    </span>
  {:else}
    <span class='material-symbols-outlined rounded' class:filled={page === _page}>{icon}</span>
  {/if}
</div>

<style>
  @keyframes glow {
    from {
      text-shadow: 0 0 2rem #fa68b6;
    }
    to {
      text-shadow: 0 0 1rem #fa68b6;
    }
  }
  .animate .donate .material-symbols-outlined {
    animation: glow 1s ease-in-out infinite alternate;
  }
  .donate:hover .material-symbols-outlined {
    background: #fff;
    color: #fa68b6 !important;
  }
  .donate .material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
    color: #fa68b6;
    text-shadow: 0 0 1rem #fa68b6;
  }
  /* .sidebar-menu {
    padding-top: 10rem;
  } */
  .text {
    opacity: 1;
    transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .navbar-link > span {
    color: #fff;
    border-radius: 0.3rem;
  }

  .material-symbols-outlined {
    color: #fff;
    transition: background .8s cubic-bezier(0.25, 0.8, 0.25, 1), color .8s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .navbar-link:hover > span {
    background: #fff;
    color: var(--dark-color);
  }

  .navbar-link {
    font-size: 1.4rem;
    padding: 0.75rem;
    height: 5.5rem;
  }

  .material-symbols-outlined {
    font-size: 2.2rem;
    min-width: 4rem;
    width: 4rem;
    height: 4rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .navbar-link img {
    font-size: 2.2rem;
    width: 3rem;
    height: 3rem;
    margin: 0.5rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  img {
    margin-right: var(--sidebar-brand-image-margin-right);
  }
</style>
