import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: 7344 },
  build: {
    target: 'esnext'
  },
  ssr: {
    target: 'webworker'
  },
  optimizeDeps: {
    exclude: ['anitomyscript']
  }
})
