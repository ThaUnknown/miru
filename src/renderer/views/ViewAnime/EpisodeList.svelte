<script>
  import { since } from '@/modules/util'
  import { click } from '@/modules/click.js'
  import { getEpisodeNumberByAirDate } from '@/modules/providers/tosho.js'
  import { alRequest } from '@/modules/anilist'
  import { media } from '../Player/MediaHandler.svelte'

  export let id

  export let episodeCount

  export let userProgress = 0

  export let duration

  export let play

  const episodeList = Array.from({ length: episodeCount }, (_, i) => ({ episode: i + 1 }))
  async function load () {
    const episodesPromise = alRequest({ method: 'Episodes', id })
    const res = await fetch('https://api.ani.zip/mappings?anilist_id=' + id)
    const { episodes, specialCount, episodeCount } = await res.json()
    const settled = (await episodesPromise).data.Page?.airingSchedules
    const alEpisodes = settled?.length ? settled : episodeList
    for (const { episode, airingAt } of alEpisodes) {
      const alDate = new Date((airingAt || 0) * 1000)

      const needsValidation = !(!specialCount || (media.episodes && media.episodes === episodeCount && episodes[Number(episode)]))
      const { image, summary, rating, title, length, airdate } = needsValidation ? getEpisodeNumberByAirDate(alDate, episodes, episode) : (episodes[Number(episode)] || {})

      episodeList[episode - 1] = { episode, image, summary, rating, title, length: length || duration, airdate: +alDate || airdate }
    }
  }
  load()
</script>

{#each episodeList as { episode, image, summary, rating, title, length, airdate }}
  {@const completed = userProgress >= episode}
  {@const target = userProgress + 1 === episode}
  <div class='w-full my-20 content-visibility-auto scale' class:opacity-half={completed} class:px-20={!target} class:h-150={image || summary} use:click={() => play(episode)}>
    <div class='rounded w-full h-full overflow-hidden d-flex flex-row pointer' class:border={target} class:bg-black={completed} class:bg-dark={!completed}>
      {#if image}
        <div class='w-450 h-full'>
          <img alt='thumbnail' src={image} class='img-cover h-full w-full' />
        </div>
      {/if}
      <div class='h-full w-full px-20 py-15 d-flex flex-column'>
        <div class='w-full d-flex flex-row mb-15'>
          <div class='text-white font-weight-bold font-size-16 overflow-hidden title'>
            {episode}. {title?.en || 'Episode ' + episode}
          </div>
          {#if length}
            <div class='ml-auto pl-5'>
              {length}m
            </div>
          {/if}
        </div>
        {#if completed}
          <div class='progress mb-15' style='height: 2px; min-height: 2px;'>
            <div class='progress-bar w-full' />
          </div>
        {/if}
        <div class='font-size-12 overflow-hidden'>
          {summary || ''}
        </div>
        <div class='pt-10 font-size-12 mt-auto'>
          {#if airdate}
            {since(new Date(airdate))}
          {/if}
        </div>
      </div>
    </div>
  </div>
{/each}

<style>
  .opacity-half {
    opacity: 30%;
  }
  .title {
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .scale {
    transition: transform 0.2s ease;
  }
  .scale:hover{
    transform: scale(1.05);
  }
  .border {
    --dm-border-color: white
  }
</style>
