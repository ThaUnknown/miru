<script>
  import Cards from './Cards.svelte'

  export let media
  $: update(media)
  let loading = true
  async function update(med) {
    loading = true
    await med
    if (med === media) loading = false
  }
</script>

<div class="gallery browse" class:loading>
  <Cards cards={media} />
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

  .loading {
    height: 30rem !important;
    overflow-y: hidden !important;
  }

  .loading:after {
    content: '';
    position: absolute;
    bottom: 0;
    height: 10rem;
    width: 100%;
    background: linear-gradient(0deg, rgba(37, 40, 44, 1) 0%, rgba(37, 40, 44, 1) 15%, rgba(37, 40, 44, 0.45) 70%, rgba(37, 40, 44, 0) 100%);
  }
</style>
