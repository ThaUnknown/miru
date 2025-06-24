<script lang='ts'>
  import Clock from 'lucide-svelte/icons/clock'
  import ClockFading from 'lucide-svelte/icons/clock-fading'
  import Download from 'lucide-svelte/icons/download'
  import HardDrive from 'lucide-svelte/icons/hard-drive'
  import HardDriveDownload from 'lucide-svelte/icons/hard-drive-download'
  import Link from 'lucide-svelte/icons/link'
  import Network from 'lucide-svelte/icons/network'
  import Puzzle from 'lucide-svelte/icons/puzzle'
  import Timer from 'lucide-svelte/icons/timer'
  import Upload from 'lucide-svelte/icons/upload'
  import UserRoundMinus from 'lucide-svelte/icons/user-round-minus'
  import UserRoundPlus from 'lucide-svelte/icons/user-round-plus'
  import Users from 'lucide-svelte/icons/users'
  import Wifi from 'lucide-svelte/icons/wifi'

  import Status from './status.svelte'

  import { server } from '$lib/modules/torrent'
  import { fastPrettyBits, fastPrettyBytes, eta, safeLocalStorage } from '$lib/utils'

  const stats = server.stats
  const protocol = server.protocol

  $: torrent = $stats

  $: protocols = $protocol

  $: completed = torrent.progress === 1

  const forwarding = safeLocalStorage<boolean>('torrent-port-forwarding') ?? false
</script>

