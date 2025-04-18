import { EventEmitter } from 'events'

import Client, { createChannelConstructor } from '@thaunknown/web-irc'
import { writable } from 'simple-store-svelte'

import { decryptMessage, encryptMessage } from './crypt'

import type IrcChannel from '@thaunknown/web-irc/channel'
import type { ChatMessage, ChatUser } from '$lib/components/ui/chat'

import { dev } from '$app/environment'

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

export default class MessageClient extends EventEmitter {
  irc = new Client(null)
  users = writable<Record<string, ChatUser>>({})
  messages = writable<ChatMessage[]>([])
  channel?: IrcChannel
  ident

  constructor (ident: ChatUser) {
    super()
    this.ident = ident
    this.irc.on('userlist', async ({ users }: { users: IRCUser[] }) => {
      this.users.value = users.reduce((acc, user) => {
        const [nick, pfpid, pfpex] = user.nick.split('_')
        const [type, id] = user.ident.split('_')
        acc[user.ident] = { nick, id, pfpid: `${pfpid}.${pfpex}`, type: type as 'al' | 'guest' }
        return acc
      }, this.users.value)
    })

    this.irc.on('join', async (user: IRCUser) => {
      try {
        const [nick, pfpid, pfpex] = user.nick.split('_')
        const [type, id] = user.ident.split('_')
        this.users.value[user.ident] = { nick, id, pfpid: `${pfpid}.${pfpex}`, type: type as 'al' | 'guest' }
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

    this.irc.on('privmsg', async (priv: PrivMessage) => {
      const message = await decryptMessage(priv.message)
      try {
        this.messages.update(messages => [...messages, {
          message,
          user: this.users.value[priv.ident],
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
      user: this.ident,
      message,
      date: new Date(),
      type: 'outgoing'
    }])
  }

  static async new ({ nick, id, pfpid, type }: ChatUser) {
    const client = new this({ nick, id, pfpid, type })

    await new Promise(resolve => {
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
