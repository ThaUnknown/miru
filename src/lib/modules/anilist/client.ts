import { authExchange } from '@urql/exchange-auth'
import { offlineExchange } from '@urql/exchange-graphcache'
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage'
import { refocusExchange } from '@urql/exchange-refocus'
import { Client, fetchExchange, queryStore, type OperationResultState, gql as _gql } from '@urql/svelte'
import Bottleneck from 'bottleneck'
import lavenshtein from 'js-levenshtein'
import { writable as _writable } from 'simple-store-svelte'
import { derived, readable, writable, type Writable } from 'svelte/store'
import { toast } from 'svelte-sonner'

import gql from './gql'
import { CommentFrag, Comments, CustomLists, DeleteEntry, DeleteThreadComment, Entry, Following, FullMedia, FullMediaList, IDMedia, SaveThreadComment, Schedule, Search, ThreadFrag, Threads, ToggleFavourite, ToggleLike, UserLists, Viewer } from './queries'
import schema from './schema.json' with { type: 'json' }
import { currentSeason, currentYear, lastSeason, lastYear, nextSeason, nextYear } from './util'

import type { Media } from './types'
import type { ResultOf, VariablesOf } from 'gql.tada'
import type { AnyVariables, OperationContext, RequestPolicy, TypedDocumentNode } from 'urql'

import { dev } from '$app/environment'
import native from '$lib/modules/native'
import { safeLocalStorage, sleep } from '$lib/utils'

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

function getDistanceFromTitle (media: Media & {lavenshtein?: number}, name: string) {
  const titles = Object.values(media.title ?? {}).filter(v => v).map(title => lavenshtein(title!.toLowerCase(), name.toLowerCase()))
  const synonyms = (media.synonyms ?? []).filter(v => v).map(title => lavenshtein(title!.toLowerCase(), name.toLowerCase()) + 2)
  const distances = [...titles, ...synonyms]
  const min = distances.reduce((prev, curr) => prev < curr ? prev : curr)
  media.lavenshtein = min
  return media as Media & {lavenshtein: number}
}

class AnilistClient {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  storagePromise = Promise.withResolvers<void>()
  storage = makeDefaultStorage({
    idbName: 'graphcache-v3',
    onCacheHydrated: () => this.storagePromise.resolve(),
    maxAge: 14 // The maximum age of the persisted data in days
  })

