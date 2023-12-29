/**
 * Prevent calling function with same arguments twice in a row
 * @template {(...args) => any} Getter
 * @template {(...args) => any} Passer
 * @param {(data: ReturnType<Passer>) => unknown} listener
 * @param {Getter} getter should return what to cache
 * @param {(args: ReturnType<Getter>, lastArgs: ReturnType<Getter>) => boolean} condition additional condition to check last arg can be empty object
 * @param {(data: ReturnType<Getter>) => any} passer should return wрat pass to the function accepts arguments returned by getter
 */
export function createFilterProxy (listener, getter = undefined, condition = undefined, passer = undefined) {
  /**
   * @type {string}
   */
  let lastArgs = '{}'

  /**
   * @param {Parameters<getter>} args
   * @returns {unknown}
   */
  return function (...args) {
    const subset = getter?.(...args) ?? args
    const text = JSON.stringify(subset)

    if (condition?.(subset, JSON.parse(lastArgs)) || text === lastArgs) {
      lastArgs = text
      console.log('Dropping', subset)
      return
    }

    console.log('Passing', subset)
    lastArgs = text
    return listener(passer?.(subset) ?? subset)
  }
}
