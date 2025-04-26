<script lang='ts'>
  import '../app.css'
  import '@fontsource-variable/nunito'
  import '$lib/modules/navigate'
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'

  import Backplate from '$lib/components/Backplate.svelte'
  import Online from '$lib/components/Online.svelte'
  import { Menubar } from '$lib/components/ui/menubar'
  import { Toaster } from '$lib/components/ui/sonner'
  import native from '$lib/modules/native'

  let root: HTMLDivElement

  let updateProgress = 0

  native.updateProgress(progress => {
    updateProgress = progress
  })
</script>

<div class='w-full h-full backface-hidden bg-black relative overflow-clip border-l-2 [border-image:linear-gradient(to_bottom,white_var(--progress),#2dcf58_var(--progress))_1] preserve-3d' bind:this={root} id='root' style:--progress='{100 - updateProgress}%'>
  <ProgressBar zIndex={100} />
  <Toaster />

  <Menubar />
  <Online />
  <slot />
</div>
<Backplate {root} />
