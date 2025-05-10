<script lang='ts'>

  import { ChevronLeft, ChevronRight } from 'lucide-svelte'

  import Pagination from '../../Pagination.svelte'
  import { Button } from '../button'

  import { Comment } from './'

  import { client } from '$lib/modules/anilist'
  import { isMobile } from '$lib/utils'

  export let isLocked = false
  export let threadId: number

  let currentPage = 1

  $: comments = client.comments(threadId, currentPage)

  const perPage = 15
  $: count = $comments.data?.Page?.pageInfo?.total ?? 0
</script>

<Pagination {count} {perPage} bind:currentPage let:pages let:hasNext let:hasPrev let:range let:setPage siblingCount={1}>
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
  <div class='flex flex-row items-center justify-between w-full py-3'>
    <p class='text-center text-[13px] text-muted-foreground hidden md:block'>
      Showing <span class='font-bold'>{range.start + 1}</span> to <span class='font-bold'>{range.end}</span> of <span class='font-bold'>{count}</span> comments
    </p>
    <div class='w-full md:w-auto gap-2 flex items-center'>
      <Button size='icon' variant='ghost' on:click={() => setPage(currentPage - 1)} disabled={!hasPrev}>
        <ChevronLeft class='h-4 w-4' />
      </Button>
      {#if !$isMobile}
        {#each pages as { page, type } (page)}
          {#if type === 'ellipsis'}
            <span class='h-9 w-9 text-center'>...</span>
          {:else}
            <Button size='icon' variant={page === currentPage ? 'outline' : 'ghost'} on:click={() => setPage(page)}>
              {page}
            </Button>
          {/if}
        {/each}
      {:else}
        <p class='text-center text-[13px] text-muted-foreground w-full block md:hidden'>
          Showing <span class='font-bold'>{range.start + 1}</span> to <span class='font-bold'>{range.end}</span> of <span class='font-bold'>{count}</span> comments
        </p>
      {/if}
      <Button size='icon' variant='ghost' on:click={() => setPage(currentPage + 1)} disabled={!hasNext}>
        <ChevronRight class='h-4 w-4' />
      </Button>
    </div>
  </div>
</Pagination>
