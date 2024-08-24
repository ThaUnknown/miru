<script>
  import { click } from '@/modules/click.js'
  import IPC from '@/modules/ipc.js'
  import { ExternalLink, User } from 'lucide-svelte'
  export let peers
  export let invite
  export let cleanup
</script>

<div class='d-flex flex-column py-20 root container card'>
  <div class='d-flex align-items-center w-full'>
    <h1 class='font-weight-bold mr-auto'>Lobby</h1>
    <button class='btn btn-success btn-lg ml-20' type='button' use:click={invite}>Invite To Lobby</button>
    <button class='btn btn-danger ml-20 btn-lg' type='button' use:click={cleanup}>Leave lobby</button>
  </div>
  {#each Object.values(peers) as peer}
    <div class='d-flex align-items-center pb-10'>
      {#if peer.user?.avatar?.medium}
        <img src={peer.user?.avatar?.medium} alt='avatar' class='w-50 h-50 img-fluid rounded' />
      {:else}
        <span class='w-50 h-50 anon d-flex align-items-center'><User size='4rem' /></span>
      {/if}
      <h4 class='my-0 pl-20 mr-auto line-height-normal'>{peer.user?.name || 'Anonymous'}</h4>
      {#if peer.user?.name}
        <span class='pointer text-primary d-flex align-items-center' use:click={() => IPC.emit('open', 'https://anilist.co/user/' + peer.user?.name)}><ExternalLink size='2.5rem' /></span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .anon {
    font-size: 5rem;
  }
</style>
