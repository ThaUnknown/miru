<script>
  import { click } from '@/modules/click.js'
  import User from './User.svelte'
  import Message from './Message.svelte'
  import { SendHorizontal, DoorOpen, UserPlus } from 'lucide-svelte'
  export let invite

  /** @type {import('simple-store-svelte').Writable<import('./w2g.js').W2GClient | null>} */
  export let state

  function cleanup () {
    state.value?.destroy()
    state.value = null
  }

  $: peers = $state?.peers
  $: messages = $state?.messages

  /**
   * @param {{ message: string, user: import('@/modules/al.d.ts').Viewer | {id: string }, type: 'incoming' | 'outgoing', date: Date }[]} messages
   */
  function groupMessages (messages) {
    if (!messages?.length) return []
    const grouped = []
    for (const { message, user, type, date } of messages.slice(-50)) {
      const last = grouped[grouped.length - 1]
      if (last && last.user.id === user.id) {
        last.messages.push(message)
      } else {
        grouped.push({ user, messages: [message], type, date })
      }
    }
    return grouped
  }

  let message = ''
  let rows = 1

  function sendMessage () {
    if (message.trim()) {
      state.value.message(message.trim())
      message = ''
      rows = 1
    }
  }

  function checkInput (e) {
    if (e.key === 'Enter' && e.shiftKey === false && message.trim()) {
      sendMessage()
      e.preventDefault()
    } else {
      rows = message.split('\n').length || 1
    }
  }
</script>

<div class='d-flex flex-column root w-full position-relative px-md-20 h-full overflow-hidden'>
  <div class='d-flex flex-md-row flex-column-reverse w-full h-full pt-20'>
    <div class='d-flex flex-column justify-content-end overflow-hidden flex-grow-1 px-20 pb-md-20'>
      {#each groupMessages($messages) as { user, messages, type, date }}
        <Message time={date} {user} {messages} {type} />
      {/each}
      <div class='d-flex mt-20'>
        <button class='btn text-danger d-flex mt-auto align-items-center justify-content-center mr-10 border-0 px-0 shadow-none' type='button' use:click={cleanup} style='height: 3.75rem !important; width: 3.75rem !important;'>
          <DoorOpen size='1.8rem' strokeWidth={2.5} />
        </button>
        <button class='btn text-success d-flex mt-auto align-items-center justify-content-center mr-20 border-0 px-0 shadow-none' type='button' use:click={invite} style='height: 3.75rem !important; width: 3.75rem !important;'>
          <UserPlus size='1.8rem' strokeWidth={2.5} />
        </button>
        <textarea
          bind:value={message}
          class='form-control h-auto mt-20 px-15 d-flex align-items-center justify-content-center line-height-normal w-auto flex-grow-1 shadow-0'
          {rows}
          style='resize: none; min-height: 0 !important'
          autocomplete='off'
          maxlength='2048'
          placeholder='Message' on:keydown={checkInput} />
        <button class='btn d-flex mt-auto align-items-center justify-content-center ml-20 border-0 px-0 shadow-none' type='button' use:click={sendMessage} style='height: 3.75rem !important; width: 3.75rem !important;'>
          <SendHorizontal size='1.8rem' strokeWidth={2.5} />
        </button>
      </div>
    </div>
    <div class='d-flex flex-column w-350 mw-full px-20'>
      {#if peers}
        <div class='font-size-20 font-weight-bold pl-5 pb-10'>
          {Object.values($peers).length} Member(s)
        </div>
        {#each Object.values($peers) as { user }}
          <User {user} />
        {/each}
      {/if}
    </div>
  </div>
  <!-- {#each Object.values($peers) as peer}
    <div class='d-flex align-items-center pb-10'>
      {#if peer.user?.avatar?.medium}
        <img src={peer.user?.avatar?.medium} alt='avatar' class='w-50 h-50 img-fluid rounded' />
      {:else}
        <span class='w-50 h-50 anon d-flex align-items-center'><User size='4rem' /></span>
      {/if}
      <h4 class='my-0 pl-20 mr-auto line-height-normal'>{peer.user?.name || 'Anonymous'}</h4>
      {#if peer.user?.name}
        <span class='pointer text-primary d-flex align-items-center' use:click={() => IPC.emit('open', 'https://anilist.co/user/' + peer.user?.name)}><ExternalLink size='2.5rem' /></span>
      {/if}
    </div>
  {/each} -->
</div>
