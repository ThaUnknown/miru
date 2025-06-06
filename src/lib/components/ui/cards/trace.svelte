<script lang='ts'>
  import type { client } from '$lib/modules/anilist'
  import type { TraceAnime } from '$lib/utils'

  import { EpisodeCard, SkeletonTraceCard } from '$lib/components/ui/cards'

  export let query: ReturnType<typeof client.search>

  export let trace: TraceAnime[]

  $: o = trace.map(t => t.anilist)
</script>

{#if $query.fetching}
  {#each Array.from({ length: 50 }) as _, i (i)}
    <SkeletonTraceCard />
  {/each}
{:else if $query.error}
  <div class='p-5 flex items-center justify-center w-full h-80'>
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
{:else if $query.data}
  {#if $query.data.Page?.media}
    {#each $query.data.Page.media.sort((a, b) => o.indexOf(b?.id ?? -1) < o.indexOf(a?.id ?? -1) ? 1 : -1) as media, i (media?.id ?? '#' + i)}
      {#if media}
        {@const traceItem = trace.find(t => t.anilist === media.id)}
        <EpisodeCard {media} trace={traceItem} />
      {/if}
    {:else}
      <div class='p-5 flex items-center justify-center w-full h-80'>
        <div>
          <div class='mb-1 font-bold text-4xl text-center '>
            Ooops!
          </div>
          <div class='text-lg text-center text-muted-foreground'>
            Looks like there's nothing here.
          </div>
        </div>
      </div>
    {/each}
  {:else}
    {#each Array.from({ length: 50 }) as _, i (i)}
      <SkeletonTraceCard />
    {/each}
  {/if}
{:else}
  {#each Array.from({ length: 50 }) as _, i (i)}
    <SkeletonTraceCard animate={false} />
  {/each}
{/if}
