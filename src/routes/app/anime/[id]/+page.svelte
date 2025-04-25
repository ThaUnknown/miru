<script lang='ts'>
  import type { PageData } from './$types'

  import { Button } from '$lib/components/ui/button'
  import { dragScroll } from '$lib/modules/navigate'
  import { format, relation } from '$lib/modules/anilist'
  import { authAggregator } from '$lib/modules/auth'
  import EpisodesList from '$lib/components/EpisodesList.svelte'
  import { Load } from '$lib/components/ui/img'
  import { Threads } from '$lib/components/ui/forums'

  export let data: PageData

  $: anime = data.anime

  $: media = $anime.Media!

  $: relations = media.relations?.edges?.filter(edge => edge?.node?.type === 'ANIME')

  let showRelations = false

  function showMore () {
    showRelations = !showRelations
  }

  $: mediaID = media.id
  $: following = authAggregator.following(mediaID)

  $: eps = data.eps
</script>

{#if relations?.length}
  <div class='w-full'>
    <div class='flex justify-between items-center'>
      <div class='text-[20px] md:text-2xl font-bold'>Relations</div>
      {#if relations.length > 3}
        <Button variant='ghost' class='text-muted-foreground font-bold text-sm' on:click={showMore}>{showRelations ? 'Show Less' : 'Show More'}</Button>
      {/if}
    </div>
    <div class='md:w-full flex gap-5 overflow-x-scroll md:overflow-x-visible md:grid md:grid-cols-3 justify-items-center py-3' use:dragScroll>
      {#each showRelations ? relations : relations.slice(0, 3) as rel (rel?.node?.id)}
        {@const media = rel?.node}
        {#if media}
          <a class='select:scale-[1.02] select:shadow-lg scale-100 transition-all duration-200 shrink-0 ease-out focus-visible:ring-ring focus-visible:ring-1 rounded-md w-96 md:w-full h-[126px] bg-neutral-950 text-secondary-foreground select:bg-neutral-900 flex' style:-webkit-user-drag='none' href='/app/anime/{media.id}'>
            <div class='w-[90px] bg-image rounded-l-md shrink-0'>
              <Load src={media.coverImage?.medium} class='object-cover h-full w-full shrink-0 rounded-l-md' />
            </div>
            <div class='h-full grid px-3 items-center'>
              <div class='text-theme font-bold capitalize'>{relation(rel.relationType)}</div>
              <div class='line-clamp-2'>{media.title?.userPreferred ?? 'N/A'}</div>
              <div class='font-thin'>{format(media)}</div>
            </div>
          </a>
        {/if}
      {/each}
    </div>
  </div>
{/if}
<div class='w-full flex flex-col'>
  <div class='flex justify-between items-center'>
    <div class='text-[20px] md:text-2xl font-bold'>Episodes</div>
  </div>
  {#key mediaID}
    <EpisodesList {media} {eps} {following} />
  {/key}
</div>
<div class='w-full flex flex-col'>
  <div class='flex justify-between items-center'>
    <div class='text-[20px] md:text-2xl font-bold'>Threads</div>
  </div>
  {#key mediaID}
    <Threads {media} />
  {/key}
</div>
