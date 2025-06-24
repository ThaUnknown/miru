import { readable, writable } from 'simple-store-svelte'
import { get } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'

import native from '../native'
import { w2globby } from '../w2g/lobby'

import type { FileInfo, PeerInfo, TorrentFile, TorrentInfo } from '$lib/../app'
import type { Media } from '../anilist'

const defaultTorrentInfo: TorrentInfo = {
  name: '',
  progress: 0,
  size: { total: 0, downloaded: 0, uploaded: 0 },
  speed: { down: 0, up: 0 },
  time: { remaining: 0, elapsed: 0 },
  peers: { seeders: 0, leechers: 0, wires: 0 },
  pieces: { total: 0, size: 0 },
  hash: ''
}

const defaultProtocolStatus = { dht: false, lsd: false, pex: false, nat: false, forwarding: false, persisting: false, streaming: false }

export const server = new class ServerClient {
  last = persisted<{media: Media, id: string, episode: number} | null>('last-torrent', null)
  active = writable<Promise<{media: Media, id: string, episode: number, files: TorrentFile[]}| null>>()
  downloaded = writable(this.cachedSet())

  stats = readable(defaultTorrentInfo, set => {
    let listener = 0

    const update = async () => {
      const id = (await get(this.active))?.id
      if (id) set(await native.torrentInfo(id))
      listener = setTimeout(update, 200)
    }

    update()
    return () => clearTimeout(listener)
  })

  protocol = readable(defaultProtocolStatus, set => {
    let listener = 0

    const update = async () => {
      const id = (await get(this.active))?.id
      if (id) set(await native.protocolStatus(id))
      listener = setTimeout(update, 5000)
    }

    update()
    return () => clearTimeout(listener)
  })

  peers = readable<PeerInfo[]>([], set => {
    let listener = 0

    const update = async () => {
      const id = (await get(this.active))?.id
      if (id) set(await native.peerInfo(id))
      listener = setTimeout(update, 5000)
    }

    update()
    return () => clearTimeout(listener)
  })

  files = readable<FileInfo[]>([], set => {
    let listener = 0
    const update = async () => {
      const id = (await get(this.active))?.id
      if (id) set(await native.fileInfo(id))
      listener = setTimeout(update, 5000)
    }

    update()
    return () => clearTimeout(listener)
  })

  constructor () {
    const last = get(this.last)
    if (last) this.play(last.id, last.media, last.episode)

    this.stats.subscribe((stats) => {
      native.downloadProgress(stats.progress)
    })
  }

  async cachedSet () {
    return new Set(await native.cachedTorrents())
  }

  play (id: string, media: Media, episode: number) {
    this.last.set({ id, media, episode })
    this.active.value = this._play(id, media, episode)
    w2globby.value?.mediaChange({ episode, mediaId: media.id, torrent: id })
    return this.active.value
  }

  async _play (id: string, media: Media, episode: number) {
    const result = { id, media, episode, files: await native.playTorrent(id) }
    this.downloaded.value = this.cachedSet()
    return result
  }
}()
