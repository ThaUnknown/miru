declare module 'path' {
  export function resolve(...paths: string[]): string
}

declare module 'node:path' {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  import path = require('path')
  export = path
}
