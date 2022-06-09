<script context="module">
  import { DOMPARSER } from '@/modules/util.js'
  import { updateMedia } from './pages/Player.svelte'
  import { set } from './pages/Settings.svelte'
  import { addToast } from '@/lib/Toasts.svelte'
  import { alRequest } from '@/modules/anilist.js'
  import { episodeRx, findEdge, resolveSeason, getMediaMaxEp } from '@/modules/anime.js'

  import { writable } from 'svelte/store'

  const rss = writable({})

  const settings = set

  const exclusions = ['DTS', '[ASW]']

  const video = document.createElement('video')

  if (!video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"')) {
    exclusions.push('HEVC', 'x265', 'H.265')
  }
  if (!video.canPlayType('audio/mp4; codecs="ac-3"')) {
    exclusions.push('AC3', 'AC-3')
  }
  video.remove()

  export function playAnime (media, episode = 1) {
    episode = isNaN(episode) ? 1 : episode
    rss.set({ media, episode })
  }

  // padleft a variable with 0 ex: 1 => '01'
  function pl (v = 1) {
    return (typeof v === 'string' ? v : v.toString()).padStart(2, '0')
  }

  export function getRSSContent (url) {
    return fetch(url)
      .then(res => {
        if (res.ok) {
          return res.text().then(xmlTxt => {
            return DOMPARSER(xmlTxt, 'text/xml')
          })
        }
        throw Error(res.statusText)
      })
      .catch(error => {
        addToast({
          text: 'Failed fetching RSS!<br>' + error,
          title: 'Search Failed',
          type: 'danger'
        })
        console.error(error)
      })
  }
  const rssmap = {
    SubsPlease: 'https://nyaa.si/?page=rss&c=0_0&f=0&u=subsplease&q=',
    'Erai-raws [Multi-Sub]': 'https://nyaa.si/?page=rss&c=0_0&f=0&u=Erai-raws&q=',
    NanDesuKa: 'https://nyaa.si/?page=rss&c=0_0&f=0&u=NanDesuKa&q='
  }
  export function getReleasesRSSurl () {
    const rss = rssmap[settings.rssFeed] || settings.rssFeed
    return new URL(`${rss}${settings.rssQuality ? `"${settings.rssQuality}"` : ''}`)
  }
  // matches: OP01 ED01 EP01 E01 01v -01- _01_ with spaces and stuff
  const epNumRx = /[EO]?[EPD _-]\d{2}[v _-]|\d{2}[-~]\d{2}/i
  async function getRSSEntries ({ media, episode, mode, ignoreQuality }) {
    // mode cuts down on the amt of queries made 'check' || 'batch'
    const titles = createTitle(media).join(')|(')

    const prequel = findEdge(media, 'PREQUEL')?.node
    const sequel = findEdge(media, 'SEQUEL')?.node
    const isBatch = media.status === 'FINISHED' && settings.rssBatch && media.episodes !== 1

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
        ep = `"01-${pl(media.episodes)}"|"01~${pl(media.episodes)}"|"Batch"|"Complete"|"${pl(episode)}+"|"${pl(episode)}v"|"S01"`
      } else {
        ep = `(${episodes.map(episode => `"E${pl(episode)}+"|"${pl(episode)}+"|"${pl(episode)}v"`).join('|')})`
      }
    }

    const excl = exclusions.join('|')
    const quality = (!ignoreQuality && (`"${settings.rssQuality}"` || '"1080"')) || ''
    const trusted = settings.rssTrusted === true ? 2 : 0
    const url = new URL(
      `https://nyaa.si/?page=rss&c=1_2&f=${trusted}&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`
    )

    let nodes = [...(await getRSSContent(url)).querySelectorAll('item')]

    if (absolute) {
      // if this is S > 1 aka absolute ep number exists get entries for S1title + absoluteEP
      // the reason this isnt done with recursion like sequelEntries is because that would include the S1 media dates
      // we want the dates of the target media as the S1 title might be used for SX releases
      const titles = createTitle(absolute.media).join(')|(')

      const ep = `"E${pl(absoluteep)}+"|"${pl(absoluteep)}+"|"${pl(absoluteep)}v"`

      const url = new URL(
        `https://nyaa.si/?page=rss&c=1_2&f=${trusted}&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`
      )
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
    return entries.filter(({ link }, index) => !ids.includes(link, index + 1))
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
    for (const t of grouped) {
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
    return titles
  }
</script>

<script>
  import { add } from '@/modules/torrent.js'
  

  $: parseRss($rss)

  let table = null

  let fileMedia = null

  export async function parseRss ({ media, episode }) {
    if (!media) return
    const entries = await getRSSEntries({ media, episode })
    if (!entries?.length) {
      addToast({
        text: `Couldn't find torrent for ${media.title.userPreferred} Episode ${parseInt(episode)}! Try specifying a torrent manually.`,
        title: 'Search Failed',
        type: 'danger'
      })
      return
    }
    entries.sort((a, b) => b.seeders - a.seeders)
    const streamingEpisode = media?.streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(episode))[0]
    fileMedia = {
      mediaTitle: media?.title.userPreferred,
      episodeNumber: Number(episode),
      episodeTitle: streamingEpisode ? episodeRx.exec(streamingEpisode.title)[2] : undefined,
      episodeThumbnail: streamingEpisode?.thumbnail,
      mediaCover: media?.coverImage.medium,
      name: 'Miru',
      media
    }
    if (settings.rssAutoplay) {
      play(entries[0])
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
    updateMedia(fileMedia)
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
</script>

<div class="modal" class:show={table} id="viewAnime" on:keydown={checkClose} tabindex="-1">
  {#if table}
    <div class="modal-dialog p-20" role="document" on:click|self={close}>
      <div class="modal-content w-auto">
        <button class="close pointer" type="button" on:click={close}> &times; </button>
        <table class="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Size</th>
              <th scope="col">Seed</th>
              <th scope="col">Leech</th>
              <th scope="col">Downloads</th>
              <th scope="col">Play</th>
            </tr>
          </thead>
          <tbody class="results pointer">
            {#each table as row, index}
              <tr on:click={() => play(row)}>
                <th>{index + 1}</th>
                <td>{row.title}</td>
                <td>{row.size}</td>
                <td>{row.seeders}</td>
                <td>{row.leechers}</td>
                <td>{row.downloads}</td>
                <td class="material-icons font-size-20">play_arrow</td>
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
