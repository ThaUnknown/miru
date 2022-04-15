<script context="module">
  import { DOMPARSER } from '@/modules/util.js'
  import { updateMedia } from './pages/Player.svelte'
  import { set } from './pages/Settings.svelte'
  import { addToast } from '@/lib/Toasts.svelte'
  import { alRequest } from '@/modules/anilist.js'

  import { writable } from 'svelte/store'

  const rss = writable({})

  const settings = set

  export function playAnime(media, episode = 1) {
    episode = isNaN(episode) ? 1 : episode
    rss.set({ media, episode })
  }

  export function getRSSContent(url) {
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
  export function getReleasesRSSurl() {
    let rss = rssmap[settings.rssFeed] || settings.rssFeed
    return new URL(`${rss}${settings.rssQuality ? `"${settings.rssQuality}"` : ''}`)
  }
</script>

<script>
  import { add } from '@/modules/torrent.js'
  import { episodeRx } from '@/modules/anime.js'
  import { findEdge, resolveSeason } from '@/modules/anime.js'

  $: parseRss($rss)

  // create an array of potentially valid titles from a given media
  function createTitle(media) {
    // group and de-duplicate
    const grouped = [
      ...new Set(
        Object.values(media.title)
          .concat(media.synonyms)
          .filter(name => name != null)
      )
    ]
    let titles = []
    for (const t of grouped) {
      // replace & with encoded
      let title = t.replace(/&/g, '%26').replace(/\?/g, '%3F').replace(/#/g, '%23')
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

  let table = null

  let fileMedia = null

  async function getRSSEntries({ media, episode, mode }) {
    // mode cuts down on the amt of queries made
    const titles = createTitle(media).join(')|(')

    const prequel = findEdge(media, 'PREQUEL')?.node
    const sequel = findEdge(media, 'SEQUEL')?.node

    const absolute = prequel && mode !== 'check' && (await resolveSeason({ media, episode, force: true }))
    const episodes = [episode]
    if (absolute) episodes.push(absolute.offset + episode)
    let ep = ''
    if (media.episodes !== 1) {
      if (media.status === 'FINISHED' && settings.rssBatch) {
        ep = `"01-${media.episodes}"|"01~${media.episodes}"|"Batch"|"Complete"|"${episode > 9 ? episode : `0${episode}`}+"|"${episode > 9 ? episode : `0${episode}`}v"|"S01"`
      } else {
        ep = `(${episodes
          .map(episode => `"${episode > 9 ? episode : `E0${episode}`}+"|"${episode > 9 ? episode : `+0${episode}`}+"|"${episode > 9 ? episode : `0${episode}`}v"`)
          .join('|')})`
      }
    }

    const excl = ['DTS', 'AC3', 'AC-3', 'HEVC', 'x265', 'H.265'].join('|')
    const quality = `"${settings.rssQuality}"` || '"1080p"'
    const trusted = settings.rssTrusted === true ? 2 : 0
    const url = new URL(`https://nyaa.si/?page=rss&c=1_2&f=${trusted}&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`)

    let nodes = [...(await getRSSContent(url)).querySelectorAll('item')]
    if (absolute && !settings.rssBatch) {
      const titles = createTitle(absolute.media).join(')|(')

      const ep = `"+${episodes[1] > 9 ? episodes[1] : `0${episodes[1]}`}+"|"+${episodes[1] > 9 ? episodes[1] : `0${episodes[1]}`}v"`

      const url = new URL(`https://nyaa.si/?page=rss&c=1_2&f=${trusted}&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`)
      nodes = [...nodes, ...(await getRSSContent(url)).querySelectorAll('item')]
    }
    if (!nodes?.length) return null

    const checkSequelDate = media.status === 'FINISHED' && (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') && sequel.startDate

    const sequelStartDate = checkSequelDate && new Date(Object.values(checkSequelDate).join(' '))

    const sequelEntries =
      (sequel?.status === 'FINISHED' || sequel?.status === 'RELEASING') &&
      (await getRSSEntries({ media: (await alRequest({ method: 'SearchIDSingle', id: sequel.id })).data.Media, episode, mode: 'check' }))

    const checkPrequelDate = (media.status === 'FINISHED' || media.status === 'RELEASING') && prequel?.status === 'FINISHED' && prequel?.endDate

    const prequelEndDate = checkPrequelDate && new Date(Object.values(checkPrequelDate).join(' '))

    let entries = nodes.map(item => {
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

    // 1 week in date numbers, a bit of jitter for pre-releases and releasers being late as fuck, lets hope it doesnt cause issues
    const week = 2674848460

    if (prequelEndDate) {
      entries = entries.filter(entry => entry.date > new Date(prequelEndDate + week))
    }

    if (sequelStartDate && media.format === 'TV') {
      entries = entries.filter(entry => entry.date < new Date(sequelStartDate - week))
    }

    if (sequelEntries?.length) {
      if (mode === 'check') {
        entries = [...entries, ...sequelEntries]
      } else {
        entries = entries.filter(entry => !sequelEntries.find(sequel => sequel.link === entry.link))
      }
    }

    return entries
  }

  export async function parseRss({ media, episode }) {
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
      media: media
    }
    if (settings.rssAutoplay) {
      play(entries[0])
    } else {
      table = entries
    }
  }
  function close() {
    table = null
  }
  function checkClose({ keyCode }) {
    if (keyCode == 27) close()
  }
  function play(entry) {
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
    <div class="modal-dialog" role="document" on:click|self={close}>
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
  .trailer {
    padding-bottom: 56.25%;
  }
  .close {
    top: 1rem !important;
    left: unset;
    right: 2.5rem !important;
  }
</style>
