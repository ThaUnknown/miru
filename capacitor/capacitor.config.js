let config = {
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
    SplashScreen: { launchShowDuration: 150 },
    CapacitorHttp: { enabled: false }
  }
}

switch (process.env.NODE_ENV) {
  case 'qa':
    config = {
      ...config
    }
    break
  default:
    config = {
      ...config
      // server: {
      //   url: 'http://localhost:5001/index.html',
      //   cleartext: true
      // }
    }
    break
}

module.exports = config
