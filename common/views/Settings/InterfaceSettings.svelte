<script>
  import { variables } from '@/modules/themes.js'
  import { click } from '@/modules/click.js'
  import HomeSections from './HomeSectionsSettings.svelte'
  import IPC from '@/modules/ipc.js'
  import SettingCard from './SettingCard.svelte'
  import { SUPPORTS } from '@/modules/support.js'
  import { Trash2 } from 'lucide-svelte'
  function updateAngle () {
    IPC.emit('angle', settings.value.angle)
  }
  export let settings
</script>

{#if SUPPORTS.discord}
  <h4 class='mb-10 font-weight-bold'>Rich Pressence Settings</h4>
  <SettingCard title='Show Details in Discord Rich Presence' description='Shows currently played anime and episode in Discord rich presence.'>
    <div class='custom-switch'>
      <input type='checkbox' id='rpc-details' bind:checked={settings.showDetailsInRPC} />
      <label for='rpc-details'>{settings.showDetailsInRPC ? 'On' : 'Off'}</label>
    </div>
  </SettingCard>
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
<SettingCard title='Card Type' description='What type of cards to display in menus.'>
  <select class='form-control bg-dark w-300 mw-full' bind:value={settings.cards}>
    <option value='small' selected>Small</option>
    <option value='full'>Full</option>
  </select>
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
