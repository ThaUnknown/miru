import { sveltekit } from '@sveltejs/kit/vite'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(fileURLToPath(new URL('./', import.meta.url)), '..', 'common') }
    ]
  }
})
