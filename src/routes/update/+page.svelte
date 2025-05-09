<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import { Menubar } from '$lib/components/ui/menubar'
  import { Separator } from '$lib/components/ui/separator'
  import native from '$lib/modules/native'
  import { outdatedComponent } from '$lib/modules/update'
</script>

<div class='w-full h-full flex flex-col grow items-center justify-center gap-9'>
  <Menubar />
  <div class='overflow-x-hidden overflow-y-scroll relative flex justify-center items-center text-white px-15 w-full font-light'>
    <div class='max-w-full min-w-96 justify-center items-center flex-col flex'>
      <div class='text-6xl text-center font-bold'>Update Required</div>
      <Separator class='my-6 w-40' />
      <div class='text-xl text-wrap max-w-full text-center'>A mandatory update is available for the {#await outdatedComponent then name}{name}{/await}.<br />Please update to continue.</div>
      <!-- TODO: remove this github releases open and replace it with native client update call!!! -->
      {#await outdatedComponent then name}
        <Button class='mt-6 text-md font-bold' size='lg' on:click={() => name === 'client' ? native.openURL('https://github.com/ThaUnknown/miru/releases/tag/v6.1.0') : native.restart()}>Update</Button>
      {/await}
    </div>
  </div>
</div>
