import path from 'path'
import process from 'process'
import { defineConfig } from 'vite'
import { builtinModules } from 'module'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import commonjsExternals from 'vite-plugin-commonjs-externals'

const commonjsPackages = [
  '@electron/remote',
  'webtorrent',
  'matroska-subtitles',
  ...builtinModules
]

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve('src/renderer/src')
    }
  },
  plugins: [commonjsExternals({ externals: commonjsPackages }), svelte()],
  root: path.resolve(process.cwd(), 'src/renderer'),
  base: './',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
