<script lang='ts'>
  export let animate = true
</script>

<div class='p-4 shrink-0'>
  <div class='item w-[16rem] flex flex-col'>
    <div class='h-[9rem] w-full bg-primary/5 rounded' class:animate-pulse={animate} />
    <div class='mt-4 bg-primary/5 rounded h-2 w-28' class:animate-pulse={animate} />
    <div class='mt-2 bg-primary/5 rounded h-2 w-20' class:animate-pulse={animate} />
  </div>
</div>

<style>
  .item {
    animation: 0.3s ease 0s 1 load-in;
  }
</style>
