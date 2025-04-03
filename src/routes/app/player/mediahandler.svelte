<script lang='ts'>
  import type { resolveFilesPoorly, ResolvedFile } from './resolver'

  import { Player } from '$lib/components/ui/player'
  import { banner, episodes, title } from '$lib/modules/anilist'

  export let mediaInfo: NonNullable<Awaited<ReturnType<typeof resolveFilesPoorly>>>

  function fileToMedaInfo (file: ResolvedFile) {
    return {
      url: file.url,
      episode: file.metadata.episode,
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
    const nextFile = findEpisode(parseInt('' + mediaInfo.target.metadata.episode) + 1)
    if (nextFile) {
      current = fileToMedaInfo(nextFile)
    }
  }
  function playPrev () {
    const prevFile = findEpisode(parseInt('' + mediaInfo.target.metadata.episode) - 1)
    if (prevFile) {
      current = fileToMedaInfo(prevFile)
    }
  }

  $: next = hasNext(mediaInfo.target)
    ? playNext
    : undefined

  $: prev = hasPrev(mediaInfo.target)
    ? playPrev
    : undefined
</script>

<Player mediaInfo={current} {prev} {next} />
