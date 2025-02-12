import { Client, fetchExchange, queryStore, type OperationResultState } from '@urql/svelte'
import { offlineExchange } from '@urql/exchange-graphcache'
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage'
import { authExchange } from '@urql/exchange-auth'
import type { ResultOf, VariablesOf } from 'gql.tada'
import type { AnyVariables, TypedDocumentNode } from 'urql'

import Bottleneck from 'bottleneck'

import { safeLocalStorage, sleep } from '$lib/utils'
import native from '$lib/modules/native'

import schema from './schema.json' with { type: 'json' }
import { CustomLists, DeleteEntry, Entry, Following, FullMedia, FullMediaList, Schedule, Search, ToggleFavourite, UserLists, Viewer } from './queries'
import { currentSeason, currentYear, lastSeason, lastYear, nextSeason, nextYear } from './util'

import { readable, writable, type Writable } from 'simple-store-svelte'
import gql from './gql'
import { derived } from 'svelte/store'

function arrayEqual <T> (a: T[], b: T[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

class FetchError extends Error {
  res

  constructor (res: Response, message?: string, opts?: ErrorOptions) {
    super(message, opts)
    this.res = res
  }
}

interface ViewerData { viewer: ResultOf<typeof Viewer>['Viewer'], token: string, expires: string }

function deferred () {
  let resolve: () => void
  const promise = new Promise<void>(_resolve => { resolve = _resolve })
  // @ts-expect-error resolve is always defined
  return { resolve, promise }
}

class AnilistClient {
  storagePromise = deferred()
  storage = makeDefaultStorage({
    idbName: 'graphcache-v3',
    onCacheHydrated: () => this.storagePromise.resolve(),
    maxAge: 14 // The maximum age of the persisted data in days
  })

  client = new Client({
    url: 'https://graphql.anilist.co', // TODO: uncoment fetch, its annoying for debugging stack tracess
    // fetch: (req: RequestInfo | URL, opts?: RequestInit) => this.handleRequest(req, opts),
    exchanges: [
      offlineExchange({
        schema: schema as Parameters<typeof offlineExchange>[0]['schema'],
        logger: (...args) => console.log(...args),
        storage: this.storage,
        updates: {
          Mutation: {
            ToggleFavourite (result: ResultOf<typeof ToggleFavourite>, args, cache) {
              if (!result.ToggleFavourite?.anime?.nodes) return result
              const id = args.animeId as number

              // we check if exists, because AL always returns false for isFavourite, so we need to check if it exists in the list
              const exists = result.ToggleFavourite.anime.nodes.find(n => n?.id === id)

              cache.writeFragment(gql('fragment Med on Media {id, isFavourite}'), { id, isFavourite: !!exists })
            },
            DeleteMediaListEntry: (_, { id }, cache) => {
              cache.writeFragment(FullMediaList, { id: id as number, progress: null, repeat: null, status: null, customLists: null, score: null })
              cache.updateQuery({ query: UserLists, variables: { id: this.viewer.value?.viewer?.id } }, data => {
                if (!data?.MediaListCollection?.lists) return data
                const oldLists = data.MediaListCollection.lists

                data.MediaListCollection.lists = oldLists.map(list => {
                  if (!list?.entries) return list
                  return {
                    ...list,
                    entries: list.entries.filter(entry => entry?.id !== id)
                  }
                })

                return data
              })
            },
            SaveMediaListEntry: (result: ResultOf<typeof Entry>, { mediaId }, cache) => {
              const media = gql('fragment Med on Media {id, mediaListEntry {status, progress, repeat, score, customLists }}')

              const entry = result.SaveMediaListEntry

              if (entry?.customLists) entry.customLists = (entry.customLists as string[]).map(name => ({ enabled: true, name }))
              cache.writeFragment(media, {
                id: mediaId as number,
                mediaListEntry: entry
              })
              cache.updateQuery({ query: UserLists, variables: { id: this.viewer.value?.viewer?.id } }, data => {
                if (!data?.MediaListCollection?.lists) return data
                const oldLists = data.MediaListCollection.lists
                const oldEntry = oldLists.flatMap(list => list?.entries).find(entry => entry?.media?.id === mediaId) ?? result.SaveMediaListEntry

                const lists = oldLists.map(list => {
                  if (!list?.entries) return list
                  return {
                    ...list,
                    entries: list.entries.filter(entry => entry?.media?.id !== mediaId)
                  }
                })

                const status = result.SaveMediaListEntry?.status ?? oldEntry?.status ?? 'PLANNING' as const

                const fallback: NonNullable<typeof oldLists[0]> = { status, entries: [] }
                let targetList = lists.find(list => list?.status === status)
                if (!targetList) {
                  lists.push(fallback)
                  targetList = fallback
                }
                if (!targetList.entries) targetList.entries = []
                // @ts-expect-error it expects relations, but this is a partial update, so we dont need them
                targetList.entries.push(oldEntry)
                return { ...data, MediaListCollection: { ...data.MediaListCollection, lists } }
              })
            }
          }
        },
        optimistic: {
          ToggleFavourite ({ animeId }, cache, info) {
            const id = animeId as number
            // @ts-expect-error idk whats wrong here but it works correctly
            const media = cache.readFragment(FullMedia, { id })
            info.partial = true

            const nodes = media?.isFavourite ? [] : [{ id, __typename: 'Media' }]
            return {
              anime: {
                nodes,
                __typename: 'MediaConnection'
              },
              __typename: 'Favourites'
            }
          },
          DeleteMediaListEntry () {
            return { deleted: true, __typename: 'Deleted' }
          },
          SaveMediaListEntry (args, cache, info) {
            const id = args.mediaId as number
            // @ts-expect-error idk whats wrong here but it works correctly
            const media = cache.readFragment(FullMedia, { id })
            if (!media) return {}
            info.partial = true

            return {
              status: 'PLANNING' as const,
              progress: 0,
              repeat: 0,
              score: 0,
              id: -1,
              ...media.mediaListEntry,
              customLists: (args.customLists as string[]).map(name => ({ enabled: true, name })).concat(...(media.mediaListEntry?.customLists as (Array<{ enabled: boolean, name: string }> | undefined) ?? [])),
              ...args,
              media,
              __typename: 'MediaList'
            }
          }
        },
        keys: {
          FuzzyDate: () => null,
          PageInfo: () => null,
          Page: () => null,
          MediaTitle: () => null,
          MediaCoverImage: () => null,
          AiringSchedule: () => null,
          // @ts-expect-error idk
          MediaListCollection: e => e.user?.id as string | null,
          MediaListGroup: () => null,
          UserAvatar: () => null
        }
      }),
      authExchange(async utils => {
        return {
          addAuthToOperation: (operation) => {
            if (!this.viewer.value) return operation
            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${this.viewer.value.token}`
            })
          },
          didAuthError (error, _operation) {
            return error.graphQLErrors.some(e => e.extensions.code === 'FORBIDDEN') // TODO: verify how anilist handles auth errors
          },
          refreshAuth: async () => {
            await this.auth()
          },
          willAuthError: () => {
            if (!this.viewer.value?.expires) return false
            return parseInt(this.viewer.value.expires) < Date.now()
          }
        }
      }),
      fetchExchange
    ],
    requestPolicy: 'cache-and-network'
  })

  limiter = new Bottleneck({
    reservoir: 90,
    reservoirRefreshAmount: 90,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 10,
    minTime: 100
  })

  rateLimitPromise: Promise<void> | null = null

  handleRequest = this.limiter.wrap<Response, RequestInfo | URL, RequestInit | undefined>(async (req: RequestInfo | URL, opts?: RequestInit) => {
    await this.rateLimitPromise
    // await sleep(1000)
    const res = await fetch(req, opts)

    if (!res.ok && (res.status === 429 || res.status === 500)) {
      throw new FetchError(res)
    }
    return res
  })

  async auth () {
    const res = await native.authAL('https://anilist.co/api/v2/oauth/authorize?client_id=3461&response_type=token')
    const token = res.access_token
    const expires = '' + (Date.now() + (parseInt(res.expires_in) * 1000))

    const viewerRes = await this.client.query(Viewer, {}, { fetchOptions: { headers: { Authorization: `Bearer ${token}` } } })
    if (!viewerRes.data?.Viewer) throw new Error('Failed to fetch viewer data')

    this.viewer.value = { viewer: viewerRes.data.Viewer, token, expires }
    localStorage.setItem('ALViewer', JSON.stringify(this.viewer.value))

    const lists = viewerRes.data.Viewer.mediaListOptions?.animeList?.customLists ?? []
    if (!lists.includes('Watched using Hayase')) {
      await this.client.mutation(CustomLists, { lists: [...lists, 'Watched using Hayase'] })
    }
  }

  async logout () {
    await this.storage.clear()
    localStorage.removeItem('ALViewer')
    native.restart()
  }

  setRateLimit (sec: number) {
    if (!this.rateLimitPromise) this.rateLimitPromise = sleep(sec).then(() => { this.rateLimitPromise = null })
    return sec
  }

  constructor () {
    this.limiter.on('failed', async (error: FetchError | Error, jobInfo) => {
      // urql has some weird bug that first error is always an AbortError ???
      if (error.name === 'AbortError') return undefined
      if (jobInfo.retryCount > 8) return undefined

      if (error.message === 'Failed to fetch') return this.setRateLimit(6000)
      if (!(error instanceof FetchError)) return 0
      if (error.res.status === 500) return 1000

      const time = (parseInt(error.res.headers.get('retry-after') ?? '60') + 1) * 1000
      return this.setRateLimit(time)
    })
    // hacky but prevents query from re-running
    this.userlists.subscribe(() => undefined)
    this.continueIDs.subscribe(() => undefined)
  }

  viewer = writable<ViewerData | undefined>(safeLocalStorage('ALViewer'))

  userlists = derived<typeof this.viewer, OperationResultState<ResultOf<typeof UserLists>>>(this.viewer, (store, set) => {
    return queryStore({ client: this.client, query: UserLists, variables: { id: store?.viewer?.id } }).subscribe(set)
  })

  // these should be optimised to be called with ids.slice(index, index + perPage)
  continueIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    this.userlists.subscribe(values => {
      if (!values.data?.MediaListCollection?.lists) return []
      const mediaList = values.data.MediaListCollection.lists.reduce<NonNullable<NonNullable<NonNullable<NonNullable<ResultOf<typeof UserLists>['MediaListCollection']>['lists']>[0]>['entries']>>((filtered, list) => {
        return (list?.status === 'CURRENT' || list?.status === 'REPEATING') ? filtered.concat(list.entries) : filtered
      }, [])

      const ids = mediaList.filter(entry => {
        if (entry?.media?.status === 'FINISHED') return true
        const progress = entry?.progress ?? 0
        return progress < (entry?.media?.nextAiringEpisode?.episode ?? (progress + 2)) - 1
      }).map(entry => entry?.media?.id) as number[]

      if (arrayEqual(oldvalue, ids)) return
      oldvalue = ids
      set(ids)
    })
  })

  // this needs to be called with onList: false
  sequelIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    this.userlists.subscribe(values => {
      if (!values.data?.MediaListCollection?.lists) return []
      const mediaList = values.data.MediaListCollection.lists.find(list => list?.status === 'COMPLETED')?.entries
      if (!mediaList) return []

      const ids = [...new Set(mediaList.flatMap(entry => {
        return entry?.media?.relations?.edges?.filter(edge => edge?.relationType === 'SEQUEL')
      }).map(edge => edge?.node?.id))] as number[]

      if (arrayEqual(oldvalue, ids)) return
      oldvalue = ids
      set(ids)
    })
  })

  search (variables: VariablesOf<typeof Search>, pause?: boolean) {
    return queryStore({ client: this.client, query: Search, variables, pause })
  }

  schedule () {
    return queryStore({ client: this.client, query: Schedule, variables: { seasonCurrent: currentSeason, seasonYearCurrent: currentYear, seasonLast: lastSeason, seasonYearLast: lastYear, seasonNext: nextSeason, seasonYearNext: nextYear }, pause: true })
  }

  async toggleFav (id: number) {
    return await this.client.mutation(ToggleFavourite, { id })
  }

  async deleteEntry (id: number) {
    return await this.client.mutation(DeleteEntry, { id })
  }

  async entry (variables: VariablesOf<typeof Entry>) {
    return await this.client.mutation(Entry, variables)
  }

  following (id: number) {
    return queryStore({ client: this.client, query: Following, variables: { id } })
  }
}

// sveltekit/vite does the funny and evaluates at compile, this is a hack to fix development mode
const client = (typeof indexedDB !== 'undefined' && new AnilistClient()) as AnilistClient

// hydrating the cache re-starts all queries, it's better to wait for cache to hydrate, than waste rate limit on requests which are dumped anyways
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
await client.storagePromise?.promise

export default client

export function asyncStore<Result, Variables = AnyVariables> (query: TypedDocumentNode<Result, Variables>, variables: AnyVariables): Promise<Writable<Result>> {
  return new Promise((resolve, reject) => {
    const store = writable<Result>(undefined, () => () => subscription.unsubscribe())

    const subscription = client.client.query(query, variables).subscribe(value => {
      if (value.error) {
        reject(value.error)
      } else if (value.data) {
        store.set(value.data)
        resolve(store)
      }
    })
  })
}
