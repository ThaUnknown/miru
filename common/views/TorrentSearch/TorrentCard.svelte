<script context='module'>
  import { click } from '@/modules/click.js'
  import { fastPrettyBytes, since } from '@/modules/util.js'
  import { Database, BadgeCheck } from 'lucide-svelte'

  /** @typedef {import('@thaunknown/ani-resourced/sources/types.d.ts').Result} Result */
  /** @typedef {import('anitomyscript').AnitomyResult} AnitomyResult */

  const termMapping = {}
  termMapping['5.1'] = { text: '5.1', color: '#f67255' }
  termMapping['5.1CH'] = termMapping[5.1]
  termMapping['TRUEHD5.1'] = { text: 'TrueHD 5.1', color: '#f67255' }
  termMapping.AAC = { text: 'AAC', color: '#f67255' }
  termMapping.AACX2 = termMapping.AAC
  termMapping.AACX3 = termMapping.AAC
  termMapping.AACX4 = termMapping.AAC
  termMapping.AC3 = { text: 'AC3', color: '#f67255' }
  termMapping.EAC3 = { text: 'EAC3', color: '#f67255' }
  termMapping['E-AC-3'] = termMapping.EAC3
  termMapping.FLAC = { text: 'FLAC', color: '#f67255' }
  termMapping.FLACX2 = termMapping.FLAC
  termMapping.FLACX3 = termMapping.FLAC
  termMapping.FLACX4 = termMapping.FLAC
  termMapping.VORBIS = { text: 'Vorbis', color: '#f67255' }
  termMapping.DUALAUDIO = { text: 'Dual Audio', color: '#f67255' }
  termMapping['DUAL AUDIO'] = termMapping.DUALAUDIO
  termMapping['10BIT'] = { text: '10 Bit', color: '#0c8ce9' }
  termMapping['10BITS'] = termMapping['10BIT']
  termMapping['10-BIT'] = termMapping['10BIT']
  termMapping['10-BITS'] = termMapping['10BIT']
  termMapping.HI10 = termMapping['10BIT']
  termMapping.HI10P = termMapping['10BIT']
  termMapping.HI444 = { text: 'HI444', color: '#0c8ce9' }
  termMapping.HI444P = termMapping.HI444
  termMapping.HI444PP = termMapping.HI444
  termMapping.HEVC = { text: 'HEVC', color: '#0c8ce9' }
  termMapping.H265 = termMapping.HEVC
  termMapping['H.265'] = termMapping.HEVC
  termMapping.X265 = termMapping.HEVC
  termMapping.AV1 = { text: 'AV1', color: '#0c8ce9' }

  /** @param {AnitomyResult} param0 */
  function sanitiseTerms ({ video_term: vid, audio_term: aud, video_resolution: resolution }) {
    const video = !Array.isArray(vid) ? [vid] : vid
    const audio = !Array.isArray(aud) ? [aud] : aud

    const terms = [...new Set([...video, ...audio].map(term => termMapping[term?.toUpperCase()]).filter(t => t))]
    if (resolution) terms.unshift({ text: resolution, color: '#c6ec58' })

    return terms
  }

  /** @param {AnitomyResult} param0 */
  function simplifyFilename ({ video_term: vid, audio_term: aud, video_resolution: resolution, file_name: name, release_group: group, file_checksum: checksum }) {
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
</script>

<script>
  /** @type {Result & { parseObject: AnitomyResult }} */
  export let result

  /** @type {import('@/modules/al.d.ts').Media} */
  export let media

  /** @type {Function} */
  export let play
</script>

<div class='card bg-dark p-15 d-flex mx-0 overflow-hidden pointer mb-10 mt-0 position-relative scale' use:click={() => play(result)} title={result.parseObject.file_name}>
  {#if media.bannerImage}
    <div class='position-absolute top-0 left-0 w-full h-full'>
      <img src={media.bannerImage} alt='bannerImage' class='img-cover w-full h-full' style='border-radius: 5px;' />
      <div class='position-absolute top-0 left-0 w-full h-full' style='background: var(--torrent-card-gradient)' />
    </div>
  {/if}
  <div class='d-flex pl-10 flex-column justify-content-between w-full h-100 position-relative' style='min-width: 0;'>
    <div class='d-flex w-full'>
      <div class='font-size-22 font-weight-bold text-nowrap'>{result.parseObject?.release_group && result.parseObject.release_group.length < 20 ? result.parseObject.release_group : 'No Group'}</div>
      {#if result.type === 'batch'}
        <Database size='2.6rem' class='ml-auto' />
      {:else if result.verified}
        <BadgeCheck size='2.8rem' class='ml-auto' style='color: #53da33' />
      {/if}
    </div>
    <div class='font-size-14 text-muted text-truncate overflow-hidden'>{simplifyFilename(result.parseObject)}</div>
    <div class='d-flex flex-row text-dark font-size-14' style='line-height:1'>
      <div class='text-light d-flex align-items-center text-nowrap'>{fastPrettyBytes(result.size)}</div>
      <div class='text-light d-flex align-items-center text-nowrap'>&nbsp;•&nbsp;</div>
      <div class='text-light d-flex align-items-center text-nowrap'>{result.seeders} Seeders</div>
      <div class='text-light d-flex align-items-center text-nowrap'>&nbsp;•&nbsp;</div>
      <div class='text-light d-flex align-items-center text-nowrap'>{since(new Date(result.date))}</div>
      <div class='d-flex ml-auto flex-row-reverse'>
        {#if result.type === 'best'}
          <div class='rounded px-15 py-5 ml-10 border text-nowrap d-flex align-items-center' style='background: #1d2d1e; border-color: #53da33 !important; color: #53da33'>
            Best Release
          </div>
        {:else if result.type === 'alt'}
          <div class='rounded px-15 py-5 ml-10 border text-nowrap d-flex align-items-center' style='background: #391d20; border-color: #c52d2d !important; color: #c52d2d'>
            Alt Release
          </div>
        {/if}
        {#each sanitiseTerms(result.parseObject) as { text }}
          <div class='rounded px-15 py-5 ml-10 bg-very-dark text-nowrap text-white d-flex align-items-center'>
            {text}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .symbol-bold {
    font-variation-settings: 'wght' 300;
  }
  .scale {
    transition: transform 0.2s ease;
  }
  .scale:hover{
    transform: scale(1.04);
  }
</style>