<div class='max-w-6xl flex flex-col gap-12'>
  <div class='flex items-center gap-4'>
    <div class='flex-1 w-full'>
      <h1 class='text-2xl font-bold truncate text-nowrap'>{torrent.name || 'No Name Provided'}</h1>
      <div class='flex items-center gap-2 mt-2'>
        <div class='rounded-full px-2.5 py-0.5 text-xs font-bold text-primary-foreground {completed ? 'bg-blue-500 hover:bg-blue-500' : 'bg-green-500 hover:bg-green-500'}'>
          {completed ? 'Seeding' : 'Downloading'}
        </div>
        <span class='text-sm text-muted-foreground'>{torrent.hash}</span>
      </div>
    </div>
    <div class='flex gap-2' />
  </div>
  <div class='space-y-4'>
    <div class='flex items-center justify-between'>
      <div class='flex items-center gap-2'>
        <HardDriveDownload class='w-5 h-5 mr-1.5' />
        <span class='text-2xl font-bold'>Progress</span>
      </div>
      <span class='text-2xl font-bold'>{(torrent.progress * 100).toFixed(1)}%</span>
    </div>
    <div class='relative w-full overflow-clip rounded-full bg-secondary h-3'>
      <div class='h-full w-full bg-primary transition-transform transform-gpu' style:--tw-translate-x='{(torrent.progress * 100) - 100}%' />
    </div>
    <div class='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
      <div class='flex items-center gap-2'>
        <Download class='w-4 h-4 text-green-500 mx-1' />
        <div>
          <span class='text-muted-foreground'>Downloaded</span>
          <div class='font-medium'>{fastPrettyBytes(torrent.size.downloaded)}</div>
        </div>
      </div>
      <div class='flex items-center gap-2'>
        <Upload class='w-4 h-4 text-blue-500 mx-1' />
        <div>
          <span class='text-muted-foreground'>Uploaded</span>
          <div class='font-medium'>{fastPrettyBytes(torrent.size.uploaded)}</div>
        </div>
      </div>
      <div class='flex items-center gap-2'>
        <HardDrive class='w-4 h-4 text-gray-500 mx-1' />
        <div>
          <span class='text-muted-foreground'>Total Size</span>
          <div class='font-medium'>{fastPrettyBytes(torrent.size.total)}</div>
        </div>
      </div>
      <div class='flex items-center gap-2'>
        <Puzzle class='w-4 h-4 text-gray-500 mx-1' />
        <div>
          <span class='text-muted-foreground'>Pieces</span>
          <div class='font-medium'>{torrent.pieces.total} <span class='text-muted-foreground'>×</span> {fastPrettyBytes(torrent.pieces.size)}</div>
        </div>
      </div>
    </div>
  </div>
  <div class='grid grid-cols-1 xl:grid-cols-3 gap-x-12'>
    <div>
      <div class='flex flex-col space-y-1.5 py-6'>
        <h3 class='text-2xl font-bold leading-none flex items-center gap-2'>
          <Wifi class='w-5 h-5 mr-1.5' />
          Speed &amp; Transfer
        </h3>
      </div>
      <div class='space-y-4'>
        <div class='grid grid-cols-2 gap-4'>
          <div class='space-y-2'>
            <div class='flex items-center gap-2'>
              <Download class='w-4 h-4 text-green-500' />
              <span class='text-sm font-medium text-muted-foreground'>Download</span>
            </div>
            <div class='text-2xl font-bold'>{fastPrettyBits(torrent.speed.down * 8)}/s</div>
          </div>
          <div class='space-y-2'>
            <div class='flex items-center gap-2'>
              <Upload class='w-4 h-4 text-blue-500' />
              <span class='text-sm font-medium text-muted-foreground'>Upload</span>
            </div>
            <div class='text-2xl font-bold'>{fastPrettyBits(torrent.speed.up * 8)}/s</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class='flex flex-col space-y-1.5 py-6'>
        <h3 class='text-2xl font-bold leading-none flex items-center gap-2'>
          <Clock class='w-5 h-5 mr-1.5' />
          Time Information
        </h3>
      </div>
      <div class='space-y-4'>
        <div class='grid grid-cols-2 gap-4'>
          <div class='space-y-2'>
            <div class='flex items-center gap-2'>
              <ClockFading class='w-4 h-4 text-orange-500' />
              <span class='text-sm font-medium text-muted-foreground'>Remaining</span>
            </div>
            <div class='text-2xl font-bold'>{eta(torrent.time.remaining)}</div>
          </div>
          <div class='space-y-2'>
            <div class='flex items-center gap-2'>
              <Timer class='w-4 h-4 text-purple-500' />
              <span class='text-sm font-medium text-muted-foreground'>Elapsed</span>
            </div>
            <div class='text-2xl font-bold'>{eta(torrent.time.elapsed)}</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class='flex flex-col space-y-1.5 py-6'>
        <h3 class='text-2xl font-bold leading-none flex items-center gap-2'>
          <Users class='w-5 h-5 mr-1.5' />
          Peers &amp; Connections
        </h3>
      </div>
      <div class='space-y-4'>
        <div class='grid grid-cols-3 gap-4'>
          <div class='space-y-2'>
            <div class='flex items-center gap-2'>
              <UserRoundPlus class='w-4 h-4 text-green-500' />
              <span class='text-sm font-medium text-muted-foreground'>Seeders</span>
            </div>
            <div class='text-2xl font-bold'>{torrent.peers.seeders}</div>
          </div>
          <div class='space-y-2'>
            <div class='flex items-center gap-2'>
              <UserRoundMinus class='w-4 h-4 text-blue-500' />
              <span class='text-sm font-medium text-muted-foreground'>Leechers</span>
            </div>
            <div class='text-2xl font-bold'>{torrent.peers.leechers}</div>
          </div>
          <div class='space-y-2'>
            <div class='flex items-center gap-2'>
              <Link class='w-4 h-4 text-purple-500' />
              <span class='text-sm font-medium text-muted-foreground'>Wires</span>
            </div>
            <div class='text-2xl font-bold'>{torrent.peers.wires}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div>
    <div class='flex flex-col space-y-1.5 py-6'>
      <h3 class='text-2xl font-bold leading-none flex items-center gap-2'>
        <Network class='w-5 h-5 mr-1.5' />
        Protocol Status
      </h3>
    </div>
    <div class='py-6 pt-0'>
      <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'>
        <div class='space-y-4'>
          <h4 class='font-medium'>Network Discovery</h4>
          <div class='space-y-3'>
            <Status enabled={protocols.dht} title='DHT' description='Distributed Hash Table for peer discovery' />
            <Status enabled={protocols.lsd} title='LSD' description='Local Service Discovery on network' />
            <Status enabled={protocols.pex} title='PEX' description='Peer Exchange with other clients' />
          </div>
        </div>
        <div class='space-y-4'>
          <h4 class='font-medium'>Connection</h4>
          <div class='space-y-3'>
            <Status enabled={protocols.nat} title='NAT' description='NAT-PMP/UPnP automatic forwarding' />
            <Status enabled={forwarding || protocols.forwarding} title='Forwarding' description='Accepting inbound connections' />
          </div>
        </div>
        <div class='space-y-4'>
          <h4 class='font-medium'>Storage</h4>
          <div class='space-y-3'>
            <Status enabled={protocols.persisting} title='Persisting' description='Storing all torrents' />
            <Status enabled={protocols.streaming} title='Streaming' description='Downloading only required pieces' />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
