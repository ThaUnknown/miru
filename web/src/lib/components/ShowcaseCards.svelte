<script>
  import SmallCard from '$lib/components/SmallCard.svelte'
  import { cards } from '$lib/dummyData.js'
  import { getContext } from 'svelte'

  const scrollPosition = getContext('scroll-position')
</script>

<div class='pb-10 position-relative d-inline-flex flex-row skew-3d h-600'>
  <div class='d-inline-block gallery' style:--top={(-400 - ($scrollPosition - 800)) / 5 + 'px'}>
    {#each cards.slice(0, 4) as media, i}
      <SmallCard {media} preview={i === 1} />
    {/each}
  </div>
  <div class='d-inline-block gallery' style:--top={(-1600 + ($scrollPosition - 800)) / 5 + 'px'}>
    {#each cards.slice(4) as media}
      <SmallCard {media} />
    {/each}
  </div>
</div>

<style>
  .gallery {
    margin-top: var(--top);
  }

  .skew-3d {
    transform: matrix(1, 0, -0.05, 1, 0, 0);
  }
</style>
