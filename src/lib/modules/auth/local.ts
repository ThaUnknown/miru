import { createStore, set, get } from 'idb-keyval'
import { writable } from 'simple-store-svelte'

import { client, type Media } from '../anilist'

import type { Entry } from '../anilist/queries'
import type { VariablesOf } from 'gql.tada'

type StoredMedia = Pick<Media, 'isFavourite' | 'mediaListEntry' | 'id'>

export default new class LocalSync {
  store = createStore('watchlist', 'local')

  entries = writable<Record<number, StoredMedia>>({})

  constructor () {
    get('entries', this.store).then(s => {
      this.entries.value = s ?? {}
    })
    this.entries.subscribe(entries => {
      set('entries', entries, this.store)
    })
  }

  get (id: number) {
    return this.entries.value[id]
  }

  _createEntry (id: number): StoredMedia {
    // const media = client.client.readQuery(IDMedia, { id })?.data?.Media
    return this.entries.value[id] ?? {
      id,
      isFavourite: false,
      mediaListEntry: {
        id,
        customLists: null,
        progress: null,
        repeat: null,
        score: null,
        status: null
      }
    }
  }

  schedule (): ReturnType<typeof client.schedule> {
    const ids = Object.keys(this.entries.value).map(id => parseInt(id))
    return client.schedule(ids.length ? ids : undefined)
  }

  toggleFav (id: number) {
    this.entries.update(entries => {
      const entry = this._createEntry(id)

      entry.isFavourite = !entry.isFavourite
      return { ...entries, [id]: entry }
    })
  }

  deleteEntry (id: number) {
    this.entries.update(entries => {
      const entry = this._createEntry(id)

      entry.mediaListEntry = null
      return { ...entries, [id]: entry }
    })
  }

  // this is in theory doable, but hard to sync media's airing status
  // continueIDs () {
  // }
  // sequelIDs () {
  // }

  entry (variables: VariablesOf<typeof Entry>) {
    this.entries.update(entries => {
      const entry = this._createEntry(variables.id)

      const keys = ['status', 'score', 'repeat', 'progress'] as const
      for (const key of keys) {
        // @ts-expect-error idk how to fix this tbf
        entry.mediaListEntry![key] = variables[key] ?? entry.mediaListEntry![key] ?? null
      }
      return { ...entries, [variables.id]: entry }
    })
  }
}()
