<script>
  import { alToken } from '../../views/Settings.svelte'
  import { addToast } from '../../components/Toasts.svelte'
  import IPC from '@/modules/ipc.js'
  import { alRequest } from '@/modules/anilist.js'
  import { getContext } from 'svelte'
  import { getMediaMaxEp } from '@/modules/anime.js'
  import { playAnime } from '../RSSView.svelte'
  import { click } from '@/modules/click.js'
  export let media = null

  const toggleStatusMap = {
    CURRENT: 'DROPPED',
    COMPLETED: 'REPEATING',
    PAUSED: 'CURRENT',
    REPEATING: 'CURRENT',
    DROPPED: 'PLANNING',
    PLANNING: 'remove'
  }
  async function toggleStatus () {
    if (media.mediaListEntry?.status !== 'PLANNING') {
      // add
      await setStatus(toggleStatusMap[media.mediaListEntry?.status] || 'PLANNING')
    } else {
      // delete
      const variables = {
        method: 'Delete',
        id: media.mediaListEntry.id
      }
      await alRequest(variables)
    }
    update()
  }
  function getStatusText (media) {
    if (media.mediaListEntry) {
      const { status } = media.mediaListEntry
      if (status === 'PLANNING') return 'Remove From List'
      if (media.mediaListEntry?.status in toggleStatusMap) return 'Drop From Watching'
    }
    return 'Add To List'
  }
  function setStatus (status, other = {}) {
    const variables = {
      method: 'Entry',
      id: media.id,
      status,
      ...other
    }
    return alRequest(variables)
  }
  async function update () {
    media = (await alRequest({ method: 'SearchIDSingle', id: media.id })).data.Media
  }
  async function score (media, score) {
    const variables = {
      method: 'Entry',
      id: media.id,
      score: score * 10
    }
    await alRequest(variables)
    media = (await alRequest({ method: 'SearchIDSingle', id: media.id })).data.Media
  }
  const trailer = getContext('trailer')
  function viewTrailer (media) {
    $trailer = media.trailer.id
  }
  function copyToClipboard (text) {
    navigator.clipboard.writeText(text)
    addToast({
      title: 'Copied to clipboard',
      text: 'Copied share URL to clipboard',
      type: 'primary',
      duration: '5000'
    })
  }
  function openInBrowser (url) {
    IPC.emit('open', url)
  }
  function getPlayText (media) {
    if (media.mediaListEntry) {
      const { status, progress } = media.mediaListEntry
      if (progress) {
        if (status === 'COMPLETED') return 'Rewatch'
        return 'Continue ' + Math.min(getMediaMaxEp(media, true), progress + 1)
      }
    }
    return 'Play'
  }
  async function play (media) {
    let ep = 1
    if (media.mediaListEntry) {
      const { status, progress } = media.mediaListEntry
      if (progress) {
        if (status === 'COMPLETED') {
          await setStatus('REPEATING', { episode: 0 })
        } else {
          ep = Math.min(getMediaMaxEp(media, true), progress + 1)
        }
      }
    }
    playAnime(media, ep, true)
    media = null
  }
</script>

<div class='col-md-4 d-flex justify-content-end flex-column'>
  <div class='d-flex flex-column flex-wrap'>
    <button
      class='btn btn-primary d-flex align-items-center font-weight-bold font-size-24 h-50 mb-5'
      type='button'
      use:click={() => play(media)}>
      <span class='material-symbols-outlined mr-10 font-size-24 w-30'> play_arrow </span>
      <span>{getPlayText(media)}</span>
    </button>
    {#if alToken}
      <button class='btn d-flex align-items-center mb-5 font-weight-bold font-size-16 btn-primary' use:click={toggleStatus}>
        <span class='material-symbols-outlined mr-10 font-size-18 w-30'> {(media.mediaListEntry?.status in toggleStatusMap) ? 'remove' : 'add'} </span>
        {getStatusText(media)}
      </button>
      <div class='input-group shadow-lg mb-5 font-size-16'>
        <div class='input-group-prepend'>
          <span class='input-group-text bg-tp pl-15 d-flex material-symbols-outlined font-size-18'>hotel_class</span>
        </div>
        <select class='form-control' required value={(media.mediaListEntry?.score || '').toString()} on:change={({ target }) => { score(media, Number(target.value)) }}>
          <option value selected disabled hidden>Score</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
          <option>6</option>
          <option>7</option>
          <option>8</option>
          <option>9</option>
          <option>10</option>
        </select>
      </div>
    {/if}
    {#if media.trailer}
      <button class='btn d-flex align-items-center mb-5 font-weight-bold font-size-16' use:click={() => viewTrailer(media)}>
        <span class='material-symbols-outlined mr-15 font-size-18 w-30'> live_tv </span>
        Trailer
      </button>
    {/if}
    <div class='d-flex mb-5 w-full'>
      <button class='btn flex-fill font-weight-bold font-size-16 d-flex align-items-center' use:click={() => { openInBrowser(`https://anilist.co/anime/${media.id}`) }}>
        <span class='material-symbols-outlined mr-15 font-size-18 w-30'> open_in_new </span>
        Open
      </button>
      <button class='btn flex-fill font-weight-bold font-size-16 ml-5 d-flex align-items-center' use:click={() => { copyToClipboard(`https://miru.watch/anime/${media.id}`) }}>
        <span class='material-symbols-outlined mr-15 font-size-18 w-30'> share </span>
        Share
      </button>
    </div>
  </div>
</div>

<style>
  select.form-control:invalid {
    color: var(--dm-input-placeholder-text-color);
  }
  .bg-tp {
    background-color: var(--dm-button-bg-color) !important;
  }
  .w-30 {
    width: 3rem
  }
</style>
