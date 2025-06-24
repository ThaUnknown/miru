<script lang='ts'>
  import createGlobe from 'cobe'

  import { lookup } from '$lib/modules/geoip'
  import { server } from '$lib/modules/torrent'
  import { breakpoints } from '$lib/utils'

  const normalize = (val = 0, max = 0, min = 0) => (val - min) / (max - min) || 0

  const peers = server.peers

  // pick first 64 peers based on download/upload speeds
  // cobe limits to 64
  // then normalize the speeds to a range of 0-1
  $: picked = $peers
    .sort((a, b) => (b.speed.down + b.speed.up) - (a.speed.down + a.speed.up))
    .slice(0, 64)

  // then normalize the speeds to a range of 0-1
  $: lowestSpeed = Math.min(...picked.map(p => p.speed.down + p.speed.up))
  $: highestSpeed = Math.max(...picked.map(p => p.speed.down + p.speed.up))
  $: normalized = picked.map(peer => ({
    ...peer,
    normalizedSpeed: normalize(peer.speed.down + peer.speed.up, highestSpeed, lowestSpeed)
  }))

  let markers: Record<string, {
    location: [number, number]
    size: number
  } | null>

  $: markers = Object.fromEntries(
    normalized.map(({ ip }) => [
      ip,
      null
    ])
  )

  function createMarker (ip: string, marker: { location: [number, number], size: number }) {
    if (ip in markers) {
      markers[ip] = marker
    }
  }

  const maxSize = 0.05
  const minSize = 0.02

  $: {
    for (const { ip, normalizedSpeed } of normalized) {
      lookup(ip).then(({ city, ll }) => {
        if (!city) {
          ll[0] += (Math.random() - 0.5) * 4
          ll[1] += (Math.random() - 0.5) * 4
        }
        createMarker(ip, {
          location: ll,
          size: Math.min(Math.max(normalizedSpeed * maxSize, minSize), maxSize)
        })
      }).catch(() => undefined)
    }
  }

  $: size = $breakpoints['3xl'] ? 600 : 400

  const scale = 1.5
  const oneOverScale = 1 / scale

  function makeGlobe (canvas: HTMLCanvasElement) {
    const globe = createGlobe(canvas, {
      devicePixelRatio: window.devicePixelRatio,
      width: size,
      height: size,
      phi: 0,
      theta: 0.1,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 19000,
      mapBrightness: 6,
      opacity: 0.8,
      baseColor: [0.23, 0.23, 0.23],
      markerColor: [0.05, 1, 0],
      glowColor: [0, 0, 0],
      markers: [],
      scale,
      offset: [size * 0.8 * oneOverScale, size * oneOverScale * 0.4],
      onRender: state => {
        state.phi = Date.now() * 0.0002 % (Math.PI * 2)
        state.width = size
        state.height = size
        state.offset = [size * 0.8 * oneOverScale, size * oneOverScale * 0.4]

        state.markers = Object.values(markers).filter(m => m)
      }
    })

    return {
      destroy () {
        globe.destroy()
      }
    }
  }
</script>

<canvas use:makeGlobe class='absolute bottom-0 right-0 -z-[1] pointer-events-none' width={size} height={size} />
