<script>
  import { formatMap } from './anime.js'
  import { click } from '@/modules/click.js'
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

  let muted = true
  function toggleMute () {
    muted = !muted
  }
  const noop = () => {}
  function play () {
    open('miru://anime/' + media.id)
  }
  function lazyload (iframe) {
    if ('IntersectionObserver' in window) {
      const lazyVideoObserver = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) {
            iframe.src = iframe.dataset.src
            lazyVideoObserver.unobserve(target)
          }
        }
      })
      lazyVideoObserver.observe(iframe.parentNode)
    } else {
      iframe.src = iframe.dataset.src
    }
  }
</script>

<div class='position-absolute w-350 h-400 absolute-container z-10 top-0 bottom-0 m-auto bg-dark-light rounded overflow-hidden pointer'>
  <div class='banner position-relative bg-black overflow-hidden'>
    <img src={media.bannerImage || ' '} alt='banner' class='img-cover w-full h-full' loading='lazy' />
    {#if media.trailer?.id}
      <div class='material-symbols-outlined filled position-absolute z-10 top-0 right-0 p-15 font-size-22' class:d-none={hide} use:click={toggleMute}>{muted ? 'volume_off' : 'volume_up'}</div>
      <!-- for now we use some invidious instance, would be nice to somehow get these links outselves, this redirects straight to some google endpoint -->
      <!-- eslint-disable-next-line svelte/valid-compile -->
      <iframe
        class='w-full border-0 position-absolute left-0'
        class:d-none={hide}
        title={media.title.userPreferred}
        allow='autoplay'
        use:lazyload
        on:load={() => { hide = false }}
        data-src={`https://www.youtube-nocookie.com/embed/${media.trailer?.id}?autoplay=1&controls=0&mute=${muted ? 1 : 0}&disablekb=1&loop=1&vq=medium&playlist=${media.trailer?.id}&cc_lang_pref=ja`}
      />
    {/if}
  </div>
  <div class='w-full px-20'>
    <div class='font-size-24 font-weight-bold text-truncate d-inline-block w-full text-white' title={media.title.userPreferred}>
      {media.title.userPreferred}
    </div>
    <div class='d-flex flex-row pt-5'>
      <button class='btn btn-secondary flex-grow-1 text-dark font-weight-bold shadow-none border-0 d-flex align-items-center justify-content-center'
        use:click={play}
        disabled={media.status === 'NOT_YET_RELEASED'}>
        <span class='material-symbols-outlined font-size-20 filled pr-10'>
          play_arrow
        </span>
        {playButtonText}
      </button>
      <button class='btn btn-square ml-10 material-symbols-outlined font-size-16 shadow-none border-0' class:filled={media.isFavourite} use:click={noop}>
        favorite
      </button>
      <button class='btn btn-square ml-10 material-symbols-outlined font-size-16 shadow-none border-0' class:filled={media.mediaListEntry} use:click={noop}>
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
  /* video {
    object-fit: cover;
  } */
  .banner::after {
    content: '';
    position: absolute;
    left: 0 ; bottom: 0;
    margin-bottom: -1px;
    width: 100%; height: 100% ;
    background: var(--preview-card-gradient);
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
    animation: 0s linear 0.5s forwards delayedShow;
  }
</style>
