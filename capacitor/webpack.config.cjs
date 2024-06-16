const commonConfig = require('common/webpack.config.cjs')
const { merge } = require('webpack-merge')
const { join, resolve } = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const mode = process.env.NODE_ENV?.trim() || 'development'

const alias = {
  '@/modules/ipc.js': join(__dirname, 'src', 'ipc.js'),
  '@/modules/support.js': join(__dirname, 'src', 'support.js')
}

/** @type {import('webpack').Configuration} */
const capacitorConfig = {
  devtool: 'source-map',
  entry: [join(__dirname, 'src', 'main.js')],
  output: {
    path: join(__dirname, 'build', 'nodejs'),
    filename: 'index.js'
  },
  mode,
  externals: {
    'utp-native': 'require("utp-native")',
    bridge: 'require("bridge")'
  },
  resolve: {
    aliasFields: [],
    mainFields: ['module', 'main', 'node'],
    alias: {
      ...alias,
      wrtc: false,
      'node-datachannel': false,
      'bittorrent-tracker/lib/client/http-tracker.js': resolve('../node_modules/bittorrent-tracker/lib/client/http-tracker.js'),
      'webrtc-polyfill': false // no webrtc on mobile, need the resources
    }
  },
  target: 'node',
  devServer: {
    devMiddleware: {
      writeToDisk: true
    },
    hot: true,
    client: {
      overlay: { errors: true, warnings: false, runtimeErrors: false }
    },
    port: 5001
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: join(__dirname, 'public', 'nodejs') }
      ]
    })
  ]
}

module.exports = [capacitorConfig, merge(commonConfig(__dirname, alias, 'browser', 'index'), { entry: [join(__dirname, 'src', 'capacitor.js')] })]
