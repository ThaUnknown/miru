import { readable, writable } from 'simple-store-svelte'

import type { Media } from '../anilist'
import type { KitsuOAuth } from './kitsu-types'
import type { Entry } from '../anilist/queries'
import type { VariablesOf } from 'gql.tada'

import { safeLocalStorage } from '$lib/utils'

const ENDPOINTS = {
  API_OAUTH: 'https://kitsu.app/api/oauth/token',
  API_USER_FETCH: 'https://kitsu.app/api/edge/users',
  API_USER_LIBRARY: 'https://kitsu.app/api/edge/library-entries'
}

export default new class KitsuSync {
  auth = writable<KitsuOAuth | undefined>(safeLocalStorage('kitsuAuth'))
  viewer = writable<{id: number} | undefined>(safeLocalStorage('kitsuViewer'))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _request (url: string, method: string, body?: any): Promise<any> {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
          Authorization: this.auth.value ? `Bearer ${this.auth.value.access_token}` : ''
        },
        body: JSON.stringify(body)
      })

      if (res.status === 403 && !body?.refresh_token) {
        await this._refresh()
        return await this._request(url, method, body)
      }

      return await res.json()
    } catch (error) {
      // TODO: :^)
      const err = error as Error
      throw err
    }
  }

  async _refresh () {
    try {
      const data = await this._request(
        ENDPOINTS.API_OAUTH,
        'POST',
        {
          grant_type: 'refresh_token',
          refresh_token: this.auth.value?.refresh_token
        }
      )
      this.viewer.value = data
      await this._user()
    } catch (error) {
      this.viewer.value = undefined
    }
  }

  async _login (username: string, password: string) {
    const data = await this._request(
      ENDPOINTS.API_OAUTH,
      'POST',
      {
        grant_type: 'password',
        username,
        password
      }
    )

    this.viewer.value = data
    await this._user()
  }

  async _user () {
    const data = await this._request(
      ENDPOINTS.API_USER_FETCH,
      'GET',
      { 'filter[self]': true }
    )

    const [user] = data

    return user.id
  }

  async _getEntry (id: number) {
    const data = await this._request(
      ENDPOINTS.API_USER_LIBRARY,
      'GET',
      {
        'filter[animeId]': id,
        'filter[userId]': this.viewer.value?.id,
        'filter[kind]': 'anime'
      }
    )

    const [anime] = data.data

    return anime
  }

  async _addEntry (id: number, attributes: Record<string, unknown>) {
    const data = await this._request(
      ENDPOINTS.API_USER_LIBRARY,
      'POST',
      {
        data: {
          attributes: {
            status: 'planned'
          },
          relationships: {
            anime: {
              data: {
                id,
                type: 'anime'
              }
            },
            user: {
              data: {
                id: this.viewer.value?.id,
                type: 'users'
              }
            }
          },
          type: 'library-entries'
        }
      }
    )

    return data
  }

  async _updateEntry (id: number, attributes: Record<string, unknown>) {
    const data = await this._request(
      `${ENDPOINTS.API_USER_LIBRARY}/${id}`,
      'PATCH', {
        data: {
          id,
          attributes,
          type: 'library-entries'
        }
      }
    )
    return data
  }

  async _deleteEntry (id: number) {
    this._request(
      `${ENDPOINTS.API_USER_LIBRARY}/${id}`,
      'DELETE'
    )
  }

  hasAuth = readable(false)

  id () {
    return -1
  }

  profile () {
  }

  // QUERIES/MUTATIONS

  schedule () {
  }

  toggleFav (id: number) {
  }

  delete (id: number) {
  }

  following (id: number) {
  }

  planningIDs () {
  }

  continueIDs () {
  }

  sequelIDs () {
  }

  watch (media: Media, progress: number) {
  }

  entry (variables: VariablesOf<typeof Entry>) {
  }
}()
