<script lang='ts'>
  import Play from 'lucide-svelte/icons/play'

  import { Button, iconSizes } from '../button'

  import type { Media } from '$lib/modules/anilist'

  import { themes } from '$lib/modules/animethemes'

  export let media: Media

  const themesRes = themes(media.id)

  let src = ''
  function playVideo (url?: string) {
    if (!url) return
    if (src === url) {
      src = ''
      return
    }
    src = url
  }
  function volume (el: HTMLVideoElement) {
    el.volume = 0.2
    el.muted = false
  }
</script>

<div class='flex flex-col gap-2 pt-3'>
  {#await themesRes}
    {#each Array.from({ length: 2 }) as _, i (i)}
      <div class='bg-neutral-950 rounded-md px-7 py-4 gap-4 flex flex-col text-xs'>
        <div class='flex h-8 items-center'>
          <div class='w-12'>
            <div class='bg-primary/5 rounded h-2.5 w-4 animate-pulse' />
          </div>
          <div class='text-base font-bold flex'>
            <div class='bg-primary/5 rounded h-2.5 w-32 animate-pulse mr-2' />
            <div class='bg-primary/5 rounded h-2.5 w-20 animate-pulse' />
          </div>
        </div>
        <div class='flex h-8 items-center text-muted-foreground'>
          <div class='w-12'>
            <div class='bg-primary/5 rounded h-2 w-4 animate-pulse' />
          </div>
          <div>
            <div class='bg-primary/5 rounded h-2 w-20 animate-pulse' />
          </div>
        </div>
      </div>
    {/each}
  {:then themes}
    {#if themes?.anime?.[0]?.animethemes?.length}
      {#each themes.anime[0].animethemes as theme (theme.id)}
        <div class='bg-neutral-950 rounded-md px-7 py-4 gap-4 flex flex-col text-xs'>
          <div class='flex h-8 items-center'>
            <div class='w-12'>
              {theme.type}
            </div>
            <div class='text-base font-bold'>
              {theme.song?.title} <span class='text-xs text-muted-foreground font-medium'>by</span> {theme.song?.artists?.map(({ name }) => name).join(', ')}
            </div>
          </div>
          {#each theme.animethemeentries ?? [] as entry (entry.id)}
            {@const url = entry.videos?.[entry.videos.length - 1]?.link}
            <div class='flex h-8 items-center text-muted-foreground'>
              <div class='w-12'>
                v{entry.version ?? 1}
              </div>
              <div>
                Episodes {entry.episodes}
              </div>
              {#if entry.videos?.length}
                <Button size='icon-sm' class='ml-auto font-bold rounded-full' on:click={() => playVideo(url)}><Play fill='currentColor' size={iconSizes['icon-sm']} /></Button>
              {/if}
            </div>
            {#if src === url}
              <video class='h-64 rounded-md self-center' controls autoplay {src} use:volume />
            {/if}
          {/each}
        </div>
      {/each}
    {/if}
  {/await}
</div>
