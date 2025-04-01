import { readable } from 'simple-store-svelte'

import { client } from '../anilist'

import type { VariablesOf } from 'gql.tada'
import type { Entry } from '../anilist/queries'

export default new class AuthAggregator {
  hasAuth = readable(this.checkAuth(), set => {
    // add other subscriptions here
    const unsAL = client.viewer.subscribe(() => set(this.checkAuth()))

    return () => {
      unsAL()
    }
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

    return null
  }

  // QUERIES/MUTATIONS

  schedule () {
    if (this.anilist()) return client.schedule()

    return client.schedule()
  }

  toggleFav (id: number) {
    if (this.anilist()) return client.toggleFav(id)

    return client.toggleFav(id)
  }

  delete (id: number) {
    if (this.anilist()) return client.deleteEntry(id)

    return client.deleteEntry(id)
  }

  following (id: number) {
    if (this.anilist()) return client.following(id)

    return client.following(id)
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
    if (this.anilist()) return client.entry(variables)

    return client.entry(variables)
  }
}()
