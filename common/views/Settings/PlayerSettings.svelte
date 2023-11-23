<script>
  import { toast } from 'svelte-sonner'
  import FontSelect from 'simple-font-select'
  import SettingCard from './SettingCard.svelte'
  export let settings

  async function changeFont ({ detail }) {
    try {
      const blob = await detail.blob()
      const data = await blob.arrayBuffer()
      settings.font = {
        name: detail.fullName,
        value: detail.postscriptName,
        data: [...new Uint8Array(data)]
      }
    } catch (error) {
      console.warn(error)
      toast.error('File Error', {
        description: `${error.message}\n Try using a different font.`,
        duration: 8000
      })
    }
  }
</script>

{#if ('queryLocalFonts' in self)}
  <h4 class='mb-10 font-weight-bold'>Subtitle Settings</h4>
  <SettingCard title='Default Subtitle Font' description={"What font to use when the current loaded video doesn't provide or specify one.\nThis uses fonts installed on your OS."}>
    <FontSelect class='form-control bg-dark w-300 mw-full' on:change={changeFont} value={settings.font?.name} />
  </SettingCard>
  <SettingCard title='Find Missing Subtitle Fonts' description="Automatically finds and loads fonts that are missing from a video's subtitles.">
    <div class='custom-switch'>
      <input type='checkbox' id='player-missingFont' bind:checked={settings.missingFont} />
      <label for='player-missingFont'>{settings.missingFont ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
  <SettingCard title='Fast Subtitle Rendering' description='Disables blur when rendering subtitles reducing lag. Will cause text and subtitle edges to appear sharper and in rare cases might break styling. If you want better rendering speeds without sacrificing accuracy lower the render resolution limit.'>
    <div class='custom-switch'>
      <input type='checkbox' id='player-sub-blur' bind:checked={settings.disableSubtitleBlur} />
      <label for='player-sub-blur'>{settings.disableSubtitleBlur ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
  <SettingCard title='Subtitle Render Resolution Limit' description="Max resolution to render subtitles at. If your resolution is higher than this setting the subtitles will be upscaled lineary. This will GREATLY improve rendering speeds for complex typesetting for slower devices. It's best to lower this on mobile devices which often have high pixel density where their effective resolution might be ~1440p while having small screens and slow processors.">
    <select class='form-control bg-dark w-300 mw-full' bind:value={settings.subtitleRenderHeight}>
      <option value='0' selected>None</option>
      <option value='1440'>1440p</option>
      <option value='1080'>1080p</option>
      <option value='720'>720p</option>
      <option value='480'>480p</option>
    </select>
  </SettingCard>
{/if}

<h4 class='mb-10 font-weight-bold'>Language Settings</h4>
<SettingCard title='Preferred Subtitle Language' description="What subtitle language to automatically select when a video is loaded if it exists. This won't find torrents with this language automatically. If not found defaults to English.">
  <select class='form-control bg-dark w-300 mw-full' bind:value={settings.subtitleLanguage}>
    <option value=''>None</option>
    <option value='eng' selected>English</option>
    <option value='jpn'>Japanese</option>
    <option value='chi'>Chinese</option>
    <option value='por'>Portuguese</option>
    <option value='spa'>Spanish</option>
    <option value='ger'>German</option>
    <option value='pol'>Polish</option>
    <option value='cze'>Czech</option>
    <option value='dan'>Danish</option>
    <option value='gre'>Greek</option>
    <option value='fin'>Finnish</option>
    <option value='fre'>French</option>
    <option value='hun'>Hungarian</option>
    <option value='ita'>Italian</option>
    <option value='kor'>Korean</option>
    <option value='dut'>Dutch</option>
    <option value='nor'>Norwegian</option>
    <option value='rum'>Romanian</option>
    <option value='rus'>Russian</option>
    <option value='slo'>Slovak</option>
    <option value='swe'>Swedish</option>
    <option value='ara'>Arabic</option>
  </select>
</SettingCard>
<SettingCard title='Preferred Audio Language' description="What audio language to automatically select when a video is loaded if it exists. This won't find torrents with this language automatically. If not found defaults to Japanese.">
  <select class='form-control bg-dark w-300 mw-full' bind:value={settings.audioLanguage}>
    <option value='eng'>English</option>
    <option value='jpn' selected>Japanese</option>
    <option value='chi'>Chinese</option>
    <option value='por'>Portuguese</option>
    <option value='spa'>Spanish</option>
    <option value='ger'>German</option>
    <option value='pol'>Polish</option>
    <option value='cze'>Czech</option>
    <option value='dan'>Danish</option>
    <option value='gre'>Greek</option>
    <option value='fin'>Finnish</option>
    <option value='fre'>French</option>
    <option value='hun'>Hungarian</option>
    <option value='ita'>Italian</option>
    <option value='kor'>Korean</option>
    <option value='dut'>Dutch</option>
    <option value='nor'>Norwegian</option>
    <option value='rum'>Romanian</option>
    <option value='rus'>Russian</option>
    <option value='slo'>Slovak</option>
    <option value='swe'>Swedish</option>
    <option value='ara'>Arabic</option>
  </select>
</SettingCard>

<h4 class='mb-10 font-weight-bold'>Playback Settings</h4>
<SettingCard title='Autoplay Next Episode' description='Automatically starts playing next episode when a video ends.'>
  <div class='custom-switch'>
    <input type='checkbox' id='player-autoplay' bind:checked={settings.playerAutoplay} />
    <label for='player-autoplay'>{settings.playerAutoplay ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='Pause On Lost Focus' description='Pauses/Resumes video playback when tabbing in/out of the app.'>
  <div class='custom-switch'>
    <input type='checkbox' id='player-pause' bind:checked={settings.playerPause} />
    <label for='player-pause'>{settings.playerPause ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='Auto-Complete Episodes' description='Automatically marks episodes as complete on AniList when you finish watching them. Requires AniList login.'>
  <div class='custom-switch'>
    <input type='checkbox' id='player-autocomplete' bind:checked={settings.playerAutocomplete} />
    <label for='player-autocomplete'>{settings.playerAutocomplete ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
