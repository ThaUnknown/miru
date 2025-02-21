<script lang='ts'>
  import * as Dialog from '$lib/components/ui/dialog'
  import * as Tree from '$lib/components/ui/tree'
  import { Button } from '$lib/components/ui/button'
  import { EllipsisVertical } from 'lucide-svelte'
  import { normalizeTracks } from './util'
  import type { Writable } from 'simple-store-svelte'
  import { tick } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  export let wrapper: HTMLDivElement

  export let video: HTMLVideoElement

  export let selectAudio: (id: string) => void
  export let selectVideo: (id: string) => void

  let open = false

  let treeState: Writable<string[]>

  export async function openSubs () {
    open = true
    await tick()
    treeState.set(['subs'])
  }

  let className: HTMLAttributes<HTMLDivElement>['class'] = ''
  export { className as class }
</script>

<Dialog.Root portal={wrapper} bind:open>
  <Dialog.Trigger asChild let:builder>
    <Button class={cn('p-3 w-12 h-12', className)} variant='ghost' builders={[builder]}>
      <EllipsisVertical size='24px' class='p-[1px]' />
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class='absolute bg-transparent border-none p-0 shadow-none h-full w-full overflow-hidden'>
    <div on:pointerdown|self={() => { open = false }} class='h-full flex w-full justify-center items-center overflow-y-scroll'>
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
      </Tree.Root>
    </div>
  </Dialog.Content>
</Dialog.Root>
