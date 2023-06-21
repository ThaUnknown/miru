<script>
  import FullBanner from './FullBanner.svelte'
  import SkeletonBanner from './SkeletonBanner.svelte'
  export let data
</script>

<div class='w-full h-450 position-relative gradient'>
  {#await data}
    <SkeletonBanner />
  {:then { data }}
    <FullBanner media={data.Page.media[0]} />
  {/await}
</div>

<style>
  .gradient {
    background: linear-gradient(0deg, #17191D 0%, #0000 15%, #0000 100%), linear-gradient(90deg, #17191D 0%, rgba(23, 25, 29, 0.885417) 15%, rgba(25, 28, 32, 0) 72%);
  }
</style>
