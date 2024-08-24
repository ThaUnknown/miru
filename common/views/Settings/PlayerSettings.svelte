<script>
  import { toast } from 'svelte-sonner'
  import FontSelect from 'simple-font-select'
  import SettingCard from './SettingCard.svelte'
  import { SUPPORTS } from '@/modules/support.js'
  import { click } from '@/modules/click.js'
  import IPC from '@/modules/ipc.js'
  import { Trash2 } from 'lucide-svelte'
  export let settings

  async function changeFont ({ detail }) {
    try {
      const blob = await detail.blob()
      await blob.arrayBuffer()
      settings.font = {
        name: detail.fullName,
        value: detail.postscriptName
      }
      settings.missingFont = true
    } catch (error) {
      console.warn(error)
      toast.error('File Error', {
        description: `${error.message}\n Try using a different font.`,
        duration: 8000
      })
    }
  }
  function removeFont () {
    settings.font = null
  }
  function handleExecutable () {
    IPC.emit('player')
  }
  $: if (!settings.missingFont) removeFont()
</script>

<h4 class='mb-10 font-weight-bold'>Subtitle Settings</h4>
{#if ('queryLocalFonts' in self)}
  <SettingCard title='Default Subtitle Font' description={"What font to use when the current loaded video doesn't provide or specify one.\nThis uses fonts installed on your OS."}>
    <div class='input-group w-400 mw-full'>
      <FontSelect class='form-control bg-dark w-300 mw-full' on:change={changeFont} value={settings.font?.name} />
      <div class='input-group-append'>
        <button type='button' use:click={() => removeFont()} class='btn btn-danger btn-square input-group-append px-5 d-flex align-items-center'><Trash2 size='1.8rem' /></button>
      </div>
    </div>
  </SettingCard>
  <SettingCard title='Find Missing Subtitle Fonts' description="Automatically finds and loads fonts that are missing from a video's subtitles.">
    <div class='custom-switch'>
      <input type='checkbox' id='player-missingFont' bind:checked={settings.missingFont} />
      <label for='player-missingFont'>{settings.missingFont ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
{/if}
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
    <option value='idn'>Indonesian</option>
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
    <option value='idn'>Indonesian</option>
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
<SettingCard title='Deband Video' description='Reduces banding on dark and compressed videos. High performance impact, not recommended for high quality videos.'>
  <div class='custom-switch'>
    <input type='checkbox' id='player-deband' bind:checked={settings.playerDeband} />
    <label for='player-deband'>{settings.playerDeband ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='Seek Duration' description='Seconds to skip forward or backward when using the seek buttons or keyboard shortcuts. Higher values might negatively impact buffering speeds.'>
  <div class='input-group w-100 mw-full'>
    <input type='number' inputmode='numeric' pattern={'[0-9]*'} bind:value={settings.playerSeek} min='1' max='50' class='form-control text-right bg-dark' />
    <div class='input-group-append'>
      <span class='input-group-text bg-dark'>sec</span>
    </div>
  </div>
</SettingCard>
<SettingCard title='Auto-Skip Intro/Outro' description='Attempt to automatically skip intro and outro. This WILL sometimes skip incorrect chapters, as some of the chapter data is community sourced.'>
  <div class='custom-switch'>
    <input type='checkbox' id='player-skip' bind:checked={settings.playerSkip} />
    <label for='player-skip'>{settings.playerSkip ? 'On' : 'Off'}</label>
  </div>
</SettingCard>

<h4 class='mb-10 font-weight-bold'>External Player Settings</h4>
<SettingCard title='Enable External Player' description='Tells Miru to open a custom user-picked external video player to play video, instead of using the built-in one.'>
  <div class='custom-switch'>
    <input type='checkbox' id='player-external-enabled' bind:checked={settings.enableExternal} />
    <label for='player-external-enabled'>{settings.enableExternal ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
{#if SUPPORTS.externalPlayer}
  <SettingCard title='External Video Player' description='Executable for an external video player. Make sure the player supports HTTP sources.'>
    <div
      class='input-group w-300 mw-full'>
      <div class='input-group-prepend'>
        <button type='button' use:click={handleExecutable} class='btn btn-primary input-group-append'>Select Executable</button>
      </div>
      <input type='url' class='form-control bg-dark' readonly value={settings.playerPath} />
    </div>
  </SettingCard>
{/if}
