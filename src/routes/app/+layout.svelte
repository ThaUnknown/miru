<script lang='ts'>
  import { goto } from '$app/navigation'
  import SearchModal from '$lib/components/SearchModal.svelte'
  import { BannerImage } from '$lib/components/ui/banner'
  import { Player } from '$lib/components/ui/player'
  import { Sidebar } from '$lib/components/ui/sidebar'
  import Sidebarlist from '$lib/components/ui/sidebar/sidebarlist.svelte'
  import native from '$lib/modules/native'

  const NAVIGATE_TARGETS = {
    schedule: 'schedule',
    anime: 'anime',
    w2g: 'w2g'
  } as const

  native.navigate(({ target, value }) => {
    if (!(target in NAVIGATE_TARGETS)) return

    const targetValue = NAVIGATE_TARGETS[target as keyof typeof NAVIGATE_TARGETS]
    goto(`/app/${targetValue}/${value ?? ''}`)
  })

  const imageRx = /\.(jpeg|jpg|gif|png|webp)/i

  const w2gRx = /hayase(?:(?:\.watch)|(?::\/))\/w2g\/(.+)/

  async function handleTransfer (e: { dataTransfer?: DataTransfer | null, clipboardData?: DataTransfer | null } & Event) {
    e.preventDefault()
    const promises = [...(e.dataTransfer ?? e.clipboardData)!.items].map(item => {
      const type = item.type
      return new Promise<File | { text: string, type: string }>(resolve => item.kind === 'string' ? item.getAsString(text => resolve({ text, type })) : resolve(item.getAsFile()!))
    })

    for (const file of await Promise.all(promises)) {
      if (file instanceof Blob) {
        if (file.type.startsWith('image') || imageRx.test(file.name)) {
          goto('/app/search', { state: { image: file } })
        }
      } else if (file.type === 'text/plain') {
        if (imageRx.test(file.text)) {
          goto('/app/search', { state: { image: file.text } })
        } else if (w2gRx.test(file.text)) {
          const match = file.text.match(w2gRx)
          if (match?.[1])goto('/app/w2g/' + match[1])
        }
      }
    }
  }
</script>

<svelte:window on:dragover|preventDefault on:drop={handleTransfer} on:paste={handleTransfer} />

<BannerImage class='absolute top-0 left-0 -z-[1]' />
<SearchModal />
<div class='flex flex-row grow h-full overflow-clip group/fullscreen min-h-0' id='episodeListTarget'>
  <Sidebar>
    <Sidebarlist />
  </Sidebar>
  <Player />
  <slot />
</div>
