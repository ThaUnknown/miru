<script lang='ts'>
  import Player from './player.svelte'

  import type { resolveFilesPoorly, ResolvedFile } from './resolver'
  import type { MediaInfo } from '$lib/components/ui/player/util'

  import { cover, episodes, title } from '$lib/modules/anilist'
  import { searchStore } from '$lib/components/SearchModal.svelte'

  export let mediaInfo: NonNullable<Awaited<ReturnType<typeof resolveFilesPoorly>>>

  function fileToMedaInfo (file: ResolvedFile): MediaInfo {
    return {
      file,
      episode: Number(file.metadata.episode),
      media: file.metadata.media,
      session: {
        title: title(file.metadata.media),
        description: 'Episode ' + file.metadata.episode, // TODO
        image: cover(file.metadata.media) ?? ''
      }
    }
  }

  let current = fileToMedaInfo(mediaInfo.target)

  function findEpisode (episode: number) {
    return mediaInfo.targetAnimeFiles.find(file => file.metadata.episode === episode)
  }

  function hasNext (file: ResolvedFile) {
    return Number(file.metadata.episode) < (episodes(file.metadata.media) ?? 1)
  }
  function hasPrev (file: ResolvedFile) {
    return Number(file.metadata.episode) > 1
  }
  function playNext () {
    const episode = parseInt('' + mediaInfo.target.metadata.episode) + 1
    const nextFile = findEpisode(episode)
    if (nextFile) {
      current = fileToMedaInfo(nextFile)
    } else {
      searchStore.set({ media: mediaInfo.target.metadata.media, episode })
    }
  }
  function playPrev () {
    const episode = parseInt('' + mediaInfo.target.metadata.episode) - 1
    const prevFile = findEpisode(episode)
    if (prevFile) {
      current = fileToMedaInfo(prevFile)
    } else {
      searchStore.set({ media: mediaInfo.target.metadata.media, episode })
    }
  }

  function selectFile (file: ResolvedFile) {
    current = fileToMedaInfo(file)
  }

  $: next = hasNext(mediaInfo.target)
    ? playNext
    : undefined

  $: prev = hasPrev(mediaInfo.target)
    ? playPrev
    : undefined
</script>

<!-- inefficient, but safe -->
{#key current}
  <Player mediaInfo={current} otherFiles={mediaInfo.otherFiles} videoFiles={mediaInfo.resolvedFiles} {selectFile} {prev} {next} />
{/key}
