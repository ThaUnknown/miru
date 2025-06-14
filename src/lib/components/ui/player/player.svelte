<script lang='ts'>
  import Captions from 'lucide-svelte/icons/captions'
  import Cast from 'lucide-svelte/icons/cast'
  import ChevronDown from 'lucide-svelte/icons/chevron-down'
  import ChevronUp from 'lucide-svelte/icons/chevron-up'
  import Contrast from 'lucide-svelte/icons/contrast'
  import DecimalsArrowLeft from 'lucide-svelte/icons/decimals-arrow-left'
  import DecimalsArrowRight from 'lucide-svelte/icons/decimals-arrow-right'
  import FastForward from 'lucide-svelte/icons/fast-forward'
  import List from 'lucide-svelte/icons/list'
  import Maximize from 'lucide-svelte/icons/maximize'
  import Minimize from 'lucide-svelte/icons/minimize'
  import Pause from 'lucide-svelte/icons/pause'
  import PictureInPicture2 from 'lucide-svelte/icons/picture-in-picture-2'
  import Proportions from 'lucide-svelte/icons/proportions'
  import RefreshCcw from 'lucide-svelte/icons/refresh-ccw'
  import Rewind from 'lucide-svelte/icons/rewind'
  import RotateCcw from 'lucide-svelte/icons/rotate-ccw'
  import RotateCw from 'lucide-svelte/icons/rotate-cw'
  import ScreenShare from 'lucide-svelte/icons/screen-share'
  import SkipBack from 'lucide-svelte/icons/skip-back'
  import SkipForward from 'lucide-svelte/icons/skip-forward'
  import Users from 'lucide-svelte/icons/users'
  import Volume1 from 'lucide-svelte/icons/volume-1'
  import Volume2 from 'lucide-svelte/icons/volume-2'
  import VolumeX from 'lucide-svelte/icons/volume-x'
  import { onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { persisted } from 'svelte-persisted-store'
  import { toast } from 'svelte-sonner'
  import VideoDeband from 'video-deband'

  import { condition, loadWithDefaults } from './keybinds.svelte'
  import Options from './options.svelte'
  import PictureInPicture from './pip'
  import Seekbar from './seekbar.svelte'
  import Subs from './subtitles'
  import Thumbnailer from './thumbnailer'
  import { getChaptersAniSkip, getChapterTitle, sanitizeChapters, type Chapter, type MediaInfo } from './util'
  import Volume from './volume.svelte'

  import type { ResolvedFile } from './resolver'
  import type { TorrentFile } from '../../../../app'
  import type { SvelteMediaTimeRange } from 'svelte/elements'

  import { beforeNavigate, goto } from '$app/navigation'
  import { page } from '$app/stores'
  import EpisodesList from '$lib/components/EpisodesList.svelte'
  import PictureInPictureOff from '$lib/components/icons/PictureInPicture.svelte'
  import PictureInPictureExit from '$lib/components/icons/PictureInPictureExit.svelte'
  import Play from '$lib/components/icons/Play.svelte'
  import Subtitles from '$lib/components/icons/Subtitles.svelte'
  import { Button } from '$lib/components/ui/button'
  import * as Sheet from '$lib/components/ui/sheet'
  import { client } from '$lib/modules/anilist'
  import { episodes } from '$lib/modules/anizip'
  import { authAggregator } from '$lib/modules/auth'
  import { isPlaying } from '$lib/modules/idle'
  import native from '$lib/modules/native'
  import { click, keywrap } from '$lib/modules/navigate'
  import { settings, SUPPORTS } from '$lib/modules/settings'
  import { server } from '$lib/modules/torrent'
  import { w2globby } from '$lib/modules/w2g/lobby'
  import { toTS, fastPrettyBits } from '$lib/utils'

  export let mediaInfo: MediaInfo
  export let otherFiles: TorrentFile[]
  export let videoFiles: ResolvedFile[]
  export let selectFile: (file: ResolvedFile) => void
  export let prev: (() => void) | undefined = undefined
  export let next: (() => void) | undefined = undefined
  // bindings
  // values
  let videoHeight = 9
  let videoWidth = 16
  let currentTime = 0
  let seekPercent = 0
  let duration = 1
  let playbackRate = 1
  let buffered: SvelteMediaTimeRange[] = []
  let subtitleDelay = 0
  $: buffer = Math.max(...buffered.map(({ end }) => end))
  let readyState = 0
  $: safeduration = isFinite(duration) ? duration : currentTime
  const volume = persisted('volume', 1)
  $: exponentialVolume = SUPPORTS.isAndroid ? 1 : $volume ** 3
  let muted = false

  // elements
  let fullscreenElement: HTMLElement | null = null
  let video: HTMLVideoElement
  let wrapper: HTMLDivElement

  let subtitles: Subs | undefined
  let deband: VideoDeband | undefined

  const pip = new PictureInPicture()
  $: pip._setElements(video, subtitles, deband)
  const pipElementStore = pip.element
  $: pictureInPictureElement = $pipElementStore

  const thumbnailer = new Thumbnailer(mediaInfo.file.url)
  onMount(() => thumbnailer.setVideo(video))

  onDestroy(() => {
    pip.destroy()
    thumbnailer.destroy()
  })

  // @ts-expect-error bad type infer
  $: if (subtitles?.renderer) subtitles.renderer.timeOffset = Number(subtitleDelay)

  // state
  let seeking = false
  let ended = false
  let paused = true
  let pointerMoving = false
  const cast = false

  $: $isPlaying = !paused

  $: buffering = readyState < 3
  $: immersed = !buffering && !paused && !ended && !pictureInPictureElement && !pointerMoving
  $: isMiniplayer = $page.route.id !== '/app/player'

  let pointerMoveTimeout = 0
  function resetMove () {
    clearTimeout(pointerMoveTimeout)
    pointerMoving = true
    pointerMoveTimeout = setTimeout(() => {
      pointerMoving = false
    }, 300)
  }

  // functions
  function playPause () {
    playAnimation(paused ? 'play' : 'pause')
    return paused ? video.play() : video.pause()
  }
  function fullscreen () {
    return fullscreenElement ? document.exitFullscreen() : document.getElementById('episodeListTarget')!.requestFullscreen()
  }

  function toggleCast () {
  // TODO: never
  }

  $: fullscreenElement ? screen.orientation.lock('landscape') : screen.orientation.unlock()

  beforeNavigate(() => {
    if (fullscreenElement) fullscreen()
  })

  function checkAudio () {
    if (video.audioTracks) {
      if (!video.audioTracks.length) {
        toast.error('Audio Codec Unsupported', {
          description: "This torrent's audio codec is not supported, try a different release by disabling Autoplay Torrents in RSS settings."
        })
      } else if (video.audioTracks.length > 1) {
        const preferredTrack = [...video.audioTracks].find(({ language }) => language === $settings.audioLanguage)
        if (preferredTrack) return selectAudio(preferredTrack.id)

        const japaneseTrack = [...video.audioTracks].find(({ language }) => language === 'jpn')
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
  }
  function selectVideo (id: string) {
    if (id) {
      for (const track of video.videoTracks ?? []) {
        track.selected = track.id === id
      }
    }
  }
  function seek (time: number) {
    // WARN: this causes all subscriptions to video to re-run!!!
    video.currentTime = currentTime = currentTime + time
    // currentTime = currentTime + time
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

  async function screenshot () {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    if (subtitles?.renderer) {
      subtitles.renderer.resize(video.videoWidth, video.videoHeight)
      await new Promise(resolve => setTimeout(resolve, 500)) // this is hacky, but TLDR wait for canvas to update and re-render, in practice this will take at MOST 100ms, but just to be safe
      context.drawImage(subtitles.renderer._canvas, 0, 0, canvas.width, canvas.height)
      subtitles.renderer.resize(0, 0, 0, 0) // undo resize
    }
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!)))
    canvas.remove()
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    toast.success('Screenshot', {
      description: 'Saved screenshot to clipboard.'
    })
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

  let chapters: Chapter[] = []
  const chaptersPromise = native.chapters(mediaInfo.file.hash, mediaInfo.file.id)
  async function loadChapters (pr: typeof chaptersPromise, safeduration: number) {
    const nativeChapters = await pr
    if (nativeChapters.length) {
      chapters = sanitizeChapters(nativeChapters, safeduration)
      return
    }

    const idMal = mediaInfo.media.idMal
    if (!idMal) return
    const aniSkipChapters = await getChaptersAniSkip(idMal, mediaInfo.episode, safeduration)
    if (!aniSkipChapters.length) return
    chapters = sanitizeChapters(aniSkipChapters, safeduration)
  }
  $: loadChapters(chaptersPromise, safeduration)

  function createSubtitles (video: HTMLVideoElement) {
    subtitles = new Subs(video, otherFiles, mediaInfo.file)
    return {
      destroy: () => {
        subtitles?.destroy()
      }
    }
  }

  function createDeband (video: HTMLVideoElement, playerDeband: boolean) {
    const create = () => {
      destroy()
      deband = new VideoDeband(video)
      deband.canvas.classList.add('deband-canvas', 'w-full', 'h-full', 'pointer-events-none', 'object-contain')
      video.before(deband.canvas)
    }

    const destroy = () => {
      deband?.destroy()
      deband?.canvas.remove()
      deband = undefined
    }

    if (playerDeband) create()

    return {
      destroy,
      update: (playerDeband: boolean) => {
        if (playerDeband) {
          create()
        } else {
          destroy()
        }
      }
    }
  }

  let completed = false
  function checkCompletion () {
    if (!completed && $settings.playerAutocomplete) {
      checkCompletionByTime(currentTime, safeduration)
    }
  }
  function checkCompletionByTime (currentTime: number, safeduration: number) {
    const fromend = Math.max(180, safeduration / 10)
    if (safeduration && currentTime && readyState && safeduration - fromend < currentTime) {
      authAggregator.watch(mediaInfo.media, mediaInfo.episode)
      completed = true
    }
  }

  // other
  $: if (ended && $settings.playerAutoplay && !isMiniplayer) next?.()

  function handleVisibility (visibility: DocumentVisibilityState) {
    if (!ended && $settings.playerPause && !pictureInPictureElement) {
      if (visibility === 'hidden') {
        visibilityPaused = paused
        paused = true
      } else {
        if (!visibilityPaused) paused = false
      }
    }
  }
  let visibilityPaused = true
  let visibilityState: DocumentVisibilityState
  $: handleVisibility(visibilityState)

  function autoPlay () {
    if (!isMiniplayer) video.play()
  }

  let currentSkippable: string | null = null
  function checkSkippableChapters () {
    const current = findChapter(currentTime)
    if (current) {
      currentSkippable = isChapterSkippable(current)
    }
  }

  $: if (currentSkippable && $settings.playerSkip) skip()

  const skippableChaptersRx: Array<[string, RegExp]> = [
    ['Opening', /^op$|opening$|^ncop/mi],
    ['Ending', /^ed$|ending$|^nced/mi],
    ['Recap', /recap/mi]
  ]
  function isChapterSkippable (chapter: Chapter) {
    for (const [name, regex] of skippableChaptersRx) {
      if (regex.test(chapter.text)) {
        return name
      }
    }
    return null
  }

  function findChapter (time: number) {
    return chapters.find(({ start, end }) => time >= start && time <= end)
  }

  function skip () {
    const current = findChapter(currentTime)
    if (current) {
      if (!isChapterSkippable(current) && (current.end - current.start) > 100) {
        currentTime = currentTime + 85
      } else {
        const endtime = current.end
        if ((safeduration - endtime | 0) === 0) return next?.()
        currentTime = endtime
        currentSkippable = null
      }
    } else if (currentTime < 10) {
      currentTime = 90
    } else if (safeduration - currentTime < 90) {
      currentTime = safeduration
    } else {
      currentTime = currentTime + 85
    }
    video.currentTime = currentTime
  }

  let stats: {
    fps?: string
    presented?: number
    dropped?: number
    processing?: string
    viewport?: string
    resolution?: string
    buffer?: string
    speed?: number
  } | null = null
  let requestCallback: number | null = null
  function toggleStats () {
    if (requestCallback) {
      stats = null
      video.cancelVideoFrameCallback(requestCallback)
      requestCallback = null
    } else {
      requestCallback = video.requestVideoFrameCallback((a, b) => {
        stats = {}
        handleStats(a, b, b)
      })
    }
  }
  async function handleStats (now: number, metadata: VideoFrameCallbackMetadata, lastmeta: VideoFrameCallbackMetadata) {
    if (stats) {
      const msbf = (metadata.mediaTime - lastmeta.mediaTime) / (metadata.presentedFrames - lastmeta.presentedFrames)
      const fps = (1 / msbf).toFixed(3)
      stats = {
        fps,
        presented: metadata.presentedFrames,
        dropped: video.getVideoPlaybackQuality().droppedVideoFrames,
        processing: metadata.processingDuration + ' ms',
        viewport: video.clientWidth + 'x' + video.clientHeight,
        resolution: videoWidth + 'x' + videoHeight,
        buffer: getBufferHealth(metadata.mediaTime) + ' s',
        speed: video.playbackRate || 1
      }
      setTimeout(() => video.requestVideoFrameCallback((n, m) => handleStats(n, m, metadata)), 200)
    }
  }
  function getBufferHealth (time: number) {
    for (let index = video.buffered.length; index--;) {
      if (time < video.buffered.end(index) && time >= video.buffered.start(index)) {
        return (video.buffered.end(index) - time) | 0
      }
    }
    return 0
  }

  $: seekIndex = Math.max(0, Math.floor(seekPercent * safeduration / 100 / thumbnailer.interval))

  $: playbackIndex = Math.max(0, Math.floor(currentTime / thumbnailer.interval))

  $: if (readyState && !seekIndex) thumbnailer._paintThumbnail(video, playbackIndex)

  $: native.setMediaSession(mediaInfo.session, mediaInfo.media.id)
  $: native.setPositionState({ duration: safeduration, position: Math.min(Math.max(0, currentTime), safeduration), playbackRate })
  $: native.setPlayBackState(readyState === 0 ? 'none' : paused ? 'paused' : 'playing')
  native.setActionHandler('play', playPause)
  native.setActionHandler('pause', playPause)
  native.setActionHandler('seekto', ({ seekTime }) => seekTo(seekTime ?? 0))
  native.setActionHandler('seekbackward', () => seek(-2))
  native.setActionHandler('seekforward', () => seek(2))
  native.setActionHandler('previoustrack', () => prev?.())
  native.setActionHandler('nexttrack', () => next?.())
  // about://flags/#auto-picture-in-picture-for-video-playback
  native.setActionHandler('enterpictureinpicture', () => pip.pip(true))

  let openSubs: () => Promise<void>

  function cycleSubtitles () {
    if (!subtitles) return
    const entries = Object.entries(subtitles._tracks.value)
    const index = entries.findIndex(([index]) => index === subtitles!.current.value)
    const nextIndex = (index + 1) % entries.length
    subtitles.selectCaptions(entries[nextIndex]![0])
  }

  function seekBarKey (event: KeyboardEvent) {
    // left right up down return preventdefault
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) event.stopPropagation()

    if (event.repeat) return
    switch (event.key) {
      case 'ArrowLeft':
        seek(-Number($settings.playerSeek))
        break
      case 'ArrowRight':
        seek(Number($settings.playerSeek))
        break
      case 'Enter':
        playPause()
        break
    }
  }
  let fitWidth = false
  loadWithDefaults({
    KeyX: {
      fn: () => screenshot(),
      id: 'screenshot_monitor',
      icon: ScreenShare,
      type: 'icon',
      desc: 'Save Screenshot to Clipboard'
    },
    KeyI: {
      fn: () => toggleStats(),
      icon: List,
      id: 'list',
      type: 'icon',
      desc: 'Toggle Stats'
    },
    Space: {
      fn: (e) => {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
        playPause()
      },
      id: 'play_arrow',
      icon: Play,
      type: 'icon',
      desc: 'Play/Pause'
    },
    KeyN: {
      fn: () => next?.(),
      id: 'skip_next',
      icon: SkipForward,
      type: 'icon',
      desc: 'Next Episode'
    },
    KeyB: {
      fn: () => prev?.(),
      id: 'skip_previous',
      icon: SkipBack,
      type: 'icon',
      desc: 'Previous Episode'
    },
    KeyA: {
      fn: () => {
        $settings.playerDeband = !$settings.playerDeband
      },
      id: 'deblur',
      icon: Contrast,
      type: 'icon',
      desc: 'Toggle Video Debanding'
    },
    KeyM: {
      fn: () => (muted = !muted),
      id: 'volume_off',
      icon: VolumeX,
      type: 'icon',
      desc: 'Toggle Mute'
    },
    KeyP: {
      fn: () => pip.pip(),
      id: 'picture_in_picture',
      icon: PictureInPicture2,
      type: 'icon',
      desc: 'Toggle Picture in Picture'
    },
    KeyF: {
      fn: () => fullscreen(),
      id: 'fullscreen',
      icon: Maximize,
      type: 'icon',
      desc: 'Toggle Fullscreen'
    },
    KeyS: {
      fn: () => skip(),
      id: '+90',
      desc: 'Skip Intro/90s'
    },
    KeyW: {
      fn: () => { fitWidth = !fitWidth },
      id: 'fit_width',
      icon: Proportions,
      type: 'icon',
      desc: 'Toggle Video Cover'
    },
    KeyD: {
      fn: () => toggleCast(),
      id: 'cast',
      icon: Cast,
      type: 'icon',
      desc: 'Toggle Cast [broken]'
    },
    KeyC: {
      fn: () => cycleSubtitles(),
      id: 'subtitles',
      icon: Captions,
      type: 'icon',
      desc: 'Cycle Subtitles'
    },
    ArrowLeft: {
      fn: () => {
        seek(-Number($settings.playerSeek))
      },
      id: 'fast_rewind',
      icon: Rewind,
      type: 'icon',
      desc: 'Rewind'
    },
    ArrowRight: {
      fn: () => {
        seek(Number($settings.playerSeek))
      },
      id: 'fast_forward',
      icon: FastForward,
      type: 'icon',
      desc: 'Seek'
    },
    ArrowUp: {
      fn: () => {
        $volume = Math.min(1, $volume + 0.05)
      },
      id: 'volume_up',
      icon: Volume2,
      type: 'icon',
      desc: 'Volume Up'
    },
    ArrowDown: {
      fn: () => {
        $volume = Math.max(0, $volume - 0.05)
      },
      id: 'volume_down',
      icon: Volume1,
      type: 'icon',
      desc: 'Volume Down'
    },
    BracketLeft: {
      fn: () => { playbackRate = video.defaultPlaybackRate -= 0.1 },
      id: 'history',
      icon: RotateCcw,
      type: 'icon',
      desc: 'Decrease Playback Rate'
    },
    BracketRight: {
      fn: () => { playbackRate = video.defaultPlaybackRate += 0.1 },
      id: 'update',
      icon: RotateCw,
      type: 'icon',
      desc: 'Increase Playback Rate'
    },
    Backslash: {
      fn: () => { playbackRate = video.defaultPlaybackRate = 1 },
      icon: RefreshCcw,
      id: 'schedule',
      type: 'icon',
      desc: 'Reset Playback Rate'
    },
    Semicolon: {
      fn: () => { subtitleDelay -= 0.1 },
      icon: DecimalsArrowLeft,
      type: 'icon',
      id: 'subtitle_delay_minus',
      desc: 'Decrease Subtitle Delay'
    },
    Quote: {
      fn: () => { subtitleDelay += 0.1 },
      icon: DecimalsArrowRight,
      type: 'icon',
      id: 'subtitle_delay_plus',
      desc: 'Increase Subtitle Delay'
    }
  })

  const torrentstats = server.stats

  $condition = () => !isMiniplayer

  let ff = false

  function holdToFF (document: HTMLElement, type: 'key' | 'pointer') {
    const ctrl = new AbortController()
    let timeout = 0
    let oldPlaybackRate = playbackRate
    const startFF = () => {
      timeout = setTimeout(() => {
        paused = false
        ff = true
        oldPlaybackRate = playbackRate
        playbackRate = 2
      }, 1000)
    }
    const endFF = () => {
      clearTimeout(timeout)
      if (ff) {
        ff = false
        playbackRate = oldPlaybackRate
        paused = true
      }
    }
    document.addEventListener(type + 'down' as 'keydown' | 'pointerdown', (event) => {
      if (isMiniplayer) return
      if ('code' in event && (event.code !== 'Space' || event.repeat)) return
      if ('pointerId' in event) document.setPointerCapture(event.pointerId)
      startFF()
    }, { signal: ctrl.signal })
    document.addEventListener(type + 'up' as 'keyup' | 'pointerup', (event) => {
      if (isMiniplayer) return
      if ('code' in event && event.code !== 'Space') return
      if ('pointerId' in event) document.releasePointerCapture(event.pointerId)
      endFF()
    }, { signal: ctrl.signal })

    return { destroy: () => ctrl.abort() }
  }

  $: $w2globby?.playerStateChanged({ paused, time: Math.floor(currentTime) })
  $: $w2globby?.on('player', state => {
    currentTime = state.time
    paused = state.paused
  })
</script>

<svelte:document bind:fullscreenElement bind:visibilityState use:holdToFF={'key'} />

<div class='w-full h-full relative content-center bg-black overflow-clip text-left' class:fitWidth class:seeking bind:this={wrapper} on:navigate={resetMove}>
  <video class='w-full h-full' preload='auto' class:cursor-none={immersed} class:cursor-pointer={isMiniplayer} class:object-cover={fitWidth} class:opacity-0={$settings.playerDeband || seeking} class:absolute={$settings.playerDeband} class:top-0={$settings.playerDeband}
    use:createSubtitles
    use:createDeband={$settings.playerDeband}
    use:holdToFF={'pointer'}
    crossorigin='anonymous'
    src={mediaInfo.file.url}
    bind:videoHeight
    bind:videoWidth
    bind:currentTime
    bind:duration
    bind:ended
    bind:paused
    bind:muted
    bind:readyState
    bind:buffered
    bind:playbackRate
    bind:volume={exponentialVolume}
    bind:this={video}
    on:click={() => isMiniplayer ? goto('/app/player') : playPause()}
    on:dblclick={fullscreen}
    on:loadeddata={checkAudio}
    on:timeupdate={checkSkippableChapters}
    on:timeupdate={checkCompletion}
    on:loadedmetadata={autoPlay}
    on:pointermove={resetMove}
  />
  <div class='absolute w-full h-full flex items-center justify-center top-0 pointer-events-none' class:hidden={isMiniplayer}>
    <div class='absolute top-0 flex w-full pointer-events-none justify-center gap-4 pt-3 items-center font-bold text-lg transition-opacity' class:opacity-0={immersed}>
      <!-- {($torrentstats.progress * 100).toFixed(1)}% -->
      <div class='flex justify-center items-center gap-2'>
        <Users size={18} />
        {$torrentstats.seeders}
      </div>
      <div class='flex justify-center items-center gap-2'>
        <ChevronDown size={18} />
        {fastPrettyBits($torrentstats.down * 8)}/s
      </div>
      <div class='flex justify-center items-center gap-2'>
        <ChevronUp size={18} />
        {fastPrettyBits($torrentstats.up * 8)}/s
      </div>
    </div>
    {#if seeking}
      {#await thumbnailer.getThumbnail(seekIndex) then src}
        <img {src} alt='thumbnail' class='w-full h-full bg-black absolute top-0 right-0 object-contain' loading='lazy' decoding='async' class:!object-cover={fitWidth} />
      {/await}
    {/if}
    {#if stats}
      <div class='absolute top-10 left-10 backdrop-blur-lg border-white/15 border bg-black/20 pointer-events-auto transition-opacity select:opacity-100 px-3 py-2 rounded'>
        <button class='absolute right-3 top-1' type='button' use:click={toggleStats}>×</button>
        FPS: {stats.fps}<br />
        Presented frames: {stats.presented}<br />
        Dropped frames: {stats.dropped}<br />
        Frame time: {stats.processing}<br />
        Viewport: {stats.viewport}<br />
        Resolution: {stats.resolution}<br />
        Buffer health: {stats.buffer}<br />
        Playback speed: x{stats.speed?.toFixed(1)}<br />
        Subtitle delay: {subtitleDelay} sec
      </div>
    {/if}
    <Options {wrapper} bind:openSubs {video} {seekTo} {selectAudio} {selectVideo} {fullscreen} {chapters} {subtitles} {videoFiles} {selectFile} {pip} bind:playbackRate bind:subtitleDelay
      class='{$settings.minimalPlayerUI ? 'inline-flex' : 'mobile:inline-flex hidden'} p-3 w-12 h-12 absolute top-4 left-4 backdrop-blur-lg border-white/15 border bg-black/20 pointer-events-auto transition-opacity select:opacity-100 {immersed && 'opacity-0'}' />
    {#if ff}
      <div class='absolute top-10 font-bold text-sm animate-[fade-in_.4s_ease] flex items-center leading-none bg-black/60 px-4 py-2 rounded-2xl'>x2 <FastForward class='ml-2' size='12' fill='currentColor' /></div>
    {/if}
    <div class='mobile:flex hidden gap-4 absolute items-center transition-opacity select:opacity-100' class:opacity-0={immersed}>
      <Button class='p-3 w-16 h-16 pointer-events-auto rounded-[50%] backdrop-blur-lg border-white/15 border bg-black/20' variant='ghost' disabled={!prev}>
        <SkipBack size='24px' fill='currentColor' strokeWidth='1' />
      </Button>
      <Button class='p-3 w-24 h-24 pointer-events-auto rounded-[50%] backdrop-blur-lg border-white/15 border bg-black/20' variant='ghost' on:click={playPause}>
        {#if paused}
          <Play size='42px' fill='currentColor' class='p-0.5' />
        {:else}
          <Pause size='42px' fill='currentColor' strokeWidth='1' />
        {/if}
      </Button>
      <Button class='p-3 w-16 h-16 pointer-events-auto rounded-[50%] backdrop-blur-lg border-white/15 border bg-black/20' variant='ghost' disabled={!next}>
        <SkipForward size='24px' fill='currentColor' strokeWidth='1' />
      </Button>
    </div>
    {#if buffering}
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
  <div class='absolute w-full bottom-0 flex flex-col gradient px-6 py-3 transition-opacity select:opacity-100' class:opacity-0={immersed} class:hidden={isMiniplayer}>
    <div class='flex justify-between gap-12 items-end'>
      <div class='flex flex-col gap-2 text-left cursor-pointer'>
        <div class='text-white text-lg font-normal leading-none line-clamp-1 hover:text-neutral-300' use:click={() => goto(`/app/anime/${mediaInfo.media.id}`)}>{mediaInfo.session.title}</div>
        <Sheet.Root portal={wrapper}>
          <Sheet.Trigger id='episode-list-button' class='text-[rgba(217,217,217,0.6)] hover:text-neutral-500 text-sm leading-none font-light line-clamp-1 text-left'>{mediaInfo.session.description}</Sheet.Trigger>
          <Sheet.Content class='w-[550px] sm:max-w-full h-full overflow-y-scroll flex flex-col pb-0 shrink-0 gap-0 bg-black justify-between'>
            {#if mediaInfo.media}
              {#await Promise.all([episodes(mediaInfo.media.id), client.single(mediaInfo.media.id)]) then [eps, media]}
                {#if media.data?.Media}
                  <EpisodesList {eps} media={media.data.Media} />
                {/if}
              {/await}
            {/if}
          </Sheet.Content>
        </Sheet.Root>
      </div>
      <div class='flex flex-col gap-2 grow-0 items-end self-end'>
        {#if currentSkippable}
          <Button on:click={skip} class='font-bold mb-2'>
            Skip {currentSkippable}
          </Button>
        {/if}
        <div class='text-[rgba(217,217,217,0.6)] text-sm leading-none font-light line-clamp-1'>{getChapterTitle(seeking ? seekPercent * safeduration / 100 : currentTime, chapters) || ''}</div>
        <div class='ml-auto self-end text-sm leading-none font-light text-nowrap'>{toTS(seeking ? seekPercent * safeduration / 100 : currentTime)} / {toTS(safeduration)}</div>
      </div>
    </div>
    <Seekbar {duration} {currentTime} buffer={buffer / duration * 100} {chapters} bind:seeking bind:seek={seekPercent} on:seeked={finishSeek} on:seeking={startSeek} {thumbnailer} on:keydown={seekBarKey} on:dblclick={fullscreen} />
    <div class='justify-between gap-2 {$settings.minimalPlayerUI ? 'hidden' : 'mobile:hidden flex'}'>
      <div class='flex text-white gap-2'>
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={playPause} on:keydown={keywrap(playPause)} id='player-play-pause-button' data-up='#player-seekbar'>
          {#if paused}
            <Play size='24px' fill='currentColor' class='p-0.5' />
          {:else}
            <Pause size='24px' fill='currentColor' strokeWidth='1' />
          {/if}
        </Button>
        {#if prev}
          <Button class='p-3 w-12 h-12' variant='ghost' on:click={prev} on:keydown={keywrap(prev)} id='player-prev-button' data-up='#player-seekbar' data-right='#player-next-button, #player-volume-button, #player-options-button'>
            <SkipBack size='24px' fill='currentColor' strokeWidth='1' />
          </Button>
        {/if}
        {#if next}
          <Button class='p-3 w-12 h-12' variant='ghost' on:click={next} on:keydown={keywrap(next)} id='player-next-button' data-up='#player-seekbar' data-right='#player-volume-button, #player-options-button'>
            <SkipForward size='24px' fill='currentColor' strokeWidth='1' />
          </Button>
        {/if}
        <Volume bind:volume={$volume} bind:muted />
      </div>
      <div class='flex gap-2'>
        <Options {fullscreen} {wrapper} {seekTo} bind:openSubs {video} {selectAudio} {selectVideo} {chapters} {subtitles} {videoFiles} {selectFile} {pip} bind:playbackRate bind:subtitleDelay id='player-options-button' />
        {#if subtitles}
          <Button class='p-3 w-12 h-12' variant='ghost' on:click={openSubs} on:keydown={keywrap(openSubs)} data-up='#player-seekbar'>
            <Subtitles size='24px' fill='currentColor' strokeWidth='0' />
          </Button>
        {/if}
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={() => pip.pip()} on:keydown={keywrap(() => pip.pip())} data-up='#player-seekbar'>
          {#if pictureInPictureElement}
            <PictureInPictureExit size='24px' strokeWidth='2' />
          {:else}
            <PictureInPictureOff size='24px' strokeWidth='2' />
          {/if}
        </Button>
        {#if false}
          <Button class='p-3 w-12 h-12' variant='ghost' on:click={toggleCast} on:keydown={keywrap(toggleCast)} data-up='#player-seekbar'>
            {#if cast}
              <Cast size='24px' fill='white' strokeWidth='2' />
            {:else}
              <Cast size='24px' strokeWidth='2' />
            {/if}
          </Button>
        {/if}
        <Button class='p-3 w-12 h-12' variant='ghost' on:click={fullscreen} on:keydown={keywrap(fullscreen)} data-up='#player-seekbar'>
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
  .fitWidth :global(.deband-canvas) {
    object-fit: cover !important;
  }

  .seeking :global(.deband-canvas) {
    opacity: 0 !important;
  }
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
