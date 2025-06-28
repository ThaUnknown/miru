<script lang='ts'>
  import Calendar from 'lucide-svelte/icons/calendar'
  import Heart from 'lucide-svelte/icons/heart'
  import House from 'lucide-svelte/icons/house'
  import LogIn from 'lucide-svelte/icons/log-in'
  import MessagesSquare from 'lucide-svelte/icons/messages-square'
  import Search from 'lucide-svelte/icons/search'
  import Settings from 'lucide-svelte/icons/settings'
  import Users from 'lucide-svelte/icons/users'
  import Download from 'svelte-radix/Download.svelte'

  import { BannerImage } from '../banner'
  import { Button } from '../button'

  import SidebarButton from './SidebarButton.svelte'

  import { page } from '$app/stores'
  import Logo from '$lib/components/icons/Logo.svelte'
  import * as Avatar from '$lib/components/ui/avatar'
  import client from '$lib/modules/auth/client'
  import { lockedState, idleState, activityState } from '$lib/modules/idle'
  import native from '$lib/modules/native'
  import { cn, highEntropyValues } from '$lib/utils'

  const auth = client.hasAuth

  $: hasAuth = $auth

  let visibilityState: DocumentVisibilityState

  $: active = ($lockedState === 'locked' || visibilityState === 'hidden' || ($idleState === 'active' && $activityState === 'active')) && $page.route.id !== '/app/player'

  let isMac = false

  if (highEntropyValues) highEntropyValues.then(({ platform }) => { isMac = platform === 'MacOS' })
</script>

<svelte:document bind:visibilityState />

<BannerImage class='absolute top-0 left-0 w-14 -z-10 hidden md:block' />
<Logo class={cn('mb-3 h-10 object-contain px-2.5 hidden md:block text-white ml-2', isMac && 'mt-3')} />
<SidebarButton href='/app/home/'>
  <House size={18} />
</SidebarButton>
<SidebarButton href='/app/search/'>
  <Search size={18} />
</SidebarButton>
<SidebarButton href='/app/schedule/'>
  <Calendar size={18} />
</SidebarButton>
<SidebarButton href='/app/w2g/'>
  <Users size={18} />
</SidebarButton>
<SidebarButton href='/app/chat/'>
  <MessagesSquare size={18} />
</SidebarButton>
<SidebarButton href='/app/client/' id='sidebar-client' data-down='#sidebar-donate'>
  <Download size={18} />
</SidebarButton>
<Button variant='ghost' id='sidebar-donate' data-up='#sidebar-client' on:click={() => native.openURL('https://github.com/sponsors/ThaUnknown/')} class='px-2 w-full relative mt-auto select:!bg-transparent text-[#fa68b6] select:text-[#fa68b6] md:pl-4 md:w-12 md:rounded-l-none'>
  <Heart size={18} fill='currentColor' class={cn('drop-shadow-[0_0_1rem_#fa68b6]', active && 'animate-[hearbeat_1s_ease-in-out_infinite_alternate]')} />
</Button>
<SidebarButton href='/app/settings/'>
  <Settings size={18} />
</SidebarButton>
<SidebarButton href='/app/profile/' class='hidden md:flex py-0'>
  {#if hasAuth}
    {@const viewer = client.profile()}
    <Avatar.Root class='size-6 rounded-md'>
      <Avatar.Image src={viewer?.avatar?.large ?? ''} alt={viewer?.name} />
      <Avatar.Fallback>{viewer?.name}</Avatar.Fallback>
    </Avatar.Root>
  {:else}
    <LogIn size={18} />
  {/if}
</SidebarButton>