  client = new Client({
    url: 'https://graphql.anilist.co',
    // fetch: dev ? fetch : (req: RequestInfo | URL, opts?: RequestInit) => this.handleRequest(req, opts),
    fetch: (req: RequestInfo | URL, opts?: RequestInit) => this.handleRequest(req, opts),
    exchanges: [
      refocusExchange(),
      offlineExchange({
        schema: schema as Parameters<typeof offlineExchange>[0]['schema'],
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
                    entries: list.entries.filter(entry => entry?.media?.mediaListEntry?.id !== id)
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
                mediaListEntry: entry ?? null
              })
              cache.updateQuery({ query: UserLists, variables: { id: this.viewer.value?.viewer?.id } }, data => {
                if (!data?.MediaListCollection?.lists) return data
                const oldLists = data.MediaListCollection.lists
                const oldEntry = oldLists.flatMap(list => list?.entries).find(entry => entry?.media?.id === mediaId) ?? { id: -1, media: cache.readFragment(FullMedia, { id: mediaId as number, __typename: 'Media' }) }
                if (!oldEntry.media) return data

                const lists = oldLists.map(list => {
                  if (!list?.entries) return list
                  return {
                    ...list,
                    entries: list.entries.filter(entry => entry?.media?.id !== mediaId)
                  }
                })

                const status = result.SaveMediaListEntry?.status ?? oldEntry.media.mediaListEntry?.status ?? 'PLANNING' as const

                const fallback: NonNullable<typeof oldLists[0]> = { status, entries: [] }
                let targetList = lists.find(list => list?.status === status)
                if (!targetList) {
                  lists.push(fallback)
                  targetList = fallback
                }
                if (!targetList.entries) targetList.entries = []
                targetList.entries.push(oldEntry)
                return { ...data, MediaListCollection: { ...data.MediaListCollection, lists } }
              })
            },
            SaveThreadComment: (_result, args, cache, _info) => {
              if (_info.variables.rootCommentId) {
                const id = _info.variables.rootCommentId as number
                cache.invalidate({
                  __typename: 'ThreadComment',
                  id
                })
              } else {
                cache.invalidate('ThreadComment')
              }
            },
            DeleteThreadComment: (_result, args, cache, _info) => {
              const id = (_info.variables.rootCommentId ?? args.id) as number
              cache.invalidate({
                __typename: 'ThreadComment',
                id
              })
            }
          }
        },
        resolvers: {
          Query: {
            Media: (parent, { id }) => ({ __typename: 'Media', id }),
            Thread: (parent, { id }) => ({ __typename: 'Thread', id })
          }
        },
        optimistic: {
          ToggleFavourite ({ animeId }, cache, info) {
            const id = animeId as number
            const media = cache.readFragment(FullMedia, { id, __typename: 'Media' })
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
            const media = cache.readFragment(FullMedia, { id, __typename: 'Media' })
            if (!media) return null
            info.partial = true

            return {
              status: 'PLANNING' as const,
              progress: 0,
              repeat: 0,
              score: 0,
              id: -1,
              ...media.mediaListEntry,
              customLists: (args.customLists as string[]).map(name => ({ enabled: true, name })),
              ...args,
              media,
              __typename: 'MediaList'
            }
          },
          ToggleLikeV2 ({ id, type }, cache, info) {
            const threadOrCommentId = id as number
            const likable = type as 'THREAD' | 'THREAD_COMMENT' | 'ACTIVITY' | 'ACTIVITY_REPLY'

            const typename = likable === 'THREAD' ? 'Thread' : 'ThreadComment'

            const likableUnion = cache.readFragment(likable === 'THREAD' ? ThreadFrag : CommentFrag, { id: threadOrCommentId, __typename: typename })

            if (!likableUnion) return null

            return {
              id: threadOrCommentId,
              isLiked: !likableUnion.isLiked,
              likeCount: likableUnion.likeCount + (likableUnion.isLiked ? -1 : 1),
              __typename: typename
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
          MediaListCollection: e => (e.user as {id: string | null}).id,
          MediaListGroup: () => null,
          UserAvatar: () => null,
          UserOptions: () => null,
          UserStatisticTypes: () => null,
          UserGenreStatistic: () => null,
          UserStatistics: () => null
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
            return error.graphQLErrors.some(e => e.extensions.code === 'FORBIDDEN') // TODO: verify how anilist handles auth errors: {"data":null,"errors":[{"message":"Invalid token","status":400}]}
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
    const res = await native.authAL(`https://anilist.co/api/v2/oauth/authorize?client_id=${dev ? 26159 : 3461}&response_type=token`)
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
    toast.error('Anilist Error', { description: 'Rate limit exceeded, retrying in ' + Math.round(sec / 1000) + ' seconds.' })
    if (!this.rateLimitPromise) this.rateLimitPromise = sleep(sec).then(() => { this.rateLimitPromise = null })
    return sec
  }

  constructor () {
    this.limiter.on('failed', async (error: FetchError | Error, jobInfo) => {
      // urql has some weird bug that first error is always an AbortError ???
      if (error.name === 'AbortError') return undefined
      if (jobInfo.retryCount > 8) return undefined

      if (error.message === 'Failed to fetch') return this.setRateLimit(60000)
      if (!(error instanceof FetchError)) return 0
      if (error.res.status === 500) return 1000

      return this.setRateLimit((parseInt(error.res.headers.get('retry-after') ?? '60') + 1) * 1000)
    })
    // hacky but prevents query from re-running
    this.userlists.subscribe(() => undefined)
    this.continueIDs.subscribe(() => undefined)
  }

  viewer = _writable<ViewerData | undefined>(safeLocalStorage('ALViewer'))

  userlists = derived<typeof this.viewer, OperationResultState<ResultOf<typeof UserLists>>>(this.viewer, (store, set) => {
    return queryStore({ client: this.client, query: UserLists, variables: { id: store?.viewer?.id } }).subscribe(set)
  })

  // WARN: these 3 sections are hacky, i use oldvalue to prevent re-running loops, I DO NOT KNOW WHY THE LOOPS HAPPEN!
  // TODO: these should be optimised to be called with ids.slice(index, index + perPage)
  continueIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    const sub = this.userlists.subscribe(values => {
      if (!values.data?.MediaListCollection?.lists) return []
      const mediaList = values.data.MediaListCollection.lists.reduce<NonNullable<NonNullable<NonNullable<NonNullable<ResultOf<typeof UserLists>['MediaListCollection']>['lists']>[0]>['entries']>>((filtered, list) => {
        return (list?.status === 'CURRENT' || list?.status === 'REPEATING') ? filtered.concat(list.entries) : filtered
      }, [])

      const ids = mediaList.filter(entry => {
        if (entry?.media?.status === 'FINISHED') return true
        const progress = entry?.media?.mediaListEntry?.progress ?? 0
        return progress < (entry?.media?.nextAiringEpisode?.episode ?? (progress + 2)) - 1
      }).map(entry => entry?.media?.id) as number[]

      if (arrayEqual(oldvalue, ids)) return
      oldvalue = ids
      set(ids)
    })
    return sub
  })

  // TODO: this needs to be called with onList: false
  sequelIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    const sub = this.userlists.subscribe(values => {
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
    return sub
  })

  planningIDs = readable<number[]>([], set => {
    let oldvalue: number[] = []
    const sub = this.userlists.subscribe(userLists => {
      if (!userLists.data?.MediaListCollection?.lists) return []
      const mediaList = userLists.data.MediaListCollection.lists.find(list => list?.status === 'PLANNING')?.entries
      if (!mediaList) return []
      const ids = mediaList.map(entry => entry?.media?.id) as number[]

      if (arrayEqual(oldvalue, ids)) return
      oldvalue = ids
      set(ids)
    })
    return sub
  })

