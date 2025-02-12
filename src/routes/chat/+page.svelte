<script lang='ts' context='module'>
  let prevAgreed = false
</script>

<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import { IRC } from '$lib/components/ui/irc'
  import { TriangleAlert } from 'lucide-svelte'

  let agreed = prevAgreed
  function agree () {
    agreed = prevAgreed = true
  }
</script>

{#if agreed}
  <IRC />
{:else}
  <div class='flex grow h-full items-center justify-center flex-col'>
    <div class='flex flex-col w-[30rem] max-w-full p-5 items-center text-center'>
      <TriangleAlert class='text-black max-w-full' size='12rem' fill='#f59e0b' />
      <div class='text-3xl font-bold'>
        Content Warning
      </div>
      <div class='text-neutral-600 pt-5'>
        This chat is completely unmoderated and may contain content that is not suitable for all audiences.
      </div>
      <div class='text-neutral-600 pt-2'>
        Be wary of impersonation.<br /> Staff will <span class='font-bold text-neutral-500'>NEVER</span> show up on this chat.
      </div>
      <div class='mt-7 gap-3 flex justify-center'>
        <Button variant='secondary' href='/' size='lg'>Nope</Button>
        <Button variant='destructive' size='lg' on:click={agree}>Continue</Button>
      </div>
    </div>
  </div>

{/if}
