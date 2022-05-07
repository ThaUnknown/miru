<script>
  import { onDestroy } from 'svelte'

  import Cards from './Cards.svelte'
  export let opts
  let cards = [opts.load(1, 6)]
  let interval = null
  let canScroll = true
  let page = 1
  if (opts.releases) {
    interval = setInterval(async () => {
      const media = await opts.load(1, 6, false, false)
      if (media) cards = [media]
    }, 30000)
  }
  onDestroy(() => {
    if (interval) clearInterval(interval)
  })
  async function scroll() {
    if (canScroll && this.scrollLeft + this.clientWidth > this.scrollWidth - 800) {
      canScroll = false
      const res = opts.load(++page, 6, false, false);
      cards.push(res)
      cards = cards
      canScroll = !!(await res)
    }
  }
</script>

<span class="d-flex px-20 align-items-end pointer text-decoration-none text-muted" on:click={opts.onclick}>
  <div class="pl-10 font-size-24 font-weight-semi-bold">{opts.title}</div>
  <div class="pr-10 ml-auto font-size-12">View More</div>
</span>
<div class="gallery-shadow pt-10 w-full position-relative">
  <div class="gallery pb-2 overflow-x-scroll" on:scroll={scroll}>
    {#each cards as cardlist}
      <Cards cards={cardlist} />
    {/each}
  </div>
</div>

<style>
  .text-muted:hover {
    color: var(--dm-link-text-color-hover) !important;
  }
  .gallery {
    display: flex;
    gap: 2rem;
    padding: 2rem 4rem;
    position: relative;
    padding: 0.7rem 4rem;
  }

  .gallery :global(.card) {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 50rem;
  }
  .gallery :global(.empty) {
    grid-column: 1/3 !important;
    flex-basis: 16.6666666667rem;
  }

  .gallery-shadow:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: calc(100% - 1.5rem);
    width: 8rem;
    background: linear-gradient(270deg, rgba(37, 40, 44, 1) 0%, rgba(37, 40, 44, 0) 100%);
    /*this gradient looks like ass, need to find smth better*/
    pointer-events: none;
  }
</style>
