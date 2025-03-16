<script lang='ts'>
  import { page } from '$app/stores'
  import { Separator } from '$lib/components/ui/separator'
</script>

<div class='root w-full h-full backface-hidden bg-black relative overflow-clip border-l-2 border-white flex flex-col grow items-center justify-center gap-9' id='root'>
  <div class='overflow-x-hidden overflow-y-scroll relative flex justify-center items-center text-white px-15 w-full font-light'>
    <div class='w-96 sm:!hidden justify-center items-center flex-col flex'>
      <div class='text-6xl'>{$page.status}</div>
      <Separator class='my-6 w-40' />
      <div class='text-xl text-wrap max-w-full'>{$page.error?.message ?? 'Error'}</div>
    </div>
    <div class='w-96 hidden justify-center items-center sm:!flex'>
      <div class='text-6xl'>{$page.status}</div>
      <Separator class='mx-6 h-20' orientation='vertical' />
      <div class='text-xl text-wrap max-w-full'>{$page.error?.message ?? 'Error'}</div>
    </div>
  </div>
  <img src='/confused.webp' alt='huh' class='w-96 max-w-full' />
</div>
