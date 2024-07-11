<script context='module'>
  const fakecards = Array.from({ length: 15 }, () => ({ data: new Promise(() => {}) }))
</script>

<script>
  import Card from '@/components/cards/Card.svelte'
  import ErrorCard from '@/components/cards/ErrorCard.svelte'
  import { search } from '../Search.svelte'
  import { page } from '@/App.svelte'
  import { click } from '@/modules/click.js'

  export let opts

  function deferredLoad (element) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!opts.preview.value) opts.preview.value = opts.load(1, 15)
        observer.unobserve(element)
      }
    }, { threshold: 0 })
    observer.observe(element)

    return { destroy () { observer.unobserve(element) } }
  }

  function _click () {
    $search = {
      ...opts.variables,
      load: opts.load
    }
    $page = 'search'
  }
  const preview = opts.preview
</script>

<span class='d-flex px-20 align-items-end pointer text-decoration-none text-muted'
  use:deferredLoad>
  <div class='font-size-24 font-weight-semi-bold' use:click={_click}>{opts.title}</div>
  <div class='pr-10 ml-auto font-size-12' use:click={_click}>View More</div>
</span>
<div class='position-relative'>
  <div class='pb-10 w-full d-flex flex-row justify-content-start gallery' class:isRSS={opts.isRSS}>
    {#each $preview || fakecards as card}
      <Card {card} />
    {/each}
    {#if $preview?.length}
      <ErrorCard promise={$preview[0].data} />
    {/if}
  </div>
</div>

<style>
  .gallery :global(.first-check:first-child) :global(.absolute-container) {
    left: -48% !important
  }
  .text-muted:hover {
    color: var(--dm-link-text-color-hover) !important;
  }
  .gallery:after {
    content: '';
    position: absolute;
    right: 0;
    height: 100%;
    width: 8rem;
    background: var(--section-end-gradient);
    pointer-events: none;
  }
  .gallery {
    overflow-x: scroll;
    flex-shrink: 0;
  }
  .gallery.isRSS {
    overflow-x: clip;
  }
  .gallery :global(.item.small-card) {
    width: 19rem !important
  }
  .gallery::-webkit-scrollbar {
    display: none;
  }
</style>
