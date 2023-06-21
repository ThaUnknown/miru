<script>
  import { statusColorMap } from '@/modules/anime.js'
  import EpisodePreviewCard from './EpisodePreviewCard.svelte'
  export let data

  let preview = false

  const episodeThumbnail = data.episodeData?.image || data.media?.bannerImage || data.media?.coverImage?.extraLarge || ''
</script>

<div class='d-flex pt-20 px-20 position-relative' on:pointerenter={() => { preview = true }} on:pointerleave={() => { preview = false }} on:pointerdown={data.onclick}>
  {#if preview}
    <EpisodePreviewCard {data} />
  {/if}
  <div class='item d-flex flex-column h-full pointer'>
    <div class='image h-200 w-full position-relative rounded overflow-hidden d-flex justify-content-between align-items-end text-white' class:bg-black={!episodeThumbnail}>
      <img loading='lazy' src={episodeThumbnail} alt='cover' class='cover-img w-full h-full position-absolute' style:--color={data.media?.coverImage?.color || '#1890ff'} />
      <div class='pl-10 pb-10 material-symbols-outlined filled z-10'>play_arrow</div>
      <div class='pr-15 pb-10 font-size-16 font-weight-medium z-10'>
        {#if data.media?.duration}
          {data.media.duration}m
        {/if}
      </div>
    </div>
    <div class='row pt-15'>
      <div class='col-7'>
        <div class='text-white font-weight-very-bold font-size-16 title overflow-hidden'>
          {#if data.media?.mediaListEntry?.status}
            <div style:--statusColor={statusColorMap[data.media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={data.media.mediaListEntry.status} />
          {/if}
          {data.media?.title.userPreferred || data.parseObject.anime_title}
        </div>
      </div>
      <div class='col-5 d-flex flex-column align-items-end text-right'>
        <div class='text-white'>
          Episode {data.episode}
        </div>
        <div class='text-muted font-size-12 title overflow-hidden'>
          {data.episodeData?.title || ''}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .material-symbols-outlined {
    font-size: 3rem;
  }
  .title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .image:after {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 77.08%, rgba(0, 0, 0, 0.7) 100%);
    content:'';
    position:absolute;
    left:0; top:0;
    width:100%; height:100%;
  }
  .item {
    animation: 0.3s ease 0s 1 load-in;
    width: 36rem
  }
  .cover-img {
    object-fit: cover;
    background-color: var(--color) !important;
  }
  .list-status-circle {
    background: var(--statusColor);
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 50%;
  }
</style>
