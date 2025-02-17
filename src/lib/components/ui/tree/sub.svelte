<script lang='ts'>
  import { createChildLevel } from './context.ts'
  import Menu from './menu.svelte'

  createChildLevel()
</script>

<Menu class='absolute right-[calc(-100%-1.25rem)] top-[calc(-1px-0.25rem)]'>
  <slot />
</Menu>
