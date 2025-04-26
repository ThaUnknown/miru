<script lang='ts' context='module'>
  import { BadgeCheck, Database } from 'lucide-svelte'
  import { writable } from 'simple-store-svelte'
  import { MagnifyingGlass } from 'svelte-radix'

  import { SingleCombo } from './ui/combobox'
  import { Input } from './ui/input'

  import type { AnitomyResult } from 'anitomyscript'
  import type { TorrentResult } from 'hayase-extensions'

  import * as Dialog from '$lib/components/ui/dialog'
  import { title, type Media } from '$lib/modules/anilist'
  import { extensions } from '$lib/modules/extensions/extensions'
  import { click, dragScroll } from '$lib/modules/navigate'
  import { settings, videoResolutions } from '$lib/modules/settings'
  import { fastPrettyBytes, since } from '$lib/utils'

  const termMapping: Record<string, {text: string, color: string}> = {}
  termMapping['5.1'] = termMapping['5.1CH'] = { text: '5.1', color: '#f67255' }
  termMapping['TRUEHD5.1'] = { text: 'TrueHD 5.1', color: '#f67255' }
  termMapping.AAC = termMapping.AACX2 = termMapping.AACX3 = termMapping.AACX4 = { text: 'AAC', color: '#f67255' }
  termMapping.AC3 = { text: 'AC3', color: '#f67255' }
  termMapping.EAC3 = termMapping['E-AC-3'] = { text: 'EAC3', color: '#f67255' }
  termMapping.FLAC = termMapping.FLACX2 = termMapping.FLACX3 = termMapping.FLACX4 = { text: 'FLAC', color: '#f67255' }
  termMapping.VORBIS = { text: 'Vorbis', color: '#f67255' }
  termMapping.DUALAUDIO = termMapping['DUAL AUDIO'] = { text: 'Dual Audio', color: '#ffcb3b' }
  termMapping['10BIT'] = termMapping['10BITS'] = termMapping['10-BIT'] = termMapping['10-BITS'] = termMapping.HI10 = termMapping.HI10P = { text: '10 Bit', color: '#0c8ce9' }
  termMapping.HI444 = termMapping.HI444P = termMapping.HI444PP = { text: 'HI444', color: '#0c8ce9' }
  termMapping.HEVC = termMapping.H265 = termMapping['H.265'] = termMapping.X265 = { text: 'HEVC', color: '#0c8ce9' }
  termMapping.AV1 = { text: 'AV1', color: '#0c8ce9' }
  termMapping.BD = termMapping.BDRIP = termMapping.BLURAY = termMapping['BLU-RAY'] = { text: 'BD', color: '#ab1b31' }
  termMapping.DVD5 = termMapping.DVD9 = termMapping['DVD-R2J'] = termMapping.DVDRIP = termMapping.DVD = termMapping['DVD-RIP'] = termMapping.R2DVD = termMapping.R2J = termMapping.R2JDVD = termMapping.R2JDVDRIP = { text: 'DVD', color: '#ab1b31' }
  // termMapping.HDTV = termMapping.HDTVRIP = termMapping.TVRIP = termMapping['TV-RIP'] = { text: 'TV', color: '#ab1b31' }
  // termMapping.WEBCAST = termMapping.WEBRIP = { text: 'WEB', color: '#ab1b31' }

  function sanitiseTerms ({ video_term: vid, audio_term: aud, video_resolution: resolution, source: src }: AnitomyResult) {
    const video = !Array.isArray(vid) ? [vid] : vid
    const audio = !Array.isArray(aud) ? [aud] : aud
    const source = !Array.isArray(src) ? [src] : src

    const terms = [...new Set([...video, ...audio, ...source].map(term => termMapping[term?.toUpperCase()]).filter(t => t))] as Array<{text: string, color: string}>
    if (resolution) terms.unshift({ text: resolution, color: '#c6ec58' })

    return terms
  }

  function simplifyFilename ({ video_term: vid, audio_term: aud, video_resolution: resolution, file_name: name, release_group: group, file_checksum: checksum }: AnitomyResult) {
    const video = !Array.isArray(vid) ? [vid] : vid
    const audio = !Array.isArray(aud) ? [aud] : aud

    let simpleName = name
    if (group) simpleName = simpleName.replace(group, '')
    if (resolution) simpleName = simpleName.replace(resolution, '')
    if (checksum) simpleName = simpleName.replace(checksum, '')
    for (const term of video) simpleName = simpleName.replace(term, '')
    for (const term of audio) simpleName = simpleName.replace(term, '')
    return simpleName.replace(/[[{(]\s*[\]})]/g, '').replace(/\s+/g, ' ').trim()
  }

  // episode is optional here, but is actually always defined
  export const searchStore = writable<{episode?: number, media?: Media}>({})
</script>

