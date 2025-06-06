<script lang='ts'>
  import CloudOff from 'lucide-svelte/icons/cloud-off'
  import Folder from 'lucide-svelte/icons/folder'
  import MessagesSquare from 'lucide-svelte/icons/messages-square'

  import Anilist from '$lib/components/icons/Anilist.svelte'
  import Kitsu from '$lib/components/icons/Kitsu.svelte'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import Input from '$lib/components/ui/input/input.svelte'
  import { Label } from '$lib/components/ui/label'
  import { Switch } from '$lib/components/ui/switch'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { client } from '$lib/modules/anilist'
  import { authAggregator } from '$lib/modules/auth'
  import ksclient from '$lib/modules/auth/kitsu'
  import native from '$lib/modules/native'
  import { click } from '$lib/modules/navigate'

  const alviewer = client.viewer

  $: anilist = $alviewer

  const kitsuviewer = ksclient.viewer

  $: kitsu = $kitsuviewer

  const syncSettings = authAggregator.syncSettings

  let kitsuLogin = ''
  let kitsuPassword = ''
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  <div class='font-weight-bold text-xl font-bold'>Account Settings</div>
  <div>
    <div class='bg-neutral-900 px-6 py-4 rounded-t-md flex flex-row gap-3'>
      {#if anilist?.viewer?.id}
        <div use:click={() => native.openURL(`https://anilist.co/user/${anilist.viewer?.name}`)} class='flex flex-row gap-3'>
          <Avatar.Root class='size-8 rounded-md'>
            <Avatar.Image src={anilist.viewer.avatar?.large ?? ''} alt={anilist.viewer.name} />
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
      <Anilist class='size-6 ml-auto' />
    </div>
    <div class='bg-neutral-950 px-6 py-4 rounded-b-md flex justify-between'>
      {#if anilist?.viewer?.id}
        <Button variant='secondary' on:click={() => client.logout()}>Logout</Button>
      {:else}
        <Button variant='secondary' on:click={() => client.auth()}>Login</Button>
      {/if}
      <div class='flex items-center gap-4'>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <MessagesSquare size={16} class='text-muted-foreground' />
          </Tooltip.Trigger>
          <Tooltip.Content>
            Has Discussions
          </Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <CloudOff size={16} class='text-muted-foreground' />
          </Tooltip.Trigger>
          <Tooltip.Content>
            Works Offline
          </Tooltip.Content>
        </Tooltip.Root>
        <div class='flex gap-2 items-center'>
          <Switch hideState={true} id='al-sync-switch' bind:checked={$syncSettings.al} />
          <Label for='al-sync-switch' class='cursor-pointer'>Enable Sync</Label>
        </div>
      </div>
    </div>
  </div>
  <div>
    <div class='bg-neutral-900 px-6 py-4 rounded-t-md flex flex-row gap-3'>
      {#if kitsu?.id}
        <div use:click={() => native.openURL(`https://kitsu.app/users/${kitsu.name}`)} class='flex flex-row gap-3'>
          <Avatar.Root class='size-8 rounded-md'>
            <Avatar.Image src={kitsu.avatar?.large ?? ''} alt={kitsu.name} />
            <Avatar.Fallback>{kitsu.name}</Avatar.Fallback>
          </Avatar.Root>
          <div class='flex flex-col'>
            <div class='text-sm'>
              {kitsu.name}
            </div>
            <div class='text-[9px] text-muted-foreground leading-snug'>
              Kitsu
            </div>
          </div>
        </div>
      {:else}
        <div>Not logged in</div>
      {/if}
      <Kitsu class='size-6 !ml-auto' />
    </div>
    <div class='bg-neutral-950 px-6 py-4 rounded-b-md flex justify-between'>
      {#if kitsu?.id}
        <Button variant='secondary' on:click={() => ksclient.logout()}>Logout</Button>
      {:else}
        <Dialog.Root portal='#root'>
          <Dialog.Trigger let:builder asChild>
            <Button builders={[builder]} variant='secondary'>Login</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header class='items-center'>
              <div class='space-y-4 px-4 sm:px-6 max-w-xl w-full'>
                <div class='font-weight-bold text-xl font-bold'>Kitsu Login</div>
                <div class='space-y-2'>
                  <Label for='kitsu-login' class='leading-[unset] grow font-bold'>Login</Label>
                  <Input type='text' id='kitsu-login' placeholder='email@website.com' autocomplete='off' bind:value={kitsuLogin} />
                </div>
                <div class='space-y-2'>
                  <Label for='kitsu-password' class='leading-[unset] grow font-bold'>Password</Label>
                  <Input type='password' id='kitsu-password' placeholder='**************' autocomplete='off' bind:value={kitsuPassword} />
                </div>
                <div class='text-sm text-muted-foreground'>
                  Your password is not stored in the app, it is sent directly to Kitsu for authentication.
                </div>
                <div class='py-3 gap-3 mt-auto flex flex-col sm:flex-row-reverse'>
                  <Button variant='secondary' on:click={() => ksclient.login(kitsuLogin, kitsuPassword)}>Login</Button>
                  <Dialog.Close let:builder asChild>
                    <Button variant='destructive' builders={[builder]}>Cancel</Button>
                  </Dialog.Close>
                </div>
              </div>
            </Dialog.Header>
          </Dialog.Content>
        </Dialog.Root>
      {/if}
      <div class='flex gap-2 items-center'>
        <Switch hideState={true} id='kitsu-sync-switch' bind:checked={$syncSettings.kitsu} />
        <Label for='kitsu-sync-switch' class='cursor-pointer'>Enable Sync</Label>
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
    <div class='bg-neutral-950 px-6 py-4 rounded-b-md flex justify-end h-[68px] gap-4'>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <CloudOff size={16} class='text-muted-foreground' />
        </Tooltip.Trigger>
        <Tooltip.Content>
          Works Offline
        </Tooltip.Content>
      </Tooltip.Root>
      <div class='flex gap-2 items-center'>
        <Switch hideState={true} id='local-sync-switch' bind:checked={$syncSettings.local} />
        <Label for='local-sync-switch' class='cursor-pointer'>Enable Sync</Label>
      </div>
    </div>
  </div>
</div>
