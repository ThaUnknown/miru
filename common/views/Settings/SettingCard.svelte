<script>
  export let title = ''
  export let description = ''
</script>
<div class='bg-dark-light rounded px-20 py-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-15 mw-1200 w-full'>
  <div class='mr-10 mb-5 mb-md-0'>
    <div class='font-size-16 font-weight-semi-bold'>
      {title}
    </div>
    <div class='text-muted pre-wrap'>
      {description}
    </div>
  </div>
  <slot />
</div>

<style>
  .mw-1200 {
    max-width: 120rem;
  }
</style>
