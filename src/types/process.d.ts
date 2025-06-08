declare module 'process' {
  export const env: Record<string, string | undefined>
}

declare module 'node:process' {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  import path = require('process')
  export = path
}
