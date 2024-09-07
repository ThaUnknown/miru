import { Client } from 'discord-rpc'
import { ipcMain } from 'electron'
import { debounce } from '@/modules/util.js'

export default class Discord {
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

  discord = new Client({ transport: 'ipc' })

  /** @type {Discord['defaultStatus'] | undefined} */
  enableRPC
  /** @type {Discord['defaultStatus'] | undefined} */
  allowDiscordDetails
  /** @type {Discord['defaultStatus'] | undefined} */
  cachedPresence

  /** @param {import('electron').BrowserWindow} window */
  constructor (window) {
    ipcMain.on('show-discord-status', (event, data) => {
      this.allowDiscordDetails = data
      this.debouncedDiscordRPC(this.allowDiscordDetails ? this.cachedPresence : undefined)
    })

    ipcMain.on('discord', (event, data) => {
      this.cachedPresence = data
      this.debouncedDiscordRPC(this.allowDiscordDetails ? this.cachedPresence : undefined)
    })

    ipcMain.on('discord-rpc', (event, data) => {
      if (this.enableRPC !== data) {
        this.enableRPC = data
        if (data && !this.discord?.user) {
          this.loginRPC()
        } else {
          this.logoutRPC()
        }
      }
    })

    this.discord.on('ready', async () => {
      this.setDiscordRPC(this.cachedPresence || this.defaultStatus)
      this.discord.subscribe('ACTIVITY_JOIN_REQUEST')
      this.discord.subscribe('ACTIVITY_JOIN')
      this.discord.subscribe('ACTIVITY_SPECTATE')
    })

    this.discord.on('ACTIVITY_JOIN', ({ secret }) => {
      window.webContents.send('w2glink', secret)
    })

    this.debouncedDiscordRPC = debounce(status => this.setDiscordRPC(status), 4500)
  }

  loginRPC () {
    this.discord.login({ clientId: '954855428355915797' }).catch(() => {
      setTimeout(() => this.loginRPC(), 5000).unref()
    })
  }

  logoutRPC () {
    if (this.discord?.user) {
      this.discord.clearActivity(process.pid)
    }
  }

  setDiscordRPC (data = this.defaultStatus) {
    if (this.discord.user && data && this.enableRPC) {
      data.pid = process.pid
      this.discord.request('SET_ACTIVITY', data)
    }
  }
}
