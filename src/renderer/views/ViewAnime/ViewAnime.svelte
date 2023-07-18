<script>
  import { getContext } from 'svelte'
  import { getMediaMaxEp, formatMap, playMedia, setStatus } from '@/modules/anime.js'
  import { playAnime } from '../RSSView.svelte'
  import { toast } from 'svelte-sonner'
  import { alRequest } from '@/modules/anilist.js'
  import { click } from '@/modules/click.js'
  import Details from './Details.svelte'
  import EpisodeList from './EpisodeList.svelte'
  import ToggleList from './ToggleList.svelte'
  import Following from './Following.svelte'
  import smoothScroll from '@/modules/scroll.js'

  const view = getContext('view')
  function close () {
    $view = null
  }
  $: media = $view
  let modal
  $: media && modal?.focus()
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  function play (episode) {
    close()
    if (episode) return playAnime(media, episode)
    if (media.status === 'NOT_YET_RELEASED') return
    playMedia(media)
  }
  function getPlayButtonText (media) {
    if (media?.mediaListEntry) {
      const { status, progress } = media.mediaListEntry
      if (progress) {
        if (status === 'COMPLETED') {
          return 'Rewatch Now'
        } else {
          return 'Continue Now'
        }
      }
    }
    return 'Watch Now'
  }
  $: playButtonText = getPlayButtonText(media)
  async function toggleStatus () {
    if (!media.mediaListEntry) {
      // add
      const res = await setStatus('PLANNING', {}, media)
      media.mediaListEntry = res.data.SaveMediaListEntry
    } else {
      // delete
      alRequest({
        method: 'Delete',
        id: media.mediaListEntry.id
      })
      media.mediaListEntry = undefined
    }
  }
  function toggleFavourite () {
    alRequest({
      method: 'Favourite',
      id: media.id
    })
    media.isFavourite = !media.isFavourite
  }
  function copyToClipboard (text) {
    navigator.clipboard.writeText(text)
    toast('Copied to clipboard', {
      description: 'Copied share URL to clipboard',
      duration: 5000
    })
  }
  function openInBrowser (url) {
    window.IPC.emit('open', url)
  }
</script>

