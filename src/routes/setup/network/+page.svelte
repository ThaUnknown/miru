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
        const bandwidth = res.getDownloadBandwidth() ?? 0 // bytes
        if (bandwidth < 1.875e6) resolve({ status: 'error', text: `Download speed is ${fastPrettyBits(bandwidth)}/s, at least 15Mb/s download is required to stream video real-time.` })
        if (bandwidth < 3.125e6) resolve({ status: 'warning', text: `Download speed is ${fastPrettyBits(bandwidth)}/s, 25Mb/s download is recommended.` })
        resolve({ status: 'success', text: `Download speed is ${fastPrettyBits(bandwidth)}/s.` })
      }
    }),
    title: 'Network Speed',
    pending: 'Checking network speed...'
  }
</script>

<script lang='ts'>
  import Footer from '../Footer.svelte'
  import Progress from '../Progress.svelte'

  import SettingCard from '$lib/components/SettingCard.svelte'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import native from '$lib/modules/native'
  import { dragScroll } from '$lib/modules/navigate'
  import { settings } from '$lib/modules/settings'

  if (!speedTest.isRunning) speedTest.play()

  async function checkPortAvailability (port: number): Checks['promise'] {
    const res = await native.checkIncomingConnections(port)
    if (res) return { status: 'success', text: 'Port forwarding is available.' }
    return { status: 'error', text: 'Port forwarding is not available. Peer discovery will suffer.' }
  }

  $: checks = [downloadBandwidthCheck, {
    promise: checkPortAvailability($settings.torrentPort),
    title: 'Port Accessibility',
    pending: 'Checking port forwarding...'
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
  <SettingCard class='bg-transparent' let:id title='Torrent Port' description='Port used for Torrent connections. 0 is automatic. Change this to a specific port if your VPN exposes a specific port only.'>
    <Input type='number' inputmode='numeric' pattern='[0-9]*' min='0' max='65536' bind:value={$settings.torrentPort} {id} class='w-32 shrink-0 bg-background' />
  </SettingCard>
</div>

<Footer step={1} {checks} />
