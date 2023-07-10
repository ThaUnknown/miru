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
</script>

<div class='modal z-40' class:show={table} id='viewAnime'>
  {#if table}
    <div class='modal-dialog p-20' on:pointerup|self={close} on:keydown={checkClose} tabindex='-1' role='button' bind:this={modal}>
      <div class='modal-content w-auto'>
        <button class='close pointer z-30 right-0 position-absolute' type='button' use:click={close}> &times; </button>
        <table class='table table-hover'>
          <thead>
            <tr>
              <th scope='col'>#</th>
              <th scope='col'>Name</th>
              <th scope='col'>Size</th>
              <th scope='col'>Seed</th>
              <th scope='col'>Leech</th>
              <th scope='col'>Downloads</th>
              <th scope='col'>Released</th>
              <th scope='col'>Play</th>
            </tr>
          </thead>
          <tbody class='results pointer'>
            {#each table as row, index}
              <tr class:text-primary={row.best} use:click={() => play(row)}>
                <th>{index + 1}</th>
                <td>{row.title}</td>
                <td>{row.size}</td>
                <td>{row.seeders ?? '?'}</td>
                <td>{row.leechers ?? '?'}</td>
                <td>{row.downloads ?? '?'}</td>
                <td>{since(row.date)}</td>
                <td class='material-symbols-outlined font-size-20'>play_arrow</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<style>
  .close {
    top: 4rem !important;
    left: unset;
    right: 2.5rem !important;
  }
</style>
