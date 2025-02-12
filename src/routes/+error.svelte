<script lang='ts'>
  import 'tailwindcss/tailwind.css'
  import { page } from '$app/stores'
  import Separator from '$lib/components/ui/separator/separator.svelte'
</script>

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
