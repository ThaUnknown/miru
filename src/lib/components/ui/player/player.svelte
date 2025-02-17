<script lang='ts'>
  import * as Dialog from '$lib/components/ui/dialog'
  import PictureInPictureExit from '$lib/components/icons/PictureInPictureExit.svelte'
  import PictureInPicture from '$lib/components/icons/PictureInPicture.svelte'
  import Subtitles from '$lib/components/icons/Subtitles.svelte'
  import Play from '$lib/components/icons/Play.svelte'
  import { Button } from '$lib/components/ui/button'
  import { settings } from '$lib/modules/settings'
  import { bindPiP, toTS } from '$lib/utils'
  import { Cast, EllipsisVertical, FastForward, Maximize, Minimize, Pause, Rewind, SkipBack, SkipForward } from 'lucide-svelte'
  import { writable, type Writable } from 'simple-store-svelte'
  import { persisted } from 'svelte-persisted-store'
  import { toast } from 'svelte-sonner'
  import Seekbar from './seekbar.svelte'
  import type { SvelteMediaTimeRange } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { getChapterTitle, normalizeTracks, sanitizeChapters, type MediaInfo } from './util'
  import Thumbnailer from './thumbnailer'
  import { onMount, tick } from 'svelte'
  import native from '$lib/modules/native'
  import { click } from '$lib/modules/navigate'
  import { goto } from '$app/navigation'
  import * as Tree from '$lib/components/ui/tree'

  export let mediaInfo: MediaInfo
  // bindings
  // values
  let videoHeight = 9
  let videoWidth = 16
  let currentTime = 0
  let seekPercent = 0
  let duration = 1
  let playbackRate = 1
  let buffered: SvelteMediaTimeRange[] = []
  $: buffer = Math.max(...buffered.map(({ end }) => end))
  let readyState = 0
  $: safeduration = isFinite(duration) ? duration : currentTime
  const volume = persisted('volume', 0)

  // state
  let seeking = false
  let ended = false
  let paused = true
  const cast = false

  // elements
  let fullscreenElement: HTMLElement | null = null
  const pictureInPictureElement: Writable<HTMLVideoElement | null> = writable(null)
  let video: HTMLVideoElement
  let wrapper: HTMLDivElement

  // functions
  function playPause () {
    playAnimation(paused ? 'play' : 'pause')
    return paused ? video.play() : video.pause()
  }
  function fullscreen () {
    return fullscreenElement ? document.exitFullscreen() : wrapper.requestFullscreen()
  }

  function pip () {
    return $pictureInPictureElement ? document.exitPictureInPicture() : video.requestPictureInPicture()
  }

  $: fullscreenElement ? screen.orientation.lock('landscape') : screen.orientation.unlock()

  function checkAudio () {
    if ('audioTracks' in HTMLVideoElement.prototype) {
      if (!video.audioTracks!.length) {
        toast.error('Audio Codec Unsupported', {
          description: "This torrent's audio codec is not supported, try a different release by disabling Autoplay Torrents in RSS settings."
        })
      } else if (video.audioTracks!.length > 1) {
        const preferredTrack = [...video.audioTracks!].find(({ language }) => language === $settings.audioLanguage)
        if (preferredTrack) return selectAudio(preferredTrack.id)

        const japaneseTrack = [...video.audioTracks!].find(({ language }) => language === 'jpn')
        if (japaneseTrack) return selectAudio(japaneseTrack.id)
      }
    }
  }
  function selectAudio (id: string) {
    if (id) {
      for (const track of video.audioTracks ?? []) {
        track.enabled = track.id === id
      }
      seek(-0.2) // stupid fix because video freezes up when chaging tracks
    }
    open = false
  }
  function selectVideo (id: string) {
    if (id) {
      for (const track of video.videoTracks!) {
        track.selected = track.id === id
      }
    }
    open = false
  }
  function prev () {
  // TODO
  }
  function next () {
  // TODO
  }
  function seek (time: number) {
    video.currentTime = currentTime = currentTime + time
    playAnimation(time > 0 ? 'seekforw' : 'seekback')
  }
  function seekTo (time: number) {
    playAnimation(time > currentTime ? 'seekforw' : 'seekback')
    video.currentTime = currentTime = time
  }
  let wasPaused = false
  function startSeek () {
    wasPaused = paused
    if (!paused) video.pause()
  }

  function finishSeek () {
    seekTo(seekPercent * safeduration / 100)
    if (!wasPaused) video.play()
  }

  // animations

  function playAnimation (type: 'play' | 'pause' | 'seekforw' | 'seekback') {
    animations.push({ type, id: crypto.randomUUID() })
    // eslint-disable-next-line no-self-assign
    animations = animations
  }
  function endAnimation (id: string) {
    const index = animations.findIndex(animation => animation.id === id)
    if (index !== -1) animations.splice(index, 1)
    // eslint-disable-next-line no-self-assign
    animations = animations
  }
  interface Animation {
    type: 'play' | 'pause' | 'seekforw' | 'seekback'
    id: string
  }
  let animations: Animation[] = []

  const thumbnailer = new Thumbnailer(mediaInfo.url)

  $: thumbnailer.updateSource(mediaInfo.url)

  onMount(() => {
    thumbnailer.setVideo(video)
  })

  // other

  $: chapters = sanitizeChapters([
    { start: 5, end: 15, text: 'Chapter 0' },
    { start: 1.0 * 60, end: 1.2 * 60, text: 'Chapter 1' },
    { start: 1.4 * 60, end: 88, text: 'Chapter 2 ' }
  ], safeduration)

  $: seekIndex = Math.max(0, Math.floor(seekPercent * safeduration / 100 / thumbnailer.interval))

  $: native.setMediaSession(mediaInfo.session)
  $: native.setPositionState({ duration: safeduration, position: Math.max(0, currentTime), playbackRate })
  $: native.setPlayBackState(readyState === 0 ? 'none' : paused ? 'paused' : 'playing')
  native.setActionHandler('play', playPause)
  native.setActionHandler('pause', playPause)
  native.setActionHandler('seekto', ({ seekTime }) => seekTo(seekTime ?? 0))
  native.setActionHandler('seekbackward', () => seek(-2))
  native.setActionHandler('seekforward', () => seek(2))
  native.setActionHandler('previoustrack', prev)
  native.setActionHandler('nexttrack', next)

  let open = false
  let treeState: Writable<string[]>

  async function openSubs () {
    open = true
    await tick()
    treeState.set(['subs'])
  }
