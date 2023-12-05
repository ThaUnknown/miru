const mode = process.env.NODE_ENV?.trim() || 'development'

const config = {
  appId: 'watch.miru',
  appName: 'Miru',
  webDir: 'build',
  bundledWebRuntime: false,
  android: {
    buildOptions: {
      keystorePath: './watch.miru',
      keystorePassword: '',
      keystoreAlias: 'watch.miru'
    }
  },
  plugins: {
    SplashScreen: { launchShowDuration: 0 },
    CapacitorHttp: { enabled: false },
    CapacitorNodeJS: { nodeDir: 'nodejs' }
  }
}

if (mode === 'development') {
  config.server = {
    url: 'http://localhost:5001/index.html',
    cleartext: true
  }
}
module.exports = config
