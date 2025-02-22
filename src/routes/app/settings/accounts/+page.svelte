<script lang='ts'>
  import Anilist from '$lib/components/icons/Anilist.svelte'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { client } from '$lib/modules/anilist'

  const viewer = client.viewer

  $: anilist = $viewer
// TODO: allow disabling of syncing
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  <div class='font-weight-bold text-xl font-bold'>Account Settings</div>
  <div>
    <div class='bg-neutral-900 px-6 py-4 rounded-t-md flex flex-row space-x-3'>
      {#if anilist?.viewer?.id}
        <Avatar.Root class='size-8 rounded-md'>
          <Avatar.Image src={anilist.viewer.avatar?.medium ?? ''} alt={anilist.viewer.name} />
          <Avatar.Fallback>{anilist.viewer.name}</Avatar.Fallback>
        </Avatar.Root>
        <div class='flex flex-col'>
          <div class='text-sm'>
            {anilist.viewer.name}
          </div>
          <div class='text-[9px] text-muted-foreground'>
            AniList
          </div>
        </div>
      {:else}
        <div>Not logged in</div>
      {/if}
      <Anilist class='size-6 !ml-auto' />
    </div>
    <div class='bg-neutral-950 px-6 py-4 rounded-b-md'>
      {#if anilist?.viewer?.id}
        <Button variant='secondary' on:click={() => client.logout()}>Logout</Button>
      {:else}
        <Button variant='secondary' on:click={() => client.auth()}>Login</Button>
      {/if}
    </div>
  </div>
</div>
