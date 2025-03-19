<script lang='ts'>
  import { Extensions } from '$lib/components/ui/extensions'
  import { SingleCombo } from '$lib/components/ui/combobox'
  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Switch } from '$lib/components/ui/switch'
  import { lookupPreferences, settings, videoResolutions } from '$lib/modules/settings'
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  <div class='font-weight-bold text-xl font-bold'>Lookup Settings</div>
  <SettingCard title='Torrent Quality' description="What quality to use when trying to find torrents. None might rarely find less results than specific qualities. This doesn't exclude other qualities from being found like 4K or weird DVD resolutions. Non-1080p resolutions might not be available for all shows, or find way less results.">
    <SingleCombo bind:value={$settings.searchQuality} items={videoResolutions} class='w-32 shrink-0 border-input border' />
  </SettingCard>
  <SettingCard let:id title='Auto-Select Torrents' description='Automatically selects torrents based on quality and amount of seeders. Disable this to have more precise control over played torrents.'>
    <Switch {id} bind:checked={$settings.searchAutoSelect} />
  </SettingCard>
  <SettingCard title='Lookup Preference' description='What to prioritize when looking for and sorting results. Quality will focus on the best quality available which often means big file sizes, Size will focus on the smallest file size available, and Availability will pick results with the most peers regardless of size and quality.'>
    <SingleCombo bind:value={$settings.lookupPreference} items={lookupPreferences} class='w-32 shrink-0 border-input border' />
  </SettingCard>

  <div class='font-weight-bold text-xl font-bold'>Extension Settings</div>
  <Extensions />
</div>
