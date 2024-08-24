<script context='module'>
  let fillerEpisodes = {}

  fetch('https://raw.githubusercontent.com/ThaUnknown/filler-scrape/master/filler.json').then(async res => {
    fillerEpisodes = await res.json()
  })
</script>

<script>
  import { since } from '@/modules/util'
  import { click } from '@/modules/click.js'
  import { episodeByAirDate } from '@/modules/extensions/index.js'
  import { anilistClient } from '@/modules/anilist'
  import { liveAnimeProgress } from '@/modules/animeprogress.js'

  export let media

  export let episodeOrder = true

  export let watched = false

  const id = media.id

  const duration = media.duration

  export let episodeCount

  export let userProgress = 0

  export let play

  const episodeList = Array.from({ length: episodeCount }, (_, i) => ({
    episode: i + 1, image: null, summary: null, rating: null, title: null, length: null, airdate: null, airingAt: null, filler: fillerEpisodes[id]?.includes(i + 1)
  }))
  async function load () {
    const res = await fetch('https://api.ani.zip/mappings?anilist_id=' + id)
    const { episodes, specialCount, episodeCount } = await res.json()
    /** @type {{ airingAt: number; episode: number; filler?: boolean }[]} */
    let alEpisodes = episodeList

    // fallback: pull episodes from airing schedule if anime doesn't have expected episode count
    if (!(media.episodes && media.episodes === episodeCount && media.status === 'FINISHED')) {
      const settled = (await anilistClient.episodes({ id })).data.Page?.airingSchedules
      if (settled?.length) alEpisodes = settled
    }
    for (const { episode, airingAt, filler } of alEpisodes) {
      const alDate = new Date((airingAt || 0) * 1000)

      // validate by air date if the anime has specials AND doesn't have matching episode count
      const needsValidation = !(!specialCount || (media.episodes && media.episodes === episodeCount && episodes[Number(episode)]))
      const { image, summary, rating, title, length, airdate } = needsValidation ? episodeByAirDate(alDate, episodes, episode) : (episodes[Number(episode)] || {})

      episodeList[episode - 1] = { episode, image, summary, rating, title, length: length || duration, airdate: +alDate || airdate, airingAt: +alDate || airdate, filler }
    }
  }
  load()

  const animeProgress = liveAnimeProgress(id)
</script>

{#each episodeOrder ? episodeList : [...episodeList].reverse() as { episode, image, summary, rating, title, length, airdate, filler }}
  {@const completed = !watched && userProgress >= episode}
  {@const target = userProgress + 1 === episode}
  {@const progress = !watched && ($animeProgress?.[episode] ?? 0)}
  <div class='w-full my-20 content-visibility-auto scale' class:opacity-half={completed} class:px-20={!target} class:h-150={image || summary}>
    <div class='rounded w-full h-full overflow-hidden d-flex flex-xsm-column flex-row pointer position-relative' class:border={target || filler} class:bg-black={completed} class:border-secondary={filler} class:bg-dark={!completed} use:click={() => play(episode)}>
      {#if image}
        <div class='h-full'>
          <img alt='thumbnail' src={image} class='img-cover h-full' />
        </div>
      {/if}
      {#if filler}
        <div class='position-absolute bottom-0 right-0 bg-secondary py-5 px-10 text-dark rounded-top rounded-left font-weight-bold'>
          Filler
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
        {:else if progress}
          <div class='progress mb-15' style='height: 2px; min-height: 2px;'>
            <div class='progress-bar' style='width: {progress}%' />
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
  @media (max-width: 470px) {
    .flex-xsm-column {
      flex-direction: column !important;
    }
    .scale {
      height: auto !important;
    }
    img {
      width: 100%;
      height: 15rem !important;
    }
  }
</style>
