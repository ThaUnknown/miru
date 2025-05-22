<script lang='ts'>
  import { Dialog as DialogPrimitive } from 'bits-ui'

  // eslint-disable-next-line no-unused-vars
  type $$Props = DialogPrimitive.PortalProps

</script>

<DialogPrimitive.Portal {...$$restProps}>
  <slot />
</DialogPrimitive.Portal>
