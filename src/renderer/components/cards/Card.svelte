<script>
  import SkeletonCard from './SkeletonCard.svelte'
  import SmallCard from './SmallCard.svelte'
  import EpisodeSkeletonCard from './EpisodeSkeletonCard.svelte'
  import FullCard from './FullCard.svelte'
  import EpisodeCard from './EpisodeCard.svelte'
  import FullSkeletonCard from './FullSkeletonCard.svelte'
  import { set } from '../../views/Settings.svelte'

  export let card

  const type = card.type || set.cards
</script>

{#if type === 'episode'}

  {#await card.data}
    <EpisodeSkeletonCard />
  {:then data}
    {#if data}
      <EpisodeCard {data} />
    {/if}
  {/await}

{:else if type === 'full'}

  {#await card.data}
    <FullSkeletonCard />
  {:then media}
    {#if media}
      <FullCard {media} />
    {/if}
  {/await}

{:else} <!-- type === 'small'  -->

  {#await card.data}
    <SkeletonCard />
  {:then media}
    {#if media}
      <SmallCard {media} />
    {/if}
  {/await}

{/if}
