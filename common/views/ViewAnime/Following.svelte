<script>
  import { anilistClient } from '@/modules/anilist.js'
  import { click } from '@/modules/click.js'
  import IPC from '@/modules/ipc.js'
  import { ExternalLink } from 'lucide-svelte'

  /** @type {import('@/modules/al.d.ts').Media} */
  export let media
  $: following = anilistClient.userID?.viewer?.data?.Viewer && anilistClient.following({ id: media.id })
</script>

{#await following then res}
  {@const following = res?.data?.Page?.mediaList}
  {#if following?.length}
    <div class='w-full d-flex flex-row align-items-center pt-20 mt-10'>
      <hr class='w-full' />
      <div class='font-size-18 font-weight-semi-bold px-20 text-white'>Following</div>
      <hr class='w-full' />
    </div>
    <div class='px-15 pt-5 flex-column'>
      {#each following as friend}
        <div class='d-flex align-items-center w-full pt-20 font-size-16'>
          <img src={friend.user.avatar.medium} alt='avatar' class='w-50 h-50 img-fluid rounded cover-img' />
          <span class='my-0 pl-20 mr-auto text-truncate'>{friend.user.name}</span>
          <span class='my-0 px-10 text-capitalize'>{friend.status.toLowerCase()}</span>
          <span class='pointer text-primary d-flex align-items-center' use:click={() => IPC.emit('open', 'https://anilist.co/user/' + friend.user.name)}>
            <ExternalLink size='1.8rem' />
          </span>
        </div>
      {/each}
    </div>
  {/if}
{/await}
