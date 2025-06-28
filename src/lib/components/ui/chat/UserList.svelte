<script lang='ts'>
  import ExternalLink from 'lucide-svelte/icons/external-link'

  import type { ChatUser } from '.'

  import native from '$lib/modules/native'
  import { click } from '$lib/modules/navigate'

  export let users: ChatUser[]

  $: processed = Object.entries(users)
</script>

<div class='flex flex-col w-full md:w-72 max-w-full px-5 overflow-y-auto md:max-h-full max-h-[40%]'>
  <div class='text-md font-bold pl-1 pb-2'>
    {processed.length} Member(s)
  </div>
  <div>
    {#each processed as [key, user] (key)}
      <div class='flex items-center pb-2'>
        <img src={user.avatar?.large ?? 'https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png'} alt='ProfilePicture' class='w-10 h-10 rounded-full p-1 mt-auto' loading='lazy' decoding='async' />
        <div class='text-md pl-2'>
          {user.name}
        </div>
        <span class='cursor-pointer flex items-center ml-auto text-blue-600' use:click={() => native.openURL('https://anilist.co/user/' + user.id)}>
          <ExternalLink size='18' />
        </span>
      </div>
    {/each}
  </div>
</div>
