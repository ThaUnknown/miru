<script lang='ts'>
  export let value: number
</script>

<div class='min-w-16 w-full relative -z-[1] overflow-clip rounded-full bg-secondary h-1.5 mt-1.5'>
  <div class='h-full w-full bg-primary transition-transform transform-gpu' style:--tw-translate-x='{(value * 100) - 100}%' />
</div>
<div class='text-xs mt-1 text-muted-foreground'>{(value * 100).toFixed(1)}%</div>
