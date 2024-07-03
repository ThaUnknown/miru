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
   * @param {{ movie: boolean, batch: boolean }} types
   * @param {Record<string, boolean>} sourcesToQuery
   */
  async query (options, types, sourcesToQuery) {
    /** @type {Promise<{ results: Result[], errors: string[] }>[]} */
    const promises = []
    for (const source of Object.values(this.sources)) {
      if (!sourcesToQuery[source.name]) continue
      promises.push(this._querySource(source, options, types))
    }
    /** @type {Result[]} */
    const results = []
    const errors = []
    for (const res of await Promise.all(promises)) {
      results.push(...res.results)
      errors.push(...res.errors)
    }

    return { results, errors }
  }

  /**
   * @param {AbstractSource} source
   * @param {Options} options
   * @param {{ movie: boolean, batch: boolean }} types
   * @returns {Promise<{ results: Result[], errors: string[] }>}
   */
  async _querySource (source, options, { movie, batch }) {
    const promises = []
    promises.push(source.single(options))
    if (movie) promises.push(source.movie(options))
    if (batch) promises.push(source.batch(options))

    const results = []
    const errors = []
    for (const result of await Promise.allSettled(promises)) {
      if (result.status === 'fulfilled') {
        results.push(...result.value)
      } else {
        console.error(result)
        errors.push('Source ' + source.name + ' failed to load results:\n' + result.reason.message)
      }
    }

    return { results, errors }
  }
}

/** @param {string[]} extensions */
export async function loadExtensions (extensions) {
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
