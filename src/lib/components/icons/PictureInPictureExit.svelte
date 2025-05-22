<script lang='ts'>
  import Icon from 'lucide-svelte/dist/Icon.svelte'

  import type { SvelteHTMLElements, SVGAttributes } from 'svelte/elements'

  type Attrs = SVGAttributes<SVGSVGElement>
  const iconNode: Array<[elementName: keyof SvelteHTMLElements, attrs: Attrs]> = [['path', { d: 'M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4' }], ['rect', { width: '10', height: '7', x: '12', y: '13', rx: '2', fill: 'currentColor' }]]
</script>

<Icon name='picture-in-picture-exit' {...$$props} {iconNode}>
  <slot />
</Icon>
