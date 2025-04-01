<script lang='ts'>
  import { EllipsisVertical } from 'lucide-svelte'
  import { tick } from 'svelte'
  import Keybinds from 'svelte-keybinds'

  import { normalizeTracks, type Chapter } from './util'

  import type { Writable } from 'simple-store-svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  import * as Dialog from '$lib/components/ui/dialog'
  import * as Tree from '$lib/components/ui/tree'
  import { Button } from '$lib/components/ui/button'
  import { cn, toTS } from '$lib/utils'

  export let wrapper: HTMLDivElement

  export let video: HTMLVideoElement

  export let selectAudio: (id: string) => void
  export let selectVideo: (id: string) => void
  export let fullscreen: () => void
  export let chapters: Chapter[]
  export let seekTo: (time: number) => void
  export let playbackRate: number

  let open = false

  let treeState: Writable<string[]>

  export async function openSubs () {
    open = true
    await tick()
    treeState.set(['subs'])
  }

  let className: HTMLAttributes<HTMLDivElement>['class'] = ''
  export { className as class }

  export let showKeybinds = false
  function close () {
    if (showKeybinds) {
      showKeybinds = false
    } else {
      open = false
    }
  }
</script>

<Dialog.Root portal={wrapper} bind:open>
  <Dialog.Trigger asChild let:builder>
    <Button class={cn('p-3 w-12 h-12', className)} variant='ghost' builders={[builder]}>
      <EllipsisVertical size='24px' class='p-[1px]' />
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class='absolute bg-transparent border-none p-0 shadow-none size-full overflow-hidden'>
    <div on:pointerdown|self={close} class='size-full flex justify-center items-center flex-col overflow-y-scroll text-[6px] lg:text-xs'>
      {#if showKeybinds}
        <div class='bg-black py-3 px-4 rounded-md text-sm lg:text-lg font-bold mb-4'>
          Drag and drop binds to change them
        </div>
        <Keybinds let:prop={item} autosave={true} clickable={true}>
          {#if item?.type}
            <div class='size-full flex justify-center p-1.5 lg:p-3' title={item.desc}>
              {#if item.icon}
                <svelte:component this={item.icon} size='2rem' class='h-full' fill={item.id === 'play_arrow' ? 'currentColor' : 'none'} />
              {/if}
            </div>
          {:else}
            <div class='size-full content-center text-center lg:text-lg' title={item?.desc}>{item?.id ?? ''}</div>
          {/if}
        </Keybinds>
      {:else}
        <Tree.Root bind:state={treeState}>
          <Tree.Item>
            <span slot='trigger'>Audio</span>
            <Tree.Sub>
              {#each Object.entries(normalizeTracks(video.audioTracks ?? [])) as [lang, tracks] (lang)}
                <Tree.Item>
                  <span slot='trigger' class='capitalize'>{lang}</span>
                  <Tree.Sub>
                    {#each tracks as track (track.id)}
                      <Tree.Item active={track.enabled} on:click={() => { selectAudio(track.id); open = false }}>
                        <span>{track.label}</span>
                      </Tree.Item>
                    {/each}
                  </Tree.Sub>
                </Tree.Item>
              {/each}
            </Tree.Sub>
          </Tree.Item>
          <Tree.Item>
            <span slot='trigger'>Video</span>
            <Tree.Sub>
              {#each Object.entries(normalizeTracks(video.videoTracks ?? [])) as [lang, tracks] (lang)}
                <Tree.Item>
                  <span slot='trigger' class='capitalize'>{lang}</span>
                  <Tree.Sub>
                    {#each tracks as track (track.id)}
                      <Tree.Item active={track.enabled} on:click={() => { selectVideo(track.id); open = false }}>
                        <span>{track.label}</span>
                      </Tree.Item>
                    {/each}
                  </Tree.Sub>
                </Tree.Item>
              {/each}
            </Tree.Sub>
          </Tree.Item>
          <Tree.Item id='subs'>
            <span slot='trigger'>Subtitles</span>
            <Tree.Sub>
              <Tree.Item>
                <span>Consulting</span>
              </Tree.Item>
              <Tree.Item>
                <span>Support</span>
              </Tree.Item>
            </Tree.Sub>
          </Tree.Item>
          <Tree.Item>
            <span slot='trigger'>Chapters</span>
            <Tree.Sub>
              {#each chapters as { text, start }, i (i)}
                <Tree.Item on:click={() => { seekTo(start); open = false }}>
                  <div class='flex justify-between w-full'>
                    <span>{text || '?'}</span>
                    <span class='text-muted-foreground'>{toTS(start || 0)}</span>
                  </div>
                </Tree.Item>
              {/each}
            </Tree.Sub>
          </Tree.Item>
          <Tree.Item>
            <span slot='trigger'>Playback Rate</span>
            <Tree.Sub>
              <Tree.Item on:click={() => { playbackRate = 0.5; open = false }}>
                <span>0.5x</span>
              </Tree.Item>
              <Tree.Item on:click={() => { playbackRate = 0.75; open = false }}>
                <span>0.75x</span>
              </Tree.Item>
              <Tree.Item on:click={() => { playbackRate = 1; open = false }}>
                <span>1x</span>
              </Tree.Item>
              <Tree.Item on:click={() => { playbackRate = 1.25; open = false }}>
                <span>1.25x</span>
              </Tree.Item>
              <Tree.Item on:click={() => { playbackRate = 1.5; open = false }}>
                <span>1.5x</span>
              </Tree.Item>
              <Tree.Item on:click={() => { playbackRate = 1.75; open = false }}>
                <span>1.75x</span>
              </Tree.Item>
              <Tree.Item on:click={() => { playbackRate = 2; open = false }}>
                <span>2x</span>
              </Tree.Item>
            </Tree.Sub>
          </Tree.Item>
          <Tree.Item on:click={() => (showKeybinds = !showKeybinds)}>
            Keybinds
          </Tree.Item>
          <Tree.Item on:click={fullscreen}>
            Fullscreen
          </Tree.Item>
        </Tree.Root>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
