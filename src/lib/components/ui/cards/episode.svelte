<script lang='ts'>
  import CalendarDays from 'lucide-svelte/icons/calendar-days'
  import Tv from 'lucide-svelte/icons/tv'

  import StatusDot from '../../StatusDot.svelte'
  import { Load } from '../img'

  import PreviewCard from './preview.svelte'

  import type { Media } from '$lib/modules/anilist/types'
  import type { TraceAnime } from '$lib/utils'

  import { goto } from '$app/navigation'
  import { coverMedium, format, title } from '$lib/modules/anilist/util'
  import { list } from '$lib/modules/auth'
  import { hover } from '$lib/modules/navigate'

  export let media: Media

  export let trace: TraceAnime | undefined

  let hidden = true

  function onclick () {
    goto(`/app/anime/${media.id}`)
  }
  function onhover (state: boolean) {
    hidden = !state
  }

  $: status = list(media)
</script>

<div class='text-white p-4 cursor-pointer shrink-0 relative pointer-events-auto' class:z-40={!hidden} use:hover={[onclick, onhover]}>
  {#if !hidden}
    <PreviewCard {media} {trace} />
  {/if}
  <div class='item w-[16rem] flex flex-col'>
    <div class='h-[9rem]'>
      <Load src={trace?.image ?? coverMedium(media)} alt='cover' class='object-cover w-full h-full rounded' color={media.coverImage?.color} />
    </div>
    <div class='flex justify-between pt-3 gap-2'>
      <div class='font-black text-[.8rem] line-clamp-2'>
        {#if status}
          <StatusDot variant={status} />
        {/if}
        {title(media)}
      </div>
      {#if trace}
        <div class='text-xs font-medium flex-shrink-0 text-right'>
          <div class='pt-[1px]'>
            Episode {trace.episode}
          </div>
          <div class='text-neutral-500 mt-0.5'>
            {Math.round(trace.similarity * 100)}%
          </div>
        </div>
      {/if}
    </div>
    <div class='flex text-neutral-500 mt-auto pt-2 justify-between'>
      <div class='flex text-xs font-medium'>
        <CalendarDays class='w-[1rem] h-[1rem] mr-1 -ml-0.5' />
        {media.seasonYear ?? 'TBA'}
      </div>
      <div class='flex text-xs font-medium'>
        {format(media)}
        <Tv class='w-[1rem] h-[1rem] ml-1 -mr-0.5' />
      </div>
    </div>
  </div>
</div>

<style>
  .item {
    animation: 0.3s ease 0s 1 load-in;
  }
</style>
