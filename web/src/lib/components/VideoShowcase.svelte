<script>
  import { getContext } from 'svelte'

  const show = getContext('video-modal')

  /** @type {HTMLDivElement} */
  let container
  let top = 0
  let left = 0
  /** @param {MouseEvent} param0 */
  function followMouse ({ clientX, clientY }) {
    if (!clientX || !clientY) return
    const containerRect = container.getBoundingClientRect()
    left = clientX - containerRect.left
    top = clientY - containerRect.top
  }
</script>

<div class='position-relative play-container' on:mousemove={followMouse} on:wheel={followMouse} bind:this={container} role='none' on:click={() => { show.value = true }}>
  <button class='btn rounded-circle btn-square btn-lg d-flex align-items-center justify-content-center position-absolute z-100 w-50 h-50' style:--left={left + 'px'} style:--top={top + 'px'}>
    <span class='material-symbols-outlined filled text-white'>play_arrow</span>
  </button>
  <img src='app.webp' alt='app' class='mw-full px-20 w-full app-image' />
  <div class='overlay-gradient position-absolute px-20 top-0 left-0 w-full h-full' />
</div>

<style>
  .overlay-gradient {
    background: linear-gradient(0deg, #101113 15.27%, rgba(16, 17, 19, 0.92) 41.28%, rgba(16, 17, 19, 0.25) 74.32%);
    pointer-events: none;
  }
  .play-container:hover > .btn {
    transition: opacity .2s ease-in-out, width .2s ease-in-out, height .2s ease-in-out, font-size .2s ease-in-out;
    font-size: 30px !important;
    left: clamp(0px, var(--left), 100%);
    top: clamp(0px, var(--top), 100%);
    width: 6rem !important;
    height: 6rem !important;
  }
  .material-symbols-outlined {
    transition: font-size .2s ease-in-out;
  }
  .play-container:hover .material-symbols-outlined {
    font-size: 30px !important;
  }
  .btn {
    transition: all .2s ease-in-out, width .2s ease-in-out, height .2s ease-in-out;
    box-shadow: 0 0 1rem #ffffff83;
    backdrop-filter: blur(8px);
    top: 50%;
    left: 50%;
    background: none;
    offset-position: center;
    transform: translate(-50%, -50%);
  }
</style>
