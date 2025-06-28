<script lang='ts' context='module'>
  import { client, currentSeason, currentYear } from '$lib/modules/anilist'

  const query = client.search({ sort: ['POPULARITY_DESC'], perPage: 15, season: currentSeason, seasonYear: currentYear, statusNot: ['NOT_YET_RELEASED'] }, true)
  query.subscribe(() => undefined) // this is hacky as shit, but prevents query from re-running
</script>

<script lang='ts'>
  import { onDestroy } from 'svelte'
  import { get } from 'svelte/store'

  import FullBanner from './full-banner.svelte'
  import SkeletonBanner from './skeleton-banner.svelte'

  onDestroy(() => {
    query.pause()
  })

  if (get(query.isPaused$)) query.resume()
</script>

<div class='w-full h-[400px] relative'>
  <!-- really shit and hacky way of fixing scroll position jumping when banner changes height -->
  <div class='absolute top-0 transparent h-full opacity-0'>.</div>
  {#if $query.fetching}
    <SkeletonBanner />
  {/if}
  {#if $query.error}
    <div class='p-5 flex items-center justify-center w-full h-72'>
      <div>
        <div class='mb-1 font-bold text-4xl text-center '>
          Ooops!
        </div>
        <div class='text-lg text-center text-muted-foreground'>
          Looks like something went wrong!
        </div>
        <div class='text-lg text-center text-muted-foreground'>
          {$query.error.message}
        </div>
      </div>
    </div>
  {/if}
  {#if $query.data}
    {#if $query.data.Page?.media}
      <FullBanner mediaList={$query.data.Page.media} />
    {:else}
      <SkeletonBanner />
    {/if}
  {/if}
</div>
