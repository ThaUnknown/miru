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
  node.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.stopPropagation()
      cb(e)
    }
  })
}

export function hoverClick (node, [cb = noop, hoverUpdate = noop]) {
  let pointerType = 'mouse'
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('pointerenter', e => {
    lastHoverElement?.(false)
    lastTapElement?.(false)
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
  node.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.stopPropagation()
      lastTapElement?.(false)
      if (lastTapElement === hoverUpdate) {
        lastTapElement = null
        cb(e)
      } else {
        hoverUpdate(true)
        lastTapElement = hoverUpdate
      }
    }
  })
  node.addEventListener('pointerup', e => {
    e.stopPropagation()
    if (e.pointerType === 'mouse') setTimeout(() => hoverUpdate(false))
  })
  node.addEventListener('pointerleave', e => {
    lastHoverElement = hoverUpdate
    if (e.pointerType === 'mouse') hoverUpdate(false)
  })
}

const Directions = { up: 1, right: 2, down: 3, left: 4 }
const InverseDirections = { up: 'down', down: 'up', left: 'right', right: 'left' }
const DirectionKeyMap = { ArrowDown: 'down', ArrowUp: 'up', ArrowLeft: 'left', ArrowRight: 'right' }

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
  const { x, y, width, height, top, left, bottom, right } = element.getBoundingClientRect()
  const inViewport = isInViewport({ top, left, bottom, right })
  if (width || height) {
    return { element, x: x + width * 0.5, y: y + height * 0.5, inViewport }
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

function isInViewport ({ top, left, bottom, right }) {
  return (
    top >= 0 &&
    left >= 0 &&
    bottom <= window.innerHeight &&
    right <= window.innerWidth
  )
}

// function isVisible ({ top, left, bottom, right }, element) {
//   for (const [x, y] of [[left, top], [right, top], [left, bottom], [right, bottom]]) {
//     if (document.elementFromPoint(x, y)?.isSameNode(element)) return true
//   }
//   return false
// }

function getElementsInDesiredDirection (keyboardFocusable, currentElement, direction) {
  // first try finding visible elements in desired direction
  return keyboardFocusable.filter(position => {
    // in order of computation cost
    if (position.element === currentElement.element) return false
    if (getDirection(currentElement, position) !== Directions[direction]) return false

    // filters out elements which are in the viewport, but are overlayed by other elements like a modal
    if (position.inViewport && !position.element.checkVisibility()) return false
    return true
  })
}

function navigateDPad (direction = 'up') {
  const keyboardFocusable = getFocusableElementPositions()
  const currentElement = !document.activeElement || document.activeElement === document.body ? keyboardFocusable[0] : getElementPosition(document.activeElement)

  const elementsInDesiredDirection = getElementsInDesiredDirection(keyboardFocusable, currentElement, direction)

  // if there are elements in desired direction
  if (elementsInDesiredDirection.length) {
    const closestElement = elementsInDesiredDirection.reduce((reducer, position) => {
      const distance = getDistance(currentElement, position)
      if (distance < reducer.distance) return { distance, element: position.element }
      return reducer
    }, { distance: Infinity, element: null })

    closestElement.element.focus()
    return
  }

  // no elements in desired direction, go to opposite end [wrap around]
  const elementsInOppositeDirection = getElementsInDesiredDirection(keyboardFocusable, currentElement, InverseDirections[direction])
  if (elementsInOppositeDirection.length) {
    const furthestElement = elementsInOppositeDirection.reduce((reducer, position) => {
      const distance = getDistance(currentElement, position)
      if (distance > reducer.distance) return { distance, element: position.element }
      return reducer
    }, { distance: -Infinity, element: null })

    furthestElement.element.focus()
  }
}

document.addEventListener('keydown', e => {
  e.preventDefault()
  if (DirectionKeyMap[e.key]) navigateDPad(DirectionKeyMap[e.key])
})
