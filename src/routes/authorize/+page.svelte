<script lang='ts'>
  import { Separator } from '$lib/components/ui/separator'
</script>

<div class='w-full h-full flex flex-col grow items-center justify-center gap-9'>
  <div class='overflow-x-hidden overflow-y-scroll relative flex justify-center items-center text-white px-15 w-full font-light'>
    <div class='w-96 sm:!hidden justify-center items-center flex-col flex'>
      <div class='text-6xl'>Redirecting...</div>
      <Separator class='my-6 w-40' />
      <div class='text-xl text-wrap max-w-full'>This should take no more than a second.</div>
    </div>
    <div class='max-w-4xl w-full hidden justify-center items-center sm:!flex'>
      <div class='text-6xl'>Redirecting...</div>
      <Separator class='mx-6 h-20' orientation='vertical' />
      <div class='text-xl text-wrap max-w-full'>This should take no more than a second.</div>
    </div>
  </div>
</div>
