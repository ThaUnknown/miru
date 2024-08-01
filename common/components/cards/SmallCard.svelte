<script>
  import { getContext } from 'svelte'
  import PreviewCard from './PreviewCard.svelte'
  import { formatMap, statusColorMap } from '@/modules/anime.js'
  import { hoverClick } from '@/modules/click.js'
  import { countdown } from '@/modules/util.js'
  import AudioLabel from '@/views/ViewAnime/AudioLabel.svelte'

  import { page } from '@/App.svelte'
  /** @type {import('@/modules/al.d.ts').Media} */
  export let media
  export let variables = null
  let preview = false

  const view = getContext('view')
  function viewMedia () {
    $view = media
  }
  function setHoverState (state) {
    preview = state
  }
</script>

<div class='d-flex p-md-20 p-15 position-relative first-check' use:hoverClick={[viewMedia, setHoverState]}>
  {#if preview}
    <PreviewCard {media} />
  {/if}
  <div class='item small-card d-flex flex-column h-full pointer content-visibility-auto' class:opacity-half={variables?.continueWatching && Helper.isMalAuth() && media?.status !== 'FINISHED' && media?.mediaListEntry?.progress >= media?.nextAiringEpisode?.episode - 1}>
    {#if $page === 'schedule'}
      <div class='w-full text-center pb-10'>
        {#if media.airingSchedule?.nodes?.[0]?.airingAt}
          Episode {media.airingSchedule.nodes[0].episode } in
          <span class='font-weight-bold text-light'>
            {countdown(media.airingSchedule.nodes[0].airingAt - Date.now() / 1000)}
          </span>
        {:else}
          &nbsp;
        {/if}
      </div>
    {/if}
    <div class="d-inline-block position-relative">
      <img loading='lazy' src={media.coverImage.extraLarge || ''} alt='cover' class='cover-img w-full rounded' style:--color={media.coverImage.color || '#1890ff'} />
      <AudioLabel {media} />
    </div>
    <div class='text-white font-weight-very-bold font-size-16 pt-15 title overflow-hidden'>
      {#if media.mediaListEntry?.status}
        <div style:--statusColor={statusColorMap[media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={media.mediaListEntry.status} />
      {/if}
      {anilistClient.title(media)}
    </div>
    <div class='d-flex flex-row mt-auto pt-10 font-weight-medium justify-content-between w-full text-muted'>
      <div class='d-flex align-items-center pr-5' style='margin-left: -2px'>
        <span class='material-symbols-outlined font-size-24 pr-5'>calendar_month</span>
        {media.seasonYear || 'N/A'}
      </div>
      <div class='d-flex align-items-center text-nowrap text-right'>
        {formatMap[media.format]}
        <span class='material-symbols-outlined font-size-24 pl-5'>monitor</span>
      </div>
    </div>
  </div>
</div>

<style>
  .first-check:hover {
    z-index: 30;
    /* fixes transform scaling on click causing z-index issues */
  }
  .opacity-half {
    opacity: 30%;
  }
  .title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  img {
    width: 100%;
    aspect-ratio: 230/331;
  }
  .item {
    animation: 0.3s ease 0s 1 load-in;
    width: 100%;
    aspect-ratio: 152/296;
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
