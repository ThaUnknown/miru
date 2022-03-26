<script context="module">
  import { DOMPARSER } from '@/modules/util.js'
  import { updateMedia } from './pages/Player.svelte'
  import { set } from './pages/Settings.svelte'
  import { addToast } from '@/lib/Toasts.svelte'

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
    'Erai-raws': 'https://nyaa.si/?page=rss&c=0_0&f=0&u=Erai-raws&q='
  }
  export function getRSSurl() {
    let rss = rssmap[settings.rssFeed] || settings.rssFeed
    return new URL(`${rss}${settings.rssQuality ? `"${settings.rssQuality}"` : ''}`)
  }
</script>

<script>
  import { add } from '@/modules/torrent.js'
  import { episodeRx } from '@/modules/anime.js'

  $: parseRss($rss)

  let table = null

  let fileMedia = null

  export async function parseRss({ media, episode }) {
    if (!media) return
    const titles = [
      ...new Set(
        Object.values(media.title)
          .concat(media.synonyms)
          .filter(name => name != null)
      )
    ]
      .join(')|(')
      .replace(/&/g, '%26')
    const ep =
      (media.episodes !== 1 &&
        (media.status === 'FINISHED' && settings.rssBatch
          ? `"01-${media.episodes}"|"01~${media.episodes}"|"Batch"|"Complete"|"+${episode > 9 ? episode : `0${episode}`}+"|"+${episode > 9 ? episode : `0${episode}`}v"|"S01"`
          : `"+${episode > 9 ? episode : `0${episode}`}+"|"+${episode > 9 ? episode : `0${episode}`}v"`)) ||
      ''
    const excl = ['DTS', 'AC3', 'HEVC', 'x265', 'H.265'].join('|')
    const quality = `"${settings.rssQuality}"` || '"1080p"'
    const trusted = settings.rssTrusted === true ? 2 : 0
    const url = new URL(`https://nyaa.si/?page=rss&c=1_2&f=${trusted}&s=seeders&o=desc&q=(${titles})${ep}${quality}-(${excl})`)

    const nodes = (await getRSSContent(url)).querySelectorAll('item')
    if (!nodes.length) {
      addToast({
        text: `Couldn't find torrent for ${media.title.userPreferred} Episode ${parseInt(episode)}! Try specifying a torrent manually.`,
        title: 'Search Failed',
        type: 'danger'
      })
      return
    }
    const entries = []
    for (const item of nodes) {
      entries.push({
        title: item.querySelector('title')?.textContent || '?',
        link: item.querySelector('link')?.textContent || '?',
        seeders: item.querySelector('seeders')?.textContent ?? '?',
        leechers: item.querySelector('leechers')?.textContent ?? '?',
        downloads: item.querySelector('downloads')?.textContent ?? '?',
        size: item.querySelector('size')?.size ?? '?'
      })
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

<div class="modal" class:show={table} id="viewAnime" tabindex="-1" role="dialog">
  {#if table}
    <div class="modal-dialog" role="document">
      <div class="modal-content w-auto">
        <button class="close pointer" type="button" on:click={close}>
          <span>&times;</span>
        </button>
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
