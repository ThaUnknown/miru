<script>
  import { wrapEnter } from '@/modules/util.js'
  import Cards from './Cards.svelte'
  export let opts
  const cards = opts.preview()
</script>

<span class='d-flex px-20 align-items-end pointer text-decoration-none text-muted'
  on:click={opts.onclick} on:keydown={wrapEnter(opts.onclick)}
  tabindex='0'
  role='button'>
  <div class='pl-10 font-size-24 font-weight-semi-bold'>{opts.title}</div>
  <div class='pr-10 ml-auto font-size-12'>View More</div>
</span>
<div class='gallery pt-10 pb-20 w-full overflow-x-hidden position-relative'>
  <Cards {cards} />
</div>

<style>
  .text-muted:hover {
    color: var(--dm-link-text-color-hover) !important;
  }
  .gallery {
    display: grid;
    grid-auto-rows: auto;
    grid-gap: 2rem;
    padding: 2rem 4rem;
    position: relative;
    padding: 0.7rem 4rem;
    grid-template-columns: repeat(6, 50rem);
  }

  .gallery :global(.empty) {
    grid-column: 1/3 !important;
  }

  .gallery:after {
    content: '';
    position: absolute;
    right: 0;
    height: 100%;
    width: 8rem;
    background: linear-gradient(270deg, rgba(37, 40, 44, 1) 0%, rgba(37, 40, 44, 0) 100%);
    /*this gradient looks like ass, need to find smth better*/
    pointer-events: none;
  }
</style>
