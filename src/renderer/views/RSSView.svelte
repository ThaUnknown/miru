<script context='module'>
  import { since } from '@/modules/util.js'
  import { set } from './Settings.svelte'
  import { addToast } from '../components/Toasts.svelte'
  import { findInCurrent } from './Player/MediaHandler.svelte'
  import getRSSEntries from '@/modules/providers/tosho.js'
  import { click } from '@/modules/click.js'

  import { writable } from 'svelte/store'

  const rss = writable({})

  const settings = set

  export function playAnime (media, episode = 1, force) {
    episode = Number(episode)
    episode = isNaN(episode) ? 1 : episode
    if (!force && findInCurrent({ media, episode })) return
    rss.set({ media, episode })
  }
</script>

<script>
  import { add } from '@/modules/torrent.js'
  import { media } from './Player/MediaHandler.svelte'

  $: loadRss($rss)

  let table = null

  async function loadRss ({ media, episode }) {
    if (!media) return
    const entries = await getRSSEntries({ media, episode })
    if (!entries?.length) {
      addToast({
        text: /* html */`Couldn't find torrent for ${media.title.userPreferred} Episode ${parseInt(episode)}! Try specifying a torrent manually.`,
        title: 'Search Failed',
        type: 'danger'
      })
      return
    }
    entries.sort((a, b) => b.seeders - a.seeders)
    if (settings.rssAutoplay) {
      const best = entries.find(entry => entry.best)
      if (best?.seeders > 20) { // only play best if it actually has a lot of seeders, 20 might be too little for those overkill blurays
        play(best)
      } else {
        play(entries[0])
      }
    } else {
      table = entries
    }
  }
  function close () {
    table = null
  }
  function checkClose ({ keyCode }) {
    if (keyCode === 27) close()
  }
  function play (entry) {
    $media = $rss
    if (entry.seeders !== '?' && entry.seeders <= 15) {
      addToast({
        text: 'This release is poorly seeded and likely will have playback issues such as buffering!',
        title: 'Availability Warning',
        type: 'secondary'
      })
    }
    add(entry.link)
    table = null
  }
  let modal
  $: table && modal?.focus()
  const termMapping = {
    5.1: '5.1',
    '5.1CH': '5.1',
    'TRUEHD5.1': 'TrueHD 5.1',
    AAC: 'AAC',
    AACX2: 'AAC',
    AACX3: 'AAC',
    AACX4: 'AAC',
    AC3: 'AC3',
    EAC3: 'EAC3',
    'E-AC-3': 'EAC3',
    FLAC: 'FLAC',
    FLACX2: 'FLAC',
    FLACX3: 'FLAC',
    FLACX4: 'FLAC',
    VORBIS: 'Vorbis',
    DUALAUDIO: 'Dual Audio',
    'Dual Audio': 'Dual Audio',
    '10BIT': '10 Bit',
    '10BITS': '10 Bit',
    '10-BIT': '10 Bit',
    '10-BITS': '10 Bit',
    HI10: '10 Bit',
    HI10P: '10 Bit',
    HI444: 'HI444',
    HI444P: 'HI444',
    HI444PP: 'HI444',
    H265: 'HEVC',
    'H.265': 'HEVC',
    X265: 'HEVC',
    HEVC: 'HEVC',
    AV1: 'AV1'
  }
  function sanitiseTerms ({ video_term: video, audio_term: audio, video_resolution: resolution }) {
    if (!Array.isArray(video)) video = [video]
    if (!Array.isArray(audio)) audio = [audio]

    const terms = []

    if (resolution) terms.push({ text: resolution, color: '#c6ec58' })
    for (const text of audio) {
      if (termMapping[text]) terms.push({ text: termMapping[text], color: '#f67255' })
    }
    for (const text of video) {
      if (termMapping[text]) terms.push({ text: termMapping[text], color: '#0c8ce9' })
    }

    return terms
  }
</script>

<div class='modal z-40' class:show={table} id='viewAnime'>
  {#if table}
    <div class='modal-dialog' on:pointerup|self={close} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
      <div class='modal-content w-auto h-full mx-20 p-0 rounded overflow-x-hidden overflow-y-scroll'>
        <div class='w-full bg-dark-light d-flex px-15 py-10 position-sticky top-0 z-10'>
          <div class='material-symbols-outlined text-danger symbol-bold' title='Badges Are a Rough Guess of Information And Might Not Be Representative of Actual Data'>
            warning
          </div>
          <button class='btn btn-square bg-dark rounded-circle ml-auto pointer' type='button' use:click={close}> &times; </button>
        </div>
        <table class='table table-hover font-size-14 position-relative'>
          <thead>
            <tr class='border-0'>
              <td class='py-15 pl-20 pr-0' />
              <td class='py-15 px-20'>Name</td>
              <td class='py-15 px-20'>Size</td>
              <td class='py-15 px-20'>Seed</td>
              <td class='py-15 px-20'>Leech</td>
              <td class='py-15 px-20'>Downloads</td>
              <td class='py-15 px-20'>Released</td>
            </tr>
          </thead>
          <tbody class='pointer'>
            {#each table as row}
              <tr class='border-0' class:text-secondary={row.best} use:click={() => play(row)}>
                <td class='py-10 pl-20 pr-0'>
                  {#if row.best}
                    <div class='material-symbols-outlined font-size-24 symbol-bold' title='Best Release'>
                      star
                    </div>
                  {:else if row.verified}
                    <div class='text-success material-symbols-outlined font-size-24 symbol-bold' title='Verified'>
                      verified
                    </div>
                  {:else if row.batch}
                    <div class='text-light material-symbols-outlined font-size-24 symbol-bold' title='Batch'>
                      database
                    </div>
                  {/if}
                </td>
                <td class='py-10 px-20'>{row.title}
                  <div class='d-flex flex-row text-dark font-weight-bold font-size-12'>
                    {#each sanitiseTerms(row.parseObject) as { text, color }}
                      <div style={'background:' + color} class='rounded px-15 mr-10 mt-5'>
                        {text}
                      </div>
                    {/each}
                  </div>
                </td>
                <td class='py-10 px-20 text-nowrap'>{row.size}</td>
                <td class='py-10 px-20'>{row.seeders ?? '?'}</td>
                <td class='py-10 px-20'>{row.leechers ?? '?'}</td>
                <td class='py-10 px-20'>{row.downloads ?? '?'}</td>
                <td class='py-10 px-20 text-nowrap'>{since(row.date)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<style>
  .modal-content {
    margin: 8rem 6rem 0 6rem !important
  }
  .symbol-bold {
    font-variation-settings: 'wght' 500;
  }
</style>
