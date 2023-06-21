<script>
  import { getContext } from 'svelte'
  import { formatMap, setStatus, playMedia } from '@/modules/anime.js'
  import { alRequest } from '@/modules/anilist.js'
  export let media

  let hide = true

  function getPlayButtonText (media) {
    if (media.mediaListEntry) {
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
  const playButtonText = getPlayButtonText(media)
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
  const view = getContext('view')
  function viewMedia () {
    $view = media
  }
</script>

<div class='position-absolute w-350 h-400 absolute-container bg-dark-light z-30 rounded overflow-hidden pointer' on:pointerdown={viewMedia}>
  <div class='banner position-relative overflow-hidden bg-black'>
    <img src={media.bannerImage || ''} alt='banner' class='img-cover w-full h-full' />
    {#if media.trailer?.id}
      <iframe
        class='w-full border-0 position-absolute left-0'
        class:d-none={hide}
        title={media.title.userPreferred}
        allow='autoplay'
        on:load={() => { hide = false }}
        src={`https://www.youtube-nocookie.com/embed/${media.trailer?.id}?autoplay=1&controls=0&mute=1&disablekb=1&loop=1&vq=medium&playlist=${media.trailer?.id}`}
      />
    {/if}
  </div>
  <div class='w-full px-20'>
    <div class='font-size-24 font-weight-bold text-truncate d-inline-block w-full text-white' title={media.title.userPreferred}>
      {media.title.userPreferred}
    </div>
    <div class='d-flex flex-row pt-5'>
      <button class='btn btn-secondary flex-grow-1 text-dark font-weight-bold shadow-none border-0'
        on:pointerdown|stopPropagation={() => media.status !== 'NOT_YET_RELEASED' && playMedia(media)}
        disabled={media.status === 'NOT_YET_RELEASED'}>
        {playButtonText}
      </button>
      <button class='btn btn-square ml-10 material-symbols-outlined font-size-16 shadow-none border-0' class:filled={media.isFavourite} on:pointerdown|stopPropagation={toggleFavourite}>
        favorite
      </button>
      <button class='btn btn-square ml-10 material-symbols-outlined font-size-16 shadow-none border-0' class:filled={media.mediaListEntry} on:pointerdown|stopPropagation={toggleStatus}>
        bookmark
      </button>
    </div>
    <div class='details text-white text-capitalize pt-15 pb-10 d-flex'>
      <span class='text-nowrap d-flex align-items-center'>
        {#if media.format}
          {formatMap[media.format]}
        {/if}
      </span>
      {#if media.episodes && media.episodes !== 1}
        <span class='text-nowrap d-flex align-items-center'>
          {#if media.mediaListEntry?.status === 'CURRENT' && media.mediaListEntry?.progress }
            {media.mediaListEntry.progress} / {media.episodes} Episodes
          {:else}
            {media.episodes} Episodes
          {/if}
        </span>
      {:else if media.duration}
        <span class='text-nowrap d-flex align-items-center'>
          {media.duration + ' Minutes'}
        </span>
      {/if}
      {#if media.season || media.seasonYear}
        <span class='text-nowrap d-flex align-items-center'>
          {[media.season?.toLowerCase(), media.seasonYear].filter(s => s).join(' ')}
        </span>
      {/if}
    </div>
    <div class='w-full h-full text-muted description overflow-hidden'>
      {media.description?.replace(/<[^>]*>/g, '')}
    </div>
  </div>
</div>

<style>
  .description {
    display: -webkit-box !important;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }
  .details span + span::before {
    content: '•';
    padding: 0 .5rem;
    font-size: .6rem;
    align-self: center;
    white-space: normal;
    color: var(--dm-muted-text-color) !important;
  }
  .banner {
    height: 45%
  }
  .banner::after {
    content: '';
    position: absolute;
    left: 0 ; bottom: 0;
    width: 100%; height: 100% ;
    background: linear-gradient(180deg, #0000 0%, #25292faa 76%, #25292f 97%, #25292f 100%);
  }
  @keyframes load-in {
    from {
      bottom: -1.2rem;
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      opacity: 1;
      transform: scale(1);
    }
  }
  .absolute-container {
    animation: 0.3s ease 0s 1 load-in;
    left: -100%;
    right: -100%;
    top: 0;
    bottom: 0;
    margin: auto;
  }
  @keyframes delayedShow {
    to {
      visibility: visible;
    }
  }

  iframe {
    height: 200%;
    top: 50%;
    transform: translate(0, -50%);
    visibility: hidden;
    animation: 0s linear 0.5s forwards delayedShow ;
  }
</style>
