<script>
  import Hero from '$lib/components/Hero.svelte'
</script>

<Hero />
<div class='d-flex justify-content-center align-items-center'>
  <div class='position-relative'>
    <img src='app.png' alt='app' class='mw-full px-20' />
    <div class='overlay-gradient position-absolute top-0 left-0 w-full h-full' />
  </div>
</div>

<style>
  .overlay-gradient {
    background: linear-gradient(0deg, #0F1113 15.27%, rgba(15, 17, 19, 0.92) 41.28%, rgba(15, 17, 19, 0.25) 74.32%);
  }
</style>
