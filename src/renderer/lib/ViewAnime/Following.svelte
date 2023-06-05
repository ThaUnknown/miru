<script>
import { alToken } from '../Settings.svelte'
import { alRequest } from '@/modules/anilist.js'
export let media = null
let following = null
async function updateFollowing (media) {
  if (media) {
    following = null
    following = (await alRequest({ method: 'Following', id: media.id })).data?.Page?.mediaList
  }
}
$: updateFollowing(media)
const statusMap = {
  CURRENT: 'Watching',
  PLANNING: 'Planning',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
  PAUSED: 'Paused',
  REPEATING: 'Repeating'
}
</script>

{#if following?.length && alToken}
  <h2 class='font-weight-bold text-white mt-20'>Following</h2>
  <div class='card m-0 px-20 pt-15 pb-5 flex-column'>
    {#each following as friend}
      <div class='d-flex align-items-center w-full pb-10 px-10'>
        <img src={friend.user.avatar.medium} alt='avatar' class='w-30 h-30 img-fluid rounded cover-img' />
        <span class='my-0 pl-10 mr-auto text-truncate'>{friend.user.name}</span>
        <span class='my-0 px-10 text-capitalize'>{statusMap[friend.status]}</span>
        <span class='material-icons pointer text-primary font-size-18' on:click={() => window.IPC.emit('open', 'https://anilist.co/user/' + friend.user.name)}> open_in_new </span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .h-30 {
    height: 3rem
  }
  .w-30 {
    width: 3rem
  }
  .card {
    background-color: var(--dm-button-bg-color) !important;
    background-image: var(--dm-button-bg-image) !important;
    box-shadow: var(--dm-button-box-shadow) !important;
  }

  .cover-img {
    object-fit: cover;
  }
</style>
