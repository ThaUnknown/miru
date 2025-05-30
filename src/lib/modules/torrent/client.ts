import { readable, writable } from 'simple-store-svelte'
import { get } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'

import native from '../native'
import { w2globby } from '../w2g/lobby'

import type { TorrentFile, TorrentInfo } from '../../../app'
import type { Media } from '../anilist'

export const server = new class ServerClient {
  last = persisted<{media: Media, id: string, episode: number} | null>('last-torrent', null)
  active = writable<Promise<{media: Media, id: string, episode: number, files: TorrentFile[]}| null>>()
  downloaded = writable(this.cachedSet())

  stats = readable<TorrentInfo>({ peers: 0, down: 0, up: 0, progress: 0, downloaded: 0, eta: 0, hash: '', leechers: 0, name: '', seeders: 0, size: 0 }, set => {
    let listener = 0

    const update = async () => {
      const id = (await get(this.active))?.id
      if (id) set(await native.torrentStats(id))
      listener = setTimeout(update, 1000)
    }

    update()
    return () => clearTimeout(listener)
  })

  list = readable<TorrentInfo[]>([], set => {
    let listener = 0

    const update = async () => {
      set(await native.torrents())
      listener = setTimeout(update, 1000)
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
