<script lang='ts'>
  import { Menubar } from '$lib/components/ui/menubar'
  import { Separator } from '$lib/components/ui/separator'
  import { Button } from '$lib/components/ui/button'
  import native from '$lib/modules/native'
  import { outdatedComponent } from '$lib/modules/update'
</script>

<div class='w-full h-full flex flex-col grow items-center justify-center gap-9'>
  <Menubar />
  <div class='overflow-x-hidden overflow-y-scroll relative flex justify-center items-center text-white px-15 w-full font-light'>
    <div class='max-w-full min-w-96 justify-center items-center flex-col flex'>
      <div class='text-6xl text-center'>Update Required</div>
      <Separator class='my-6 w-40' />
      <div class='text-xl text-wrap max-w-full text-center'>A mandatory update is available for the {outdatedComponent}.<br />Please update to continue.</div>
      <Button class='mt-6 text-md font-bold' size='lg' on:click={native.restart}>Update</Button>
    </div>
  </div>
</div>
