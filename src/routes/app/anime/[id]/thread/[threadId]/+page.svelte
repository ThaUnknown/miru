<script lang='ts'>
  import { ChevronLeft, Eye, MessagesSquare, Heart } from 'lucide-svelte'
  import { onMount } from 'svelte'

  import type { PageData } from './$types'

  import * as Avatar from '$lib/components/ui/avatar'
  import { since } from '$lib/utils'
  import { Button } from '$lib/components/ui/button'
  import { Comments } from '$lib/components/ui/forums'
  import { ToggleLike } from '$lib/modules/anilist/queries'
  import { client } from '$lib/modules/anilist'
  import Shadow from '$lib/components/Shadow.svelte'

  export let data: PageData

  $: threadStore = data.thread
  $: thread = $threadStore.Thread!

  let page = 0

  let commentQueries: Array<ReturnType<typeof client.comments>> = []

  function loadComments () {
    page += 1
    commentQueries[page - 1] = client.comments(thread.id, page)
    // eslint-disable-next-line no-self-assign
    commentQueries = commentQueries
  }

  onMount(loadComments)

  $: anime = data.anime
  $: media = $anime.Media!

  const x = async () => await client.client.mutation(ToggleLike, { id: thread.id, type: 'THREAD' })

  $: latestQuery = commentQueries[commentQueries.length - 1]
  $: hasMore = $latestQuery?.data?.Page?.pageInfo?.hasNextPage ?? false
</script>

<div class='flex items-center w-full'>
  <Button size='icon' variant='ghost' href='/app/anime/{media.id}' class='mr-2'>
    <ChevronLeft class='h-4 w-4' />
  </Button>
  <div class='text-[20px] md:text-2xl font-bold line-clamp-1'>{thread.title ?? 'No thread title...'}</div>
</div>
<div class='rounded-md bg-neutral-950 text-secondary-foreground flex w-full mb-10 py-6 px-8 flex-col'>
  <div class='flex w-full justify-between text-xl'>
    <div class='font-bold mb-2 line-clamp-1 flex leading-none items-center'>
      <Avatar.Root class='inline-block size-8 mr-4'>
        <Avatar.Image src={thread.user?.avatar?.medium ?? ''} alt={thread.user?.name ?? 'N/A'} />
        <Avatar.Fallback>{thread.user?.name ?? 'N/A'}</Avatar.Fallback>
      </Avatar.Root>
      {thread.user?.name ?? 'N/A'}
    </div>
    <div class='flex ml-2 text-[12.8px] leading-none mt-0.5'>
      <Heart size='12' class='mr-1' />
      {thread.likeCount}
      <Eye size='12' class='mr-1 ml-2' />
      {thread.viewCount ?? 0}
      <MessagesSquare size='12' class='mr-1 ml-2' />
      {thread.replyCount ?? 0}
    </div>
  </div>
  <Shadow html={thread.body ?? ''} class='my-3 text-muted-foreground leading-relaxed [&_*]:flex [&_*]:flex-col [&_br]:hidden overflow-clip' />
  <div class='flex w-full justify-between mt-auto text-[9.6px]'>
    <div class='pt-2 flex items-end'>
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

<div class='flex justify-between items-center w-full text-[20px] md:text-2xl font-bold'>
  {thread.replyCount} Replies
</div>
{#each commentQueries as comments, i (i)}
  <Comments bind:comments />
{/each}
{#if hasMore}
  <Button size='lg' class='w-full font-bold' on:click={loadComments}>Load more comments</Button>
{/if}
