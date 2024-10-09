<script>
  import { Building2, Earth, TriangleAlert, FolderKanban, Languages, CalendarRange, MonitorPlay, Type } from 'lucide-svelte'

  export let media = null
  export let alt = null

  const detailsMap = [
    { property: 'season', label: 'Season', icon: CalendarRange, custom: 'property' },
    { property: 'status', label: 'Status', icon: MonitorPlay },
    { property: 'studios', label: 'Studio', icon: Building2, custom: 'property' },
    { property: 'source', label: 'Source', icon: FolderKanban },
    { property: 'countryOfOrigin', label: 'Country', icon: Earth, custom: 'property' },
    { property: 'isAdult', label: 'Adult', icon: TriangleAlert },
    { property: 'english', label: 'English', icon: Type },
    { property: 'romaji', label: 'Romaji', icon: Languages },
    { property: 'native', label: 'Native', icon: '語', custom: 'icon' }
  ]
  async function getCustomProperty (detail, media) {
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
    } else if (detail.property === 'studios') { // has to be manually fetched as studios returned by user lists are broken.
      return ((await alt)?.data?.Media || media)?.studios?.nodes?.map(node => node.name).filter(name => name).join(', ') || 'Unknown'
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
      <div class='d-flex flex-row mx-10 py-5 justify-content-center'>
        {#if detail.custom !== 'icon'}
          <svelte:component size='2rem' this={detail.icon} class='mr-10' />
        {:else}
          <div class='mr-10 d-flex align-items-center text-nowrap font-size-12 font-weight-bold line-height-normal'>
            {detail.icon}
          </div>
        {/if}
        <div class='d-flex flex-column justify-content-center text-nowrap'>
          <div class='font-weight-bold select-all line-height-normal'>
            {#if detail.custom === 'property'}
              {#await getCustomProperty(detail, media)}
                Fetching...
              {:then res }
                {res}
              {/await}
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
