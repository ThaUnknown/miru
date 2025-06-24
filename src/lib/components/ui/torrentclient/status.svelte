<script lang='ts'>
  export let enabled = false
  export let title = ''
  export let description = ''
</script>

<div class='flex items-center gap-2'>
  <div class='w-2 h-2 rounded-full {enabled ? 'bg-green-500' : 'bg-red-500' }' />
  <div class='mx-1'>
    <span class='text-sm'>{title}</span>
    <p class='text-xs text-muted-foreground'>{description}</p>
  </div>
</div>
