<script context='module'>
  import { writable } from 'svelte/store'
  export const title = writable('Miru')
</script>

<div class='w-full navbar border-0 bg-dark position-relative p-0'>
  <div class='menu-shadow shadow-lg position-absolute w-full h-full z-0' />
  <div class='w-full h-full bg-dark z-10 d-flex'>
    <div class='d-flex w-full h-full draggable align-items-center text-center'>
      {#if window.version.platform !== 'darwin'}
        <img src='./logo.ico' alt='ico' />
        {$title}
      {:else}
        <div class='text-center w-full'>
          {$title}
        </div>
      {/if}
    </div>
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
</style>
