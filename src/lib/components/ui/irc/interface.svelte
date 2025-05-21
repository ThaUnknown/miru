<script lang='ts'>

  import SendHorizontal from 'lucide-svelte/icons/send-horizontal'

  import { Button } from '../button'
  import { Messages, UserList } from '../chat'

  import type MessageClient from '$lib/modules/irc'

  import { Textarea } from '$lib/components/ui/textarea'

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
</script>

<div class='flex flex-col w-full relative px-md-4 h-full overflow-hidden'>
  <div class='flex md:flex-row flex-col-reverse w-full h-full pt-4'>
    <div class='flex flex-col justify-end overflow-hidden flex-grow px-4 md:pb-4'>
      <Messages messages={client.messages} />
      <div class='flex mt-4'>
        <Textarea
          bind:value={message}
          class='h-auto px-3 w-full flex-grow-1 resize-none min-h-0 border-0 bg-background select:bg-accent select:text-accent-foreground'
          {rows}
          autocomplete='off'
          maxlength={256}
          placeholder='Message' on:keydown={checkInput} on:input={updateRows} />
        <Button on:click={sendMessage} size='icon' class='mt-auto ml-2 border-0' variant='outline'>
          <SendHorizontal size={18} />
        </Button>
      </div>
    </div>
    <UserList users={processedUsers} />
  </div>
</div>
