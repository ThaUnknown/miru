<script lang='ts'>
  import { ChevronLeft, Eye, MessagesSquare } from 'lucide-svelte'

  import type { PageData } from './$types'

  import * as Avatar from '$lib/components/ui/avatar'
  import { since } from '$lib/utils'
  import { Button } from '$lib/components/ui/button'
  import { Comment } from '$lib/components/ui/forums'
  import { ToggleLike } from '$lib/modules/anilist/queries'
  import { client } from '$lib/modules/anilist'
  import Shadow from '$lib/components/Shadow.svelte'

  export let data: PageData

  $: threadStore = data.thread
  $: thread = $threadStore.Thread!

  $: commentsStore = data.comments
  $: comments = $commentsStore.Page

  $: anime = data.anime
  $: media = $anime.Media!

  const x = async () => await client.client.mutation(ToggleLike, { id: thread.id, type: 'THREAD' })
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
        <Avatar.Image src={thread.user?.avatar?.medium ?? ''} alt={thread?.user?.name ?? 'N/A'} />
        <Avatar.Fallback>{thread.user?.name ?? 'N/A'}</Avatar.Fallback>
      </Avatar.Root>
      {thread.user?.name ?? 'N/A'}
    </div>
    <div class='flex ml-2 text-[12.8px] leading-none mt-0.5'>
      <Eye size='12' class='mr-1' />
      {thread.viewCount ?? 0}
      <MessagesSquare size='12' class='mr-1 ml-2' />
      {thread.replyCount ?? 0}
    </div>
  </div>
  <Shadow html={thread.body ?? ''} class='my-3 text-muted-foreground leading-relaxed [&_*]:flex [&_*]:flex-col [&_br]:hidden overflow-clip' />
  <div class='flex w-full justify-between mt-auto text-[9.6px]'>
    <div class='pt-2 flex items-end'>
      {since(new Date((thread.createdAt ?? 0) * 1000))}
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
{#each comments?.threadComments ?? [] as comment, i (comment?.id ?? i)}
  {#if comment}
    <Comment {comment} />
  {/if}
{/each}
