import { set } from '@/views/Settings.svelte'

export default function (t, { speed = 120, smooth = 10 } = {}) {
  if (!set.smoothScroll) return
  let moving = false
  let pos = 0
  let scrollTop = 0
  t.addEventListener('wheel', e => {
    e.preventDefault()

    pos = Math.max(0, Math.min(pos - Math.max(-1, Math.min(1, (e.delta || e.wheelDelta) ?? -e.detail)) * speed, (t.scrollHeight - t.clientHeight) + (smooth * 2)))
    if (!moving) update()
  }, { capture: true, passive: false })

  // TODO: this needs to be the scrollend event once we update electron
  t.addEventListener('pointerup', () => { pos = scrollTop = t.scrollTop })

  function update () {
    const delta = pos - scrollTop === smooth * 2 ? 0 : ((pos - scrollTop) / smooth)
    scrollTop += delta

    t.scrollTo(0, scrollTop)
    moving = Math.abs(delta) > 0.5 && requestAnimationFrame(update)
  }
}
