<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import { Settings } from 'lucide-svelte'
  import * as Dialog from '$lib/components/ui/dialog'
  import type { ExtensionConfig } from 'hayase-extensions'
  import { storage, options as exopts } from '$lib/modules/extensions'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Switch } from '$lib/components/ui/switch'

  export let config: ExtensionConfig

  function deleteExtension () {
    storage.delete(config.id)
  }
</script>

<div class='flex justify-between flex-col items-end pb-1.5'>
  <Dialog.Root portal='#root'>
    <Dialog.Trigger let:builder asChild>
      <Button builders={[builder]} variant='ghost' size='icon-sm'><Settings size={18} /></Button>
    </Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <div class='space-y-4 px-4 sm:px-6'>
          <div class='font-weight-bold text-xl font-bold'>{config.name} Settings</div>
          {#each Object.entries(config.options ?? {}) as [id, options] (id)}
            {#if options.type === 'string'}
              <div class='space-y-2'>
                <Label for={id} class='leading-[unset] grow font-bold'>{options.description}</Label>
                <Input type='text' {id} placeholder={options.default} bind:value={$exopts[config.id].options[id]} />
              </div>
            {:else if options.type === 'number'}
              <div class='space-y-2'>
                <Label for={id} class='leading-[unset] grow font-bold'>{options.description}</Label>
                <Input type='number' {id} placeholder={options.default} bind:value={$exopts[config.id].options[id]} />
              </div>
            {:else if options.type === 'boolean'}
              <div class='flex items-center space-x-2'>
                <Label for={id} class='leading-[unset] grow font-bold'>{options.description}</Label>
                <Switch {id} bind:checked={$exopts[config.id].options[id]} />
              </div>
            {/if}
          {/each}
          <div class='py-3 gap-3 mt-auto flex flex-col sm:flex-row-reverse'>
            <Dialog.Close let:builder asChild>
              <Button variant='secondary' builders={[builder]}>Cancel</Button>
              <Button variant='destructive' on:click={deleteExtension} builders={[builder]}>Delete Extension</Button>
            </Dialog.Close>
          </div>
        </div>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>
  <Switch bind:checked={$exopts[config.id].enabled} hideState={true} />
</div>
