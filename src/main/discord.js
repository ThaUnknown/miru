import { Client } from 'discord-rpc'
import { ipcMain } from 'electron'

export default class {
  window
  status
  discord
  requestedDiscordDetails
  allowDiscordDetails
  rpcStarted
  cachedPresence

  /**
   * @param {import('electron').BrowserWindow} window
   */
  constructor (window) {
    this.window = window
    this.discord = new Client({
      transport: 'ipc'
    })
    ipcMain.on('discord_status', (event, data) => {
      this.requestedDiscordDetails = data
      if (!this.rpcStarted) {
        this.handleRPC()
        setInterval(this.handleRPC.bind(this), 5000) // According to Discord documentation, clients can only update their presence 5 times per 20 seconds. We will add an extra second to be safe.
        this.rpcStarted = true
      }
    })

    ipcMain.on('discord', (event, data) => {
      this.cachedPresence = data
      if (this.allowDiscordDetails) {
        this.setDiscordRPC(data)
      }
    })

    this.discord.on('ready', async () => {
      this.setDiscordRPC(this.status)
      this.discord.subscribe('ACTIVITY_JOIN_REQUEST')
      this.discord.subscribe('ACTIVITY_JOIN')
      this.discord.subscribe('ACTIVITY_SPECTATE')
    })
    this.discord.on('ACTIVITY_JOIN', (args) => {
      this.window.webContents.send('w2glink', args.secret)
    })

    this.loginRPC()
  }

  loginRPC () {
    this.discord.login({ clientId: '954855428355915797' }).catch(() => {
      setTimeout(this.loginRPC.bind(this), 5000).unref()
    })
  }

  setDiscordRPC (data = {
    activity: {
      timestamps: {
        start: Date.now()
      },
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
  }) {
    this.status = data
    if (this.discord.user && this.status) {
      this.status.pid = process.pid
      this.discord.request('SET_ACTIVITY', this.status)
    }
  }

  handleRPC () {
    if (this.allowDiscordDetails === this.requestedDiscordDetails) return

    this.allowDiscordDetails = this.requestedDiscordDetails
    if (!this.allowDiscordDetails) {
      this.setDiscordRPC(null)
    } else if (this.cachedPresence) {
      this.setDiscordRPC(this.cachedPresence)
    }
  }
}
