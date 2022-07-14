<script>
  export let list = null
  let showMore = false
  function toggleList () {
    showMore = !showMore
  }
</script>
{#if list?.length}
  <span class="d-flex align-items-end pointer text-decoration-none mt-20 pt-20" on:click={toggleList}>
    <h1 class="font-weight-bold text-white">Relations</h1>
    <h6 class="ml-auto font-size-12 more text-muted">{showMore ? 'Show Less' : 'Show More'}</h6>
  </span>
  <div class="d-flex text-capitalize flex-wrap pt-20 justify-center">
    {#each list.slice(0, showMore ? 100 : 4) as item}
      <slot {item} />
    {/each}
  </div>
{/if}

<style>
  .more:hover {
    color: var(--dm-link-text-color-hover) !important;
  }
</style>