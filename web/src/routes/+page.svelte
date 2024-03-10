<script>
  import Hero from '$lib/components/Hero.svelte'
  import AndroidSvg from '$lib/svg/AndroidSVG.svelte'
  import AndroidTvsvg from '$lib/svg/AndroidTVSVG.svelte'
  import LinuxSvg from '$lib/svg/LinuxSVG.svelte'
  import MacOssvg from '$lib/svg/MacOSSVG.svelte'
  import SteamOssvg from '$lib/svg/SteamOSSVG.svelte'
  import WindowsSvg from '$lib/svg/WindowsSVG.svelte'
  import Stargazers from '$lib/components/Stargazers.svelte'
  import ShowcaseCards from '$lib/components/ShowcaseCards.svelte'
  import VideoShowcase from '$lib/components/VideoShowcase.svelte'
  import EpisodeList from '$lib/components/EpisodeList.svelte'
  import Testimonials from '$lib/components/Testimonials.svelte'
  import { violetEpisodes } from '$lib/dummyData.js'

  export let data
</script>

<Hero />
<div class='container-xl'>
  <VideoShowcase />
</div>

<div class='position-relative'>
  <div class='glow top-0 right-0 position-absolute' />
</div>

<div class='container-xl'>
  <div class='my-20 pb-20' id='about'>
    <h1 class='font-weight-bold text-white content text-center'>Torrenting made simple.</h1>
    <p class='text-muted font-size-18 content text-center pb-20'>Feature-rich yet wonderfully simple. Miru delivers what you want effortlessly.<br />No complex configurations or high entry barriers — Miru is perfectly functional out of the box.</p>
    <div class='row pt-20'>
      <div class='col-md-4 col-12'>
        <div class='content'>
          <div class='d-flex flex-row text-white align-items-center'>
            <h1 class='material-symbols-outlined mr-20 mb-0'>rocket_launch</h1>
            <h4 class='font-weight-bold mb-0'>Quality meets speed</h4>
          </div>
          <p class='text-muted font-size-16'>Stream torrents directly for playback, with no time wasted on looking for torrents or waiting for downloads to finish.</p>
        </div>
      </div>
      <div class='col-md-4 col-12'>
        <div class='content'>
          <div class='d-flex flex-row text-white align-items-center'>
            <h1 class='material-symbols-outlined mr-20 mb-0'>link</h1>
            <h4 class='font-weight-bold mb-0'>No expertise required</h4>
          </div>
          <p class='text-muted font-size-16'>You don’t need to be a master of torrenting or have a deep understanding of technology, it simply works.</p>
        </div>
      </div>
      <div class='col-md-4 col-12'>
        <div class='content'>
          <div class='d-flex flex-row text-white align-items-center'>
            <h1 class='material-symbols-outlined mr-20 mb-0'>handyman</h1>
            <h4 class='font-weight-bold mb-0'>Configuration free</h4>
          </div>
          <p class='text-muted font-size-16'>No need to look for setup guides, no need to worry about the ideal configuration, it’s perfect out of the box.</p>
        </div>
      </div>
    </div>
  </div>
  <hr />
</div>
<div class='position-relative z-100'>
  <div class='glow top-0 left-0 position-absolute z-100' />
</div>
<div class='overflow-hidden my-20 position-relative'>
  <div class='container-xl'>
    <div class='row'>
      <div class='col-md-7 col-12 align-items-center d-flex'>
        <div class='content pr-20'>
          <p class='font-weight-bold text-white font-size-18'>Care to try?</p>
          <h1 class='w-full font-weight-bold text-white'>
            All in one spot.
          </h1>
          <p class='text-muted font-size-16'>Find and download torrents, watch trailers, manage your list, search, browse and discover anime, watch together with friends and more, all in the same interface. No need to open multiple apps, tabs, everything shipped in one package.</p>
        </div>
      </div>
      <div class='col-md-5 col-12 overflow-hidden overflow-md-unset h-600 position-relative justify-content-center justify-content-md-end d-flex'>
        <ShowcaseCards />
        <div class='overlay-gradient-top-bottom position-absolute top-0 left-0 w-full h-full z-50 d-md-none' />
      </div>
    </div>
  </div>
  <div class='overlay-gradient-top-bottom position-absolute top-0 right-0 w-half h-full z-100 d-none d-md-block' />
