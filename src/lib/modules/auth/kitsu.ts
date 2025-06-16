import { writable } from 'simple-store-svelte'
import { derived, get, readable } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'
import { toast } from 'svelte-sonner'

import { client, type Media } from '../anilist'
import { mappings, mappingsByKitsuId } from '../anizip'
import native from '../native'

import type { Anime, Fav, KEntry, KitsuError, KitsuMediaStatus, Mapping, OAuth, Res, Resource, ResSingle, User } from './kitsu-types'
import type { Entry, FullMediaList, UserFrag } from '../anilist/queries'
import type { ResultOf, VariablesOf } from 'gql.tada'

import { arrayEqual } from '$lib/utils'

const ENDPOINTS = {
  API_OAUTH: 'https://kitsu.app/api/oauth/token',
  API_USER_FETCH: 'https://kitsu.app/api/edge/users',
  API_USER_LIBRARY: 'https://kitsu.app/api/edge/library-entries',
  API_FAVOURITES: 'https://kitsu.app/api/edge/favorites'
} as const

type ALMediaStatus = 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING'

const KITSU_TO_AL_STATUS: Record<KitsuMediaStatus, ALMediaStatus> = {
  current: 'CURRENT',
  planned: 'PLANNING',
  completed: 'COMPLETED',
  dropped: 'DROPPED',
  on_hold: 'PAUSED'
}

const AL_TO_KITSU_STATUS: Record<ALMediaStatus, KitsuMediaStatus> = {
  CURRENT: 'current',
  PLANNING: 'planned',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  PAUSED: 'on_hold',
  REPEATING: 'current'
}