<script lang='ts'>
  import ProgressButton from './ui/button/progress-button.svelte'
  import { Banner } from './ui/img'

  import { goto } from '$app/navigation'
  import { saved } from '$lib/modules/extensions'
  import { server } from '$lib/modules/torrent'

  $: open = !!$searchStore.media

  $: searchResult = !!$searchStore.media && extensions.getResultsFromExtensions({ media: $searchStore.media, episode: $searchStore.episode, batch: $settings.searchBatch, resolution: $settings.searchQuality })

  function close (state: boolean) {
    if (!state) searchStore.set({})
  }

  let inputText = ''

  function play (result: TorrentResult & { parseObject: AnitomyResult, extension: Set<string> }) {
    server.play(result.hash, $searchStore.media!, $searchStore.episode!)
    goto('/app/player/')
    close(false)
  }

  async function playBest () {
    if (!searchResult) return
    const best = filterAndSortResults((await searchResult).results, inputText)[0]

    if (best) play(best)
  }

  function filterAndSortResults (results: Array<TorrentResult & { parseObject: AnitomyResult, extension: Set<string> }>, searchText: string) {
    const preference = $settings.lookupPreference
    return results
      .filter(({ title }) => title.toLowerCase().includes(searchText.toLowerCase()))
      .sort((a, b) => {
        // pre-emtively sort by deal breaker conditions
        // the higher the rank the worse the result... don't ask
        function getRank (res: typeof results[0]) {
          if (res.accuracy === 'low') return 3
          if (res.seeders <= 15) return 2
          if ((res.type === 'best' || res.type === 'alt') && preference === 'quality') return 0
          return 1
        }

        const rankA = getRank(a)
        const rankB = getRank(b)
        if (rankA !== rankB) return rankA - rankB
        if (rankA === 1) {
          const scoreA = a.accuracy === 'high' ? 1 : 0
          const scoreB = b.accuracy === 'high' ? 1 : 0
          const diff = scoreB - scoreA
          if (diff !== 0) return diff

          // sort by preference, quality is sorted in rank, so quality and seeders is both as seeders here.
          if (preference === 'size') return a.size - b.size
          return b.seeders - a.seeders
        }
        return 0
      })
  }

  let animating = false

  async function startAnimation (searchRes: typeof searchResult) {
    if (!$settings.searchAutoSelect) return
    animating = false
    await searchRes
    if (searchRes === searchResult) animating = true
  }

  function stopAnimation () {
    animating = false
  }

  $: searchResult && startAnimation(searchResult)
</script>

