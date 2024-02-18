<script>
  import DiscordSVG from '$lib/svg/DiscordSVG.svelte'
  import GithubSVG from '$lib/svg/GithubSVG.svelte'
</script>

<div class='container pb-20 font-weight-light font-size-16 text-muted position-sticky' style='top: 100%'>
  <hr class='w-full my-20' />
  <div class='row px-20 px-sm-0 mb-20 content'>
    <div class='col-12 col-md-4 pt-20 mb-20 text-md-left'>
      <a href='/'>
        <img src='/logo_filled.svg' alt='logo' class='w-50 h-50 p-5' />
      </a>
      <br />
      © 2020 - {new Date().getFullYear()}, ThaUnknown
      <br />
      All rights reserved
    </div>
    <div class='col-6 col-sm-4 col-md-3 pt-20 d-flex justify-content-md-end'>
      <div class='d-flex flex-column'>
        <div class='font-weight-semi-bold mb-10 text-white'>Product</div>
        <a href='https://github.com/sponsors/ThaUnknown/' target='_blank'>Donate</a>
        <a href='/features'>Features</a>
        <a href='/download'>Download</a>
        <a href='/changelog'>Changelog</a>
      </div>
    </div>
    <div class='col-6 col-sm-4 col-md-3 pt-20 d-flex justify-content-md-end'>
      <div class='d-flex flex-column'>
        <div class='font-weight-semi-bold mb-10 text-white'>Resources</div>
        <a href='/faq'>FAQ</a>
        <a href='/contact'>Contact</a>
        <a href='/terms'>Terms of use</a>
        <a href='/privacy'>Privacy policy</a>
      </div>
    </div>
    <div class='col-12 col-sm-4 col-md-2 pt-20 d-flex justify-content-md-end'>
      <div>
        <div class='font-weight-semi-bold mb-10 text-white'>Social</div>
        <a href={atob('aHR0cHM6Ly9kaXNjb3JkLmdnL1o4N05oN2M0QWM=')} target='_blank'><DiscordSVG class='icon mr-10' /></a>
        <a href='https://github.com/ThaUnknown/miru' target='_blank'><GithubSVG class='icon' /></a>
      </div>
    </div>
  </div>
  <div class='p-20 font-italic'>
    This site or it's servers do not store, hosts or distribute any copyrighted files or media.
  </div>
</div>
<style>
  a:hover {
    color: #FFFFFFCC !important
  }
  :global(.icon) {
    width: 2.2rem;
    height: 2.2rem;
  }
</style>
