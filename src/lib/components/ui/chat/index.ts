import type { Viewer } from '$lib/modules/anilist/queries'
import type { ResultOf } from 'gql.tada'

export type ChatUser = Omit<NonNullable<ResultOf<typeof Viewer>['Viewer']>, 'id'> & { id: string | number }

export interface ChatMessage {
  message: string
  user: ChatUser
  type: 'incoming' | 'outgoing'
  date: Date
}

export { default as UserList } from './UserList.svelte'
export { default as Messages } from './Messages.svelte'
