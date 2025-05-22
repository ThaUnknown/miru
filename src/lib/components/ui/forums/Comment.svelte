<script lang='ts'>
  import Heart from 'lucide-svelte/icons/heart'
  import PenLine from 'lucide-svelte/icons/pen-line'
  import Reply from 'lucide-svelte/icons/reply'
  import Trash2 from 'lucide-svelte/icons/trash-2'

  import Shadow from '../../Shadow.svelte'
  import { Button, iconSizes } from '../button'
  import { Profile } from '../profile'

  import { Write } from '.'

  import type { CommentFrag } from '$lib/modules/anilist/queries'
  import type { ResultOf } from 'gql.tada'

  import { client } from '$lib/modules/anilist'
  import { since } from '$lib/utils'

  export let comment: ResultOf<typeof CommentFrag>
  export let depth = 0
  export let isLocked = false
  export let threadId: number
  export let rootCommentId = comment.id

  let childComments: Array<ResultOf<typeof CommentFrag>>
  $: childComments = comment.childComments as Array<ResultOf<typeof CommentFrag>> | null ?? []

  const viewer = client.viewer
</script>

<div class='rounded-md {depth % 2 === 1 ? 'bg-black' : 'bg-neutral-950'} text-secondary-foreground flex w-full py-4 px-6 flex-col'>
  <div class='flex w-full justify-between text-xl'>
    <div class='font-bold mb-2 line-clamp-1 flex leading-none items-center text-[16px]'>
      {#if comment.user}
        <Profile user={comment.user} class='size-5 mr-2' />
      {/if}
      {comment.user?.name ?? 'N/A'}
    </div>
    <div class='flex ml-2 text-[12.8px] leading-none '>
      <Heart size='12' class='mr-1' />
      {comment.likeCount}
    </div>
  </div>
  <Shadow html={comment.comment ?? ''} class='text-muted-foreground text-sm [&_*]:flex [&_*]:flex-col [&_br]:hidden w-full overflow-clip' />
  {#each childComments as comment (comment.id)}
    {#if comment}
      <div class='py-2'>
        <svelte:self {comment} depth={depth + 1} {isLocked} {threadId} {rootCommentId} />
      </div>
    {/if}
  {/each}
  <div class='flex w-full justify-between mt-auto text-[9.6px]'>
    <div class='flex items-center leading-none'>
      <Button size='icon-sm' variant='ghost' class='mr-1' on:click={() => client.toggleLike(comment.id, 'THREAD_COMMENT', !!comment.isLiked)} disabled={isLocked || !$viewer?.viewer}>
        <Heart fill={comment.isLiked ? 'currentColor' : 'transparent'} size={iconSizes['icon-sm']} />
      </Button>
      <Write parentCommentId={comment.id} {threadId} {isLocked} {rootCommentId}>
        <Reply size={iconSizes['icon-sm']} />
      </Write>
      {#if $viewer?.viewer?.id === comment.user?.id}
        <Write id={comment.id} {threadId} {isLocked} {rootCommentId} value={comment.comment ?? ''}>
          <PenLine size={iconSizes['icon-sm']} />
        </Write>
        <Button size='icon-sm' variant='ghost' class='mr-1' on:click={() => client.deleteComment(comment.id, rootCommentId)} disabled={isLocked || !$viewer?.viewer}>
          <Trash2 size={iconSizes['icon-sm']} />
        </Button>
      {/if}
      <span class='ml-2'>
        {since(new Date(comment.createdAt * 1000))}
      </span>
    </div>
  </div>
</div>
