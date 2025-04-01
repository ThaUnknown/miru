import config from 'eslint-config-standard-universal'
import tseslint from 'typescript-eslint'

import svelteConfig from './svelte.config.js'

export default tseslint.config(
  ...config(),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        svelteConfig
      }
    },
    rules: {
      'svelte/html-self-closing': 'off',
      'import/order': ['error', {
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type']
      }]
    }
  }
)
