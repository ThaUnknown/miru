import Client, { createChannelConstructor } from '@thaunknown/web-irc'
import { writable } from 'simple-store-svelte'

import { decryptMessage, encryptMessage } from './crypt'

import type { ChatMessage, ChatUser } from '$lib/components/ui/chat'
import type IrcChannel from '@thaunknown/web-irc/channel'
import type IrcClient from '@thaunknown/web-irc/client'
import type { EventEmitter } from 'events'

export type UserType = 'al' | 'guest'
export interface IRCChatUser {
  nick: string
  id: string
  pfpid: string
  type: UserType
}
export function getPFP (user: Pick<IRCChatUser, 'id' | 'pfpid' | 'type'>) {
  if (user.type === 'al') {
    return `https://s4.anilist.co/file/anilistcdn/user/avatar/medium/b${user.id}-${user.pfpid}`
  } else {
    return 'https://s4.anilist.co/file/anilistcdn/user/avatar/medium/default.png'
  }
}

export interface IRCUser { nick: string, ident: string, hostname: string, modes: string[], tags: object }
export interface PrivMessage {
  from_server: boolean
  nick: string
  ident: string
  hostname: string
  target: string
  message: string
  outgoing?: boolean
  tags: {
    msgid: string
    time: string
  }
  time: number
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IRCEvents = {
  userlist: [{ users: IRCUser[] }]
  join: [IRCUser]
  part: [IRCUser]
  quit: [IRCUser]
  kick: [IRCUser]
  privmsg: [PrivMessage]
  connected: []
}

function ircUserToChatUser ({ id, pfpid, type, nick }: IRCChatUser): ChatUser {
  return { id, avatar: { medium: getPFP({ id, pfpid, type }) }, name: nick, mediaListOptions: null }
}

function ircIdentToChatUser (user: IRCUser): ChatUser {
  const [nick, pfpid, pfpex] = user.nick.split('_') as [string, string, string]
  const [type, id] = user.ident.split('_') as ['al' | 'guest', string]
  return ircUserToChatUser({ id, pfpid: `${pfpid}.${pfpex}`, type, nick })
}

export default class MessageClient {
  irc = new Client(null) as IrcClient & EventEmitter<IRCEvents>
  users = writable<Record<string, ChatUser>>({})
  messages = writable<ChatMessage[]>([])
  channel?: IrcChannel
  ident

  constructor (ident: IRCChatUser) {
    this.ident = ident
    this.irc.on('userlist', async ({ users }) => {
      this.users.value = users.reduce((acc, ircuser) => {
        const user = ircIdentToChatUser(ircuser)
        acc[ircuser.ident] = user
        return acc
      }, this.users.value)
    })

    this.irc.on('join', async ircuser => {
      try {
        const user = ircIdentToChatUser(ircuser)
        this.users.value[ircuser.ident] = user
        this.users.update(users => users)
      } catch (error) {
        console.error(error)
      }
    })

    const deleteUser = (user: IRCUser) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.users.value[user.ident]
      this.users.update(users => users)
    }
    this.irc.on('quit', deleteUser)
    this.irc.on('part', deleteUser)
    this.irc.on('kick', deleteUser)

    this.irc.on('privmsg', async priv => {
      try {
        const message = await decryptMessage(priv.message)
        this.messages.update(messages => [...messages, {
          message,
          user: this.users.value[priv.ident]!,
          type: 'incoming',
          date: new Date(priv.time)
        }])
      } catch (e) {
        // some1 sent a message without encryption
        console.error(e)
      }
    })
  }

  async say (message: string) {
    const encrypted = await encryptMessage(message)
    this.channel!.say(encrypted)
    this.messages.update(messages => [...messages, {
      user: ircUserToChatUser(this.ident),
      message,
      date: new Date(),
      type: 'outgoing'
    }])
  }

  static async new ({ nick, id, pfpid, type }: IRCChatUser) {
    const client = new this({ nick, id, pfpid, type })

    await new Promise<void>(resolve => {
      client.irc.once('connected', resolve)
      client.irc.connect({
        version: null,
        enable_chghost: true,
        enable_setname: true,
        message_max_length: 350,
        host: 'irc.swiftirc.net',
        port: 5004,
        tls: true,
        path: '',
        password: '',
        account: {},
        nick: `${nick.replaceAll('_', '')}_${pfpid.replace('.', '_')}`,
        username: `${type}_${id}`,
        gecos: 'https://kiwiirc.com/',
        encoding: 'utf8',
        auto_reconnect: true,
        transport: createChannelConstructor('http://do-e.clients.kiwiirc.com/webirc/kiwiirc/', '', '1') // this people are dumb enough to not refresh the ssl cert so don't use https
      })
    })

    await new Promise(resolve => {
      client.irc.once('join', resolve)
      client.channel = client.irc.channel('#4e63ad91532eb8849330')
    })
    return client
  }
}
