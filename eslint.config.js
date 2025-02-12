import config from 'eslint-config-standard-universal'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...config(),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      }
    },
  }
)
