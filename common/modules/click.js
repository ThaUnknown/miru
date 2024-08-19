import { SUPPORTS } from '@/modules/support.js'

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

/** @typedef {{element: Element, x: number, y: number, inViewport: boolean}} ElementPosition  */

/**
 * Adds click event listener to the specified node.
 * @param {HTMLElement} node - The node to attach the click event listener to.
 * @param {Function} [cb=noop] - The callback function to be executed on click.
 */
export function click (node, cb = noop) {
  node.tabIndex = 0
  node.role = 'button'
  node.addEventListener('click', e => {
    e.stopPropagation()
    navigator.vibrate(15)
    cb(e)
  })
  node.addEventListener('pointerup', e => {
    e.stopPropagation()
  })
  node.addEventListener('pointerleave', e => {
    e.stopPropagation()
  })
  if (!SUPPORTS.isAndroid) {
    node.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.stopPropagation()
        cb(e)
      }
    })
  }
}

// TODO: this needs to be re-written.... again... it should detect pointer type and have separate functionality for mouse and touch and none for dpad
/**
 * Adds hover and click event listeners to the specified node.
 * @param {HTMLElement} node - The node to attach the event listeners to.
 */
export function hoverClick (node, [cb = noop, hoverUpdate = noop]) {
  let pointerType = 'touch'
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
      navigator.vibrate(15)
      hoverUpdate(false)
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
        if (!SUPPORTS.isAndroid) lastTapElement = hoverUpdate
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
  node.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') hoverUpdate(false)
  })
}

const Directions = { up: 1, right: 2, down: 3, left: 4 }
// const InverseDirections = { up: 'down', down: 'up', left: 'right', right: 'left' }
const DirectionKeyMap = { ArrowDown: 'down', ArrowUp: 'up', ArrowLeft: 'left', ArrowRight: 'right' }

/**
 * Calculates the direction between two points.
 * @param {Object} anchor - The anchor point.
 * @param {Object} relative - The relative point.
 * @returns {number} - The direction between the two points.
 */
function getDirection (anchor, relative) {
  return Math.round((Math.atan2(relative.y - anchor.y, relative.x - anchor.x) * 180 / Math.PI + 180) / 90) || 4
}

/**
 * Calculates the distance between two points.
 * @param {Object} anchor - The anchor point.
 * @param {Object} relative - The relative point.
 * @returns {number} - The distance between the two points.
 */
function getDistance (anchor, relative) {
  return Math.hypot(relative.x - anchor.x, relative.y - anchor.y)
}

/**
 * Gets keyboard-focusable elements within a specified element.
 * @param {Element} [element=document.body] - The element to search within.
 * @returns {Element[]} - An array of keyboard-focusable elements.
 */
function getKeyboardFocusableElements (element = document.body) {
  return [...element.querySelectorAll('a[href], button:not([disabled]), fieldset:not([disabled]), input:not([disabled]), optgroup:not([disabled]), option:not([disabled]), select:not([disabled]), textarea:not([disabled]), details, [tabindex]:not([tabindex="-1"], [disabled]), [contenteditable], [controls]')].filter(
    el => !el.getAttribute('aria-hidden')
  )
}

/**
 * Gets the position of an element.
 * @param {Element} element - The element to get the position of.
 * @returns {ElementPosition} - The position of the element.
 */
function getElementPosition (element) {
  const { x, y, width, height, top, left, bottom, right } = element.getBoundingClientRect()
  const inViewport = isInViewport({ top, left, bottom, right, width, height })
  return { element, x: x + width * 0.5, y: y + height * 0.5, inViewport }
}

/**
 * Gets the positions of all focusable elements.
 * @returns {ElementPosition[]} - An array of element positions.
 */
function getFocusableElementPositions () {
  const elements = []
  for (const element of getKeyboardFocusableElements(document.querySelector('.modal.show') ?? document.body)) {
    const position = getElementPosition(element)
    if (position) elements.push(position)
  }
  return elements
}

/**
 * Checks if an element is within the viewport.
 * @param {Object} rect - The coordinates of the element.
 * @returns {boolean} - True if the element is within the viewport, false otherwise.
 */
function isInViewport ({ top, left, bottom, right, width, height }) {
  return top + height >= 0 && left + width >= 0 && bottom - height <= window.innerHeight && right - width <= window.innerWidth
}

// function isVisible ({ top, left, bottom, right }, element) {
//   for (const [x, y] of [[left, top], [right, top], [left, bottom], [right, bottom]]) {
//     if (document.elementFromPoint(x, y)?.isSameNode(element)) return true
//   }
//   return false
// }

/**
 * @param {ElementPosition[]} keyboardFocusable
 * @param {ElementPosition} currentElement
 * @param {string} direction
 * @returns {ElementPosition[]}
 */
function getElementsInDesiredDirection (keyboardFocusable, currentElement, direction) {
  // first try finding visible elements in desired direction
  return keyboardFocusable.filter(position => {
    // in order of computation cost
    if (position.element === currentElement.element) return false
    if (getDirection(currentElement, position) !== Directions[direction]) return false

    // filters out elements which are in the viewport, but are overlayed by other elements like a modal
    if (position.inViewport && !position.element.checkVisibility()) return false
    if (!position.inViewport && direction === 'right') return false // HACK: prevent right navigation from going to offscreen elements, but allow vertical elements!
    return true
  })
}

/**
 * Navigates using D-pad keys.
 * @param {string} [direction='up'] - The direction to navigate.
 */
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

    /** @type {{element: HTMLElement}} */
    const { element } = closestElement

    const isInput = element.matches('input[type=text], input[type=url], input[type=number], textarea')
    // make readonly
    let wasReadOnly = false
    if (isInput) {
      wasReadOnly = element.readOnly
      element.readOnly = true
    }
    element.focus()
    if (isInput && !wasReadOnly) setTimeout(() => { element.readOnly = false })
    element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    // return
  }

  // no elements in desired direction, go to opposite end [wrap around] // this wasnt a good idea in the long run
  // const elementsInOppositeDirection = getElementsInDesiredDirection(keyboardFocusable, currentElement, InverseDirections[direction])
  // if (elementsInOppositeDirection.length) {
  //   const furthestElement = elementsInOppositeDirection.reduce((reducer, position) => {
  //     const distance = getDistance(currentElement, position)
  //     if (distance > reducer.distance) return { distance, element: position.element }
  //     return reducer
  //   }, { distance: -Infinity, element: null })

  //   furthestElement.element.focus()
  // }
}

// hacky, but make sure keybinds system loads first so it can prevent this from running
queueMicrotask(() => {
  document.addEventListener('keydown', e => {
    if (DirectionKeyMap[e.key]) {
      e.preventDefault()
      navigateDPad(DirectionKeyMap[e.key])
    }
  })
})
