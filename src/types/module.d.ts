/* eslint-disable @typescript-eslint/method-signature-style */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */
declare module 'module' {
  var __dirname: string
  var __filename: string

  global {
    interface ImportMeta {
      dirname: string
      filename: string
      url: string
      resolve(specifier: string, parent?: string | URL): string
    }
  }
}

declare global {
  var __dirname: string
  var __filename: string

  interface ImportMeta {
    dirname: string
    filename: string
    url: string
    resolve(specifier: string, parent?: string | URL): string
  }
}

declare module 'node:module' {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  import module = require('module')
  export = module
}
