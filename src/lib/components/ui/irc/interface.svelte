<script lang='ts'>
  import DoorOpen from 'lucide-svelte/icons/door-open'
  import SendHorizontal from 'lucide-svelte/icons/send-horizontal'

  import { Button } from '../button'
  import { Messages, UserList } from '../chat'
  import { Separator } from '../separator'

  import type MessageClient from '$lib/modules/irc'

  import { goto } from '$app/navigation'
  import { Textarea } from '$lib/components/ui/textarea'
  import { prevAgreed } from '$lib/modules/irc'

  export let client: MessageClient

  let message = ''
  let rows = 1

  function sendMessage () {
    if (message.trim()) {
      client.say(message.trim())
      message = ''
      rows = 1
    }
  }

  async function checkInput (e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
      e.preventDefault()
      sendMessage()
    } else {
      rows = message.split('\n').length || 1
    }
  }
  function updateRows () {
    rows = message.split('\n').length || 1
  }

  $: users = client.users

  $: processedUsers = Object.values($users)

  function quit () {
    $prevAgreed = false
    client.destroy()
    goto('/app/home')
  }
</script>

<div class='flex flex-col w-full relative h-full overflow-clip'>
  <div class='space-y-0.5 px-10 pt-10'>
    <h2 class='text-2xl font-bold'>Global App Chat</h2>
    <p class='text-muted-foreground'>
      Chat with other users of the app, share your thoughts, ask questions and have fun!
    </p>
    <Separator class='!my-6' />
  </div>
  <div class='flex md:flex-row flex-col-reverse w-full h-full'>
    <div class='flex flex-col justify-end overflow-clip flex-grow px-4 pb-4 h-full min-h-0'>
      <div class='h-full overflow-y-scroll min-h-0 w-full'>
        <Messages messages={client.messages} />
      </div>
      <div class='flex mt-4 gap-2'>
        <Button on:click={quit} size='icon' class='border-0 shrink-0' variant='outline'>
          <DoorOpen size={18} />
        </Button>
        <Textarea
          bind:value={message}
          class='h-auto px-3 w-full flex-grow-1 resize-none min-h-0 border-0 bg-background select:bg-accent select:text-accent-foreground'
          {rows}
          autocomplete='off'
          maxlength={256}
          placeholder='Message' on:keydown={checkInput} on:input={updateRows} />
        <Button on:click={sendMessage} size='icon' class='mt-auto border-0' variant='outline'>
          <SendHorizontal size={18} />
        </Button>
      </div>
    </div>
    <UserList users={processedUsers} />
  </div>
</div>
