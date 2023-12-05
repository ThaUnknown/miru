<script>
  import Hero from '$lib/components/Hero.svelte'
  import SmallCard from '$lib/components/SmallCard.svelte'
  import { cards } from '$lib/dummyData.js'
  import AndroidSvg from '$lib/svg/AndroidSVG.svelte'
  import AndroidTvsvg from '$lib/svg/AndroidTVSVG.svelte'
  import LinuxSvg from '$lib/svg/LinuxSVG.svelte'
  import MacOssvg from '$lib/svg/MacOSSVG.svelte'
  import SteamOssvg from '$lib/svg/SteamOSSVG.svelte'
  import WindowsSvg from '$lib/svg/WindowsSVG.svelte'
  import Stargazers from '$lib/components/Stargazers.svelte'
  import { getContext } from 'svelte'

  const scrollPosition = getContext('scroll-position')

  /** @type {import('./$types').PageData} */
  export let data
</script>

<Hero />
<div class='container-xl'>
  <div class='position-relative'>
    <img src='app.webp' alt='app' class='mw-full px-20 w-full app-image' />
    <div class='overlay-gradient position-absolute top-0 left-0 w-full h-full' />
  </div>

  <div class='my-20 pb-20' id='about'>
    <h1 class='w-full font-weight-bold text-white content'>
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
  <div class='my-20 py-20'>
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
        <div class='pb-10 w-full position-relative d-flex flex-row justify-content-start gallery' style:--left={(300 - ($scrollPosition - 800)) / 5 + 'px'}>
          {#each cards as media, i}
            <SmallCard {media} preview={i === 1} />
          {/each}
        </div>
      </div>
    </div>
  </div>
  <hr class='my-20' />
  <div class='my-20 py-20'>
    <div class='row flex-column-reverse flex-md-row'>
      <div class='col-md-5 col-12'>
        <div class='content'>
          <img src='player.webp' alt='player' class='mw-full' />
        </div>
      </div>
      <div class='col-md-7 col-12'>
        <div class='content'>
          <h1 class='w-full font-weight-bold text-white'>
            It already does that.
          </h1>
          <p class='text-muted font-size-16'>Feature rich, with a perfect balance of simplicity, with no restrictions, paywalls or tracking. You want it, Miru does it. No need for multi-layer-deep configuration, complex setup, or high entry levels, Miru comes perfectly functional out of the box.</p>
        </div>
      </div>
    </div>
  </div>
  <hr class='my-20' />
  <div class='my-20 py-20'>
    <div class='row'>
      <div class='col-md-7 col-12'>
        <div class='content'>
          <h1 class='w-full font-weight-bold text-white'>
            Available everywhere.
          </h1>
          <p class='text-muted font-size-16'>No need to install different apps for different devices and platforms, this app is available on every platform and operating system.</p>
        </div>
      </div>
      <div class='col-md-5 col-12 platform-grid p-20 text-white'>
        <WindowsSvg class='w-50 h-50' />
        <MacOssvg class='w-50 h-50' />
        <LinuxSvg class='w-50 h-50' />
        <AndroidSvg class='w-50 h-50' />
        <AndroidTvsvg class='w-50 h-50' />
        <SteamOssvg class='w-50 h-50' />
      </div>
    </div>
  </div>
  <hr class='my-20' />
  <div class='mt-20 pt-20'>
    <h1 class='w-full font-weight-bold text-white content'>
      Loved by thousands.
    </h1>
  </div>
</div>
<Stargazers stargazers={data.stargazers} />

<style>
  .app-image {
    aspect-ratio: 2/1;
    object-fit: contain;
  }
  .overlay-gradient {
    background: linear-gradient(0deg, #0F1113 15.27%, rgba(15, 17, 19, 0.92) 41.28%, rgba(15, 17, 19, 0.25) 74.32%);
  }

  .platform-grid {
    display: grid;
    grid-template-columns: 8rem 8rem 8rem;
    grid-template-rows: 8rem 8rem;
    justify-content: center;
    justify-items: center;
    align-items: center;
    align-content: center;
  }
  h1 {
    font-size: 5rem
  }
  @media (pointer: none), (pointer: coarse){
    .gallery {
      padding-left: 0 !important;
    }
  }
  .gallery {
    padding-left: clamp(0px, var(--left), 100px);
  }
</style>