<div class='modal modal-full z-40' class:show={media} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
  {#if media}
    <div class='h-full modal-content bg-very-dark p-0 overflow-y-auto position-relative' use:smoothScroll>
      <button class='close pointer z-30 bg-dark top-20 right-0 position-fixed' type='button' use:click={close}> &times; </button>
      <img class='w-full cover-img banner position-absolute' alt='banner' src={media.bannerImage || ' '} />
      <div class='row'>
        <div class='col-7'>
          <div class='d-flex flex-row align-items-end pb-20 mb-15'>
            <div class='cover d-flex flex-row align-items-end'>
              <img class='rounded cover-img w-full overflow-hidden' alt='cover-art' src={media.coverImage?.extraLarge || media.coverImage?.medium} />
            </div>
            <div class='pl-20 ml-20'>
              <h1 class='font-weight-very-bold text-white select-all'>{media.title.userPreferred}</h1>
              <p class='d-flex flex-row font-size-18'>
                {#if media.averageScore}
                  <span class='material-symbols-outlined mx-10 font-size-24'> trending_up </span>
                  <span class='mr-20'>
                    Rating: {media.averageScore + '%'}
                  </span>
                {/if}
                {#if media.format}
                  <span class='material-symbols-outlined mx-10 font-size-24'> monitor </span>
                  <span class='mr-20 text-capitalize'>
                    Format: {formatMap[media.format]}
                  </span>
                {/if}
                {#if media.episodes !== 1 && getMediaMaxEp(media)}
                  <span class='material-symbols-outlined mx-10 font-size-24'> theaters </span>
                  <span class='mr-20'>
                    Episodes: {getMediaMaxEp(media)}
                  </span>
                {:else if media.duration}
                  <span class='material-symbols-outlined mx-10 font-size-24'> timer </span>
                  <span class='mr-20'>
                    Length: {media.duration + ' min'}
                  </span>
                {/if}
              </p>
              <div class='d-flex flex-row pt-5'>
                <button class='btn btn-lg btn-secondary w-250 text-dark font-weight-bold shadow-none border-0 d-flex align-items-center justify-content-center'
                  use:click={() => play()}
                  disabled={media.status === 'NOT_YET_RELEASED'}>
                  <span class='material-symbols-outlined font-size-24 filled pr-10'>
                    play_arrow
                  </span>
                  {playButtonText}
                </button>
                <button class='btn bg-dark btn-lg btn-square ml-10 material-symbols-outlined font-size-20 shadow-none border-0' class:filled={media.isFavourite} use:click={toggleFavourite}>
                  favorite
                </button>
                <button class='btn bg-dark btn-lg btn-square ml-10 material-symbols-outlined font-size-20 shadow-none border-0' class:filled={media.mediaListEntry} use:click={toggleStatus}>
                  bookmark
                </button>
                <button class='btn bg-dark btn-lg btn-square ml-10 material-symbols-outlined font-size-20 shadow-none border-0' use:click={() => copyToClipboard(`https://miru.watch/anime/${media.id}`)}>
                  share
                </button>
                <button class='btn bg-dark btn-lg btn-square ml-10 material-symbols-outlined font-size-20 shadow-none border-0' use:click={() => openInBrowser(`https://anilist.co/anime/${media.id}`)}>
                  open_in_new
                </button>
              </div>
            </div>
          </div>
          <Details {media} />
          <div class='d-flex flex-row mt-20 pt-10'>
            {#each media.genres as genre}
              <div class='bg-dark px-20 py-10 mr-10 rounded font-size-16'>
                {genre}
              </div>
            {/each}
          </div>
          <div class='w-full d-flex flex-row align-items-center pt-20 mt-10'>
            <hr class='w-full' />
            <div class='font-size-18 font-weight-semi-bold px-20 text-white'>Synopsis</div>
            <hr class='w-full' />
          </div>
          <div class='font-size-16 pre-wrap pt-20 select-all'>
            {media.description?.replace(/<[^>]*>/g, '') || ''}
          </div>
          <ToggleList list={media.relations?.edges?.filter(({ node }) => node.type === 'ANIME')} let:item title='Relations'>
            <div class='w-150 mx-15 my-10 rel pointer'
              use:click={async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: item.node.id })).data.Media }}>
              <img loading='lazy' src={item.node.coverImage.medium || ''} alt='cover' class='cover-img w-full h-200 rel-img rounded' />
              <div class='pt-5'>{item.relationType.replace(/_/g, ' ').toLowerCase()}</div>
              <h5 class='font-weight-bold text-white mb-5'>{item.node.title.userPreferred}</h5>
            </div>
          </ToggleList>
          <Following {media} />
          <ToggleList list={media.recommendations.edges.filter(edge => edge.node.mediaRecommendation)} let:item title='Recommendations'>
            <div class='w-150 mx-15 my-10 rel pointer'
              use:click={async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: item.node.mediaRecommendation.id })).data.Media }}>
              <img loading='lazy' src={item.node.mediaRecommendation.coverImage.medium || ''} alt='cover' class='cover-img w-full h-200 rel-img rounded' />
              <h5 class='font-weight-bold text-white mb-5'>{item.node.mediaRecommendation.title.userPreferred}</h5>
            </div>
          </ToggleList>
        </div>
        <div class='col-5 d-flex flex-column pl-20'>
          <EpisodeList id={media.id} userProgress={media.mediaListEntry && media.mediaListEntry.status === 'CURRENT' && media.mediaListEntry.progress} episodeCount={getMediaMaxEp(media)} duration={media.duration} {play} />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .close {
    top: 5rem !important;
    left: unset !important;
    right: 3rem !important;
  }
  .banner {
    opacity: 0.5;
    z-index: 0;
    aspect-ratio: 5/1;
  }
  .row {
    padding: 0 10rem;
    padding-top: 12rem
  }
  .cover {
    aspect-ratio: 7/10;
    max-width: 35%;
  }

  button.bg-dark:hover {
    background: #292d33 !important;
  }
</style>
