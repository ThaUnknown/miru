<script lang='ts'>
  import { Icon, type Attrs } from 'lucide-svelte'

  import type { SvelteHTMLElements } from 'svelte/elements'
  const iconNode: Array<[elementName: keyof SvelteHTMLElements, attrs: Attrs]> = [['path', { d: 'M8 4.5v5H3m-1-6 6 6m13 0v-3c0-1.16-.84-2-2-2h-7m-9 9v2c0 1.05.95 2 2 2h3' }], ['rect', { width: '10', height: '7', x: '12', y: '13', rx: '2', fill: 'currentColor' }]]
</script>

<Icon name='picture-in-picture' {...$$props} {iconNode}>
  <slot />
</Icon>
