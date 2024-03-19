import { expose, proxy } from 'comlink'

/** @typedef {import('@thaunknown/ani-resourced/sources/types.d.ts').Options} Options */
/** @typedef {import('@thaunknown/ani-resourced/sources/types.d.ts').Result} Result */
/** @typedef {import('@thaunknown/ani-resourced/sources/abstract.js').default} AbstractSource */

class Extensions {
  sources
  metadata
  /** @param {AbstractSource[]} sources */
  constructor (sources) {
    this.sources = sources
    this.metadata = sources.map(({ accuracy, name, description, config }) => ({ accuracy, name, description, config }))
  }

  /**
   * @param {Options} options
   * @param {{ movie: boolean, batch: boolean }} param1
   * @param {Record<string, boolean>} sources
   */
  async query (options, { movie, batch }, sources) {
    /** @type {Promise<Result[]>[]} */
    const promises = []
    for (const source of Object.values(this.sources)) {
      if (!sources[source.name]) continue
      if (movie) promises.push(source.movie(options))
      if (batch) promises.push(source.batch(options))
      promises.push(source.single(options))
    }
    /** @type {Result[]} */
    const results = []
    for (const result of await Promise.allSettled(promises)) {
      if (result.status === 'fulfilled') results.push(...result.value)
    }
    return results.flat()
  }
}

/** @param {string[]} extensions */
export async function loadExtensions (extensions) {
  // TODO: handle import errors
  const sources = (await Promise.all(extensions.map(async extension => {
    try {
      if (!extension.startsWith('http')) extension = `https://esm.sh/${extension}`
      return Object.values(await import(/* webpackIgnore: true */extension))
    } catch (error) {
      return []
    }
  }))).flat()
  return proxy(new Extensions(sources))
}

expose(loadExtensions)
