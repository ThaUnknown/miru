<script lang='ts' context='module'>
  import DoorOpen from 'lucide-svelte/icons/door-open'
  import SendHorizontal from 'lucide-svelte/icons/send-horizontal'
  import UserPlus from 'lucide-svelte/icons/user-plus'

  import { Button } from '$lib/components/ui/button'
  import { Messages, UserList } from '$lib/components/ui/chat'
  import { Textarea } from '$lib/components/ui/textarea'
</script>

<script lang='ts'>
  import { onDestroy } from 'svelte'

  import { goto } from '$app/navigation'
  import { Separator } from '$lib/components/ui/separator'
  import native from '$lib/modules/native'
  import { w2globby } from '$lib/modules/w2g/lobby'

  export let data

  $: users = $w2globby!.peers
  $: messages = $w2globby!.messages

  let message = ''
  let rows = 1

  function sendMessage () {
    $w2globby?.message(message.trim())
    message = ''
    rows = 1
  }

  async function checkInput (e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
      sendMessage()
      e.preventDefault()
    } else {
      rows = message.split('\n').length || 1
    }
  }
  function updateRows () {
    rows = message.split('\n').length || 1
  }

  $: processedUsers = Object.values($users).map(({ user }) => user)

  function quit () {
    goto('/app/home/')
    $w2globby?.destroy()
  }
  function invite () {
    native.share({ title: 'Hayase W2G', text: 'Invite people to your Watch Together lobby', url: $w2globby?.inviteLink })
  }
  onDestroy(() => {
    if ($w2globby?.destroyed) $w2globby = undefined
  })
</script>

<div class='flex flex-col w-full relative h-full overflow-clip'>
  <div class='space-y-0.5 px-10 pt-10'>
    <h2 class='text-2xl font-bold'>Watch Together <span class='text-muted-foreground text-lg ml-4 font-semibold'>{$w2globby?.code}</span></h2>
    <p class='text-muted-foreground'>
      Watch videos together with friends in real-time. You can invite others to your lobby and chat while watching.
    </p>
    <Separator class='!my-6' />
  </div>
  <div class='flex md:flex-row flex-col-reverse w-full h-full'>
    <div class='flex flex-col justify-end overflow-clip flex-grow px-4 pb-4 h-full min-h-0'>
      <div class='h-full overflow-y-scroll min-h-0 w-full'>
        <Messages {messages} />
      </div>
      <div class='flex mt-4 gap-2'>
        <Button on:click={quit} size='icon' class='border-0 shrink-0' variant='outline'>
          <DoorOpen size={18} />
        </Button>
        <Button on:click={invite} size='icon' class='border-0 shrink-0' variant='outline'>
          <UserPlus size={18} />
        </Button>
        <Textarea
          bind:value={message}
          class='h-auto px-3 w-full resize-none min-h-0 border-0 bg-background select:bg-accent select:text-accent-foreground'
          {rows}
          autocomplete='off'
          maxlength={256}
          placeholder='Message' on:keydown={checkInput} on:input={updateRows} />
        <Button on:click={sendMessage} size='icon' class='border-0 shrink-0' variant='outline'>
          <SendHorizontal size={18} />
        </Button>
      </div>
    </div>
    <UserList users={processedUsers} />
  </div>
</div>