</div>

<div class='container-xl'>
  <hr />
  <div class='my-20 py-20'>
    <div class='row flex-column-reverse flex-lg-row'>
      <div class='col-lg-6 col-12'>
        <div class='content'>
          <EpisodeList episodeList={violetEpisodes} userProgress={1} />
        </div>
      </div>
      <div class='col-lg-6 col-12 align-items-center d-flex'>
        <div class='content'>
          <h1 class='w-full font-weight-bold text-white'>
            It already does that.
          </h1>
          <p class='text-muted font-size-16'>Feature rich, with a perfect balance of simplicity, with no restrictions, paywalls or tracking. You want it, Miru does it. No need for multi-layer-deep configuration, complex setup, or high entry levels, Miru comes perfectly functional out of the box.</p>
        </div>
      </div>
    </div>
  </div>
  <hr />
  <div class='my-20 py-20'>
    <div class='content'>
      <h1 class='text-center font-weight-bold text-white'>
        Available everywhere.
      </h1>
      <p class='text-center text-muted font-size-16'>No need to install different apps for different devices and platforms, effortlessly install on any<br />platform, ensuring a seamless anime experience on any device. Whether you prefer Windows, Linux, Mac, Android and more.</p>
    </div>
    <div class='platform-grid p-20 text-white'>
      <WindowsSvg class='w-50 h-50' />
      <MacOssvg class='w-50 h-50' />
      <LinuxSvg class='w-50 h-50' />
      <AndroidSvg class='w-50 h-50' />
      <AndroidTvsvg class='w-50 h-50' />
      <SteamOssvg class='w-50 h-50' />
    </div>
  </div>
  <hr />
  <div class='mt-20 pt-20'>
    <h1 class='w-full font-weight-bold text-white content'>
      Loved by thousands.
    </h1>
  </div>
</div>
<Stargazers stargazers={data.stargazers} />
<div class='container-xl'>
  <hr />
  <div class='my-20 py-20'>
    <div class='content'>
      <h1 class='text-center font-weight-bold text-white'>
        What they say...
      </h1>
    </div>
    <Testimonials />
  </div>
</div>
<hr class='mb-0' />
<div class='bg-dark'>
  <div class='container-xl pt-20'>
    <div class='pt-20'>
      <div class='content my-0 align-items-center d-flex flex-column'>
        <h1 class='text-center font-weight-bold text-white mb-0'>
          MIRU
        </h1>
        <p class='text-center text-muted font-size-16'>Start your journey right here. Right now. Get started by<br />clicking download button below.</p>
        <a href='/download' class='btn btn-danger btn-lg'>
          Download
        </a>

        <div class='h-150 w-full overflow-hidden mt-20 pt-20'>
          <img src='app.webp' alt='app' class='mw-full px-20 w-full app-image' />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .btn-danger {
    --dm-button-danger-bg-color: #e5204c
  }
  .glow {
    background-image: radial-gradient(circle farthest-side,rgba(255,0,182,.05),hsla(0,0%,100%,0));
    pointer-events: none;
    height: 100rem;
    width: 100rem;
  }
  .glow.left-0 {
    transform: translate(-70%, -20%);
  }
  .glow.right-0 {
    transform: translate(70%, -60%);
  }
  .overlay-gradient-top-bottom {
    background: linear-gradient(0deg, #101113ff 0%, #10111300 25%, #10111300 75%, #101113ff);
    pointer-events: none;
  }

  .platform-grid {
    display: grid;
    grid-template-columns: 8rem 8rem 8rem;
    gap: 4rem;
    grid-template-rows: 8rem 8rem;
    justify-content: center;
    justify-items: center;
    align-items: center;
    align-content: center;
  }
  h1 {
    font-size: 5rem
  }
  @media (min-width: 769px) {
    .overflow-md-unset {
      overflow: unset !important;
    }
  }

  hr {
    margin: 7rem 0;
  }
</style>
