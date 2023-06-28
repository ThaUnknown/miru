import { mapBestRelease } from '../anime.js'
import { fastPrettyBytes } from '../util.js'
import { exclusions } from '../rss.js'
import { set } from '@/views/Settings.svelte'

const toshoURL = decodeURIComponent(atob('aHR0cHM6Ly9mZWVkLmFuaW1ldG9zaG8ub3JnL2pzb24/'))

export default async function ({ media, episode }) {
  const mappings = await fetch('https://api.ani.zip/mappings?anilist_id=' + media.id)
  const { episodes, mappings: map } = await mappings.json()
  let promises = []

  if (episodes[Number(episode)]) {
    const { anidbEid } = episodes[Number(episode)]

    promises.push(fetchToshoEntries({ media, id: anidbEid, quality: set.rssQuality }))
  } else {
    // TODO: look for episodes via.... title?
  }

  // look for batches
  if (map.anidb_id && (media.status === 'FINISHED' || media.episodes === 1)) {
    promises.push(fetchToshoEntries({ media, id: map.anidb_id, quality: set.rssQuality, batch: true }))
  }

  let entries = (await Promise.all(promises)).flat()

  if (!entries.length) {
    promises = []
    if (episodes[Number(episode)]) {
      const { anidbEid } = episodes[Number(episode)]

      promises.push(fetchToshoEntries({ media, id: anidbEid }))
    } else {
      // TODO: look for episodes via.... title?
    }

    // look for batches
    if (map.anidb_id && (media.status === 'FINISHED' || media.episodes === 1)) {
      promises.push(fetchToshoEntries({ media, id: map.anidb_id, batch: true }))
    }
  }

  entries = (await Promise.all(promises)).flat()

  const mapped = mapTosho2dDeDupedEntry(entries)

  return mapBestRelease(mapped)
}

async function fetchToshoEntries ({ media, id, batch, quality }) {
  const exclusionsString = `!("${exclusions.join('"|"')}")`
  const qualityString = quality ? ' "' + quality + '"' : ''
  const queryString = '&qx=1&q=' + exclusionsString + qualityString
  if (batch) {
    const torrents = await fetch(toshoURL + 'aid=' + id + '&order=size-d' + queryString)

    return (await torrents.json()).filter(entry => {
      return entry.num_files >= media.episodes
    })
  } else {
    const torrents = await fetch(toshoURL + 'eid=' + id + queryString)

    return torrents.json()
  }
}

function mapTosho2dDeDupedEntry (entries) {
  const deduped = {}
  for (const entry of entries) {
    if (deduped[entry.info_hash]) {
      const dupe = deduped[entry.info_hash]
      dupe.title ??= entry.torrent_name || entry.title
      dupe.id ||= entry.nyaa_id
      dupe.seeders ||= entry.seeders >= 100000 ? entry.leechers * 3 : entry.seeders
      dupe.leechers ||= entry.leechers ?? 0
      dupe.size ||= entry.total_size && fastPrettyBytes(entry.total_size)
      dupe.date ||= entry.timestamp && new Date(entry.timestamp * 1000)
    } else {
      deduped[entry.info_hash] = {
        title: entry.torrent_name || entry.title,
        link: entry.magnet_uri,
        id: entry.nyaa_id,
        seeders: entry.seeders >= 100000 ? entry.leechers * 3 : entry.seeders, // this is a REALLY bad assumption to make, but its a decent guess
        leechers: entry.leechers,
        size: entry.total_size && fastPrettyBytes(entry.total_size),
        date: entry.timestamp && new Date(entry.timestamp * 1000)
      }
    }
  }

  return Object.values(deduped)
}
