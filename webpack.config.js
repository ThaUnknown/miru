const path = require('path')
const webpack = require('webpack')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
module.exports = {
  entry: './app/js/main.js',
  externals: {
    halfmoon: 'halfmoon',
    anitomyscript: 'anitomyscript',
    gapi: 'commonjs gapi'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app/js'),
    sourceMapFilename: 'bundle.js.map'
  },
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process-fast'
    }),
    new NodePolyfillPlugin()
  ]
}
