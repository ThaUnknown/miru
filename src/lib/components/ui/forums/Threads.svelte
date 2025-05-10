<script lang='ts'>
  import { ChevronLeft, ChevronRight, Eye, Heart, MessagesSquare, Lock } from 'lucide-svelte'

  import Pagination from '../../Pagination.svelte'
  import { Button } from '../button'
  import { Profile } from '../profile'

  import { client, type Media } from '$lib/modules/anilist'
  import { isMobile, since } from '$lib/utils'

  export let media: Media

  let currentPage = 1

  $: threads = client.threads(media.id, currentPage)

  const perPage = 16
  $: count = $threads.data?.Page?.pageInfo?.total ?? 0
</script>

<Pagination {count} {perPage} bind:currentPage let:pages let:hasNext let:hasPrev let:range let:setPage siblingCount={1}>
  <div class='pt-3'>
    <div class='grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(500px,1fr))] place-items-center gap-x-10 gap-y-7 justify-center align-middle'>
      {#if $threads.fetching}
        {#each Array.from({ length: 4 }) as _, i (i)}
          <div class='px-4 py-[18px] shrink-0 h-[75px] w-full bg-neutral-950 rounded-md flex flex-col'>
            <div class='bg-primary/5 animate-pulse rounded h-2 w-28' />
            <div class='mt-auto bg-primary/5 animate-pulse rounded h-2 w-20' />
          </div>
        {/each}
      {:else if $threads.error}
        <div class='p-5 flex items-center justify-center w-full h-80'>
          <div>
            <div class='mb-1 font-bold text-4xl text-center '>
              Ooops!
            </div>
            <div class='text-lg text-center text-muted-foreground'>
              Looks like something went wrong!
            </div>
            <div class='text-lg text-center text-muted-foreground'>
              {$threads.error.message}
            </div>
          </div>
        </div>
      {:else}
        {#each $threads.data?.Page?.threads ?? [] as thread, i (thread?.id ?? i)}
          {#if thread}
            <a href='./thread/{thread.id}' class= 'select:scale-[1.05] select:shadow-lg scale-100 transition-[transform,box-shadow] duration-200 shrink-0 ease-out focus-visible:ring-ring focus-visible:ring-1 rounded-md bg-neutral-950 text-secondary-foreground select:bg-neutral-900 flex w-full max-h-28 relative overflow-hidden cursor-pointer'>
              <div class='flex-grow py-3 px-4 flex flex-col'>
                <div class='flex w-full justify-between text-[12.8px]'>
                  <div class='font-bold mb-2 line-clamp-1'>
                    {thread.title ?? 'Thread ' + (thread.id)}
                  </div>
                  <div class='flex ml-2 leading-none mt-0.5'>
                    <Heart size='12' class='mr-1' />
                    {thread.likeCount}
                    <Eye size='12' class='mr-1 ml-2' />
                    {thread.viewCount ?? 0}
                    <MessagesSquare size='12' class='mr-1 ml-2' />
                    {thread.replyCount ?? 0}
                    {#if thread.isLocked}
                      <Lock size='12' class='mr-1 ml-2 text-red-500' />
                    {/if}
                  </div>
                </div>
                <div class='flex w-full justify-between mt-auto text-[9.6px]'>
                  <div class='pt-2 flex items-end'>
                    {#if thread.user}
                      <Profile user={thread.user} class='size-4 mr-2' />
                    {/if}
                    {since(new Date(thread.createdAt * 1000))}
                  </div>
                  <div class='ml-auto inline-flex flex-wrap gap-2 items-end'>
                    {#each thread.categories?.filter(category => category?.name !== 'Anime') ?? [] as category, i (category?.id ?? i)}
                      <div class='rounded px-3 py-0.5 font-bold flex items-center' style:background={media.coverImage?.color ?? '#27272a'}>
                        <div class='text-contrast'>
                          {category?.name}
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            </a>
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
    </div>
  </div>
  <div class='flex flex-row items-center justify-between w-full py-3'>
    <p class='text-center text-[13px] text-muted-foreground hidden md:block'>
      Showing <span class='font-bold'>{range.start + 1}</span> to <span class='font-bold'>{range.end}</span> of <span class='font-bold'>{count}</span> threads
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
          Showing <span class='font-bold'>{range.start + 1}</span> to <span class='font-bold'>{range.end}</span> of <span class='font-bold'>{count}</span> threads
        </p>
      {/if}
      <Button size='icon' variant='ghost' on:click={() => setPage(currentPage + 1)} disabled={!hasNext}>
        <ChevronRight class='h-4 w-4' />
      </Button>
    </div>
  </div>
</Pagination>