<Dialog.Root bind:open onOpenChange={close} portal='#root'>
  <Dialog.Content class='bg-black h-full lg:border-x-4 border-b-0 max-w-5xl w-full max-h-[calc(100%-1rem)] mt-2 p-0 items-center flex lg:rounded-t-xl overflow-hidden z-[100]'>
    <div class='absolute top-0 left-0 w-full h-full max-h-28 overflow-hidden'>
      {#if $searchStore.media}
        <Banner media={$searchStore.media} class='object-cover w-full h-full absolute bottom-[0.5px] left-0 -z-10' />
      {/if}
      <div class='w-full h-full banner-2' />
    </div>
    <div class='gap-4 w-full relative h-full flex flex-col pt-6'>
      <div class='px-4 sm:px-6 space-y-4'>
        <div class='font-weight-bold text-2xl font-bold text-ellipsis text-nowrap overflow-hidden pb-2'>{$searchStore.media ? title($searchStore.media) : ''}</div>

        <div class='flex items-center relative scale-parent'>
          <Input
            class='pl-9 bg-background select:bg-accent select:text-accent-foreground shadow-sm no-scale placeholder:opacity-50 capitalize'
            placeholder='Any'
            bind:value={inputText} />
          <MagnifyingGlass class='h-4 w-4 shrink-0 opacity-50 absolute left-3 text-muted-foreground z-10 pointer-events-none' />
        </div>
        <div class='flex items-center gap-4 justify-around flex-wrap'>
          <div class='flex items-center space-x-2 grow'>
            <span>Episode</span>
            <Input type='number' inputmode='numeric' pattern='[0-9]*' min='0' max='65536' bind:value={$searchStore.episode} class='w-32 shrink-0 bg-background grow' />
          </div>
          <div class='flex items-center space-x-2 grow'>
            <span>Resolution</span>
            <SingleCombo bind:value={$settings.searchQuality} items={videoResolutions} class='w-32 shrink-0 grow border-border border' />
          </div>
        </div>
        <ProgressButton
          onclick={playBest}
          size='default'
          class='w-full font-bold'
          bind:animating>
          Auto Select Torrent
        </ProgressButton>
      </div>
      <div class='h-full overflow-y-auto px-4 sm:px-6 pt-2' role='menu' tabindex='-1' on:keydown={stopAnimation} on:pointerenter={stopAnimation} on:pointermove={stopAnimation} use:dragScroll>
        {#await searchResult}
          {#each Array.from({ length: 12 }) as _, i (i)}
            <div class='p-3 h-[104px] flex cursor-pointer mb-2 relative rounded-md overflow-hidden border border-border flex-col justify-between'>
              <div class='h-4 w-40 bg-primary/5 animate-pulse rounded mt-2' />
              <div class='bg-primary/5 animate-pulse rounded h-2 w-28 mt-1' />
              <div class='flex justify-between mb-1'>
                <div class='flex gap-2'>
                  <div class='mt-2 bg-primary/5 animate-pulse rounded h-2 w-20' />
                  <div class='mt-2 bg-primary/5 animate-pulse rounded h-2 w-20' />
                </div>
                <div class='mt-2 bg-primary/5 animate-pulse rounded h-2 w-20' />
              </div>
            </div>
          {/each}
        {:then search}
          {@const media = $searchStore.media}
          {#if search && media}
            {@const { results, errors } = search}
            {#each filterAndSortResults(results, inputText) as result (result.hash)}
              <div class='p-3 flex cursor-pointer mb-2 relative rounded-md overflow-hidden border border-border select:ring-1 select:ring-ring select:bg-accent select:text-accent-foreground select:scale-[1.02] select:shadow-lg scale-100 transition-all' class:opacity-40={result.accuracy === 'low'} use:click={() => play(result)} title={result.parseObject.file_name}>
                {#if result.accuracy === 'high'}
                  <div class='absolute top-0 left-0 w-full h-full -z-10'>
                    <Banner {media} class='object-cover w-full h-full' />
                    <div class='absolute top-0 left-0 w-full h-full banner' />
                  </div>
                {/if}
                <div class='flex pl-2 flex-col justify-between w-full h-20 relative min-w-0 text-[.7rem]'>
                  <div class='flex w-full items-center'>
                    {#if result.type === 'batch'}
                      <Database class='mr-2' size='1.2rem' />
                    {:else if result.accuracy === 'high'}
                      <BadgeCheck size='1.2rem' class='mr-2' style='color: #53da33' />
                    {/if}
                    <div class='text-xl font-bold text-nowrap'>{result.parseObject.release_group && result.parseObject.release_group.length < 20 ? result.parseObject.release_group : 'No Group'}</div>
                    <div class='ml-auto flex gap-2 self-start'>
                      {#each result.extension as id (id)}
                        {#if $saved[id]}
                          <img src={$saved[id].icon} alt={id} class='size-4' title='Provided by {id}' decoding='async' loading='lazy' />
                        {/if}
                      {/each}
                    </div>
                  </div>
                  <div class='text-muted-foreground text-ellipsis text-nowrap overflow-hidden'>{simplifyFilename(result.parseObject)}</div>
                  <div class='flex flex-row leading-none'>
                    <div class='details text-light flex'>
                      <span class='text-nowrap flex items-center'>{fastPrettyBytes(result.size)}</span>
                      <span class='text-nowrap flex items-center'>{result.seeders} Seeders</span>
                      <span class='text-nowrap flex items-center'>{since(new Date(result.date))}</span>
                    </div>
                    <div class='flex ml-auto flex-row-reverse'>
                      {#if result.type === 'best'}
                        <div class='rounded px-3 py-1 ml-2 border text-nowrap flex items-center' style='background: #1d2d1e; border-color: #53da33 !important; color: #53da33'>
                          Best Release
                        </div>
                      {:else if result.type === 'alt'}
                        <div class='rounded px-3 py-1 ml-2 border text-nowrap flex items-center' style='background: #391d20; border-color: #c52d2d !important; color: #c52d2d'>
                          Alt Release
                        </div>
                      {/if}
                      {#each sanitiseTerms(result.parseObject) as { text, color }, i (i)}
                        <div class='rounded px-3 py-1 ml-2 text-nowrap font-bold flex items-center' style:background={color}>
                          <div class='text-contrast'>
                            {text}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
            {#each errors as error, i (i)}
              <div class='p-5 flex items-center justify-center w-full h-80'>
                <div>
                  <div class='mb-1 font-bold text-2xl text-center '>
                    Extensions {error.extension} encountered an error
                  </div>
                  <div class='text-md text-center text-muted-foreground whitespace-pre-wrap'>
                    {error.error.stack}
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        {:catch error}
          <div class='p-5 flex items-center justify-center w-full h-80'>
            <div>
              <div class='mb-1 font-bold text-4xl text-center '>
                Ooops!
              </div>
              <div class='text-lg text-center text-muted-foreground whitespace-pre-wrap'>
                {error.message}
              </div>
            </div>
          </div>
        {/await}
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  .banner {
    background: linear-gradient(90deg, #000 32%, rgba(0, 0, 0, 0.9) 100%);
  }
  .banner-2 {
    background: linear-gradient(#000d 0%, #000d 90%, #000 100%);
  }
</style>
