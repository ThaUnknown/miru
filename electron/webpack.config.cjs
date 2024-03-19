const { join, resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const mode = process.env.NODE_ENV?.trim() || 'development'

const commonConfig = require('common/webpack.config.cjs')

module.exports = [
  {
    devtool: 'source-map',
    entry: join(__dirname, 'src', 'background', 'background.js'),
    output: {
      path: join(__dirname, 'build'),
      filename: 'background.js'
    },
    mode,
    externals: {
      'utp-native': 'require("utp-native")'
    },
    resolve: {
      aliasFields: [],
      mainFields: ['module', 'main', 'node'],
      alias: {
        '@': resolve(__dirname, '..', 'common'),
        'node-fetch': false,
        ws: false,
        wrtc: false,
        'bittorrent-tracker/lib/client/http-tracker.js': resolve('../node_modules/bittorrent-tracker/lib/client/http-tracker.js')
      }
    },
    plugins: [new HtmlWebpackPlugin({ filename: 'background.html' })],
    target: 'electron20.0-renderer',
    devServer: {
      devMiddleware: {
        writeToDisk: true
      },
      hot: true,
      client: {
        overlay: { errors: true, warnings: false, runtimeErrors: false }
      },
      port: 5000
    }
  },
  commonConfig(__dirname),
  {
    devtool: 'source-map',
    entry: join(__dirname, 'src', 'preload', 'preload.js'),
    output: {
      path: join(__dirname, 'build'),
      filename: 'preload.js'
    },
    resolve: {
      aliasFields: []
    },
    mode,
    target: 'electron20.0-preload'
  },
  {
    devtool: 'source-map',
    entry: join(__dirname, 'src', 'main', 'main.js'),
    output: {
      path: join(__dirname, 'build'),
      filename: 'main.js'
    },
    resolve: {
      aliasFields: [],
      alias: {
        '@': resolve(__dirname, '..', 'common')
      }
    },
    mode,
    target: 'electron20.0-main'
  }
]
