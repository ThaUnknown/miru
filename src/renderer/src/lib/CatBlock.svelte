<script>
  import { set } from '@/lib/Settings.svelte'
  let block = false

  async function testConnection () {
    try {
      for (let i = 0; i < 2; ++i) {
        // fetch cat twice, sometimes it will go tru once if ISP is shitty
        await fetch(set.catURL)
      }
      block = false
    } catch (e) {
      console.error(e)
      block = true
    }
  }
  testConnection()

</script>

{#if block}
  <div class='w-full left-0 z-50 position-absolute content-wrapper bg-dark-light d-flex align-items-center justify-content-center flex-column'>
    <div>
      <h1 class='font-weight-bold'>Could not connect to Nyaa!</h1>
      <div class='font-size-16'>This happens either because Nyaa is down, or because your ISP blocks Nyaa, the latter being more likely.</div>
      <div class='font-size-16'>Most features of Miru will not function correctly without being able to connect to Nyaa.</div>
      <div class='font-size-16'>If you enable a VPN a restart might be required for it to take effect.</div>
      <!-- eslint-disable-next-line svelte/valid-compile -->
      <div class='font-size-16'>Visit <a class='text-primary pointer' on:click={() => { window.IPC.emit('open', 'https://thewiki.moe/tutorials/unblock/') }}>this guide</a> for a tutorial on how to bypass ISP blocks.</div>
      <div class='d-flex w-full mt-20 pt-20'>
        <button class='btn ml-auto mr-5' type='button' on:click={() => { block = false }}>I Understand</button>
        <button class='btn btn-primary mr-5' type='button' on:click={() => { window.IPC.emit('open', 'https://thewiki.moe/tutorials/unblock/') }}>Open Guide</button>
        <button class='btn btn-primary' type='button' on:click={testConnection}>Reconnect</button>
      </div>
    </div>
  </div>
{/if}
