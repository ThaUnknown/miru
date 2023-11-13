const fetch = globalThis.fetch

if (globalThis.CapacitorWebFetch) {
  globalThis.fetch = globalThis.CapacitorWebFetch
}

export const Blob = self.Blob
export const File = self.File
export const FormData = self.FormData
export const Headers = self.Headers
export const Request = self.Request
export const Response = self.Response
export const AbortController = self.AbortController
export const AbortSignal = self.AbortSignal
export default fetch
