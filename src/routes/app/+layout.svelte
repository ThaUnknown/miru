<script lang='ts'>
  import { BannerImage } from '$lib/components/ui/banner'
  import { Sidebar } from '$lib/components/ui/sidebar'
  import SearchModal from '$lib/components/SearchModal.svelte'
  import Sidebarlist from '$lib/components/ui/sidebar/sidebarlist.svelte'
  import { Player } from '$lib/components/ui/player'
</script>

<BannerImage class='absolute top-0 left-0' />
<SearchModal />
<div class='flex flex-row grow h-full overflow-hidden relative'>
  <Sidebar>
    <Sidebarlist />
  </Sidebar>
  <Player />
  <slot />
</div>
