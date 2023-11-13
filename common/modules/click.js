let lastTapElement = null

const noop = _ => {}

document.addEventListener('pointerup', () => {
  lastTapElement?.(false)
  lastTapElement = null
})

export function click (node, cb = noop) {
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('pointerdown', e => {
    e.stopPropagation()
    cb(e)
  })
  node.addEventListener('keydown', e => { if (e.key === 'Enter') cb(e) })
}

export function hoverClick (node, [cb = noop, hoverUpdate = noop]) {
  let pointerType = 'mouse'
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('pointerenter', e => {
    hoverUpdate(true)
    lastTapElement?.(false)
    pointerType = e.pointerType
  })
  node.addEventListener('pointerdown', e => {
    if (pointerType === 'mouse') return cb(e)
    lastTapElement?.(false)
    if (lastTapElement === hoverUpdate) {
      lastTapElement = null
      cb(e)
    } else {
      lastTapElement = hoverUpdate
    }
  })
  node.addEventListener('keydown', e => { if (e.key === 'Enter') cb(e) })
  node.addEventListener('pointerup', e => {
    e.stopPropagation()
    if (e.pointerType === 'mouse') hoverUpdate(false)
  })
  node.addEventListener('pointerleave', e => {
    if (e.pointerType === 'mouse') hoverUpdate(false)
  })
}
