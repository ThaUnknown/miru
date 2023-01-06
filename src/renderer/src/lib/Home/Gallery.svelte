<script>
  import Cards from './Cards.svelte'

  export let media
  $: update(media)
  let loading = true
  async function update (med) {
    loading = true
    const index = med.length - 1
    await med[index]
    if (med[index] === media[media.length - 1]) loading = false
  }
</script>

<div class='gallery browse' class:loading>
  {#each media as cards, i (i)}
    <Cards {cards} length={4} tabable={true} />
  {/each}
</div>

<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, 50rem);
    grid-auto-rows: auto;
    justify-content: center;
    grid-gap: 2rem;
    padding: 2rem 4rem;
    position: relative;
  }

  .loading:after {
    content: '';
    position: absolute;
    bottom: 0;
    height: 40rem;
    width: 100%;
    background: linear-gradient(0deg, rgba(37, 40, 44, 1) 0%, rgba(37, 40, 44, 1) 70%, rgba(37, 40, 44, 1) 75%, rgba(37, 40, 44, 0.45) 90%, rgba(37, 40, 44, 0) 100%);
  }
</style>
