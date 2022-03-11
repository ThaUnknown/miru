<script>
  import { getContext } from 'svelte'
  import { countdown } from '@/modules/util.js'

  let view = getContext('view')
  $: console.log($view)
  function close() {
    $view = null
  }
  const detailsMap = [
    { property: 'episode', label: 'Airing', icon: 'schedule', custom: 'property' },
    { property: 'genres', label: 'Genres', icon: 'theater_comedy' },
    { property: 'season', label: 'Season', icon: 'spa', custom: 'property' },
    { property: 'episodes', label: 'Episodes', icon: 'theaters', custom: 'property' },
    { property: 'duration', label: 'Duration', icon: 'timer', custom: 'property' },
    { property: 'format', label: 'Format', icon: 'monitor' },
    { property: 'status', label: 'Status', icon: 'live_tv' },
    { property: 'nodes', label: 'Studio', icon: 'business' },
    { property: 'source', label: 'Source', icon: 'source' },
    { property: 'averageScore', label: 'Rating', icon: 'trending_up', custom: 'property' },
    { property: 'english', label: 'English', icon: 'title' },
    { property: 'romaji', label: 'Romaji', icon: 'translate' },
    { property: 'native', label: 'Native', icon: '語', custom: 'icon' }
  ]
  function getCustomProperty(detail, media) {
    if (detail.property === 'episodes') {
      if (media.progress) {
        return `Watched <b>${media.progress}</b> of <b>${media.episodes}</b>`
      }
      return `${media.episodes} Episodes`
    } else if (detail.property === 'averageScore') {
      return media.averageScore + '%'
    } else if (detail.property === 'duration') {
      return `${media.duration} minutes`
    } else if (detail.property === 'season') {
      return [media.season?.toLowerCase(), media.seasonYear].filter(f => f).join(' ')
    } else if (detail.property === 'episode') {
      return `Ep ${media.nextAiringEpisode.episode}: ${countdown(media.nextAiringEpisode.timeUntilAiring)}`
    } else {
      return media[detail.property]
    }
  }
  function getProperty(property, media) {
    if (property === 'episode') {
      return media.nextAiringEpisode?.episode
    } else if (property === 'english' || property === 'romaji' || property === 'native') {
      return media.title[property]
    }
    return media[property]
  }
</script>

