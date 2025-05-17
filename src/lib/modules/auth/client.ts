import { readable } from 'simple-store-svelte'
import { get } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'

import { client, episodes, type Media } from '../anilist'

import local from './local'

import type { Entry } from '../anilist/queries'
import type { VariablesOf } from 'gql.tada'

export default new class AuthAggregator {
  hasAuth = readable(this.checkAuth(), set => {
    // add other subscriptions here for MAL, kitsu, tvdb, etc
    const unsub = [
      client.viewer.subscribe(() => set(this.checkAuth()))
    ]

    return () => unsub.forEach(fn => fn())
  })

  syncSettings = persisted('syncSettings', { al: true, local: true })
  // AUTH

  anilist () {
    return !!client.viewer.value?.viewer?.id
  }

  checkAuth () {
    return this.anilist()
  }

  id () {
    if (this.anilist()) return client.viewer.value!.viewer?.id

    return -1
  }

  profile () {
    if (this.anilist()) return client.viewer.value?.viewer
  }

  // QUERIES/MUTATIONS

  schedule () {
    if (this.anilist()) return client.schedule()

    return local.schedule()
  }

  toggleFav (id: number) {
    if (this.anilist()) client.toggleFav(id)
    local.toggleFav(id)
  }

  delete (id: number) {
    if (this.anilist()) client.deleteEntry(id)

    local.deleteEntry(id)
  }

  following (id: number) {
    if (this.anilist()) return client.following(id)
  }

  planningIDs () {
    if (this.anilist()) return client.planningIDs

    return client.planningIDs
  }

  continueIDs () {
    if (this.anilist()) return client.continueIDs

    return client.continueIDs
  }

  sequelIDs () {
    if (this.anilist()) return client.sequelIDs

    return client.sequelIDs
  }

  watch (media: Media, progress: number) {
    // TODO: auto re-watch status
    // if (media.status !== 'FINISHED' && media.status !== 'RELEASING') return // this turned out to be a bad idea, anilist sometimes delays status changes by up to a day... yikes
    const totalEps = episodes(media) ?? 1 // episodes or movie which is single episode
    if (totalEps < progress) return // woah, bad data from resolver?!

    const currentProgress = media.mediaListEntry?.progress ?? 0
    if (currentProgress >= progress) return

    const status =
      totalEps === progress
        ? 'COMPLETED'
        : media.mediaListEntry?.status === 'REPEATING' ? 'REPEATING' : 'CURRENT'

    const repeat = (media.mediaListEntry?.repeat ?? 0) + (totalEps === progress ? 1 : 0)

    const lists = (media.mediaListEntry?.customLists as Array<{enabled: boolean, name: string}> | undefined)?.filter(({ enabled }) => enabled).map(({ name }) => name) ?? []

    this.entry({ id: media.id, progress, repeat, status, lists })
  }

  entry (variables: VariablesOf<typeof Entry>) {
    const syncSettings = get(this.syncSettings)
    variables.lists ??= []
    if (!variables.lists.includes('Watched using Hayase')) {
      variables.lists.push('Watched using Hayase')
    }

    if (this.anilist() && syncSettings.al) client.entry(variables)
    if (syncSettings.local) local.entry(variables)
  }
}()
