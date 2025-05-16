<script context='module' lang='ts'>
  export let fillerEpisodes: Record<number, number[] | undefined> = {}

  fetch('https://raw.githubusercontent.com/ThaUnknown/filler-scrape/master/filler.json').then(async res => {
    fillerEpisodes = await res.json()
  })
</script>

<script lang='ts'>
  import ChevronLeft from 'lucide-svelte/icons/chevron-left'
  import ChevronRight from 'lucide-svelte/icons/chevron-right'
  import Play from 'lucide-svelte/icons/play'

  import Pagination from './Pagination.svelte'
  import { Button } from './ui/button'
  import { Load } from './ui/img'
  import { Profile } from './ui/profile'

  import type { EpisodesResponse } from '$lib/modules/anizip/types'

  import { searchStore } from '$lib'
  import { episodes as _episodes, dedupeAiring, episodeByAirDate, notes, type Media } from '$lib/modules/anilist'
  import { authAggregator, list, progress } from '$lib/modules/auth'
  import { click, dragScroll } from '$lib/modules/navigate'
  import { cn, isMobile, since } from '$lib/utils'

  export let eps: EpisodesResponse | null
  export let media: Media

  $: episodeCount = Math.max(_episodes(media) ?? 0, eps?.episodeCount ?? 0)

  $: ({ episodes, specialCount } = eps ?? {})

  const alSchedule: Record<number, Date | undefined> = {}

  $: {
    for (const { a: airingAt, e: episode } of dedupeAiring(media)) {
      alSchedule[episode] = new Date(airingAt * 1000)
    }
  }

  $: episodeList = media && Array.from({ length: episodeCount }, (_, i) => {
    const episode = i + 1

    const airingAt = alSchedule[episode]
    // TODO handle special cases where anilist reports that 3 episodes aired at the same time because of pre-releases, simply don't allow the same episode to be re-used

    const hasSpecial = !!specialCount
    const hasEpisode = episodes?.[Number(episode)]
    const hasCountMatch = (_episodes(media) ?? 0) === (eps?.episodeCount ?? 0)

    const needsValidation = !(!hasSpecial || (hasEpisode && hasCountMatch))
    const { image, summary, overview, rating, title, length, airdate } = (needsValidation ? episodeByAirDate(airingAt, episodes ?? {}, episode) : episodes?.[Number(episode)]) ?? {}
    return {
      episode, image, summary: summary ?? overview, rating, title, length, airdate, airingAt, filler: !!fillerEpisodes[media.id]?.includes(i + 1)
    }
  })

  const perPage = 16

  function getPage (page: number, list: typeof episodeList = episodeList) {
    return list.slice((page - 1) * perPage, page * perPage)
  }

  $: _progress = progress(media) ?? 0
  $: completed = list(media) === 'COMPLETED'

  let currentPage = Math.floor((progress(media) ?? 0) / perPage) + 1

  function play (episode: number) {
    searchStore.set({ media, episode })
  }

  export let following = authAggregator.following(media.id)

  $: followerEntries = $following?.data?.Page?.mediaList?.filter(e => e?.user?.id !== authAggregator.id()) ?? []
</script>

<Pagination count={episodeCount} {perPage} bind:currentPage let:pages let:hasNext let:hasPrev let:range let:setPage siblingCount={1}>
  <div class='overflow-y-auto pt-3 -mx-14 px-14 pointer-events-none -mb-3 pb-3' use:dragScroll>
    <div class='grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(500px,1fr))] place-items-center gap-x-10 gap-y-7 justify-center align-middle pointer-events-auto'>
      {#each getPage(currentPage, episodeList) as { episode, image, title, summary, airingAt, airdate, filler, length } (episode)}
        {@const watched = _progress >= episode}
        {@const target = _progress + 1 === episode}
        <div use:click={() => play(episode)}
          class={cn(
            'select:scale-[1.05] select:shadow-lg scale-100 transition-[transform,box-shadow] duration-200 shrink-0 ease-out focus-visible:ring-ring focus-visible:ring-1 rounded-md bg-neutral-950 text-secondary-foreground select:bg-neutral-900 flex w-full max-h-28 cursor-pointer relative overflow-hidden group',
            target && 'ring-ring ring-1',
            filler && '!ring-yellow-400 ring-1'
          )}>
          {#if image}
            <div class='w-52 shrink-0 relative'>
              <Load src={image} class={cn('object-cover h-full w-full', watched && 'opacity-20')} />
              {#if length ?? media.duration}
                <div class='absolute bottom-1 left-1 bg-neutral-900/80 text-secondary-foreground text-[9.6px] px-1 py-0.5 rounded'>
                  {length ?? media.duration}m
                </div>
              {/if}
              <div class='absolute flex items-center justify-center w-full h-full bg-black group-select:bg-opacity-50 bg-opacity-0 duration-200 text-white transition-[background] ease-out top-0'>
                <Play class='size-6 scale-75 opacity-0 group-select:opacity-100 group-select:scale-100 duration-200 transition-[transform,opacity] ease-out' fill='currentColor' />
              </div>
            </div>
          {/if}
          <div class='flex-grow py-3 px-4 flex flex-col'>
            <div class='font-bold mb-2 line-clamp-1 shrink-0 text-[12.8px]'>
              {episode}. {title?.en ?? 'Episode ' + episode}
            </div>
            {#if watched || completed}
              <div class='mb-2 h-0.5 overflow-hidden w-full bg-blue-600 shrink-0' />
            {/if}
            <div class='text-[9.6px] text-muted-foreground overflow-hidden'>
              {notes(summary ?? '')}
            </div>
            <div class='flex w-full justify-between mt-auto'>
              {#if airingAt ?? airdate}
                <div class='text-[9.6px] pt-2'>
                  {since(new Date(airingAt ?? airdate ?? 0))}
                </div>
              {/if}
              <div class='-space-x-1 ml-auto inline-flex pt-1 pr-0.5'>
                {#each followerEntries.filter(e => e?.progress === episode) as followerEntry, i (followerEntry?.user?.id ?? i)}
                  {#if followerEntry?.user}
                    <Profile user={followerEntry.user} class='ring-2 ring-neutral-950 size-4 bg-neutral-950' />
                  {/if}
                {/each}
              </div>
            </div>
            {#if filler}
              <div class='rounded-tl bg-yellow-400 py-1 px-2 text-primary-foreground absolute bottom-0 right-0 text-[9.6px] font-bold'>Filler</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class='flex flex-row items-center justify-between w-full py-3'>
    <p class='text-center text-[13px] text-muted-foreground hidden md:block'>
      Showing <span class='font-bold'>{range.start + 1}</span> to <span class='font-bold'>{range.end}</span> of <span class='font-bold'>{episodeCount}</span> episodes
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
          Showing <span class='font-bold'>{range.start + 1}</span> to <span class='font-bold'>{range.end}</span> of <span class='font-bold'>{episodeCount}</span> episodes
        </p>
      {/if}
      <Button size='icon' variant='ghost' on:click={() => setPage(currentPage + 1)} disabled={!hasNext}>
        <ChevronRight class='h-4 w-4' />
      </Button>
    </div>
  </div>
</Pagination>
