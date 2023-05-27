<script context='module'>
  import { DOMPARSER, wrapEnter, since } from '@/modules/util.js'
  import { set } from './Settings.svelte'
  import { addToast } from './Toasts.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { findEdge, resolveSeason, getMediaMaxEp } from '@/modules/anime.js'
  import { findInCurrent } from './Player/MediaHandler.svelte'

  import { writable } from 'svelte/store'

  const rss = writable({})

  const settings = set

  const exclusions = ['DTS']

  function binarySearch (arr, el) {
    let left = 0
    let right = arr.length - 1

    while (left <= right) {
      // Using bitwise or instead of Math.floor as it is slightly faster
      const mid = ((right + left) / 2) | 0
      if (arr[mid] === el) {
        return true
      } else if (el < arr[mid]) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    return false
  }

  let seadex = []
  requestIdleCallback(async () => {
    const res = await fetch('https://sneedex.moe/api/public/nyaa')
    const json = await res.json()
    seadex = json.flatMap(({ nyaaIDs }) => nyaaIDs).sort((a, b) => a - b) // sort for binary search
  })

  function mapBestRelease (entries) {
    return entries.map(entry => {
      const match = entry.link.match(/\d+/i)
      if (match && binarySearch(seadex, Number(match[0]))) entry.best = true
      return entry
    })
  }

  const isDev = location.hostname === 'localhost'

  const video = document.createElement('video')

  if (!isDev && !video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"')) {
    exclusions.push('HEVC', 'x265', 'H.265')
  }
  if (!isDev && !video.canPlayType('audio/mp4; codecs="ac-3"')) {
    exclusions.push('AC3', 'AC-3')
  }
  video.remove()

  export function playAnime (media, episode = 1, force) {
    episode = Number(episode)
    episode = isNaN(episode) ? 1 : episode
    if (!force && findInCurrent({ media, episode })) return
    rss.set({ media, episode })
  }

  // padleft a variable with 0 ex: 1 => '01'
  function zeropad (v = 1, l = 2) {
    return (typeof v === 'string' ? v : v.toString()).padStart(l, '0')
  }

  export async function getRSSContent (url) {
    if (!url) return null
    const res = await fetch(url)
    if (!res.ok) {
      addToast({
        text: 'Failed fetching RSS!<br>' + res.statusText,
        title: 'Search Failed',
        type: 'danger'
      })
      console.error('Failed to fetch rss', res.statusText)
    }
    return DOMPARSER(await res.text(), 'text/xml')
  }
  const rssmap = {
    SubsPlease: `${set.catURL}/?page=rss&c=0_0&f=0&u=subsplease&q=`,
    'Erai-raws [Multi-Sub]': `${set.catURL}/?page=rss&c=0_0&f=0&u=Erai-raws&q=`,
    'NC-Raws': `${set.catURL}/?page=rss&c=0_0&f=0&u=BraveSail&q=`
  }
  const epstring = ep => `"E${zeropad(ep)}+"|"E${zeropad(ep)}v"|"+${zeropad(ep)}+"|"+${zeropad(ep)}v"`
  export function getReleasesRSSurl (val) {
    const rss = rssmap[val] || val
    return rss && new URL(rssmap[val] ? `${rss}${settings.rssQuality ? `"${settings.rssQuality}"` : ''}` : rss)
  }
  // [EO]?[-EPD _—]\d{2}(?:[-v _.—]|$)
  // /[EO]?[-EPD]\d{2}(?:[-v.]|$)|[EO]?[EPD ]\d{2}(?:[v .]|$)|[EO]?[EPD_]\d{2}(?:[v_.]|$)|[EO]?[EPD—]\d{2}(?:[v.—]|$)|\d{2} ?[-~—] ?\d{2}/i
  // matches: OP01 ED01 EP01 E01 01v 01. -01- _01_ with spaces and stuff
  const epNumRx = /[EO]?[-EPD]\d{2}(?:[-v.]|$)|[EO]?[EPD ]\d{2}(?:[v .]|$)|[EO]?[EPD_]\d{2}(?:[v_.]|$)|[EO]?[EPD—]\d{2}(?:[v.—]|$)|\d{2} ?[-~—] ?\d{2}/i
  async function getRSSEntries ({ media, episode, mode, ignoreQuality }) {
    // mode cuts down on the amt of queries made 'check' || 'batch'
    const titles = createTitle(media).join(')|(')

    const prequel = findEdge(media, 'PREQUEL')?.node
    const sequel = findEdge(media, 'SEQUEL')?.node
    const isBatch = media.status === 'FINISHED' && media.episodes !== 1

    // if media has multiple seasons, and this S is > 1, then get the absolute episode number of the episode
    const absolute = prequel && !mode && (await resolveSeason({ media, episode, force: true }))
    const absoluteep = absolute?.offset + episode
    const episodes = [episode]

    // only use absolute episode number if its smaller than max episodes this series has, ex:
    // looking for E1 of S2, S1 has 12 ep and S2 has 13, absolute will be 13
    // so this would find the 13th ep of the 2nd season too if this check wasnt here
    if (absolute && absoluteep < (getMediaMaxEp(media) || episode)) {
      episodes.push(absoluteep)
    }

    let ep = ''
    if (media.episodes !== 1 && mode !== 'batch') {
      if (isBatch) {
        const digits = Math.max(2, Math.log(media.episodes) * Math.LOG10E + 1 | 0)
        ep = `"${zeropad(1, digits)}-${zeropad(media.episodes, digits)}"|"${zeropad(1, digits)}~${zeropad(media.episodes, digits)}"|"Batch"|"Complete"|"${zeropad(episode)}+"|"${zeropad(episode)}v"`
      } else {
        ep = `(${episodes.map(epstring).join('|')})`
      }
    }

    const excl = exclusions.join('|')
    const quality = (!ignoreQuality && (`"${settings.rssQuality}"` || '"1080"')) || ''
    const url = new URL(`${set.catURL}/?page=rss&c=1_2&f=0&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`)

    let nodes = [...(await getRSSContent(url)).querySelectorAll('item')]

    if (absolute) {
      // if this is S > 1 aka absolute ep number exists get entries for S1title + absoluteEP
      // the reason this isnt done with recursion like sequelEntries is because that would include the S1 media dates
      // we want the dates of the target media as the S1 title might be used for SX releases
      const titles = createTitle(absolute.media).join(')|(')

      const url = new URL(`${set.catURL}/?page=rss&c=1_2&f=0&s=seeders&o=desc&q=(${titles})${epstring(absoluteep)}${quality}-(${excl})`)
      nodes = [...nodes, ...(await getRSSContent(url)).querySelectorAll('item')]
    }

    let entries = parseRSSNodes(nodes)

    const checkSequelDate = media.status === 'FINISHED' && (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') && sequel.startDate

    const sequelStartDate = checkSequelDate && new Date(Object.values(checkSequelDate).join(' '))

    // recursive, get all entries for media sequel, and its sequel, and its sequel
    const sequelEntries =
      (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') &&
        (await getRSSEntries({ media: (await alRequest({ method: 'SearchIDSingle', id: sequel.id })).data.Media, episode, mode: mode || 'check' }))

    const checkPrequelDate = (media.status === 'FINISHED' || media.status === 'RELEASING') && prequel?.status === 'FINISHED' && prequel?.endDate

    const prequelEndDate = checkPrequelDate && new Date(Object.values(checkPrequelDate).join(' '))

    // 1 month in MS, a bit of jitter for pre-releases and releasers being late as fuck, lets hope it doesnt cause issues
    const month = 2674848460

    if (prequelEndDate) {
      entries = entries.filter(entry => entry.date > new Date(+prequelEndDate + month))
    }

    if (sequelStartDate && media.format === 'TV') {
      entries = entries.filter(entry => entry.date < new Date(+sequelStartDate - month))
    }

    if (sequelEntries?.length) {
      if (mode === 'check') {
        entries = [...entries, ...sequelEntries]
      } else {
        entries = entries.filter(entry => !sequelEntries.find(sequel => sequel.link === entry.link))
      }
    }

    // this gets entries without any episode limiting, and for batches
    const batchEntries = !mode && isBatch && (await getRSSEntries({ media, episode, ignoreQuality, mode: 'batch' })).filter(entry => {
      return !epNumRx.test(entry.title)
    })

    if (batchEntries?.length) {
      entries = [...entries, ...batchEntries]
    }

    // some archaic shows only have shit DVD's in weird qualities, so try to look up without any quality restrictions when there are no results
    if (!entries.length && !ignoreQuality && !mode) {
      entries = await getRSSEntries({ media, episode, ignoreQuality: true })
    }

    // dedupe
    const ids = entries.map(e => e.link)
    return mapBestRelease(entries.filter(({ link }, index) => !ids.includes(link, index + 1)))
  }

  function parseRSSNodes (nodes) {
    return nodes.map(item => {
      const pubDate = item.querySelector('pubDate')?.textContent

      return {
        title: item.querySelector('title')?.textContent || '?',
        link: item.querySelector('link')?.textContent || '?',
        seeders: item.querySelector('seeders')?.textContent ?? '?',
        leechers: item.querySelector('leechers')?.textContent ?? '?',
        downloads: item.querySelector('downloads')?.textContent ?? '?',
        size: item.querySelector('size')?.textContent ?? '?',
        date: pubDate && new Date(pubDate)
      }
    })
  }

  // create an array of potentially valid titles from a given media
  function createTitle (media) {
    // group and de-duplicate
    const grouped = [
      ...new Set(
        Object.values(media.title)
          .concat(media.synonyms)
          .filter(name => name != null && name.length > 3)
      )
    ]
    const titles = []
    const appendTitle = t => {
      // replace & with encoded
      const title = t.replace(/&/g, '%26').replace(/\?/g, '%3F').replace(/#/g, '%23')
      titles.push(title)

      // replace Season 2 with S2, else replace 2nd Season with S2, but keep the original title
      const match1 = title.match(/(\d)(?:nd|rd|th) Season/i)
      const match2 = title.match(/Season (\d)/i)

      if (match2) {
        titles.push(title.replace(/Season \d/i, `S${match2[1]}`))
      } else if (match1) {
        titles.push(title.replace(/(\d)(?:nd|rd|th) Season/i, `S${match1[1]}`))
      }
    }
    for (const t of grouped) {
      appendTitle(t)
      if (t.includes('-')) appendTitle(t.replaceAll('-', ''))
    }
    return titles
  }
</script>

<script>
  import { add } from '@/modules/torrent.js'
  import { media } from './Player/MediaHandler.svelte'

  $: parseRss($rss)

  let table = null

  async function parseRss ({ media, episode }) {
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

<div class='modal' class:show={table} id='viewAnime' on:keydown={checkClose} tabindex='-1' bind:this={modal}>
  {#if table}
    <div class='modal-dialog p-20' role='document' on:click|self={close} on:keydown|self={wrapEnter(close)}>
      <div class='modal-content w-auto'>
        <button class='close pointer z-30 top-20 right-0' type='button' on:click={close}> &times; </button>
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
              <tr class:text-secondary={row.best} on:click={() => play(row)} on:keydown={wrapEnter(() => play(row))} tabindex='0' role='button'>
                <th>{index + 1}</th>
                <td>{row.title}</td>
                <td>{row.size}</td>
                <td>{row.seeders}</td>
                <td>{row.leechers}</td>
                <td>{row.downloads}</td>
                <td>{since(row.date)}</td>
                <td class='material-icons font-size-20'>play_arrow</td>
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
    top: 1rem !important;
    left: unset;
    right: 2.5rem !important;
  }
</style>
