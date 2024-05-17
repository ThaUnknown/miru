<script>
  import WindowsSVG from '$lib/svg/WindowsSVG.svelte'
  import MacOSSVG from '$lib/svg/MacOSSVG.svelte'
  import LinuxSVG from '$lib/svg/LinuxSVG.svelte'
  import AndroidSVG from '$lib/svg/AndroidSVG.svelte'
  import AndroidTVSVG from '$lib/svg/AndroidTVSVG.svelte'
  import SteamOSSVG from '$lib/svg/SteamOSSVG.svelte'

  export let data

  function getOS () {
    // @ts-ignore
    const platform = navigator.userAgentData?.platform || navigator.platform
    const macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iosPlatforms = ['iPhone', 'iPad', 'iPod']

    if (macosPlatforms.includes(platform)) return 'Mac OS'
    if (iosPlatforms.includes(platform)) return 'iOS'
    if (windowsPlatforms.includes(platform)) return 'Windows'
    if (/Android/.test(navigator.userAgent)) return 'Android'
    if (/Linux/.test(platform)) return 'Linux'
    return 'Windows'
  }

  let downloads = {
    iOS: '',
    Android: '',
    Windows: '',
    'Mac OS': '',
    Linux: '',
    Debian: ''
  }

  const releases = 'https://github.com/ThaUnknown/miru/releases'

  async function downloadForOS () {
    const releases = await data.releases

    const { assets } = releases[0]

    /** @param {string} ext */
    const url = ext => assets.find(({ name }) => name.endsWith(ext))?.browser_download_url || ''

    downloads = {
      iOS: 'https://www.android.com',
      Android: 'https://play.google.com/store/apps/details?id=watch.miru',
      Windows: url('installer.exe'),
      'Mac OS': url('.dmg'),
      Linux: url('.AppImage'),
      Debian: url('.deb')
    }
    return downloads
  }

  const userOS = getOS()

  downloadForOS()

  setTimeout(async () => {
    const downloads = await downloadForOS()
    if (!downloads || !downloads[userOS]) return
    location.href = downloads[userOS]
  }, 2000)
</script>

<div class='container'>
  <div class='content'>
    {#key downloads}
      <div class='h-vh-half d-flex justify-content-center align-items-center flex-column px-20 px-sm-0 pt-20'>
        <h1 class='font-weight-bold text-white title mt-20 pt-20 text-center'>Almost there!</h1>
        <div class='font-size-18 text-muted text-center'>
          Now run the installer that just downloaded.<br /><br />
          Your download should begin automatically. Didn’t work?
        </div>
        <a class='btn btn-lg btn-link mb-20' href={downloads[userOS] || releases}>
          Try downloading again.
        </a>
      </div>
      <hr class='my-20' />
      <div class='px-20 px-sm-0 row'>
        <div class='col-12 col-lg-6 d-flex flex-column align-items-center d-lg-block pr-lg-20 pt-20'>
          <h3 class='font-weight-bold text-white text-center text-lg-left pb-15'>Get Miru for other devices</h3>
          <a class='text-reset card pointer col-2 m-0 mb-20 mw-full pb-20 w-500 d-block' href={downloads.Windows || releases}>
            <WindowsSVG />
            <div class='font-size-18 font-weight-semi-bold mt-5'>Windows</div>
            <div class='text-muted'>exe</div>
          </a>
          <a class='text-reset card pointer col-2 m-0 mb-20 mw-full pb-20 w-500 d-block' href={downloads['Mac OS'] || releases}>
            <MacOSSVG />
            <div class='font-size-18 font-weight-semi-bold mt-5'>Mac OS</div>
            <div class='text-muted'>Universal dmg</div>
          </a>
          <div class='d-flex w-500 mw-full gap-2'>
            <a class='text-reset card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' href={downloads.Linux || releases}>
              <LinuxSVG />
              <div class='font-size-18 font-weight-semi-bold mt-5'>Linux</div>
              <div class='text-muted'>AppImage</div>
            </a>
            <a class='text-reset card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' href={downloads.Debian || releases}>
              <LinuxSVG />
              <div class='font-size-18 font-weight-semi-bold mt-5'>Linux</div>
              <div class='text-muted'>deb</div>
            </a>
          </div>
          <div class='d-flex w-500 mw-full gap-2'>
            <a class='text-reset card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' href={downloads.Android || releases}>
              <AndroidSVG />
              <div class='font-size-18 font-weight-semi-bold mt-5'>Android</div>
              <div class='text-muted'>apk</div>
            </a>
            <a class='text-reset card pointer col-2 m-0 mb-20 mw-full pb-20 w-250 flex-grow-1' href={downloads.Android || releases}>
              <AndroidTVSVG />
              <div class='font-size-18 font-weight-semi-bold mt-5'>Android TV</div>
              <div class='text-muted'>apk</div>
            </a>
          </div>
          <a class='text-reset card pointer col-2 m-0 mb-20 mw-full pb-20 w-500 d-block' href={downloads.Linux || releases}>
            <SteamOSSVG />
            <div class='font-size-18 font-weight-semi-bold mt-5'>Steam OS</div>
            <div class='text-muted'>AppImage</div>
          </a>
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
            <a href={releases} class='hyperlink-underline pb-20 font-size-16 font-weight-bold'>
              View older versions of Miru on GitHub
            </a>
          </div>
        </div>
      </div>
    {/key}
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
