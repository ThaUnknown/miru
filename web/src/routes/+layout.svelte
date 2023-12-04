<script>
  import Footer from '$lib/components/Footer.svelte'
  import Loader from '$lib/components/Loader.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import { setContext } from 'svelte'
  import { writable } from 'simple-store-svelte'

  const scrollPosition = writable(0)
  setContext('scroll-position', scrollPosition)
  function smoothScroll (t, { speed = 120, smooth = 10 } = {}) {
    let moving = false
    let pos = 0
    let scrollTop = 0
    let lastTime = null
    t.addEventListener('wheel', e => {
      e.preventDefault()
      // is trackpad
      const spd = (e.deltaY !== (e.deltaY | 0) || e.wheelDelta % 10 !== 0) ? speed / 10 : speed
      pos = Math.max(0, Math.min(pos - Math.max(-1, Math.min(1, e.deltaY * -1)) * spd, (t.scrollHeight - t.clientHeight) + (smooth * 2)))
      if (!moving) {
        lastTime = null
        update()
      }
    }, { capture: true, passive: false })

    function getDeltaTime () {
      const now = performance.now()
      if (!lastTime) {
        lastTime = now
        return 1
      }
      const deltaTime = now - lastTime
      lastTime = now
      return deltaTime / 14
    }

    t.addEventListener('pointerup', () => { pos = scrollTop = t.scrollTop })

    function update () {
      const delta = pos - scrollTop === smooth * 2 ? 0 : ((pos - scrollTop) / smooth) * getDeltaTime()
      scrollTop += delta

      scrollPosition.value = scrollTop < 1.3 ? 0 : scrollTop

      t.scrollTo(0, scrollTop < 1.3 ? 0 : scrollTop)
      moving = Math.abs(delta) > 0.1 && !!requestAnimationFrame(update)
    }
  }
</script>

<Loader />
<div class='page-wrapper with-transitions position-relative' data-sidebar-type='overlayed-all'>
  <Navbar />
  <div class='overflow-x-hidden content-wrapper h-full overflow-y-scroll position-relative' use:smoothScroll>
    <slot />
    <Footer />
  </div>
</div>

<style>
  .h-full {
    min-height: 100vh;
  }
</style>
