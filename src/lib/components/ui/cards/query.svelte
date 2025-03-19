<script lang='ts'>
  import { SkeletonCard, SmallCard } from '$lib/components/ui/cards'
  import type { client } from '$lib/modules/anilist'

  export let query: ReturnType<typeof client.search>

  $: paused = query.isPaused$

  function deferredLoad (element: HTMLDivElement) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        query.resume()
        observer.unobserve(element)
      }
    }, { threshold: 0 })
    observer.observe(element)

    return { destroy () { observer.unobserve(element) } }
  }
</script>

{#if $paused}
  <div class='w-0 h-0' use:deferredLoad />
{/if}
{#if $query.fetching || $paused}
  {#each Array.from({ length: 50 }) as _, i (i)}
    <SkeletonCard />
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
    {#each $query.data.Page.media as media, i (media?.id ?? '#' + i)}
      {#if media}
        <SmallCard {media} />
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
      <SkeletonCard />
    {/each}
  {/if}
{:else}
  {#each Array.from({ length: 50 }) as _, i (i)}
    <SkeletonCard />
  {/each}
{/if}
