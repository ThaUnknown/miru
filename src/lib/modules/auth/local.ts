import { createStore, set, get } from 'idb-keyval'
import { writable } from 'simple-store-svelte'
import { readable } from 'svelte/store'

import { client, type Media } from '../anilist'

import type { Entry } from '../anilist/queries'
import type { VariablesOf } from 'gql.tada'

import { arrayEqual } from '$lib/utils'

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

  _getEntry (id: number): StoredMedia {
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
    const ids = Object.values(this.entries.value).map(({ mediaListEntry }) => mediaListEntry?.id).filter(e => e != null)
    return client.schedule(ids.length ? ids : undefined)
  }

  toggleFav (id: number) {
    this.entries.update(entries => {
      const entry = this._getEntry(id)

      entry.isFavourite = !entry.isFavourite
      return { ...entries, [id]: entry }
    })
  }

  deleteEntry (media: Media) {
    const id = media.id
    this.entries.update(entries => {
      const entry = this._getEntry(id)

      entry.mediaListEntry = null
      return { ...entries, [media.id]: entry }
    })
  }

  continueIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    const sub = this.entries.subscribe(values => {
      const entries = Object.entries(values)
      if (!entries.length) return []

      const ids: number[] = []

      for (const [alId, entry] of entries) {
        if (entry.mediaListEntry?.status === 'REPEATING' || entry.mediaListEntry?.status === 'CURRENT') {
          ids.push(Number(alId))
        }
      }

      if (arrayEqual(oldvalue, ids)) return
      oldvalue = ids
      set(ids)
    })
    return sub
  })

  planningIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    const sub = this.entries.subscribe(values => {
      const entries = Object.entries(values)
      if (!entries.length) return []

      const ids: number[] = []

      for (const [alId, entry] of entries) {
        if (entry.mediaListEntry?.status === 'PLANNING') {
          ids.push(Number(alId))
        }
      }

      if (arrayEqual(oldvalue, ids)) return
      oldvalue = ids
      set(ids)
    })
    return sub
  })

  entry (variables: VariablesOf<typeof Entry>) {
    this.entries.update(entries => {
      const entry = this._getEntry(variables.id)
      entry.mediaListEntry ??= {
        id: variables.id,
        customLists: null,
        progress: null,
        repeat: null,
        score: null,
        status: null
      }

      const keys = ['status', 'score', 'repeat', 'progress'] as const
      for (const key of keys) {
        // @ts-expect-error idk how to fix this tbf
        entry.mediaListEntry[key] = variables[key] ?? entry.mediaListEntry[key] ?? null
      }
      return { ...entries, [variables.id]: entry }
    })
  }
}()
