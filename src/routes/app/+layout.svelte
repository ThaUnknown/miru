<script lang='ts'>
  import SearchModal from '$lib/components/SearchModal.svelte'
  import { BannerImage } from '$lib/components/ui/banner'
  import { Player } from '$lib/components/ui/player'
  import { Sidebar } from '$lib/components/ui/sidebar'
  import Sidebarlist from '$lib/components/ui/sidebar/sidebarlist.svelte'
</script>

<BannerImage class='absolute top-0 left-0 -z-[1]' />
<SearchModal />
<div class='flex flex-row grow h-full overflow-clip'>
  <Sidebar>
    <Sidebarlist />
  </Sidebar>
  <Player />
  <slot />
</div>
