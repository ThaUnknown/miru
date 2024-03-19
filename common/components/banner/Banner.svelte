<script>
  import FullBanner from './FullBanner.svelte'
  import SkeletonBanner from './SkeletonBanner.svelte'
  export let data

  /**
   * Shuffles array in place.
   * @template T
   * @param {T[]} array items An array containing the items.
   * @returns {T[]}
   */
  function shuffle (array) {
    let currentIndex = array.length
    let randomIndex

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex--);

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
  }
</script>

<div class='w-full h-450 position-relative gradient'>
  {#await data}
    <SkeletonBanner />
  {:then { data }}
    <FullBanner mediaList={shuffle(data.Page.media).slice(0, 5)} />
  {/await}
</div>

<style>
  .gradient {
    background: linear-gradient(0deg, #17191D 0%, #0000 15%, #0000 100%), linear-gradient(90deg, #17191D 0%, rgba(23, 25, 29, 0.885417) 15%, rgba(25, 28, 32, 0) 72%);
  }
</style>
