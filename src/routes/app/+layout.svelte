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
</script>

<BannerImage class='absolute top-0 left-0 -z-[1]' />
<SearchModal />
<div class='flex flex-row grow h-full overflow-clip group/fullscreen min-h-0' id='episodeListTarget'>
  <Sidebar>
    <Sidebarlist />
  </Sidebar>
  <Player />
  <slot />
</div>
