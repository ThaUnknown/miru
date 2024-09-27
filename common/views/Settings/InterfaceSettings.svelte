<script>
  import { variables } from '@/modules/themes.js'
  import { click } from '@/modules/click.js'
  import HomeSections from './HomeSectionsSettings.svelte'
  import IPC from '@/modules/ipc.js'
  import SettingCard from './SettingCard.svelte'
  import { SUPPORTS } from '@/modules/support.js'
  import { Trash2 } from 'lucide-svelte'
  import AudioLabel from '@/views/ViewAnime/AudioLabel.svelte'
  import Helper from "@/modules/helper.js"
  function updateAngle () {
    IPC.emit('angle', settings.value.angle)
  }
  export let settings
</script>

{#if SUPPORTS.discord}
  <h4 class='mb-10 font-weight-bold'>Rich Presence Settings</h4>
  <SettingCard title='Discord Rich Presence' description='Enables the use of Discord rich presence to display app activity.'>
    <div class='custom-switch'>
      <input type='checkbox' id='rpc-enabled' bind:checked={settings.enableRPC} />
      <label for='rpc-enabled'>{settings.enableRPC ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
  {#if settings.enableRPC}
    <SettingCard title='Show Details in Discord Rich Presence' description='Shows currently played anime and episode in Discord rich presence.'>
      <div class='custom-switch'>
        <input type='checkbox' id='rpc-details' bind:checked={settings.showDetailsInRPC} />
        <label for='rpc-details'>{settings.showDetailsInRPC ? 'On' : 'Off'}</label>
      </div>
    </SettingCard>
  {/if}
{/if}

<h4 class='mb-10 font-weight-bold'>Interface Settings</h4>
<SettingCard title='Enable Smooth Scrolling' description='Enables smooth scrolling for vertical containers. Turning this off might remove jitter when scrolling on devices without a GPU.'>
  <div class='custom-switch'>
    <input type='checkbox' id='smooth-scroll' bind:checked={settings.smoothScroll} />
    <label for='smooth-scroll'>{settings.smoothScroll ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='Enable Sidebar Animation' description='Enables the sidebar expand hover animation.'>
  <div class='custom-switch'>
    <input type='checkbox' id='disable-sidebar' bind:checked={settings.expandingSidebar} />
    <label for='disable-sidebar'>{settings.expandingSidebar ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
<SettingCard title='CSS Variables' description='Used for custom themes. Can change colors, sizes, spacing and more. Supports only variables. Best way to discover variables is to use the built-in devtools via Ctrl+Shift+I or F12.'>
  <textarea class='form-control w-500 mw-full bg-dark' placeholder='--accent-color: #e5204c;' bind:value={$variables} />
</SettingCard>
{#if !Helper.isAniAuth()}
  <SettingCard title='Preferred Title Language' description='What title language to automatically select when displaying the title of an anime.'>
    <select class='form-control bg-dark w-300 mw-full' bind:value={settings.titleLang}>
      <option value='romaji' selected>Japanese</option>
      <option value='english'>English</option>
    </select>
  </SettingCard>
{/if}
<SettingCard title='Card Type' description='What type of cards to display in menus.'>
  <select class='form-control bg-dark w-300 mw-full' bind:value={settings.cards}>
    <option value='small' selected>Small</option>
    <option value='full'>Full</option>
  </select>
</SettingCard>
<SettingCard title='Card Audio' description={'If the dub or sub icon should be shown on the cards in the menu.\nThis will show one of three simple icons which are previewed as follows:'}>
  <AudioLabel example={true}/>
  <div class='custom-switch'>
    <input type='checkbox' id='card-audio' bind:checked={settings.cardAudio} />
    <label for='card-audio'>{settings.cardAudio ? 'On' : 'Off'}</label>
  </div>
</SettingCard>
{#if SUPPORTS.angle}
  <h4 class='mb-10 font-weight-bold'>Rendering Settings</h4>
  <SettingCard title='ANGLE Backend' description="What ANGLE backend to use for rendering. DON'T CHANGE WITHOUT REASON! On some Windows machines D3D9 might help with flicker. Changing this setting to something your device doesn't support might prevent Miru from opening which will require a full reinstall. While Vulkan is an available option it might not be fully supported on Linux.">
    <select class='form-control bg-dark w-300 mw-full' bind:value={settings.angle} on:change={updateAngle}>
      <option value='default' selected>Default</option>
      <option value='d3d9'>D3D9</option>
      <option value='d3d11'>D3D11</option>
      <option value='warp'>Warp [Software D3D11]</option>
      <option value='gl'>GL</option>
      <option value='gles'>GLES</option>
      <option value='swiftshader'>SwiftShader</option>
      <option value='vulkan'>Vulkan</option>
      <option value='metal'>Metal</option>
    </select>
  </SettingCard>
{/if}

<h4 class='mb-10 font-weight-bold'>Home Screen Settings</h4>
{#if Helper.isAuthorized()}
  <SettingCard title='Hide My Anime' description={'The anime on your Watching, Rewatching, Completed, and Dropped list will automatically be hidden from the default sections, this excludes manually added RSS feeds and user specific feeds.'}>
    <div class='custom-switch'>
      <input type='checkbox' id='hide-my-anime' bind:checked={settings.hideMyAnime} />
      <label for='hide-my-anime'>{settings.hideMyAnime ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
{/if}
<SettingCard title='RSS Feeds' description={'RSS feeds to display on the home screen. This needs to be a CORS enabled URL to a Nyaa or Tosho like RSS feed which cotains either an "infoHash" or "enclosure" tag.\nThis only shows the releases on the home screen, it doesn\'t automatically download the content.\nSince the feeds only provide the name of the file, Miru might not always detect the anime correctly!\nSome presets for popular groups are already provided as an example, custom feeds require the FULL URL.'}>
  <div>
    {#each settings.rssFeedsNew as _, i}
      <div class='input-group mb-10 w-500 mw-full'>
        <input type='text' class='form-control w-150 mw-full bg-dark flex-reset' placeholder='New Releases' autocomplete='off' bind:value={settings.rssFeedsNew[i][0]} />
        <input id='rss-feed-{i}' type='text' list='rss-feed-list-{i}' class='w-400 form-control mw-full bg-dark' placeholder={settings.toshoURL + 'rss2?qx=1&q="[SubsPlease] "'} autocomplete='off' bind:value={settings.rssFeedsNew[i][1]} />
        <datalist id='rss-feed-list-{i}'>
          <option value='SubsPlease'>{settings.toshoURL + 'rss2?qx=1&q="[SubsPlease] "'}</option>
          <option value='Erai-raws [Multi-Sub]'>{settings.toshoURL + 'rss2?qx=1&q="[Erai-raws] "'}</option>
          <option value='Yameii [Dubbed]'>{settings.toshoURL + 'rss2?qx=1&q="[Yameii] "'}</option>
          <option value='Judas [Small Size]'>{settings.toshoURL + 'rss2?qx=1&q="[Judas] "'}</option>
        </datalist>
        <div class='input-group-append'>
          <button type='button' use:click={() => { settings.rssFeedsNew.splice(i, 1); settings.rssFeedsNew = settings.rssFeedsNew }} class='btn btn-danger btn-square input-group-append px-5 d-flex align-items-center'><Trash2 size='1.8rem' /></button>
        </div>
      </div>
    {/each}
    <button type='button' use:click={() => { settings.rssFeedsNew[settings.rssFeedsNew.length] = ['New Releases', null] }} class='btn btn-primary mb-10'>Add Feed</button>
  </div>
</SettingCard>
<SettingCard title='Sections And Order' description="Sections and their order on the home screen, if you want more RSS feeds to show up here, create them first in the RSS feed list. Adding many multiple normal lists doesn't impact performance, but adding a lot of RSS feeds will impact app startup times. Drag/drop these sections to re-order them.">
  <div class='position-relative'>
    <HomeSections bind:homeSections={settings.homeSections} />
  </div>
</SettingCard>

<style>
  textarea {
    min-height: 6.6rem;
  }
</style>
