<script>
  import { alToken } from '@/modules/settings.js'
  import { alRequest } from '@/modules/anilist.js'
  import { click } from '@/modules/click.js'
  export let media = null
  let following = null
  async function updateFollowing (media) {
    if (media) {
      following = null
      following = (await alRequest({ method: 'Following', id: media.id })).data?.Page?.mediaList
    }
  }
  $: updateFollowing(media)
</script>

{#if following?.length && alToken}
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
        <span class='material-symbols-outlined pointer text-primary font-size-18' use:click={() => window.IPC.emit('open', 'https://anilist.co/user/' + friend.user.name)}> open_in_new </span>
      </div>
    {/each}
  </div>
{/if}
