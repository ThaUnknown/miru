<script context='module'>
  const fakecards = Array.from({ length: 10 }, () => ({ data: new Promise(() => {}) }))
</script>

<script>
  import Card from '@/components/cards/Card.svelte'

  import { wrapEnter } from '@/modules/util.js'
  export let opts

  async function deferredLoad (element) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!opts.preview) opts.preview = opts.load(1, 10)
        observer.unobserve(element)
      }
    }, { hreshold: 0 })
    observer.observe(element)
  }
</script>

<span class='d-flex px-20 align-items-end pointer text-decoration-none text-muted'
  on:click={opts.onclick} on:keydown={wrapEnter(opts.onclick)}
  tabindex='0'
  use:deferredLoad
  role='button'>
  <div class='font-size-24 font-weight-semi-bold'>{opts.title}</div>
  <div class='pr-10 ml-auto font-size-12'>View More</div>
</span>
<div class='pb-10 w-full position-relative d-flex flex-row justify-content-start gallery'>
  {#each opts.preview || fakecards as card}
    <Card {card} />
  {/each}
</div>

<style>
  .text-muted:hover {
    color: var(--dm-link-text-color-hover) !important;
  }
  .gallery:after {
    content: '';
    position: absolute;
    right: 0;
    height: 100%;
    width: 8rem;
    background: linear-gradient(270deg, #17191cff 0%, #17191c00 100%);
    pointer-events: none;
  }
</style>
