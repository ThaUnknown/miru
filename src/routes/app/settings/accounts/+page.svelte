<script lang='ts'>
  import { Folder } from 'lucide-svelte'

  import Anilist from '$lib/components/icons/Anilist.svelte'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Label } from '$lib/components/ui/label'
  import { Switch } from '$lib/components/ui/switch'
  import { client } from '$lib/modules/anilist'
  import { authAggregator } from '$lib/modules/auth'
  import native from '$lib/modules/native'
  import { click } from '$lib/modules/navigate'

  const viewer = client.viewer

  $: anilist = $viewer

  const syncSettings = authAggregator.syncSettings
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  <div class='font-weight-bold text-xl font-bold'>Account Settings</div>
  <div>
    <div class='bg-neutral-900 px-6 py-4 rounded-t-md flex flex-row gap-3'>
      {#if anilist?.viewer?.id}
        <div use:click={() => native.openURL(`https://anilist.co/user/${anilist.viewer?.name}`)} class='flex flex-row gap-3'>
          <Avatar.Root class='size-8 rounded-md'>
            <Avatar.Image src={anilist.viewer.avatar?.medium ?? ''} alt={anilist.viewer.name} />
            <Avatar.Fallback>{anilist.viewer.name}</Avatar.Fallback>
          </Avatar.Root>
          <div class='flex flex-col'>
            <div class='text-sm'>
              {anilist.viewer.name}
            </div>
            <div class='text-[9px] text-muted-foreground leading-snug'>
              AniList
            </div>
          </div>
        </div>
      {:else}
        <div>Not logged in</div>
      {/if}
      <Anilist class='size-6 !ml-auto' />
    </div>
    <div class='bg-neutral-950 px-6 py-4 rounded-b-md flex justify-between'>
      {#if anilist?.viewer?.id}
        <Button variant='secondary' on:click={() => client.logout()}>Logout</Button>
      {:else}
        <Button variant='secondary' on:click={() => client.auth()}>Login</Button>
      {/if}
      <div class='flex gap-2 items-center'>
        <Switch hideState={true} id='al-sync-switch' bind:checked={$syncSettings.al} />
        <Label for='al-sync-switch' class='cursor-pointer'>Enable Sync</Label>
      </div>
    </div>
  </div>
  <div>
    <div class='bg-neutral-900 px-6 py-4 rounded-t-md flex flex-row gap-3'>
      <div class='flex flex-row gap-3'>
        <div class='flex flex-col'>
          <div class='text-sm'>
            Other
          </div>
          <div class='text-[9px] text-muted-foreground leading-snug'>
            Local
          </div>
        </div>
      </div>
      <Folder class='size-6 !ml-auto' fill='currentColor' />
    </div>
    <div class='bg-neutral-950 px-6 py-4 rounded-b-md flex justify-end h-[68px]'>
      <div class='flex gap-2 items-center'>
        <Switch hideState={true} id='al-sync-switch' bind:checked={$syncSettings.al} />
        <Label for='al-sync-switch' class='cursor-pointer'>Enable Sync</Label>
      </div>
    </div>
  </div>
</div>
