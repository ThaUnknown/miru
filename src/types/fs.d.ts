declare module 'fs' {
  export const writeFileSync: (
    file: string | URL,
    data: string | Uint8Array,
    options?: { encoding?: string, mode?: number, flag?: string }
  ) => void
}

declare module 'node:fs' {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  import path = require('fs')
  export = path
}
