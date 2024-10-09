<script>
  import { statusColorMap, formatMap } from '@/modules/anime.js'
  import { since } from '@/modules/util.js'
  import { click } from '@/modules/click.js'
  import { liveAnimeEpisodeProgress } from '@/modules/animeprogress.js'
  import { anilistClient } from "@/modules/anilist"
  import AudioLabel from '@/views/ViewAnime/AudioLabel.svelte'
  import { getContext } from 'svelte'
  import { CalendarDays, Play, Tv } from 'lucide-svelte'

  export let data
  export let prompt
  /** @type {import('@/modules/al.d.ts').Media | null} */
  const media = data.media && anilistClient.mediaCache[data.media.id]

  const episodeThumbnail = ((!media?.mediaListEntry?.status || !(['CURRENT', 'PAUSED', 'DROPPED'].includes(media.mediaListEntry.status) && media.mediaListEntry.progress < data.episode)) && data.episodeData?.image) || media?.bannerImage || media?.coverImage.extraLarge || ' '
  let hide = true

  const progress = liveAnimeEpisodeProgress(media?.id, data?.episode)
  const watched = media?.mediaListEntry?.status === 'COMPLETED'
  const completed = !watched && media?.mediaListEntry?.progress >= data?.episode

  const view = getContext('view')
  function viewMedia () {
    $view = media
  }
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
    <Play class='mb-5 ml-5 pl-10 pb-10 z-10' fill='currentColor' size='3rem' />
    <div class='pr-20 pb-10 font-size-16 font-weight-medium z-10'>
      {#if media?.duration}
        {media.duration}m
      {/if}
    </div>
    {#if completed}
      <div class='progress container-fluid position-absolute z-10' style='height: 2px; min-height: 2px;'>
        <div class='progress-bar w-full' />
      </div>
    {:else if $progress > 0}
      <div class='progress container-fluid position-absolute z-10' style='height: 2px; min-height: 2px;'>
        <div class='progress-bar' style='width: {progress}%' />
      </div>
    {/if}
  </div>
  <div class='w-full d-flex flex-column flex-grow-1 px-20 pb-15'>
    <div class='row pt-15'>
      <div class='col pr-10'>
        <div class='text-white font-weight-very-bold font-size-16 title overflow-hidden' title={anilistClient.title(media) || data.parseObject.anime_title}>
          {#if media?.mediaListEntry?.status}
            <div style:--statusColor={statusColorMap[media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={media.mediaListEntry.status} />
          {/if}
          {anilistClient.title(media) || data.parseObject.anime_title}
        </div>
        <div class='text-muted font-size-12 title overflow-hidden' title={data.episodeData?.title?.en}>
          {data.episodeData?.title?.en || ''}
        </div>
      </div>
      <div class='col-auto d-flex flex-column align-items-end text-right' title={data.parseObject?.file_name} >
        <div class='text-white font-weight-bold font-weight-very-bold'>
          {#if data.episode}
            Episode {data.episode}
          {:else if media?.format === 'MOVIE' }
            Movie
          {:else if data.parseObject?.anime_title?.match(/S(\d{2})/)}
            Season {parseInt(data.parseObject.anime_title.match(/S(\d{2})/)[1], 10)}
          {:else}
            Batch
          {/if}
        </div>
        <div class='d-flex align-items-center'>
          <div class='text-nowrap font-size-12 title text-muted d-flex align-items-center'>
            <AudioLabel {media} {data} banner={true} episode={true} />
          </div>
          {#if data.date}
            <div class='text-muted font-size-12 title ml-5 mr-5 overflow-hidden'>
              •
            </div>
            <div class='text-muted font-size-12 title overflow-hidden'>
              {since(data.date)}
            </div>
          {:else if data.similarity}
            <div class='text-muted font-size-12 title ml-5 mr-5 overflow-hidden'>
              •
            </div>
            <div class='text-muted font-size-12 title overflow-hidden'>
              {Math.round(data.similarity * 100)}%
            </div>
          {/if}
        </div>
      </div>
    </div>
    <div class='w-full text-muted description overflow-hidden pt-15'>
      {data.episodeData?.description || media?.description?.replace(/<[^>]*>/g, '') || ''}
    </div>
    {#if media}
      <div class='d-flex flex-row pt-15 font-weight-medium justify-content-between w-full text-muted'>
        <div class='d-flex align-items-center' style='margin-left: -2px'>
          <CalendarDays class='pr-5' size='2.6rem' />
          <span class='line-height-1'>{media.seasonYear || 'N/A'}</span>
        </div>
        <div class='d-flex align-items-center'>
          <span class='line-height-1'>{formatMap[media.format]}</span>
          <Tv class='pl-5' size='2.6rem' />
        </div>
      </div>
    {/if}
  </div>
  <div class='overlay position-absolute w-full h-200 z-40 d-flex flex-column justify-content-center align-items-center {prompt ? "visible" : "invisible"}'>
    <p class='ml-20 mr-20 font-size-24 text-white text-center'>Your Current Progress Is At <b>Episode {media?.mediaListEntry?.progress}</b></p>
    <button class='btn btn-lg btn-secondary w-250 text-dark font-weight-bold shadow-none border-0 d-flex align-items-center justify-content-center mt-10'
            use:click={() => {
              data.onclick() || viewMedia()
            }}>
      <Play class='mr-10' fill='currentColor' size='1.6rem' />
      Continue Anyway?
    </button>
   </div>
</div>

<style>
  .overlay {
    background-color: rgba(28, 28, 28, 0.9);
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
    background: var(--episode-preview-card-gradient);
  }
  .list-status-circle {
    background: var(--statusColor);
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 50%;
  }
</style>
