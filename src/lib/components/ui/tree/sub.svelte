<script lang='ts'>
  import { createChildLevel } from './context.ts'
  import Menu from './menu.svelte'

  import type { HTMLAttributes } from 'svelte/elements'

  import { cn } from '$lib/utils'

  createChildLevel()

  type $$Props = HTMLAttributes<HTMLDivElement>

  let className: $$Props['class'] = ''
  export { className as class }
</script>

<Menu class={cn('absolute left-[calc(100%+0.5rem)] top-[calc(-1px-0.25rem)]', className)}>
  <slot />
</Menu>
