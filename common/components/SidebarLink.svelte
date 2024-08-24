<script>
  import { click } from '@/modules/click.js'

  let _click = () => {}
  export { _click as click }
  export let image = ''
  export let page
  export let _page = ''
  export let css = ''
  export let text = ''
  export let icon = ''
</script>

<div class='sidebar-link sidebar-link-with-icon pointer overflow-hidden {css}'
  use:click={_click}>
  <span class='text-nowrap d-flex align-items-center w-full h-full'>
    {#if image}
      <span class='rounded d-flex'>
        <img src={image} class='h-30 rounded' alt='logo' />
      </span>
      <span class='text ml-20'>{text}</span>
    {:else}
      <span class='rounded d-flex'>
        <slot active={page === _page}>{icon}</slot>
      </span>
      <span class='text ml-20'>{text}</span>
    {/if}
  </span>
</div>

<style>
  .text {
    opacity: 1;
    transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar-link > span {
    color: #fff;
    border-radius: 0.3rem;
  }

  .sidebar-link > span > span:nth-child(1) {
    color: #fff;
    transition: background .8s cubic-bezier(0.25, 0.8, 0.25, 1), color .8s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .sidebar-link:hover > span > span:nth-child(1) {
    background: #fff;
    color: var(--dark-color);
  }

  .sidebar-link {
    width: 100%;
    font-size: 1.4rem;
    padding: 0.75rem 1.5rem;
    height: 5.5rem;
  }

  .sidebar-link img {
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
