<script>
  import { since } from '@/modules/util.js'
</script>

<div class='d-flex flex-column pl-lg-20'>
  <div class='w-full my-20 content-visibility-auto scale opacity-half px-20 h-150' tabindex='0' role='button'>
    <div class='rounded w-full h-full overflow-hidden d-flex flex-xsm-column flex-row pointer bg-black'>
      <div class='h-full'><img alt='thumbnail' src='https://artworks.thetvdb.com/banners/series/330139/episodes/5e9182bfcfe47.jpg' class='img-cover h-full' /></div>
      <div class='h-full w-full px-20 py-15 d-flex flex-column'>
        <div class='w-full d-flex flex-row mb-15'>
          <div class='text-white font-weight-bold font-size-16 overflow-hidden title'>1. "I Love You"</div>
          <div class='ml-auto pl-5'>25m</div>
        </div>
        <div class='progress mb-15' style='height: 2px; min-height: 2px;'><div class='progress-bar w-full' /></div>
        <div class='font-size-12 overflow-hidden'>Hodgins retrieves Violet from the hospital, as Major Gilbert asked him to look out for her. After they meet Gilbert`s relatives, he offers her a job.</div>
        <div class='pt-10 font-size-12 mt-auto'>{since(new Date('January 11, 2018'))}</div>
      </div>
    </div>
  </div>
  <div class='w-full my-20 content-visibility-auto scale h-150' tabindex='0' role='button'>
    <div class='rounded w-full h-full overflow-hidden d-flex flex-xsm-column flex-row pointer border bg-dark'>
      <div class='h-full'><img alt='thumbnail' src='https://artworks.thetvdb.com/banners/series/330139/episodes/5e918871eb4d4.jpg' class='img-cover h-full' /></div>
      <div class='h-full w-full px-20 py-15 d-flex flex-column'>
        <div class='w-full d-flex flex-row mb-15'>
          <div class='text-white font-weight-bold font-size-16 overflow-hidden title'>2. Not Coming Back</div>
          <div class='ml-auto pl-5'>25m</div>
        </div>
        <div class='font-size-12 overflow-hidden'>Violet tries to adjust to her new job: she needs to learn typing, and her coworkers question whether she has the right demeanor for letter writing.</div>
        <div class='pt-10 font-size-12 mt-auto'>{since(new Date('January 18, 2018'))}</div>
      </div>
    </div>
  </div>
</div>

<style>
  .opacity-half {
    opacity: 30%;
  }
  .title {
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .scale {
    transition: transform 0.2s ease;
  }
  .scale:hover{
    transform: scale(1.05);
  }
  .border {
    --dm-border-color: white
  }
  @media (max-width: 470px) {
    .flex-xsm-column {
      flex-direction: column !important;
    }
    .scale {
      height: auto !important;
    }
    img {
      width: 100%;
      height: 15rem !important;
    }
  }
</style>
