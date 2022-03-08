import path from 'path'
import process from 'process'
import { defineConfig } from 'vite'
import builtinModules from 'builtin-modules'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import commonjsExternals from 'vite-plugin-commonjs-externals'

const commonjsPackages = [
  'electron',
  'electron/main',
  'electron/common',
  'electron/renderer',
  'original-fs',
  ...builtinModules
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), commonjsExternals({ externals: commonjsPackages })],
  resolve: {
    alias: {
      '@': path.resolve('src/renderer/src')
    }
  },
  root: path.resolve(process.cwd(), 'src/renderer'),
  base: './'
})
