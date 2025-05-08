import { resolve } from 'node:path'

import { sveltekit } from '@sveltejs/kit/vite'
import license from 'rollup-plugin-license'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltekit(),
    license({
      thirdParty: {
        allow: '(MIT OR Apache-2.0 OR ISC OR BSD-3-Clause OR BSD-2-Clause)',
        output: resolve(__dirname, './build/LICENSE.txt'),
        includeSelf: true
      }
    })
  ],
  resolve: {
    alias: {
      // thank you bottleneck for importing useless modules
      './RedisConnection': resolve(__dirname, 'src/patches/empty.cjs'),
      './RedisConnection.js': resolve(__dirname, 'src/patches/empty.cjs'),
      './RedisDatastore': resolve(__dirname, 'src/patches/empty.cjs'),
      './IORedisConnection': resolve(__dirname, 'src/patches/empty.cjs'),
      './Scripts': resolve(__dirname, 'src/patches/empty.cjs')
    }
  },
  server: { port: 7344 },
  build: {
    target: 'esnext',
    sourcemap: true
  },
  ssr: {
    target: 'webworker'
  },
  optimizeDeps: {
    exclude: ['anitomyscript']
  }
})
