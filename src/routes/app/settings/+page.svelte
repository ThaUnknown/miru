<script lang='ts'>
  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { SingleCombo } from '$lib/components/ui/combobox'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import native from '$lib/modules/native'
  import { settings, languageCodes, subtitleResolutions } from '$lib/modules/settings'

  async function selectPlayer () {
    $settings.playerPath = await native.selectPlayer()
  }
</script>

<div class='space-y-3 pb-10 lg:max-w-4xl'>
  {#if ('queryLocalFonts' in self)}
    <div class='font-weight-bold text-xl font-bold'>Subtitle Settings</div>
    <SettingCard let:id title='Find Missing Subtitle Fonts' description="Automatically finds and loads fonts that are missing from a video's subtitles, using fonts installed on your OS.">
      <Switch {id} bind:checked={$settings.missingFont} />
    </SettingCard>
  {/if}

  <SettingCard let:id title='Fast Subtitle Rendering' description='Disables blur when rendering subtitles reducing lag. Will cause text and subtitle edges to appear sharper and in rare cases might break styling. Use this if you want better rendering speeds without sacrificing accuracy lower the render resolution limit.'>
    <Switch {id} bind:checked={$settings.disableSubtitleBlur} />
  </SettingCard>
  <SettingCard title='Subtitle Render Resolution Limit' description="Max resolution to render subtitles at. If your resolution is higher than this setting the subtitles will be upscaled lineary. This will GREATLY improve rendering speeds for complex typesetting for slower devices. It's best to lower this on mobile devices which often have high pixel density where their effective resolution might be ~1440p while having small screens and slow processors.">
    <SingleCombo bind:value={$settings.subtitleRenderHeight} items={subtitleResolutions} class='w-32 shrink-0 border-input border' />
  </SettingCard>

  <SettingCard class='md:flex-col md:items-start' title='Subtitle Dialogue Style Overrides' description={'Selectively override the default dialogue style for subtitles. This will not change the style of typesetting [Fancy 3D Signs and Songs].\n\nWarning: the heuristic used for deciding when to override the style is rather rough, and enabling this option can lead to incorrectly rendered subtitles.'}>
    <ToggleGroup.Root type='single' class='grid sm:grid-cols-2 gap-3' bind:value={$settings.subtitleStyle}>
      <ToggleGroup.Item value='none' class='h-auto aspect-video text-4xl px-0 relative'>
        <div class='absolute top-4 text-xl font-bold'>None</div>🚫
      </ToggleGroup.Item>
      <ToggleGroup.Item value='gandhisans' class='h-auto px-0 relative'>
        <div class='absolute top-4 text-xl font-bold'>Gandhi Sans Bold</div>
        <img src='/gandhisans.png' class='w-full' />
      </ToggleGroup.Item>
      <ToggleGroup.Item value='notosans' class='h-auto px-0 relative'>
        <div class='absolute top-4 text-xl font-bold'>Noto Sans Bold</div>
        <img src='/notosans.png' class='w-full' />
      </ToggleGroup.Item>
      <ToggleGroup.Item value='roboto' class='h-auto px-0 relative'>
        <div class='absolute top-4 text-xl font-bold'>Roboto Bold</div>
        <img src='/roboto.png' class='w-full' />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
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
  <SettingCard let:id title='Pause On Lost Visibility' description='Pauses/Resumes video playback when the app loses visibility.'>
    <Switch {id} bind:checked={$settings.playerPause} />
  </SettingCard>
  <SettingCard let:id title='PiP On Lost Visibility' description='Automatically enters Picture in Picture mode when the app loses visibility.'>
    <Switch {id} bind:checked={$settings.playerAutoPiP} />
  </SettingCard>
  <SettingCard let:id title='Auto-Complete Episodes' description='Automatically marks episodes as complete when you finish watching them. Requires Account login.'>
    <Switch {id} bind:checked={$settings.playerAutocomplete} />
  </SettingCard>
  <SettingCard let:id title='Deband Video' description='Reduces banding [compression artifacts] on dark and compressed videos. High performance impact. Recommended for seasonal web releases, not recommended for high quality blu-ray videos.'>
    <Switch {id} bind:checked={$settings.playerDeband} />
  </SettingCard>
  <SettingCard let:id title='Seek Duration' description='Seconds to skip forward or backward when using the seek buttons or keyboard shortcuts. Higher values might negatively impact buffering speeds.'>
    <div class='flex items-center relative scale-parent border border-input rounded-md'>
      <Input type='number' inputmode='numeric' pattern='[0-9]*.?[0-9]*' min='1' max='50' bind:value={$settings.playerSeek} {id} class='w-32 shrink-0 bg-background pr-12 border-0 no-scale' />
      <div class='shrink-0 absolute right-3 z-10 pointer-events-none text-sm leading-5'>sec</div>
    </div>
  </SettingCard>
  <SettingCard let:id title='Auto-Skip Intro/Outro' description='Attempt to automatically skip intro and outro. This WILL sometimes skip incorrect chapters, as some of the chapter data is community sourced.'>
    <Switch {id} bind:checked={$settings.playerSkip} />
  </SettingCard>
  <SettingCard let:id title='Auto-Skip Filler' description='Automatically skip filler episodes. This WILL skip ENTIRE episodes.'>
    <Switch {id} bind:checked={$settings.playerSkipFiller} />
  </SettingCard>

  <div class='font-weight-bold text-xl font-bold'>Interface Settings</div>
  <SettingCard let:id title='Minimal UI' description='Forces minimalistic player UI, hides controls.'>
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
