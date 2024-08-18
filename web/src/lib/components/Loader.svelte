<script>
  import { onMount } from 'svelte'

  let animate = false

  onMount(() => {
    animate = true
  })
</script>

<div class='h-full con font-weight-bold overflow-hidden position-absolute' class:animate>
  <div class='h-full text d-flex align-items-center justify-content-center text-nowrap text-capitalize' data-nosnippet>
    Loading...
  </div>
</div>

<style>
  @keyframes transition {
    0% {
      background-position: top left;
      width: 100vw ;
    }
    65% {
      background-position: top left;
      width: 100vw;
    }
    95% {
      background-position: top right
    }
    100% {
      background-position: top right;
      width: 0;
    }
  }
  .con {
    z-index: 90;
    background-position: top left;
    width: 100vw;
  }
  .animate {
    animation: 2s transition ease forwards;
  }
  .text {
    font-size: clamp(0px, 10rem, 15vw);
    color: transparent;
    font-family: Verdana, sans-serif;
    width: 100vw;
    background: linear-gradient(90deg, #fff 50%, #101113 0), linear-gradient(90deg, #101113 50%, #fff 0);
    background-repeat: no-repeat;
    background-size: 200% 100%;
    background-position: inherit;
    -webkit-background-clip: text, padding-box;
    background-clip: text, padding-box;
  }
</style>
