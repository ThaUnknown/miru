const { join, resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const mode = process.env.NODE_ENV?.trim() || 'development'
const isDev = mode === 'development'

module.exports = [
  {
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
        'node-fetch': false
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
  {
    entry: join(__dirname, 'src', 'renderer', 'src', 'main.js'),
    output: {
      path: join(__dirname, 'build'),
      filename: 'renderer.js'
    },
    mode,
    module: {
      rules: [
        {
          test: /\.svelte$/,
          use: {
            loader: 'svelte-loader',
            options: {
              compilerOptions: {
                dev: isDev
              },
              emitCss: !isDev,
              hotReload: isDev
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          // required to prevent errors from Svelte on Webpack 5+
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false
          }
        }
      ]
    },
    resolve: {
      aliasFields: [],
      alias: {
        '@': resolve('src/renderer/src'),
        module: false,
        url: false
      },
      extensions: ['.mjs', '.js', '.svelte']
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/renderer/public' }
        ]
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        inject: false,
        templateContent: ({ htmlWebpackPlugin }) => /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <meta name="theme-color" content="#191c20">
  <title>Miru</title>

  <link rel='icon' href='/logo.ico'>
  <link href="./lib/Material-Icons.css" rel="stylesheet">

  ${htmlWebpackPlugin.tags.headTags}
</head>

<body class="dark-mode with-custom-webkit-scrollbars with-custom-css-scrollbars">
  ${htmlWebpackPlugin.tags.bodyTags}
</body>

</html> `
      })],
    target: 'web'
  },
  {
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
    entry: join(__dirname, 'src', 'main', 'main.js'),
    output: {
      path: join(__dirname, 'build'),
      filename: 'main.js'
    },
    resolve: {
      aliasFields: []
    },
    mode,
    target: 'electron20.0-main'
  }
]
