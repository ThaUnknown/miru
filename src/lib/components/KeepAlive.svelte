<script lang='ts' context='module'>
  import type { ComponentType, SvelteComponent } from 'svelte'

  const keep = new Map<string, { component: SvelteComponent, node: HTMLElement}>()

  export function register (id: string, Component: ComponentType) {
    if (keep.has(id)) throw new Error(`KeepAlive: duplicate id ${id}`)
    const wrapper = document.createDocumentFragment() as unknown as HTMLElement

    const instance = new Component({ target: wrapper })

    keep.set(id, { component: instance, node: wrapper.children[0] as HTMLElement })
  }

  export function unregister (id: string) {
    const entry = keep.get(id)
    if (entry) {
      entry.component.$destroy()
      entry.node.remove()
      keep.delete(id)
    }
  }
</script>

<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'

  export let id: string

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  type $$Props = HTMLAttributes<HTMLDivElement> & { id: string }

  function mount (node: HTMLDivElement) {
    const entry = keep.get(id)
    if (entry) node.appendChild(entry.node)
  }

  console.log($$props.$$slots)

</script>

<div use:mount {...$$restProps} />
