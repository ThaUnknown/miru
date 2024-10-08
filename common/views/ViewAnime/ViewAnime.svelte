<script>
  import { getContext } from 'svelte'
  import { getMediaMaxEp, formatMap, playMedia } from '@/modules/anime.js'
  import { playAnime } from '@/views/TorrentSearch/TorrentModal.svelte'
  import { toast } from 'svelte-sonner'
  import { anilistClient } from '@/modules/anilist.js'
  import { click } from '@/modules/click.js'
  import Details from './Details.svelte'
  import EpisodeList from './EpisodeList.svelte'
  import ToggleList from './ToggleList.svelte'
  import Scoring from './Scoring.svelte'
  import AudioLabel from './AudioLabel.svelte'
  import Following from './Following.svelte'
  import smoothScroll from '@/modules/scroll.js'
  import IPC from '@/modules/ipc.js'
  import SmallCard from "@/components/cards/SmallCard.svelte"
  import SkeletonCard from "@/components/cards/SkeletonCard.svelte"
  import Helper from "@/modules/helper.js"
  import { ArrowLeft, Clapperboard, ExternalLink, Users, Heart, Play, Share2, Timer, TrendingUp, Tv } from 'lucide-svelte'

  export let overlay
  const view = getContext('view')
  function close (play) {
    $view = null
    mediaList = []
    if (!play) {
      overlay = 'none'
    }
  }
  function back () {
    if (mediaList.length > 1) {
      const prevMedia = mediaList[mediaList.length - 2]
      mediaList.splice(mediaList.length - 2, 2);
      $view = prevMedia
    }
  }
  function saveMedia () {
    if (mediaList.length > 0) {
      const lastMedia = mediaList[mediaList.length - 1]
      if (media !== lastMedia) {
        mediaList.push(media)
      }
    } else {
      mediaList.push(media)
    }
  }
  let modal
  let container = null
  let mediaList = []
  $: media = anilistClient.mediaCache[$view?.id] || $view
  $: mediaRecommendation = media && anilistClient.recommendations({ id: media.id })
  $: media && (modal?.focus(), overlay = 'viewanime', saveMedia(), (container && container.dispatchEvent(new Event('scrolltop'))))
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  function play (episode) {
    close(true)
    if (episode) return playAnime(media, episode)
    if (media.status === 'NOT_YET_RELEASED') return
    playMedia(media)
  }
  function getPlayButtonText (media) {
    if (media?.mediaListEntry) {
      const { status, progress } = media.mediaListEntry
      if (progress) {
        if (status === 'COMPLETED') {
          return 'Rewatch Now'
        } else {
          return 'Continue Now'
        }
      }
    }
    return 'Watch Now'
  }
  $: playButtonText = getPlayButtonText(media)
  function toggleFavourite () {
    anilistClient.favourite({ id: media.id })
    media.isFavourite = !media.isFavourite
  }
  function copyToClipboard (text) {
    navigator.clipboard.writeText(text)
    toast('Copied to clipboard', {
      description: 'Copied share URL to clipboard',
      duration: 5000
    })
  }
  function openInBrowser (url) {
    IPC.emit('open', url)
  }
  let episodeOrder = true
  window.addEventListener('overlay-check', () => {
    if (media) {
      close()
    }
  })

// async function score (media, score) {
    //   const variables = {
    //     id: media.id,
    //     score: score * 10
    //   }
    //   await anilistClient.entry(variables)
    //   media = (await anilistClient.searchIDSingle({ id: media.id })).data.Media
    // }
</script>

