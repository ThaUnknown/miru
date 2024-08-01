<script>
  export let media = null

  const detailsMap = [
    { property: 'season', label: 'Season', icon: 'spa', custom: 'property' },
    { property: 'status', label: 'Status', icon: 'live_tv' },
    { property: 'nodes', label: 'Studio', icon: 'business' },
    { property: 'source', label: 'Source', icon: 'source' },
    { property: 'countryOfOrigin', label: 'Country', icon: 'public', custom: 'property' },
    { property: 'isAdult', label: 'Adult', icon: '18_up_rating' },
    { property: 'english', label: 'English', icon: 'title' },
    { property: 'romaji', label: 'Romaji', icon: 'translate' },
    { property: 'native', label: 'Native', icon: '語', custom: 'icon' }
  ]
  function getCustomProperty (detail, media) {
    if (detail.property === 'averageScore') {
      return media.averageScore + '%'
    } else if (detail.property === 'season') {
      return [media.season?.toLowerCase(), media.seasonYear].filter(f => f).join(' ')
    } else if (detail.property === 'countryOfOrigin') {
      const countryMap = {
        JP: 'Japan',
        CN: 'China',
        US: 'United States'
      }
      return countryMap[media.countryOfOrigin] || 'Unknown'
    } else {
      return media[detail.property]
    }
  }
  function getProperty (property, media) {
    if (property === 'episode') {
      return media.nextAiringEpisode?.episode
    } else if (property === 'english' || property === 'romaji' || property === 'native') {
      return media.title[property]
    } else if (property === 'isAdult') {
      return (media.isAdult === true ? 'Rated 18+' : false)
    }
    return media[property]
  }
</script>

<div class='card m-0 px-20 pb-0 pt-10 d-flex flex-row overflow-x-scroll text-capitalize align-items-start'>
  {#each detailsMap as detail}
    {@const property = getProperty(detail.property, media)}
    {#if property}
      <div class='d-flex flex-row mx-10 py-5'>
        <div class={'mr-10 ' + (detail.custom === 'icon' ? 'd-flex align-items-center text-nowrap font-size-20 font-weight-bold' : 'material-symbols-outlined font-size-24')}>
          {detail.icon}
        </div>
        <div class='d-flex flex-column justify-content-center text-nowrap'>
          <div class='font-weight-bold select-all'>
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
