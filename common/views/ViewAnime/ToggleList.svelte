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
  <span class='d-flex align-items-end pointer' use:click={toggleList}>
    <div class='w-full d-flex flex-row align-items-center pt-20 mt-10'>
      <hr class='w-full' />
      <div class='font-size-18 font-weight-semi-bold px-20 text-white'>{title}</div>
      <hr class='w-full' />
      {#if list.length > 4}
        <div class='ml-auto pl-20 font-size-12 more text-muted text-nowrap'>{showMore ? 'Show Less' : 'Show More'}</div>
      {/if}
    </div>
  </span>
  <div class='d-flex text-capitalize flex-wrap pt-10 justify-content-center'>
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
