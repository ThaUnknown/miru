<script>
  import WindowsSVG from '$lib/svg/WindowsSVG.svelte'
  import MacOSSVG from '$lib/svg/MacOSSVG.svelte'
  import LinuxSVG from '$lib/svg/LinuxSVG.svelte'
  import AndroidSVG from '$lib/svg/AndroidSVG.svelte'
  import AndroidTVSVG from '$lib/svg/AndroidTVSVG.svelte'
  import SteamOSSVG from '$lib/svg/SteamOSSVG.svelte'

  function getOS () {
    const platform = navigator.userAgentData?.platform || navigator.platform
    const macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iosPlatforms = ['iPhone', 'iPad', 'iPod']

    if (macosPlatforms.includes(platform)) return 'Mac OS'
    if (iosPlatforms.includes(platform)) return 'iOS'
    if (windowsPlatforms.includes(platform)) return 'Windows'
    if (/Android/.test(navigator.userAgent)) return 'Android'
    if (/Linux/.test(platform)) return 'Linux'
  }

  async function downloadForOS (os = userOS || 'Windows', linuxFormat = '.AppImage') {
    if (os === 'iOS') return
    if (os === 'Android') return open('https://play.google.com/')

    const releases = await data.releases

    const { assets } = releases[0]
    if (os === 'Windows') return (location.href = assets.find(({ name }) => name.endsWith('.exe')).browser_download_url)
    if (os === 'Mac OS') return (location.href = assets.find(({ name }) => name.endsWith('.dmg')).browser_download_url)
    if (os === 'Linux') return (location.href = assets.find(({ name }) => name.endsWith(linuxFormat)).browser_download_url)
  }

  const userOS = getOS()

  // setTimeout(() => downloadForOS(), 2000)

  /** @type {import('./$types').PageData} */
  export let data
</script>

<div class='container'>
  <div class='h-vh-half d-flex justify-content-center align-items-center flex-column px-20 px-sm-0 pt-20'>
    <h1 class='font-weight-bold text-white title mt-20 pt-20 text-center'>Almost there!</h1>
    <div class='font-size-18 text-muted text-center'>
      Now run the installer that just downloaded.<br /><br />
      Your download should begin automatically. Didn’t work?
    </div>
    <button class='btn btn-lg btn-link mb-20' on:click={() => downloadForOS()}>
      Try downloading again.
    </button>
  </div>
  <hr class='my-20' />
  <div class='px-20 px-sm-0 row'>
    <div class='col-12 col-lg-6 d-flex flex-column align-items-center d-lg-block pr-lg-20 pt-20'>
      <h3 class='font-weight-bold text-white text-center text-lg-left pb-15'>Get Miru for other devices</h3>
      <button class='card pointer col-2 m-0 mb-20 mw-full pb-20 w-500 d-block' on:click={() => downloadForOS('Windows')}>
        <WindowsSVG />
        <div class='font-size-18 font-weight-semi-bold mt-5'>Windows</div>
        <div class='text-muted'>exe</div>
      </button>
      <button class='card pointer col-2 m-0 mb-20 mw-full pb-20 w-500 d-block' on:click={() => downloadForOS('Mac OS')}>
        <MacOSSVG />
        <div class='font-size-18 font-weight-semi-bold mt-5'>Mac OS</div>
        <div class='text-muted'>Universal dmg</div>
      </button>
      <div class='d-flex w-500 mw-full gap-2'>
        <button class='card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' on:click={() => downloadForOS('Linux', '.AppImage')}>
          <LinuxSVG />
          <div class='font-size-18 font-weight-semi-bold mt-5'>Linux</div>
          <div class='text-muted'>AppImage</div>
        </button>
        <button class='card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' on:click={() => downloadForOS('Linux', '.deb')}>
          <LinuxSVG />
          <div class='font-size-18 font-weight-semi-bold mt-5'>Linux</div>
          <div class='text-muted'>deb</div>
        </button>
      </div>
      <div class='d-flex w-500 mw-full gap-2'>
        <button class='card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' on:click={() => downloadForOS('Android')}>
          <AndroidSVG />
          <div class='font-size-18 font-weight-semi-bold mt-5'>Android</div>
          <div class='text-muted'>apk</div>
        </button>
        <button class='card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' on:click={() => downloadForOS('Android')}>
          <AndroidTVSVG />
          <div class='font-size-18 font-weight-semi-bold mt-5'>Android TV</div>
          <div class='text-muted'>apk</div>
        </button>
      </div>
      <button class='card pointer col-2 m-0 mb-20 mw-full pb-20 w-500 d-block' on:click={() => downloadForOS('Linux', '.AppImage')}>
        <SteamOSSVG />
        <div class='font-size-18 font-weight-semi-bold mt-5'>Steam OS</div>
        <div class='text-muted'>AppImage</div>
      </button>
    </div>
    <div class='col-12 col-lg-6 d-flex flex-column align-items-center d-lg-block pl-lg-20 pt-20'>
      <hr class='w-full my-20 d-lg-none' />
      <h3 class='font-weight-bold text-white text-center text-lg-left pb-15'>Additional resources</h3>
      <div class='d-flex flex-column'>
        <div class='pb-5 font-size-18 font-weight-bold'>
          Current version:
          {#await data.releases then releases}
            {releases[0].version}
          {/await}
        </div>
        <a href='/changelog' class='hyperlink-underline pb-20 font-size-16 font-weight-bold'>
          View changelog
        </a>
        <div class='pb-5 font-size-18 font-weight-bold'>
          Older versions of Miru
        </div>
        <a href='https://github.com/ThaUnknown/miru/releases' class='hyperlink-underline pb-20 font-size-16 font-weight-bold'>
          View older versions of Miru on GitHub
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .title {
    font-size: 5rem
  }
  .gap-2 {
    gap: 2rem;
  }
  .card {
    transition: transform .3s ease
  }
  .card:hover {
    transform: translateY(-5px);
  }
  a {
    --dm-link-text-color: #1890ff !important;
    --dm-link-text-color-hover: #45a3fb !important;
  }
</style>
