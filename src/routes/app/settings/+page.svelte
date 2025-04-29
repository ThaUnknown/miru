<script lang='ts'>
  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { SingleCombo } from '$lib/components/ui/combobox'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import native from '$lib/modules/native'
  import { settings, languageCodes, subtitleResolutions } from '$lib/modules/settings'

  async function selectPlayer () {
    $settings.playerPath = await native.selectPlayer()
  }
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  {#if ('queryLocalFonts' in self)}
    <div class='font-weight-bold text-xl font-bold'>Subtitle Settings</div>
    <SettingCard let:id title='Find Missing Subtitle Fonts' description="Automatically finds and loads fonts that are missing from a video's subtitles.">
      <Switch {id} bind:checked={$settings.missingFont} />
    </SettingCard>
  {/if}

  <SettingCard let:id title='Fast Subtitle Rendering' description='Disables blur when rendering subtitles reducing lag. Will cause text and subtitle edges to appear sharper and in rare cases might break styling. If you want better rendering speeds without sacrificing accuracy lower the render resolution limit.'>
    <Switch {id} bind:checked={$settings.disableSubtitleBlur} />
  </SettingCard>
  <SettingCard title='Subtitle Render Resolution Limit' description="Max resolution to render subtitles at. If your resolution is higher than this setting the subtitles will be upscaled lineary. This will GREATLY improve rendering speeds for complex typesetting for slower devices. It's best to lower this on mobile devices which often have high pixel density where their effective resolution might be ~1440p while having small screens and slow processors.">
    <SingleCombo bind:value={$settings.subtitleRenderHeight} items={subtitleResolutions} class='w-32 shrink-0 border-input border' />
  </SettingCard>

  <div class='font-weight-bold text-xl font-bold'>Language Settings</div>
  <SettingCard title='Preferred Subtitle Language' description="What subtitle language to automatically select when a video is loaded if it exists. This won't find torrents with this language automatically. If not found defaults to English.">
    <SingleCombo bind:value={$settings.subtitleLanguage} items={languageCodes} class='w-36 shrink-0 border-input border' />
  </SettingCard>
  <SettingCard title='Preferred Audio Language' description="What audio language to automatically select when a video is loaded if it exists. This won't find torrents with this language automatically. If not found defaults to Japanese.">
    <SingleCombo bind:value={$settings.audioLanguage} items={languageCodes} class='w-36 shrink-0 border-input border' />
  </SettingCard>

  <div class='font-weight-bold text-xl font-bold'>Playback Settings</div>
  <SettingCard let:id title='Auto-Play Next Episode' description='Automatically starts playing next episode when a video ends.'>
    <Switch {id} bind:checked={$settings.playerAutoplay} />
  </SettingCard>
  <SettingCard let:id title='Pause On Lost Visibility' description='Pauses/Resumes video playback when the app looses visibility.'>
    <Switch {id} bind:checked={$settings.playerPause} />
  </SettingCard>
  <SettingCard let:id title='PiP On Lost Visibility' description='Automatically enters Picture in Picture mode when the app looses visibility.'>
    <Switch {id} bind:checked={$settings.playerAutoPiP} />
  </SettingCard>
  <SettingCard let:id title='Auto-Complete Episodes' description='Automatically marks episodes as complete when you finish watching them. Requires Account login.'>
    <Switch {id} bind:checked={$settings.playerAutocomplete} />
  </SettingCard>
  <SettingCard let:id title='Deband Video' description='Reduces banding on dark and compressed videos. High performance impact, not recommended for high quality videos.'>
    <Switch {id} bind:checked={$settings.playerDeband} />
  </SettingCard>
  <SettingCard let:id title='Seek Duration' description='Seconds to skip forward or backward when using the seek buttons or keyboard shortcuts. Higher values might negatively impact buffering speeds.'>
    <Input type='number' inputmode='numeric' pattern='[0-9]*.?[0-9]*' min='1' max='50' bind:value={$settings.playerSeek} {id} class='w-32 shrink-0 bg-background' />
  </SettingCard>
  <SettingCard let:id title='Auto-Skip Intro/Outro' description='Attempt to automatically skip intro and outro. This WILL sometimes skip incorrect chapters, as some of the chapter data is community sourced.'>
    <Switch {id} bind:checked={$settings.playerSkip} />
  </SettingCard>
  <SettingCard let:id title='Auto-Skip Filler' description='Automatically skip filler episodes. This WILL skip ENTIRE episodes.'>
    <Switch {id} bind:checked={$settings.playerSkipFiller} />
  </SettingCard>

  <div class='font-weight-bold text-xl font-bold'>Interface Settings</div>
  <SettingCard let:id title='Minimal UI' description='Forces minimalistic UI, hides controls.'>
    <Switch {id} bind:checked={$settings.minimalPlayerUI} />
  </SettingCard>
  <div class='font-weight-bold text-xl font-bold'>External Player Settings</div>
  <SettingCard let:id title='Enable External Player' description='Opens a custom user-picked external video player to play video, instead of using the built-in one.'>
    <Switch {id} bind:checked={$settings.enableExternal} />
  </SettingCard>
  <SettingCard let:id title='External Video Player' description='Executable for an external video player. Make sure the player supports HTTP sources.'>
    <div class='flex'>
      <Input type='url' bind:value={$settings.playerPath} readonly {id} class='w-32 shrink-0 bg-background rounded-r-none pointer-events-none' />
      <Button class='rounded-l-none font-bold' on:click={selectPlayer} variant='secondary'>Select</Button>
    </div>
  </SettingCard>
</div>
