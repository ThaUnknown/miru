<script lang='ts'>
  import { Icon, type Attrs } from 'lucide-svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'

  const iconNode: Array<[elementName: keyof SvelteHTMLElements, attrs: Attrs]> = [
    ['path', { 'fill-rule': 'evenodd', 'clip-rule': 'evenodd', d: 'M22.99 11.7773C22.9219 10.8388 22.4205 9.92777 21.4859 9.39398L7.48782 1.39936C5.48785 0.25713 3 1.70127 3 4.00443V19.9937C3 22.2968 5.48785 23.741 7.48781 22.5988L21.4859 14.6041C22.4205 14.0703 22.9219 13.1593 22.99 12.2208C23.0226 12.0751 23.0226 11.9231 22.99 11.7773Z' }]
  ]
</script>

<Icon name='play' {...$$props} {iconNode} viewBox='0 0 24 24' strokeWidth='0'>
  <slot />
</Icon>
