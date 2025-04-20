<script context='module' lang='ts'>
  type percent = number

  interface BarSegment {
    size: percent
    text: string
    offset: percent
    scale: percent
  }

  interface Chapter {
    start: number
    end: number
    text: string
  }

  function clamp (value: percent): percent {
    return Math.min(Math.max(value, 0), 100)
  }

  function skewclamp (value: percent) {
    const clamp = Math.min(Math.max(value, 0), 100)

    return clamp === 0 ? -5 : clamp
  }

</script>

<script lang='ts'>
  import { createEventDispatcher } from 'svelte'

  import { getChapterTitle } from './util'

  import type Thumbnailer from './thumbnailer'

  import { toTS } from '$lib/utils'

  const dispatch = createEventDispatcher<{
    seeking: null
    seeked: null
  }>()
  // state
  export let chapters: Chapter[] = []
  export let currentTime = 0
  export let duration: number
  export let buffer = 0

  $: progress = clamp(currentTime / duration * 100)
  export let seek = 0
  let initialSeekPercent = 0

  $: segments = makeSegments(chapters, duration)

  function makeSegments (chapters: Chapter[], length: number): BarSegment[] {
    const barSegments: BarSegment[] = []
    let offset = 0

    for (const chapter of chapters) {
      const chapterDuration = chapter.end - chapter.start
      if (chapterDuration > 0) { // Still necessary to handle empty "missing" segments.
        const size = (chapterDuration / length) * 100
        barSegments.push({
          size,
          text: chapter.text,
          offset,
          scale: 100 / size
        })
        offset += size
      }
    }

    if (!barSegments.length) barSegments.push({ size: 100, text: '', offset: 0, scale: 1 })

    return barSegments
  }
  // seeking

  let seekbar: HTMLDivElement

  export let seeking = false

  function percentPosition ({ pageX, currentTarget }: PointerEvent) {
    const target = currentTarget as HTMLDivElement
    return clamp((pageX - target.getBoundingClientRect().left) / target.clientWidth * 100)
  }

  function calculatePositionProgress (e: PointerEvent) {
    const target = clamp(percentPosition(e) - initialSeekPercent)
    if (seeking) {
      progress = target
    }
    seek = target
  }

  function endHover () {
    seek = 0
  }

  function startSeeking (e: PointerEvent) {
    seeking = true
    initialSeekPercent = e.pointerType === 'touch' ? percentPosition(e) - progress : 0
    calculatePositionProgress(e)

    if (e.pointerId) seekbar.setPointerCapture(e.pointerId)
    dispatch('seeking')
  }
  function endSeeking ({ pointerId }: PointerEvent) {
    seeking = false
    initialSeekPercent = 0
    if (pointerId) seekbar.releasePointerCapture(pointerId)
    dispatch('seeked')
  }

  // function checkThumbActive (progress: number, seek: number) {
  //   for (const { offset, size } of segments) {
  //     if (offset + size > progress) return offset + size > seek && offset < seek
  //   }
  //   return false
  // }

  $: seekTime = seek * duration / 100

  $: title = getChapterTitle(seekTime, chapters)

  export let thumbnailer: Thumbnailer

  $: seekIndex = Math.max(0, Math.floor(seekTime / thumbnailer.interval))
</script>

<div class='w-full flex cursor-pointer relative group/seekbar touch-none !transform-none' class:!cursor-grab={seeking}
  tabindex='0' role='slider' aria-valuenow='0'
  data-down='#play-pause-button'
  data-up='#episode-list-button'
  on:dblclick
  on:keydown
  bind:this={seekbar}
  on:pointerdown={startSeeking}
  on:pointerup={endSeeking}
  on:pointermove={calculatePositionProgress}
  on:pointerleave={endHover}>
  {#each segments as chapter, i (chapter)}
    {@const { size, scale, offset } = chapter}
    {@const active = seek && seek > offset && seek < offset + size}
    <div class='w-full py-4 shrink-0 flex items-center justify-center' style:width='{size}%'>
      <div class='relative w-full h-1 flex items-center justify-center overflow-hidden rounded-[2px]' class:ml-0.5={!!i}>
        <div class='bg-[rgba(217,217,217,0.4)] absolute left-0 w-full h-0.5 transition-[height] duration-75' class:h-1={active} />
        <div class='bg-[rgba(217,217,217,0.4)] absolute left-0 w-full h-0.5 transition-[height] duration-75 transform-gpu' class:h-1={active} style:--tw-translate-x='{skewclamp(scale * (buffer - offset)) - 100}%' />
        <div class='bg-[rgba(217,217,217,0.4)] absolute left-0 w-full h-0.5 transition-[height] duration-75 transform-gpu' class:h-1={active} style:--tw-translate-x='{skewclamp(scale * (seek - offset)) - 100}%' />
        <div class='bg-white absolute w-full left-0 h-0.5 transition-[height] duration-75 transform-gpu' class:h-1={active} style:--tw-translate-x='{skewclamp(scale * (progress - offset)) - 100}%' />
      </div>
    </div>
  {/each}
  {#if !seeking && seek}
    <div class='absolute w-full transform-gpu flex pointer-events-none group-hover/seekbar:opacity-100 opacity-0 bottom-9' style:--tw-translate-x='clamp(70px, {clamp(seek)}%, calc(100% - 70px))'>
      <div class='-translate-x-1/2 text-sm leading-none text-nowrap flex flex-col justify-center items-center gap-1 rounded-lg bg-neutral-200 border-white border py-2 px-3 has-[img]:p-0 text-zinc-900 shadow-lg'>
        {#await thumbnailer.getThumbnail(seekIndex)}
          {#if title}
            <div class='max-w-24 text-ellipsis overflow-hidden'>{title}</div>
          {/if}
          <div>{toTS(seekTime)}</div>
        {:then src}
          <img {src} alt='thumbnail' class='w-40 rounded-lg min-h-10' loading='lazy' decoding='async' />
          {#if title}
            <div class='max-w-24 text-ellipsis overflow-hidden absolute top-0 bg-white py-1 px-2 rounded-b-lg'>{title}</div>
          {/if}
          <div class='absolute bottom-0 bg-white py-1 px-2 rounded-t-lg'>{toTS(seekTime)}</div>
        {/await}
      </div>
    </div>
  {/if}
  <!-- <div class='absolute w-full transform-gpu flex pointer-events-none top-[18px]' style:--tw-translate-x='{clamp(seeking ? seek : progress)}%'>
    <div class='transform-gpu -translate-x-1/2 -translate-y-1/2 rounded-[50%] w-3 h-3 bg-white scale-0 transition-transform group-hover/seekbar:scale-{checkThumbActive(progress, seek) ? 100 : 75}' />
  </div> -->
</div>
