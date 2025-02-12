import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess({}),
  kit: {
    adapter: adapter({ fallback: 'index.html' }),
    alias: {
      '@/*': './path/to/lib/*'
    }
  },
  runtime: ''
}

export default config
