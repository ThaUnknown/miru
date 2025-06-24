<script lang='ts'>
  export let ip: string
  export let seeder: boolean
</script>

<div class='flex gap-x-2 font-mono items-center text-xs'>
  <div class='w-2 h-2 rounded-full flex-shrink-0 {seeder ? 'bg-green-500' : 'bg-blue-500'}' />{ip}
</div>
