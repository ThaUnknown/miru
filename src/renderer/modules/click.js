let lastTapElement = null

const noop = _ => {}

document.addEventListener('pointerup', () => {
  lastTapElement?.dispatchEvent(new Event('custom-pointerleave'))
  lastTapElement = null
})

export function click (node, cb = noop) {
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('pointerup', e => {
    e.stopPropagation()
    cb(e)
  })
  node.addEventListener('keydown', e => { if (e.key === 'Enter') cb(e) })
}

export function hoverClick (node, cb = noop) {
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse') return cb(e)
    e.stopPropagation()
    lastTapElement?.dispatchEvent(new Event('custom-pointerleave'))
    if (lastTapElement === node) {
      lastTapElement = null
      cb(e)
    } else {
      lastTapElement = node
    }
  })
  node.addEventListener('keydown', e => { if (e.key === 'Enter') cb(e) })
  node.addEventListener('pointerleave', ({ pointerType }) => {
    if (pointerType === 'mouse') node.dispatchEvent(new Event('custom-pointerleave'))
  })
}
