import { getContext, setContext } from 'svelte'
import { writable, get, type Writable } from 'svelte/store'

const MENU_CONTEXT = 'MENU_CONTEXT'
const LEVEL_CONTEXT = 'LEVEL_CONTEXT'

export function createRootContext () {
  const state: Writable<string[]> = writable([])

  setContext(LEVEL_CONTEXT, writable(-1))
  return setContext(MENU_CONTEXT, {
    state,
    setActive: (id: string, level: number) => state.update(s => s.slice(0, level).concat(id)),
    setInactive: (level: number) => state.update(s => s.slice(0, level))
  })
}

export function getMenuContext () {
  return getContext<ReturnType<typeof createRootContext>>(MENU_CONTEXT)
}

export function getLevelContext () {
  return getContext<Writable<number>>(LEVEL_CONTEXT)
}

export function createChildLevel () {
  return setContext(LEVEL_CONTEXT, writable(get(getLevelContext()) + 1))
}
