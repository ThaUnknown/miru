<script>
  import { statusColorMap, formatMap } from '@/modules/anime.js'
  import { since } from '@/modules/util'
  import { liveAnimeEpisodeProgress } from '@/modules/animeprogress.js'
  export let data
  /** @type {import('@/modules/al.d.ts').Media | null} */
  const media = data.media

  const episodeThumbnail = ((!media?.mediaListEntry?.status || !(media.mediaListEntry.status === 'CURRENT' && media.mediaListEntry.progress < data.episode)) && data.episodeData?.image) || media?.bannerImage || media?.coverImage.extraLarge || ' '
  let hide = true

  const progress = liveAnimeEpisodeProgress(media.id, data.episode)
</script>

<div class='position-absolute w-400 mh-400 absolute-container top-0 m-auto bg-dark-light z-30 rounded overflow-hidden pointer d-flex flex-column'>
  <div class='image h-200 w-full position-relative d-flex justify-content-between align-items-end text-white' class:bg-black={episodeThumbnail === ' '}>
    <img loading='lazy' src={episodeThumbnail} alt='cover' class='img-cover w-full h-full position-absolute' style:--color={media?.coverImage.color || '#1890ff'} />
    {#if data.episodeData?.video}
      <video src={data.episodeData.video}
        class='w-full position-absolute left-0'
        class:d-none={hide}
        playsinline
        preload='none'
        loop
        muted
        on:loadeddata={() => { hide = false }}
        autoplay />
    {/if}
    <div class='pl-15 pb-10 material-symbols-outlined filled z-10'>play_arrow</div>
    <div class='pr-20 pb-10 font-size-16 font-weight-medium z-10'>
      {#if media?.duration}
        {media.duration}m
      {/if}
    </div>
    {#if $progress > 0}
      <div class='progress container-fluid position-absolute mb-5'>
        <div class='progress-bar' style='width: {$progress}%' />
      </div>
    {/if}
  </div>
  <div class='w-full d-flex flex-column flex-grow-1 px-20 pb-15'>
    <div class='row pt-15'>
      <div class='col pr-10'>
        <div class='text-white font-weight-very-bold font-size-16 title overflow-hidden' title={data.media?.title.userPreferred || data.parseObject.anime_title}>
          {#if media?.mediaListEntry?.status}
            <div style:--statusColor={statusColorMap[media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={media.mediaListEntry.status} />
          {/if}
          {data.media?.title.userPreferred || data.parseObject.anime_title}
        </div>
        <div class='text-muted font-size-12 title overflow-hidden' title={data.episodeData?.title?.en}>
          {data.episodeData?.title?.en || ''}
        </div>
      </div>
      {#if data.episode}
        <div class='col-auto d-flex flex-column align-items-end text-right'>
          <div class='text-white font-weight-bold'>
            Episode {data.episode}
          </div>
          {#if data.date}
            <div class='text-muted font-size-12 title overflow-hidden'>
              {since(data.date)}
            </div>
          {:else if data.similarity}
            <div class='text-muted font-size-12 title overflow-hidden'>
              {Math.round(data.similarity * 100)}%
            </div>
          {/if}
        </div>
      {/if}
    </div>
    <div class='w-full text-muted description overflow-hidden pt-15'>
      {data.episodeData?.description || media?.description?.replace(/<[^>]*>/g, '') || ''}
    </div>
    {#if media}
      <div class='d-flex flex-row pt-15 font-weight-medium justify-content-between w-full text-muted'>
        <div class='d-flex align-items-center' style='margin-left: -3px'>
          <span class='material-symbols-outlined font-size-24 pr-5'>calendar_month</span>
          {media.seasonYear || 'N/A'}
        </div>
        <div class='d-flex align-items-center'>
          {formatMap[media.format]}
          <span class='material-symbols-outlined font-size-24 pl-5'>monitor</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .material-symbols-outlined {
    font-size: 3rem;
  }
  .description {
    display: -webkit-box !important;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  @keyframes load-in {
    from {
      top: 1.2rem;
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      top: 0;
      opacity: 1;
      transform: scale(1);
    }
  }
  .absolute-container {
    animation: 0.3s ease 0s 1 load-in;
    left: -100%;
    right: -100%;
  }
  .title {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .image:after {
    content: '';
    position: absolute;
    left: 0 ; bottom: 0;
    width: 100%; height: 100%;
    background: linear-gradient(180deg, #0000 0%, #25292f00 80%, #25292f 95%, #25292f 100%);
  }
  .list-status-circle {
    background: var(--statusColor);
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 50%;
  }
</style>
