<script context='module' lang='ts'>
  import { writable } from 'simple-store-svelte'
  import { get } from 'svelte/store'
  import { persisted } from 'svelte-persisted-store'

  import { keys, layout, type KeyCode } from './maps.ts'

  type Bind <T extends Record<string, unknown> = Record<string, unknown>> = T & {
    fn: () => void
    id: string
    code?: KeyCode
  }

  export const binds = persisted<Partial<Record<KeyCode, Bind>>>('thaunknown/svelte-keybinds', {})

  const noop = async (_: KeyCode) => true

  let cnd = noop

  export const condition = writable(noop)
  condition.subscribe((fn) => {
    if (typeof fn === 'function') cnd = fn
  })

  document.addEventListener('keydown', e => runBind(e, e.code as KeyCode))

  async function runBind (e: MouseEvent | KeyboardEvent, code: KeyCode) {
    if ('repeat' in e && e.repeat) return
    const kbn = get(binds)
    if (await cnd(code)) kbn[layout[code] ?? code]?.fn()
  }

  export function loadWithDefaults (defaults: Partial<Record<string, Bind>>) {
    const def = toIDmap(defaults)
    const saved = toIDmap(get(binds))
    for (const id in saved) {
      if (def[id]) {
        saved[id] = { ...saved[id], ...def[id], code: saved[id]!.code }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete saved[id]
      }
    }
    binds.set(toKeyMap({ ...def, ...saved }))
  }

  function toIDmap (target: Partial<Record<KeyCode, Bind>> = {}) {
    const obj: Partial<Record<string, Bind>> = {}
    for (const c in target) {
      const code = c as KeyCode
      const bind = target[code]
      if (!bind) continue
      obj[bind.id] = { ...bind, code }
    }
    return obj
  }

  function toKeyMap (target: Partial<Record<string, Bind>> = {}) {
    const obj: Partial<Record<KeyCode, Bind>> = {}
    for (const id in target) {
      const bind = target[id]
      if (!bind) continue
      obj[bind.code!] = { ...bind, id }
    }
    return obj
  }
</script>

<script lang='ts'>
  export let clickable = false

  let dragged: HTMLDivElement | null = null
  function draggable (node: HTMLDivElement, code: KeyCode) {
    let drag = false
    node.addEventListener('dragstart', ({ target: _target }) => {
      const target = _target as HTMLDivElement
      dragged = target
      target.classList.add('transparent')
      drag = true
    })
    node.addEventListener('dragend', ({ target: _target }) => {
      const target = _target as HTMLDivElement
      target.classList.remove('transparent')
      drag = false
    })
    node.addEventListener('dragover', (e) => {
      const target = e.target as HTMLDivElement
      e.dataTransfer!.dropEffect = 'move'
      e.preventDefault()
      if (!drag) target.classList.add('transparent')
    })
    node.addEventListener('dragleave', ({ target: _target }) => {
      const target = _target as HTMLDivElement
      if (!drag) target.classList.remove('transparent')
    })
    node.addEventListener('drop', ({ target: _target }) => {
      const target = _target as HTMLDivElement
      target.style.opacity = ''
      const targetcode = dragged!.dataset.code as KeyCode
      if ($binds[code]) {
        const temp = $binds[targetcode]
        $binds[targetcode] = $binds[code]
        $binds[code] = temp
      } else {
        $binds[code] = $binds[targetcode]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete $binds[targetcode]
      }
    })
  }
</script>

<div class='svelte-keybinds'>
  {#each Object.values(keys) as key (key.name)}
    {@const { size, dark, name } = key}
    <div
      class:dark
      draggable={!!$binds[name]}
      data-code={name}
      class='w-{size ?? 50}'
      {...$$restProps}
      use:draggable={name}
      on:click={(e) => clickable && runBind(e, name)}>
      <slot prop={$binds[name]} />
    </div>
  {/each}
</div>

<style>
  .svelte-keybinds {
    flex-shrink: 0;
    user-select: none;
    display: flex;
    flex-wrap: wrap;
    width: 82em;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 0.4em;
    padding: 1em;
    color: #eee;
  }

  .svelte-keybinds .dark {
    background: #191c20 !important;
  }

  .svelte-keybinds .transparent {
    opacity: 0.2 !important;
  }

  .svelte-keybinds > div {
    height: 4em;
    margin: 0.5em;
    background: #25282c;
    border-radius: 0.4em;
    cursor: pointer;
    transition-property: opacity, transform;
    transition-duration: 0.2s;
    transition-timing-function: ease;
  }
  .svelte-keybinds > div > :global(*) {
    pointer-events: none !important;
  }
  .svelte-keybinds > div:hover {
    transform: scale(0.9);
  }
  .svelte-keybinds .w-50 {
    width: 4em !important;
  }
  .svelte-keybinds .w-75 {
    width: 6.5em !important;
  }
  .svelte-keybinds .w-85 {
    width: 7.5em !important;
  }
  .svelte-keybinds .w-90 {
    width: 8em !important;
  }
  .svelte-keybinds .w-100 {
    width: 9em !important;
  }
  .svelte-keybinds .w-110 {
    width: 10em !important;
  }
  .svelte-keybinds .w-115 {
    width: 10.5em !important;
  }
  .svelte-keybinds .w-300 {
    width: 29em !important;
  }
</style>
