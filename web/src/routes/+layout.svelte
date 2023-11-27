<script>
  import Footer from '$lib/components/Footer.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
</script>

<div class='page-wrapper with-transitions position-relative' data-sidebar-type='overlayed-all'>
  <Navbar />
  <div class='overflow-x-hidden content-wrapper h-full overflow-y-scroll position-relative'>
    <slot />
    <Footer />
  </div>
</div>

<style>
  .h-full {
    min-height: 100vh;
  }
</style>
