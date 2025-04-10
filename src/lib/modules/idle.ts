import { readable } from 'svelte/store'
import { writable } from 'simple-store-svelte'

export const activityState = readable<'active' | 'inactive'>(document.hasFocus() ? 'active' : 'inactive', set => {
  set(document.hasFocus() ? 'active' : 'inactive')
  const ctrl = new AbortController()

  window.addEventListener('pointermove', () => set('active'), { signal: ctrl.signal })
  window.addEventListener('focus', () => set('active'), { signal: ctrl.signal })
  window.addEventListener('blur', () => set('inactive'), { signal: ctrl.signal })

  document.addEventListener('mouseenter', () => set('active'), { signal: ctrl.signal })
  document.addEventListener('mouseleave', () => {
    if (!document.hasFocus()) set('inactive')
  }, { signal: ctrl.signal })

  return () => ctrl.abort()
})

// @ts-expect-error non-standard API
const idleDetector = new IdleDetector()
idleDetector.start({ threshold: 60_000 })

export const idleState = readable<'active' | 'idle'>(idleDetector.userState, set => {
  set(idleDetector.userState)
  const ctrl = new AbortController()

  idleDetector.addEventListener('change', () => set(idleDetector.userState), { signal: ctrl.signal })
  window.addEventListener('pointermove', () => set('active'), { signal: ctrl.signal })

  return () => ctrl.abort()
})

export const lockedState = readable<'locked' | 'unlocked'>(idleDetector.screenState, set => {
  set(idleDetector.screenState)
  const ctrl = new AbortController()

  idleDetector.addEventListener('change', () => set(idleDetector.screenState), { signal: ctrl.signal })

  return () => ctrl.abort()
})

export const isPlaying = writable(false)
