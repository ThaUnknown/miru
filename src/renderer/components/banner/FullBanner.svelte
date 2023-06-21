<script>
  import { formatMap, setStatus, playMedia } from '@/modules/anime.js'
  import { alRequest } from '@/modules/anilist.js'
  export let media

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
</script>

<img src={media.bannerImage || ''} alt='banner' class='img-cover w-full h-full position-absolute' />
<div class='pl-20 pb-20 justify-content-end d-flex flex-column h-full w-600 mw-full banner'>
  <div class='text-white font-weight-bold font-size-40 title overflow-hidden'>
    {media.title.userPreferred}
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
  <div class='text-muted description overflow-hidden'>
    {media.description?.replace(/<[^>]*>/g, '')}
  </div>
  <div class='details text-white text-capitalize pt-15 pb-10 d-flex'>
    {#each media.genres as genre}
      <span class='text-nowrap d-flex align-items-center'>
        {genre}
      </span>
    {/each}
  </div>
  <div class='d-flex flex-row pb-20'>
    <button class='btn bg-dark-light px-20 shadow-none border-0'
      on:pointerdown|stopPropagation={() => playMedia(media)}>
      Watch Now
    </button>
    <button class='btn bg-dark-light btn-square ml-10 material-symbols-outlined font-size-16 shadow-none border-0' class:filled={media.isFavourite} on:pointerdown|stopPropagation={() => toggleFavourite(media)}>
      favorite
    </button>
    <button class='btn bg-dark-light btn-square ml-10 material-symbols-outlined font-size-16 shadow-none border-0' class:filled={media.mediaListEntry} on:pointerdown|stopPropagation={() => toggleStatus(media)}>
      bookmark
    </button>
  </div>
</div>

<style>
  .details span + span::before {
    content: '•';
    padding: 0 .5rem;
    font-size: .6rem;
    align-self: center;
    white-space: normal;
    color: var(--dm-muted-text-color) !important;
  }
  .description {
    display: -webkit-box !important;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }
  .title {
    display: -webkit-box !important;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  img {
    z-index: -1;
  }
  .font-size-40 {
    font-size: 4rem;
  }
  .banner, img {
    animation: fadeIn ease .8s;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  button:hover {
    background: #292d33 !important;
  }
</style>
