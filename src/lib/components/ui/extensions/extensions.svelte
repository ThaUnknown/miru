<script lang='ts'>
  import Github from 'lucide-svelte/icons/github'
  import Globe from 'lucide-svelte/icons/globe'
  import Plus from 'lucide-svelte/icons/plus'
  import MagnifyingGlass from 'svelte-radix/MagnifyingGlass.svelte'
  import { toast } from 'svelte-sonner'

  import { Button, iconSizes } from '../button'

  import ExtensionSettings from './ExtensionSettings.svelte'

  import { Input } from '$lib/components/ui/input'
  import * as Tabs from '$lib/components/ui/tabs'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { saved, storage } from '$lib/modules/extensions'
  import { codeToEmoji } from '$lib/utils'

  const typeMap = {
    nzb: 'NZB',
    torrent: 'Torrent',
    url: 'URL'
  }
  let value = 'extensions'
  let inputText = ''

  function filterSearch <T extends Array<[string, unknown]>> (repositories: T, input: string): T {
    if (!input) return repositories
    return repositories.filter(([id]) => id.toLowerCase().includes(input.toLowerCase())) as T
  }

  let extensionInput = ''

  let importPromise = Promise.resolve()

  export function importExtension (ext = extensionInput) {
    importPromise = (async () => {
      try {
        await storage.import(ext)
      } catch (err) {
        const error = err as Error
        toast.error(error.cause as string, { description: error.message })
      }
    })()
  }
// TODO: import files
</script>

<Tabs.Root bind:value class='w-full'>
  <div class='flex justify-between items-center gap-3 sm:flex-row flex-col'>
    <Tabs.List class='grid w-full grid-cols-2 md:max-w-72'>
      <Tabs.Trigger value='extensions'>Extensions</Tabs.Trigger>
      <Tabs.Trigger value='repositories'>Repositories</Tabs.Trigger>
    </Tabs.List>
    <div class='flex items-center relative scale-parent md:max-w-72 w-full'>
      <Input
        class='pl-9 bg-neutral-950 select:bg-accent select:text-accent-foreground shadow-sm no-scale placeholder:opacity-50'
        placeholder='Search {value}...'
        bind:value={inputText} />
      <MagnifyingGlass class='h-4 w-4 shrink-0 opacity-50 absolute left-3 text-muted-foreground z-10 pointer-events-none' />
    </div>
  </div>
  <Tabs.Content value='extensions' tabindex={-1}>
    <div class='flex flex-col gap-y-2 justify-center py-3'>
      {#each filterSearch(Object.entries($saved), inputText) as [id, config] (id)}
        <div class='bg-neutral-950 px-4 py-3 rounded-md flex flex-row space-x-3 justify-between w-full border border-border'>
          <div class='flex flex-col space-y-3'>
            <div class='flex flex-row space-x-3'>
              <img src={config.icon} alt='ico' class='size-10 rounded-md bg-neutral-900' loading='lazy' decoding='async' />
              <div class='flex flex-col'>
                <div class='text-md font-bold'>
                  {config.name}
                </div>
                <div class='text-xs text-muted-foreground'>
                  {id}
                </div>
              </div>
            </div>
            <div class='flex-wrap w-full justify-start gap-2 flex text-neutral-300 text-sm'>
              <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug'>
                {config.version}
              </div>
              <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug'>
                {typeMap[config.type]}
              </div>
              <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug capitalize'>
                {config.accuracy} Accuracy
              </div>
              {#if config.ratio}
                <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug'>
                  {config.ratio} Ratio
                </div>
              {/if}
              <div class='rounded px-3 py-0.5 font-bold bg-neutral-900 leading-snug capitalize'>
                {config.media}
              </div>
              {#if config.languages}
                <div class='font-twemoji text-xl leading-none content-center line-clamp-1'>
                  {#each config.languages as lang (lang)}
                    {codeToEmoji(lang)}
                  {/each}
                </div>
              {/if}
            </div>
          </div>
          <ExtensionSettings {config} />
        </div>
      {:else}
        <div class='px-4 py-6 gap-y-4 flex flex-col items-center'>
          <div class='text-bold text-2xl'>
            Looks like there's nothing here...
          </div>
          <div class='text-sm text-muted-foreground'>
            Import some extensions in the Repositories tab.
          </div>
        </div>
      {/each}
    </div>
  </Tabs.Content>
  <Tabs.Content value='repositories' tabindex={-1}>
    <div class='gap-3 flex py-3 sm:flex-row flex-col'>
      <Tooltip.Root>
        <Tooltip.Trigger class='w-full'>
          <Input class='bg-neutral-950' type='url' placeholder='https://example.com/manifest.json' bind:value={extensionInput} />
        </Tooltip.Trigger>
        <Tooltip.Content class='max-w-full w-52'>
          Destination URL of the extension manifest to import extensions from. This can be a direct URL to a .json file, an npm package prefixed with npm:, a file in a github repository prefixed with gh: or a file with the file: prefix and the code inlined as text.
        </Tooltip.Content>
      </Tooltip.Root>
      {#await importPromise}
        <Button class='font-bold flex items-center justify-center w-full sm:w-56 max-w-full shrink-0 !pointer-events-auto cursor-wait' disabled size='default'>
          <Plus size={iconSizes.lg} class='mr-2' />
          Importing extensions....
        </Button>
      {:then _}
        <Button class='font-bold flex items-center justify-center w-full sm:w-56 max-w-full shrink-0' size='default' on:click={() => importExtension()}>
          <Plus size={iconSizes.lg} class='mr-2' />
          Import Extensions
        </Button>
      {/await}
    </div>
    <div class='flex flex-col gap-y-2 justify-center py-3'>
      {#each filterSearch(Object.entries(Object.groupBy(Object.values($saved), saved => saved.update ?? '')), inputText) as [id, extensions] (id) }
        {@const url = new URL(id)}
        <div class='bg-neutral-950 px-4 py-3 rounded-md flex flex-row space-x-3 justify-between items-center w-full border border-border'>
          <div class='flex space-x-2 items-center'>
            {#if url.protocol === 'gh:'}
              <Github class='w-5 h-5 text-muted-foreground' />
            {:else if url.protocol === 'npm:'}
              <svg class='w-5 h-5 text-muted-foreground' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><path fill='currentColor' d='M2 38.5h124v43.71H64v7.29H36.44v-7.29H2Zm6.89 36.43h13.78V53.07h6.89v21.86h6.89V45.79H8.89Zm34.44-29.14v36.42h13.78v-7.28h13.78V45.79Zm13.78 7.29H64v14.56h-6.89Zm20.67-7.29v29.14h13.78V53.07h6.89v21.86h6.89V53.07h6.89v21.86h6.89V45.79Z' /></svg>
            {:else}
              <Globe class='w-5 h-5 text-muted-foreground' strokeWidth='1px' />
            {/if}
            <div>
              {url.pathname}
            </div>
          </div>
          <div class='text-xs text-muted-foreground'>
            {extensions?.length ?? 0} Extensions
          </div>
        </div>
      {:else}
        <div class='px-4 py-6 gap-y-4 flex flex-col items-center'>
          <div class='text-bold text-2xl'>
            Looks like there's nothing here...
          </div>
          <div class='text-sm text-muted-foreground'>
            Import some extensions in the field above.
          </div>
        </div>
      {/each}
    </div>
  </Tabs.Content>
</Tabs.Root>
