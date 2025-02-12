<script lang='ts'>
  import type { Writable } from 'svelte/store'
  import { getPFP, type ChatUser } from '.'
  import { ExternalLink } from 'lucide-svelte'
  import { click } from '$lib/modules/navigate'
  import native from '$lib/modules/native'

  export let users: Writable<Record<string, ChatUser>>

  function processUsers (users: ChatUser[]) {
    return users.map(user => {
      return {
        ...user,
        pfp: getPFP(user)
      }
    })
  }

  $: processed = processUsers(Object.values($users))
</script>

<div class='flex flex-col w-72 max-w-full px-5 overflow-hidden'>
  <div class='text-md font-bold pl-1 pb-2'>
    {processed.length} Member(s)
  </div>
  <div>
    {#each processed as { id, pfp, nick } (id)}
      <div class='flex items-center pb-2'>
        <img src={pfp} alt='ProfilePicture' class='w-10 h-10 rounded-full p-1 mt-auto' loading='lazy' decoding='async' />
        <div class='text-md pl-2'>
          {nick}
        </div>
        <span class='cursor-pointer flex items-center ml-auto text-blue-600' use:click={() => native.openURL('https://anilist.co/user/' + id)}>
          <ExternalLink size='18' />
        </span>
      </div>
    {/each}
  </div>
</div>
