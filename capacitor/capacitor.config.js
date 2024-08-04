const mode = process.env.NODE_ENV?.trim() || 'development'

const config = {
  appId: 'watch.miru',
  appName: 'Miru',
  webDir: 'build',
  android: {
    buildOptions: {
      keystorePath: './watch.miru',
      keystorePassword: '',
      keystoreAlias: 'watch.miru'
    },
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: { launchShowDuration: 0 },
    CapacitorHttp: { enabled: false },
    CapacitorNodeJS: { nodeDir: 'nodejs' }
  },
  server: {
    cleartext: true
  }
}

if (mode === 'development') config.server.url = 'http://localhost:5001/index.html'

module.exports = config
