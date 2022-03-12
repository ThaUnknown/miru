import path from 'path'
import process from 'process'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import commonjsExternals from 'vite-plugin-commonjs-externals'

const commonjsPackages = [
  // 'electron',
  // 'electron/main',
  // 'electron/common',
  // 'electron/renderer',
  // 'original-fs',
  'webtorrent',
  'matroska-subtitles'
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
  base: './'
})
