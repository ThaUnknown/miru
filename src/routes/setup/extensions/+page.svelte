<script lang='ts'>
  import Footer, { type Checks } from '../Footer.svelte'
  import Progress from '../Progress.svelte'
  import { Extensions } from '$lib/components/ui/extensions'
  import { saved, options } from '$lib/modules/extensions'
  import type { ExtensionConfig } from 'hayase-extensions'
  import SettingCard from '$lib/components/SettingCard.svelte'
  import { SingleCombo } from '$lib/components/ui/combobox'
  import { lookupPreferences, settings } from '$lib/modules/settings'

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

<div class='space-y-3 lg:max-w-4xl h-full overflow-y-auto w-full py-8'>
  <SettingCard title='Lookup Preference' description='What to prioritize when looking for and sorting results. Quality will focus on the best quality available which often means big file sizes, Size will focus on the smallest file size available, and Availability will pick results with the most peers regardless of size and quality.'>
    <SingleCombo bind:value={$settings.lookupPreference} items={lookupPreferences} class='w-32 shrink-0 border-input border' />
  </SettingCard>
  <div class='px-6'>
    <Extensions />
  </div>

</div>

<Footer step={2} {checks} />
