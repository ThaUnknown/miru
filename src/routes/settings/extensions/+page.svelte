<script lang='ts'>
  import { saved } from '$lib/modules/extensions'
  import ExtensionSettings from './ExtensionSettings.svelte'

  const typeMap = {
    nzb: 'NZB',
    torrent: 'Torrent',
    url: 'URL'
  }
</script>

<div class='space-y-3 pb-10'>
  <div class='font-weight-bold text-xl font-bold'>Extension Settings</div>

  <div class='grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] place-items-center gap-x-10 gap-y-7 justify-center py-3'>
    {#each Object.entries($saved) as [id, config] (id)}
      <div class='bg-neutral-950 px-5 py-4 rounded-md flex flex-row space-x-3 justify-between w-full'>
        <div class='flex flex-col space-y-3'>
          <div class='flex flex-row space-x-3'>
            <img src={config.icon} alt='ico' class='size-12 rounded-md bg-neutral-900' />
            <div class='flex flex-col'>
              <div class='text-lg font-bold'>
                {config.name}
              </div>
              <div class='text-sm text-muted-foreground'>
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
          </div>
        </div>
        <ExtensionSettings {config} />
      </div>
    {/each}
  </div>
</div>
