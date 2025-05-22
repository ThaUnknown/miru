import process from 'node:process'

import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  onwarn: (warning, handler) => {
    if (warning.code === 'a11y_media_has_caption') return
    if (warning.code === 'element_invalid_self_closing_tag') return
    handler(warning)
  },
  preprocess: vitePreprocess({}),
  kit: {
    adapter: adapter({ fallback: 'index.html' }),
    version: {
      name: process.env.npm_package_version
    },
    alias: {
      "lucide-svelte/dist/Icon.svelte": "./node_modules/lucide-svelte/dist/Icon.svelte"
    }
  },
  runtime: ''
}

export default config
