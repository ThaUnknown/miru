<script lang='ts'>
  import '../app.css'
  import '@fontsource-variable/nunito'
  import '$lib/modules/navigate'
  import Backplate from '$lib/components/Backplate.svelte'
  import { Menubar } from '$lib/components/ui/menubar'
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'
  import { Toaster } from '$lib/components/ui/sonner'
  import Online from '$lib/components/Online.svelte'
</script>

<div class='root w-full h-full backface-hidden bg-black relative overflow-clip border-l-2 border-white' id='root'>
  <ProgressBar zIndex={100} />
  <Toaster />

  <Menubar />
  <Online />
  <slot />
</div>
<Backplate />
