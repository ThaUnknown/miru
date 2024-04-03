<script>
  /** @type {HTMLDivElement} */
  let hero
  function about () {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      hero.parentNode?.dispatchEvent(new PointerEvent('pointerup'))
    }, 500)
  }
</script>

<div class='d-flex position-relative justify-content-center align-items-center hero flex-column' bind:this={hero}>
  <div class='position-absolute ghost text-nowrap font-weight-semi-bold' data-nosnippet>
    MIRU MIRU MIRU MIRU MIRU MIRU MIRU MIRU MIRU MIRU MIRU MIRU MIRU
  </div>
  <div class='h-50' />
  <div class='position-relative text-center text-white font-weight-bold hero-text'>
    Stream torrents real-time,<br />without waiting for downloads
  </div>
  <div class='position-relative pt-20 h-50'>
    <a href='/download' class='btn btn-danger btn-lg mr-20'>
      Download
    </a>
    <button class='btn bg-dark-light btn-lg ml-20' on:click={about}>Learn More</button>
  </div>
</div>

<style>
  .hero {
    height: 60vh;
  }
  .hero-text {
    font-size: 5rem
  }
  .btn-danger {
    --dm-button-danger-bg-color: #e5204c
  }
  .ghost {
    font-size: 34rem;
    color: #101113;
    font-family: 'Roboto';
    text-shadow:
    0.4px 0.4px 0 #3a3a3a,
    -0.4px 0.4px 0 #3a3a3a,
    -0.4px -0.4px 0 #3a3a3a,
    0.4px -0.4px 0 #3a3a3a;
  }
</style>
