import { finalizer } from 'abslink'
import { expose } from 'abslink/worker'
import type { SearchFunction, TorrentSource } from 'hayase-extensions'

export default expose({
  mod: null as unknown as Promise<TorrentSource>,
  construct (code: string) {
    this.mod = this.load(code)
  },

  async load (code: string): Promise<TorrentSource> {
    // WARN: unsafe eval
    const url = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }))
    const module = await import(url)
    URL.revokeObjectURL(url)
    return module.default
  },

  [finalizer] () {
    console.log('destroyed worker')
  },

  async single (...args: Parameters<SearchFunction>): ReturnType<SearchFunction> {
    return await ((await this.mod)).single(...args)
  },

  async batch (...args: Parameters<SearchFunction>): ReturnType<SearchFunction> {
    return await ((await this.mod)).batch(...args)
  },

  async movie (...args: Parameters<SearchFunction>): ReturnType<SearchFunction> {
    return await ((await this.mod)).movie(...args)
  },

  async test () {
    return await (await this.mod).test()
  }
})
