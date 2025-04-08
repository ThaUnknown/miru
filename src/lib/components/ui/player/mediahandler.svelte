<script lang='ts'>
  import Player from './player.svelte'

  import type { resolveFilesPoorly, ResolvedFile } from './resolver'
  import type { MediaInfo } from '$lib/components/ui/player/util'

  import { banner, episodes, title } from '$lib/modules/anilist'
  import { searchStore } from '$lib/components/SearchModal.svelte'

  export let mediaInfo: NonNullable<Awaited<ReturnType<typeof resolveFilesPoorly>>>

  function fileToMedaInfo (file: ResolvedFile): MediaInfo {
    return {
      file,
      episode: Number(file.metadata.episode),
      media: file.metadata.media,
      session: {
        title: title(file.metadata.media),
        description: 'N/A', // TODO
        image: banner(file.metadata.media) ?? ''
      }
    }
  }

  let current = fileToMedaInfo(mediaInfo.target)

  function findEpisode (episode: number) {
    return mediaInfo.targetAnimeFiles.find(file => file.metadata.episode === episode) ?? mediaInfo.targetAnimeFiles.find(file => file.metadata.episode === 1)
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

  $: next = hasNext(mediaInfo.target)
    ? playNext
    : undefined

  $: prev = hasPrev(mediaInfo.target)
    ? playPrev
    : undefined
</script>

<Player mediaInfo={current} files={mediaInfo.otherFiles} {prev} {next} />
