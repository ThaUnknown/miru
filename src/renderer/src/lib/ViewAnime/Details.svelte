<script>
  import { countdown } from '@/modules/util.js'
  import { getMediaMaxEp } from '@/modules/anime.js'
  export let media = null

  const detailsMap = [
    { property: 'episode', label: 'Airing', icon: 'schedule', custom: 'property' },
    { property: 'genres', label: 'Genres', icon: 'theater_comedy' },
    { property: 'season', label: 'Season', icon: 'spa', custom: 'property' },
    { property: 'episodes', label: 'Episodes', icon: 'theaters', custom: 'property' },
    { property: 'duration', label: 'Duration', icon: 'timer', custom: 'property' },
    { property: 'format', label: 'Format', icon: 'monitor' },
    { property: 'status', label: 'Status', icon: 'live_tv' },
    { property: 'nodes', label: 'Studio', icon: 'business' },
    { property: 'source', label: 'Source', icon: 'source' },
    { property: 'averageScore', label: 'Rating', icon: 'trending_up', custom: 'property' },
    { property: 'english', label: 'English', icon: 'title' },
    { property: 'romaji', label: 'Romaji', icon: 'translate' },
    { property: 'native', label: 'Native', icon: '語', custom: 'icon' }
  ]
  function getCustomProperty (detail, media) {
    if (detail.property === 'episodes') {
      if (media.mediaListEntry?.progress) {
        return `Watched ${media.mediaListEntry.progress} of ${getMediaMaxEp(media)}`
      }
      return `${getMediaMaxEp(media)} Episodes`
    } else if (detail.property === 'averageScore') {
      return media.averageScore + '%'
    } else if (detail.property === 'duration') {
      return `${media.duration} minutes`
    } else if (detail.property === 'season') {
      return [media.season?.toLowerCase(), media.seasonYear].filter(f => f).join(' ')
    } else if (detail.property === 'episode') {
      return `Ep ${media.nextAiringEpisode.episode}: ${countdown(media.nextAiringEpisode.timeUntilAiring)}`
    } else {
      return media[detail.property]
    }
  }
  function getProperty (property, media) {
    if (property === 'episode') {
      return media.nextAiringEpisode?.episode
    } else if (property === 'english' || property === 'romaji' || property === 'native') {
      return media.title[property]
    }
    return media[property]
  }
</script>

<h1 class='title font-weight-bold text-white'>Details</h1>
<div class='card m-0 px-20 pb-0 pb-md-10 pt-10 d-flex flex-md-column flex-row overflow-x-scroll text-capitalize align-items-start'>
  {#each detailsMap as detail}
    {@const property = getProperty(detail.property, media)}
    {#if property}
      <div class='d-flex flex-row mx-10 py-5'>
        <div class={'mr-10 ' + (detail.custom === 'icon' ? 'd-flex align-items-center text-nowrap font-size-20 font-weight-bold' : 'material-icons font-size-24')}>
          {detail.icon}
        </div>
        <div class='d-flex flex-column justify-content-center text-nowrap'>
          <div class='font-weight-bold'>
            {#if detail.custom === 'property'}
              {getCustomProperty(detail, media)}
            {:else if property.constructor === Array}
              {property === 'nodes' ? property[0] && property[0].name : property.join(', ').replace(/_/g, ' ').toLowerCase()}
            {:else}
              {property.toString().replace(/_/g, ' ').toLowerCase()}
            {/if}
          </div>
          <div />
        </div>
      </div>
    {/if}
  {/each}
</div>
