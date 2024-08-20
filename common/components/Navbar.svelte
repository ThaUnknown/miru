<script>
  import { getContext } from 'svelte'
  import { media } from '../views/Player/MediaHandler.svelte'
  import { click } from '@/modules/click.js'
  import IPC from '@/modules/ipc.js'
  import NavbarLink from './NavbarLink.svelte'
  const view = getContext('view')
  export let page
  function close () {
    $view = null
    page = 'home'
  }
</script>

<nav class='navbar navbar-fixed-bottom d-block d-md-none border-0 bg-dark'>
  <div class='navbar-menu h-full d-flex flex-row justify-content-center align-items-center m-0 pb-5' class:animate={page !== 'player'}>
    <img src='./logo_filled.png' class='w-50 h-50 m-10 pointer p-5' alt='ico' use:click={close} />
    <NavbarLink click={() => { page = 'search'; if ($view) $view = null }} _page='search' css='ml-auto' icon='search' {page} />
    <NavbarLink click={() => { page = 'schedule' }} _page='schedule' icon='schedule' {page} />
    {#if $media?.media}
      <NavbarLink click={() => { $view = $media.media }} icon='queue_music' {page} />
    {/if}
    <NavbarLink click={() => { page = 'watchtogether' }} _page='watchtogether' icon='groups' {page} />
    <NavbarLink click={() => { IPC.emit('open', 'https://github.com/sponsors/ThaUnknown/') }} icon='favorite' css='ml-auto donate' {page} />
    <NavbarLink click={() => { page = 'settings' }} _page='settings' icon='settings' {page} />
  </div>
</nav>