<div class='modal modal-full z-50' class:show={media} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
  {#if media}
    <div class='h-full modal-content bg-very-dark p-0 overflow-y-auto position-relative' bind:this={container} use:smoothScroll>
      {#if mediaList.length > 1}
        <button class='close back pointer z-30 bg-dark top-20 left-0 position-fixed' use:click={back}>
          <ArrowLeft size='1.8rem' />
        </button>
      {/if}
      <button class='close pointer z-30 bg-dark top-20 right-0 position-fixed' type='button' use:click={() => close()}> &times; </button>
      <img class='w-full cover-img banner position-absolute' alt='banner' src={media.bannerImage || ' '} />
      <div class='row px-20'>
        <div class='col-lg-7 col-12 pb-10'>
          <div class='d-flex flex-sm-row flex-column align-items-sm-end pb-20 mb-15'>
            <div class='cover d-flex flex-row align-items-sm-end align-items-center justify-content-center mw-full mb-sm-0 mb-20 w-full' style='max-height: 50vh;'>
              <img class='rounded cover-img overflow-hidden h-full' alt='cover-art' src={media.coverImage?.extraLarge || media.coverImage?.medium} />
            </div>
            <div class='pl-sm-20 ml-sm-20'>
              <h1 class='font-weight-very-bold text-white select-all mb-0'>{anilistClient.title(media)}</h1>
              <div class='d-flex flex-row font-size-18 flex-wrap mt-5'>
                {#if media.averageScore}
                  <div class='d-flex flex-row mt-10' title='{media.averageScore / 10} by {anilistClient.reviews(media)} reviews'>
                    <TrendingUp class='mx-10' size='2.2rem' />
                    <span class='mr-20'>
                      Rating: {media.averageScore + '%'}
                    </span>
                  </div>
                {/if}
                {#if media.format}
                  <div class='d-flex flex-row mt-10'>
                    <Tv class='mx-10' size='2.2rem' />
                    <span class='mr-20 text-capitalize'>
                      Format: {formatMap[media.format]}
                    </span>
                  </div>
                {/if}
                {#if media.episodes !== 1 && getMediaMaxEp(media)}
                  <div class='d-flex flex-row mt-10'>
                    <Clapperboard class='mx-10' size='2.2rem' />
                    <span class='mr-20'>
                      Episodes: {getMediaMaxEp(media)}
                    </span>
                  </div>
                {:else if media.duration}
                  <div class='d-flex flex-row mt-10'>
                    <Timer class='mx-10' size='2.2rem' />
                    <span class='mr-20'>
                      Length: {media.duration + ' min'}
                    </span>
                  </div>
                {/if}
                {#if media.averageScore && media.stats?.scoreDistribution}
                  <div class='d-flex flex-row mt-10'>
                    <Users class='mx-10' size='2.2rem' />
                    <span class='mr-20' title='{media.averageScore / 10} by {anilistClient.reviews(media)} reviews'>
                      Reviews: {anilistClient.reviews(media)}
                    </span>
                  </div>
                {/if}
                <div class='d-flex flex-row mt-10'>
                  <AudioLabel {media} viewAnime={true}/>
                </div>
              </div>
              <div class='d-flex flex-row flex-wrap'>
                <button class='btn btn-lg btn-secondary w-250 text-dark font-weight-bold shadow-none border-0 d-flex align-items-center justify-content-center mr-10 mt-20'
                  use:click={() => play()}
                  disabled={media.status === 'NOT_YET_RELEASED'}>
                  <Play class='mr-10' fill='currentColor' size='1.6rem' />
                  {playButtonText}
                </button>
                <div class='mt-20 d-flex'>
                  <button class='btn bg-dark btn-lg btn-square d-flex align-items-center justify-content-center shadow-none border-0' use:click={toggleFavourite} disabled={!Helper.isAniAuth()}>
                    <Heart fill={media.isFavourite ? 'currentColor' : 'transparent'} size='1.7rem' />
                  </button>
                  <Scoring {media} viewAnime={true} />
                  <button class='btn bg-dark btn-lg btn-square d-flex align-items-center justify-content-center shadow-none border-0 ml-10' use:click={() => copyToClipboard(`https://miru.watch/anime/${media.id}`)}>
                    <Share2 size='1.7rem' />
                  </button>
                  <button class='btn bg-dark btn-lg btn-square d-flex align-items-center justify-content-center shadow-none border-0 ml-10' use:click={() => openInBrowser(`https://anilist.co/anime/${media.id}`)}>
                    <ExternalLink size='1.7rem' />
                  </button>
                  <!-- <div class='input-group shadow-lg mb-5 font-size-16'>
                    <div class='input-group-prepend'>
                      <span class='input-group-text bg-tp pl-15 d-flex font-size-18'>hotel_class</span> stars
                    </div>
                    <select class='form-control' required value={(media.mediaListEntry?.score || '').toString()} on:change={({ target }) => { score(media, Number(target.value)) }}>
                      <option value selected disabled hidden>Score</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                      <option>7</option>
                      <option>8</option>
                      <option>9</option>
                      <option>10</option>
                    </select>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <Details {media} alt={mediaRecommendation} />
          <div class='m-0 px-20 pb-0 pt-10 d-flex flex-row text-nowrap overflow-x-scroll text-capitalize align-items-start'>
            {#each media.tags as tag}
              <div class='bg-dark px-20 py-10 mr-10 rounded text-nowrap'>
                <span class='font-weight-bolder'>{tag.name}</span><span class='font-weight-light'>: {tag.rank}%</span>
              </div>
          {/each}
          </div>
          <div class='d-flex flex-row mt-20 pt-10'>
            {#each media.genres as genre}
              <div class='bg-dark px-20 py-10 mr-10 rounded font-size-16'>
                {genre}
              </div>
            {/each}
          </div>
          {#if media.description}
            <div class='w-full d-flex flex-row align-items-center pt-20 mt-10'>
              <hr class='w-full' />
              <div class='font-size-18 font-weight-semi-bold px-20 text-white'>Synopsis</div>
              <hr class='w-full' />
            </div>
            <div class='font-size-16 pre-wrap pt-20 select-all'>
              {media.description?.replace(/<[^>]*>/g, '') || ''}
            </div>
          {/if}
          <ToggleList list={
            media.relations?.edges?.filter(({ node }) => node.type === 'ANIME').sort((a, b) => {
               const typeComparison = a.relationType.localeCompare(b.relationType)
               if (typeComparison !== 0) {
                  return typeComparison
               }
               return (a.node.seasonYear || 0) - (b.node.seasonYear || 0)
            })} promise={ anilistClient.searchIDS({ page: 1, perPage: 50, id: media.relations?.edges?.filter(({ node }) => node.type === 'ANIME').map(({ node }) => node.id) }) } let:item let:promise title='Relations'>
            <div class='small-card'>
              {#await promise}
                <SkeletonCard />
              {:then res }
                {#if res}
                  <SmallCard media={anilistClient.mediaCache[item.node.id]} type={item.relationType.replace(/_/g, ' ').toLowerCase()} />
                {/if}
              {/await}
            </div>
          </ToggleList>
          {#await mediaRecommendation then res} <!-- reduces query complexity improving load times -->
            {@const mediaRecommendation = res?.data?.Media}
            <ToggleList list={ mediaRecommendation.recommendations?.edges?.filter(({ node }) => node.mediaRecommendation).sort((a, b) => b.node.rating - a.node.rating) } promise={ anilistClient.searchIDS({ page: 1, perPage: 50, id: mediaRecommendation.recommendations?.edges?.map(({ node }) => node.mediaRecommendation?.id) }) } let:item let:promise title='Recommendations'>
              <div class='small-card'>
                {#await promise}
                  <SkeletonCard />
                {:then res }
                  {#if res}
                    <SmallCard media={anilistClient.mediaCache[item.node.mediaRecommendation.id]} type={item.node.rating} />
                  {/if}
                {/await}
              </div>
            </ToggleList>
          {/await}
          <Following {media} />
          <div class='w-full d-flex d-lg-none flex-row align-items-center pt-20 mt-10 pointer'>
            <hr class='w-full' />
            <div class='font-size-18 font-weight-semi-bold px-20 text-white'>Episodes</div>
            <hr class='w-full' />

            <div class='ml-auto pl-20 font-size-12 more text-muted text-nowrap' use:click={() => { episodeOrder = !episodeOrder }}>Reverse</div>
          </div>
        </div>
        <div class='col-lg-5 col-12 d-flex flex-column pl-lg-20 overflow-x-hidden'>
          <EpisodeList {media} {episodeOrder} userProgress={['CURRENT', 'PAUSED', 'DROPPED'].includes(media.mediaListEntry?.status) && media.mediaListEntry.progress} watched={media.mediaListEntry?.status === 'COMPLETED'} episodeCount={getMediaMaxEp(media)} {play} />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .close {
    top: 5rem !important;
    left: unset !important;
    right: 3rem !important;
  }
  .back {
    top: 5rem !important;
    left: 9rem !important;
    right: unset !important;
  }
  .banner {
    opacity: 0.5;
    z-index: 0;
    aspect-ratio: 5/1;
    min-height: 20rem;
  }
  @media (min-width: 577px) {
    .cover {
      max-width: 35% !important;
    }
  }
  .row {
    padding-top: 12rem !important
  }
  @media (min-width: 769px) {
    .row  {
      padding: 0 10rem;
    }
  }
  .cover {
    aspect-ratio: 7/10;
  }
  .small-card {
    width: 23rem !important;
  }

  button.bg-dark:not([disabled]):hover {
    background: #292d33 !important;
  }
</style>
