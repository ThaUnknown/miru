<script>
  import { formatMap, setStatus, playMedia } from '@/modules/anime.js'
  import { anilistClient } from '@/modules/anilist.js'
  import { click } from '@/modules/click.js'
  import { alToken } from '@/modules/settings.js'
  import { Bookmark, Heart } from 'lucide-svelte'
  export let mediaList

  let current = mediaList[0]

  async function toggleStatus () {
    if (!current.mediaListEntry) {
      // add
      const res = await setStatus('PLANNING', {}, current)
      current.mediaListEntry = res.data.SaveMediaListEntry
    } else {
      // delete
      anilistClient.delete({ id: current.mediaListEntry.id })
      current.mediaListEntry = undefined
    }
  }
  function toggleFavourite () {
    anilistClient.favourite({ id: current.id })
    current.isFavourite = !current.isFavourite
  }

  function currentIndex () {
    return mediaList.indexOf(current)
  }

  function schedule (index) {
    return setTimeout(() => {
      current = mediaList[index % mediaList.length]
      timeout = schedule(index + 1)
    }, 15000)
  }

  let timeout = schedule(currentIndex() + 1)

  function setCurrent (media) {
    if (current === media) return
    clearTimeout(timeout)
    current = media
    timeout = schedule(currentIndex() + 1)
  }
</script>

{#key current}
  <img src={current.bannerImage || `https://i.ytimg.com/vi/${current.trailer?.id}/maxresdefault.jpg` || ''} alt='banner' class='img-cover w-full h-full position-absolute' />
{/key}
<div class='gradient-bottom h-full position-absolute top-0 w-full' />
<div class='gradient-left h-full position-absolute top-0 w-800' />
<div class='pl-20 pb-20 justify-content-end d-flex flex-column h-full banner mw-full'>
  <div class='text-white font-weight-bold font-size-40 title w-800 mw-full overflow-hidden'>
    {current.title.userPreferred}
  </div>
  <div class='details text-white text-capitalize pt-15 pb-10 d-flex w-600 mw-full'>
    <span class='text-nowrap d-flex align-items-center'>
      {#if current.format}
        {formatMap[current.format]}
      {/if}
    </span>
    {#if current.episodes && current.episodes !== 1}
      <span class='text-nowrap d-flex align-items-center'>
        {#if current.mediaListEntry?.status === 'CURRENT' && current.mediaListEntry?.progress }
          {current.mediaListEntry.progress} / {current.episodes} Episodes
        {:else}
          {current.episodes} Episodes
        {/if}
      </span>
    {:else if current.duration}
      <span class='text-nowrap d-flex align-items-center'>
        {current.duration + ' Minutes'}
      </span>
    {/if}
    {#if current.season || current.seasonYear}
      <span class='text-nowrap d-flex align-items-center'>
        {[current.season?.toLowerCase(), current.seasonYear].filter(s => s).join(' ')}
      </span>
    {/if}
  </div>
  <div class='text-muted description overflow-hidden w-600 mw-full'>
    {current.description?.replace(/<[^>]*>/g, '')}
  </div>
  <div class='details text-white text-capitalize pt-15 pb-10 d-flex w-600 mw-full'>
    {#each current.genres as genre}
      <span class='text-nowrap d-flex align-items-center'>
        {genre}
      </span>
    {/each}
  </div>
  <div class='d-flex flex-row pb-10 w-600 mw-full'>
    <button class='btn bg-dark-light px-20 shadow-none border-0'
      use:click={() => playMedia(current)}>
      Watch Now
    </button>
    <button class='btn bg-dark-light btn-square ml-10 d-flex align-items-center justify-content-center shadow-none border-0' use:click={toggleFavourite} disabled={!alToken}>
      <Heart fill={current.isFavourite ? 'currentColor' : 'transparent'} size='1.5rem' />
    </button>
    <button class='btn bg-dark-light btn-square ml-10 d-flex align-items-center justify-content-center shadow-none border-0' use:click={toggleStatus} disabled={!alToken}>
      <Bookmark fill={current.mediaListEntry ? 'currentColor' : 'transparent'} size='1.5rem' />
    </button>
  </div>
  <div class='d-flex'>
    {#each mediaList as media}
      {@const active = current === media}
      <div class='pt-10 pb-5 badge-wrapper' class:pointer={!active} use:click={() => setCurrent(media)}>
        <div class='rounded bg-dark-light mr-10 progress-badge overflow-hidden' class:active style='height: 3px;' style:width={active ? '5rem' : '2.7rem'}>
          <div class='progress-content h-full' class:bg-white={active} />
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .gradient-bottom {
    background: var(--banner-gradient-bottom);
  }
  .gradient-left {
    background: var(--banner-gradient-left);
  }
  .progress-badge {
    transition: width .8s ease;
  }
  .progress-badge.active .progress-content {
    animation: fill 15s linear;
  }

  @keyframes fill {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
  .w-800 {
    width: 80rem
  }
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
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  img, .gradient-bottom, .gradient-left {
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
  button:hover, .badge-wrapper.pointer:hover .progress-badge {
    background: #292d33 !important;
  }
</style>