</script>

<svelte:document bind:fullscreenElement use:bindPiP={pictureInPictureElement} />

<div style:aspect-ratio='{videoWidth} / {videoHeight}' class='max-w-full max-h-full min-w-[clamp(0%,700px,100%)] relative content-center fullscreen:bg-black fullscreen:rounded-none rounded-xl overflow-clip' bind:this={wrapper}>
  <video
    class='w-full max-h-full grow bg-black'
    preload='auto'
    loop
    src={mediaInfo.url}
    bind:videoHeight
    bind:videoWidth
    bind:currentTime
    bind:duration
    bind:ended
    bind:paused
    bind:readyState
    bind:buffered
    bind:playbackRate
    bind:volume={$volume}
    bind:this={video}
    on:click={playPause}
    on:loadeddata={checkAudio}
  />
  <div class='absolute w-full h-full flex items-center justify-center top-0 pointer-events-none'>
    {#if seeking}
      {#await thumbnailer.getThumbnail(seekIndex) then src}
        <img {src} alt='thumbnail' class='w-full h-full bg-black absolute top-0 right-0' />
      {/await}
    {/if}
    <Button class='mobile:inline-flex hidden p-3 w-12 h-12 absolute top-10 right-10 backdrop-blur-lg border-white/15 border bg-black/20 pointer-events-auto' variant='ghost'>
      <EllipsisVertical size='24px' class='p-[1px]' />
    </Button>
    <div class='mobile:flex hidden gap-4 absolute items-center'>
      <Button class='p-3 w-16 h-16 pointer-events-auto rounded-[50%] backdrop-blur-lg border-white/15 border bg-black/20' variant='ghost'>
        <SkipBack size='24px' fill='currentColor' strokeWidth='1' />
      </Button>
      <Button class='p-3 w-24 h-24 pointer-events-auto rounded-[50%] backdrop-blur-lg border-white/15 border bg-black/20' variant='ghost' on:click={playPause}>
        {#if paused}
          <Play size='42px' fill='currentColor' class='p-0.5' />
        {:else}
          <Pause size='42px' fill='currentColor' strokeWidth='1' />
        {/if}
      </Button>
      <Button class='p-3 w-16 h-16 pointer-events-auto rounded-[50%] backdrop-blur-lg border-white/15 border bg-black/20' variant='ghost'>
        <SkipForward size='24px' fill='currentColor' strokeWidth='1' />
      </Button>
    </div>
    {#if readyState < 3}
      <div in:fade={{ duration: 200, delay: 500 }} out:fade={{ duration: 200 }}>
        <div class='border-[3px] rounded-[50%] w-10 h-10 drop-shadow-lg border-transparent border-t-white animate-spin' />
      </div>
    {/if}
    {#each animations as { type, id } (id)}
      <div class='absolute animate-pulse-once' on:animationend={() => endAnimation(id)}>
        {#if type === 'play'}
          <Play size='64px' fill='white' />
        {:else if type === 'pause'}
          <Pause size='64px' fill='white' />
        {:else if type === 'seekforw'}
          <FastForward size='64px' fill='white' />
        {:else if type === 'seekback'}
          <Rewind size='64px' fill='white' />
        {/if}
      </div>
    {/each}
  </div>
  <div class='absolute w-full bottom-0 flex flex-col gradient px-10 py-4'>
    <div class='flex justify-between gap-12'>
      <div class='flex flex-col gap-2 text-left group/mediainfo cursor-pointer' use:click={() => goto(`/anime/${mediaInfo.media.id}`)}>
        <div class='text-white text-lg font-normal leading-none line-clamp-1 group-hover/mediainfo:text-neutral-200'>{mediaInfo.session.title}</div>
        <div class='text-[rgba(217,217,217,0.6)] group-hover/mediainfo:text-neutral-400 text-sm leading-none font-light line-clamp-1'>{mediaInfo.session.description}</div>
      </div>
      <div class='flex flex-col gap-2 grow-0 items-end self-end'>
        <div class='text-[rgba(217,217,217,0.6)] text-sm leading-none font-light line-clamp-1'>{getChapterTitle(seeking ? seekPercent * safeduration / 100 : currentTime, chapters) || ''}</div>
        <div class='ml-auto self-end text-sm leading-none font-light text-nowrap'>{toTS(seeking ? seekPercent * safeduration / 100 : currentTime)} / {toTS(safeduration)}</div>
      </div>
    </div>
    <Seekbar {duration} {currentTime} buffer={buffer / duration * 100} {chapters} bind:seeking bind:seek={seekPercent} on:seeked={finishSeek} on:seeking={startSeek} {thumbnailer} />
    <div class='flex justify-between gap-2 mobile:hidden'>
      <div class='flex text-white gap-2'>
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={playPause}>
          {#if paused}
            <Play size='24px' fill='currentColor' class='p-0.5' />
          {:else}
            <Pause size='24px' fill='currentColor' strokeWidth='1' />
          {/if}
        </Button>
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={prev}>
          <SkipBack size='24px' fill='currentColor' strokeWidth='1' />
        </Button>
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={next}>
          <SkipForward size='24px' fill='currentColor' strokeWidth='1' />
        </Button>
      </div>
      <div class='flex gap-2'>
        <Dialog.Root portal={wrapper} bind:open>
          <Dialog.Trigger asChild let:builder>
            <Button class='p-3 w-12 h-12' variant='ghost' builders={[builder]}>
              <EllipsisVertical size='24px' class='p-[1px]' />
            </Button>
          </Dialog.Trigger>
          <Dialog.Content class='absolute bg-transparent border-none p-0 shadow-none h-full w-full overflow-hidden'>
            <div on:pointerdown|self={() => { open = false }} class='h-full flex w-full justify-center items-center overflow-y-scroll'>
              <Tree.Root bind:state={treeState}>
                <Tree.Item>
                  <span slot='trigger'>Audio</span>
                  <Tree.Sub>
                    {#each Object.entries(normalizeTracks(video.audioTracks ?? [])) as [lang, tracks] (lang)}
                      <Tree.Item>
                        <span slot='trigger' class='capitalize'>{lang}</span>
                        <Tree.Sub>
                          {#each tracks as track (track.id)}
                            <Tree.Item active={track.enabled} on:click={() => selectAudio(track.id)}>
                              <span>{track.label}</span>
                            </Tree.Item>
                          {/each}
                        </Tree.Sub>
                      </Tree.Item>
                    {/each}
                  </Tree.Sub>
                </Tree.Item>
                <Tree.Item>
                  <span slot='trigger'>Video</span>
                  <Tree.Sub>
                    {#each Object.entries(normalizeTracks(video.videoTracks ?? [])) as [lang, tracks] (lang)}
                      <Tree.Item>
                        <span slot='trigger' class='capitalize'>{lang}</span>
                        <Tree.Sub>
                          {#each tracks as track (track.id)}
                            <Tree.Item active={track.enabled} on:click={() => selectVideo(track.id)}>
                              <span>{track.label}</span>
                            </Tree.Item>
                          {/each}
                        </Tree.Sub>
                      </Tree.Item>
                    {/each}
                  </Tree.Sub>
                </Tree.Item>
                <Tree.Item id='subs'>
                  <span slot='trigger'>Subtitles</span>
                  <Tree.Sub>
                    <Tree.Item>
                      <span>Consulting</span>
                    </Tree.Item>
                    <Tree.Item>
                      <span>Support</span>
                    </Tree.Item>
                  </Tree.Sub>
                </Tree.Item>
              </Tree.Root>\
            </div>
          </Dialog.Content>
        </Dialog.Root>

        <Button class='p-3 w-12 h-12' variant='ghost' on:click={openSubs}>
          <Subtitles size='24px' fill='currentColor' strokeWidth='0' />
        </Button>
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={pip}>
          {#if $pictureInPictureElement}
            <PictureInPictureExit size='24px' strokeWidth='2' />
          {:else}
            <PictureInPicture size='24px' strokeWidth='2' />
          {/if}
        </Button>
        {#if false}
          <Button class='p-3 w-12 h-12' variant='ghost'>
            {#if cast}
              <Cast size='24px' fill='white' strokeWidth='2' />
            {:else}
              <Cast size='24px' strokeWidth='2' />
            {/if}
          </Button>
        {/if}
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={fullscreen}>
          {#if fullscreenElement}
            <Minimize size='24px' class='p-0.5' strokeWidth='2.5' />
          {:else}
            <Maximize size='24px' class='p-0.5' strokeWidth='2.5' />
          {/if}
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  .gradient {
    background: linear-gradient(to top, oklab(0 0 0 / 0.85) 0%, oklab(0 0 0 / 0.7) 35%, oklab(0 0 0 / 0) 100%);
  }

  .animate-pulse-once {
    animation: pulse-once .4s linear;
  }

  @keyframes pulse-once {
    0% {
      opacity: 1;
      scale: 1;
    }
    100% {
      opacity: 0;
      scale: 1.2;
    }
  }
</style>
