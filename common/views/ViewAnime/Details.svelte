<script>
  import { Building2, FolderKanban, Languages, Leaf, MonitorPlay, Type } from 'lucide-svelte'

  export let media = null

  const detailsMap = [
    { property: 'season', label: 'Season', icon: Leaf, custom: 'property' },
    { property: 'status', label: 'Status', icon: MonitorPlay },
    { property: 'nodes', label: 'Studio', icon: Building2 },
    { property: 'source', label: 'Source', icon: FolderKanban },
    { property: 'english', label: 'English', icon: Type },
    { property: 'romaji', label: 'Romaji', icon: Languages },
    { property: 'native', label: 'Native', icon: '語', custom: 'icon' }
  ]
  function getCustomProperty (detail, media) {
    if (detail.property === 'averageScore') {
      return media.averageScore + '%'
    } else if (detail.property === 'season') {
      return [media.season?.toLowerCase(), media.seasonYear].filter(f => f).join(' ')
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
