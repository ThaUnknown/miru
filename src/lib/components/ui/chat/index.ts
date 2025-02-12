export type UserType = 'al' | 'guest'

export interface ChatUser {
  nick: string
  id: string
  pfpid: string
  type: UserType
}

export interface ChatMessage {
  message: string
  user: ChatUser
  type: 'incoming' | 'outgoing'
  date: Date
}

export function getPFP (user: ChatUser) {
  if (user.type === 'al') {
    return `https://s4.anilist.co/file/anilistcdn/user/avatar/medium/b${user.id}-${user.pfpid}`
  } else {
    return 'https://s4.anilist.co/file/anilistcdn/user/avatar/medium/default.png'
  }
}

export { default as UserList } from './UserList.svelte'
export { default as Messages } from './Messages.svelte'
