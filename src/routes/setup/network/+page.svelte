<script lang='ts' context='module'>
  import SpeedTest from '@cloudflare/speedtest'

  import type { Checks } from '../Footer.svelte'

  import { fastPrettyBits } from '$lib/utils'

  const speedTest = new SpeedTest({
    autoStart: false,
    measurements: [{
      type: 'download',
      bytes: 2.5e7,
      count: 4
    }]
  })

  const downloadBandwidthCheck: Checks = {
    promise: new Promise(resolve => {
      speedTest.onFinish = res => {
        const bandwidth = res.getDownloadBandwidth() ?? 0 // bits
        if (bandwidth < 1.5e+7) resolve({ status: 'error', text: `Download speed is ${fastPrettyBits(bandwidth)}/s, at least 15Mb/s download is required to stream video real-time.` })
        if (bandwidth < 2.5e+7) resolve({ status: 'warning', text: `Download speed is ${fastPrettyBits(bandwidth)}/s, 25Mb/s download is recommended.` })
        resolve({ status: 'success', text: `Download speed is ${fastPrettyBits(bandwidth)}/s.` })
      }
    }),
    title: 'Network Speed',
    pending: 'Checking network speed...'
  }
</script>

<script lang='ts'>
  import CircleHelp from 'lucide-svelte/icons/circle-help'
  import { persisted } from 'svelte-persisted-store'

  import Footer from '../Footer.svelte'
  import Progress from '../Progress.svelte'

  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import native from '$lib/modules/native'
  import { dragScroll } from '$lib/modules/navigate'
  import { settings, SUPPORTS } from '$lib/modules/settings'

  const hasForwarding = persisted('torrent-port-forwarding', false)

  if (!speedTest.isRunning) speedTest.play()

  async function checkPortAvailability (port: number): Checks['promise'] {
    const res = await native.checkIncomingConnections(port)
    $hasForwarding = res
    if (res) return { status: 'success', text: 'Port forwarding is available.' }
    return { status: 'error', text: 'Not available. Peer discovery will suffer. Streaming old, poorly seeded anime might be impossible.', slot: 'port' }
  }

  $: port = $settings.torrentPort

  $: checks = [downloadBandwidthCheck, {
    promise: checkPortAvailability(port),
    title: 'Port Forwarding',
    pending: 'Checking port forwarding availability...'
  }]
</script>

<Progress step={1} />

<div class='space-y-3 lg:max-w-4xl pt-5 h-full overflow-y-auto' use:dragScroll>
  <SettingCard class='bg-transparent' let:id title='Streamed Download' description="Only downloads the single file that's currently being watched, instead of downloading an entire batch of episodes. Saves bandwidth and reduces strain on the peer swarm.">
    <Switch {id} bind:checked={$settings.torrentStreamedDownload} />
  </SettingCard>
  <SettingCard class='bg-transparent' let:id title='Transfer Speed Limit' description='Download/Upload speed limit for torrents, higher values increase CPU usage, and values higher than your storage write speeds will quickly fill up RAM.'>
    <div class='flex items-center relative scale-parent border border-input rounded-md'>
      <Input type='number' inputmode='numeric' pattern='[0-9]*.?[0-9]*' min='1' max='50' step='0.1' bind:value={$settings.torrentSpeed} {id} class='w-32 shrink-0 bg-background pr-12 border-0 no-scale' />
      <div class='shrink-0 absolute right-3 z-10 pointer-events-none text-sm leading-5'>Mb/s</div>
    </div>
  </SettingCard>
  <SettingCard class='bg-transparent' let:id title='Max Number of Connections' description='Number of peers per torrent. Higher values will increase download speeds but might quickly fill up available ports if your ISP limits the maximum allowed number of open connections.'>
    <Input type='number' inputmode='numeric' pattern='[0-9]*' min='1' max='512' bind:value={$settings.maxConns} {id} class='w-32 shrink-0 bg-background' />
  </SettingCard>
  <SettingCard class='bg-transparent' let:id title='Forwarded Torrent Port' description='Forwarded port used for incoming torrent connections. 0 automatically finds an open unused port. Change this to a specific port if your VPN exposes only a specific port.'>
    <Input type='number' inputmode='numeric' pattern='[0-9]*' min='0' max='65536' bind:value={$settings.torrentPort} {id} class='w-32 shrink-0 bg-background' />
  </SettingCard>
  {#if !SUPPORTS.isAndroid}
    <SettingCard class='bg-transparent' let:id title='Use DNS Over HTTPS' description='Enables DNS Over HTTPS, useful if your ISP blocks certain domains.'>
      <Switch {id} bind:checked={$settings.enableDoH} />
    </SettingCard>
    <SettingCard class='bg-transparent' let:id title='DNS Over HTTPS URL' description='What URL to use for querying DNS Over HTTPS.'>
      <Input type='url' bind:value={$settings.doHURL} {id} class='w-80 shrink-0 bg-background' />
    </SettingCard>
  {/if}
</div>

<Footer step={1} {checks}>
  <div class='contents' on:click={() => native.openURL('https://thewiki.moe/getting-started/torrenting/#port-forwarding')}>
    <CircleHelp class='size-4 ml-2 shrink-0 inline cursor-pointer' />
  </div>
</Footer>
