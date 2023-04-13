<script>
  import { countdown, wrapEnter } from '@/modules/util.js'
  import { getContext } from 'svelte'
  export let cards = new Promise(() => {})
  const view = getContext('view')
  function viewMedia (media) {
    $view = media
  }
  export let length = 5
  export let tabable = false

  const statusColorMap = {
    CURRENT: 'rgb(61,180,242)',
    PLANNING: 'rgb(247,154,99)',
    COMPLETED: 'rgb(123,213,85)',
    PAUSED: 'rgb(250,122,122)',
    REPEAT: '#3baeea',
    DROPPED: 'rgb(232,93,117)'
  }
</script>

{#await cards}
  {#each Array(length) as _}
    <div class='card m-0 p-0'>
      <div class='row h-full'>
        <div class='col-4 skeloader' />
        <div class='col-8 bg-very-dark px-15 py-10'>
          <p class='skeloader w-300 h-25 rounded bg-dark' />
          <p class='skeloader w-150 h-10 rounded bg-dark' />
          <p class='skeloader w-150 h-10 rounded bg-dark' />
        </div>
      </div>
    </div>
  {/each}
{:then cards}
  {#each cards || [] as card}
    {#if typeof card === 'string'}
      <div class='day-row font-size-24 font-weight-bold h-50 d-flex align-items-end'>{card}</div>
    {:else if !card.media}
      <div class='card m-0 p-0' on:click={card.onclick} on:keydown={wrapEnter(card.onclick)} tabindex={tabable ? 0 : null} role='button'>
        <div class='row h-full'>
          <div class='col-4 skeloader' />
          <div class='col-8 bg-very-dark px-15 py-10'>
            <h5 class='m-0 text-capitalize font-weight-bold pb-10'>{[card.parseObject.anime_title, card.episode].filter(s => s).join(' - ')}</h5>
            <p class='skeloader w-150 h-10 rounded bg-dark' />
            <p class='skeloader w-150 h-10 rounded bg-dark' />
          </div>
        </div>
      </div>
    {:else}
      <div class='card m-0 p-0'
        on:click={card.onclick || (() => viewMedia(card.media))}
        on:keydown={wrapEnter(card.onclick || (() => viewMedia(card.media)))}
        tabindex={tabable ? 0 : null} role='button'
        style:--color={card.media.coverImage.color || '#1890ff'}
        title={card.parseObject?.file_name}>
        <div class='row h-full'>
          <div class='col-4'>
            <img loading='lazy' src={card.media.coverImage.extraLarge || ''} alt='cover' class='cover-img w-full h-full' />
          </div>
          <div class='col-8 h-full card-grid'>
            <div class='px-15 py-10 bg-very-dark'>
              <h5 class='m-0 text-capitalize font-weight-bold'>
                {#if card.media.mediaListEntry?.status}
                  <div style:--statusColor={statusColorMap[card.media.mediaListEntry.status]} class='list-status-circle d-inline-flex overflow-hidden mr-5' title={card.media.mediaListEntry.status} />
                {/if}
                {#if card.failed}
                  <span class='badge badge-secondary'>Uncertain</span>
                {/if}
                {[card.media.title.userPreferred, card.episode].filter(s => s).join(' - ')}
              </h5>
              {#if card.schedule && card.media.nextAiringEpisode}
                <span class='text-muted font-weight-bold'>
                  {'EP ' + card.media.nextAiringEpisode.episode + ' in ' + countdown(card.media.nextAiringEpisode.timeUntilAiring)}
                </span>
              {/if}
              <p class='text-muted m-0 text-capitalize details'>
                <span class='text-nowrap'>
                  {#if card.media.format === 'TV'}
                    TV Show
                  {:else if card.media.format}
                    {card.media.format?.toLowerCase().replace(/_/g, ' ')}
                  {/if}
                </span>
                {#if card.media.episodes && card.media.episodes !== 1}
                  <span class='text-nowrap'>
                    {#if card.media.mediaListEntry?.status === 'CURRENT' && card.media.mediaListEntry?.progress }
                      {card.media.mediaListEntry.progress} / {card.media.episodes} Episodes
                    {:else}
                      {card.media.episodes} Episodes
                    {/if}
                  </span>
                {:else if card.media.duration}
                  <span class='text-nowrap'>{card.media.duration + ' Minutes'}</span>
                {/if}
                {#if card.media.status}
                  <span class='text-nowrap'>{card.media.status?.toLowerCase().replace(/_/g, ' ')}</span>
                {/if}
                {#if card.media.season || card.media.seasonYear}
                  <span class='text-nowrap'>
                    {[card.media.season?.toLowerCase(), card.media.seasonYear].filter(s => s).join(' ')}
                  </span>
                {/if}
              </p>
            </div>
            <div class='overflow-y-auto px-15 pb-5 bg-very-dark card-desc pre-wrap'>
              {card.media.description?.replace(/<[^>]*>/g, '') || ''}
            </div>
            {#if card.media.genres.length}
              <div class='px-15 pb-10 pt-5 genres'>
                {#each card.media.genres.slice(0, 3) as genre}
                  <span class='badge badge-pill badge-color text-dark mt-5 mr-5 font-weight-bold'>{genre}</span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <div class='empty d-flex flex-column align-items-center justify-content-center'>
      <h2 class='font-weight-semi-bold mb-10'>Ooops!</h2>
      <div>Looks like there's nothing here.</div>
    </div>
  {/each}
{/await}

<style>
  .pre-wrap {
    white-space: pre-wrap
  }
  .empty {
    height: 27rem;
    grid-column: 1 / -1;
  }
  .h-10 {
    height: 1rem !important;
  }

  .card-desc :global(p) {
    margin: 0;
  }

  .details span + span::before {
    content: ' • ';
    white-space: normal;
  }
  .card {
    animation: 0.3s ease 0s 1 load-in;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.2s ease;
    height: 27rem !important;
    box-shadow: rgba(0, 4, 12, 0.3) 0px 7px 15px, rgba(0, 4, 12, 0.05) 0px 4px 4px;
  }
  .card-grid {
    display: grid;
    grid-template-rows: auto 1fr auto;
  }
  .badge-color {
    background-color: var(--color) !important;
    border-color: var(--color) !important;
  }

  .card:hover {
    transform: scale(1.05);
  }

  @keyframes load {
    from {
      left: -100%;
    }

    to {
      left: 100%;
    }
  }

  @keyframes load-in {
    from {
      bottom: -1.2rem;
      transform: scale(0.95);
    }

    to {
      bottom: 0;
      transform: scale(1);
    }
  }
  .skeloader {
    position: relative;
    overflow: hidden;
  }

  .skeloader::before {
    will-change: left;
    content: '';
    position: absolute;
    height: 100%;
    width: 15rem;
    background: linear-gradient(to right, transparent 0%, #25282c 50%, transparent 100%);
    animation: load 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }
  .cover-img {
    object-fit: cover;
    background-color: var(--color) !important;
  }
  .day-row {
    grid-column: 1 / -1;
  }
  .list-status-circle {
    background: var(--statusColor);
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 50%;
  }
</style>
