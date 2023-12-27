<script>
  import PreviewCard from './PreviewCard.svelte'
  import { formatMap, statusColorMap } from './anime.js'
  import { hoverClick } from '@/modules/click.js'

  export let media
  export let preview = false

  const noop = () => {}
  function setHoverState (state) {
    preview = state
  }
  function initPreview (node) {
    if (preview) node.dispatchEvent(new PointerEvent('pointerenter'))
  }
</script>

<div class='d-flex p-20 position-relative first-check' use:hoverClick={[noop, setHoverState]} use:initPreview>
  {#if preview}
    <PreviewCard {media} />
  {/if}
  <div class='item d-flex flex-column h-full pointer content-visibility-auto'>
    <img loading='lazy' src={media.coverImage.extraLarge || ''} alt='cover' class='cover-img w-full rounded' style:--color={media.coverImage.color || '#1890ff'} />
    <div class='text-white font-weight-very-bold font-size-16 pt-15 title overflow-hidden'>
      {#if media.mediaListEntry?.status}
        <div style:--statusColor={statusColorMap[media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={media.mediaListEntry.status} />
      {/if}
      {media.title.userPreferred}
    </div>
    <div class='d-flex flex-row mt-auto pt-10 font-weight-medium justify-content-between w-full text-muted'>
      <div class='d-flex align-items-center' style='margin-left: -3px'>
        <span class='material-symbols-outlined font-size-24 pr-5'>calendar_month</span>
        {media.seasonYear || 'N/A'}
      </div>
      <div class='d-flex align-items-center'>
        {formatMap[media.format]}
        <span class='material-symbols-outlined font-size-24 pl-5'>monitor</span>
      </div>
    </div>
  </div>
</div>

<style>
  /* .first-check:first-child :global(.absolute-container) {
    left: -48% !important
  } */
  .title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  img {
    height: 27rem;
  }
  .item {
    animation: 0.3s ease 0s 1 load-in;
    width: 19rem;
    contain-intrinsic-height: 36.7rem;
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
