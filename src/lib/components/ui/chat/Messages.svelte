<script lang='ts'>
  import type { ChatMessage } from '.'
  import type { Writable } from 'simple-store-svelte'

  export let messages: Writable<ChatMessage[]>

  function groupMessages (messages: ChatMessage[]) {
    if (!messages.length) return []
    const grouped = []
    for (const { message, user, type, date } of messages) {
      const last = grouped[grouped.length - 1]!
      if (grouped.length && last.user.id === user.id) {
        last.messages.push(message)
      } else {
        grouped.push({ user, messages: [message], type, date })
      }
    }
    return grouped
  }
</script>

{#each groupMessages($messages) as { type, user, date, messages }, i (i)}
  {@const incoming = type === 'incoming'}
  <div class='message flex flex-row mt-3' class:flex-row={incoming} class:flex-row-reverse={!incoming}>
    <img src={user.avatar?.large ?? ''} alt='ProfilePicture' class='w-10 h-10 rounded-full p-1 mt-auto' loading='lazy' decoding='async' />
    <div class='flex flex-col px-2 items-start flex-auto' class:items-start={incoming} class:items-end={!incoming}>
      <div class='pb-1 flex flex-row items-center px-1'>
        <div class='font-bold text-sm'>
          {user.name}
        </div>
        <div class='text-muted-foreground pl-2 text-[10px] leading-relaxed'>
          {date.toLocaleTimeString()}
        </div>
      </div>
      {#each messages as message, i (i)}
        <div class='bg-muted py-2 px-3 rounded-t-xl rounded-r-xl mb-1 select-all text-xs whitespace-pre-wrap max-w-[calc(100%-100px)]'
          class:!bg-theme={!incoming}
          class:rounded-r-xl={incoming} class:rounded-l-xl={!incoming}>
          {message}
        </div>
      {/each}
    </div>
  </div>
{/each}

<style>
  .message {
    --base-border-radius: 1.3rem;
  }
  .flex-auto {
    flex: auto;
  }
</style>
