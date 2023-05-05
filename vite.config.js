import path from 'path'
import process from 'process'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import commonjs from 'vite-plugin-commonjs'

const root = path.resolve(process.cwd(), 'src/renderer')
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '@': path.resolve('src/renderer/src')
      }
    },
    plugins: [mode !== 'development' && commonjs(), svelte()],
    root,
    server: {
      hmr: false
    },
    base: './',
    build: {
      rollupOptions: {
        output: {
          assetFileNames: '[name].[ext]'
        },
        input: {
          index: root + '/index.html',
          torrent: root + '/webtorrent.html'
        }
      }
    }
  }
})
