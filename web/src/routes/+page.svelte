<script>
  import Hero from '$lib/components/Hero.svelte'
  import SmallCard from '$lib/components/SmallCard.svelte'
  import { cards } from '$lib/dummyData.js'
  import { getContext } from 'svelte'

  const scrollPosition = getContext('scroll-position')
</script>

<Hero />
<div class='container-xl'>
  <div class='position-relative'>
    <img src='app.png' alt='app' class='mw-full px-20' />
    <div class='overlay-gradient position-absolute top-0 left-0 w-full h-full' />
  </div>

  <div class='content pb-20' id='about'>
    <h1 class='w-full font-weight-bold text-white px-20'>
      Torrenting made simple.
    </h1>
    <div class='row'>
      <div class='col-md-4 col-12'>
        <div class='content'>
          <h3>Quality meets speed</h3>
          <p class='text-muted font-size-16'>Stream torrents directly for playback, with no time wasted on looking for torrents or waiting for downloads to finish.</p>
        </div>
      </div>
      <div class='col-md-4 col-12'>
        <div class='content'>
          <h3>No expertise required</h3>
          <p class='text-muted font-size-16'>You don’t need to be a master of torrenting or have a deep understanding of technology, it simply works.</p>
        </div>
      </div>
      <div class='col-md-4 col-12'>
        <div class='content'>
          <h3>Configuration free</h3>
          <p class='text-muted font-size-16'>No need to look for setup guides, no need to worry about the ideal configuration, it’s perfect out of the box.</p>
        </div>
      </div>
    </div>
  </div>
  <hr class='my-20' />
  <div class='content pt-20'>
    <div class='row'>
      <div class='col-md-7 col-12'>
        <div class='content'>
          <h1 class='w-full font-weight-bold text-white'>
            Tightly integrated.
          </h1>
          <p class='text-muted font-size-16'>Find and download torrents, watch trailers, manage your list, search, browse and discover anime, watch together with friends and more, all in the same interface. No need to open multiple apps, tabs, everything shipped in one package.</p>
        </div>
      </div>
      <div class='col-md-5 col-12'>
        <div class='pb-10 w-full position-relative d-flex flex-row justify-content-start gallery' style:--left={(300 - ($scrollPosition - 700)) / 5 + 'px'}>
          {#each cards as media, i}
            <SmallCard {media} preview={i === 1} />
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay-gradient {
    background: linear-gradient(0deg, #0F1113 15.27%, rgba(15, 17, 19, 0.92) 41.28%, rgba(15, 17, 19, 0.25) 74.32%);
  }
  h1 {
    font-size: 5rem
  }
  .gallery {
    padding-left: clamp(0px, var(--left), 100px);
  }
</style>
