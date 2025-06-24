<script lang='ts'>
  export let value: number
</script>

<div class='text-sm'>{new Date(value).toLocaleDateString()}</div>
