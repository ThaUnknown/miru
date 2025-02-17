<script lang='ts'>
  import { createRootContext, createChildLevel } from './context.ts'
  import Menu from './menu.svelte'
  export const { state } = createRootContext()

  createChildLevel()

  function close (fn: () => void) {
    fn()
    return () => state.set([])
  }
</script>

<Menu style='margin-left: -{$state.length * 528}px' class='transition-[margin-left]'>
  <slot {close} />
</Menu>
