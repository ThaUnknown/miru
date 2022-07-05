<script>
  import { playAnime } from './RSSView.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { getMediaMaxEp } from '@/modules/anime.js'
  import { getContext } from 'svelte'
  import { alToken } from '@/lib/pages/Settings.svelte'
  import { countdown } from '@/modules/util.js'
  import { addToast } from './Toasts.svelte'

  const view = getContext('view')
  function close () {
    $view = null
  }
  $: media = $view
  let modal
  $: media && modal?.focus()
  $: !$trailer && modal?.focus()
  let following = null
  async function updateFollowing (media) {
    if (media) {
      following = null
      following = (await alRequest({ method: 'Following', id: media.id })).data?.Page?.mediaList
    }
  }
  $: updateFollowing(media)
  $: maxPlayEp = getMediaMaxEp($view || {}, true)
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  const statusMap = {
    CURRENT: 'Watching',
    PLANNING: 'Planning',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped',
    PAUSED: 'Paused',
    REPEATING: 'Re-Watching'
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
  function getCustomProperty (detail, media) {
    if (detail.property === 'episodes') {
      if (media.mediaListEntry?.progress) {
        return `Watched <b>${media.mediaListEntry.progress}</b> of <b>${getMediaMaxEp(media)}</b>`
      }
      return `${getMediaMaxEp(media)} Episodes`
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
  function getProperty (property, media) {
    if (property === 'episode') {
      return media.nextAiringEpisode?.episode
    } else if (property === 'english' || property === 'romaji' || property === 'native') {
      return media.title[property]
    }
    return media[property]
  }
  async function addToList (media) {
    if (media.mediaListEntry?.status !== 'CURRENT' && media.mediaListEntry?.status !== 'COMPLETED') {
      const variables = {
        method: media.mediaListEntry?.status !== 'PLANNING' ? 'Entry' : 'Delete',
        id: media.mediaListEntry?.status !== 'PLANNING' ? media.id : media.mediaListEntry.id,
        status: 'PLANNING'
      }
      await alRequest(variables)
      $view = (await alRequest({ method: 'SearchIDSingle', id: media.id })).data.Media
    }
  }
  async function score (media, score) {
    const variables = {
      method: 'Entry',
      id: media.id,
      score: score * 10
    }
    await alRequest(variables)
    $view = (await alRequest({ method: 'SearchIDSingle', id: media.id })).data.Media
  }
  const trailer = getContext('trailer')
  function viewTrailer (media) {
    $trailer = media.trailer.id
  }
  function copyToClipboard (text) {
    navigator.clipboard.writeText(text)
    addToast({
      title: 'Copied to clipboard',
      text: 'Copied share URL to clipboard',
      type: 'primary',
      duration: '5000'
    })
  }
  function openInBrowser (url) {
    window.IPC.emit('open', url)
  }
  let showMoreRelations = false
  function toggleRelations () {
    showMoreRelations = !showMoreRelations
  }
  let showMoreRecommendations = false
  function toggleRecommendations () {
    showMoreRecommendations = !showMoreRecommendations
  }
</script>

<div class="modal modal-full" class:show={media} on:keydown={checkClose} tabindex="-1" bind:this={modal}>
  {#if media}
    <div class="h-full modal-content bg-very-dark p-0 overflow-y-auto">
      <button class="close pointer z-30 bg-dark shadow-lg top-20 right-0" type="button" on:click={close}> &times; </button>
      <div class="h-md-half w-full position-relative z-20">
        <div class="h-full w-full position-absolute bg-dark-light banner" style:--bannerurl={`url('${media.bannerImage || ''}')`} />
        <div class="d-flex h-full top w-full">
          <div class="container-xl w-full">
            <div class="row d-flex justify-content-end flex-row h-full px-20 pt-20 px-xl-0">
              <div class="col-md-3 col-4 d-flex h-full justify-content-end flex-column pb-15 align-items-center">
                <img class="contain-img rounded mw-full mh-full shadow" alt="cover" src={media.coverImage?.extraLarge || media.coverImage?.medium} />
              </div>
              <div class="col-md-9 col-8 row align-content-end pl-20">
                <div class="col-md-8 col-12 d-flex justify-content-end flex-column">
                  <div class="px-md-20 d-flex flex-column font-size-12">
                    <span class="title font-weight-bold pb-sm-15 text-white">
                      {media.title.userPreferred}
                    </span>
                    <div class="d-flex flex-row font-size-18 pb-sm-15">
                      {#if media.averageScore}
                        <span class="material-icons mr-10 font-size-24"> trending_up </span>
                        <span>
                          Rating: {media.averageScore + '%'}
                          <span class="font-weight-bold mr-20" />
                        </span>
                      {/if}
                      <span class="material-icons mx-10 font-size-24"> monitor </span>
                      <span>
                        Format: {media.format === 'TV' ? media.format : media.format?.toLowerCase()}
                        <span class="font-weight-bold mr-20 text-capitalize" />
                      </span>
                      {#if media.episodes !== 1 && getMediaMaxEp(media)}
                        <span class="material-icons mx-10 font-size-24"> theaters </span>
                        <span>
                          Episodes: {getMediaMaxEp(media)}
                          <span class="font-weight-bold mr-20" />
                        </span>
                      {:else if media.duration}
                        <span class="material-icons mx-10 font-size-24"> timer </span>
                        <span>
                          Length: {media.duration + ' min'}
                          <span class="font-weight-bold mr-20" />
                        </span>
                      {/if}
                    </div>
                    <div class="pb-15 pt-5 overflow-x-auto text-nowrap font-weight-bold">
                      {#each media.genres as genre}
                        <div class="badge badge-pill shadow">
                          {genre}
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
                <div class="col-md-4 d-flex justify-content-end flex-column">
                  <div class="d-flex flex-column flex-wrap">
                    <button
                      class="btn btn-primary d-flex align-items-center font-weight-bold font-size-24 h-50 mb-5 shadow-lg"
                      type="button"
                      on:click={() => {
                        playAnime(media, Math.min(maxPlayEp, media.mediaListEntry?.progress + 1))
                        close()
                      }}>
                      <span class="material-icons mr-10 font-size-24 w-30"> play_arrow </span>
                      <span>{(media.mediaListEntry?.progress && media.mediaListEntry?.status !== 'COMPLETED') ? 'Continue ' + Math.min(maxPlayEp, media.mediaListEntry?.progress + 1) : 'Play'}</span>
                    </button>
                    {#if alToken}
                      {#if media.mediaListEntry?.status !== 'CURRENT' && media.mediaListEntry?.status !== 'COMPLETED'}
                        <button class="btn d-flex align-items-center mb-5 font-weight-bold font-size-16 btn-primary shadow-lg" on:click={() => addToList(media)}>
                          <span class="material-icons mr-10 font-size-18 w-30"> {media.mediaListEntry?.status !== 'PLANNING' ? 'add' : 'remove'} </span>
                          {media.mediaListEntry?.status !== 'PLANNING' ? 'Add To List' : 'Remove From List'}
                        </button>
                      {/if}
                      <div class="input-group shadow-lg mb-5 font-size-16">
                        <div class="input-group-prepend">
                          <span class="input-group-text bg-tp pl-15 d-flex material-icons font-size-18">hotel_class</span>
                        </div>
                        <select class="form-control" required value={(media.mediaListEntry?.score || '').toString()} on:change={({ target }) => { score(media, target.value) }}>
                          <option value selected disabled hidden>Score</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                        </select>
                      </div>
                    {/if}
                    {#if media.trailer}
                      <button class="btn d-flex align-items-center mb-5 font-weight-bold font-size-16 shadow-lg" on:click={() => viewTrailer(media)}>
                        <span class="material-icons mr-15 font-size-18 w-30"> live_tv </span>
                        Trailer
                      </button>
                    {/if}
                    <div class="d-flex mb-5 w-full">
                      <button class="btn flex-fill font-weight-bold font-size-16 shadow-lg d-flex align-items-center" on:click={() => { openInBrowser(`https://anilist.co/anime/${media.id}`) }}>
                        <span class="material-icons mr-15 font-size-18 w-30"> open_in_new </span>
                        Open
                      </button>
                      <button class="btn flex-fill font-weight-bold font-size-16 ml-5 shadow-lg d-flex align-items-center" on:click={() => { copyToClipboard(`<miru://anime/${media.id}>`) }}>
                        <span class="material-icons mr-15 font-size-18 w-30"> share </span>
                        Share
                      </button>
                    </div>
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
            <h1 class="title font-weight-bold text-white">Synopsis</h1>
            <div class="font-size-16 pr-15">
              {@html media.description}
            </div>
            {#if media.relations?.edges?.filter(({ node }) => node.type === 'ANIME').length}
            <span class="d-flex align-items-end pointer text-decoration-none mt-20 pt-20" on:click={toggleRelations}>
              <h1 class="font-weight-bold text-white">Relations</h1>
              <h6 class="ml-auto font-size-12 more text-muted">{showMoreRelations ? 'Show Less' : 'Show More'}</h6>
            </span>
              <div class="d-flex text-capitalize flex-wrap pt-20 justify-center">
                {#each media.relations?.edges.filter(({ node }) => node.type === 'ANIME').slice(0, showMoreRelations ? 100 : 4) as { relationType, node }}
                  <div class="w-150 mx-15 mb-10 rel pointer" on:click={async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: node.id })).data.Media }}>
                    <img loading="lazy" src={node.coverImage.medium || ''} alt="cover" class="cover-img w-full h-200 rel-img" />
                    <div class="pt-5">{relationType.replace(/_/g, ' ').toLowerCase()}</div>
                    <h5 class="font-weight-bold text-white">{node.title.userPreferred}</h5>
                  </div>
                {/each}
              </div>
            {/if}
            {#if maxPlayEp}
              <table class="table table-hover w-500 table-auto">
                <thead>
                  <tr>
                    <th class="px-0"><h2 class="title font-weight-bold text-white pt-20 mb-5">Episodes</h2></th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {#each Array(maxPlayEp) as _, i}
                    {@const ep = maxPlayEp - i}
                    <tr class="font-size-20 py-10 pointer {ep <= media.mediaListEntry?.progress ? 'text-muted' : 'text-white'}"
                      on:click={() => {
                        playAnime(media, ep)
                        close()
                      }}>
                      <td class="w-full font-weight-semi-bold">Episode {ep}</td>
                      <td class="material-icons text-right h-full d-table-cell">play_arrow</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {/if}
            {#if media.recommendations?.edges?.length}
            <span class="d-flex align-items-end pointer text-decoration-none mt-20 pt-20" on:click={toggleRecommendations}>
              <h1 class="font-weight-bold text-white">Recommendations</h1>
              <h6 class="ml-auto font-size-12 more text-muted">{showMoreRecommendations ? 'Show Less' : 'Show More'}</h6>
            </span>
              <div class="d-flex text-capitalize flex-wrap pt-20 justify-center">
                {#each media.recommendations.edges.slice(0, showMoreRecommendations ? 100 : 4) as { node }}
                  <div class="w-150 mx-15 mb-10 rel pointer" on:click={async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: node.mediaRecommendation.id })).data.Media }}>
                    <img loading="lazy" src={node.mediaRecommendation.coverImage.medium || ''} alt="cover" class="cover-img w-full h-200 rel-img" />
                    <h5 class="font-weight-bold text-white">{node.mediaRecommendation.title.userPreferred}</h5>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
          <div class="col-md-3 px-sm-0 px-20">
            <h1 class="title font-weight-bold text-white">Details</h1>
            <div class="card m-0 px-20 py-10 d-flex flex-md-column flex-row overflow-x-auto text-capitalize">
              {#each detailsMap as detail}
                {@const property = getProperty(detail.property, media)}
                {#if property}
                  <div class="d-flex flex-row px-10 py-5">
                    <div class={'mr-10 ' + (detail.custom === 'icon' ? 'd-flex align-items-center text-nowrap font-size-20 font-weight-bold' : 'material-icons font-size-24')}>
                      {detail.icon}
                    </div>
                    <div class="d-flex flex-column justify-content-center text-nowrap">
                      <div class="font-weight-bold">
                        {#if detail.custom === 'property'}
                          {@html getCustomProperty(detail, media)}
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
            {#if following?.length}
              <h2 class="font-weight-bold text-white mt-20">Following</h2>
              <div class="card m-0 px-20 pt-15 pb-5 flex-column">
                {#each following as friend}
                  <div class="d-flex align-items-center w-full pb-10 px-10">
                    <img src={friend.user.avatar.medium} alt="avatar" class="w-30 h-30 img-fluid rounded" />
                    <span class="my-0 pl-10 mr-auto text-truncate">{friend.user.name}</span>
                    <span class="my-0 px-10 text-capitalize">{statusMap[friend.status]}</span>
                    <span class="material-icons pointer text-primary font-size-18" on:click={() => window.IPC.emit('open', 'https://anilist.co/user/' + friend.user.name)}> open_in_new </span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .more:hover {
    color: var(--dm-link-text-color-hover) !important;
  }
  .banner {
    background: no-repeat center center;
    background-size: cover;
    background-image: linear-gradient(0deg, rgba(17, 20, 23, 1) 0%, rgba(17, 20, 23, 0.8) 25%, rgba(17, 20, 23, 0.4) 50%, rgba(37, 40, 44, 0) 100%), var(--bannerurl) !important;
  }

  select.form-control:invalid {
    color: var(--dm-input-placeholder-text-color);
  }

  .rel-img{
    height: 27rem;
    width: 17rem
  }

  .cover-img {
    object-fit: cover;
  }

  .rel {
    transition: transform 0.2s ease;
  }
  .rel:hover {
    transform: scale(1.05);
  }
  .d-table-cell {
    display: table-cell !important;
  }

  .top {
    backdrop-filter: blur(10px);
  }

  .card {
    background-color: var(--dm-button-bg-color) !important;
    background-image: var(--dm-button-bg-image) !important;
    box-shadow: var(--dm-button-box-shadow) !important;
  }

  .bg-tp {
    background-color: var(--dm-button-bg-color) !important;
  }

  .title {
    font-size: 4rem;
  }
  .close {
    top: 1rem !important;
    left: unset;
    right: 2.5rem !important;
  }
  .badge {
    background-color: var(--dm-button-bg-color) !important;
    padding: 0.6rem 2rem;
    font-size: 1.4rem;
    border: none;
    margin-right: 0.6rem;
  }
  .w-30 {
    width: 3rem
  }
  .h-30 {
    height: 3rem
  }
</style>
