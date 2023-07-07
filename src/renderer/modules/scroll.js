export default function scroll (t, { speed = 120, smooth = 15 } = {}) {
  let moving = false
  let pos = 0
  let scrollTop = 0
  t.addEventListener('wheel', e => {
    e.preventDefault()

    pos = Math.max(0, Math.min(pos - Math.max(-1, Math.min(1, (e.delta || e.wheelDelta) ?? -e.detail)) * speed, (t.scrollHeight - t.clientHeight) + (smooth * 2)))
    if (!moving) update()
  }, { capture: true, passive: false })

  let scrollBar = false

  t.addEventListener('pointerdown', e => {
    if (e.offsetX > t.clientWidth) scrollBar = true
  })

  t.addEventListener('pointerup', () => { scrollBar = false })

  t.addEventListener('scroll', () => {
    if (scrollBar) pos = scrollTop = t.scrollTop
  }, { capture: false, passive: true })

  function update () {
    const delta = pos - scrollTop === smooth * 2 ? 0 : ((pos - scrollTop) / smooth)
    scrollTop += delta

    t.scrollTo(0, scrollTop)
    moving = Math.abs(delta) > 0.5 && requestAnimationFrame(update)
  }
}
