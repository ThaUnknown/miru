const webpack = require('webpack')
const commonConfig = require('common/webpack.config.cjs')
const { merge } = require('webpack-merge')
const { join, resolve } = require('path')

/** @type {import('webpack').Configuration} */
const capacitorConfig = {
  entry: [join(__dirname, 'src', 'webtorrent.js')],
  plugins: [
    new webpack.ProvidePlugin({
      process: 'webtorrent/polyfills/process-fast.js',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      global: 'globalThis'
    })
  ],
  devServer: {
    devMiddleware: {
      writeToDisk: true
    },
    hot: true,
    client: {
      overlay: { errors: true, warnings: false, runtimeErrors: false }
    },
    port: 5001
  }
}
const alias = {
  '@/modules/ipc.js': join(__dirname, 'src', 'ipc.js'),
  'webtorrent/lib/utp.cjs': false,
  '@silentbot1/nat-api': false,
  fs: false,
  http: 'stream-http',
  https: 'stream-http',
  'load-ip-set': false,
  net: join(__dirname, 'src', 'chrome-net.js'),
  dgram: join(__dirname, 'src', 'chrome-dgram.js'),
  util: 'util',
  assert: 'assert',
  os: false,
  ws: false,
  ut_pex: 'ut_pex',
  'bittorrent-dht': false,
  path: 'path-esm',
  'fs-chunk-store': 'hybrid-chunk-store',
  stream: 'stream-browserify',
  timers: 'timers-browserify',
  crypto: 'crypto-browserify',
  buffer: 'buffer',
  'bittorrent-tracker': 'bittorrent-tracker',
  querystring: 'querystring',
  zlib: 'webtorrent/polyfills/inflate-sync-web.js',
  'bittorrent-tracker/lib/client/http-tracker.js': resolve('../node_modules/bittorrent-tracker/lib/client/http-tracker.js')
}

module.exports = merge(commonConfig(__dirname, alias, 'chromeapp'), capacitorConfig)
