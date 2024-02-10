<script context='module'>
  import { click } from '@/modules/click.js'
  import { toast } from 'svelte-sonner'
  import { resetSettings } from '@/modules/settings.js'
  import IPC from '@/modules/ipc.js'
  import { SUPPORTS } from '@/modules/support.js'

  async function importSettings () {
    localStorage.setItem('settings', await navigator.clipboard.readText())
    location.reload()
  }
  function exportSettings () {
    navigator.clipboard.writeText(localStorage.getItem('settings'))
    toast('Copied to clipboard', {
      description: 'Copied settings to clipboard',
      duration: 5000
    })
  }
  function restoreSettigs () {
    resetSettings()
    location.reload()
  }
  function checkUpdate () {
    IPC.updater.checkForUpdates()
  }
  setInterval(checkUpdate, 1200000)
</script>
<div class='d-inline-flex flex-column'>
  <button
    use:click={importSettings}
    class='btn btn-primary mx-20 mt-10'
    type='button'>
    Import Settings From Clipboard
  </button>
  <button
    use:click={exportSettings}
    class='btn btn-primary mx-20 mt-10'
    type='button'>
    Export Settings To Clipboard
  </button>
  {#if SUPPORTS.update}
    <button
      use:click={checkUpdate}
      class='btn btn-primary mx-20 mt-10'
      type='button'>
      Check For Updates
    </button>
  {/if}
  <button
    use:click={restoreSettigs}
    class='btn btn-danger mx-20 mt-10'
    type='button'
    data-toggle='tooltip'
    data-placement='top'
    data-title='Restores All Settings Back To Their Recommended Defaults'>
    Restore Default Settings
  </button>
</div>
