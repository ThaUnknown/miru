<script lang='ts'>
  import '../app.css'
  import '@fontsource-variable/nunito'
  import '@fontsource/geist-mono'
  import '$lib/modules/navigate'
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'
  import { toast } from 'svelte-sonner'

  import Backplate from '$lib/components/Backplate.svelte'
  import Online from '$lib/components/Online.svelte'
  import { Menubar } from '$lib/components/ui/menubar'
  import { Toaster } from '$lib/components/ui/sonner'
  import native from '$lib/modules/native'
  import { settings, SUPPORTS } from '$lib/modules/settings'

  let root: HTMLDivElement

  let updateProgress = 0

  native.updateProgress(progress => {
    updateProgress = progress
  })
  native.errors(error => {
    toast.error('Torrent Process Error!', { description: error?.stack ?? error?.message })
    console.error(error)
  })
</script>

<svelte:head>
  <meta name='viewport' content='width=device-width, initial-scale={SUPPORTS.isAndroid ? $settings.uiScale : 1}, user-scalable=0' />
</svelte:head>

<div class='w-full h-full flex flex-col backface-hidden bg-black relative overflow-clip md:border-l-2 [border-image:linear-gradient(to_bottom,white_var(--progress),#2dcf58_var(--progress))_1] preserve-3d' bind:this={root} id='root' style:--progress='{100 - updateProgress}%'>
  <ProgressBar zIndex={100} />
  <Toaster position='top-right' expand={true} />

  <Menubar />
  <Online />
  <slot />
</div>
<Backplate {root} />