<div class="modal modal-full" class:show={$view} id="viewAnime" tabindex="-1" role="dialog">
  {#if $view}
    <div class="h-full modal-content bg-very-dark p-0 overflow-y-auto">
      <button class="close pointer z-30 bg-dark shadow-lg border" type="button" on:click={close}>
        <span>×</span>
      </button>
      <div class="h-md-half w-full position-relative z-20">
        <div class="h-full w-full position-absolute bg-dark-light banner" style:--bannerurl={`url('${$view.bannerImage || ''}')`} />
        <div class="d-flex h-full top w-full">
          <div class="container-xl w-full">
            <div class="row d-flex justify-content-end flex-row h-full px-20 pt-20 px-xl-0">
              <div class="col-md-3 col-4 d-flex h-full justify-content-end flex-column pb-15 align-items-center">
                <img class="contain-img rounded mw-full mh-full shadow" alt="cover" src={$view.coverImage?.extraLarge || $view.coverImage?.medium} />
              </div>
              <div class="col-md-9 col-8 row align-content-end pl-20">
                <div class="col-md-8 col-12 d-flex justify-content-end flex-column">
                  <div class="px-md-20 d-flex flex-column font-size-12">
                    <span class="title font-weight-bold pb-sm-15 text-white">
                      {$view.title.userPreferred}
                    </span>
                    <div class="d-flex flex-row font-size-18 pb-sm-15">
                      <span class="material-icons mr-10 font-size-24"> trending_up </span>
                      <span>
                        Rating: {$view.averageScore + '%'}
                        <span class="font-weight-bold mr-20" />
                      </span>
                      <span class="material-icons mx-10 font-size-24"> monitor </span>
                      <span>
                        Format: {'TV' ? $view.format : $view.format?.toLowerCase()}
                        <span class="font-weight-bold mr-20 text-capitalize" />
                      </span>
                      {#if $view.episodes === 1 || (!$view.episodes && !$view.nextAiringEpisode?.episode)}
                        <span class="material-icons mx-10 font-size-24"> theaters </span>
                        <span>
                          Episodes: {$view.episodes}
                          <span class="font-weight-bold mr-20" />
                        </span>
                      {:else}
                        <span class="material-icons mx-10 font-size-24"> timer </span>
                        <span>
                          Length: {$view.duration + ' min'}
                          <span class="font-weight-bold mr-20" />
                        </span>
                      {/if}
                    </div>
                    <div class="pb-15 pt-5 overflow-x-auto text-nowrap font-weight-bold">
                      {#each $view.genres as genre}
                        <div class="badge badge-pill shadow">
                          {genre}
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
                <div class="col-md-4 d-flex justify-content-end flex-column">
                  <div class="d-flex flex-column flex-wrap">
                    <button class="btn btn-primary d-flex align-items-center font-weight-bold font-size-24 h-50 mb-5" type="button">
                      <span class="material-icons mr-10 font-size-24 w-30"> play_arrow </span>
                      <span>Play</span>
                    </button>
                    <button class="btn d-flex align-items-center mb-5 font-weight-bold font-size-16">
                      <span class="material-icons mr-10 font-size-18 w-30"> live_tv </span>
                      Trailer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container-xl bg-very-dark z-10">
        <div class="row p-20 px-xl-0 flex-column-reverse flex-md-row">
          <div class="col-md-9 px-20">
            <h1 class="title font-weight-bold text-white">Sypnosis</h1>
            <div class="font-size-16 pr-15">
              {@html $view.description}
            </div>
            <!-- <h1 class="title font-weight-bold text-white pt-20">Episodes</h1>
          <div class="d-flex flex-wrap justify-content-start"> -->
            <!-- <div class="position-relative w-250 rounded mr-10 mb-10 overflow-hidden pointer">
              <img loading="lazy"
                src="https://img1.ak.crunchyroll.com/i/spire1-tmb/b199406edeebc19a7f4e4412d6e1dfcc1365964779_full.jpg"
                class="w-full h-full">
              <div class="position-absolute ep-title w-full p-5 text-truncate bottom-0">Episode 1 - To You, 2,000
                Years in the Future -The Fall of Zhiganshina (1)</div>
            </div> -->
            <!-- </div> -->
          </div>
          <div class="col-md-3 px-sm-0 px-20">
            <h1 class="title font-weight-bold text-white">Details</h1>
            <div class="card m-0 px-20 py-10 d-flex flex-md-column flex-row overflow-x-auto text-capitalize" id="viewDetails">
              {#each detailsMap as detail}
                {@const property = getProperty(detail.property, $view)}
                {#if property}
                  <div class="d-flex flex-row px-10 py-5">
                    <div class={'mr-10 ' + (detail.custom === 'icon' ? 'd-flex align-items-center text-nowrap font-size-20 font-weight-bold' : 'material-icons font-size-24')}>
                      {detail.icon}
                    </div>
                    <div class="d-flex flex-column justify-content-center text-nowrap">
                      <div class="font-weight-bold">
                        {#if detail.custom === 'property'}
                          {getCustomProperty(detail, $view)}
                        {:else if property.constructor === Array}
                          {property === 'nodes' ? property[0] && property[0].name : property.join(', ').replace(/_/g, ' ').toLowerCase()}
                        {:else}
                          {property.toString().replace(/_/g, ' ').toLowerCase()}
                        {/if}
                      </div>
                      <div />
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .banner {
    background: no-repeat center center;
    background-size: cover;
    background-image: linear-gradient(0deg, rgba(17, 20, 23, 1) 0%, rgba(17, 20, 23, 0.8) 25%, rgba(17, 20, 23, 0.4) 50%, rgba(37, 40, 44, 0) 100%), var(--bannerurl) !important;
  }

  .top {
    backdrop-filter: blur(10px);
  }

  /* #viewEpisodesWrapper.hidden {
    opacity: 0;
    height: 0
}

#viewEpisodesWrapper {
    opacity: 1;
    height: auto;
    transition: opacity .2s cubic-bezier(.25, .8, .25, 1);
    overflow: hidden;
} */

  .card {
    background-color: var(--dm-button-bg-color) !important;
    background-image: var(--dm-button-bg-image) !important;
    box-shadow: var(--dm-button-box-shadow) !important;
  }

  .title {
    font-size: 4rem;
  }

  .badge {
    background-color: var(--dm-button-bg-color) !important;
    padding: 0.6rem 2rem;
    font-size: 1.4rem;
    border: none;
    margin-right: 0.6rem;
  }
</style>
