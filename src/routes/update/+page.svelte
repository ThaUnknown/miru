<script lang='ts'>
  import { toast } from 'svelte-sonner'

  import InstallWaitButton from './InstallWaitButton.svelte'

  import { Button } from '$lib/components/ui/button'
  import { Menubar } from '$lib/components/ui/menubar'
  import { Separator } from '$lib/components/ui/separator'
  import native from '$lib/modules/native'
  import { outdatedComponent, uiUpdate, isBrokenVeryBadly } from '$lib/modules/update'

  navigator.serviceWorker.getRegistration().then(registration => registration?.update())

  // TODO: REMOVE MEEE!!!
  isBrokenVeryBadly.then(brokey => {
    if (!brokey) return
    setTimeout(() => {
      toast.error('We broke the app\'s auto-update functionality :(', {
        description: 'Please re-install to update the app.\n\nThis problem has now been fixed and won\'t EVER occur in future versions.\n\nWe apologize for the inconvenience and appreciate your understanding. :(',
        duration: Infinity
      })
    }, 500)
  })
</script>

<div class='w-full h-full flex flex-col grow items-center justify-center gap-9'>
  <Menubar />
  <div class='overflow-x-hidden overflow-y-scroll relative flex justify-center items-center text-white px-15 w-full font-light'>
    <div class='max-w-full min-w-96 justify-center items-center flex-col flex'>
      <div class='text-6xl text-center font-bold'>Update Required</div>
      <Separator class='my-6 w-40' />
      <div class='text-xl text-wrap max-w-full text-center mb-6'>A mandatory update is available for the {#await outdatedComponent then name}{name}{/await}.<br />Please update to continue.</div>
      {#await isBrokenVeryBadly then brokey}
        {#if brokey}
          <Button class='text-md font-bold' size='lg' on:click={() => native.openURL('https://hayase.watch/download')}>Open Website</Button>
        {:else}
          {#await outdatedComponent then name}
            {#if name === 'client'}
              {#await native.updateReady()}
                <InstallWaitButton />
              {:then _}
                <Button class='text-md font-bold' size='lg' on:click={native.updateAndRestart}>Update</Button>
              {/await}
            {:else}
              {#await uiUpdate}
                <InstallWaitButton />
              {:then _}
                <Button class='text-md font-bold' size='lg' on:click={() => location.reload()}>Install</Button>
              {/await}
            {/if}
          {/await}
        {/if}
      {/await}
    </div>
  </div>
</div>
