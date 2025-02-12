<script lang='ts'>
  import { Label } from '$lib/components/ui/label'
  export let title = ''
  export let description = ''

  const id = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER).toString() + title
</script>

<div class='flex flex-col md:flex-row md:items-center justify-between bg-neutral-950 rounded-md px-6 py-4 space-y-3 md:space-y-0 md:space-x-3'>
  <Label for={id} class='space-1 block leading-[unset] grow'>
    <div class='font-bold'>{title}</div>
    <div class='text-muted-foreground text-xs whitespace-pre-wrap block'>{description}</div>
  </Label>
  <slot {id} />
</div>
