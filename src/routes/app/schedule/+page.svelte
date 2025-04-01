<script lang='ts'>
  import { addMonths, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths } from 'date-fns'
  import { Button as ButtonPrimitive } from 'bits-ui'
  import { get } from 'svelte/store'
  import { onMount, tick } from 'svelte'
  import { Cross2 } from 'svelte-radix'
  import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte'

  import type { ResultOf } from 'gql.tada'
  import type { Schedule, ScheduleMedia } from '$lib/modules/anilist/queries'

  import { cn, isMobile } from '$lib/utils'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import StatusDot from '$lib/components/StatusDot.svelte'
  import { hideBanner } from '$lib/components/ui/banner'
  import * as Drawer from '$lib/components/ui/drawer'
  import { Button } from '$lib/components/ui/button'
  import { dragScroll } from '$lib/modules/navigate'
  import { authAggregator } from '$lib/modules/auth'
  import { dedupeAiring } from '$lib/modules/anilist'

  const query = authAggregator.schedule()

  let now = new Date()
  $: monthName = now.toLocaleString('en-US', { month: 'long' })

  $: firstDay = startOfWeek(startOfMonth(now), { weekStartsOn: 1 })
  $: lastDay = endOfWeek(endOfMonth(now), { weekStartsOn: 1 })
  function prevMonth () {
    now = subMonths(now, 1)
  }
  function nextMonth () {
    now = addMonths(now, 1)
  }

  function listDays (firstDay: Date, lastDay: Date) {
    // create an array of days with start and end time for given day
    const days = []
    // eslint-disable-next-line no-unmodified-loop-condition
    for (let start = new Date(firstDay); start <= lastDay; start.setDate(start.getDate() + 1)) {
      days.push({ date: new Date(start), number: start.getDate() })
    }
    return days
  }

  $: dayList = listDays(firstDay, lastDay)

  const paused = query.isPaused$
  if (get(query.isPaused$)) query.resume()

  interface DayAirTimes { day: { date: Date, number: number }, episodes: Array<ResultOf<typeof ScheduleMedia> & { episode: number, airTime: Date }> }

  function aggregate (data: ResultOf<typeof Schedule>, dayList: Array<{ date: Date, number: number }>) {
    // join media from all queries into single list
    const mediaList = [...data.curr1?.media ?? [], ...data.curr2?.media ?? [], ...data.curr3?.media ?? [], ...data.residue?.media ?? [], ...data.next1?.media ?? [], ...data.next2?.media ?? []].filter((v, i, a) => v != null && a.findIndex(s => s?.id === v.id) === i) as Array<ResultOf<typeof ScheduleMedia>>

    const dayMap: Record<string, DayAirTimes | undefined> = Object.fromEntries(dayList.map(day => [+day.date, { day, episodes: [] }]))

    for (const media of mediaList) {
      // dedupe airing lists
      const episodes = dedupeAiring(media)
      for (const { a: airingAt, e: episode } of episodes) {
        const airTime = new Date(airingAt * 1000)
        airTime.setHours(0, 0, 0, 0)
        const day = dayMap[+airTime]
        if (day) day.episodes.push({ ...media, episode, airTime: new Date(airingAt * 1000) })
      }
    }

    for (const { episodes } of Object.values(dayMap)as DayAirTimes[]) {
      episodes.sort((a, b) => +a.airTime - +b.airTime)
    }

    return Object.values(dayMap) as DayAirTimes[]
  }

  onMount(async () => {
    await tick()
    hideBanner.value = true
  })
</script>

