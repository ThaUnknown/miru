<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input'
  import { storage } from '$lib/modules/extensions'
  import { toast } from 'svelte-sonner'

  async function importExtensions () {
    try {
      await storage.import(url)
      open = false
    } catch (error) {
      toast.error('Failed to import extensions', {
        description: (error as Error).message,
        duration: 5000
      })
    }
  }

  let url = ''

  let open = false
</script>

<Dialog.Root bind:open portal='#root'>
  <Dialog.Trigger let:builder asChild>
    <Button builders={[builder]} size='sm'>Import Extensions</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <div class='space-y-4 px-4 sm:px-6'>
        <div class='font-weight-bold text-xl font-bold'>Import Extensions</div>

        <div class='space-y-2'>
          <div class='text-muted-foreground text-xs whitespace-pre-wrap block'>
            Destination URL of the extension manifest to import extensions from. This can be a direct URL to a .json file, an npm package prefixed with npm:, a file in a github repository prefixed with gh: or a file with the file: prefix and the code inlined as text.
          </div>
          <Input type='url' id='import-extensions' placeholder='https://example.com/manifest.json' bind:value={url} />
        </div>

        <div class='py-3 gap-3 mt-auto flex flex-col sm:flex-row-reverse'>
          <Dialog.Close let:builder asChild>
            <Button variant='secondary' builders={[builder]}>Cancel</Button>
          </Dialog.Close>
          <Button on:click={importExtensions}>Import</Button>
        </div>
      </div>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
