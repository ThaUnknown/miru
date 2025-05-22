<script lang='ts'>
  import Externalplayer from './externalplayer.svelte'
  import Player from './player.svelte'

  import type { MediaInfo } from '$lib/components/ui/player/util'
  import type { resolveFilesPoorly, ResolvedFile } from './resolver'

  import { searchStore } from '$lib'
  import { fillerEpisodes } from '$lib/components/EpisodesList.svelte'
  import { cover, episodes, title } from '$lib/modules/anilist'
  import { settings } from '$lib/modules/settings'
  import { w2globby } from '$lib/modules/w2g/lobby'

  export let mediaInfo: NonNullable<Awaited<ReturnType<typeof resolveFilesPoorly>>>

  function fileToMedaInfo (file: ResolvedFile): MediaInfo {
    return {
      file,
      episode: Number(file.metadata.episode),
      media: file.metadata.media,
      session: {
        title: title(file.metadata.media),
        description: 'Episode ' + file.metadata.episode,
        image: cover(file.metadata.media) ?? ''
      }
    }
  }

  let current = fileToMedaInfo(mediaInfo.target)

  $: $w2globby?.mediaIndexChanged(mediaInfo.resolvedFiles.indexOf(current.file))
  $: $w2globby?.on('index', index => {
    const file = mediaInfo.resolvedFiles[index]
    if (file) {
      current = fileToMedaInfo(file)
    }
  })

  function findEpisode (episode: number) {
    return mediaInfo.targetAnimeFiles.find(file => file.metadata.episode === episode)
  }

  function hasNext (file: MediaInfo) {
    return Number(file.episode) < (episodes(file.media) ?? 1)
  }
  function hasPrev (file: MediaInfo) {
    return Number(file.episode) > 1
  }
  function playNext () {
    let episode = parseInt('' + current.episode) + 1
    if ($settings.playerSkipFiller) {
      while (fillerEpisodes[current.media.id]?.includes(episode)) {
        episode++
      }
      episode = Math.min(episode, episodes(current.media) ?? 1)
    }
    const nextFile = findEpisode(episode)
    if (nextFile) {
      current = fileToMedaInfo(nextFile)
    } else {
      searchStore.set({ media: current.media, episode })
    }
  }
  function playPrev () {
    let episode = parseInt('' + current.episode) - 1
    if ($settings.playerSkipFiller) {
      while (fillerEpisodes[current.media.id]?.includes(episode)) {
        episode--
      }
      episode = Math.max(1, episode)
    }
    const prevFile = findEpisode(episode)
    if (prevFile) {
      current = fileToMedaInfo(prevFile)
    } else {
      searchStore.set({ media: current.media, episode })
    }
  }

  function selectFile (file: ResolvedFile) {
    current = fileToMedaInfo(file)
    $w2globby?.mediaIndexChanged(mediaInfo.resolvedFiles.indexOf(current.file))
  }

  $: next = hasNext(current)
    ? playNext
    : undefined

  $: prev = hasPrev(current)
    ? playPrev
    : undefined
</script>

<!-- TODO: inefficient, but safe -->
{#key current}
  {#if $settings.enableExternal}
    <Externalplayer mediaInfo={current} otherFiles={mediaInfo.otherFiles} videoFiles={mediaInfo.resolvedFiles} {selectFile} {prev} {next} />
  {:else}
    <Player mediaInfo={current} otherFiles={mediaInfo.otherFiles} videoFiles={mediaInfo.resolvedFiles} {selectFile} {prev} {next} />
  {/if}
{/key}
