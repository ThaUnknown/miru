<script lang='ts'>
  import { Comment } from './'

  import type { client } from '$lib/modules/anilist'

  export let comments: ReturnType<typeof client.comments>
</script>

{#each $comments.data?.Page?.threadComments ?? [] as comment, i (comment?.id ?? i)}
  {#if comment}
    <Comment {comment} />
  {/if}
{/each}
