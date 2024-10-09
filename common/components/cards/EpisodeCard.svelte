<script>
  import { statusColorMap } from '@/modules/anime.js'
  import EpisodePreviewCard from './EpisodePreviewCard.svelte'
  import { hoverClick, hoverChange } from '@/modules/click.js'
  import { writable } from 'svelte/store'
  import { since } from '@/modules/util.js'
  import AudioLabel from '@/views/ViewAnime/AudioLabel.svelte'
  import { getContext } from 'svelte'
  import { liveAnimeEpisodeProgress } from '@/modules/animeprogress.js'
  import { anilistClient } from '@/modules/anilist.js'
  import { Play } from 'lucide-svelte'
  export let data

  let preview = false
  let prompt = writable(false)
  /** @type {import('@/modules/al.d.ts').Media | null} */
  const media = data.media && anilistClient.mediaCache[data.media.id]

  const episodeThumbnail = ((!media?.mediaListEntry?.status || !(['CURRENT', 'PAUSED', 'DROPPED'].includes(media.mediaListEntry.status) && media.mediaListEntry.progress < data.episode)) && data.episodeData?.image) || media?.bannerImage || media?.coverImage.extraLarge || ' '

  const view = getContext('view')
  function viewMedia () {
    $view = media
  }
  function setClickState() {
    if ($prompt === false && media?.mediaListEntry?.progress < (data.episode - 1)) {
      prompt.set(true)
    } else {
      data.onclick() || viewMedia()
    }
  }
  function setHoverState (state) {
    preview = state
  }

  const progress = liveAnimeEpisodeProgress(media?.id, data?.episode)
  const watched = media?.mediaListEntry?.status === 'COMPLETED'
  const completed = !watched && media?.mediaListEntry?.progress >= data?.episode
</script>

<div class='d-flex p-20 pb-10 position-relative episode-card' use:hoverChange={() => prompt.set(false)} use:hoverClick={[setClickState, setHoverState]} on:contextmenu|preventDefault={viewMedia} role='none'>
  {#if preview}
    <EpisodePreviewCard {data} bind:prompt={$prompt} />
  {/if}
  <div class='item d-flex flex-column h-full pointer content-visibility-auto' class:opacity-half={completed}>
    <div class='image h-200 w-full position-relative rounded overflow-hidden d-flex justify-content-between align-items-end text-white' class:bg-black={episodeThumbnail === ' '}>
      <img loading='lazy' src={episodeThumbnail} alt='cover' class='cover-img w-full h-full position-absolute' style:--color={media?.coverImage?.color || '#1890ff'} />
      <Play class='mb-5 ml-5 pl-10 pb-10 z-10' fill='currentColor' size='3rem' />
      <div class='pr-15 pb-10 font-size-16 font-weight-medium z-10'>
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
    <div class='row pt-15'>
      <div class='col pr-10'>
        <div class='text-white font-weight-very-bold font-size-16 title overflow-hidden'>
          {#if media?.mediaListEntry?.status}
            <div style:--statusColor={statusColorMap[media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={media.mediaListEntry.status} />
          {/if}
          {anilistClient.title(media) || data.parseObject.anime_title}
        </div>
        <div class='text-muted font-size-12 title overflow-hidden'>
          {data.episodeData?.title?.en || ''}
        </div>
      </div>
      <div class='col-auto d-flex flex-column align-items-end text-right'>
        <div class='text-white font-weight-bold'>
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
  </div>
</div>

<style>
  .episode-card:hover {
    z-index: 30;
    /* fixes transform scaling on click causing z-index issues */
  }
  .opacity-half {
    opacity: 30%;
  }
  .title {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .image:after {
    background: var(--episode-card-gradient);
    content:'';
    position:absolute;
    left:0; top:0;
    width:100%; height:100%;
  }
  .item {
    animation: 0.3s ease 0s 1 load-in;
    width: 36rem;
    contain-intrinsic-height: 25.7rem;
  }
  .cover-img {
    background-color: var(--color) !important;
  }
  .list-status-circle {
    background: var(--statusColor);
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 50%;
  }
</style>
