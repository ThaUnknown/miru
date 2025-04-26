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
      'svelte/html-self-closing': [
        'error',
        'all'
      ],
      'svelte/no-reactive-reassign': 'off',
      'no-undef-init': 'off',
      'import/order': ['error', {
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        alphabetize: { order: 'asc' }
      }],
      '@typescript-eslint/no-unnecessary-condition': 'warn'
      // '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.svelte'],
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: '.{2}(Events|Props)',
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all'
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '.{2}(Events|Props)',
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all'
      }]
    }
  }
)
