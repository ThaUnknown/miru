<script>
  export let peers
  export let invite
  export let cleanup
</script>

<div class='d-flex flex-column py-20 root container card'>
  <div class='d-flex align-items-center w-full'>
    <h1 class='font-weight-bold mr-auto'>Lobby</h1>
    <button class='btn btn-success btn-lg ml-20' type='button' on:click={invite}>Invite To Lobby</button>
    <button class='btn btn-danger ml-20 btn-lg' type='button' on:click={cleanup}>Leave lobby</button>
  </div>
  {#each Object.values(peers) as peer}
    <div class='d-flex align-items-center pb-10'>
      {#if peer.user?.avatar?.medium}
        <img src={peer.user?.avatar?.medium} alt='avatar' class='w-50 h-50 img-fluid rounded' />
      {:else}
        <span class='material-symbols-outlined w-50 h-50 anon'> person </span>
      {/if}
      <h4 class='my-0 pl-20 mr-auto'>{peer.user?.name || 'Anonymous'}</h4>
      {#if peer.user?.name}
        <span class='material-symbols-outlined pointer text-primary' on:pointerdown={() => window.IPC.emit('open', 'https://anilist.co/user/' + peer.user?.name)}> open_in_new </span>
      {/if}
      <!-- {#if state === 'host'}
        <span class='material-symbols-outlined ml-15 pointer text-danger' on:click={() => peer.peer.pc.close()}> logout </span>
      {/if} -->
    </div>
  {/each}
</div>

<style>
  .anon {
    font-size: 5rem;
  }
</style>
