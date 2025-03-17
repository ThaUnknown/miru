<script lang='ts'>
  import { BannerImage } from '$lib/components/ui/banner'
  import { isMobile } from '$lib/utils'
  import { Sidebar } from '$lib/components/ui/sidebar'
  import SearchModal from '$lib/components/SearchModal.svelte'
</script>

<BannerImage class='absolute top-0 left-0' />
<SearchModal />
<div class='flex flex-row grow h-full overflow-hidden relative'>
  {#if !$isMobile}
    <Sidebar />
  {/if}
  <slot />
</div>
