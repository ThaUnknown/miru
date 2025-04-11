import { readable } from 'simple-store-svelte'

import { client } from '../anilist'

import local from './local'

import type { VariablesOf } from 'gql.tada'
import type { Entry } from '../anilist/queries'

export default new class AuthAggregator {
  hasAuth = readable(this.checkAuth(), set => {
    // add other subscriptions here for MAL, kitsu, tvdb, etc
    const unsub = [
      client.viewer.subscribe(() => set(this.checkAuth()))
    ]

    return () => unsub.forEach(fn => fn())
  })

  // AUTH

  anilist () {
    return !!client.viewer.value
  }

  checkAuth () {
    return this.anilist()
  }

  id () {
    if (this.anilist()) return client.viewer.value?.viewer?.id

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

  continueIDs () {
    if (this.anilist()) return client.continueIDs

    return client.continueIDs
  }

  sequelIDs () {
    if (this.anilist()) return client.sequelIDs

    return client.sequelIDs
  }

  entry (variables: VariablesOf<typeof Entry>) {
    variables.lists ??= []
    if (!variables.lists.includes('Watched using Hayase')) {
      variables.lists.push('Watched using Hayase')
    } else {
      delete variables.lists
    }
    if (this.anilist()) client.entry(variables)

    local.entry(variables)
  }
}()
