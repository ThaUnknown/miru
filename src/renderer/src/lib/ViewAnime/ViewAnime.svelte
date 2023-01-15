<script>
  import { playAnime } from '../RSSView.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { getMediaMaxEp } from '@/modules/anime.js'
  import { wrapEnter } from '@/modules/util.js'
  import { getContext } from 'svelte'
  import Details from './Details.svelte'
  import Following from './Following.svelte'
  import Controls from './Controls.svelte'
  import ToggleList from './ToggleList.svelte'

  const view = getContext('view')
  const trailer = getContext('trailer')
  function close () {
    $view = null
  }
  $: media = $view
  let modal
  $: media && modal?.focus()
  $: !$trailer && modal?.focus()
  $: maxPlayEp = getMediaMaxEp($view || {}, true)
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
</script>

<div class='modal modal-full' class:show={media} on:keydown={checkClose} tabindex='-1' bind:this={modal}>
  {#if media}
    <div class='h-full modal-content bg-very-dark p-0 overflow-y-auto'>
      <button class='close pointer z-30 bg-dark top-20 right-0' type='button' on:click={close}> &times; </button>
      <div class='h-md-half w-full position-relative z-20'>
        <div class='h-full w-full position-absolute bg-dark-light banner' style:--bannerurl={`url('${media.bannerImage || ''}')`} />
        <div class='d-flex h-full top w-full'>
          <div class='container-xl w-full'>
            <div class='row d-flex justify-content-end flex-row h-full px-20 pt-20 px-xl-0'>
              <div class='col-md-3 col-4 d-flex h-full justify-content-end flex-column pb-15 align-items-center'>
                <img class='contain-img rounded mw-full mh-full shadow' alt='cover' src={media.coverImage?.extraLarge || media.coverImage?.medium} />
              </div>
              <div class='col-md-9 col-8 row align-content-end pl-20'>
                <div class='col-md-8 col-12 d-flex justify-content-end flex-column'>
                  <div class='px-md-20 d-flex flex-column font-size-12'>
                    <span class='title font-weight-bold pb-sm-15 text-white select-all'>
                      {media.title.userPreferred}
                    </span>
                    <div class='d-flex flex-row font-size-18 pb-sm-15'>
                      {#if media.averageScore}
                        <span class='material-icons mr-10 font-size-24'> trending_up </span>
                        <span class='mr-20'>
                          Rating: {media.averageScore + '%'}
                        </span>
                      {/if}
                      {#if media.format}
                        <span class='material-icons mx-10 font-size-24'> monitor </span>
                        <span class='mr-20 text-capitalize'>
                          Format: {media.format === 'TV' ? media.format : media.format?.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      {/if}
                      {#if media.episodes !== 1 && getMediaMaxEp(media)}
                        <span class='material-icons mx-10 font-size-24'> theaters </span>
                        <span class='mr-20'>
                          Episodes: {getMediaMaxEp(media)}
                        </span>
                      {:else if media.duration}
                        <span class='material-icons mx-10 font-size-24'> timer </span>
                        <span class='mr-20'>
                          Length: {media.duration + ' min'}
                        </span>
                      {/if}
                    </div>
                    <div class='pb-15 pt-5 px-5 overflow-x-auto text-nowrap font-weight-bold'>
                      {#each media.genres as genre}
                        <div class='badge badge-pill shadow'>
                          {genre}
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
                <Controls bind:media={$view} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class='container-xl bg-very-dark z-10'>
        <div class='row p-20 px-xl-0 flex-column-reverse flex-md-row'>
          <div class='col-md-9 px-20'>
            <h1 class='title font-weight-bold text-white'>Synopsis</h1>
            <div class='font-size-16 pr-15 pre-wrap select-all'>
              {media.description?.replace(/<[^>]*>/g, '') || ''}
            </div>
            <ToggleList list={media.relations?.edges?.filter(({ node }) => node.type === 'ANIME')} let:item title='Relations'>
              <div class='w-150 mx-15 mb-10 rel pointer'
                on:click={async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: item.node.id })).data.Media }}
                on:keydown={wrapEnter(async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: item.node.id })).data.Media })}
                tabindex='0' role='button'
              >
                <img loading='lazy' src={item.node.coverImage.medium || ''} alt='cover' class='cover-img w-full h-200 rel-img' />
                <div class='pt-5'>{item.relationType.replace(/_/g, ' ').toLowerCase()}</div>
                <h5 class='font-weight-bold text-white'>{item.node.title.userPreferred}</h5>
              </div>
            </ToggleList>
            {#if maxPlayEp}
              <table class='table table-hover w-500 table-auto'>
                <thead>
                  <tr>
                    <th class='px-0'><h2 class='title font-weight-bold text-white pt-20 mb-5'>Episodes</h2></th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {#each Array(maxPlayEp) as _, i}
                    {@const ep = maxPlayEp - i}
                    <tr class="font-size-20 py-10 pointer {ep <= media.mediaListEntry?.progress ? 'text-muted' : 'text-white'}"
                      on:click={() => {
                        playAnime(media, ep)
                        close()
                      }}
                      on:keydown={wrapEnter(() => {
                        playAnime(media, ep)
                        close()
                      })}
                      tabindex='0' role='button'
                    >
                      <td class='w-full font-weight-semi-bold'>Episode {ep}</td>
                      <td class='material-icons text-right h-full d-table-cell'>play_arrow</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {/if}
            <ToggleList list={media.recommendations.edges.filter(edge => edge.node.mediaRecommendation)} let:item title='Recommendations'>
              <div class='w-150 mx-15 mb-10 rel pointer'
                on:click={async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: item.node.mediaRecommendation.id })).data.Media }}
                on:keydown={wrapEnter(async () => { $view = null; $view = (await alRequest({ method: 'SearchIDSingle', id: item.node.mediaRecommendation.id })).data.Media })}
                tabindex='0' role='button'
              >
                <img loading='lazy' src={item.node.mediaRecommendation.coverImage.medium || ''} alt='cover' class='cover-img w-full h-200 rel-img' />
                <h5 class='font-weight-bold text-white'>{item.node.mediaRecommendation.title.userPreferred}</h5>
              </div>
            </ToggleList>
          </div>
          <div class='col-md-3 px-sm-0 px-20'>
            <Details {media} />
            <Following {media} />
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .pre-wrap {
    white-space: pre-wrap
  }
  .banner {
    background: no-repeat center center;
    background-size: cover;
    background-image: linear-gradient(0deg, rgba(17, 20, 23, 1) 0%, rgba(17, 20, 23, 0.8) 25%, rgba(17, 20, 23, 0.4) 50%, rgba(37, 40, 44, 0) 100%), var(--bannerurl) !important;
  }

  .d-table-cell {
    display: table-cell !important;
  }

  .top {
    backdrop-filter: blur(10px);
  }
  .title {
    font-size: 4rem;
  }
  .close {
    top: 1rem !important;
    left: unset !important;
    right: 2.5rem !important;
  }
  .badge {
    background-color: var(--dm-button-bg-color) !important;
    padding: 0.6rem 2rem;
    font-size: 1.4rem;
    border: none;
    margin-right: 0.6rem;
  }
  .rel-img{
    height: 27rem;
    width: 17rem
  }

  .cover-img {
    object-fit: cover;
  }

  .rel {
    transition: transform 0.2s ease;
  }
  .rel:hover {
    transform: scale(1.05);
  }
</style>
