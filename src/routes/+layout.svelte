<script lang='ts'>
  import '../app.css'
  import '@fontsource-variable/nunito'
  import '$lib/modules/navigate'
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'

  import Backplate from '$lib/components/Backplate.svelte'
  import { Menubar } from '$lib/components/ui/menubar'
  import { Toaster } from '$lib/components/ui/sonner'
  import Online from '$lib/components/Online.svelte'

  let root: HTMLDivElement
</script>

<div class='w-full h-full backface-hidden bg-black relative overflow-clip border-l-2 border-white preserve-3d' bind:this={root} id='root'>
  <ProgressBar zIndex={100} />
  <Toaster />

  <Menubar />
  <Online />
  <slot />
</div>
<Backplate {root} />
