<script>
  import SkeletonCard from './SkeletonCard.svelte'
  import SmallCard from './SmallCard.svelte'
  import EpisodeSkeletonCard from './EpisodeSkeletonCard.svelte'
  import FullCard from './FullCard.svelte'
  import EpisodeCard from './EpisodeCard.svelte'
  import FullSkeletonCard from './FullSkeletonCard.svelte'

  export let card
</script>

{#if card.type === 'episode'}

  {#await card.data}
    <EpisodeSkeletonCard />
  {:then data}
    {#if data}
      <EpisodeCard {data} />
    {/if}
  {/await}

{:else if card.type === 'full'}

  {#await card.data}
    <FullSkeletonCard />
  {:then media}
    {#if media}
      <FullCard {media} />
    {/if}
  {/await}

{:else} <!-- card.type === 'small'  -->

  {#await card.data}
    <SkeletonCard />
  {:then media}
    {#if media}
      <SmallCard {media} />
    {/if}
  {/await}

{/if}
