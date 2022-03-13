<script context="module">
  import { DOMPARSER } from '@/modules/util.js'
  import { updateMedia } from './pages/Player.svelte'

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
        // halfmoon.initStickyAlert({
        //   content: 'Failed fetching RSS!<br>' + error,
        //   title: 'Search Failed',
        //   alertType: 'alert-danger',
        //   fillType: ''
        // })
        console.error(error)
      })
  }

  export function getRSSurl() {
    // TODO: settings shit
    return 'https://nyaa.si/?page=rss&c=0_0&f=0&u=subsplease&q="1080"'
    // if (Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0]) {
    //   return new URL(Object.values(torrent4list.options).filter(item => item.value === settings.torrent4)[0].textContent + settings.torrent1)
    // } else {
    //   return new URL(settings.torrent4 + settings.torrent1) // add custom RSS
    // }
  }
</script>

<script>
  import { set } from './pages/Settings.svelte'
  import { getContext } from 'svelte'
  import { add } from '@/modules/torrent.js'
  import { episodeRx } from '@/modules/anime.js'

  const media = getContext('rss')
  $: parseRss($media)

  let table = null

  const settings = set

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
    if (!nodes.length) return
    const entries = []
    for (const item of nodes) {
      entries.push({
        title: item.querySelector('title')?.textContent || '?',
        link: item.querySelector('link')?.textContent || '?',
        seeders: item.querySelector('seeders')?.textContent || '?',
        leechers: item.querySelector('leechers')?.textContent || '?',
        downloads: item.querySelector('downloads')?.textContent || '?',
        size: item.querySelector('downloads')?.size || '?'
      })
    }
    entries.sort((a, b) => b.seeders - a.seeders)
    const streamingEpisode = media?.streamingEpisodes.filter(episode => episodeRx.exec(episode.title) && Number(episodeRx.exec(episode.title)[1]) === Number(episode))[0]
    const fileMedia = {
      mediaTitle: media?.title.userPreferred,
      episodeNumber: Number(episode),
      episodeTitle: streamingEpisode ? episodeRx.exec(streamingEpisode.title)[2] : undefined,
      episodeThumbnail: streamingEpisode?.thumbnail,
      mediaCover: media?.coverImage.medium,
      name: 'Miru',
      media: media
    }
    updateMedia(fileMedia)
    if (settings.rssAutoplay) {
      add(entries[0].link)
    } else {
      table = entries
    }
  }
  function close() {
    table = null
  }
  function play(link) {
    add(link)
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
        <table class="table">
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
          <tbody class="results">
            {#each table as row, index}
              <tr on:click={() => play(row.link)}>
                <th>{index + 1}</th>
                <td>{row.title}</td>
                <td>{row.size}</td>
                <td>{row.seeders}</td>
                <td>{row.leechers}</td>
                <td>{row.downloads}</td>
                <td class="pointer">Play</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
