<script lang='ts' context='module'>
  import SendHorizontal from 'lucide-svelte/icons/send-horizontal'
  import { writable, type Writable } from 'simple-store-svelte'

  import { Messages, UserList } from '../chat'

  import { Textarea } from '$lib/components/ui/textarea'
  import { client } from '$lib/modules/anilist'
  import MessageClient from '$lib/modules/irc'

  const irc: Writable<Promise<MessageClient> | null> = writable(null)
</script>

<script lang='ts'>
  import { Button } from '../button'

  const viewer = client.viewer.value

  let ident: { nick: string, id: string, pfpid: string, type: 'al' | 'guest' }

  if (viewer?.viewer) {
    const url = viewer.viewer.avatar?.medium ?? ''
    const id = '' + viewer.viewer.id
    const pfpid = url.slice(url.lastIndexOf('/') + 2 + id.length + 1)
    ident = { nick: viewer.viewer.name, id, pfpid, type: 'al' }
  } else {
    ident = { nick: 'Guest-' + crypto.randomUUID().slice(0, 6), id: crypto.randomUUID().slice(0, 6), pfpid: '0', type: 'guest' }
  }

  if (!irc.value) irc.value = MessageClient.new(ident)

  let message = ''
  let rows = 1

  function sendMessage (client: MessageClient) {
    if (message.trim()) {
      client.say(message.trim())
      message = ''
      rows = 1
    }
  }

  async function checkInput (e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
      e.preventDefault()
      sendMessage(await irc.value!)
    } else {
      rows = message.split('\n').length || 1
    }
  }
  function updateRows () {
    rows = message.split('\n').length || 1
  }
</script>

{#if $irc}
  {#await $irc}
    <div class='w-full h-full flex items-center justify-center flex-col text-muted-foreground text-lg'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        class='animate-spin mb-2'>
        <path d='M21 12a9 9 0 1 1-6.219-8.56' />
      </svg>
      Loading...
    </div>
  {:then client}
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
            <Button on:click={() => sendMessage(client)} size='icon' class='mt-auto ml-2 border-0' variant='outline'>
              <SendHorizontal size={18} />
            </Button>
          </div>
        </div>
        <UserList users={client.users} />
      </div>
    </div>
    <!-- <Chat {client} /> -->
  {/await}
{/if}
