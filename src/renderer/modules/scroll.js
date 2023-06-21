export default function scroll (t, { speed = 120, smooth = 15 } = {}) {
  let moving = false
  let pos = t.scrollTop
  t.addEventListener('wheel', e => {
    e.preventDefault()

    pos = Math.max(0, Math.min(pos - Math.max(-1, Math.min(1, (e.delta || e.wheelDelta) ?? -e.detail)) * speed, (t.scrollHeight - t.clientHeight) + (smooth * 2)))
    if (!moving) update()
  }, false)

  function update () {
    const delta = pos - t.scrollTop === smooth * 2 ? 0 : ((pos - t.scrollTop) / smooth)

    t.scrollTop += delta
    moving = Math.abs(delta) > 0.5 && requestAnimationFrame(update)
  }
}
