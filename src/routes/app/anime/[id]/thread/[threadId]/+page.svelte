<script lang='ts'>
  import { ChevronLeft, Eye, MessagesSquare, Heart, Lock, Reply } from 'lucide-svelte'

  import type { PageData } from './$types'

  import Shadow from '$lib/components/Shadow.svelte'
  import { Button, iconSizes } from '$lib/components/ui/button'
  import { Comments, Write } from '$lib/components/ui/forums'
  import { Profile } from '$lib/components/ui/profile'
  import { client } from '$lib/modules/anilist'
  import { since } from '$lib/utils'

  export let data: PageData

  $: threadStore = data.thread
  $: thread = $threadStore.Thread!

  $: anime = data.anime
  $: media = $anime.Media!

  const viewer = client.viewer
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
      {#if thread.user}
        <Profile user={thread.user} class='size-8 mr-4' />
        {thread.user.name}
      {/if}
    </div>
    <div class='flex ml-2 text-[12.8px] leading-none mt-0.5'>
      <Heart size='12' class='mr-1' fill={thread.isLiked ? 'currentColor' : 'transparent'} />
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
  <Shadow html={thread.body ?? ''} class='my-3 text-muted-foreground [&_*]:flex [&_*]:flex-col [&_br]:hidden overflow-clip' />
  <div class='flex w-full justify-between mt-auto text-[9.6px]'>
    <div class='flex items-center leading-none'>
      <Button size='icon-sm' variant='ghost' class='mr-1' on:click={() => client.toggleLike(thread.id, 'THREAD', !!thread.isLiked)} disabled={!!thread.isLocked || !$viewer?.viewer}>
        <Heart fill={thread.isLiked ? 'currentColor' : 'transparent'} size={iconSizes['icon-sm']} />
      </Button>
      <Write threadId={thread.id} isLocked={!!thread.isLocked}>
        <Reply size={iconSizes['icon-sm']} />
      </Write>
      <span class='ml-2'>
        {since(new Date(thread.createdAt * 1000))}
      </span>
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
<Comments isLocked={!!thread.isLocked} threadId={thread.id} />
