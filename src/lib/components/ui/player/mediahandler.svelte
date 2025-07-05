<script lang='ts' context='module'>
  import { writable } from 'svelte/store'

  import { searchStore } from '$lib'

  export const playEp = writable((media: Media, episode: number) => searchStore.set({ media, episode }))
</script>

<script lang='ts'>

  import Externalplayer from './externalplayer.svelte'
  import Player from './player.svelte'

  import type { MediaInfo } from '$lib/components/ui/player/util'
  import type { resolveFilesPoorly, ResolvedFile } from './resolver'

  import { goto } from '$app/navigation'
  import { fillerEpisodes } from '$lib/components/EpisodesList.svelte'
  import { cover, episodes, title, type Media } from '$lib/modules/anilist'
  import { settings } from '$lib/modules/settings'
  import { server } from '$lib/modules/torrent'
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
    playEpisode(current.media, episode)
  }
  function playPrev () {
    let episode = parseInt('' + current.episode) - 1
    if ($settings.playerSkipFiller) {
      while (fillerEpisodes[current.media.id]?.includes(episode)) {
        episode--
      }
      episode = Math.max(1, episode)
    }
    playEpisode(current.media, episode)
  }

  function playEpisode (media: Media, episode: number) {
    if (episode === current.episode && media.id === current.media.id) return searchStore.set({ media, episode })
    const file = mediaInfo.resolvedFiles.find(res => res.metadata.episode === episode && res.metadata.media.id === media.id)
    if (file) {
      current = fileToMedaInfo(file)
      server.last.update(last => ({ media, episode, id: last!.id }))
      goto('/app/player')
    } else {
      searchStore.set({ media, episode })
    }
  }

  $: $playEp = playEpisode

  function selectFile (file: ResolvedFile) {
    current = fileToMedaInfo(file)
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
