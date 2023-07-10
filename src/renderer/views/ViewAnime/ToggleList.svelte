<script>
  import { click } from '@/modules/click.js'
  export let list = null
  let showMore = false
  function toggleList () {
    showMore = !showMore
  }
  export let title = 'Relations'
</script>
{#if list?.length}
  <span class='d-flex align-items-end pointer text-decoration-none pt-20' use:click={toggleList}>
    <h1 class='font-weight-bold text-white'>{title}</h1>
    {#if list.length > 4}
      <h6 class='ml-auto font-size-12 more text-muted'>{showMore ? 'Show Less' : 'Show More'}</h6>
    {/if}
  </span>
  <div class='d-flex text-capitalize flex-wrap card m-0'>
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
