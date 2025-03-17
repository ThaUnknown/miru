<script lang='ts'>
  import Footer, { type Checks } from '../Footer.svelte'
  import Progress from '../Progress.svelte'
  import { Extensions } from '$lib/components/ui/extensions'
  import { saved, options } from '$lib/modules/extensions'
  import type { ExtensionConfig } from 'hayase-extensions'

  function checkExtensions (svd: Record<string, ExtensionConfig>, opts: Record<string, {
    options: Record<string, string | number | boolean | undefined>
    enabled: boolean
  }>): Checks['promise'] {
    return new Promise((resolve) => {
      const enabled = Object.values(opts).filter(({ enabled }) => enabled).length
      const installed = Object.keys(svd).length
      if (enabled && installed) {
        resolve({ status: 'success', text: 'At least 1 extension is enabled.' })
      } else if (installed) {
        resolve({ status: 'warning', text: 'At least 1 extension is installed, it\'s recommended to enable it.' })
      }
    })
  }

  let checks: Checks[]
  $: checks = [{
    promise: checkExtensions($saved, $options),
    title: 'Extensions Required',
    pending: 'Waiting for at least one extension to be installed...'
  }]
</script>

<Progress step={2} />

<div class='space-y-3 lg:max-w-4xl h-full overflow-y-auto w-full px-6 py-8'>
  <Extensions />
</div>

<Footer step={2} {checks} />
