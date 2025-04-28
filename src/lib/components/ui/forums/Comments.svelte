<script lang='ts'>
  import { Comment } from './'

  import type { client } from '$lib/modules/anilist'

  export let comments: ReturnType<typeof client.comments>

  export let isLocked = false
  export let threadId: number
</script>

{#if $comments.fetching}
  {#each Array.from({ length: 4 }) as _, i (i)}
    <div class='px-4 py-[18px] shrink-0 h-28 w-full bg-neutral-950 rounded-md flex flex-col'>
      <div class='mb-3 h-2 w-[150px] bg-primary/5 animate-pulse rounded' />
      <div class='bg-primary/5 animate-pulse rounded h-1.5 w-28 mb-3' />
      <div class='bg-primary/5 animate-pulse rounded h-1.5 w-20' />
      <div class='mt-auto bg-primary/5 animate-pulse rounded h-2 w-24' />
    </div>
  {/each}
{:else if $comments.error}
  <div class='p-5 flex items-center justify-center w-full h-80'>
    <div>
      <div class='mb-1 font-bold text-4xl text-center '>
        Ooops!
      </div>
      <div class='text-lg text-center text-muted-foreground'>
        Looks like something went wrong!
      </div>
      <div class='text-lg text-center text-muted-foreground'>
        {$comments.error.message}
      </div>
    </div>
  </div>
{:else}
  {#each $comments.data?.Page?.threadComments ?? [] as comment, i (comment?.id ?? i)}
    {#if comment}
      <Comment {comment} {isLocked} {threadId} />
    {/if}
  {:else}
    <div class='p-5 flex items-center justify-center w-full h-80'>
      <div>
        <div class='mb-1 font-bold text-4xl text-center '>
          Ooops!
        </div>
        <div class='text-lg text-center text-muted-foreground'>
          Looks like there's nothing here yet!
        </div>
      </div>
    </div>
  {/each}
{/if}
