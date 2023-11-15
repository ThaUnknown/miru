let lastTapElement = null
let lastHoverElement = null

const noop = _ => {}

document.addEventListener('pointerup', () => {
  setTimeout(() => {
    lastTapElement?.(false)
    lastTapElement = null
    lastHoverElement?.(false)
    lastHoverElement = null
  })
})

export function click (node, cb = noop) {
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('click', e => {
    e.stopPropagation()
    cb(e)
  })
  node.addEventListener('pointerup', e => {
    e.stopPropagation()
  })
  node.addEventListener('pointerleave', e => {
    e.stopPropagation()
  })
  node.addEventListener('keydown', e => { if (e.key === 'Enter') cb(e) })
}

export function hoverClick (node, [cb = noop, hoverUpdate = noop]) {
  let pointerType = 'mouse'
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('pointerenter', e => {
    lastHoverElement?.(false)
    hoverUpdate(true)
    lastHoverElement = hoverUpdate
    pointerType = e.pointerType
  })
  node.addEventListener('click', e => {
    e.stopPropagation()
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
    if (e.pointerType === 'mouse') setTimeout(() => hoverUpdate(false))
  })
  node.addEventListener('pointerleave', e => {
    setTimeout(() => { lastTapElement = hoverUpdate })
    if (e.pointerType === 'mouse') hoverUpdate(false)
  })
}

const Directions = { up: 1, right: 2, down: 3, left: 4 }

function getDirection (anchor, relative) {
  return Math.round((Math.atan2(relative.y - anchor.y, relative.x - anchor.x) * 180 / Math.PI + 180) / 90)
}

function getDistance (anchor, relative) {
  return Math.hypot(relative.x - anchor.x, relative.y - anchor.y)
}

/**
 * Gets keyboard-focusable elements within a specified element
 * @param {Element} [element=document.body] element
 * @returns {Element[]}
 */
function getKeyboardFocusableElements (element = document.body) {
  return [...element.querySelectorAll('a[href], button:not([disabled]), fieldset:not([disabled]), input:not([disabled]), optgroup:not([disabled]), option:not([disabled]), select:not([disabled]), textarea:not([disabled]), details, [tabindex]:not([tabindex="-1"]), [contenteditable], [controls]')].filter(
    el => !el.getAttribute('aria-hidden')
  )
}

/**
 * @param {Element} element
 */
function getElementPosition (element) {
  const { x, y, width, height } = element.getBoundingClientRect()
  if (width || height) {
    return { element, x: x + width * 0.5, y: y + height * 0.5 }
  }
}

function getFocusableElementPositions () {
  const elements = []
  for (const element of getKeyboardFocusableElements()) {
    const position = getElementPosition(element)
    if (position) elements.push(position)
  }
  return elements
}

function navigateDPad (direction = 'up') {
  const keyboardFocusable = getFocusableElementPositions()
  const currentElement = !document.activeElement || document.activeElement === document.body ? keyboardFocusable[0] : getElementPosition(document.activeElement)

  const elementsInDesiredDirection = keyboardFocusable.filter(position => {
    return position.element !== currentElement.element && getDirection(currentElement, position) === Directions[direction]
  })

  const closestElement = elementsInDesiredDirection.reduce((reducer, position) => {
    const distance = getDistance(currentElement, position)
    if (distance < reducer.distance) return { distance, element: position.element }
    return reducer
  }, { distance: Infinity, element: null })

  closestElement.element.focus()
}
