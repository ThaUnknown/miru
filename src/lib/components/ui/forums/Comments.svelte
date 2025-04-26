<script lang='ts'>
  import { Comment } from './'

  import type { client } from '$lib/modules/anilist'

  export let comments: ReturnType<typeof client.comments>

  export let isLocked = false
  export let threadId: number
</script>

{#each $comments.data?.Page?.threadComments ?? [] as comment, i (comment?.id ?? i)}
  {#if comment}
    <Comment {comment} {isLocked} {threadId} />
  {/if}
{/each}
