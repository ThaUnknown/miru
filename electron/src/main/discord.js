import { Client } from 'discord-rpc'
import { ipcMain } from 'electron'
import { debounce } from '@/modules/util.js'

export default class {
  window
  defaultStatus = {
    activity: {
      timestamps: { start: Date.now() },
      details: 'Stream anime torrents, real-time.',
      state: 'Watching anime',
      assets: {
        small_image: 'logo',
        small_text: 'https://github.com/ThaUnknown/miru'
      },
      buttons: [
        {
          label: 'Download app',
          url: 'https://github.com/ThaUnknown/miru/releases/latest'
        }
      ],
      instance: true,
      type: 3
    }
  }

  discord
  requestedDiscordDetails
  allowDiscordDetails
  cachedPresence

  /**
   * @param {import('electron').BrowserWindow} window
   */
  constructor (window) {
    this.window = window
    this.discord = new Client({
      transport: 'ipc'
    })

    ipcMain.on('show-discord-status', (event, data) => {
      this.allowDiscordDetails = data
      this.debouncedDiscordRPC(this.allowDiscordDetails ? this.cachedPresence : undefined)
    })

    ipcMain.on('discord', (event, data) => {
      this.cachedPresence = data
      this.debouncedDiscordRPC(this.allowDiscordDetails ? this.cachedPresence : undefined)
    })

    this.discord.on('ready', async () => {
      this.setDiscordRPC(this.cachedPresence || this.defaultStatus)
      this.discord.subscribe('ACTIVITY_JOIN_REQUEST')
      this.discord.subscribe('ACTIVITY_JOIN')
      this.discord.subscribe('ACTIVITY_SPECTATE')
    })

    this.discord.on('ACTIVITY_JOIN', ({ secret }) => {
      this.window.webContents.send('w2glink', secret)
    })

    this.loginRPC()

    this.debouncedDiscordRPC = debounce(status => this.setDiscordRPC(status), 4500)
  }

  loginRPC () {
    this.discord.login({ clientId: '954855428355915797' }).catch(() => {
      setTimeout(() => this.loginRPC(), 5000).unref()
    })
  }

  setDiscordRPC (data = this.defaultStatus) {
    if (this.discord.user && data) {
      data.pid = process.pid
      this.discord.request('SET_ACTIVITY', data)
    }
  }
}