<div class='flex flex-col items-center w-full h-full overflow-y-auto px-5' use:dragScroll>
  <div class='my-10 grid grid-cols-7 border rounded-lg [&>*:not(:nth-child(7n+1)):nth-child(n+8)]:border-r [&>*:nth-last-child(n+8)]:border-b [&>*:nth-child(-n+8)]:border-b w-full max-w-[1800px]'>
    <div class='col-span-full flex justify-between items-center p-4'>
      <Button size='icon' on:click={prevMonth} variant='outline' class='bg-transparent'>
        <ChevronLeftIcon class='h-6 w-6' />
      </Button>
      <div class='text-center font-bold text-xl'>
        {monthName}
      </div>
      <Button size='icon' on:click={nextMonth} variant='outline' class='bg-transparent'>
        <ChevronRightIcon class='h-6 w-6' />
      </Button>
    </div>
    <div class='text-center py-2'>Mon</div>
    <div class='text-center py-2'>Tue</div>
    <div class='text-center py-2'>Wed</div>
    <div class='text-center py-2'>Thu</div>
    <div class='text-center py-2'>Fri</div>
    <div class='text-center py-2'>Sat</div>
    <div class='text-center py-2'>Sun</div>
    {#if $query.fetching || $paused}
      <div class='p-5 flex items-center justify-center h-96 col-span-full'>
        Loading...
      </div>
    {:else if $query.error}
      <div class='p-5 flex items-center justify-center h-96 col-span-full'>
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
    {:else if $query.data?.curr1?.media}
      {#each aggregate($query.data, dayList) as { day, episodes } (day.date)}
        {@const sameMonth = isSameMonth(now, day.date)}
        <div>
          <div class='flex flex-col text-xs py-3 h-48' class:opacity-30={!sameMonth}>
            {#if $isMobile}
              <Drawer.Root shouldScaleBackground portal='html'>
                <Drawer.Trigger class='h-full flex flex-col'>
                  <div class={cn('w-6 h-6 flex items-center justify-center font-bold mx-3', isToday(day.date) && 'bg-[rgb(61,180,242)] rounded-full')}>
                    {day.number}
                  </div>
                  <div class='px-3 mt-auto text-ellipsis overflow-hidden text-nowrap w-full'>
                    {episodes.length} eps
                  </div>
                </Drawer.Trigger>
                <Drawer.Content tabindex={null}>
                  <Drawer.Header>
                    <Drawer.Close class='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity select:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none'>
                      <Cross2 class='h-4 w-4' />
                      <span class='sr-only'>Close</span>
                    </Drawer.Close>
                  </Drawer.Header>
                  <Drawer.Footer>
                    {#each episodes as episode, i (i)}
                      <ButtonPrimitive.Root class={cn('flex items-center h-4 w-full group mt-1.5 px-3', +episode.airTime < Date.now() && 'opacity-30')} href='/app/anime/{episode.id}' data-sveltekit-preload-data='tap'>
                        <div class='font-medium text-nowrap text-ellipsis overflow-hidden pr-2' title={episode.title?.userPreferred}>
                          {#if episode.mediaListEntry?.status}
                            <StatusDot variant={episode.mediaListEntry.status} class='hidden' />
                          {/if}
                          {episode.title?.userPreferred}
                        </div>
                        <div class='ml-auto mr-1 text-nowrap'>#{episode.episode}</div>
                        <div class='text-neutral-400 group-select:text-neutral-200'>{format(episode.airTime, 'HH:mm')}</div>
                      </ButtonPrimitive.Root>
                    {/each}
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer.Root>
            {:else}
              <div class={cn('w-6 h-6 flex items-center justify-center font-bold mx-3', isToday(day.date) && 'bg-[rgb(61,180,242)] rounded-full')}>
                {day.number}
              </div>
            {/if}
            {#if !$isMobile}
              <div class='mt-auto'>
                {#each episodes.length > 6 ? episodes.slice(0, 5) : episodes as episode, i (i)}
                  <ButtonPrimitive.Root class={cn('flex items-center h-4 w-full group mt-1.5 px-3', +episode.airTime < Date.now() && 'opacity-30')} href='/app/anime/{episode.id}' data-sveltekit-preload-data='tap'>
                    <div class='font-medium text-nowrap text-ellipsis overflow-hidden pr-2' title={episode.title?.userPreferred}>
                      {#if episode.mediaListEntry?.status}
                        <StatusDot variant={episode.mediaListEntry.status} class='hidden lg:inline-flex' />
                      {/if}
                      {episode.title?.userPreferred}
                    </div>
                    <div class='ml-auto mr-1 text-nowrap hidden lg:inline-flex'>#{episode.episode}</div>
                    <div class='text-neutral-400 group-select:text-neutral-200 ml-auto lg:ml-0'>{format(episode.airTime, 'HH:mm')}</div>
                  </ButtonPrimitive.Root>
                {/each}
                {#if episodes.length > 6}
                  <Tooltip.Root openDelay={100}>
                    <Tooltip.Trigger class='text-neutral-500 w-full text-left px-3 mt-1.5'>
                      + {episodes.length - 5} more...
                    </Tooltip.Trigger>
                    <Tooltip.Content sameWidth={true} class='text-center gap-1.5'>
                      {#each episodes.slice(5) as episode, i (i)}
                        <ButtonPrimitive.Root class={cn('flex items-center h-4 w-full group', +episode.airTime < Date.now() && 'text-neutral-300')} href='/app/anime/{episode.id}'data-sveltekit-preload-data='tap'>
                          <div class='font-medium text-nowrap text-ellipsis overflow-hidden pr-2' title={episode.title?.userPreferred}>
                            {#if episode.mediaListEntry?.status}
                              <StatusDot variant={episode.mediaListEntry.status} class='hidden lg:inline-flex' />
                            {/if}
                            {episode.title?.userPreferred}
                          </div>
                          <div class='ml-auto mr-1 text-nowrap hidden lg:inline-flex'>#{episode.episode}</div>
                          <div class='text-neutral-400 group-select:text-neutral-900 ml-auto lg:ml-0'>{format(episode.airTime, 'HH:mm')}</div>
                        </ButtonPrimitive.Root>
                      {/each}
                    </Tooltip.Content>
                  </Tooltip.Root>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {:else}
      <div class='p-5 flex items-center justify-center h-96 col-span-full'>
        Loading...
      </div>
    {/if}
  </div>
</div>
