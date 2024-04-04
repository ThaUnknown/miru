<script>
  import { page } from '$app/stores'
</script>

<div class='overflow-x-hidden content-wrapper h-full overflow-y-scroll position-relative d-flex justify-content-center align-items-center text-white font-weight-lighter line-height-11 px-15'>
  <div class='w-600 d-sm-flex justify-content-center align-items-center flex-row d-none'>
    <div class='fs-80 border-right pr-20'>{$page.status}</div>
    <div class='font-size-24 pl-20 text-wrap mw-full'>{$page.error?.message || 'Error'}</div>
  </div>
  <div class='w-600 d-flex justify-content-center align-items-center flex-column d-sm-none'>
    <div class='fs-80 pb-15 border-bottom'>{$page.status}</div>
    <div class='font-size-24 pt-20 text-wrap mw-full'>{$page.error?.message || 'Error'}</div>
  </div>
</div>

<style>
  .fs-80 {
    font-size: 8rem;
  }
  .line-height-11 {
    line-height: 1.1;
  }
</style>
