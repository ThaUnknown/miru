<script>
  import Search from './Search.svelte'
</script>

<div class="d-flex h-full flex-column overflow-y-scroll root">
  <div class="h-full py-10">
    <Search />
  </div>
</div>

<style>
  .root {
    animation: .3s ease 0s 1 load-in;
  }
</style>
