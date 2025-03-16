<script lang='ts'>
  import { Home, Search, Calendar, Users, MessagesSquare, Heart, Settings, LogIn } from 'lucide-svelte'
  import Hub from '$lib/components/icons/Hub.svelte'
  import SidebarButton from './SidebarButton.svelte'
  import { BannerImage } from '../banner'
  import native from '$lib/modules/native'
  import { Button } from '../button'
  import client from '$lib/modules/auth/client'
  import * as Avatar from '$lib/components/ui/avatar'

  const auth = client.hasAuth

  $: hasAuth = $auth
</script>

<div class='w-14 p-2 flex flex-col z-10 shrink-0 bg-black'>
  <BannerImage class='absolute top-0 left-0 w-14 -z-10' />
  <img src='/logo_cropped.png' alt='logo' class='mb-3 cursor-pointer h-10 object-contain px-1' decoding='async' />
  <SidebarButton class='mb-2' href='/app/home/'>
    <Home size={18} />
  </SidebarButton>
  <SidebarButton class='mb-2' href='/app/search/'>
    <Search size={18} />
  </SidebarButton>
  <SidebarButton class='mb-2' href='/app/schedule/'>
    <Calendar size={18} />
  </SidebarButton>
  <SidebarButton class='mb-2' href='/app/w2g/'>
    <Users size={18} />
  </SidebarButton>
  <SidebarButton class='mb-2' href='/app/chat/'>
    <MessagesSquare size={18} />
  </SidebarButton>
  <SidebarButton class='mb-2' href='/app/client/'>
    <Hub size={18} fill='currentColor' />
  </SidebarButton>
  <Button variant='ghost' on:click={() => native.openURL('https://github.com/sponsors/ThaUnknown/')} class='px-2 w-full relative mb-2 mt-auto select:!bg-transparent text-[#fa68b6] select:text-[#fa68b6]'>
    <Heart size={18} fill='currentColor' class='absolute' />
    <Heart size={18} fill='currentColor' class='donate' />
  </Button>
  <SidebarButton class='mb-2' href='/app/settings/'>
    <Settings size={18} />
  </SidebarButton>
  <SidebarButton href='/app/profile/'>
    {#if hasAuth}
      {@const viewer = client.profile()}
      <Avatar.Root class='size-6 rounded-md'>
        <Avatar.Image src={viewer?.avatar?.medium ?? ''} alt={viewer?.name} />
        <Avatar.Fallback>{viewer?.name}</Avatar.Fallback>
      </Avatar.Root>
    {:else}
      <LogIn size={18} />
    {/if}
  </SidebarButton>
</div>

<style>
  :global(.donate) {
    filter: drop-shadow(0 0 1rem #fa68b6);
    animation: glow 1s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from {
      transform: translate3d(var(--tw-translate-x), var(--tw-translate-y), 0) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(1) scaleY(1);
    }
    to {
      transform: translate3d(var(--tw-translate-x), var(--tw-translate-y), 0) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(0.5) scaleY(0.5);
    }
  }
</style>