export default new class KitsuSync {
  auth = persisted<OAuth | undefined>('kitsuAuth', undefined)
  viewer = persisted<ResultOf<typeof UserFrag> | undefined>('kitsuViewer', undefined)
  userlist = writable<Record<string, ResultOf<typeof FullMediaList>>>({}) // al id to al mapped kitsu entry
  favorites = writable<Record<string, string>>({}) // kitsu anime id to kitsu fav id
  kitsuToAL: Record<string, string> = {}
  ALToKitsu: Record<string, string> = {}

  continueIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    const sub = this.userlist.subscribe(values => {
      const entries = Object.entries(values)
      if (!entries.length) return []

      const ids: number[] = []

      for (const [alId, entry] of entries) {
        if (entry.status === 'REPEATING' || entry.status === 'CURRENT') {
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
    const sub = this.userlist.subscribe(values => {
      const entries = Object.entries(values)
      if (!entries.length) return []

      const ids: number[] = []

      for (const [alId, entry] of entries) {
        if (entry.status === 'PLANNING') {
          ids.push(Number(alId))
        }
      }

      if (arrayEqual(oldvalue, ids)) return
      oldvalue = ids
      set(ids)
    })
    return sub
  })

  constructor () {
    this.auth.subscribe((auth) => {
      if (auth) this._user()
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _request <T = object> (url: string | URL, method: string, body?: any): Promise<T | KitsuError> {
    const auth = get(this.auth)
    try {
      if (auth) {
        const expiresAt = (auth.created_at + auth.expires_in) * 1000

        if (expiresAt < Date.now() - 1000 * 60 * 5) { // 5 minutes before expiry
          await this._refresh()
        }
      }
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Authorization: auth ? `Bearer ${auth.access_token}` : ''
        },
        body: body ? JSON.stringify(body) : undefined
      })

      if (method === 'DELETE') return undefined as T

      const json = await res.json() as object | KitsuError

      if ('error' in json) {
        toast.error('Kitsu Error', { description: json.error_description })
        console.error(json)
      } else if ('errors' in json) {
        for (const error of json.errors) {
          toast.error('Kitsu Error', { description: error.detail })
          console.error(error)
        }
      }

      return json as T | KitsuError
    } catch (error) {
      const err = error as Error

      toast.error('Kitsu Error', { description: err.message })
      console.error(err)

      return {
        error: err.name,
        error_description: err.stack ?? 'An unknown error occurred'
      }
    }
  }

  async _get <T> (target: string, body?: Record<string, unknown>): Promise<T | KitsuError> {
    const url = new URL(target)

    for (const [key, value] of Object.entries(body ?? {})) url.searchParams.append(key, String(value))

    return await this._request<T>(url, 'GET')
  }

  async _delete <T> (url: string): Promise<T | KitsuError> {
    return await this._request<T>(url, 'DELETE')
  }

  async _post <T> (url: string, body?: Record<string, unknown>): Promise<T | KitsuError> {
    return await this._request<T>(url, 'POST', body)
  }

  async _patch <T> (url: string, body?: Record<string, unknown>): Promise<T | KitsuError> {
    return await this._request<T>(url, 'PATCH', body)
  }

  async _refresh () {
    const auth = get(this.auth)
    const data = await this._post<OAuth>(
      ENDPOINTS.API_OAUTH,
      {
        grant_type: 'refresh_token',
        refresh_token: auth?.refresh_token
      }
    )

    if ('access_token' in data) {
      this.auth.set(data)
    }
  }

  async login (username: string, password: string) {
    const data = await this._request<OAuth>(
      ENDPOINTS.API_OAUTH,
      'POST',
      {
        grant_type: 'password',
        username,
        password
      }
    )

    if ('access_token' in data) {
      this.auth.set(data)
    }
  }

  logout () {
    localStorage.removeItem('kitsuViewer')
    localStorage.removeItem('kitsuAuth')
    native.restart()
  }

  async _user () {
    const res = await this._get<Res<User>>(
      ENDPOINTS.API_USER_FETCH,
      {
        'filter[self]': true,
        include: 'favorites.item,libraryEntries.anime,libraryEntries.anime.mappings',
        'fields[users]': 'name,about,avatar,coverImage,createdAt',
        'fields[anime]': 'status,episodeCount,mappings',
        'fields[mappings]': 'externalSite,externalId',
        'fields[libraryEntries]': 'anime,progress,status,reconsumeCount,reconsuming,rating'
      }
    )

    if ('error' in res || 'errors' in res || !res.data[0]) return

    this._entriesToML(res)

    const { id, attributes } = res.data[0]

    this.viewer.set({
      id: Number(id),
      name: attributes.name ?? '',
      about: attributes.about ?? '',
      avatar: {
        large: attributes.avatar?.original ?? null
      },
      bannerImage: attributes.coverImage?.original ?? null,
      createdAt: +new Date(attributes.createdAt),
      isFollowing: false,
      isFollower: false,
      donatorBadge: null,
      options: null,
      statistics: null
    })
  }

  _kitsuEntryToAl (entry: Resource<KEntry>): ResultOf<typeof FullMediaList> {
    return {
      id: Number(entry.id),
      status: entry.attributes.reconsuming ? 'REPEATING' : entry.attributes.status ? KITSU_TO_AL_STATUS[entry.attributes.status] : null,
      progress: entry.attributes.progress ?? 0,
      score: Number(entry.attributes.rating) || 0,
      repeat: entry.attributes.reconsumeCount ?? 0,
      customLists: null
    }
  }

  _entriesToML (res: Res<KEntry | User, Anime | Mapping | KEntry | Fav>) {
    const entryMap = this.userlist.value

    const { included } = res

    const relations = {
      anime: new Map<string, Resource<Anime>>(),
      mappings: new Map<string, Resource<Mapping>>(),
      favorites: new Map<string, Resource<Fav>>()
    }

    const entries: Array<Resource<KEntry>> = []

    if (res.data[0]?.type === 'libraryEntries') {
      entries.push(...res.data as Array<Resource<KEntry>>)
    }

    for (const entry of included ?? []) {
      if (entry.type === 'anime') {
        relations.anime.set(entry.id, entry as Resource<Anime>)
      } else if (entry.type === 'mappings') {
        const e = entry as Resource<Mapping>
        if (e.attributes.externalSite !== 'anilist/anime') continue
        relations.mappings.set(entry.id, entry as Resource<Mapping>)
      } else if (entry.type === 'favorites') {
        relations.favorites.set(entry.id, entry as Resource<Fav>)
      } else {
        entries.push(entry as Resource<KEntry>)
      }
    }

    for (const entry of entries) {
      const animeRes = Array.isArray(entry.relationships?.anime?.data) ? entry.relationships.anime.data[0] : entry.relationships?.anime?.data
      const anime = relations.anime.get(animeRes?.id ?? '')
      const ids = Array.isArray(anime?.relationships?.mappings?.data) ? anime.relationships.mappings.data : [anime?.relationships?.mappings?.data]
      const anilistId = ids.map(i => i && relations.mappings.get(i.id)).filter(i => i)[0]?.attributes.externalId

      if (!anilistId || !animeRes) continue
      this.kitsuToAL[animeRes.id] = anilistId
      this.ALToKitsu[anilistId] = animeRes.id
      entryMap[anilistId] = this._kitsuEntryToAl(entry)
    }

    for (const [id, fav] of relations.favorites.entries()) {
      const data = fav.relationships!.item!.data as { id: string }
      const animeId = data.id
      this.favorites.value[animeId] = id
      this._getAlId(+animeId)
    }

    this.userlist.value = entryMap
  }

  isFav (alID: number) {
    const kitsuId = this.ALToKitsu[alID.toString()]
    if (!kitsuId) return false
    return !!this.favorites.value[kitsuId]
  }

  async _makeFavourite (kitsuAnimeId: string) {
    const viewer = get(this.viewer)
    const data = await this._post<ResSingle<Fav>>(
      ENDPOINTS.API_FAVOURITES,
      {
        data: {
          relationships: {
            user: { data: { type: 'users', id: viewer?.id.toString() ?? '' } },
            item: { data: { type: 'anime', id: kitsuAnimeId } }
          },
          type: 'favorites'
        }
      }
    )

    if (!('data' in data)) return

    this.favorites.value[kitsuAnimeId] = data.data.id
  }

  async _addEntry (id: string, attributes: Omit<KEntry, 'createdAt' | 'updatedAt'>, alId: number) {
    const viewer = get(this.viewer)
    const data = await this._post<ResSingle<KEntry>>(
      ENDPOINTS.API_USER_LIBRARY,
      {
        data: {
          attributes,
          relationships: {
            anime: { data: { id, type: 'anime' } },
            user: { data: { type: 'users', id: viewer?.id.toString() ?? '' } }
          },
          type: 'library-entries'
        }
      }
    )

    if (!('data' in data)) return

    this.userlist.value[alId] = this._kitsuEntryToAl(data.data)
  }

  async _updateEntry (id: number, attributes: Omit<KEntry, 'createdAt' | 'updatedAt'>, alId: number) {
    const data = await this._patch<ResSingle<KEntry>>(
      `${ENDPOINTS.API_USER_LIBRARY}/${id}`,
      {
        data: { id, attributes, type: 'library-entries' }
      }
    )

    if (!('data' in data)) return

    this.userlist.value[alId] = this._kitsuEntryToAl(data.data)
  }

  // TODO: use kitsu's own API for this instead?
  async _getKitsuId (alId: number) {
    const kitsuId = this.ALToKitsu[alId.toString()]
    if (kitsuId) return kitsuId
    const res = await mappings(alId)
    if (!res?.kitsu_id) return
    this.ALToKitsu[alId.toString()] = res.kitsu_id.toString()
    return res.kitsu_id.toString()
  }

  async _getAlId (kitsuId: number) {
    const alId = this.kitsuToAL[kitsuId]
    if (alId) return alId
    const res = await mappingsByKitsuId(kitsuId)
    if (!res?.anilist_id) return
    this.kitsuToAL[kitsuId] = res.anilist_id.toString()
    return res.anilist_id.toString()
  }

  hasAuth = derived(this.viewer, (viewer) => {
    return viewer !== undefined && !!viewer.id
  })

  id () {
    return get(this.viewer)?.id
  }

  profile (): ResultOf<typeof UserFrag> | undefined {
    return get(this.viewer)
  }

  // QUERIES/MUTATIONS

  schedule () {
    const ids = Object.keys(this.userlist.value).map(id => parseInt(id))
    return client.schedule(ids.length ? ids : undefined)
  }

  async toggleFav (id: number) {
    const kitsuId = await this._getKitsuId(id)
    if (!kitsuId) {
      toast.error('Kitsu Sync', {
        description: 'Could not find Kitsu ID for this media.'
      })
      return
    }
    const favs = this.favorites.value
    const favId = favs[kitsuId]
    if (!favId) {
      await this._makeFavourite(kitsuId)
    } else {
      const res = await this._delete<undefined>(`${ENDPOINTS.API_FAVOURITES}/${favId}`)

      if (res && 'error' in res) return

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.favorites.value[kitsuId]
    }
  }

  async deleteEntry (media: Media) {
    const id = this.userlist.value[media.id]?.id
    if (!id) return
    const res = await this._delete<undefined>(`${ENDPOINTS.API_USER_LIBRARY}/${id}`)
    if (res && 'error' in res) return

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.userlist.value[media.id]
  }

  following (id: number) {
    return null
    // TODO: this doesnt work
    // this._get<Res<KEntry, Anime | Mapping>>(
    //   ENDPOINTS.API_USER_LIBRARY,
    //   {
    //     'filter[following]': true,
    //     'filter[user_id]': this.viewer.value?.id,
    //     'filter[animeId]': 42765,
    //     include: 'anime.mappings,user'
    //   }
    // )
  }

  async entry (variables: VariablesOf<typeof Entry>) {
    const targetMediaId = variables.id

    const kitsuEntry = this.userlist.value[targetMediaId]

    const kitsuEntryVariables = {
      status: AL_TO_KITSU_STATUS[variables.status!],
      progress: variables.progress ?? undefined,
      rating: (variables.score ?? 0) < 2 ? undefined : variables.score!.toString(),
      reconsumeCount: variables.repeat ?? undefined,
      reconsuming: variables.status === 'REPEATING'
    }

    if (kitsuEntry) {
      await this._updateEntry(kitsuEntry.id, kitsuEntryVariables, targetMediaId)
    } else {
      const kitsuAnimeId = await this._getKitsuId(targetMediaId)

      if (!kitsuAnimeId) {
        toast.error('Kitsu Sync', {
          description: 'Could not find Kitsu ID for this media.'
        })
        return
      }

      await this._addEntry(kitsuAnimeId, kitsuEntryVariables, targetMediaId)
    }
  }
}()
