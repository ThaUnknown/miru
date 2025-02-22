<script lang='ts'>
  import { Toaster } from '$lib/components/ui/sonner'
  import Online from '$lib/components/Online.svelte'
  import Menubar from '$lib/components/ui/menubar/menubar.svelte'
  import { Sidebar } from '$lib/components/ui/sidebar'
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'
  import '../../app.css'
  import '@fontsource-variable/nunito'
  import '$lib/modules/navigate'
  import { BannerImage } from '$lib/components/ui/banner'
  import { isMobile } from '$lib/utils'
  import Backplate from '$lib/components/Backplate.svelte'
  import SearchModal from '$lib/components/SearchModal.svelte'
</script>

<div class='root w-full h-full backface-hidden bg-black relative overflow-clip border-l-2 border-white' id='root'>
  <ProgressBar zIndex={100} />
  <Toaster />

  <Menubar />
  <Online />
  <BannerImage class='absolute top-0 left-0' />
  <SearchModal />
  <div class='flex flex-row grow h-full overflow-hidden relative'>
    {#if !$isMobile}
      <Sidebar />
    {/if}
    <slot />
  </div>
</div>
<Backplate />
