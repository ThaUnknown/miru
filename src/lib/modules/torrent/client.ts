import { writable } from 'simple-store-svelte'
import { persisted } from 'svelte-persisted-store'
import { get } from 'svelte/store'

import native from '../native'

import type { Media } from '../anilist'
import type { TorrentFile } from '../../../app'

export const server = new class ServerClient {
  last = persisted<{media: Media, id: string, episode: number} | null>('last-torrent', null)
  active = writable<Promise<{media: Media, id: string, episode: number, files: TorrentFile[]}| null>>()

  constructor () {
    const last = get(this.last)
    if (last) this.play(last.id, last.media, last.episode)
  }

  play (id: string, media: Media, episode: number) {
    this.last.set({ id, media, episode })
    this.active.value = this._play(id, media, episode)
    return this.active.value
  }

  async _play (id: string, media: Media, episode: number) {
    return { id, media, episode, files: await native.playTorrent(id) }
  }
}()
