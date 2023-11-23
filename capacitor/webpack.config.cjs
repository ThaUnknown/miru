const webpack = require('webpack')
const commonConfig = require('common/webpack.config.cjs')
const { merge } = require('webpack-merge')
const { join, resolve } = require('path')

const mode = process.env.NODE_ENV?.trim() || 'development'

/** @type {import('webpack').Configuration} */
const capacitorConfig = {
  entry: [join(__dirname, 'src', 'main.js')],
  mode,
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
  fs: false,
  ws: false,
  'default-gateway': false,
  'load-ip-set': false,
  'node-fetch': false,
  'webtorrent/lib/utp.cjs': false,
  '@/modules/ipc.js': join(__dirname, 'src', 'ipc.js'),
  '@/modules/support.js': join(__dirname, 'src', 'support.js'),
  net: join(__dirname, 'src', 'chrome-net.js'),
  dgram: join(__dirname, 'src', 'chrome-dgram.js'),
  os: 'capacitor-os-interfaces-hack',
  dns: 'capacitor-dns',
  http: 'stream-http',
  https: 'stream-http',
  'utp-native': false,
  socks: false,
  assert: 'assert',
  ut_pex: 'ut_pex',
  path: 'path-esm',
  'fs-chunk-store': 'hybrid-chunk-store',
  stream: 'stream-browserify',
  timers: 'timers-browserify',
  crypto: 'crypto-browserify',
  buffer: 'buffer',
  '@silentbot1/nat-api': '@silentbot1/nat-api',
  'bittorrent-tracker': 'bittorrent-tracker',
  querystring: 'querystring',
  zlib: 'webtorrent/polyfills/inflate-sync-web.js',
  'bittorrent-tracker/server.js': false,
  'cross-fetch-ponyfill': resolve('../node_modules/cross-fetch-ponyfill/browser.js'),
  'abort-controller': false,
  'bittorrent-tracker/lib/client/http-tracker.js': resolve('../node_modules/bittorrent-tracker/lib/client/http-tracker.js')
}

module.exports = merge(commonConfig(__dirname, alias, 'node', 'index'), capacitorConfig)