  search (variables: VariablesOf<typeof Search>, pause?: boolean) {
    return queryStore({ client: this.client, query: Search, variables, pause })
  }

  async searchCompound (flattenedTitles: Array<{key: string, title: string, year?: string, isAdult: boolean}>) {
    if (!flattenedTitles.length) return []
    // isAdult doesn't need an extra variable, as the title is the same regardless of type, so we re-use the same variable for adult and non-adult requests

    const requestVariables = flattenedTitles.reduce<Record<`v${number}`, string>>((obj, { title, isAdult }, i) => {
      if (isAdult && i !== 0) return obj
      obj[`v${i}`] = title
      return obj
    }, {})

    const queryVariables = flattenedTitles.reduce<string[]>((arr, { isAdult }, i) => {
      if (isAdult && i !== 0) return arr
      arr.push(`$v${i}: String`)
      return arr
    }, []).join(', ')
    const fragmentQueries = flattenedTitles.map(({ year, isAdult }, i) => /* js */`
    v${i}: Page(perPage: 10) {
      media(type: ANIME, search: $v${(isAdult && i !== 0) ? i - 1 : i}, status_in: [RELEASING, FINISHED], isAdult: ${!!isAdult} ${year ? `, seasonYear: ${year}` : ''}) {
        ...med
      }
    }`).join(',')

    const query = _gql/* gql */`
    query(${queryVariables}) {
      ${fragmentQueries}
    }
    
    fragment med on Media {
      id,
      title {
        romaji,
        english,
        native
      },
      synonyms
    }`

    const res = await this.client.query<Record<string, {media: Media[]}>>(query, requestVariables)

    const searchResults: Record<string, number> = {}
    for (const [variableName, { media }] of Object.entries(res.data!)) {
      if (!media.length) continue
      const titleObject = flattenedTitles[Number(variableName.slice(1))]!
      if (searchResults[titleObject.key]) continue
      searchResults[titleObject.key] = media.map(media => getDistanceFromTitle(media, titleObject.title)).reduce((prev, curr) => prev.lavenshtein <= curr.lavenshtein ? prev : curr).id
    }

    const ids = Object.values(searchResults)
    const search = await this.client.query(Search, { ids, perPage: 50 })
    return Object.entries(searchResults).map(([filename, id]) => [filename, search.data!.Page!.media!.find(media => media!.id === id)]) as Array<[string, Media | undefined]>
  }

  schedule (ids?: number[]) {
    return queryStore({ client: this.client, query: Schedule, variables: { ids, seasonCurrent: currentSeason, seasonYearCurrent: currentYear, seasonLast: lastSeason, seasonYearLast: lastYear, seasonNext: nextSeason, seasonYearNext: nextYear }, pause: true })
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

  async single (id: number, requestPolicy: RequestPolicy = 'cache-first') {
    return await this.client.query(IDMedia, { id }, { requestPolicy })
  }

  following (animeID: number) {
    return queryStore({ client: this.client, query: Following, variables: { id: animeID } })
  }

  threads (animeID: number, page = 1) {
    return queryStore({ client: this.client, query: Threads, variables: { id: animeID, page, perPage: 16 } })
  }

  comments (threadId: number, page = 1) {
    return queryStore({ client: this.client, query: Comments, variables: { threadId, page } })
  }

  async toggleLike (id: number, type: 'THREAD' | 'THREAD_COMMENT' | 'ACTIVITY' | 'ACTIVITY_REPLY', wasLiked: boolean) {
    return await this.client.mutation(ToggleLike, { id, type, wasLiked })
  }

  async comment (variables: VariablesOf<typeof SaveThreadComment> & { rootCommentId?: number }) {
    return await this.client.mutation(SaveThreadComment, variables)
  }

  async deleteComment (id: number, rootCommentId: number) {
    return await this.client.mutation(DeleteThreadComment, { id, rootCommentId })
  }
}

// sveltekit/vite does the funny and evaluates at compile, this is a hack to fix development mode
const client = (typeof indexedDB !== 'undefined' && new AnilistClient()) as AnilistClient

// hydrating the cache re-starts all queries, it's better to wait for cache to hydrate, than waste rate limit on requests which are dumped anyways
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
await client.storagePromise?.promise

export default client

export function asyncStore<Result, Variables = AnyVariables> (query: TypedDocumentNode<Result, Variables>, variables: AnyVariables, context?: Partial<OperationContext>): Promise<Writable<Result>> {
  return new Promise((resolve, reject) => {
    const store = writable<Result>(undefined, () => () => subscription.unsubscribe())

    const subscription = client.client.query(query, variables, context).subscribe(value => {
      if (value.error) {
        reject(value.error)
      } else if (value.data) {
        store.set(value.data)
        resolve(store)
      }
    })
  })
}
