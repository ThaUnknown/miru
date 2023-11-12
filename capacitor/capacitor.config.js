const config = {
  appId: 'watch.miru',
  appName: 'Miru',
  webDir: 'public',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    CapacitorHttp: {
      enabled: false
    }
  },
  // remove server section before making production build
  server: {
    // for android only, below settings will work out of the box
    // for iOS or both, change the url to http://your-device-ip
    // To discover your workstation IP, just run ifconfig
    url: 'http://localhost:5001/app.html',
    cleartext: true
  }
}
module.exports = config
