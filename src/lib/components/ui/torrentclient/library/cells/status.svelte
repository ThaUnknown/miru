<script lang='ts'>
  export let value: boolean
</script>

<div class='flex gap-x-2 items-center'>
  <div class='w-2 h-2 rounded-full flex-shrink-0 {value ? 'bg-green-500' : 'bg-blue-500'}' />{value ? 'Completed' : 'In Progress'}
</div>
