<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import * as Tooltip from '$lib/components/ui/tooltip'
</script>

<Tooltip.Root>
  <Tooltip.Trigger let:builder>
    <Button builders={[builder]} class='text-md font-bold !pointer-events-auto cursor-wait' disabled>Install</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    <p>Waiting for update to download</p>
  </Tooltip.Content>
</Tooltip.Root>
