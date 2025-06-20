<script lang='ts'>
  import SkipBack from 'lucide-svelte/icons/skip-back'
  import SkipForward from 'lucide-svelte/icons/skip-forward'
  import { writable } from 'svelte/store'

  import { Button } from '../button'
  import * as Sheet from '../sheet'

  import type { ResolvedFile } from './resolver'
  import type { MediaInfo } from './util'
  import type { TorrentFile } from '../../../../app'

  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import EpisodesList from '$lib/components/EpisodesList.svelte'
  import * as Dialog from '$lib/components/ui/dialog'
  import { episodes } from '$lib/modules/anizip'
  import { authAggregator } from '$lib/modules/auth'
  import native from '$lib/modules/native'
  import { click } from '$lib/modules/navigate'
  import { settings } from '$lib/modules/settings'
  import { toTS } from '$lib/utils'

  export let mediaInfo: MediaInfo
  export let otherFiles: TorrentFile[]
  export let videoFiles: ResolvedFile[]
  export let selectFile: (file: ResolvedFile) => void
  export let prev: (() => void) | undefined = undefined
  export let next: (() => void) | undefined = undefined
  let wrapper: HTMLDivElement

  $: isMiniplayer = $page.route.id !== '/app/player'

  function openPlayer () {
    if (isMiniplayer) goto('/app/player/')
  }
  const player = native.spawnPlayer(mediaInfo.file.url)
  const startTime = Date.now()

  const elapsed = writable(0, (set) => {
    const interval = setInterval(() => {
      set((Date.now() - startTime) / 1000)
    }, 1000)

    return () => clearInterval(interval)
  })

  let completed = false
  function checkComplete (elapsed: number) {
    if (completed || !$settings.playerAutocomplete) return
    const fromend = Math.max(180, duration / 10)
    if (duration - fromend < elapsed) {
      authAggregator.watch(mediaInfo.media, mediaInfo.episode)
      completed = true
    }
  }

  $: checkComplete($elapsed)

  const duration = (mediaInfo.media.duration ?? 24) * 60

  function clamp (value: number): number {
    return Math.min(Math.max(value, 0), 100)
  }
</script>

<div class='flex-col w-full flex-shrink-0 relative overflow-clip flex justify-center items-center bg-black {isMiniplayer ? 'aspect-video cursor-pointer' : 'h-full' } px-8' on:click={openPlayer} bind:this={wrapper}>
  <div class='flex flex-col gap-2 text-left' class:min-w-[320px]={!isMiniplayer}>
    <div class='text-white text-2xl font-bold leading-none line-clamp-1 mb-2'>Now Watching</div>
    <div class='text-white text-lg font-normal leading-none line-clamp-1 hover:text-neutral-300 cursor-pointer' use:click={() => goto(`/app/anime/${mediaInfo.media.id}`)}>{mediaInfo.session.title}</div>
    <Sheet.Root portal={wrapper}>
      <Sheet.Trigger id='episode-list-button' class='text-[rgba(217,217,217,0.6)] hover:text-neutral-500 text-sm leading-none font-light line-clamp-1 text-left'>{mediaInfo.session.description}</Sheet.Trigger>
      <Sheet.Content class='w-[550px] sm:max-w-full h-full overflow-y-scroll flex flex-col pb-0 shrink-0 gap-0 bg-black'>
        {#if mediaInfo.media}
          {#await episodes(mediaInfo.media.id) then eps}
            <EpisodesList {eps} media={mediaInfo.media} />
          {/await}
        {/if}
      </Sheet.Content>
    </Sheet.Root>
    {#await player}
      <div class='ml-auto self-end text-sm leading-none font-light text-nowrap mt-3'>{toTS(Math.min($elapsed, duration))} / {toTS(duration)}</div>
      <div class='relative w-full h-1 flex items-center justify-center overflow-clip rounded-[2px]'>
        <div class='bg-[rgba(217,217,217,0.4)] absolute left-0 w-full h-0.5' />
        <div class='bg-white absolute w-full left-0 h-0.5 transform-gpu' style:--tw-translate-x='{clamp($elapsed / duration * 100) - 100}%' />
      </div>
    {:then _}
      <div class='ml-auto self-end text-sm leading-none font-light text-nowrap mt-3'>{toTS(Math.min((Date.now() - startTime) / 1000, duration))} / {toTS(duration)}</div>
      <div class='relative w-full h-1 flex items-center justify-center overflow-clip rounded-[2px]'>
        <div class='bg-[rgba(217,217,217,0.4)] absolute left-0 w-full h-0.5' />
        <div class='bg-white absolute w-full left-0 h-0.5 transform-gpu' style:--tw-translate-x='{clamp((Date.now() - startTime) / 10 / duration) - 100}%' />
      </div>
    {:catch error}
      <div class='text-red-500 text-sm font-light leading-none whitespace-pre-wrap'>{error.stack}</div>
    {/await}
    {#if !isMiniplayer}
      <div class='flex w-full justify-between pt-3'>
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={prev} disabled={!prev}>
          <SkipBack size='24px' fill='currentColor' strokeWidth='1' />
        </Button>
        <Dialog.Root portal={wrapper}>
          <Dialog.Trigger asChild let:builder>
            <Button class='py-3 px-8 h-12 text-lg font-bold' variant='ghost' builders={[builder]}>
              Playlist
            </Button>
          </Dialog.Trigger>
          <Dialog.Content class='bg-black p-10 border-4 max-w-5xl w-auto max-h-[calc(100%-1rem)] items-center justify-center flex flex-col rounded-xl overflow-y-auto z-[100]'>
            {#each videoFiles as file, i (i)}
              <Button on:click={() => selectFile(file)} variant='ghost'>
                <span class='text-ellipsis text-nowrap overflow-clip'>{file.name}</span>
              </Button>
            {/each}
          </Dialog.Content>
        </Dialog.Root>
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={next} disabled={!next}>
          <SkipForward size='24px' fill='currentColor' strokeWidth='1' />
        </Button>
      </div>
    {/if}
  </div>
</div>
