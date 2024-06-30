<script>
  import { getContext } from 'svelte'
  import { formatMap, statusColorMap } from '@/modules/anime.js'
  import { click } from '@/modules/click.js'
  import { countdown } from '@/modules/util.js'
  import { page } from '@/App.svelte'
  /** @type {import('@/modules/al.d.ts').Media} */
  export let media

  const view = getContext('view')
  function viewMedia () {
    $view = media
  }
</script>

<div class='d-flex px-20 py-10 position-relative justify-content-center' use:click={viewMedia}>
  <div class='card m-0 p-0 overflow-hidden pointer content-visibility-auto full-card'
    style:--color={media.coverImage.color || '#1890ff'}>
    <div class='row h-full'>
      <div class='col-4 img-col'>
        <img loading='lazy' src={media.coverImage.extraLarge || ''} alt='cover' class='cover-img w-full h-full' />
      </div>
      <div class='col h-full card-grid'>
        <div class='px-15 py-10 bg-very-dark'>
          <h5 class='m-0 text-white text-capitalize font-weight-bold'>
            {#if media.mediaListEntry?.status}
              <div style:--statusColor={statusColorMap[media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={media.mediaListEntry.status} />
            {/if}
            {media.title.userPreferred}
          </h5>
          {#if $page === 'schedule'}
            <div class='py-5'>
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
          <p class='text-muted m-0 text-capitalize details'>
            <span class='text-nowrap'>
              {#if media.format === 'TV'}
                TV Show
              {:else if media.format}
                {formatMap[media.format]}
              {/if}
            </span>
            {#if media.episodes && media.episodes !== 1}
              <span class='text-nowrap'>
                {#if media.mediaListEntry?.status === 'CURRENT' && media.mediaListEntry?.progress }
                  {media.mediaListEntry.progress} / {media.episodes} Episodes
                {:else}
                  {media.episodes} Episodes
                {/if}
              </span>
            {:else if media.duration}
              <span class='text-nowrap'>{media.duration + ' Minutes'}</span>
            {/if}
            {#if media.status}
              <span class='text-nowrap'>{media.status?.toLowerCase().replace(/_/g, ' ')}</span>
            {/if}
            {#if media.season || media.seasonYear}
              <span class='text-nowrap'>
                {[media.season?.toLowerCase(), media.seasonYear].filter(s => s).join(' ')}
              </span>
            {/if}
          </p>
        </div>
        <div class='overflow-y-auto px-15 pb-5 bg-very-dark card-desc pre-wrap'>
          {media.description?.replace(/<[^>]*>/g, '') || ''}
        </div>
        {#if media.genres.length}
          <div class='px-15 pb-10 pt-5 genres'>
            {#each media.genres.slice(0, 3) as genre}
              <span class='badge badge-pill badge-color text-dark mt-5 mr-5 font-weight-bold'>{genre}</span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
.pre-wrap {
  white-space: pre-wrap
}
.details span + span::before {
  content: ' • ';
  white-space: normal;
}
.card {
  animation: 0.3s ease 0s 1 load-in;
  width: 52rem !important;
  height: 27rem !important;
  box-shadow: rgba(0, 4, 12, 0.3) 0px 7px 15px, rgba(0, 4, 12, 0.05) 0px 4px 4px;
  contain-intrinsic-height: 27rem;
  transition: transform 0.2s ease;
}
.card:hover{
  transform: scale(1.05);
}
.card-grid {
  display: grid;
  grid-template-rows: auto 1fr auto;
}
.badge-color {
  background-color: var(--color) !important;
  border-color: var(--color) !important;
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
