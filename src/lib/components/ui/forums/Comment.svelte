<script lang='ts'>
  import { Heart } from 'lucide-svelte'

  import Shadow from '../../Shadow.svelte'

  import type { ResultOf } from 'gql.tada'
  import type { CommentFrag } from '$lib/modules/anilist/queries'

  import * as Avatar from '$lib/components/ui/avatar'
  import { since } from '$lib/utils'

  export let comment: ResultOf<typeof CommentFrag>
  export let depth = 0

  let childComments: Array<ResultOf<typeof CommentFrag>>
  $: childComments = comment.childComments as Array<ResultOf<typeof CommentFrag>> | null ?? []
</script>

<div class='rounded-md {depth % 2 === 1 ? 'bg-black' : 'bg-neutral-950'} text-secondary-foreground flex w-full py-6 px-8 flex-col'>
  <div class='flex w-full justify-between text-xl'>
    <div class='font-bold mb-2 line-clamp-1 flex leading-none items-center'>
      <Avatar.Root class='inline-block size-8 mr-4'>
        <Avatar.Image src={comment.user?.avatar?.medium ?? ''} alt={comment.user?.name ?? 'N/A'} />
        <Avatar.Fallback>{comment.user?.name ?? 'N/A'}</Avatar.Fallback>
      </Avatar.Root>
      {comment.user?.name ?? 'N/A'}
    </div>
    <div class='flex ml-2 text-[12.8px] leading-none mt-0.5'>
      <Heart size='12' class='mr-1' />
      {comment.likeCount}
    </div>
  </div>
  <Shadow html={comment.comment ?? ''} class='my-3 text-muted-foreground leading-relaxed [&_*]:flex [&_*]:flex-col [&_br]:hidden w-full overflow-clip' />
  {#each childComments as comment (comment.id)}
    {#if comment}
      <div class='py-2'>
        <svelte:self {comment} depth={depth + 1} />
      </div>
    {/if}
  {/each}
  <div class='flex w-full justify-between mt-auto text-[9.6px]'>
    <div class='pt-2 flex items-end'>
      {since(new Date(comment.createdAt * 1000))}
    </div>
    <div class='ml-auto inline-flex flex-wrap gap-2 items-end'>
      Reply
    </div>
  </div>
</div>
